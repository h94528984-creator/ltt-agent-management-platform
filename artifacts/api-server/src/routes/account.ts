import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/auth";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/account/change-password", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
    return;
  }
  await db.update(usersTable).set({ passwordHash: hashPassword(newPassword), passwordChangedAt: new Date() }).where(eq(usersTable.id, req.userId!));
  res.json({ success: true });
});

export default router;
