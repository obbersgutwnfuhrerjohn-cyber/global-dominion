# Global Dominion

A persistent geopolitical / economic MMO built with **Expo**, **React Native**, **TypeScript**, and a **zero-dependency Node** API.

**Theme:** Alternate 1962 — *The Man in the High Castle* theater. The Greater Nazi Reich and Japanese Pacific States dominate; the Neutral Zone and Rocky Mountain States remain contested. Loyalty, hierarchy, and imperial power define progression.

Players build influence across nations through politics, economy, military command, diplomacy, industry, research, and more.

---

## Status (launch-ready MVP)

| Layer | Status |
|-------|--------|
| **Type system** | Complete — countries, players, military, economy, politics, research, markets, events |
| **API service layer (mobile)** | Complete — 50+ typed services |
| **Mobile UI** | MVP — auth, command center, world, economy, military, politics, profile |
| **Demo mode** | Fully offline with local persistence + live economy ticks |
| **Backend** | Production-capable — HTTP + WebSocket, JSON file persistence, Docker |

**New for launch**

- Server player/session/world **persistence** (survives restarts)
- **Docker** + `docker-compose` for one-command deploy
- Configurable production API URLs (`EXPO_PUBLIC_API_URL`)
- Demo world **auto-ticks** so the economy feels alive offline
- Graceful shutdown saves state

---

## Quick start (local)

### 1. API server

```bash
cd server
# No npm install required — zero dependencies
npm run dev
# or: node src/index.js
```

- HTTP: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`
- WebSocket: `ws://localhost:3000/ws`
- Data: `server/data/world.json` (auto-created)

**Docker (recommended)**

```bash
# from repo root
docker compose up --build -d
```

### 2. Mobile client

```bash
cd mobile
npm install
npx expo start
```

Open in Expo Go, simulator, or press `w` for web.

**First launch**

1. **Enter Demo World** — offline, no server needed.
2. **Sign In / Create Account** — works against the live API when the server is running and demo mode is off.

---

## Project structure

```
global-dominion/
├── mobile/                   # Expo React Native client
│   └── src/
│       ├── app/              # Screens (Expo Router)
│       ├── services/         # Typed API clients (50+)
│       ├── types/
│       ├── context/
│       └── ...
├── server/                   # Zero-dep Node API
│   ├── src/index.js          # Full HTTP + WebSocket server
│   ├── data/                 # Persisted world.json (gitignored)
│   └── Dockerfile
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## API overview

Envelope expected by the mobile client:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "serverTime": "2026-08-25T17:00:00.000Z",
  "requestId": "..."
}
```

| Prefix | Coverage |
|--------|----------|
| `/api/auth/*` | register, login, logout, refresh, me, security stubs |
| `/api/world/*` | state, countries, events, selection, heartbeat |
| `/api/players/*` | profile, search, stats, progression |
| `/api/economy/*` | market, resources, trade, tick |
| `/api/military/*` | units, bases, recruitment, orders |
| `/api/wars/*` | active, declare, fronts, battles |
| `/api/diplomacy/*` | relations, treaties |
| `/api/map/*` | countries, interactions |
| `/api/banking/*` | banks, accounts, transfers |
| `/api/companies/*` | list, create, update |

Auth: `Authorization: Bearer <accessToken>`.

WebSocket (`/ws`): `auth` → `subscribe` → receive `tick` every 10s.

---

# Launch from GitHub — step by step

## A. Put the project on GitHub

1. Create a new **empty** repository on GitHub (no README if you already have one).
2. On your machine:

```bash
cd global-dominion-main   # or wherever you extracted the project
git init
git add .
git commit -m "Initial commit — Global Dominion launch MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/global-dominion.git
git push -u origin main
```

3. (Optional) Add topics on GitHub: `expo`, `react-native`, `mmo`, `geopolitics`, `nodejs`.

---

## B. Deploy the API server

Pick one host. All work with the included Dockerfile.

### Option 1 — Railway (simple)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
2. Root directory: leave blank or set to `/` ; Railway will detect the Dockerfile if you set **Dockerfile path** to `server/Dockerfile`.
3. Or use the Railway CLI:

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

4. Set variables:

| Variable | Value |
|----------|--------|
| `PORT` | `3000` (or leave empty — Railway injects) |
| `DATA_DIR` | `/app/data` |
| `TICK_MS` | `10000` |

5. Add a **volume** mounted at `/app/data` so `world.json` persists.
6. Copy the public URL, e.g. `https://global-dominion-production.up.railway.app`.

### Option 2 — Render

The repository includes `render.yaml`, so Render Blueprints can create the API service with the correct root directory, health check, environment placeholders, and persistent data disk.

