import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import { db, agentDocumentsTable, documentHistoryTable, agentsTable, notificationsTable, DOCUMENT_TYPES, DOCUMENT_STATUSES } from "@workspace/db";
import { eq, desc, and, sql, inArray, lte, gte, isNotNull, type SQL } from "drizzle-orm";
import * as zod from "zod";

const router: IRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads", "documents");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only jpg, png, pdf files allowed"));
  },
});

const docTypeEnum = zod.enum(DOCUMENT_TYPES);
const docStatusEnum = zod.enum(DOCUMENT_STATUSES);

const createBody = zod.object({
  agentId: zod.coerce.number().int().positive(),
  docType: docTypeEnum,
  docNumber: zod.string().nullish(),
  issuer: zod.string().nullish(),
  issueDate: zod.string().nullish(),
  expiryDate: zod.string().nullish(),
  notes: zod.string().nullish(),
  status: docStatusEnum.optional(),
});

const updateBody = createBody.partial();

function computeStatus(expiryDate: Date | null, manual?: string): "valid" | "expiring_soon" | "expired" | "suspended" {
  if (manual === "suspended") return "suspended";
  if (!expiryDate) return "valid";
  const now = Date.now();
  const exp = expiryDate.getTime();
  const daysLeft = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring_soon";
  return "valid";
}

function basePath() { return process.env["BASE_PATH"] ?? "/api"; }

// ─── List + filters ───────────────────────────────────────────────────────
router.get("/documents", async (req, res): Promise<void> => {
  try {
    const { agentId, status, docType, expiringWithin } = req.query as Record<string, string>;
    const conds: SQL[] = [];
    if (agentId) conds.push(eq(agentDocumentsTable.agentId, parseInt(agentId)));
    if (status) conds.push(eq(agentDocumentsTable.status, status));
    if (docType) conds.push(eq(agentDocumentsTable.docType, docType));
    if (expiringWithin) {
      const days = parseInt(expiringWithin) || 30;
      const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      conds.push(isNotNull(agentDocumentsTable.expiryDate));
      conds.push(lte(agentDocumentsTable.expiryDate, cutoff));
      conds.push(gte(agentDocumentsTable.expiryDate, new Date()));
    }
    const rows = await db
      .select({
        id: agentDocumentsTable.id,
        agentId: agentDocumentsTable.agentId,
        agentName: agentsTable.name,
        agentCity: agentsTable.city,
        agentChannelType: agentsTable.channelType,
        docType: agentDocumentsTable.docType,
        docNumber: agentDocumentsTable.docNumber,
        issuer: agentDocumentsTable.issuer,
        issueDate: agentDocumentsTable.issueDate,
        expiryDate: agentDocumentsTable.expiryDate,
        status: agentDocumentsTable.status,
        fileUrl: agentDocumentsTable.fileUrl,
        fileName: agentDocumentsTable.fileName,
        notes: agentDocumentsTable.notes,
        createdAt: agentDocumentsTable.createdAt,
        updatedAt: agentDocumentsTable.updatedAt,
      })
      .from(agentDocumentsTable)
      .leftJoin(agentsTable, eq(agentDocumentsTable.agentId, agentsTable.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(agentDocumentsTable.expiryDate));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list documents");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Summary for dashboard ────────────────────────────────────────────────
router.get("/documents/summary", async (_req, res): Promise<void> => {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      valid: sql<number>`COUNT(*) FILTER (WHERE status = 'valid')`,
      expiringSoon: sql<number>`COUNT(*) FILTER (WHERE status = 'expiring_soon')`,
      expired: sql<number>`COUNT(*) FILTER (WHERE status = 'expired')`,
      suspended: sql<number>`COUNT(*) FILTER (WHERE status = 'suspended')`,
    })
    .from(agentDocumentsTable);
  res.json({
    total: Number(row?.total ?? 0),
    valid: Number(row?.valid ?? 0),
    expiringSoon: Number(row?.expiringSoon ?? 0),
    expired: Number(row?.expired ?? 0),
    suspended: Number(row?.suspended ?? 0),
  });
});

// ─── Per-agent compliance status (for badges) ─────────────────────────────
router.get("/documents/agent-status", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      agentId: agentDocumentsTable.agentId,
      hasExpired: sql<number>`COUNT(*) FILTER (WHERE status = 'expired')`,
      hasExpiringSoon: sql<number>`COUNT(*) FILTER (WHERE status = 'expiring_soon')`,
      hasSuspended: sql<number>`COUNT(*) FILTER (WHERE status = 'suspended')`,
      total: sql<number>`COUNT(*)`,
    })
    .from(agentDocumentsTable)
    .groupBy(agentDocumentsTable.agentId);
  res.json(rows.map(r => ({
    agentId: r.agentId,
    hasExpired: Number(r.hasExpired) > 0,
    hasExpiringSoon: Number(r.hasExpiringSoon) > 0,
    hasSuspended: Number(r.hasSuspended) > 0,
    total: Number(r.total),
  })));
});

