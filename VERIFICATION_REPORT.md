# Global Dominion — Verification Report

## Fixed
- Corrected `mobile/src/types/research.ts` to import `apiClient` from `../services/api`.
- Added `server/scripts/smoke-test.js` and `npm run smoke` for repeatable backend smoke testing.

## Verified
- All server JavaScript files pass `node --check`.
- JSON configuration files parse successfully.
- All mobile relative imports resolve to existing files.
- Expo Metro configuration contains GeoJSON asset support.
- Backend starts successfully without optional IAP credentials.
- `/health` and `/api/health` return successful API envelopes.
- Registration, authenticated `/api/auth/me`, world state, map countries, and login smoke tests pass.

## Not fully verifiable in this environment
- Full Expo TypeScript/build verification could not be completed because the ZIP does not contain `node_modules` and package installation timed out in this environment.
- Real iOS/Android EAS builds require the Expo/EAS toolchain and credentials.
- Production API URLs in `mobile/eas.json` use `api.globaldominion.game` and `staging-api.globaldominion.game`; those domains must be deployed/configured before production clients can connect.
- App Store / Google Play IAP verification requires real store credentials and product configuration. IAP is disabled in the production feature configuration until that setup is supplied.

## Local test

### Backend
```bash
cd server
npm install
npm run smoke
npm start
```

### Mobile
```bash
cd mobile
npm install
npx expo-doctor
npm run typecheck
npx expo start
```

A successful `npm run smoke` proves the backend core startup/auth/world/map path. A successful Expo typecheck and `expo-doctor` run on a machine with dependencies installed are still required before claiming the mobile build is completely clean.
