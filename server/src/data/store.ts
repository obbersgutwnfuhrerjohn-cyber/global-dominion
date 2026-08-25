import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export type PlayerId = string;
export type CountryId = string;
export type SessionId = string;

export interface Player {
  id: PlayerId;
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  emailVerified: boolean;
  profileImageUrl: string | null;
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
  lastLoginAt: string | null;
}

export interface Session {
  sessionId: SessionId;
  playerId: PlayerId;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  deviceId: string | null;
}

export interface Country {
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

export interface ResourceStock {
  countryId: CountryId;
  type: string;
  name: string;
  amount: number;
  production: number;
  consumption: number;
  unit: string;
}

export interface MilitaryUnit {
  id: string;
  countryId: CountryId;
  type: string;
  name: string;
  size: number;
  location: string;
  morale: number;
  supply: number;
  status: string;
  ownerPlayerId: PlayerId | null;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: string;
  countryIds: CountryId[];
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface DeviceRegistration {
  id: string;
  playerId: PlayerId;
  deviceId: string;
  platform: string;
  createdAt: string;
}

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

const now = () => new Date().toISOString();

const seedCountries: Country[] = [
  {
    id: "country_us",
    name: "United States",
    code: "USA",
    capital: "Washington",
    population: 331_000_000,
    gdp: 25_000_000_000_000,
    government: "presidential",
    status: "peace",
    treasury: 1_200_000_000_000,
    militaryStrength: 92,
    stability: 78,
    color: "#3B5998",
  },
  {
    id: "country_cn",
    name: "China",
    code: "CHN",
    capital: "Beijing",
    population: 1_412_000_000,
    gdp: 18_000_000_000_000,
    government: "hybrid",
    status: "peace",
    treasury: 980_000_000_000,
    militaryStrength: 88,
    stability: 82,
    color: "#C8102E",
  },
  {
    id: "country_eu",
    name: "European Federation",
    code: "EUR",
    capital: "Brussels",
    population: 450_000_000,
    gdp: 16_000_000_000_000,
    government: "parliamentary",
    status: "peace",
    treasury: 750_000_000_000,
    militaryStrength: 75,
    stability: 71,
    color: "#003399",
  },
  {
    id: "country_ru",
    name: "Russian Federation",
    code: "RUS",
    capital: "Moscow",
    population: 144_000_000,
    gdp: 2_200_000_000_000,
    government: "presidential",
    status: "peace",
    treasury: 320_000_000_000,
    militaryStrength: 81,
    stability: 64,
    color: "#D52B1E",
  },
  {
    id: "country_in",
    name: "India",
    code: "IND",
    capital: "New Delhi",
    population: 1_408_000_000,
    gdp: 3_700_000_000_000,
    government: "parliamentary",
    status: "peace",
    treasury: 410_000_000_000,
    militaryStrength: 72,
    stability: 68,
    color: "#FF9933",
  },
  {
    id: "country_br",
    name: "Brazil",
    code: "BRA",
    capital: "Brasília",
    population: 214_000_000,
    gdp: 2_100_000_000_000,
    government: "presidential",
    status: "peace",
    treasury: 180_000_000_000,
    militaryStrength: 55,
    stability: 61,
    color: "#009C3B",
  },
];

function seedResources(): ResourceStock[] {
  const types = [
    { type: "food", name: "Food", amount: 1250, production: 85, consumption: 72, unit: "t" },
    { type: "energy", name: "Energy", amount: 3400, production: 210, consumption: 195, unit: "MWh" },
    { type: "oil", name: "Oil", amount: 890, production: 42, consumption: 38, unit: "bbl" },
    { type: "steel", name: "Steel", amount: 560, production: 28, consumption: 31, unit: "t" },
    { type: "electronics", name: "Electronics", amount: 210, production: 12, consumption: 9, unit: "units" },
    { type: "rare_earth", name: "Rare Earth", amount: 45, production: 3, consumption: 2, unit: "t" },
  ];
  const out: ResourceStock[] = [];
  for (const c of seedCountries) {
    for (const t of types) {
      const variance = 0.7 + Math.random() * 0.6;
      out.push({
        countryId: c.id,
        type: t.type,
        name: t.name,
        amount: Math.floor(t.amount * variance),
        production: Math.floor(t.production * variance),
        consumption: Math.floor(t.consumption * variance),
        unit: t.unit,
      });
    }
  }
  return out;
}

function seedUnits(): MilitaryUnit[] {
  return [
    {
      id: "unit_1",
      countryId: "country_us",
      type: "infantry",
      name: "1st Infantry Division",
      size: 12_000,
      location: "Washington Sector",
      morale: 78,
      supply: 92,
      status: "ready",
      ownerPlayerId: null,
    },
    {
      id: "unit_2",
      countryId: "country_us",
      type: "armor",
      name: "3rd Armored Brigade",
      size: 4500,
      location: "Northern Command",
      morale: 85,
      supply: 88,
      status: "ready",
      ownerPlayerId: null,
    },
    {
      id: "unit_3",
      countryId: "country_us",
      type: "fighter",
      name: "Air Wing Alpha",
      size: 48,
      location: "Central Airbase",
      morale: 91,
      supply: 95,
      status: "ready",
      ownerPlayerId: null,
    },
    {
      id: "unit_4",
      countryId: "country_cn",
      type: "infantry",
      name: "Eastern Garrison",
      size: 28_000,
      location: "Coastal Command",
      morale: 80,
      supply: 86,
      status: "ready",
      ownerPlayerId: null,
    },
    {
      id: "unit_5",
      countryId: "country_ru",
      type: "armor",
      name: "Northern Guard Corps",
      size: 9000,
      location: "Western Front",
      morale: 74,
      supply: 70,
      status: "ready",
      ownerPlayerId: null,
    },
  ];
}

function seedEvents(): WorldEvent[] {
  const t = Date.now();
  return [
    {
      id: "evt_1",
      title: "Trade Summit Concludes",
      description: "Major powers agree on temporary tariff reductions.",
      type: "diplomacy",
      timestamp: new Date(t - 3_600_000).toISOString(),
      countryIds: ["country_us", "country_cn", "country_eu"],
    },
    {
      id: "evt_2",
      title: "Resource Shortage Alert",
      description: "Steel production lags behind industrial demand in several regions.",
      type: "economy",
      timestamp: new Date(t - 7_200_000).toISOString(),
      countryIds: ["country_eu", "country_in"],
    },
    {
      id: "evt_3",
      title: "Election Cycle Begins",
      description: "Parliamentary elections scheduled in the European Federation.",
      type: "politics",
      timestamp: new Date(t - 14_400_000).toISOString(),
      countryIds: ["country_eu"],
    },
  ];
}

function seedMarket(): MarketQuote[] {
  return [
    { symbol: "FOOD", name: "Food Futures", price: 42.5, change: 1.2 },
    { symbol: "OIL", name: "Crude Oil", price: 78.3, change: -0.8 },
    { symbol: "STL", name: "Steel Index", price: 615.0, change: 3.1 },
    { symbol: "ENR", name: "Energy Basket", price: 112.4, change: 0.4 },
    { symbol: "TECH", name: "Tech Components", price: 245.7, change: 5.6 },
  ];
}

class Store {
  players = new Map<PlayerId, Player>();
  playersByEmail = new Map<string, PlayerId>();
  sessions = new Map<SessionId, Session>();
  sessionsByToken = new Map<string, SessionId>();
  countries = new Map<CountryId, Country>();
  resources: ResourceStock[] = [];
  units = new Map<string, MilitaryUnit>();
  events: WorldEvent[] = [];
  market: MarketQuote[] = [];
  devices: DeviceRegistration[] = [];
  relations = new Map<string, number>(); // `${a}:${b}` -> -100..100
  tickCount = 0;
  startedAt = now();

