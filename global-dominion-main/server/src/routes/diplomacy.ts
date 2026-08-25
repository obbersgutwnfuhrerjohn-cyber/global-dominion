import { Router } from "express";
import { store, id } from "../data/store";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const router = Router();

const treaties: Array<{
  id: string;
  type: string;
  parties: string[];
  status: string;
  createdAt: string;
}> = [];

router.get("/relation", requireAuth, (req, res) => {
  const a = req.query.countryA as string;
  const b = req.query.countryB as string;
  if (!a || !b) {
    sendError(res, 400, "validation_error", "countryA and countryB query params required.");
    return;
  }
  const value = store.relations.get(`${a}:${b}`) ?? 0;
  sendSuccess(res, {
    countryA: a,
    countryB: b,
    relation: value,
    min: -100,
    max: 100,
  });
});

router.get("/relations", requireAuth, (req: AuthedRequest, res) => {
  const countryId =
    (req.query.countryId as string) || req.player?.countryId;
  if (!countryId) {
    sendError(res, 400, "validation_error", "countryId required.");
    return;
  }
  const list = [...store.countries.values()]
    .filter((c) => c.id !== countryId)
    .map((c) => ({
      countryId: c.id,
      name: c.name,
      relation: store.relations.get(`${countryId}:${c.id}`) ?? 0,
    }));
  sendSuccess(res, list);
});

router.get("/treaties", requireAuth, (_req, res) => {
  sendSuccess(res, treaties);
});

router.post("/treaties", requireAuth, (req: AuthedRequest, res) => {
  const { type, parties } = req.body ?? {};
  if (!type || !Array.isArray(parties) || parties.length < 2) {
    sendError(res, 400, "validation_error", "type and parties (2+) required.");
    return;
  }
  const treaty = {
    id: id("treaty"),
    type: String(type),
    parties: parties.map(String),
    status: "proposed",
    createdAt: new Date().toISOString(),
    proposedBy: req.player!.id,
  };
  treaties.push(treaty);
  sendSuccess(res, treaty, 201);
});

router.get("/missions", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

export default router;
