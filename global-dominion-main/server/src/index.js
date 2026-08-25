/**
 * Global Dominion API Server
 * Zero-dependency Node.js (http + crypto only)
 * Matches mobile client ApiResponse envelope + core service routes.
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const TICK_MS = Number(process.env.TICK_MS) || 10_000;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "*").split(",").map((v) => v.trim()).filter(Boolean);
const MAX_BODY_BYTES = 256 * 1024;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = Number(process.env.RATE_MAX) || 120;
const rateBuckets = new Map();
const VERSION = "1.0.0";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const PERSIST_FILE = path.join(DATA_DIR, "world.json");

// ─── helpers ───────────────────────────────────────────────

function rid() {
  return `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
}

function now() {
  return new Date().toISOString();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false;
  if (stored.startsWith("scrypt$")) {
    const [, salt, expected] = stored.split("$");
    if (!salt || !expected) return false;
    const actual = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
  }
  // Legacy SHA-256 hashes are accepted once and upgraded after a successful login.
  const legacy = crypto.createHash("sha256").update(`gd:${password}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(stored));
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": CORS_ORIGINS.includes("*") ? "*" : (CORS_ORIGINS.includes(res.req?.headers?.origin) ? res.req.headers.origin : CORS_ORIGINS[0] || ""),
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Request-ID, X-Client-Version, X-Client-Platform",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Expose-Headers": "X-Request-ID",
    "X-Request-ID": body.requestId || rid(),
  });
  res.end(payload);
}

function ok(res, data, status = 200, requestId) {
  const requestIdFinal = requestId || rid();
  json(res, status, {
    success: true,
    data,
    error: null,
    serverTime: now(),
    requestId: requestIdFinal,
  });
}

function fail(res, status, code, message, retryable = false, requestId) {
  const requestIdFinal = requestId || rid();
  json(res, status, {
    success: false,
    data: null,
    error: { code, message, requestId: requestIdFinal, retryable },
    serverTime: now(),
    requestId: requestIdFinal,
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Request body too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function getBearer(req) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return null;
}

// ─── in-memory store ───────────────────────────────────────

const countries = new Map([
  [
    "country_us",
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
  ],
  [
    "country_cn",
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
  ],
  [
    "country_eu",
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
  ],
  [
    "country_ru",
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
  ],
  [
    "country_in",
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
  ],
  [
    "country_br",
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
  ],
]);

const resourceTypes = [
  { type: "food", name: "Food", amount: 1250, production: 85, consumption: 72, unit: "t" },
  { type: "energy", name: "Energy", amount: 3400, production: 210, consumption: 195, unit: "MWh" },
  { type: "oil", name: "Oil", amount: 890, production: 42, consumption: 38, unit: "bbl" },
  { type: "steel", name: "Steel", amount: 560, production: 28, consumption: 31, unit: "t" },
  { type: "electronics", name: "Electronics", amount: 210, production: 12, consumption: 9, unit: "units" },
  { type: "rare_earth", name: "Rare Earth", amount: 45, production: 3, consumption: 2, unit: "t" },
];

let resources = [];
for (const c of countries.values()) {
  for (const t of resourceTypes) {
    const v = 0.7 + Math.random() * 0.6;
    resources.push({
      countryId: c.id,
      type: t.type,
      name: t.name,
      amount: Math.floor(t.amount * v),
      production: Math.floor(t.production * v),
      consumption: Math.floor(t.consumption * v),
      unit: t.unit,
    });
  }
}

const units = new Map([
  [
    "unit_1",
    {
      id: "unit_1",
      countryId: "country_us",
      type: "infantry",
      name: "1st Infantry Division",
      size: 12000,
      location: "Washington Sector",
      morale: 78,
      supply: 92,
      status: "ready",
    },
  ],
  [
    "unit_2",
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
    },
  ],
  [
    "unit_3",
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
    },
  ],
  [
    "unit_4",
    {
      id: "unit_4",
      countryId: "country_cn",
      type: "infantry",
      name: "Eastern Garrison",
      size: 28000,
      location: "Coastal Command",
      morale: 80,
      supply: 86,
      status: "ready",
    },
  ],
]);

let market = [
  { symbol: "FOOD", name: "Food Futures", price: 42.5, change: 1.2 },
  { symbol: "OIL", name: "Crude Oil", price: 78.3, change: -0.8 },
  { symbol: "STL", name: "Steel Index", price: 615.0, change: 3.1 },
  { symbol: "ENR", name: "Energy Basket", price: 112.4, change: 0.4 },
  { symbol: "TECH", name: "Tech Components", price: 245.7, change: 5.6 },
];

let events = [
  {
    id: "evt_1",
    title: "Trade Summit Concludes",
    description: "Major powers agree on temporary tariff reductions.",
    type: "diplomacy",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    countryIds: ["country_us", "country_cn", "country_eu"],
  },
  {
    id: "evt_2",
    title: "Resource Shortage Alert",
    description: "Steel production lags behind industrial demand.",
    type: "economy",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    countryIds: ["country_eu", "country_in"],
  },
  {
    id: "evt_3",
    title: "Election Cycle Begins",
    description: "Parliamentary elections scheduled in the European Federation.",
    type: "politics",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    countryIds: ["country_eu"],
  },
];

const players = new Map(); // id -> player
const playersByEmail = new Map();
const sessions = new Map(); // accessToken -> session
const wars = [];
const companies = [];
const accounts = [];
const relations = new Map();
const startedAt = now();
let tickCount = 0;

for (const a of countries.keys()) {
  for (const b of countries.keys()) {
    if (a !== b) relations.set(`${a}:${b}`, 0);
  }
}

// ─── persistence (JSON file, survives restarts) ────────────

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

function saveState() {
  try {
    ensureDataDir();
    const payload = {
      version: VERSION,
      savedAt: now(),
      tickCount,
      players: Array.from(players.values()),
      sessions: Array.from(sessions.values()),
      wars,
      companies,
      accounts,
      resources,
      market,
      events,
      relations: Array.from(relations.entries()),
    };
    fs.writeFileSync(PERSIST_FILE, JSON.stringify(payload, null, 0));
  } catch (err) {
    console.error("[persist] save failed:", err.message);
  }
}

function loadState() {
  try {
    if (!fs.existsSync(PERSIST_FILE)) return false;
    const raw = fs.readFileSync(PERSIST_FILE, "utf8");
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.players)) return false;
    players.clear();
    playersByEmail.clear();
    sessions.clear();
    for (const p of data.players) {
      players.set(p.id, p);
      if (p.email) playersByEmail.set(p.email.toLowerCase(), p.id);
    }
    for (const s of data.sessions || []) {
      if (s.accessToken && new Date(s.expiresAt) > new Date()) {
        sessions.set(s.accessToken, s);
      }
    }
    if (Array.isArray(data.wars)) wars.splice(0, wars.length, ...data.wars);
    if (Array.isArray(data.companies)) companies.splice(0, companies.length, ...data.companies);
    if (Array.isArray(data.accounts)) accounts.splice(0, accounts.length, ...data.accounts);
    if (Array.isArray(data.resources)) resources = data.resources;
    if (Array.isArray(data.market)) market = data.market;
    if (Array.isArray(data.events)) events = data.events;
    if (Array.isArray(data.relations)) {
      relations.clear();
      for (const [k, v] of data.relations) relations.set(k, v);
    }
    if (typeof data.tickCount === "number") tickCount = data.tickCount;
    console.log(`[persist] loaded ${players.size} players, ${sessions.size} sessions from disk`);
    return true;
  } catch (err) {
    console.error("[persist] load failed:", err.message);
    return false;
  }
}

loadState();
// autosave every 30s
setInterval(saveState, 30_000);

function publicPlayer(p) {
  return {
    id: p.id,
    playerId: p.id,
    username: p.username,
    displayName: p.displayName,
    email: p.email,
    emailVerified: p.emailVerified,
    profileImageUrl: p.profileImageUrl,
    countryId: p.countryId,
    nationalityCountryId: p.nationalityCountryId,
    rank: p.rank,
    level: p.level,
    experience: p.experience,
    prestige: p.prestige,
    reputation: p.reputation,
    wealth: p.wealth,
    currency: p.currency,
    status: p.status,
    career: p.career,
    biography: p.biography,
    createdAt: p.createdAt,
    lastLoginAt: p.lastLoginAt,
  };
}

function authUser(p) {
  return {
    playerId: p.id,
    email: p.email,
    emailVerified: p.emailVerified,
    displayName: p.displayName,
    profileImageUrl: p.profileImageUrl,
    createdAt: p.createdAt,
    lastLoginAt: p.lastLoginAt,
  };
}

function createSession(playerId, deviceId) {
  const session = {
    sessionId: id("sess"),
    playerId,
    accessToken: id("tok"),
    refreshToken: id("ref"),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: now(),
    deviceId: deviceId || null,
  };
  sessions.set(session.accessToken, session);
  return session;
}

function getPlayerFromReq(req) {
  const token = getBearer(req);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(token);
    return null;
  }
  const player = players.get(session.playerId);
  if (!player) return null;
  return { player, session };
}

function advanceTick() {
  tickCount += 1;
  resources = resources.map((r) => {
    const delta = r.production - r.consumption;
    const noise = Math.floor(Math.random() * 5) - 2;
    return { ...r, amount: Math.max(0, r.amount + delta + noise) };
  });
  market = market.map((m) => {
    const drift = (Math.random() - 0.5) * 2;
    const next = Math.max(0.1, m.price * (1 + drift / 100));
    const change = ((next - m.price) / m.price) * 100;
    return {
      ...m,
      price: Math.round(next * 100) / 100,
      change: Math.round(change * 10) / 10,
    };
  });
  broadcast({ type: "tick", payload: { tickCount, serverTime: now(), market } });
}

// ─── WebSocket (minimal, for tick push) ────────────────────

const wsClients = new Set();

function acceptWs(req, socket, head) {
  // Very small WebSocket handshake
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " +
      accept +
      "\r\n\r\n"
  );
  const client = { socket, subscribed: false };
  wsClients.add(client);

  const welcome = JSON.stringify({
    type: "welcome",
    payload: { version: VERSION, tickCount, serverTime: now() },
  });
  wsSend(socket, welcome);

  socket.on("data", (buf) => {
    try {
      const msg = wsParse(buf);
      if (!msg) return;
      const data = JSON.parse(msg);
      if (data.type === "subscribe") {
        client.subscribed = true;
        wsSend(socket, JSON.stringify({ type: "subscribed", payload: { ok: true } }));
      }
      if (data.type === "ping") {
        wsSend(
          socket,
          JSON.stringify({
            type: "pong",
            payload: { serverTime: now(), tickCount },
          })
        );
      }
      if (data.type === "auth" && data.token) {
        const session = sessions.get(data.token);
        if (session) {
          client.playerId = session.playerId;
          wsSend(
            socket,
            JSON.stringify({ type: "auth_ok", payload: { playerId: session.playerId } })
          );
        } else {
          wsSend(
            socket,
            JSON.stringify({ type: "auth_fail", payload: { message: "Invalid token" } })
          );
        }
      }
    } catch {
      /* ignore */
    }
  });

  socket.on("close", () => wsClients.delete(client));
  socket.on("error", () => {
    wsClients.delete(client);
    socket.destroy();
  });
}

