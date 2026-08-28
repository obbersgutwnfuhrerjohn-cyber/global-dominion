# Global Dominion — functional rebuild notes

This build keeps the supplied world map artwork and country GeoJSON, but moves core gameplay into a local-first, timestamp-reconciled campaign engine.

## Architecture
- `src/game/types.ts` — domain types
- `src/game/data.ts` — buildings, units, technology tree, initial world
- `src/game/engine.ts` — pure rules for economy, construction, research, production, armies, movement, combat, conquest, market, war and rank
- `src/context/GameContext.tsx` — single campaign state and persistence adapter
- `src/components/` — mobile UI primitives
- `src/app/(tabs)/` — functional mobile screens

## Persistence / time
Campaign state is stored with Expo AsyncStorage under `@gd/game_state_v2`. Queue completion uses absolute timestamps, so navigation, backgrounding and reload do not reset timers. The context reconciles the world when the app resumes.

## Existing assets/data reused
- `mobile/assets/world-map.png`
- `mobile/src/data/countries.geojson`
- `mobile/src/components/CountryPolygons.tsx`
- existing Expo Router/auth scaffolding
- existing service layer and server remain available for later authoritative multiplayer sync

## Run
```bash
npm install
npx expo start
npx expo start --android
```

Production builds use the existing EAS profiles:
```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

The current environment does not have npm registry access, so dependency installation and an actual Metro/device build could not be executed in this workspace. Pure engine TypeScript was statically checked with the globally installed TypeScript compiler.
