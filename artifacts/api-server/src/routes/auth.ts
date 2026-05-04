import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";
import { LoginBody } from "@workspace/api-zod";
import type { AuthenticatedRequest } from "../middlewares/requireAuth";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (!user.isActive) {
    res.status(401).json({ error: "Account is inactive" });
    return;
  }
  const token = generateToken(user.id);
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

export default router;
