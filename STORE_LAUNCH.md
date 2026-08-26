# Store launch checklist

No in-app purchases.

1. Host `server` with TLS (`EXPO_PUBLIC_API_URL` / `WS_URL`).
2. `cd mobile && npm install && eas build --profile production`
3. Privacy policy + age rating + screenshots.

Offline mode: if the API is unreachable, register/login still works with device-local progress so the game is playable while you host multiplayer.
