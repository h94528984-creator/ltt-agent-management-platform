import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inspectionsTable = pgTable("inspections", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  inspectorId: integer("inspector_id").notNull(),
  visitDate: timestamp("visit_date", { withTimezone: true }).notNull(),
  location: text("location"),
  violations: text("violations").array().notNull().default([]),
  notes: text("notes"),
  status: text("status").notNull().default("draft"),
  complianceScore: doublePrecision("compliance_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInspectionSchema = createInsertSchema(inspectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspectionsTable.$inferSelect;