function wsSend(socket, text) {
  const payload = Buffer.from(text);
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  }
  try {
    socket.write(Buffer.concat([header, payload]));
  } catch {
    /* closed */
  }
}

function wsParse(buf) {
  if (buf.length < 2) return null;
  const second = buf[1];
  const masked = (second & 0x80) !== 0;
  let len = second & 0x7f;
  let offset = 2;
  if (len === 126) {
    len = buf.readUInt16BE(2);
    offset = 4;
  }
  let mask;
  if (masked) {
    mask = buf.slice(offset, offset + 4);
    offset += 4;
  }
  const data = buf.slice(offset, offset + len);
  if (masked && mask) {
    for (let i = 0; i < data.length; i++) data[i] ^= mask[i % 4];
  }
  return data.toString("utf8");
}

function broadcast(obj) {
  const text = JSON.stringify(obj);
  for (const c of wsClients) {
    if (c.subscribed) wsSend(c.socket, text);
  }
}

// ─── router ────────────────────────────────────────────────

async function handle(req, res) {
  const requestId = req.headers["x-request-id"] || rid();

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": CORS_ORIGINS.includes("*") ? "*" : (CORS_ORIGINS.includes(res.req?.headers?.origin) ? res.req.headers.origin : CORS_ORIGINS[0] || ""),
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Request-ID, X-Client-Version, X-Client-Platform",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;
  const method = req.method || "GET";

  try {
    // Health
    if (method === "GET" && (path === "/health" || path === "/api/health")) {
      return ok(
        res,
        {
          status: "ok",
          version: VERSION,
          tickCount,
          players: players.size,
          uptimeSeconds: Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
        },
        200,
        requestId
      );
    }

    if (method === "GET" && path === "/api") {
      return ok(
        res,
        { name: "Global Dominion API", version: VERSION },
        200,
        requestId
      );
    }

    // ── AUTH ──
    if (path.startsWith("/api/auth")) {
      return await handleAuth(req, res, path, method, requestId);
    }

    // ── WORLD ──
    if (path.startsWith("/api/world")) {
      return await handleWorld(req, res, path, method, url, requestId);
    }

    // ── PLAYERS ──
    if (path.startsWith("/api/players")) {
      return await handlePlayers(req, res, path, method, url, requestId);
    }

    // ── ECONOMY ──
    if (path.startsWith("/api/economy") || path === "/api/markets") {
      return await handleEconomy(req, res, path, method, url, requestId);
    }

    // ── MILITARY ──
    if (path.startsWith("/api/military")) {
      return await handleMilitary(req, res, path, method, url, requestId);
    }

    // ── WARS ──
    if (path.startsWith("/api/wars")) {
      return await handleWars(req, res, path, method, requestId);
    }

    // ── DIPLOMACY ──
    if (path.startsWith("/api/diplomacy")) {
      return await handleDiplomacy(req, res, path, method, url, requestId);
    }

    // ── MAP ──
    if (path.startsWith("/api/map")) {
      if (method === "GET" && path === "/api/map/countries") {
        const features = [...countries.values()].map((c) => ({
          type: "Feature",
          id: c.id,
          properties: {
            name: c.name,
            code: c.code,
            status: c.status,
            color: c.color,
            capital: c.capital,
            population: c.population,
          },
          geometry: { type: "Point", coordinates: [0, 0] },
        }));
        return ok(res, { type: "FeatureCollection", features }, 200, requestId);
      }
      if (method === "POST" && path === "/api/map/interactions") {
        const body = await readBody(req);
        return ok(res, { received: true, interaction: body, timestamp: now() }, 200, requestId);
      }
    }

    // ── BANKING ──
    if (path.startsWith("/api/banking")) {
      return await handleBanking(req, res, path, method, requestId);
    }

    // ── COMPANIES ──
    if (path.startsWith("/api/companies")) {
      return await handleCompanies(req, res, path, method, url, requestId);
    }

    // resources stubs
    if (path.startsWith("/api/resources")) {
      return ok(res, [], 200, requestId);
    }

    fail(res, 404, "not_found", `Endpoint not found: ${method} ${path}`, false, requestId);
  } catch (err) {
    console.error(err);
    fail(res, 500, "server_error", err.message || "Internal error", true, requestId);
  }
}

