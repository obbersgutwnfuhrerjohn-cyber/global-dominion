import { Router } from "express";
import { store } from "../data/store";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";
import { config } from "../config";

const router = Router();

router.get("/state", optionalAuth, (_req, res) => {
  const countries = [...store.countries.values()].map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    capital: c.capital,
    status: c.status,
    population: c.population,
    gdp: c.gdp,
    government: c.government,
    stability: c.stability,
    militaryStrength: c.militaryStrength,
    color: c.color,
  }));

  sendSuccess(res, {
    name: config.worldName,
    version: config.version,
    tickCount: store.tickCount,
    startedAt: store.startedAt,
    serverTime: new Date().toISOString(),
    countries,
    onlinePlayers: [...store.players.values()].filter((p) => p.status === "online").length,
  });
});

router.get("/countries", (_req, res) => {
  const list = [...store.countries.values()].map((c) => ({
    id: c.id,
    countryId: c.id,
    name: c.name,
    code: c.code,
    capital: c.capital,
    population: c.population,
    gdp: c.gdp,
    government: c.government,
    status: c.status,
    treasury: c.treasury,
    militaryStrength: c.militaryStrength,
    stability: c.stability,
    color: c.color,
  }));
  sendSuccess(res, list);
});

router.get("/countries/:countryId", (req, res) => {
  const country = store.countries.get(req.params.countryId);
  if (!country) {
    sendError(res, 404, "not_found", "Country not found.");
    return;
  }
  sendSuccess(res, country);
});

router.get("/events", (_req, res) => {
  sendSuccess(res, {
    items: store.events,
    pagination: {
      page: 1,
      pageSize: store.events.length,
      total: store.events.length,
      hasNextPage: false,
      nextCursor: null,
    },
  });
});

router.post("/country-selection", requireAuth, (req: AuthedRequest, res) => {
  const { countryId } = req.body ?? {};
  if (!countryId || !store.countries.has(countryId)) {
    sendError(res, 400, "validation_error", "Valid countryId is required.");
    return;
  }
  req.player!.countryId = countryId;
  req.player!.nationalityCountryId = countryId;
  sendSuccess(res, {
    success: true,
    countryId,
    player: store.toPublicPlayer(req.player!),
  });
});

router.post("/subscription", requireAuth, (req, res) => {
  // Client can send map viewport / interested regions — acknowledge for now
  sendSuccess(res, {
    active: true,
    regions: req.body?.regions ?? [],
    updatedAt: new Date().toISOString(),
  });
});

router.get("/heartbeat", (_req, res) => {
  sendSuccess(res, {
    ok: true,
    serverTime: new Date().toISOString(),
    tickCount: store.tickCount,
    version: config.version,
    uptimeSeconds: Math.floor(
      (Date.now() - new Date(store.startedAt).getTime()) / 1000
    ),
  });
});

export default router;
