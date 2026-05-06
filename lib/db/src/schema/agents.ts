import { pgTable, text, serial, timestamp, integer, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Channel types (نوع القناة)
export const CHANNEL_TYPES = [
  "agent_main",      // وكيل رئيسي
  "agent_sub",       // وكيل فرعي
  "service_center",  // مركز خدمات
  "fixed_pos",       // نقطة بيع ثابتة
  "mobile_van",      // سيارة بيع وخدمات متنقلة
  "peddler",         // بائع متجول
] as const;

// Services that can be offered (الخدمات المتاحة)
export const SERVICE_CODES = [
  "4G", "FWA", "ADSL", "FTTH", "eSIM", "FIXD_VOLTE", "RECHARGE",
] as const;

export type MarketPotential = {
  dailyActivations?: number;
  monthlyRenewals?: number;
  monthlySalesLyd?: number;
  dailyCustomers?: number;
  serviceDemand?: Record<string, "low" | "medium" | "high">;
  locationRating?: number; // 1–5
  hasDirectCompetitors?: boolean;
};

export type OperationalEval = {
  workingHoursCompliance?: number;       // 1–5
  stockAvailability?: number;
  customerService?: number;
  pricingCompliance?: number;
  serviceSpeed?: number;
  cleanliness?: number;
  brandingCompliance?: number;
};

export const agentsTable = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  city: text("city"),
  region: text("region"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  // legacy `type` kept for backwards compat (default "dealer"); new code uses channelType
  type: text("type").notNull().default("dealer"),
  channelType: text("channel_type").notNull().default("agent_main"),
  // إدارة / تبعية إدارية
  administrativeUnit: text("administrative_unit"),
  // المسؤول المباشر
  supervisorId: integer("supervisor_id"),
  services: jsonb("services").$type<string[]>().notNull().default([]),
  marketPotential: jsonb("market_potential").$type<MarketPotential>().notNull().default({}),
  operationalEval: jsonb("operational_eval").$type<OperationalEval>().notNull().default({}),
  contractStart: timestamp("contract_start", { withTimezone: true }),
  contractEnd: timestamp("contract_end", { withTimezone: true }),
  assignedSalesRepId: integer("assigned_sales_rep_id"),
  status: text("status").notNull().default("active"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentsTable.$inferSelect;