async function handleAuth(req, res, path, method, requestId) {
  if (method === "POST" && path === "/api/auth/register") {
    const body = await readBody(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();
    const username = String(body.username || email.split("@")[0] || "citizen").trim().toLowerCase();
    const countryId = String(body.countryId || "country_us");
    if (!email || !password || !displayName || !username) {
      return fail(res, 400, "validation_error", "email, password, displayName and username are required.", false, requestId);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, 400, "validation_error", "Enter a valid email address.", false, requestId);
    }
    if (password.length < 8) {
      return fail(res, 400, "validation_error", "Password must be at least 8 characters.", false, requestId);
    }
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return fail(res, 400, "validation_error", "Username must be 3-24 characters using letters, numbers or underscores.", false, requestId);
    }
    if (!countries.has(countryId)) {
      return fail(res, 400, "validation_error", "Invalid starting nation.", false, requestId);
    }
    if (playersByEmail.has(email)) {
      return fail(res, 409, "conflict", "Email already registered.", false, requestId);
    }
    const player = {
      id: id("player"),
      email,
      passwordHash: hashPassword(password),
      username,
      displayName,
      emailVerified: true,
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
    players.set(player.id, player);
    playersByEmail.set(email, player.id);
    const session = createSession(player.id, body.deviceId || null);
    saveState();
    return ok(
      res,
      {
        success: true,
        user: authUser(player),
        session,
        verificationRequired: false,
        message: "Account created.",
      },
      201,
      requestId
    );
  }

  if (method === "POST" && path === "/api/auth/login") {
    const body = await readBody(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const pid = playersByEmail.get(email);
    if (!pid) return fail(res, 401, "unauthorized", "Invalid email or password.", false, requestId);
    const player = players.get(pid);
    if (!verifyPassword(password, player.passwordHash)) {
      return fail(res, 401, "unauthorized", "Invalid email or password.", false, requestId);
    }
    if (!player.passwordHash.startsWith("scrypt$")) {
      player.passwordHash = hashPassword(password);
    }
    player.lastLoginAt = now();
    player.status = "online";
    const session = createSession(player.id, body.deviceId || null);
    saveState();
    return ok(
      res,
      {
        success: true,
        user: authUser(player),
        session,
        verificationRequired: false,
        accountLocked: false,
        message: "Welcome back.",
      },
      200,
      requestId
    );
  }

  if (method === "POST" && path === "/api/auth/logout") {
    const auth = getPlayerFromReq(req);
    if (auth) {
      sessions.delete(auth.session.accessToken);
      auth.player.status = "offline";
    }
    return ok(res, { success: true }, 200, requestId);
  }

  if (method === "POST" && path === "/api/auth/refresh") {
    const body = await readBody(req);
    let found = null;
    for (const s of sessions.values()) {
      if (s.refreshToken === body.refreshToken) {
        found = s;
        break;
      }
    }
    if (!found) return fail(res, 401, "unauthorized", "Invalid refresh token.", false, requestId);
    sessions.delete(found.accessToken);
    const next = createSession(found.playerId, found.deviceId);
    saveState();
    return ok(res, next, 200, requestId);
  }

  if (method === "GET" && path === "/api/auth/me") {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    return ok(res, authUser(auth.player), 200, requestId);
  }

  // stubs for remaining auth security endpoints
  if (path.startsWith("/api/auth/email") || path.startsWith("/api/auth/password") || path.startsWith("/api/auth/security")) {
    if (method === "GET" && path === "/api/auth/security/status") {
      return ok(res, { twoFactorEnabled: false, trustedDevices: 1, recentFailedLogins: 0, accountRestricted: false }, 200, requestId);
    }
    if (method === "GET" && path === "/api/auth/security/devices") {
      return ok(res, [], 200, requestId);
    }
    if (method === "GET" && path === "/api/auth/security/restriction") {
      return ok(res, { restricted: false, reason: null, until: null }, 200, requestId);
    }
    if (method === "GET" && path === "/api/auth/security/events") {
      return ok(res, [], 200, requestId);
    }
    return ok(res, { success: true, message: "OK" }, 200, requestId);
  }

  fail(res, 404, "not_found", "Auth endpoint not found.", false, requestId);
}

async function handleWorld(req, res, path, method, url, requestId) {
  if (method === "GET" && path === "/api/world/state") {
    return ok(
      res,
      {
        name: "Global Dominion",
        version: VERSION,
        tickCount,
        startedAt,
        serverTime: now(),
        countries: [...countries.values()],
        onlinePlayers: [...players.values()].filter((p) => p.status === "online").length,
      },
      200,
      requestId
    );
  }
  if (method === "GET" && path === "/api/world/countries") {
    return ok(res, [...countries.values()], 200, requestId);
  }
  if (method === "GET" && path.startsWith("/api/world/countries/")) {
    const cid = path.split("/").pop();
    const c = countries.get(cid);
    if (!c) return fail(res, 404, "not_found", "Country not found.", false, requestId);
    return ok(res, c, 200, requestId);
  }
  if (method === "GET" && path === "/api/world/events") {
    return ok(
      res,
      {
        items: events,
        pagination: {
          page: 1,
          pageSize: events.length,
          total: events.length,
          hasNextPage: false,
          nextCursor: null,
        },
      },
      200,
      requestId
    );
  }
  if (method === "POST" && path === "/api/world/country-selection") {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    if (!body.countryId || !countries.has(body.countryId)) {
      return fail(res, 400, "validation_error", "Valid countryId required.", false, requestId);
    }
    auth.player.countryId = body.countryId;
    auth.player.nationalityCountryId = body.countryId;
    return ok(res, { success: true, countryId: body.countryId, player: publicPlayer(auth.player) }, 200, requestId);
  }
  if (method === "POST" && path === "/api/world/subscription") {
    const body = await readBody(req).catch(() => ({}));
    return ok(res, { active: true, regions: body.regions || [], updatedAt: now() }, 200, requestId);
  }
  if (method === "GET" && path === "/api/world/heartbeat") {
    return ok(
      res,
      {
        ok: true,
        serverTime: now(),
        tickCount,
        version: VERSION,
        uptimeSeconds: Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
      },
      200,
      requestId
    );
  }
  fail(res, 404, "not_found", "World endpoint not found.", false, requestId);
}

async function handlePlayers(req, res, path, method, url, requestId) {
  const auth = getPlayerFromReq(req);

  if (method === "GET" && path === "/api/players/search") {
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const q = String(url.searchParams.get("q") || "").toLowerCase();
    const results = [...players.values()]
      .filter((p) => !q || p.username.includes(q) || p.displayName.toLowerCase().includes(q))
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        username: p.username,
        displayName: p.displayName,
        countryId: p.countryId,
        rank: p.rank,
        level: p.level,
        status: p.status,
      }));
    return ok(res, results, 200, requestId);
  }

  if (method === "POST" && path === "/api/players/jobs/apply") {
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    return ok(res, { success: true, jobId: body.jobId || null, message: "Application submitted." }, 200, requestId);
  }

  // /api/players/:id/...
  const parts = path.split("/").filter(Boolean); // api, players, ...
  if (parts.length >= 3) {
    const playerId = parts[2];
    if (method === "GET" && parts.length === 3) {
      if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
      const p = players.get(playerId);
      if (!p) return fail(res, 404, "not_found", "Player not found.", false, requestId);
      return ok(res, publicPlayer(p), 200, requestId);
    }
    if (method === "PUT" && parts.length === 3) {
      if (!auth || auth.player.id !== playerId) {
        return fail(res, 403, "forbidden", "Forbidden.", false, requestId);
      }
      const body = await readBody(req);
      if (body.displayName) auth.player.displayName = String(body.displayName).slice(0, 32);
      if (body.biography) auth.player.biography = String(body.biography).slice(0, 500);
      return ok(res, publicPlayer(auth.player), 200, requestId);
    }
    if (method === "GET" && parts[3] === "statistics") {
      const p = players.get(playerId);
      if (!p) return fail(res, 404, "not_found", "Player not found.", false, requestId);
      return ok(
        res,
        {
          playerId: p.id,
          level: p.level,
          experience: p.experience,
          prestige: p.prestige,
          reputation: p.reputation,
          wealth: p.wealth,
          warsParticipated: 0,
          companiesOwned: 0,
          electionsWon: 0,
        },
        200,
        requestId
      );
    }
    if (method === "GET" && parts[3] === "progression") {
      const p = players.get(playerId);
      if (!p) return fail(res, 404, "not_found", "Player not found.", false, requestId);
      return ok(
        res,
        {
          playerId: p.id,
          level: p.level,
          experience: p.experience,
          experienceToNextLevel: Math.max(100, p.level * 500),
          prestige: p.prestige,
          rank: p.rank,
          career: p.career,
        },
        200,
        requestId
      );
    }
    if (method === "GET" && (parts[3] === "achievements" || parts[3] === "jobs" || parts[3] === "roles")) {
      return ok(res, parts[3] === "jobs" && parts[4] === "current" ? null : [], 200, requestId);
    }
    if (method === "GET" && parts[3] === "skills") {
      return ok(
        res,
        [
          { id: "skill_leadership", name: "Leadership", level: 1, experience: 0 },
          { id: "skill_commerce", name: "Commerce", level: 1, experience: 0 },
          { id: "skill_tactics", name: "Tactics", level: 1, experience: 0 },
        ],
        200,
        requestId
      );
    }
    if (method === "POST" && parts[3] === "country") {
      if (!auth || auth.player.id !== playerId) {
        return fail(res, 403, "forbidden", "Forbidden.", false, requestId);
      }
      const body = await readBody(req);
      if (!body.countryId || !countries.has(body.countryId)) {
        return fail(res, 400, "validation_error", "Valid countryId required.", false, requestId);
      }
      auth.player.countryId = body.countryId;
      return ok(res, publicPlayer(auth.player), 200, requestId);
    }
  }

  // social stubs
  if (path.includes("/friends") || path.includes("/blocks")) {
    return ok(res, { success: true }, 200, requestId);
  }

  fail(res, 404, "not_found", "Players endpoint not found.", false, requestId);
}

