import type { PlayerId, CountryId } from "../types/game";

export interface DemoPlayer {
  id: PlayerId;
  username: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  countryId: CountryId | null;
  nationalityCountryId: CountryId | null;
  rank: string;
  level: number;
  experience: number;
  prestige: number;
  reputation: number;
  wealth: number;
  currency: string;
  status: "online" | "away" | "busy" | "offline";
  career: string;
  biography: string;
  createdAt: string;
  lastLoginAt: string;
  influence?: number;
  loyalty?: number;
  medals?: string[];
  revolutionarySupport?: number;
}

export interface DemoCountry {
  id: CountryId;
  name: string;
  code: string;
  capital: string;
  population: number;
  gdp: number;
  government: string;
  status: string;
  treasury: number;
  militaryStrength: number;
  stability: number;
  color: string;
  bloc?: string;
  region?: string;
  description?: string;
  /** Can players start a revolution here? */
  canRevolt?: boolean;
  /** Independence movement strength 0-100 */
  independenceMovement?: number;
  /** Overlord if occupied / protectorate */
  overlordId?: string | null;
  /** Ally country ids */
  allies?: string[];
  territories?: string[];
  independenceDay?: string | null;
}

export interface DemoResource {
  type: string;
  name: string;
  amount: number;
  production: number;
  consumption: number;
  unit: string;
}

export interface DemoUnit {
  id: string;
  type: string;
  name: string;
  size: number;
  location: string;
  morale: number;
  supply: number;
  status: string;
  countryId?: string;
}

export interface DemoWar {
  id: string;
  name: string;
  attackerId: string;
  defenderId: string;
  status: "preparing" | "active" | "ceasefire" | "ended";
  startedAt: string;
  fronts: string[];
  battles: DemoBattle[];
}

export interface DemoBattle {
  id: string;
  name: string;
  location: string;
  attackerStrength: number;
  defenderStrength: number;
  status: "ongoing" | "attacker_won" | "defender_won" | "stalemate";
  day: number;
}

export interface DemoRevolution {
  id: string;
  countryId: string;
  leaderName: string;
  support: number;
  status: "organizing" | "active" | "suppressed" | "victorious";
  goal: "independence" | "regime_change" | "secession";
  startedAt: string;
}