// ─── Refresh statuses for all docs (cron-like) ────────────────────────────
router.post("/documents/refresh-status", async (_req, res): Promise<void> => {
  const docs = await db.select().from(agentDocumentsTable);
  let updated = 0;
  for (const d of docs) {
    if (d.status === "suspended") continue;
    const newStatus = computeStatus(d.expiryDate, d.status);
    if (newStatus !== d.status) {
      await db.update(agentDocumentsTable).set({ status: newStatus }).where(eq(agentDocumentsTable.id, d.id));
      updated++;
    }
  }
  res.json({ checked: docs.length, updated });
});

// ─── Get one ──────────────────────────────────────────────────────────────
router.get("/documents/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "معرف غير صالح" }); return; }
  const [doc] = await db.select().from(agentDocumentsTable).where(eq(agentDocumentsTable.id, id));
  if (!doc) { res.status(404).json({ error: "غير موجود" }); return; }
  const history = await db
    .select()
    .from(documentHistoryTable)
    .where(eq(documentHistoryTable.documentId, id))
    .orderBy(desc(documentHistoryTable.createdAt));
  res.json({ ...doc, history });
});

// ─── Create ───────────────────────────────────────────────────────────────
router.post("/documents", upload.single("file"), async (req, res): Promise<void> => {
  try {
    const parsed = createBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const d = parsed.data;
    const issue = d.issueDate ? new Date(d.issueDate) : null;
    const expiry = d.expiryDate ? new Date(d.expiryDate) : null;
    const status = computeStatus(expiry, d.status);
    const file = req.file;
    const fileUrl = file ? `${basePath()}/documents/files/${file.filename}` : null;
    const [doc] = await db.insert(agentDocumentsTable).values({
      agentId: d.agentId,
      docType: d.docType,
      docNumber: d.docNumber ?? null,
      issuer: d.issuer ?? null,
      issueDate: issue,
      expiryDate: expiry,
      status,
      fileUrl,
      fileName: file?.originalname ?? null,
      notes: d.notes ?? null,
    }).returning();
    await db.insert(documentHistoryTable).values({
      documentId: doc.id,
      agentId: doc.agentId,
      action: "created",
      newValues: doc as unknown as Record<string, unknown>,
    });
    res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to create document");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Update ───────────────────────────────────────────────────────────────
router.patch("/documents/:id", upload.single("file"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(String(req.params["id"] ?? ""));
    if (isNaN(id)) { res.status(400).json({ error: "معرف غير صالح" }); return; }
    const parsed = updateBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const [prev] = await db.select().from(agentDocumentsTable).where(eq(agentDocumentsTable.id, id));
    if (!prev) { res.status(404).json({ error: "غير موجود" }); return; }
    const d = parsed.data;
    const expiry = d.expiryDate !== undefined ? (d.expiryDate ? new Date(d.expiryDate) : null) : prev.expiryDate;
    const issue = d.issueDate !== undefined ? (d.issueDate ? new Date(d.issueDate) : null) : prev.issueDate;
    const status = computeStatus(expiry, d.status ?? prev.status);
    const file = req.file;
    const update: Record<string, unknown> = {};
    if (d.docType !== undefined) update.docType = d.docType;
    if (d.docNumber !== undefined) update.docNumber = d.docNumber;
    if (d.issuer !== undefined) update.issuer = d.issuer;
    if (d.issueDate !== undefined) update.issueDate = issue;
    if (d.expiryDate !== undefined) update.expiryDate = expiry;
    if (d.notes !== undefined) update.notes = d.notes;
    update.status = status;
    if (file) {
      update.fileUrl = `${basePath()}/documents/files/${file.filename}`;
      update.fileName = file.originalname;
    }
    if (expiry && prev.expiryDate && expiry.getTime() !== prev.expiryDate.getTime()) {
      update.alertsSent = []; // reset alert ledger on renewal
    }
    const [doc] = await db.update(agentDocumentsTable).set(update).where(eq(agentDocumentsTable.id, id)).returning();
    const action = file ? "file_replaced" : (expiry && prev.expiryDate && expiry > prev.expiryDate ? "renewed" : "updated");
    await db.insert(documentHistoryTable).values({
      documentId: id,
      agentId: prev.agentId,
      action,
      previousValues: prev as unknown as Record<string, unknown>,
      newValues: doc as unknown as Record<string, unknown>,
    });
    res.json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to update document");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Delete ───────────────────────────────────────────────────────────────
router.delete("/documents/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "معرف غير صالح" }); return; }
  await db.delete(agentDocumentsTable).where(eq(agentDocumentsTable.id, id));
  res.sendStatus(204);
});

// ─── Bulk: list agents whose operational status is impacted ──────────────
// (any agent with at least one expired doc of license/commercial_record/contract)
router.get("/documents/non-compliant-agents", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ agentId: agentDocumentsTable.agentId })
    .from(agentDocumentsTable)
    .where(and(
      eq(agentDocumentsTable.status, "expired"),
      inArray(agentDocumentsTable.docType, ["license", "commercial_record", "contract"]),
    ));
  res.json(rows.map(r => r.agentId));
});

// ─── Monthly recurring alerts: create notifications for docs whose status is
//      expiring_soon or expired, throttled to once per 30 days per document.
//      Safe to call repeatedly; uses alertsSent ledger for dedup.
export async function runMonthlyDocumentAlerts(): Promise<{ created: number; checked: number; refreshed: number }> {
  // 1) Refresh persisted statuses from expiryDate so cards stay accurate
  const allDocs = await db.select().from(agentDocumentsTable);
  let refreshed = 0;
  for (const d of allDocs) {
    if (d.status === "suspended") continue;
    const newStatus = computeStatus(d.expiryDate, d.status);
    if (newStatus !== d.status) {
      await db.update(agentDocumentsTable).set({ status: newStatus }).where(eq(agentDocumentsTable.id, d.id));
      refreshed++;
    }
  }

  // 2) Compute eligibility from expiryDate directly (independent of persisted status)
  const docs = await db
    .select({
      id: agentDocumentsTable.id,
      agentId: agentDocumentsTable.agentId,
      docType: agentDocumentsTable.docType,
      expiryDate: agentDocumentsTable.expiryDate,
      status: agentDocumentsTable.status,
      alertsSent: agentDocumentsTable.alertsSent,
      agentName: agentsTable.name,
    })
    .from(agentDocumentsTable)
    .leftJoin(agentsTable, eq(agentDocumentsTable.agentId, agentsTable.id))
    .where(isNotNull(agentDocumentsTable.expiryDate));

  let created = 0;
  const now = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  for (const d of docs) {
    if (!d.expiryDate) continue;
    const days = Math.floor((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    // alert window: ≤30 days remaining, or already expired
    if (days > 30) continue;

    const ledger = d.alertsSent ?? [];
    const last = ledger[ledger.length - 1];
    if (last && now.getTime() - new Date(last.sentAt).getTime() < THIRTY_DAYS_MS) continue;

    const isExpired = days < 0;
    const title = isExpired ? "ترخيص منتهي يحتاج تجديد" : "ترخيص قارب على الانتهاء";
    const message = isExpired
      ? `الترخيص الخاص بـ "${d.agentName ?? "وكيل"}" منتهي منذ ${Math.abs(days)} يوم. يجب التجديد فوراً.`
      : `الترخيص الخاص بـ "${d.agentName ?? "وكيل"}" سينتهي خلال ${days} يوم.`;

    await db.insert(notificationsTable).values({
      userId: null,
      type: isExpired ? "document_expired" : "document_expiring",
      title,
      message,
      entityType: "agent_document",
      entityId: d.id,
    });

    await db.update(agentDocumentsTable)
      .set({ alertsSent: [...ledger, { threshold: days, sentAt: now.toISOString() }] })
      .where(eq(agentDocumentsTable.id, d.id));
    created++;
  }
  return { created, checked: docs.length, refreshed };
}

router.post("/documents/run-monthly-alerts", async (req, res): Promise<void> => {
  try {
    const result = await runMonthlyDocumentAlerts();
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to run monthly alerts");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Serve uploaded files ─────────────────────────────────────────────────
router.get("/documents/files/:filename", (req, res): void => {
  const filename = req.params["filename"];
  if (!filename || filename.includes("..")) { res.status(400).json({ error: "Invalid filename" }); return; }
  res.sendFile(path.join(uploadDir, filename));
});

export default router;
