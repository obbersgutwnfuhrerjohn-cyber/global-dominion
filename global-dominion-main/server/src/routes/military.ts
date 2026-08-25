import { Router } from "express";
import { store } from "../data/store";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const router = Router();

router.get("/units", requireAuth, (req: AuthedRequest, res) => {
  const countryId =
    (req.query.countryId as string) || req.player?.countryId || undefined;
  let units = [...store.units.values()];
  if (countryId) {
    units = units.filter((u) => u.countryId === countryId);
  }
  sendSuccess(res, units);
});

router.get("/units/:unitId", requireAuth, (req, res) => {
  const unit = store.units.get(req.params.unitId);
  if (!unit) {
    sendError(res, 404, "not_found", "Unit not found.");
    return;
  }
  sendSuccess(res, unit);
});

router.get("/bases", requireAuth, (_req, res) => {
  sendSuccess(res, [
    {
      id: "base_1",
      name: "Central Command",
      countryId: "country_us",
      location: "Capital Region",
      capacity: 50000,
      occupied: 16500,
    },
  ]);
});

router.get("/equipment", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/recruitment", requireAuth, (_req, res) => {
  sendSuccess(res, {
    available: 1200,
    costPerSoldier: 50,
    trainingDays: 7,
  });
});

router.post("/personnel/enlist", requireAuth, (req: AuthedRequest, res) => {
  const { amount } = req.body ?? {};
  const n = Math.max(1, Number(amount) || 1);
  sendSuccess(res, {
    success: true,
    enlisted: n,
    message: `${n} personnel enlisted (demo).`,
  });
});

router.post("/personnel/discharge", requireAuth, (req, res) => {
  sendSuccess(res, { success: true, discharged: req.body?.amount ?? 0 });
});

router.get("/deployments", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.post("/orders", requireAuth, (req: AuthedRequest, res) => {
  const { unitId, orderType, target } = req.body ?? {};
  if (!unitId || !orderType) {
    sendError(res, 400, "validation_error", "unitId and orderType are required.");
    return;
  }
  const unit = store.units.get(unitId);
  if (!unit) {
    sendError(res, 404, "not_found", "Unit not found.");
    return;
  }
  sendSuccess(res, {
    id: `order_${Date.now().toString(36)}`,
    unitId,
    orderType,
    target: target ?? null,
    status: "accepted",
    issuedBy: req.player!.id,
    issuedAt: new Date().toISOString(),
  });
});

router.get("/logistics", requireAuth, (_req, res) => {
  sendSuccess(res, {
    supplyLevel: 88,
    fuelReserves: 12000,
    ammoReserves: 45000,
    medicalCapacity: 92,
  });
});

export default router;
