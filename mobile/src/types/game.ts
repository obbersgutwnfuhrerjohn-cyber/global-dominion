export type CountryId = string;
export type PlayerId = string;
export type PartyId = string;
export type WarId = string;
export type UnitId = string;
export type CityId = string;
export type AllianceId = string;

export type CountryStatus =
  | "peace"
  | "mobilizing"
  | "at_war"
  | "occupied"
  | "unstable";

export type GovernmentType =
  | "democracy"
  | "republic"
  | "constitutional_monarchy"
  | "parliamentary_monarchy"
  | "presidential"
  | "semi_presidential"
  | "hybrid";

export type UnitType =
  | "infantry"
  | "mechanized_infantry"
  | "armor"
  | "artillery"
  | "air_defense"
  | "special_forces"
  | "fighter"
  | "interceptor"
  | "strike_fighter"
  | "ground_attack"
  | "naval_bomber"
  | "reconnaissance_aircraft"
  | "bomber"
  | "transport"
  | "reconnaissance"
  | "helicopter"
  | "carrier"
  | "destroyer"
  | "frigate"
  | "submarine"
  | "transport_ship";

export type WarStatus =
  | "preparing"
  | "active"
  | "ceasefire"
  | "peace_negotiations"
  | "ended";

export type RelationLevel =
  | "hostile"
  | "tense"
  | "neutral"
  | "friendly"
  | "allied";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CountryEconomy {
  gdp: number;
  treasury: number;
  taxRate: number;
  inflationRate: number;
  industrialCapacity: number;
  economicStability: number;
}

export interface CountryMilitary {
  personnel: number;
  readiness: number;
  morale: number;
  armyStrength: number;
  airForceStrength: number;
  navyStrength: number;
  logisticsCapacity: number;
}

export interface CountryPolitics {
  governmentType: GovernmentType;
  governmentName: string;
  approvalRating: number;
  stability: number;
  rulingPartyId: PartyId | null;
  leaderId: PlayerId | null;
}

export interface CountryDiplomacy {
  relationLevel: RelationLevel;
  relationScore: number;
  allianceIds: AllianceId[];
  atWarWith: CountryId[];
  treaties: string[];
}

export interface CountryResources {
  food: number;
  oil: number;
  gas: number;
  coal: number;
  iron: number;
  uranium: number;
  rareEarths: number;
  electronics: number;
  industrialMaterials: number;
  energy: number;
}

export interface Country {
  id: CountryId;
  name: string;
  officialName: string;
  flagCode: string;
  capitalCityId: CityId;
  population: number;

  status: CountryStatus;

  economy: CountryEconomy;
  military: CountryMilitary;
  politics: CountryPolitics;
  resources: CountryResources;

  controlledTerritory: number;
  prestige: number;

  updatedAt: string;
}

export interface PlayerProfile {
  id: PlayerId;
  username: string;
  displayName: string;

  countryId: CountryId | null;

  level: number;
  experience: number;
  prestige: number;

  governmentPosition: string;
  militaryBranch: string | null;

  emailVerified: boolean;
  accountStatus: "active" | "restricted" | "suspended" | "banned";

  createdAt: string;
  lastActiveAt: string;
}

export interface City {
  id: CityId;
  countryId: CountryId;
  name: string;
  location: GeoPoint;

  population: number;
  industrialImportance: number;
  militaryImportance: number;

  controlledBy: CountryId;
}

export interface MilitaryUnit {
  id: UnitId;
  countryId: CountryId;
  commanderId: PlayerId | null;

  type: UnitType;
  name: string;

  personnel: number;
  readiness: number;
  morale: number;
  supply: number;

  location: GeoPoint;

  destination: GeoPoint | null;

  isMoving: boolean;
  isEngaged: boolean;

  updatedAt: string;
}

export interface War {
  id: WarId;

  attackerCountryIds: CountryId[];
  defenderCountryIds: CountryId[];

  status: WarStatus;

  objectives: string[];

  activeFronts: string[];

  startedAt: string;
  updatedAt: string;
  endedAt: string | null;
}

export interface FrontLine {
  id: string;
  warId: WarId;

  attackerCountryId: CountryId;
  defenderCountryId: CountryId;

  path: GeoPoint[];

  intensity: number;

  updatedAt: string;
}

export interface Battle {
  id: string;
  warId: WarId;
  frontLineId: string;

  attackerUnitIds: UnitId[];
  defenderUnitIds: UnitId[];

  location: GeoPoint;

  attackerStrength: number;
  defenderStrength: number;

  progress: number;

  status: "forming" | "active" | "won" | "lost" | "withdrawn";

  startedAt: string;
  updatedAt: string;
}

export interface PoliticalParty {
  id: PartyId;

  countryId: CountryId;

  name: string;
  abbreviation: string;

  ideology: string;

  popularity: number;

  leaderId: PlayerId | null;

  foundedAt: string;
}

export interface Alliance {
  id: AllianceId;

  name: string;

  memberCountryIds: CountryId[];

  foundedAt: string;

  active: boolean;
}

export interface TradeAgreement {
  id: string;

  countryA: CountryId;
  countryB: CountryId;

  resources: ResourceType[];

  value: number;

  active: boolean;

  startedAt: string;
}

export type ResourceType =
  | "food"
  | "oil"
  | "gas"
  | "coal"
  | "iron"
  | "uranium"
  | "rare_earths"
  | "electronics"
  | "industrial_materials"
  | "energy";