async function handleEconomy(req, res, path, method, url, requestId) {
  if (method === "GET" && (path === "/api/economy/market/prices" || path === "/api/markets")) {
    return ok(res, market, 200, requestId);
  }
  if (method === "GET" && path === "/api/economy/market/orders") {
    return ok(res, [], 200, requestId);
  }
  if (method === "POST" && path === "/api/economy/market/orders") {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    return ok(
      res,
      {
        id: id("ord"),
        playerId: auth.player.id,
        symbol: body.symbol,
        side: body.side,
        quantity: body.quantity,
        price: body.price ?? null,
        status: "filled",
        createdAt: now(),
      },
      201,
      requestId
    );
  }
  if (method === "GET" && path === "/api/economy/resources") {
    const countryId = url.searchParams.get("countryId") || "country_us";
    return ok(
      res,
      resources.filter((r) => r.countryId === countryId),
      200,
      requestId
    );
  }
  if (method === "GET" && (path === "/api/economy/trade-agreements" || path === "/api/economy/investments")) {
    return ok(res, [], 200, requestId);
  }
  if (method === "POST" && path === "/api/economy/tick") {
    advanceTick();
    return ok(res, { tickCount, market }, 200, requestId);
  }
  fail(res, 404, "not_found", "Economy endpoint not found.", false, requestId);
}

