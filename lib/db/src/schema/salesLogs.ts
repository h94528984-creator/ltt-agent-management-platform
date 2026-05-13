import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const salesLogsTable = pgTable("sales_logs", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  inspectorId: integer("inspector_id").notNull(),
  visitId: integer("visit_id"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  location: text("location"),
  rechargeCardsQty: integer("recharge_cards_qty"),
  rechargeCardsValue: doublePrecision("recharge_cards_value"),
  devicesQty: integer("devices_qty"),
  simCardsQty: integer("sim_cards_qty"),
  ftthCount: integer("ftth_count"),
  adslCount: integer("adsl_count"),
  observedDailySalesValue: doublePrecision("observed_daily_sales_value").notNull(),
  reportedSalesValue: doublePrecision("reported_sales_value").notNull(),
  variance: doublePrecision("variance").notNull().default(0),
  notes: text("notes"),
  complianceFlag: text("compliance_flag").notNull().default("OK"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSalesLogSchema = createInsertSchema(salesLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSalesLog = z.infer<typeof insertSalesLogSchema>;
export type SalesLog = typeof salesLogsTable.$inferSelect;