1. [render.com](https://render.com) → New → Blueprint → connect the GitHub repository.
2. Select the repository and apply `render.yaml`.
3. Set `CORS_ORIGINS` to the HTTPS origin(s) that will call the API.
4. Keep the generated `JWT_SECRET` secret.
5. After deploy, verify `https://YOUR-RENDER-HOST/health`.
6. Point the mobile production build at `https://YOUR-RENDER-HOST/api` and `wss://YOUR-RENDER-HOST/ws`.

The Render service uses the Node runtime rather than the local Codespaces tunnel. The persistent disk is mounted at `/var/data`, and `DATA_DIR` is set accordingly.

### Option 3 — Fly.io

```bash
# install flyctl, then from server/
fly launch --dockerfile Dockerfile --name global-dominion-api
fly volumes create gd_data --size 1
# set mount in fly.toml: [mounts] source = "gd_data" destination = "/app/data"
fly deploy
```

### Option 4 — Any VPS (DigitalOcean, Hetzner, etc.)

```bash
git clone https://github.com/YOUR_USERNAME/global-dominion.git
cd global-dominion
docker compose up --build -d
# open firewall port 3000 or put nginx/caddy in front with TLS
```

**Verify**

```bash
curl https://YOUR_API_HOST/health
curl -X POST https://YOUR_API_HOST/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"cmd@test.com","password":"testpass","displayName":"Commander"}'
```

---

## C. Point the mobile app at production

In `mobile/`, create a production build with your API URL:

```bash
cd mobile
# one-time
npx expo install expo-dev-client   # optional
npx eas-cli login                  # create Expo account if needed
```

Create `mobile/eas.json` if missing:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {}
  },
  "submit": { "production": {} }
}
```

Build with env vars (EAS):

```bash
# Set secrets once
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://YOUR_API_HOST/api" --scope project
eas secret:create --name EXPO_PUBLIC_WS_URL --value "wss://YOUR_API_HOST/ws" --scope project

# Or pass per-build:
EXPO_PUBLIC_API_URL=https://YOUR_API_HOST/api \
EXPO_PUBLIC_WS_URL=wss://YOUR_API_HOST/ws \
eas build --platform android --profile production
```

For local production-like testing:

```bash
EXPO_PUBLIC_API_URL=https://YOUR_API_HOST/api \
EXPO_PUBLIC_WS_URL=wss://YOUR_API_HOST/ws \
npx expo start
```

Then in the app turn **demo mode off** (or set `features.demoMode: false` in production env — already the default for production builds).

---

## D. Wire live auth (optional polish)

Today the app defaults to **demo mode**. To force live API:

1. Set `ENVIRONMENT.features.demoMode = false` in production (already done).
2. Ensure `AuthContext` calls `authService.register` / `authService.login` instead of only local storage when `!isDemoMode`.

The service layer (`mobile/src/services/auth.ts`) is already typed and ready; connect the context to it when you leave pure offline demo.

---

## E. Stores & distribution

| Platform | Path |
|----------|------|
| **Android** | EAS Build → Google Play Console internal testing → production |
| **iOS** | EAS Build → App Store Connect TestFlight → App Store |
| **Web** | `npx expo export -p web` → host `dist/` on Vercel/Netlify/Cloudflare Pages |

App identifiers (from `app.json`):

- iOS: `com.globaldominion.game`
- Android: `com.globaldominion.game`

---

## Architecture notes

- **Demo vs live**: Demo = offline mock + AsyncStorage. Live = REST + WebSocket against the Node server.
- **Persistence**: Server writes `DATA_DIR/world.json` every 30s and on SIGINT/SIGTERM. Mount a volume in production.
- **Economy tick**: Every `TICK_MS` (default 10s) resources and market prices advance; WebSocket clients receive `tick`.
- **No npm deps on server**: only Node ≥ 18 built-ins (`http`, `crypto`, `fs`, `path`, `url`).

---

## Roadmap after launch

1. Postgres / SQLite instead of JSON file  
2. Full war resolution & battle simulation  
3. Elections, parties, cabinets  
4. Real map (GeoJSON + fog of war)  
5. Rate limiting + moderation  
6. EAS OTA updates  

---

## Scripts

**Server**

```bash
npm run dev     # node --watch
npm start       # node src/index.js
```

**Mobile**

```bash
npm start
npm run android | ios | web
npm run typecheck
```

**Docker**

```bash
docker compose up --build
docker compose logs -f api
```

---

## License

MIT — see [LICENSE](./LICENSE).

### Theme song

The mobile welcome screen now includes a **Theme Song** button linking to the YouTube track supplied for Global Dominion: https://youtu.be/DsPnSs5wHGk?is=uj02YFVv9tKFc_jt

For bundled/background playback inside the app, provide an audio file you have rights to distribute; a YouTube page is not a direct audio asset.
