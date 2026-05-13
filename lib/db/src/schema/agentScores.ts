import { pgTable, serial, timestamp, integer, doublePrecision, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentScoresTable = pgTable("agent_scores", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().unique(),
  complianceScore: doublePrecision("compliance_score").notNull().default(70),
  salesAccuracyScore: doublePrecision("sales_accuracy_score").notNull().default(70),
  salesPerformanceScore: doublePrecision("sales_performance_score").notNull().default(70),
  activityScore: doublePrecision("activity_score").notNull().default(70),
  finalScore: doublePrecision("final_score").notNull().default(70),
  riskLevel: text("risk_level").notNull().default("Medium"),
  classification: text("classification").notNull().default("Silver"),
  recommendation: text("recommendation").notNull().default(""),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAgentScoreSchema = createInsertSchema(agentScoresTable).omit({ id: true, lastUpdated: true });
export type InsertAgentScore = z.infer<typeof insertAgentScoreSchema>;
export type AgentScore = typeof agentScoresTable.$inferSelect;