  constructor() {
    for (const c of seedCountries) {
      this.countries.set(c.id, c);
    }
    this.resources = seedResources();
    for (const u of seedUnits()) {
      this.units.set(u.id, u);
    }
    this.events = seedEvents();
    this.market = seedMarket();

    // Neutral relations between all pairs
    const ids = [...this.countries.keys()];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        this.relations.set(`${ids[i]}:${ids[j]}`, 0);
        this.relations.set(`${ids[j]}:${ids[i]}`, 0);
      }
    }
  }

  createPlayer(input: {
    email: string;
    password: string;
    displayName: string;
    username?: string;
    countryId?: CountryId;
  }): Player {
    const email = input.email.trim().toLowerCase();
    if (this.playersByEmail.has(email)) {
      throw new Error("EMAIL_TAKEN");
    }
    const playerId = id("player");
    const username =
      input.username?.trim().toLowerCase().replace(/\s+/g, "_") ||
      email.split("@")[0] ||
      "citizen";
    const countryId = input.countryId || "country_us";
    const player: Player = {
      id: playerId,
      email,
      passwordHash: bcrypt.hashSync(input.password, 8),
      username,
      displayName: input.displayName.trim(),
      emailVerified: true, // demo: auto-verify
      profileImageUrl: null,
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
      createdAt: now(),
      lastLoginAt: now(),
    };
    this.players.set(playerId, player);
    this.playersByEmail.set(email, playerId);
    return player;
  }

