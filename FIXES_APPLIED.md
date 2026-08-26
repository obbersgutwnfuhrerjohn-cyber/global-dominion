# Global Dominion — Fixes Applied

## Authentication
- Fixed the Expo Router login/register race condition that could navigate to `/(tabs)` before `AuthContext` had committed the authenticated session/player state.
- Login and registration now navigate only after `isAuthenticated` becomes true.
- Left the authenticated tabs guard in place as a safety net.

## Render production readiness
- Added `render.yaml` Blueprint for the Node API.
- Configured Render to use `server/` as the service root.
- Added `/health` health check, generated `JWT_SECRET`, production `NODE_ENV`, `TICK_MS`, and persistent `/var/data` storage.
- Added a mobile `.env.example` showing how to point production builds at the Render API and WebSocket endpoints.
- Updated deployment documentation.

## Theme song
- Added a **Theme Song** button to the mobile welcome screen linking to the YouTube track supplied by the project owner.
- The YouTube page is not bundled as an audio file. A directly distributable audio asset with appropriate rights can be added later for true in-app/background playback.

## Validation
- `server/src/index.js` passes Node syntax validation.
- Full dependency-based mobile typecheck could not be completed in the offline build environment because npm dependency installation timed out.