/** Alternate 1962 — Man in the High Castle + expanded Balkans */
export const DEMO_COUNTRIES: DemoCountry[] = [
  {
    id: "country_gnr",
    name: "Greater Nazi Reich",
    code: "GNR",
    capital: "Berlin",
    population: 420000000,
    gdp: 18500000000000,
    government: "totalitarian",
    status: "peace",
    treasury: 4800000000000,
    militaryStrength: 99,
    stability: 91,
    color: "#8B1A1A",
    bloc: "Axis",
    region: "Europe, Africa & Atlantic Seaboard",
    description:
      "The supreme power of the ordered world. From Berlin to the Atlantic, rocketry, atomic force, and absolute hierarchy keep the Reich unmatched. All lesser Axis partners orbit its will.",
    canRevolt: false,
    independenceMovement: 5,
    overlordId: null,
    allies: ["country_gar", "country_ita", "country_jps", "country_bra"],
    territories: ["Germany", "France", "Low Countries", "Scandinavia", "Eastern Europe", "North Africa", "Atlantic Seaboard"],
    independenceDay: null,
  },
  {
    id: "country_gar",
    name: "Greater Albanian Reich",
    code: "GAR",
    capital: "Tirana",
    population: 18500000,
    gdp: 420000000000,
    government: "fascist",
    status: "peace",
    treasury: 48000000000,
    militaryStrength: 58,
    stability: 74,
    color: "#6B1A2A",
    bloc: "Axis",
    region: "Western Balkans & Northern Greece",
    description:
      "Allied with the Greater Nazi Reich. Controls the expanded Albanian domain from Niš through Serbia, Montenegro, and Macedonia down to Thessaloniki and Ioannina (Janina). A loyal Balkan pillar of the Axis.",
    canRevolt: true,
    independenceMovement: 22,
    overlordId: null,
    allies: ["country_gnr", "country_ita"],
    territories: [
      "Albania proper",
      "Niš",
      "Southern Serbia",
      "Montenegro",
      "Macedonia",
      "Thessaloniki",
      "Ioannina (Janina)",
    ],
    independenceDay: "1941-04-12",
  },
  {
    id: "country_jps",
    name: "Japanese Pacific States",
    code: "JPS",
    capital: "San Francisco",
    population: 78000000,
    gdp: 4200000000000,
    government: "imperial",
    status: "peace",
    treasury: 890000000000,
    militaryStrength: 91,
    stability: 84,
    color: "#1A3A1A",
    bloc: "Axis",
    region: "Pacific Coast",
    description:
      "The Pacific States under the Rising Sun. Formal ally of the Reich, yet rivalry over the Neutral Zone never fully sleeps.",
    canRevolt: true,
    independenceMovement: 18,
    overlordId: null,
    allies: ["country_gnr"],
    territories: ["California", "Oregon", "Washington", "Western Nevada"],
    independenceDay: null,
  },
  {
    id: "country_nz",
    name: "Neutral Zone",
    code: "NZ",
    capital: "Denver",
    population: 12000000,
    gdp: 180000000000,
    government: "fractured",
    status: "unstable",
    treasury: 12000000000,
    militaryStrength: 28,
    stability: 38,
    color: "#6B5A3A",
    bloc: "Neutral",
    region: "Rocky Mountain Corridor",
    description:
      "Lawless buffer between empires. Smugglers, resistance cells, and black-market films thrive. High chance of revolutionary activity.",
    canRevolt: true,
    independenceMovement: 72,
    overlordId: null,
    allies: [],
    territories: ["Colorado", "Wyoming (parts)", "Mountain passes"],
    independenceDay: null,
  },
  {
    id: "country_rms",
    name: "Rocky Mountain States",
    code: "RMS",
    capital: "Cheyenne",
    population: 8500000,
    gdp: 95000000000,
    government: "provisional",
    status: "tense",
    treasury: 8000000000,
    militaryStrength: 35,
    stability: 52,
    color: "#3A3A48",
    bloc: "Contested",
    region: "Interior West",
    description:
      "Remnants of the old republic. Both empires watch. Players can push for full independence or alignment.",
    canRevolt: true,
    independenceMovement: 61,
    overlordId: null,
    allies: [],
    territories: ["Wyoming", "Montana (parts)", "Idaho (parts)"],
    independenceDay: null,
  },
  {
    id: "country_ita",
    name: "Italian Empire",
    code: "ITA",
    capital: "Rome",
    population: 95000000,
    gdp: 1100000000000,
    government: "fascist",
    status: "peace",
    treasury: 210000000000,
    militaryStrength: 62,
    stability: 71,
    color: "#4A6B3A",
    bloc: "Axis",
    region: "Mediterranean",
    description:
      "Junior Axis partner. Mediterranean and African holdings. Allied with Berlin and Tirana.",
    canRevolt: true,
    independenceMovement: 15,
    overlordId: null,
    allies: ["country_gnr", "country_gar"],
    territories: ["Italy", "Libya", "parts of East Africa"],
    independenceDay: null,
  },
  {
    id: "country_bra",
    name: "Brazilian Reich Protectorate",
    code: "BRA",
    capital: "Rio de Janeiro",
    population: 85000000,
    gdp: 620000000000,
    government: "protectorate",
    status: "peace",
    treasury: 95000000000,
    militaryStrength: 48,
    stability: 66,
    color: "#2A4A2A",
    bloc: "Axis",
    region: "South America",
    description:
      "Resource client of the Greater Nazi Reich. Rubber, minerals, manpower.",
    canRevolt: true,
    independenceMovement: 35,
    overlordId: "country_gnr",
    allies: ["country_gnr"],
    territories: ["Brazil"],
    independenceDay: null,
  },
  {
    id: "country_serb",
    name: "Serbian Occupation Zone",
    code: "SOZ",
    capital: "Belgrade",
    population: 4200000,
    gdp: 28000000000,
    government: "occupied",
    status: "occupied",
    treasury: 1200000000,
    militaryStrength: 12,
    stability: 28,
    color: "#4A3A2A",
    bloc: "Occupied",
    region: "Central Balkans",
    description:
      "Northern Serbian lands under GNR/GAR pressure. Strong independence movement. Players can organize revolution or declare a free Serbia.",
    canRevolt: true,
    independenceMovement: 78,
    overlordId: "country_gar",
    allies: [],
    territories: ["Northern Serbia", "Belgrade region"],
    independenceDay: null,
  },
];