async function handleMilitary(req, res, path, method, url, requestId) {
  const auth = getPlayerFromReq(req);
  if (!auth && method !== "OPTIONS") {
    // allow unauthenticated list for demo? require auth to match client
    if (!getBearer(req)) {
      // still require auth for military
    }
  }

  if (method === "GET" && path === "/api/military/units") {
    if (!getPlayerFromReq(req)) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const countryId = url.searchParams.get("countryId");
    let list = [...units.values()];
    if (countryId) list = list.filter((u) => u.countryId === countryId);
    return ok(res, list, 200, requestId);
  }
  if (method === "GET" && path.startsWith("/api/military/units/")) {
    const uid = path.split("/").pop();
    const unit = units.get(uid);
    if (!unit) return fail(res, 404, "not_found", "Unit not found.", false, requestId);
    return ok(res, unit, 200, requestId);
  }
  if (method === "GET" && path === "/api/military/bases") {
    return ok(
      res,
      [
        {
          id: "base_1",
          name: "Central Command",
          countryId: "country_us",
          location: "Capital Region",
          capacity: 50000,
          occupied: 16500,
        },
      ],
      200,
      requestId
    );
  }
  if (method === "GET" && path === "/api/military/recruitment") {
    return ok(res, { available: 1200, costPerSoldier: 50, trainingDays: 7 }, 200, requestId);
  }
  if (method === "GET" && path === "/api/military/logistics") {
    return ok(res, { supplyLevel: 88, fuelReserves: 12000, ammoReserves: 45000, medicalCapacity: 92 }, 200, requestId);
  }
  if (method === "POST" && path === "/api/military/orders") {
    const a = getPlayerFromReq(req);
    if (!a) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    if (!body.unitId || !body.orderType) {
      return fail(res, 400, "validation_error", "unitId and orderType required.", false, requestId);
    }
    return ok(
      res,
      {
        id: id("order"),
        unitId: body.unitId,
        orderType: body.orderType,
        target: body.target || null,
        status: "accepted",
        issuedBy: a.player.id,
        issuedAt: now(),
      },
      200,
      requestId
    );
  }
  if (
    method === "GET" &&
    (path === "/api/military/equipment" || path === "/api/military/deployments")
  ) {
    return ok(res, [], 200, requestId);
  }
  if (method === "POST" && path.startsWith("/api/military/personnel")) {
    return ok(res, { success: true }, 200, requestId);
  }
  fail(res, 404, "not_found", "Military endpoint not found.", false, requestId);
}

