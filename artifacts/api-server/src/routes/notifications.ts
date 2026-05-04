import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", async (_req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(notificationsTable.createdAt);
  res.json(notifications);
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, params.data.id))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

router.patch("/notifications/read-all", async (_req, res): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true });
  res.json({ success: true });
});

export default router;