export function createDemoPlayer(
  username: string,
  displayName: string,
  email: string,
  countryId: CountryId = "country_jps"
): DemoPlayer {
  const now = new Date().toISOString();
  return {
    id: `player_${Date.now().toString(36)}`,
    username: username.toLowerCase().replace(/\s+/g, "_"),
    displayName,
    email,
    emailVerified: true,
    countryId,
    nationalityCountryId: countryId,
    rank: "citizen",
    level: 1,
    experience: 0,
    prestige: 0,
    reputation: 50,
    wealth: 2500,
    currency: countryId === "country_gnr" || countryId === "country_gar" ? "ℛℳ" : "¥",
    status: "online",
    career: "civilian",
    biography:
      "A new subject of the ordered world. Loyalty is survival; ambition is power. Revolution is death — or freedom.",
    createdAt: now,
    lastLoginAt: now,
    influence: 10,
    loyalty: 65,
    medals: [],
    revolutionarySupport: 0,
  };
}

export const DEMO_RESOURCES: DemoResource[] = [
  { type: "food", name: "Grain Rations", amount: 1250, production: 85, consumption: 72, unit: "t" },
  { type: "energy", name: "Coal & Atomic", amount: 3400, production: 210, consumption: 195, unit: "MWh" },
  { type: "oil", name: "Synthetic Oil", amount: 890, production: 42, consumption: 38, unit: "bbl" },
  { type: "steel", name: "Steel", amount: 560, production: 28, consumption: 31, unit: "t" },
  { type: "electronics", name: "Vacuum Tubes", amount: 210, production: 12, consumption: 9, unit: "units" },
  { type: "uranium", name: "Uranium", amount: 45, production: 3, consumption: 2, unit: "t" },
];

export const DEMO_UNITS: DemoUnit[] = [
  {
    id: "unit_1",
    type: "infantry",
    name: "1st Pacific Infantry",
    size: 12000,
    location: "San Francisco Garrison",
    morale: 78,
    supply: 92,
    status: "ready",
    countryId: "country_jps",
  },
  {
    id: "unit_2",
    type: "armor",
    name: "Kempeitai Armor Detachment",
    size: 3200,
    location: "Sacramento Sector",
    morale: 85,
    supply: 88,
    status: "ready",
    countryId: "country_jps",
  },
  {
    id: "unit_3",
    type: "fighter",
    name: "Zero Squadron West",
    size: 48,
    location: "Alameda Airbase",
    morale: 91,
    supply: 95,
    status: "ready",
    countryId: "country_jps",
  },
  {
    id: "unit_4",
    type: "special",
    name: "Trade Mission Guard",
    size: 800,
    location: "Neutral Zone Border",
    morale: 70,
    supply: 75,
    status: "patrol",
    countryId: "country_jps",
  },
  {
    id: "unit_gnr_1",
    type: "armor",
    name: "1. SS Panzer Division",
    size: 18000,
    location: "Berlin Command",
    morale: 95,
    supply: 98,
    status: "ready",
    countryId: "country_gnr",
  },
  {
    id: "unit_gnr_2",
    type: "bomber",
    name: "Luftwaffe Strategic Wing",
    size: 120,
    location: "Central Europe",
    morale: 92,
    supply: 96,
    status: "ready",
    countryId: "country_gnr",
  },
  {
    id: "unit_gar_1",
    type: "infantry",
    name: "Tirana Guard Division",
    size: 9000,
    location: "Tirana",
    morale: 80,
    supply: 85,
    status: "ready",
    countryId: "country_gar",
  },
  {
    id: "unit_gar_2",
    type: "infantry",
    name: "Thessaloniki Garrison",
    size: 6500,
    location: "Thessaloniki",
    morale: 72,
    supply: 78,
    status: "ready",
    countryId: "country_gar",
  },
  {
    id: "unit_gar_3",
    type: "armor",
    name: "Niš Armored Group",
    size: 2800,
    location: "Niš",
    morale: 75,
    supply: 80,
    status: "patrol",
    countryId: "country_gar",
  },
];

