import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { agentsTable } from "./agents";

// Document types
export const DOCUMENT_TYPES = [
  "license",            // ترخيص النشاط
  "commercial_record",  // السجل التجاري
  "contract",           // عقد تعاون
  "activity_card",      // بطاقة النشاط
  "tax_card",           // البطاقة الضريبية
  "chamber_membership", // عضوية الغرفة
  "other",              // مستندات أخرى
] as const;

// Document operational status — derived but persisted for fast querying
export const DOCUMENT_STATUSES = [
  "valid",          // ساري
  "expiring_soon",  // قارب على الانتهاء (≤ 30 يوم)
  "expired",        // منتهي
  "suspended",      // موقوف
] as const;

export const agentDocumentsTable = pgTable("agent_documents", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
  docType: text("doc_type").notNull(),
  docNumber: text("doc_number"),
  issuer: text("issuer"),
  issueDate: timestamp("issue_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  status: text("status").notNull().default("valid"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  notes: text("notes"),
  // notification deduplication: list of {threshold, sentAt}
  alertsSent: jsonb("alerts_sent").$type<{ threshold: number; sentAt: string }[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const documentHistoryTable = pgTable("document_history", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => agentDocumentsTable.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull(),
  action: text("action").notNull(), // created | renewed | updated | suspended | restored | file_replaced
  changedBy: integer("changed_by"),
  changedByName: text("changed_by_name"),
  previousValues: jsonb("previous_values").$type<Record<string, unknown>>().default({}),
  newValues: jsonb("new_values").$type<Record<string, unknown>>().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAgentDocumentSchema = createInsertSchema(agentDocumentsTable).omit({
  id: true, createdAt: true, updatedAt: true, alertsSent: true,
});
export type InsertAgentDocument = z.infer<typeof insertAgentDocumentSchema>;
export type AgentDocument = typeof agentDocumentsTable.$inferSelect;
export type DocumentHistory = typeof documentHistoryTable.$inferSelect;