  verifyPassword(player: Player, password: string): boolean {
    return bcrypt.compareSync(password, player.passwordHash);
  }

  createSession(playerId: PlayerId, deviceId: string | null): Session {
    const sessionId = id("sess");
    const accessToken = id("tok");
    const refreshToken = id("ref");
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    const session: Session = {
      sessionId,
      playerId,
      accessToken,
      refreshToken,
      expiresAt: expires.toISOString(),
      createdAt: now(),
      deviceId,
    };
    this.sessions.set(sessionId, session);
    this.sessionsByToken.set(accessToken, sessionId);
    return session;
  }

  getSessionByToken(token: string): Session | null {
    const sid = this.sessionsByToken.get(token);
    if (!sid) return null;
    const session = this.sessions.get(sid);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sid);
      this.sessionsByToken.delete(token);
      return null;
    }
    return session;
  }

  toPublicPlayer(player: Player) {
    return {
      id: player.id,
      playerId: player.id,
      username: player.username,
      displayName: player.displayName,
      email: player.email,
      emailVerified: player.emailVerified,
      profileImageUrl: player.profileImageUrl,
      countryId: player.countryId,
      nationalityCountryId: player.nationalityCountryId,
      rank: player.rank,
      level: player.level,
      experience: player.experience,
      prestige: player.prestige,
      reputation: player.reputation,
      wealth: player.wealth,
      currency: player.currency,
      status: player.status,
      career: player.career,
      biography: player.biography,
      createdAt: player.createdAt,
      lastLoginAt: player.lastLoginAt,
    };
  }

  toAuthUser(player: Player) {
    return {
      playerId: player.id,
      email: player.email,
      emailVerified: player.emailVerified,
      displayName: player.displayName,
      profileImageUrl: player.profileImageUrl,
      createdAt: player.createdAt,
      lastLoginAt: player.lastLoginAt,
    };
  }

  advanceEconomyTick(): void {
    this.tickCount += 1;
    this.resources = this.resources.map((r) => {
      const delta = r.production - r.consumption;
      const noise = Math.floor(Math.random() * 5) - 2;
      return {
        ...r,
        amount: Math.max(0, r.amount + delta + noise),
      };
    });
    this.market = this.market.map((m) => {
      const drift = (Math.random() - 0.5) * 2;
      const next = Math.max(0.1, m.price * (1 + drift / 100));
      const change = ((next - m.price) / m.price) * 100;
      return { ...m, price: Math.round(next * 100) / 100, change: Math.round(change * 10) / 10 };
    });
  }
}

export const store = new Store();
export { id, now };
