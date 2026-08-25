import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";
import { id } from "../data/store";

const router = Router();

interface Company {
  id: string;
  name: string;
  ownerPlayerId: string;
  countryId: string | null;
  sector: string;
  valuation: number;
  employees: number;
  createdAt: string;
}

const companies: Company[] = [];

router.get("/", requireAuth, (req: AuthedRequest, res) => {
  const ownerId = req.query.ownerId as string | undefined;
  let list = companies;
  if (ownerId) {
    list = companies.filter((c) => c.ownerPlayerId === ownerId);
  }
  sendSuccess(res, list);
});

router.get("/:companyId", requireAuth, (req, res) => {
  const company = companies.find((c) => c.id === req.params.companyId);
  if (!company) {
    sendError(res, 404, "not_found", "Company not found.");
    return;
  }
  sendSuccess(res, company);
});

router.post("/", requireAuth, (req: AuthedRequest, res) => {
  const { name, sector, countryId } = req.body ?? {};
  if (!name) {
    sendError(res, 400, "validation_error", "name is required.");
    return;
  }
  if (req.player!.wealth < 500) {
    sendError(res, 400, "validation_error", "Insufficient wealth to found a company (need 500).");
    return;
  }
  req.player!.wealth -= 500;
  const company: Company = {
    id: id("co"),
    name: String(name).slice(0, 64),
    ownerPlayerId: req.player!.id,
    countryId: countryId || req.player!.countryId,
    sector: sector || "general",
    valuation: 500,
    employees: 1,
    createdAt: new Date().toISOString(),
  };
  companies.push(company);
  sendSuccess(res, company, 201);
});

router.put("/:companyId", requireAuth, (req: AuthedRequest, res) => {
  const company = companies.find((c) => c.id === req.params.companyId);
  if (!company) {
    sendError(res, 404, "not_found", "Company not found.");
    return;
  }
  if (company.ownerPlayerId !== req.player!.id) {
    sendError(res, 403, "forbidden", "Not the owner.");
    return;
  }
  if (req.body?.name) company.name = String(req.body.name).slice(0, 64);
  if (req.body?.sector) company.sector = String(req.body.sector);
  sendSuccess(res, company);
});

export default router;
