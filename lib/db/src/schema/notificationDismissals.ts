import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const notificationDismissalsTable = pgTable("notification_dismissals", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull(),
  userId: integer("user_id").notNull(),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex("notif_dismissal_uniq").on(t.notificationId, t.userId),
}));

export type NotificationDismissal = typeof notificationDismissalsTable.$inferSelect;
