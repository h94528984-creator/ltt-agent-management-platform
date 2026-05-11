import { Router, type IRouter } from "express";
import { db, notificationsTable, notificationDismissalsTable } from "@workspace/db";
import { and, eq, isNull, or, inArray, type SQL } from "drizzle-orm";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

// Returns notifications for the authenticated user (including global notifications with userId=null).
// For global notifications, isRead is computed per-user via notification_dismissals.
router.get("/notifications", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const userId = req.userId!;
  const scope = or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)) as SQL;
  const rows = await db.select().from(notificationsTable).where(scope).orderBy(notificationsTable.createdAt);
  // Fetch dismissed global notification ids for this user
  const dismissed = await db
    .select({ id: notificationDismissalsTable.notificationId })
    .from(notificationDismissalsTable)
    .where(eq(notificationDismissalsTable.userId, userId));
  const dismissedSet = new Set(dismissed.map((d) => d.id));
  const result = rows.map((n) => ({
    ...n,
    isRead: n.userId === null ? dismissedSet.has(n.id) : n.isRead,
  }));
  res.json(result);
});

router.patch("/notifications/read-all", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const userId = req.userId!;
  // Mark all owned notifications as read
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  // For global notifications, insert per-user dismissal rows
  const globals = await db.select({ id: notificationsTable.id }).from(notificationsTable).where(isNull(notificationsTable.userId));
  if (globals.length > 0) {
    await db.insert(notificationDismissalsTable)
      .values(globals.map((g) => ({ notificationId: g.id, userId })))
      .onConflictDoNothing();
  }
  res.json({ success: true });
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.userId!;
  const [notification] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, params.data.id));
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  if (notification.userId === null) {
    // Global notification: record per-user dismissal
    await db.insert(notificationDismissalsTable)
      .values({ notificationId: notification.id, userId })
      .onConflictDoNothing();
    res.json({ ...notification, isRead: true });
    return;
  }
  if (notification.userId !== userId) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  const [updated] = await db.update(notificationsTable).set({ isRead: true })
    .where(and(eq(notificationsTable.id, notification.id), eq(notificationsTable.userId, userId)) as SQL)
    .returning();
  res.json(updated);
});

export default router;
