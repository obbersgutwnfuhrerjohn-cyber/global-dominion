import { Router } from "express";
import { store } from "../data/store";
import { optionalAuth } from "../middleware/auth";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/countries", optionalAuth, (_req, res) => {
  const features = [...store.countries.values()].map((c) => ({
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
    // Placeholder geometry — replace with real GeoJSON later
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
  }));

  sendSuccess(res, {
    type: "FeatureCollection",
    features,
  });
});

router.post("/interactions", optionalAuth, (req, res) => {
  sendSuccess(res, {
    received: true,
    interaction: req.body ?? null,
    timestamp: new Date().toISOString(),
  });
});

export default router;