async function handleWars(req, res, path, method, requestId) {
  if (method === "GET" && path === "/api/wars/active") {
    return ok(
      res,
      wars.filter((w) => w.status === "active"),
      200,
      requestId
    );
  }
  if (method === "POST" && path === "/api/wars/declare") {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    const attacker = auth.player.countryId;
    const defender = body.defenderCountryId;
    if (!attacker || !defender) {
      return fail(res, 400, "validation_error", "attacker/defender required.", false, requestId);
    }
    if (!countries.has(defender)) {
      return fail(res, 404, "not_found", "Defender not found.", false, requestId);
    }
    const war = {
      id: id("war"),
      attackerCountryId: attacker,
      defenderCountryId: defender,
      status: "active",
      declaredAt: now(),
      declaredByPlayerId: auth.player.id,
      reason: body.reason || "Unspecified",
    };
    wars.push(war);
    const ac = countries.get(attacker);
    const dc = countries.get(defender);
    if (ac) ac.status = "at_war";
    if (dc) dc.status = "at_war";
    events.unshift({
      id: id("evt"),
      title: `War Declared: ${ac?.name || attacker} vs ${dc?.name || defender}`,
      description: war.reason,
      type: "military",
      timestamp: now(),
      countryIds: [attacker, defender],
    });
    return ok(res, war, 201, requestId);
  }
  if (
    method === "GET" &&
    (path.includes("/fronts") ||
      path.includes("/battles") ||
      path.includes("/objectives") ||
      path.includes("/territory") ||
      path.includes("/ceasefires") ||
      path.includes("/peace"))
  ) {
    return ok(res, [], 200, requestId);
  }
  fail(res, 404, "not_found", "Wars endpoint not found.", false, requestId);
}

