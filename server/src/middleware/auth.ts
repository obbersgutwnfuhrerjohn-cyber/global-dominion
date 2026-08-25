import type { Request, Response, NextFunction } from "express";
import { store, type Player, type Session } from "../data/store";
import { sendError } from "../utils/response";

export interface AuthedRequest extends Request {
  player?: Player;
  session?: Session;
}

export function optionalAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.header("Authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    const session = store.getSessionByToken(token);
    if (session) {
      const player = store.players.get(session.playerId);
      if (player) {
        req.session = session;
        req.player = player;
      }
    }
  }
  next();
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  optionalAuth(req, res, () => {
    if (!req.player || !req.session) {
      sendError(res, 401, "unauthorized", "Authentication required.");
      return;
    }
    next();
  });
}
