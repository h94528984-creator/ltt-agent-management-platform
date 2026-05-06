import { Router, type IRouter, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../middlewares/requireAuth";
import { forceReseed } from "../lib/bootstrapData";

const router: IRouter = Router();

router.post(
  "/admin/reseed",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const [user] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!));
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Forbidden — admin only" });
      return;
    }
    try {
      const counts = await forceReseed();
      res.json({ ok: true, counts });
    } catch (err) {
      req.log.error({ err }, "Reseed endpoint failed");
      res.status(500).json({ error: "Reseed failed" });
    }
  },
);

export default router;
