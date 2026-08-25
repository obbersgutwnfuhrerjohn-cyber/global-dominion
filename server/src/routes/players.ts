import { Router } from "express";
import { store } from "../data/store";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const router = Router();

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  sendSuccess(res, store.toPublicPlayer(req.player!));
});

router.get("/search", requireAuth, (req, res) => {
  const q = String(req.query.q || "").toLowerCase().trim();
  const results = [...store.players.values()]
    .filter(
      (p) =>
        !q ||
        p.username.includes(q) ||
        p.displayName.toLowerCase().includes(q)
    )
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.displayName,
      profileImageUrl: p.profileImageUrl,
      countryId: p.countryId,
      rank: p.rank,
      level: p.level,
      status: p.status,
    }));
  sendSuccess(res, results);
});

router.get("/:playerId", requireAuth, (req, res) => {
  const player = store.players.get(req.params.playerId);
  if (!player) {
    sendError(res, 404, "not_found", "Player not found.");
    return;
  }
  sendSuccess(res, store.toPublicPlayer(player));
});

router.put("/:playerId", requireAuth, (req: AuthedRequest, res) => {
  if (req.params.playerId !== req.player!.id) {
    sendError(res, 403, "forbidden", "You can only update your own profile.");
    return;
  }
  const { displayName, biography } = req.body ?? {};
  if (displayName != null) {
    req.player!.displayName = String(displayName).slice(0, 32);
  }
  if (biography != null) {
    req.player!.biography = String(biography).slice(0, 500);
  }
  sendSuccess(res, store.toPublicPlayer(req.player!));
});

router.post("/:playerId/country", requireAuth, (req: AuthedRequest, res) => {
  if (req.params.playerId !== req.player!.id) {
    sendError(res, 403, "forbidden", "Forbidden.");
    return;
  }
  const { countryId } = req.body ?? {};
  if (!countryId || !store.countries.has(countryId)) {
    sendError(res, 400, "validation_error", "Valid countryId required.");
    return;
  }
  req.player!.countryId = countryId;
  sendSuccess(res, store.toPublicPlayer(req.player!));
});

router.get("/:playerId/statistics", requireAuth, (req, res) => {
  const player = store.players.get(req.params.playerId);
  if (!player) {
    sendError(res, 404, "not_found", "Player not found.");
    return;
  }
  sendSuccess(res, {
    playerId: player.id,
    level: player.level,
    experience: player.experience,
    prestige: player.prestige,
    reputation: player.reputation,
    wealth: player.wealth,
    warsParticipated: 0,
    companiesOwned: 0,
    electionsWon: 0,
  });
});

router.get("/:playerId/progression", requireAuth, (req, res) => {
  const player = store.players.get(req.params.playerId);
  if (!player) {
    sendError(res, 404, "not_found", "Player not found.");
    return;
  }
  sendSuccess(res, {
    playerId: player.id,
    level: player.level,
    experience: player.experience,
    experienceToNextLevel: Math.max(100, player.level * 500),
    prestige: player.prestige,
    rank: player.rank,
    career: player.career,
  });
});

router.get("/:playerId/achievements", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/:playerId/skills", requireAuth, (_req, res) => {
  sendSuccess(res, [
    { id: "skill_leadership", name: "Leadership", level: 1, experience: 0 },
    { id: "skill_commerce", name: "Commerce", level: 1, experience: 0 },
    { id: "skill_tactics", name: "Tactics", level: 1, experience: 0 },
  ]);
});

router.post("/:playerId/skills/:skillId/upgrade", requireAuth, (req: AuthedRequest, res) => {
  if (req.params.playerId !== req.player!.id) {
    sendError(res, 403, "forbidden", "Forbidden.");
    return;
  }
  sendSuccess(res, {
    id: req.params.skillId,
    name: req.params.skillId,
    level: 2,
    experience: 0,
  });
});

router.get("/:playerId/jobs", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.get("/:playerId/jobs/current", requireAuth, (_req, res) => {
  sendSuccess(res, null);
});

router.post("/jobs/apply", requireAuth, (req, res) => {
  const { jobId } = req.body ?? {};
  sendSuccess(res, {
    success: true,
    jobId: jobId || null,
    message: "Application submitted (demo).",
  });
});

router.post("/jobs/:jobId/leave", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

router.get("/:playerId/roles", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

// Social stubs
router.post("/friends/requests", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

router.post("/friends/remove", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

router.post("/blocks", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

router.post("/blocks/remove", requireAuth, (_req, res) => {
  sendSuccess(res, { success: true });
});

export default router;
