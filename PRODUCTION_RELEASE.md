# Global Dominion — Production Release Candidate

This project is prepared for a real App Store / Google Play build. Store credentials, product creation, EAS credentials, and the live Render URL are intentionally external secrets and are not embedded in source control.

## Before the first production build

### Render/server
Set these environment variables on the Render service:

- `NODE_ENV=production`
- `JWT_SECRET=<long random secret>`
- `CORS_ORIGINS=<your HTTPS app/web origin(s)>`
- `DATA_DIR=/var/data` (use a persistent disk; JSON persistence is a launch MVP, not a horizontally-scaled database)
- `ALLOW_TEST_IAP=0`
- `GOOGLE_PACKAGE_NAME=com.globaldominion.game`
- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=<base64 Google service-account JSON>`
- `APPLE_BUNDLE_ID=com.globaldominion.game`
- `APPLE_ISSUER_ID=<App Store Connect issuer ID>`
- `APPLE_KEY_ID=<App Store Connect IAP key ID>`
- `APPLE_PRIVATE_KEY_BASE64=<base64 .p8 key contents>`
- `APPLE_ROOT_CERTIFICATES_BASE64=<base64 Apple root certificates, comma-separated>`
- `APPLE_APP_ID=<numeric Apple app ID>`
- `APPLE_ENVIRONMENT=production`

The backend now fails closed for store purchases: it will not grant entitlements from a receipt string alone. Google Play purchases are checked against Google Play Developer APIs, and Apple transactions are checked through Apple's App Store Server API and signed-transaction verification. This follows the stores' server-verification requirements.

## Mobile / EAS

Set the production EAS environment values to the actual Render service:

- `EXPO_PUBLIC_ENV=production`
- `EXPO_PUBLIC_ALLOW_DEMO=0`
- `EXPO_PUBLIC_API_URL=https://<your-render-service>/api`
- `EXPO_PUBLIC_WS_URL=wss://<your-render-service>/ws`

Then from `mobile/`:

```bash
npm install
npx expo-doctor
npm run typecheck
npx expo prebuild --clean
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

In-app purchases require native development/production builds; they do not work in Expo Go. Expo's current IAP guidance requires a development/standalone build for native billing.

## Store products

Create the product IDs from `mobile/src/data/shopCatalog.ts` in both stores, with matching product IDs and the correct consumable/non-consumable type. Real store prices are controlled by the stores; `priceLabel` is only a UI hint.

## Important

No source code can manufacture Apple/Google merchant credentials or create store products. Those are account-level operations in App Store Connect and Google Play Console. Once the credentials/products and Render URL are supplied, this code is designed to perform the production verification flow rather than using the previous test-receipt stub.
