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
}

export const DEMO_COUNTRIES: DemoCountry[] = [
  {
    id: "country_us",
    name: "United States",
    code: "USA",
    capital: "Washington",
    population: 331000000,
    gdp: 25000000000000,
    government: "presidential",
    status: "peace",
    treasury: 1200000000000,
    militaryStrength: 92,
    stability: 78,
    color: "#3B5998",
  },
  {
    id: "country_cn",
    name: "China",
    code: "CHN",
    capital: "Beijing",
    population: 1412000000,
    gdp: 18000000000000,
    government: "hybrid",
    status: "peace",
    treasury: 980000000000,
    militaryStrength: 88,
    stability: 82,
    color: "#C8102E",
  },
  {
    id: "country_eu",
    name: "European Federation",
    code: "EUR",
    capital: "Brussels",
    population: 450000000,
    gdp: 16000000000000,
    government: "parliamentary",
    status: "peace",
    treasury: 750000000000,
    militaryStrength: 75,
    stability: 71,
    color: "#003399",
  },
  {
    id: "country_ru",
    name: "Russian Federation",
    code: "RUS",
    capital: "Moscow",
    population: 144000000,
    gdp: 2200000000000,
    government: "presidential",
    status: "peace",
    treasury: 320000000000,
    militaryStrength: 81,
    stability: 64,
    color: "#D52B1E",
  },
  {
    id: "country_in",
    name: "India",
    code: "IND",
    capital: "New Delhi",
    population: 1408000000,
    gdp: 3700000000000,
    government: "parliamentary",
    status: "peace",
    treasury: 410000000000,
    militaryStrength: 72,
    stability: 68,
    color: "#FF9933",
  },
  {
    id: "country_br",
    name: "Brazil",
    code: "BRA",
    capital: "Brasília",
    population: 214000000,
    gdp: 2100000000000,
    government: "presidential",
    status: "peace",
    treasury: 180000000000,
    militaryStrength: 55,
    stability: 61,
    color: "#009C3B",
  },
];

export function createDemoPlayer(
  username: string,
  displayName: string,
  email: string,
  countryId: CountryId = "country_us"
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
    currency: "GD$",
    status: "online",
    career: "civilian",
    biography: "A new citizen of the global order.",
    createdAt: now,
    lastLoginAt: now,
  };
}

export const DEMO_RESOURCES: DemoResource[] = [
  { type: "food", name: "Food", amount: 1250, production: 85, consumption: 72, unit: "t" },
  { type: "energy", name: "Energy", amount: 3400, production: 210, consumption: 195, unit: "MWh" },
  { type: "oil", name: "Oil", amount: 890, production: 42, consumption: 38, unit: "bbl" },
  { type: "steel", name: "Steel", amount: 560, production: 28, consumption: 31, unit: "t" },
  { type: "electronics", name: "Electronics", amount: 210, production: 12, consumption: 9, unit: "units" },
  { type: "rare_earth", name: "Rare Earth", amount: 45, production: 3, consumption: 2, unit: "t" },
];

export const DEMO_UNITS: DemoUnit[] = [
  {
    id: "unit_1",
    type: "infantry",
    name: "1st Infantry Division",
    size: 12000,
    location: "Washington Sector",
    morale: 78,
    supply: 92,
    status: "ready",
  },
  {
    id: "unit_2",
    type: "armor",
    name: "3rd Armored Brigade",
    size: 4500,
    location: "Northern Command",
    morale: 85,
    supply: 88,
    status: "ready",
  },
  {
    id: "unit_3",
    type: "fighter",
    name: "Air Wing Alpha",
    size: 48,
    location: "Central Airbase",
    morale: 91,
    supply: 95,
    status: "ready",
  },
];

export const DEMO_WORLD_EVENTS = [
  {
    id: "evt_1",
    title: "Trade Summit Concludes",
    description: "Major powers agree on temporary tariff reductions.",
    type: "diplomacy",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "evt_2",
    title: "Resource Shortage Alert",
    description: "Steel production lags behind industrial demand in several regions.",
    type: "economy",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "evt_3",
    title: "Election Cycle Begins",
    description: "Parliamentary elections scheduled in the European Federation.",
    type: "politics",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const DEMO_MARKET = [
  { symbol: "FOOD", name: "Food Futures", price: 42.5, change: 1.2 },
  { symbol: "OIL", name: "Crude Oil", price: 78.3, change: -0.8 },
  { symbol: "STL", name: "Steel Index", price: 615.0, change: 3.1 },
  { symbol: "ENR", name: "Energy Basket", price: 112.4, change: 0.4 },
  { symbol: "TECH", name: "Tech Components", price: 245.7, change: 5.6 },
];
