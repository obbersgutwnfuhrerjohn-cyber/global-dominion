import { Router } from "express";
import { store } from "../data/store";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const router = Router();

router.post("/register", (req, res) => {
  const { email, password, displayName, deviceId } = req.body ?? {};
  if (!email || !password || !displayName) {
    sendError(res, 400, "validation_error", "email, password, and displayName are required.");
    return;
  }
  if (String(password).length < 4) {
    sendError(res, 400, "validation_error", "Password must be at least 4 characters.");
    return;
  }
  try {
    const player = store.createPlayer({
      email: String(email),
      password: String(password),
      displayName: String(displayName),
    });
    const session = store.createSession(player.id, deviceId ?? null);
    sendSuccess(res, {
      success: true,
      user: store.toAuthUser(player),
      session,
      verificationRequired: false,
      message: "Account created.",
    }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      sendError(res, 409, "conflict", "An account with this email already exists.");
      return;
    }
    sendError(res, 500, "server_error", "Registration failed.", true);
  }
});

router.post("/login", (req, res) => {
  const { email, password, deviceId } = req.body ?? {};
  if (!email || !password) {
    sendError(res, 400, "validation_error", "email and password are required.");
    return;
  }
  const playerId = store.playersByEmail.get(String(email).trim().toLowerCase());
  if (!playerId) {
    sendError(res, 401, "unauthorized", "Invalid email or password.");
    return;
  }
  const player = store.players.get(playerId)!;
  if (!store.verifyPassword(player, String(password))) {
    sendError(res, 401, "unauthorized", "Invalid email or password.");
    return;
  }
  player.lastLoginAt = new Date().toISOString();
  player.status = "online";
  const session = store.createSession(player.id, deviceId ?? null);
  sendSuccess(res, {
    success: true,
    user: store.toAuthUser(player),
    session,
    verificationRequired: false,
    accountLocked: false,
    message: "Welcome back.",
  });
});

router.post("/logout", requireAuth, (req: AuthedRequest, res) => {
  if (req.session) {
    store.sessionsByToken.delete(req.session.accessToken);
    store.sessions.delete(req.session.sessionId);
  }
  if (req.player) {
    req.player.status = "offline";
  }
  sendSuccess(res, { success: true });
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) {
    sendError(res, 400, "validation_error", "refreshToken is required.");
    return;
  }
  let found: (typeof store.sessions extends Map<string, infer S> ? S : never) | null = null;
  for (const session of store.sessions.values()) {
    if (session.refreshToken === refreshToken) {
      found = session;
      break;
    }
  }
  if (!found) {
    sendError(res, 401, "unauthorized", "Invalid refresh token.");
    return;
  }
  store.sessionsByToken.delete(found.accessToken);
  store.sessions.delete(found.sessionId);
  const next = store.createSession(found.playerId, found.deviceId);
  sendSuccess(res, next);
});

router.post("/email/resend", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true, message: "Verification email sent (demo: auto-verified)." });
});

router.post("/email/verify", (req, res) => {
  const { token } = req.body ?? {};
  if (!token) {
    sendError(res, 400, "validation_error", "token is required.");
    return;
  }
  sendSuccess(res, { success: true, message: "Email verified." });
});

router.post("/password/reset-request", (req, res) => {
  const { email } = req.body ?? {};
  if (!email) {
    sendError(res, 400, "validation_error", "email is required.");
    return;
  }
  sendSuccess(res, { success: true, message: "If the account exists, a reset link was sent." });
});

router.post("/password/reset-confirm", (req, res) => {
  const { token, password } = req.body ?? {};
  if (!token || !password) {
    sendError(res, 400, "validation_error", "token and password are required.");
    return;
  }
  sendSuccess(res, { success: true, message: "Password updated." });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  sendSuccess(res, store.toAuthUser(req.player!));
});

router.get("/security/status", requireAuth, (_req, res) => {
  sendSuccess(res, {
    twoFactorEnabled: false,
    trustedDevices: 1,
    recentFailedLogins: 0,
    accountRestricted: false,
  });
});

router.get("/security/devices", requireAuth, (req: AuthedRequest, res) => {
  const devices = store.devices.filter((d) => d.playerId === req.player!.id);
  sendSuccess(res, devices);
});

router.post("/security/devices", requireAuth, (req: AuthedRequest, res) => {
  const { deviceId, platform } = req.body ?? {};
  const reg = {
    id: `dev_${Date.now().toString(36)}`,
    playerId: req.player!.id,
    deviceId: deviceId || "unknown",
    platform: platform || "unknown",
    createdAt: new Date().toISOString(),
  };
  store.devices.push(reg);
  sendSuccess(res, reg, 201);
});

router.delete("/security/devices/:deviceId", requireAuth, (req: AuthedRequest, res) => {
  const deviceId = req.params.deviceId;
  store.devices = store.devices.filter(
    (d) => !(d.playerId === req.player!.id && d.deviceId === deviceId)
  );
  sendSuccess(res, { success: true });
});

router.get("/security/restriction", requireAuth, (_req, res) => {
  sendSuccess(res, { restricted: false, reason: null, until: null });
});

router.get("/security/events", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.post("/security/report", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

router.post("/security/review", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

export default router;
