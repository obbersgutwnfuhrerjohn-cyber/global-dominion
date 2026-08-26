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
  canRevolt?: boolean;
  independenceMovement?: number;
  overlordId?: string | null;
  allies?: string[];
  territories?: string[];
  independenceDay?: string | null;
  /** Atmospheric city images (public stock — not copyrighted stills) */
  cityImages?: { title: string; url: string; caption: string }[];
  superpower?: boolean;
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

/**
 * Three superpowers of the ordered world (High Castle–inspired):
 * 1) Greater German Reich
 * 2) Greater Albanian Reich (full Balkans + Slavic lands + all Greece)
 * 3) Japanese Empire / Pacific States
 *
 * City images use free public stock photography (Unsplash) to evoke
 * period atmosphere — not copyrighted frames from the TV series.
 */
export const DEMO_COUNTRIES: DemoCountry[] = [
  {
    id: "country_gnr",
    name: "Greater German Reich",
    code: "GNR",
    capital: "Berlin",
    population: 480000000,
    gdp: 22000000000000,
    government: "totalitarian",
    status: "peace",
    treasury: 6200000000000,
    militaryStrength: 99,
    stability: 92,
    color: "#8B1A1A",
    bloc: "Axis",
    region: "Central & Northern Europe · Atlantic",
    description:
      "First superpower. From Berlin the Reich commands Europe’s core, the Atlantic seaboard, and atomic rocketry. Peer only to Tirana and Tokyo in the global order.",
    canRevolt: false,
    independenceMovement: 3,
    overlordId: null,
    allies: ["country_gar", "country_jps"],
    territories: [
      "Germany", "Austria", "Bohemia", "Low Countries", "Northern France",
      "Scandinavia", "Poland corridor", "Atlantic Seaboard zones",
    ],
    independenceDay: null,
    superpower: true,
    cityImages: [
      {
        title: "Berlin — Reich Capital",
        url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
        caption: "Monumental avenues under grey northern skies.",
      },
      {
        title: "Berlin — Night District",
        url: "https://images.unsplash.com/photo-1587330979470-3585ce270753?w=800&q=80",
        caption: "Ordered lights of the administrative core.",
      },
    ],
  },
  {
    id: "country_gar",
    name: "Greater Albanian Reich",
    code: "GAR",
    capital: "Tirana",
    population: 92000000,
    gdp: 3800000000000,
    government: "fascist",
    status: "peace",
    treasury: 890000000000,
    militaryStrength: 94,
    stability: 86,
    color: "#6B1A2A",
    bloc: "Axis",
    region: "Entire Balkans · Slavic South · All of Greece",
    description:
      "Second superpower and formal ally of Berlin. Controls the whole Balkan peninsula, expanded Slavic territories (Serbia, Montenegro, Macedonia, Bosnia, parts of Croatia and Bulgaria), and all of Greece — from Ioannina and Thessaloniki to Athens and the islands. Tirana rivals Berlin and Tokyo.",
    canRevolt: false,
    independenceMovement: 8,
    overlordId: null,
    allies: ["country_gnr", "country_jps"],
    territories: [
      "Albania proper",
      "Kosovo",
      "Montenegro",
      "Serbia (full)",
      "Macedonia",
      "Bosnia-Herzegovina",
      "Parts of Croatia",
      "Western Bulgaria",
      "All of Greece — Epirus, Thessaly, Macedonia (Greek), Athens, Peloponnese, islands",
      "Thessaloniki",
      "Ioannina (Janina)",
      "Athens",
      "Niš",
      "Belgrade",
      "Skopje",
    ],
    independenceDay: "1941-04-12",
    superpower: true,
    cityImages: [
      {
        title: "Tirana — Capital of the Albanian Reich",
        url: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800&q=80",
        caption: "Mountain capital; seat of Balkan authority.",
      },
      {
        title: "Athens under the Balkan Order",
        url: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",
        caption: "Ancient stone under a new flag.",
      },
      {
        title: "Thessaloniki — Aegean Gate",
        url: "https://images.unsplash.com/photo-1601581875162-6f5f2f5e0f6f?w=800&q=80",
        caption: "Port and garrison of the southern marches.",
      },
    ],
  },
  {
    id: "country_jps",
    name: "Japanese Pacific Empire",
    code: "JPE",
    capital: "San Francisco",
    population: 165000000,
    gdp: 9800000000000,
    government: "imperial",
    status: "peace",
    treasury: 2100000000000,
    militaryStrength: 96,
    stability: 88,
    color: "#1A3A1A",
    bloc: "Axis",
    region: "Pacific Coast · Home Islands influence",
    description:
      "Third superpower. The Pacific States and imperial reach across the ocean. San Francisco is the western capital of the ordered world; formal ally of Berlin and Tirana.",
    canRevolt: false,
    independenceMovement: 10,
    overlordId: null,
    allies: ["country_gnr", "country_gar"],
    territories: [
      "California", "Oregon", "Washington", "Western Nevada",
      "Pacific trade network", "Home Islands coordination",
    ],
    independenceDay: null,
    superpower: true,
    cityImages: [
      {
        title: "San Francisco — Pacific Capital",
        url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
        caption: "Fog over the bay; imperial administration.",
      },
      {
        title: "San Francisco — Downtown",
        url: "https://images.unsplash.com/photo-1449034446853-66c8619934c1?w=800&q=80",
        caption: "Order and commerce on the western shore.",
      },
      {
        title: "Tokyo — Imperial Coordination",
        url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
        caption: "Night city; the other pole of Pacific power.",
      },
    ],
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
      "Buffer between the German and Japanese spheres. Smugglers, resistance cells, and forbidden films.",
    canRevolt: true,
    independenceMovement: 72,
    overlordId: null,
    allies: [],
    territories: ["Colorado", "Wyoming (parts)", "Mountain passes"],
    independenceDay: null,
    superpower: false,
    cityImages: [
      {
        title: "Denver — Neutral Hub",
        url: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800&q=80",
        caption: "Lawless corridor between empires.",
      },
    ],
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
    description: "Remnants of the old republic. All three superpowers watch.",
    canRevolt: true,
    independenceMovement: 61,
    overlordId: null,
    allies: [],
    territories: ["Wyoming", "Montana (parts)", "Idaho (parts)"],
    independenceDay: null,
    superpower: false,
    cityImages: [],
  },
];

