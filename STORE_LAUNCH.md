# Global Dominion — Store launch checklist

This release candidate is configured for production App Store / Google Play billing. It does **not** contain merchant secrets or a fake purchase verifier.

## What is implemented

- Native store billing via `react-native-iap` in native builds.
- Server-side account binding: a client cannot submit another player's ID.
- Apple transaction verification through Apple's App Store Server API + signed transaction verification.
- Google Play product purchase verification through the Google Play Developer API.
- Google purchase acknowledgement and consumption for consumable grants.
- Transaction replay protection with a persisted purchase ledger.
- Purchase/entitlement persistence across server restarts.
- Development test purchases are explicitly rejected when `NODE_ENV=production` or `ALLOW_TEST_IAP` is not `1`.
- Restore flow for non-consumable cosmetic purchases.

## Required external setup

1. Create the products in App Store Connect and Google Play Console using the IDs in `mobile/src/data/shopCatalog.ts`.
2. Configure Apple App Store Server API credentials and Google Play service-account credentials on the Render server. Never commit them.
3. Configure the actual Render HTTPS/WSS URL in the EAS production environment.
4. Configure EAS project/signing credentials.
5. Run native production builds and test purchases with sandbox/internal testing tracks before submission.

## Verification rule

The server grants paid entitlements only after store verification succeeds. Google explicitly recommends server verification of purchase tokens before granting benefits. Apple recommends server-side validation using the App Store Server API / signed transaction data for modern implementations.

## Production test flag

Keep:

```text
ALLOW_TEST_IAP=0
```

Do not expose a test purchase route in production.

## Commands

```bash
cd mobile
npm install
npx expo-doctor
npm run typecheck
npx expo prebuild --clean
eas build --platform all --profile production
```