async function handleDiplomacy(req, res, path, method, url, requestId) {
  if (method === "GET" && path === "/api/diplomacy/relation") {
    const a = url.searchParams.get("countryA");
    const b = url.searchParams.get("countryB");
    if (!a || !b) return fail(res, 400, "validation_error", "countryA and countryB required.", false, requestId);
    return ok(
      res,
      { countryA: a, countryB: b, relation: relations.get(`${a}:${b}`) ?? 0, min: -100, max: 100 },
      200,
      requestId
    );
  }
  if (method === "GET" && path === "/api/diplomacy/relations") {
    const auth = getPlayerFromReq(req);
    const countryId = url.searchParams.get("countryId") || auth?.player?.countryId;
    if (!countryId) return fail(res, 400, "validation_error", "countryId required.", false, requestId);
    const list = [...countries.values()]
      .filter((c) => c.id !== countryId)
      .map((c) => ({
        countryId: c.id,
        name: c.name,
        relation: relations.get(`${countryId}:${c.id}`) ?? 0,
      }));
    return ok(res, list, 200, requestId);
  }
  if (method === "GET" && path === "/api/diplomacy/treaties") {
    return ok(res, [], 200, requestId);
  }
  if (method === "POST" && path === "/api/diplomacy/treaties") {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    return ok(
      res,
      {
        id: id("treaty"),
        type: body.type || "trade",
        parties: body.parties || [],
        status: "proposed",
        createdAt: now(),
        proposedBy: auth.player.id,
      },
      201,
      requestId
    );
  }
  if (method === "GET" && path === "/api/diplomacy/missions") {
    return ok(res, [], 200, requestId);
  }
  fail(res, 404, "not_found", "Diplomacy endpoint not found.", false, requestId);
}

