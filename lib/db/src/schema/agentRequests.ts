import { pgTable, text, serial, timestamp, integer, doublePrecision, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentRequestsTable = pgTable("agent_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  employeeName: text("employee_name").notNull(),
  employeeEmail: text("employee_email").notNull(),

  agentName: text("agent_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  agentType: text("agent_type").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  locationDescription: text("location_description"),

  hasSignboard: boolean("has_signboard").notNull().default(false),
  hasDevices: boolean("has_devices").notNull().default(false),
  internetQuality: text("internet_quality").notNull().default("medium"),
  staffReadiness: integer("staff_readiness").notNull().default(3),

  areaTraffic: text("area_traffic").notNull().default("medium"),
  nearCompetitors: text("near_competitors").notNull().default("medium"),
  dailySalesEstimate: integer("daily_sales_estimate").notNull().default(0),

  documentsComplete: boolean("documents_complete").notNull().default(false),
  brandIdentityCompliant: boolean("brand_identity_compliant").notNull().default(false),

  notes: text("notes"),

  readinessScore: integer("readiness_score").notNull().default(0),
  salesScore: integer("sales_score").notNull().default(0),
  complianceScore: integer("compliance_score").notNull().default(0),
  finalScore: integer("final_score").notNull().default(0),

  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("pending"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAgentRequestSchema = createInsertSchema(agentRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentRequest = z.infer<typeof insertAgentRequestSchema>;
export type AgentRequest = typeof agentRequestsTable.$inferSelect;