export function createDemoPlayer(
  username: string,
  displayName: string,
  email: string,
  countryId: CountryId = "country_jps"
): DemoPlayer {
  const now = new Date().toISOString();
  const currency =
    countryId === "country_gnr"
      ? "ℛℳ"
      : countryId === "country_gar"
        ? "Lek"
        : "¥";
  return {
    id: `player_${Date.now().toString(36)}`,
    username: username.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "player",
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
    currency,
    status: "online",
    career: "civilian",
    biography:
      "A subject of the ordered world. Three superpowers rule: Berlin, Tirana, Tokyo-San Francisco.",
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
  { id: "unit_1", type: "infantry", name: "1st Pacific Infantry", size: 12000, location: "San Francisco Garrison", morale: 78, supply: 92, status: "ready", countryId: "country_jps" },
  { id: "unit_2", type: "armor", name: "Kempeitai Armor", size: 3200, location: "Sacramento Sector", morale: 85, supply: 88, status: "ready", countryId: "country_jps" },
  { id: "unit_3", type: "fighter", name: "Zero Squadron West", size: 48, location: "Alameda Airbase", morale: 91, supply: 95, status: "ready", countryId: "country_jps" },
  { id: "unit_gnr_1", type: "armor", name: "1. Panzer Division", size: 18000, location: "Berlin Command", morale: 95, supply: 98, status: "ready", countryId: "country_gnr" },
  { id: "unit_gar_1", type: "infantry", name: "Tirana Guard Corps", size: 22000, location: "Tirana", morale: 88, supply: 90, status: "ready", countryId: "country_gar" },
  { id: "unit_gar_2", type: "infantry", name: "Athens Occupation Force", size: 15000, location: "Athens", morale: 80, supply: 85, status: "ready", countryId: "country_gar" },
  { id: "unit_gar_3", type: "armor", name: "Belgrade Armored Group", size: 6500, location: "Belgrade", morale: 82, supply: 84, status: "patrol", countryId: "country_gar" },
  { id: "unit_gar_4", type: "infantry", name: "Thessaloniki Division", size: 11000, location: "Thessaloniki", morale: 79, supply: 83, status: "ready", countryId: "country_gar" },
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
      { id: "bat_1", name: "Battle of Rocky Pass", location: "Rocky Pass", attackerStrength: 4200, defenderStrength: 3100, status: "ongoing", day: 4 },
    ],
  },
];

export const DEMO_REVOLUTIONS: DemoRevolution[] = [
  {
    id: "rev_1",
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
    title: "Three Powers Summit — Berlin",
    description: "GNR, Greater Albanian Reich, and the Japanese Pacific Empire renew the Axis protocols.",
    type: "diplomacy",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "evt_2",
    title: "Tirana Parade — Full Balkan Strength",
    description: "GAR reviews divisions from Belgrade to Athens. Slavic and Greek provinces stand under one banner.",
    type: "politics",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "evt_3",
    title: "San Francisco Trade Protocol",
    description: "Pacific Empire and Berlin exchange synthetic oil and electronics.",
    type: "economy",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "evt_4",
    title: "Neutral Zone Film Seizure",
    description: "Forbidden reels confiscated near Denver. All three superpowers increase patrols.",
    type: "security",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
  },
];

export const DEMO_MARKET = [
  { symbol: "GRAIN", name: "Grain Futures", price: 42.5, change: 1.2 },
  { symbol: "SYNOIL", name: "Synthetic Oil", price: 78.3, change: -0.8 },
  { symbol: "STL", name: "Steel Index", price: 615.0, change: 3.1 },
  { symbol: "ATOM", name: "Atomic Materials", price: 1124.0, change: 4.2 },
  { symbol: "FILM", name: "Propaganda Media", price: 18.7, change: -2.1 },
];
