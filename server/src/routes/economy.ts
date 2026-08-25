import { Router } from "express";
import { store } from "../data/store";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const router = Router();

router.get("/market/prices", optionalAuth, (_req, res) => {
  sendSuccess(res, store.market);
});

router.get("/market/orders", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.post("/market/orders", requireAuth, (req: AuthedRequest, res) => {
  const { symbol, side, quantity, price } = req.body ?? {};
  if (!symbol || !side || !quantity) {
    sendError(res, 400, "validation_error", "symbol, side, and quantity are required.");
    return;
  }
  sendSuccess(
    res,
    {
      id: `ord_${Date.now().toString(36)}`,
      playerId: req.player!.id,
      symbol,
      side,
      quantity,
      price: price ?? null,
      status: "filled",
      createdAt: new Date().toISOString(),
    },
    201
  );
});

router.get("/trade-agreements", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/investments", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/resources", optionalAuth, (req: AuthedRequest, res) => {
  const countryId =
    (req.query.countryId as string) || req.player?.countryId || "country_us";
  const list = store.resources.filter((r) => r.countryId === countryId);
  sendSuccess(res, list);
});

router.post("/tick", requireAuth, (_req, res) => {
  // Dev helper: advance economy simulation
  store.advanceEconomyTick();
  sendSuccess(res, {
    tickCount: store.tickCount,
    market: store.market,
  });
});

export default router;
