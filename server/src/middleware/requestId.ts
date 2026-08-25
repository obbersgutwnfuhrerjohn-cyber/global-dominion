import type { Request, Response, NextFunction } from "express";
import { createRequestId } from "../utils/response";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incoming = req.header("X-Request-ID");
  const requestId = incoming && incoming.length > 0 ? incoming : createRequestId();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}
