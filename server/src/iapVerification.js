const crypto = require('crypto');

const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID || 'com.globaldominion.game';
const GOOGLE_PACKAGE_NAME = process.env.GOOGLE_PACKAGE_NAME || 'com.globaldominion.game';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing production IAP configuration: ${name}`);
  return value;
}

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

let googleTokenCache = null;
async function getGoogleAccessToken() {
  if (googleTokenCache && googleTokenCache.expiresAt > Date.now() + 60_000) return googleTokenCache.token;
  const raw = Buffer.from(required('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'), 'base64').toString('utf8');
  const account = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url');
  const assertion = `${unsigned}.${signature}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
  });
  if (!response.ok) throw new Error(`Google OAuth failed (${response.status})`);
  const data = await response.json();
  googleTokenCache = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return data.access_token;
}

async function verifyGooglePurchase({ productId, purchaseToken }) {
  if (!purchaseToken) throw new Error('Missing Google Play purchase token.');
  const token = await getGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(GOOGLE_PACKAGE_NAME)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Google Play verification failed (${response.status})`);
  const purchase = await response.json();
  if (String(purchase.productId) !== productId) throw new Error('Google Play product mismatch.');
  // 0 = purchased. Pending purchases must never receive entitlements.
  if (Number(purchase.purchaseState) !== 0) throw new Error('Google Play purchase is not completed.');
  if (Number(purchase.quantity || 1) !== 1) throw new Error('Unexpected Google Play purchase quantity.');
  return { transactionId: purchase.orderId || purchaseToken, purchaseToken, raw: purchase };
}

async function acknowledgeGooglePurchase({ productId, purchaseToken }) {
  const token = await getGoogleAccessToken();
  const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(GOOGLE_PACKAGE_NAME)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await fetch(`${base}:acknowledge`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!response.ok && response.status !== 409) throw new Error(`Google acknowledgement failed (${response.status})`);
}

async function consumeGooglePurchase({ productId, purchaseToken }) {
  const token = await getGoogleAccessToken();
  const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(GOOGLE_PACKAGE_NAME)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await fetch(`${base}:consume`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!response.ok && response.status !== 409) throw new Error(`Google consumption failed (${response.status})`);
}

let appleClientCache = null;
function getAppleClient() {
  if (appleClientCache) return appleClientCache;
  const lib = require('@apple/app-store-server-library');
  const environment = String(process.env.APPLE_ENVIRONMENT || 'production').toLowerCase() === 'sandbox'
    ? lib.Environment.SANDBOX : lib.Environment.PRODUCTION;
  const key = Buffer.from(required('APPLE_PRIVATE_KEY_BASE64'), 'base64').toString('utf8');
  const issuerId = required('APPLE_ISSUER_ID');
  const keyId = required('APPLE_KEY_ID');
  appleClientCache = { lib, environment, client: new lib.AppStoreServerAPIClient(key, keyId, issuerId, APPLE_BUNDLE_ID, environment) };
  return appleClientCache;
}

function appleRootCertificates() {
  const encoded = required('APPLE_ROOT_CERTIFICATES_BASE64');
  return encoded.split(',').map((item) => Buffer.from(item.trim(), 'base64')).filter((b) => b.length > 0);
}

async function verifyApplePurchase({ transactionId, expectedProductId }) {
  if (!transactionId) throw new Error('Missing App Store transaction ID.');
  const { lib, client, environment } = getAppleClient();
  const response = await client.getTransactionInfo(transactionId);
  if (!response || !response.signedTransactionInfo) throw new Error('Apple returned no signed transaction information.');
  const appAppleId = process.env.APPLE_APP_ID ? Number(process.env.APPLE_APP_ID) : null;
  const verifier = new lib.SignedDataVerifier(
    appleRootCertificates(),
    true,
    environment,
    APPLE_BUNDLE_ID,
    appAppleId,
  );
  const decoded = await verifier.verifyAndDecodeTransaction(response.signedTransactionInfo);
  if (decoded.bundleId !== APPLE_BUNDLE_ID) throw new Error('Apple bundle identifier mismatch.');
  if (decoded.productId !== expectedProductId) throw new Error('Apple product mismatch.');
  if (decoded.revocationDate) throw new Error('Apple transaction has been revoked.');
  if (decoded.purchaseDate && Number(decoded.purchaseDate) > Date.now() + 5 * 60_000) throw new Error('Apple transaction timestamp is invalid.');
  return { transactionId: decoded.transactionId || transactionId, raw: decoded };
}

async function verifyStorePurchase({ platform, productId, storeProductId, receipt, transactionId }) {
  if (platform === 'android') {
    return verifyGooglePurchase({ productId: storeProductId, purchaseToken: receipt });
  }
  if (platform === 'ios') {
    return verifyApplePurchase({ transactionId, expectedProductId: storeProductId });
  }
  throw new Error('Unsupported store platform.');
}

module.exports = { verifyStorePurchase, acknowledgeGooglePurchase, consumeGooglePurchase };
