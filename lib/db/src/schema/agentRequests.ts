import { pgTable, text, serial, timestamp, integer, doublePrecision, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { agentsTable } from "./agents";

export const agentRequestsTable = pgTable("agent_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),

  // FK link to existing agent in master DB (nullable — new dealers won't have it)
  // ON DELETE SET NULL: deleting a dealer preserves historical inspection records
  agentId: integer("agent_id").references(() => agentsTable.id, { onDelete: "set null" }),

  // Entity type: agent | service_center | fixed_pos | mobile_van | inspection
  entityType: text("entity_type").notNull().default("agent"),

  // LTT Representative (employee filling the form)
  representativeName: text("representative_name").notNull(),
  representativeEmail: text("representative_email").notNull(),

  // Agent / Shop / Entity Info
  agentName: text("agent_name").notNull(),
  mobile: text("mobile").notNull(),
  landline: text("landline"),
  agentEmail: text("agent_email"),
  city: text("city").notNull(),
  fullAddress: text("full_address"),
  activityType: text("activity_type"),
  staffCount: integer("staff_count"),
  services: jsonb("services").$type<string[]>().notNull().default([]),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  locationDescription: text("location_description"),

  // Operational Readiness
  hasSignboard: boolean("has_signboard").notNull().default(false),
  hasDevices: boolean("has_devices").notNull().default(false),
  internetQuality: text("internet_quality").notNull().default("medium"),
  staffReadiness: integer("staff_readiness").notNull().default(3),

  // Market / Sales Potential
  areaTraffic: text("area_traffic").notNull().default("medium"),
  marketDensitySameCity: integer("market_density_same_city").notNull().default(0),
  marketDensitySameStreet: integer("market_density_same_street").notNull().default(0),
  transactionVolumeAdsl: integer("transaction_volume_adsl").notNull().default(0),
  transactionVolume4g: integer("transaction_volume_4g").notNull().default(0),

  // Compliance
  documentsComplete: boolean("documents_complete").notNull().default(false),
  brandIdentityCompliant: boolean("brand_identity_compliant").notNull().default(false),

  notes: text("notes"),

  // Scores
  readinessScore: integer("readiness_score").notNull().default(0),
  salesScore: integer("sales_score").notNull().default(0),
  complianceScore: integer("compliance_score").notNull().default(0),
  finalScore: integer("final_score").notNull().default(0),

  // Images: 3 categories
  sitePhotoUrls: jsonb("site_photo_urls").$type<string[]>().notNull().default([]),
  interiorPhotoUrls: jsonb("interior_photo_urls").$type<string[]>().notNull().default([]),
  equipmentPhotoUrls: jsonb("equipment_photo_urls").$type<string[]>().notNull().default([]),

  status: text("status").notNull().default("pending"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAgentRequestSchema = createInsertSchema(agentRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentRequest = z.infer<typeof insertAgentRequestSchema>;
export type AgentRequest = typeof agentRequestsTable.$inferSelect;
