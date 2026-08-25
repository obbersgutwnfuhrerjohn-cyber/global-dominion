import type {
  CountryId,
  PlayerId,
  WarId,
  GeoPoint
} from "./game";

export type WorldEventType =
  | "player_joined"
  | "player_left"
  | "election_started"
  | "election_completed"
  | "government_changed"
  | "political_crisis"
  | "treaty_signed"
  | "alliance_created"
  | "war_declared"
  | "war_ended"
  | "battle_started"
  | "battle_ended"
  | "territory_captured"
  | "military_movement"
  | "factory_created"
  | "factory_opened"
  | "factory_damaged"
  | "factory_destroyed"
  | "production_completed"
  | "research_completed"
  | "resource_shortage"
  | "market_event"
  | "natural_disaster"
  | "economic_crisis"
  | "major_discovery";

export type EventPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export interface WorldEvent {
  id: string;

  type: WorldEventType;

  priority: EventPriority;

  title: string;

  description: string;

  countryIds: CountryId[];

  playerIds: PlayerId[];

  warId: WarId | null;

  location: GeoPoint | null;

  createdAt: string;

  expiresAt: string | null;

  metadata: Record<string, string | number | boolean | null>;
}

export interface WorldEventFeed {
  events: WorldEvent[];

  nextCursor: string | null;

  serverTime: string;

  generatedAt: string;
}

export interface RealTimeWorldUpdate {
  sequenceNumber: number;

  serverTime: string;

  event: WorldEvent;

  affectedCountryIds: CountryId[];

  requiresMapRefresh: boolean;

  requiresWorldStateRefresh: boolean;
}

export interface MapAnimationEvent {
  id: string;

  type:
    | "territory_paint"
    | "border_change"
    | "unit_movement"
    | "battle_flash"
    | "explosion"
    | "smoke"
    | "missile_trail"
    | "aircraft_movement"
    | "naval_movement"
    | "frontline_change";

  location: GeoPoint | null;

  path: GeoPoint[];

  durationMs: number;

  intensity: number;

  countryId: CountryId | null;

  startedAt: string;
}

export interface Notification {
  id: string;

  playerId: PlayerId;

  type:
    | "political"
    | "military"
    | "economic"
    | "diplomatic"
    | "employment"
    | "company"
    | "factory"
    | "research"
    | "system";

  title: string;

  message: string;

  read: boolean;

  createdAt: string;

  actionRoute: string | null;

  actionId: string | null;
}

export interface ServerHeartbeat {
  serverTime: string;

  worldTick: number;

  simulationTick: number;

  activePlayers: number;

  activeWars: number;

  activeBattles: number;

  activeCountries: number;

  connected: boolean;
}