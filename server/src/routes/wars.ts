import { Router } from "express";
import { store, id } from "../data/store";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const router = Router();

interface War {
  id: string;
  attackerCountryId: string;
  defenderCountryId: string;
  status: "active" | "ceasefire" | "ended";
  declaredAt: string;
  declaredByPlayerId: string;
  reason: string;
}

const wars: War[] = [];

router.get("/active", requireAuth, (_req, res) => {
  sendSuccess(
    res,
    wars.filter((w) => w.status === "active")
  );
});

router.post("/declare", requireAuth, (req: AuthedRequest, res) => {
  const { defenderCountryId, reason } = req.body ?? {};
  const attacker = req.player!.countryId;
  if (!attacker || !defenderCountryId) {
    sendError(res, 400, "validation_error", "attacker and defender country required.");
    return;
  }
  if (attacker === defenderCountryId) {
    sendError(res, 400, "validation_error", "Cannot declare war on your own country.");
    return;
  }
  if (!store.countries.has(defenderCountryId)) {
    sendError(res, 404, "not_found", "Defender country not found.");
    return;
  }
  const existing = wars.find(
    (w) =>
      w.status === "active" &&
      ((w.attackerCountryId === attacker && w.defenderCountryId === defenderCountryId) ||
        (w.attackerCountryId === defenderCountryId && w.defenderCountryId === attacker))
  );
  if (existing) {
    sendError(res, 409, "conflict", "War already active between these nations.");
    return;
  }
  const war: War = {
    id: id("war"),
    attackerCountryId: attacker,
    defenderCountryId,
    status: "active",
    declaredAt: new Date().toISOString(),
    declaredByPlayerId: req.player!.id,
    reason: reason || "Unspecified",
  };
  wars.push(war);

  const attackerCountry = store.countries.get(attacker);
  const defenderCountry = store.countries.get(defenderCountryId);
  if (attackerCountry) attackerCountry.status = "at_war";
  if (defenderCountry) defenderCountry.status = "at_war";

  store.events.unshift({
    id: id("evt"),
    title: `War Declared: ${attackerCountry?.name ?? attacker} vs ${defenderCountry?.name ?? defenderCountryId}`,
    description: reason || "Hostilities have begun.",
    type: "military",
    timestamp: new Date().toISOString(),
    countryIds: [attacker, defenderCountryId],
  });

  sendSuccess(res, war, 201);
});

router.get("/fronts/active", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/battles", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/objectives", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/territory/contested", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/ceasefires", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/peace-treaties", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

export default router;
