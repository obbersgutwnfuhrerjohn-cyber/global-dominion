import type {
  CountryId,
  PlayerId,
  UnitId,
  WarId,
  GeoPoint,
  UnitType
} from "./game";

export type MilitaryOrderType =
  | "move"
  | "attack"
  | "defend"
  | "retreat"
  | "patrol"
  | "recon"
  | "support"
  | "fortify"
  | "transport"
  | "air_patrol"
  | "air_strike"
  | "intercept"
  | "naval_bombard"
  | "naval_patrol"
  | "amphibious_assault";

export type MilitaryUnitStatus =
  | "idle"
  | "moving"
  | "attacking"
  | "defending"
  | "retreating"
  | "reconnaissance"
  | "supporting"
  | "fortifying"
  | "destroyed";

export type BattleStatus =
  | "forming"
  | "active"
  | "decisive"
  | "withdrawal"
  | "ended";

export interface MilitaryUnit {
  id: UnitId;

  countryId: CountryId;

  commanderId: PlayerId | null;

  name: string;

  type: UnitType;

  status: MilitaryUnitStatus;

  personnel: number;

  maximumPersonnel: number;

  equipmentStrength: number;

  readiness: number;

  morale: number;

  organization: number;

  experience: number;

  supply: number;

  fuel: number;

  ammunition: number;

  location: GeoPoint;

  destination: GeoPoint | null;

  movementSpeed: number;

  combatPower: number;

  createdAt: string;

  updatedAt: string;
}

export interface MilitaryCommand {
  id: string;

  countryId: CountryId;

  commanderId: PlayerId;

  unitIds: UnitId[];

  commandLevel:
    | "squad"
    | "platoon"
    | "company"
    | "battalion"
    | "brigade"
    | "division"
    | "corps"
    | "army";

  commandExperience: number;

  active: boolean;
}

export interface MilitaryOrder {
  id: string;

  unitId: UnitId;

  issuedByPlayerId: PlayerId;

  type: MilitaryOrderType;

  destination: GeoPoint | null;

  targetUnitId: UnitId | null;

  priority: "low" | "normal" | "high" | "critical";

  issuedAt: string;

  executeAt: string | null;

  completedAt: string | null;

  cancelled: boolean;
}

export interface SupplyRoute {
  id: string;

  countryId: CountryId;

  origin: GeoPoint;

  destination: GeoPoint;

  path: GeoPoint[];

  capacity: number;

  currentUsage: number;

  securityLevel: number;

  active: boolean;

  updatedAt: string;
}

export interface FrontLine {
  id: string;

  warId: WarId;

  attackerCountryIds: CountryId[];

  defenderCountryIds: CountryId[];

  path: GeoPoint[];

  lengthKm: number;

  intensity: number;

  attackerStrength: number;

  defenderStrength: number;

  updatedAt: string;
}

export interface Battle {
  id: string;

  warId: WarId;

  frontLineId: string;

  location: GeoPoint;

  attackerCountryIds: CountryId[];

  defenderCountryIds: CountryId[];

  attackerUnitIds: UnitId[];

  defenderUnitIds: UnitId[];

  attackerStrength: number;

  defenderStrength: number;

  attackerMorale: number;

  defenderMorale: number;

  progress: number;

  intensity: number;

  status: BattleStatus;

  startedAt: string;

  updatedAt: string;

  endedAt: string | null;

  winnerCountryId: CountryId | null;
}

export interface TerritoryCapture {
  id: string;

  warId: WarId;

  provinceId: string;

  previousControllerId: CountryId;

  newControllerId: CountryId;

  capturePercentage: number;

  strategicValue: number;

  capturedAt: string;
}

export interface OccupationState {
  provinceId: string;

  occupyingCountryId: CountryId;

  originalCountryId: CountryId;

  controlPercentage: number;

  resistance: number;

  stability: number;

  militaryPresence: number;

  establishedAt: string;

  updatedAt: string;
}

export interface IntelligenceReport {
  id: string;

  reportingCountryId: CountryId;

  targetCountryId: CountryId;

  targetUnitIds: UnitId[];

  location: GeoPoint | null;

  confidence: number;

  informationType:
    | "unit"
    | "movement"
    | "infrastructure"
    | "battle"
    | "logistics"
    | "political";

  description: string;

  discoveredAt: string;

  expiresAt: string | null;
}

export interface ReconnaissanceState {
  countryId: CountryId;

  coveragePercentage: number;

  knownEnemyUnitIds: UnitId[];

  knownEnemyPositions: GeoPoint[];

  lastUpdatedAt: string;
}

export interface FogOfWarArea {
  countryId: CountryId;

  polygon: GeoPoint[];

  visibility:
    | "visible"
    | "partially_visible"
    | "unknown";

  updatedAt: string;
}

export interface WarObjective {
  id: string;

  warId: WarId;

  countryId: CountryId;

  type:
    | "territory"
    | "capital"
    | "city"
    | "resource"
    | "infrastructure"
    | "military";

  targetId: string;

  requiredControlPercentage: number;

  currentProgress: number;

  completed: boolean;
}

export interface WarState {
  id: WarId;

  attackerCountryIds: CountryId[];

  defenderCountryIds: CountryId[];

  activeFrontLineIds: string[];

  activeBattleIds: string[];

  objectiveIds: string[];

  totalCasualtyEstimate: number;

  territoryChangedPercentage: number;

  warScore: number;

  startedAt: string;

  updatedAt: string;
}