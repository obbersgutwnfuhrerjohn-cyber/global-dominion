# Global Dominion — inspection and rebuild report

## Initial inspection
The supplied archive was an Expo/React Native project with Expo Router, local authentication fallback, an API client, a JSON-backed Node server, a world GeoJSON layer, a supplied world-map image, and many existing service modules. The archive also contained several nested release ZIPs and a generated `mobile/dist` bundle.

### Reusable
- Expo Router navigation/auth scaffolding
- `mobile/assets/world-map.png`
- `mobile/src/data/countries.geojson`
- `CountryPolygons` SVG map renderer
- existing player/country/game data
- existing API/server service interfaces for future multiplayer
- AsyncStorage and SecureStore-compatible storage layer

### Weak / replaced for the core campaign
- `GameContext` was primarily a thin API refresh layer with demo arrays and fire-and-forget commands.
- Core construction/research/production/combat state was not unified in one client campaign model.
- Several UI paths depended on the API being reachable or only displayed server-backed/demo information.
- Primary navigation did not match the supplied seven-section mobile command layout.

## Rebuild
A new local-first campaign engine now lives in `mobile/src/game/`.

`types.ts` defines the domain model. `data.ts` defines the world seed, technology tree, buildings and unit catalog. `engine.ts` contains pure rules for resource accrual, construction, upgrades, research, production, armies, movement, combat, conquest, market trades, diplomacy, alliance invitations, intelligence agents, chat, notifications and ranks.

`GameContext` is now the single state boundary and persists the complete campaign to AsyncStorage. Timers use absolute timestamps and are reconciled on interval, app resume and reload.

## Visual rebuild
The supplied world map and GeoJSON were preserved. The primary screens were rebuilt in the screenshot's dark military / bronze-gold visual language with compact mobile cards, resource HUD, command controls, map overlays, and seven-item bottom navigation: MAP, PROFILE, WORK, MARKET, WAR, ALLIANCE, MORE.

## Validation
- Pure game engine TypeScript: PASS with TypeScript 5.8.3.
- Pure engine end-to-end smoke test: PASS (construction → research → production → army → movement → attack/combat → conquest → market → diplomacy → intelligence → chat → serialization/reload).
- TS/TSX parser validation across the source tree: PASS.
- JSON validation for app/package/EAS/world data: PASS.
- Full Expo/Metro/device build: NOT executed because the workspace has no npm registry access and the dependency tree was not preinstalled. `npm ci --offline` reached dependency resolution but failed on an uncached package.