export const DEMO_WARS: DemoWar[] = [
  {
    id: "war_1",
    name: "Neutral Zone Border Incidents",
    attackerId: "country_jps",
    defenderId: "country_nz",
    status: "active",
    startedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    fronts: ["Rocky Pass", "Denver Approaches"],
    battles: [
      {
        id: "bat_1",
        name: "Battle of Rocky Pass",
        location: "Rocky Pass",
        attackerStrength: 4200,
        defenderStrength: 3100,
        status: "ongoing",
        day: 4,
      },
      {
        id: "bat_2",
        name: "Denver Skirmish",
        location: "Denver Approaches",
        attackerStrength: 1800,
        defenderStrength: 2200,
        status: "stalemate",
        day: 2,
      },
    ],
  },
];

export const DEMO_REVOLUTIONS: DemoRevolution[] = [
  {
    id: "rev_1",
    countryId: "country_serb",
    leaderName: "Free Serbia Committee",
    support: 64,
    status: "organizing",
    goal: "independence",
    startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "rev_2",
    countryId: "country_nz",
    leaderName: "Mountain Resistance",
    support: 71,
    status: "active",
    goal: "independence",
    startedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export const DEMO_WORLD_EVENTS = [
  {
    id: "evt_1",
    title: "Reich–Pacific Trade Protocol",
    description:
      "Berlin and San Francisco renew the annual resource exchange. Synthetic oil flows west; electronics and film east.",
    type: "diplomacy",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "evt_2",
    title: "Film Smuggling Surge",
    description:
      "Illegal reels from the Neutral Zone depict a world where the Allies won. Kempeitai and Gestapo increase patrols.",
    type: "security",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "evt_3",
    title: "Uranium Convoy Delayed",
    description:
      "A Reich atomic shipment through the Rocky corridor is delayed by resistance activity. Stability in the RMS drops.",
    type: "military",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "evt_4",
    title: "Greater Albanian Reich Parade — Tirana",
    description:
      "GAR celebrates alliance with Berlin. Columns pass from the capital toward the Niš highway. Thessaloniki garrison stands review.",
    type: "politics",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: "evt_5",
    title: "Independence Whisper — Belgrade",
    description:
      "Leaflets call for a Free Serbia. Occupation authorities raise alert level. Revolutionary support climbs in the Serbian Occupation Zone.",
    type: "revolution",
    timestamp: new Date(Date.now() - 28800000).toISOString(),
  },
];

export const DEMO_MARKET = [
  { symbol: "GRAIN", name: "Grain Futures", price: 42.5, change: 1.2 },
  { symbol: "SYNOIL", name: "Synthetic Oil", price: 78.3, change: -0.8 },
  { symbol: "STL", name: "Steel Index", price: 615.0, change: 3.1 },
  { symbol: "ATOM", name: "Atomic Materials", price: 1124.0, change: 4.2 },
  { symbol: "FILM", name: "Propaganda Media", price: 18.7, change: -2.1 },
];