async function handleBanking(req, res, path, method, requestId) {
  const auth = getPlayerFromReq(req);
  if (method === "GET" && path === "/api/banking/banks") {
    return ok(
      res,
      [
        { id: "bank_global", name: "Global Dominion Central Bank", countryId: null, interestRate: 2.5 },
        { id: "bank_national", name: "National Commercial Bank", countryId: "country_us", interestRate: 3.1 },
      ],
      200,
      requestId
    );
  }
  if (method === "GET" && path === "/api/banking/accounts") {
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    return ok(
      res,
      accounts.filter((a) => a.playerId === auth.player.id),
      200,
      requestId
    );
  }
  if (method === "POST" && path === "/api/banking/accounts") {
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    const account = {
      id: id("acct"),
      playerId: auth.player.id,
      bankId: body.bankId || "bank_global",
      balance: 0,
      currency: body.currency || "GD$",
      createdAt: now(),
    };
    accounts.push(account);
    return ok(res, account, 201, requestId);
  }
  if (method === "POST" && path === "/api/banking/transfers") {
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    return ok(
      res,
      {
        id: id("tx"),
        fromAccountId: body.fromAccountId,
        toAccountId: body.toAccountId,
        amount: body.amount,
        status: "completed",
        createdAt: now(),
      },
      200,
      requestId
    );
  }
  if (path.includes("/loans")) {
    if (method === "GET") return ok(res, [], 200, requestId);
    if (method === "POST") {
      if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
      const body = await readBody(req);
      return ok(
        res,
        {
          id: id("loan"),
          playerId: auth.player.id,
          amount: Number(body.amount) || 0,
          termDays: Number(body.termDays) || 30,
          interestRate: 5.0,
          status: "approved",
          createdAt: now(),
        },
        201,
        requestId
      );
    }
  }
  fail(res, 404, "not_found", "Banking endpoint not found.", false, requestId);
}

async function handleCompanies(req, res, path, method, url, requestId) {
  if (method === "GET" && path === "/api/companies") {
    const ownerId = url.searchParams.get("ownerId");
    let list = companies;
    if (ownerId) list = companies.filter((c) => c.ownerPlayerId === ownerId);
    return ok(res, list, 200, requestId);
  }
  if (method === "POST" && path === "/api/companies") {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const body = await readBody(req);
    if (!body.name) return fail(res, 400, "validation_error", "name required.", false, requestId);
    if (auth.player.wealth < 500) {
      return fail(res, 400, "validation_error", "Need 500 wealth to found a company.", false, requestId);
    }
    auth.player.wealth -= 500;
    const company = {
      id: id("co"),
      name: String(body.name).slice(0, 64),
      ownerPlayerId: auth.player.id,
      countryId: body.countryId || auth.player.countryId,
      sector: body.sector || "general",
      valuation: 500,
      employees: 1,
      createdAt: now(),
    };
    companies.push(company);
    return ok(res, company, 201, requestId);
  }
  if (method === "GET" && path.startsWith("/api/companies/")) {
    const cid = path.split("/").pop();
    const company = companies.find((c) => c.id === cid);
    if (!company) return fail(res, 404, "not_found", "Company not found.", false, requestId);
    return ok(res, company, 200, requestId);
  }
  if (method === "PUT" && path.startsWith("/api/companies/")) {
    const auth = getPlayerFromReq(req);
    if (!auth) return fail(res, 401, "unauthorized", "Authentication required.", false, requestId);
    const cid = path.split("/").pop();
    const company = companies.find((c) => c.id === cid);
    if (!company) return fail(res, 404, "not_found", "Company not found.", false, requestId);
    if (company.ownerPlayerId !== auth.player.id) {
      return fail(res, 403, "forbidden", "Not the owner.", false, requestId);
    }
    const body = await readBody(req);
    if (body.name) company.name = String(body.name).slice(0, 64);
    if (body.sector) company.sector = String(body.sector);
    return ok(res, company, 200, requestId);
  }
  fail(res, 404, "not_found", "Companies endpoint not found.", false, requestId);
}

// ─── start ─────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  handle(req, res);
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/ws") {
    acceptWs(req, socket, head);
  } else {
    socket.destroy();
  }
});

setInterval(advanceTick, TICK_MS);

server.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     GLOBAL DOMINION API SERVER           ║
╠══════════════════════════════════════════╣
║  HTTP   http://localhost:${PORT}/api
║  Health http://localhost:${PORT}/health
║  WS     ws://localhost:${PORT}/ws
║  Data   ${PERSIST_FILE}
╚══════════════════════════════════════════╝
`);
});

function shutdown() {
  console.log("\n[shutdown] saving state…");
  saveState();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
