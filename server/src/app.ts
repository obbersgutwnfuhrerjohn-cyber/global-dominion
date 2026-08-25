import express from "express";
import cors from "cors";
import { config } from "./config";
import { requestIdMiddleware } from "./middleware/requestId";
import { sendError, sendSuccess } from "./utils/response";
import { store } from "./data/store";

import authRoutes from "./routes/auth";
import worldRoutes from "./routes/world";
import playersRoutes from "./routes/players";
import economyRoutes from "./routes/economy";
import militaryRoutes from "./routes/military";
import warsRoutes from "./routes/wars";
import diplomacyRoutes from "./routes/diplomacy";
import mapRoutes from "./routes/map";
import bankingRoutes from "./routes/banking";
import companiesRoutes from "./routes/companies";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
      credentials: true,
      exposedHeaders: ["X-Request-ID"],
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);

  // Health (no /api prefix convenience + under /api)
  app.get("/health", (_req, res) => {
    sendSuccess(res, {
      status: "ok",
      version: config.version,
      tickCount: store.tickCount,
      players: store.players.size,
      uptimeSeconds: Math.floor(
        (Date.now() - new Date(store.startedAt).getTime()) / 1000
      ),
    });
  });

  const api = express.Router();

  api.get("/", (_req, res) => {
    sendSuccess(res, {
      name: "Global Dominion API",
      version: config.version,
      docs: "See README — routes mirror mobile/src/services",
    });
  });

  api.use("/auth", authRoutes);
  api.use("/world", worldRoutes);
  api.use("/players", playersRoutes);
  api.use("/economy", economyRoutes);
  api.use("/military", militaryRoutes);
  api.use("/wars", warsRoutes);
  api.use("/diplomacy", diplomacyRoutes);
  api.use("/map", mapRoutes);
  api.use("/banking", bankingRoutes);
  api.use("/companies", companiesRoutes);

  // Resources shortcut used by some clients
  api.get("/resources/deposits", (_req, res) => {
    sendSuccess(res, []);
  });
  api.get("/resources/extraction-sites", (_req, res) => {
    sendSuccess(res, []);
  });

  // Markets alias
  api.get("/markets", (_req, res) => {
    sendSuccess(res, store.market);
  });

  app.use("/api", api);

  // 404
  app.use((_req, res) => {
    sendError(res, 404, "not_found", "Endpoint not found.");
  });

  // Error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[error]", err);
      sendError(res, 500, "server_error", err.message || "Internal server error.", true);
    }
  );

  return app;
}
