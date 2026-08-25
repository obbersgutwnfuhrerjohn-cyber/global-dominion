import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";
import { id } from "../data/store";

const router = Router();

interface BankAccount {
  id: string;
  playerId: string;
  bankId: string;
  balance: number;
  currency: string;
  createdAt: string;
}

const accounts: BankAccount[] = [];

router.get("/banks", requireAuth, (_req, res) => {
  sendSuccess(res, [
    {
      id: "bank_global",
      name: "Global Dominion Central Bank",
      countryId: null,
      interestRate: 2.5,
    },
    {
      id: "bank_national",
      name: "National Commercial Bank",
      countryId: "country_us",
      interestRate: 3.1,
    },
  ]);
});

router.get("/accounts", requireAuth, (req: AuthedRequest, res) => {
  const mine = accounts.filter((a) => a.playerId === req.player!.id);
  sendSuccess(res, mine);
});

router.post("/accounts", requireAuth, (req: AuthedRequest, res) => {
  const { bankId, currency } = req.body ?? {};
  const account: BankAccount = {
    id: id("acct"),
    playerId: req.player!.id,
    bankId: bankId || "bank_global",
    balance: 0,
    currency: currency || "GD$",
    createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  sendSuccess(res, account, 201);
});

router.post("/transfers", requireAuth, (req: AuthedRequest, res) => {
  const { fromAccountId, toAccountId, amount } = req.body ?? {};
  if (!fromAccountId || !toAccountId || !amount) {
    sendError(res, 400, "validation_error", "fromAccountId, toAccountId, amount required.");
    return;
  }
  const from = accounts.find((a) => a.id === fromAccountId && a.playerId === req.player!.id);
  const to = accounts.find((a) => a.id === toAccountId);
  if (!from || !to) {
    sendError(res, 404, "not_found", "Account not found.");
    return;
  }
  const value = Number(amount);
  if (value <= 0 || from.balance < value) {
    sendError(res, 400, "validation_error", "Insufficient funds.");
    return;
  }
  from.balance -= value;
  to.balance += value;
  sendSuccess(res, {
    id: id("tx"),
    fromAccountId,
    toAccountId,
    amount: value,
    status: "completed",
    createdAt: new Date().toISOString(),
  });
});

router.get("/loans", requireAuth, (_req, res) => {
  sendSuccess(res, []);
});

router.post("/loans", requireAuth, (req: AuthedRequest, res) => {
  const { amount, termDays } = req.body ?? {};
  sendSuccess(
    res,
    {
      id: id("loan"),
      playerId: req.player!.id,
      amount: Number(amount) || 0,
      termDays: Number(termDays) || 30,
      interestRate: 5.0,
      status: "approved",
      createdAt: new Date().toISOString(),
    },
    201
  );
});

export default router;
