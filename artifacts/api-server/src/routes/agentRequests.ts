import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { db, agentRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads", "agent-requests");
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
  limits: { fileSize: 5 * 1024 * 1024, files: 15 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only jpg, png, pdf files allowed"));
  },
});

const uploadFields = upload.fields([
  { name: "sitePhotos", maxCount: 5 },
  { name: "interiorPhotos", maxCount: 5 },
  { name: "equipmentPhotos", maxCount: 5 },
]);

function generateRequestId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `LTT-${date}-${rand}`;
}

function calcReadinessScore(data: {
  hasSignboard: boolean;
  hasDevices: boolean;
  internetQuality: string;
  staffReadiness: number;
}): number {
  let score = 0;
  if (data.hasSignboard) score += 25;
  if (data.hasDevices) score += 25;
  if (data.internetQuality === "good") score += 30;
  else if (data.internetQuality === "medium") score += 15;
  score += Math.round((data.staffReadiness / 5) * 20);
  return Math.min(100, score);
}

function calcSalesScore(data: {
  areaTraffic: string;
  marketDensitySameStreet: number;
  transactionVolumeAdsl: number;
  transactionVolume4g: number;
}): number {
  let score = 0;

  if (data.areaTraffic === "high") score += 40;
  else if (data.areaTraffic === "medium") score += 25;
  else score += 10;

  // Fewer competitors on same street = better
  const street = data.marketDensitySameStreet;
  if (street === 0) score += 30;
  else if (street === 1) score += 22;
  else if (street === 2) score += 15;
  else if (street <= 4) score += 8;
  else score += 3;

  // Transaction volume (ADSL + 4G combined)
  const totalTx = (data.transactionVolumeAdsl || 0) + (data.transactionVolume4g || 0);
  if (totalTx >= 1000) score += 30;
  else if (totalTx >= 500) score += 22;
  else if (totalTx >= 200) score += 15;
  else if (totalTx >= 50) score += 8;
  else score += 3;

  return Math.min(100, score);
}

function calcComplianceScore(data: {
  documentsComplete: boolean;
  brandIdentityCompliant: boolean;
}): number {
  return (data.documentsComplete ? 50 : 0) + (data.brandIdentityCompliant ? 50 : 0);
}

async function sendEmail(requestId: string, representativeName: string, data: Record<string, unknown>, finalScore: number) {
  const smtpHost = process.env["SMTP_HOST"];
  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];
  const smtpPort = parseInt(process.env["SMTP_PORT"] ?? "587");

  const emailBody = `
طلب إنشاء وكيل جديد
====================
رقم الطلب: ${requestId}
المندوب: ${representativeName}
التاريخ: ${new Date().toLocaleString("ar-LY")}

بيانات الوكيل:
- الاسم: ${data["agentName"]}
- الجوال: ${data["mobile"]}
- الهاتف الثابت: ${data["landline"] ?? "—"}
- البريد الإلكتروني: ${data["agentEmail"] ?? "—"}
- المدينة: ${data["city"]}
- العنوان الكامل: ${data["fullAddress"] ?? "—"}
- نوع النشاط: ${data["activityType"]}
- إحداثيات الموقع: ${data["latitude"] ?? "غير محدد"}, ${data["longitude"] ?? "غير محدد"}

الجاهزية التشغيلية:
- لوحة إعلانية: ${data["hasSignboard"] === "true" ? "نعم" : "لا"}
- أجهزة: ${data["hasDevices"] === "true" ? "نعم" : "لا"}
- جودة الإنترنت: ${data["internetQuality"]}
- جاهزية الموظفين: ${data["staffReadiness"]}/5

إمكانية السوق:
- حركة المنطقة: ${data["areaTraffic"]}
- عدد المنافسين في المدينة: ${data["marketDensitySameCity"]}
- عدد المنافسين في الشارع: ${data["marketDensitySameStreet"]}
- حجم معاملات ADSL (شهري): ${data["transactionVolumeAdsl"]}
- حجم معاملات 4G (شهري): ${data["transactionVolume4g"]}

الامتثال:
- مستندات مكتملة: ${data["documentsComplete"] === "true" ? "نعم" : "لا"}
- الهوية البصرية: ${data["brandIdentityCompliant"] === "true" ? "نعم" : "لا"}

الملاحظات: ${data["notes"] ?? "لا يوجد"}

النتيجة النهائية: ${finalScore}/100
`;

  if (!smtpHost || !smtpUser || !smtpPass) {
    logger.info({ requestId, finalScore }, "Email would be sent (SMTP not configured):\n" + emailBody);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost, port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"منصة LTT" <${smtpUser}>`,
    to: ["y.rahuma@ltt.ly", "s.zawia@ltt.ly"],
    subject: `طلب إنشاء وكيل جديد - ${requestId} - ${data["agentName"]}`,
    text: emailBody,
  });
}

// POST /api/agent-request — public, no auth required
router.post("/agent-request", uploadFields, async (req, res): Promise<void> => {
  try {
    const body = req.body as Record<string, string>;
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const {
      representativeName, representativeEmail,
      agentName, mobile, landline, agentEmail, city, fullAddress, activityType,
      latitude, longitude, locationDescription,
      hasSignboard, hasDevices, internetQuality, staffReadiness,
      areaTraffic, marketDensitySameCity, marketDensitySameStreet,
      transactionVolumeAdsl, transactionVolume4g,
      documentsComplete, brandIdentityCompliant, notes,
    } = body;

    if (!representativeName || !agentName || !mobile || !city || !activityType) {
      res.status(400).json({ error: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    const parsedHasSignboard = hasSignboard === "true";
    const parsedHasDevices = hasDevices === "true";
    const parsedDocumentsComplete = documentsComplete === "true";
    const parsedBrandIdentityCompliant = brandIdentityCompliant === "true";
    const parsedStaffReadiness = parseInt(staffReadiness ?? "3") || 3;
    const parsedMarketCity = parseInt(marketDensitySameCity ?? "0") || 0;
    const parsedMarketStreet = parseInt(marketDensitySameStreet ?? "0") || 0;
    const parsedTxAdsl = parseInt(transactionVolumeAdsl ?? "0") || 0;
    const parsedTx4g = parseInt(transactionVolume4g ?? "0") || 0;

    const readinessScore = calcReadinessScore({
      hasSignboard: parsedHasSignboard,
      hasDevices: parsedHasDevices,
      internetQuality: internetQuality ?? "medium",
      staffReadiness: parsedStaffReadiness,
    });

    const salesScore = calcSalesScore({
      areaTraffic: areaTraffic ?? "medium",
      marketDensitySameStreet: parsedMarketStreet,
      transactionVolumeAdsl: parsedTxAdsl,
      transactionVolume4g: parsedTx4g,
    });

    const complianceScore = calcComplianceScore({
      documentsComplete: parsedDocumentsComplete,
      brandIdentityCompliant: parsedBrandIdentityCompliant,
    });

    const finalScore = Math.round(0.4 * readinessScore + 0.35 * salesScore + 0.25 * complianceScore);
    const requestId = generateRequestId();

    const basePath = process.env["BASE_PATH"] ?? "/api";
    const toUrls = (arr: Express.Multer.File[] | undefined) =>
      (arr ?? []).map(f => `${basePath}/agent-request/uploads/${f.filename}`);

    const sitePhotoUrls = toUrls(files?.["sitePhotos"]);
    const interiorPhotoUrls = toUrls(files?.["interiorPhotos"]);
    const equipmentPhotoUrls = toUrls(files?.["equipmentPhotos"]);

    const [saved] = await db.insert(agentRequestsTable).values({
      requestId,
      representativeName,
      representativeEmail: representativeEmail ?? `${representativeName.replace(/\s/g, ".")}@ltt.ly`,
      agentName,
      mobile,
      landline: landline ?? undefined,
      agentEmail: agentEmail ?? undefined,
      city,
      fullAddress: fullAddress ?? undefined,
      activityType,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      locationDescription: locationDescription ?? undefined,
      hasSignboard: parsedHasSignboard,
      hasDevices: parsedHasDevices,
      internetQuality: internetQuality ?? "medium",
      staffReadiness: parsedStaffReadiness,
      areaTraffic: areaTraffic ?? "medium",
      marketDensitySameCity: parsedMarketCity,
      marketDensitySameStreet: parsedMarketStreet,
      transactionVolumeAdsl: parsedTxAdsl,
      transactionVolume4g: parsedTx4g,
      documentsComplete: parsedDocumentsComplete,
      brandIdentityCompliant: parsedBrandIdentityCompliant,
      notes: notes ?? undefined,
      readinessScore,
      salesScore,
      complianceScore,
      finalScore,
      sitePhotoUrls,
      interiorPhotoUrls,
      equipmentPhotoUrls,
    }).returning();

    sendEmail(requestId, representativeName, body, finalScore).catch(err => {
      logger.error({ err }, "Failed to send email");
    });

    res.status(201).json(saved);
  } catch (err) {
    req.log.error({ err }, "Failed to save agent request");
    res.status(500).json({ error: "حدث خطأ، يرجى المحاولة مجددًا" });
  }
});

// POST /api/agent-requests — JSON body, supports company entity types
// (service_center / fixed_pos / mobile_van / agent / inspection)
router.post("/agent-requests", async (req, res): Promise<void> => {
  try {
    const b = req.body as Record<string, unknown>;
    const entityType = String(b["entityType"] ?? "agent");
    const allowedTypes = ["agent", "service_center", "fixed_pos", "mobile_van", "inspection"];
    if (!allowedTypes.includes(entityType)) {
      res.status(400).json({ error: "نوع الكيان غير صالح" }); return;
    }

    // Support both schemas: company entity (entityName/responsibleEmployee/employeePhone/address)
    // and agent (agentName/representativeName/mobile/fullAddress).
    const agentName = String(b["entityName"] ?? b["agentName"] ?? "").trim();
    const representativeName = String(b["responsibleEmployee"] ?? b["representativeName"] ?? "").trim();
    const mobile = String(b["employeePhone"] ?? b["mobile"] ?? "").trim();
    const city = String(b["city"] ?? "").trim();
    const fullAddress = b["address"] ?? b["fullAddress"] ?? null;

    if (!agentName || !representativeName || !mobile || !city) {
      res.status(400).json({ error: "حقول مطلوبة ناقصة (الاسم/المسؤول/الهاتف/المدينة)" });
      return;
    }

    const services = Array.isArray(b["services"]) ? (b["services"] as string[]) : [];
    const lat = b["latitude"] != null ? Number(b["latitude"]) : null;
    const lng = b["longitude"] != null ? Number(b["longitude"]) : null;
    const staffCount = b["staffCount"] != null ? Number(b["staffCount"]) : null;
    const staffReadiness = b["staffReadiness"] != null ? Number(b["staffReadiness"]) : 3;

    const requestId = generateRequestId();
    const [saved] = await db.insert(agentRequestsTable).values({
      requestId,
      entityType,
      representativeName,
      representativeEmail: String(b["representativeEmail"] ?? `${representativeName.replace(/\s/g, ".")}@ltt.ly`),
      agentName,
      mobile,
      city,
      fullAddress: fullAddress ? String(fullAddress) : undefined,
      activityType: b["activityType"] ? String(b["activityType"]) : null,
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
      hasSignboard: b["hasSignboard"] === true || b["hasSignboard"] === "true",
      hasDevices: b["hasDevices"] === true || b["hasDevices"] === "true",
      internetQuality: String(b["internetQuality"] ?? "medium"),
      staffReadiness,
      staffCount: staffCount ?? undefined,
      areaTraffic: String(b["areaTraffic"] ?? "medium"),
      services,
      notes: b["notes"] ? String(b["notes"]) : undefined,
    }).returning();
    res.status(201).json(saved);
  } catch (err) {
    req.log.error({ err }, "Failed to create agent-request (json)");
    res.status(500).json({ error: "حدث خطأ، يرجى المحاولة مجددًا" });
  }
});

// GET /api/agent-requests — authenticated, list all
router.get("/agent-requests", async (req, res): Promise<void> => {
  try {
    const { status, entityType, search, limit: limitQ, offset: offsetQ } = req.query as Record<string, string>;
    const { desc, ilike, or, and } = await import("drizzle-orm");

    let query = db.select().from(agentRequestsTable).$dynamic();
    const conds = [];
    if (status && status !== "all") conds.push(eq(agentRequestsTable.status, status));
    if (entityType && entityType !== "all") conds.push(eq(agentRequestsTable.entityType, entityType));
    if (search) {
      conds.push(
        or(
          ilike(agentRequestsTable.agentName, `%${search}%`),
          ilike(agentRequestsTable.representativeName, `%${search}%`),
          ilike(agentRequestsTable.city, `%${search}%`),
          ilike(agentRequestsTable.mobile, `%${search}%`),
          ilike(agentRequestsTable.requestId, `%${search}%`),
        )!
      );
    }
    if (conds.length > 0) query = query.where(and(...conds));

    const lim = Math.min(parseInt(limitQ ?? "50") || 50, 200);
    const off = parseInt(offsetQ ?? "0") || 0;
    const rows = await query.orderBy(desc(agentRequestsTable.createdAt)).limit(lim).offset(off);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list agent requests");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// PATCH /api/agent-request/:id/status — authenticated
router.patch("/agent-request/:id/status", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params["id"] ?? "");
    if (isNaN(id)) { res.status(400).json({ error: "معرف غير صالح" }); return; }
    const { status } = req.body as { status: string };
    if (!["pending", "approved", "rejected", "cancelled"].includes(status)) {
      res.status(400).json({ error: "الحالة غير صالحة" });
      return;
    }
    const { sql } = await import("drizzle-orm");
    const [prev] = await db.select().from(agentRequestsTable).where(eq(agentRequestsTable.id, id));
    if (!prev) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    const [updated] = await db
      .update(agentRequestsTable)
      .set({ status, updatedAt: sql`NOW()` })
      .where(eq(agentRequestsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    // Broadcast to all platform users (userId=null = global) when status changes
    if (status !== prev.status) {
      const STATUS_AR: Record<string, string> = { pending: "قيد المراجعة", approved: "تمت الموافقة", rejected: "مرفوض", cancelled: "ملغى" };
      const { notificationsTable } = await import("@workspace/db");
      const label = updated.entityType === "agent" ? "طلب وكيل" : updated.entityType === "service_center" ? "مركز خدمات" : updated.entityType === "fixed_pos" ? "نقطة بيع ثابتة" : updated.entityType === "mobile_van" ? "سيارة بيع متنقلة" : "عملية تفتيش";
      try {
        await db.insert(notificationsTable).values({
          userId: null,
          type: "agent_request_status",
          title: `تحديث حالة ${label}`,
          message: `${updated.agentName} (${updated.requestId}): ${STATUS_AR[prev.status] ?? prev.status} → ${STATUS_AR[status] ?? status}`,
          entityType: "agent_request",
          entityId: updated.id,
        });
      } catch { /* ignore */ }
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update agent request status");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// PATCH /api/agent-request/:id — edit entity fields
router.patch("/agent-request/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params["id"] ?? "");
    if (isNaN(id)) { res.status(400).json({ error: "معرف غير صالح" }); return; }
    const b = req.body as Record<string, unknown>;
    const upd: Record<string, unknown> = {};
    const map: Record<string, string> = {
      entityName: "agentName", responsibleEmployee: "representativeName", employeePhone: "mobile",
      address: "fullAddress",
    };
    for (const [k, v] of Object.entries(b)) {
      if (k === "id" || k === "requestId" || k === "status" || k === "createdAt") continue;
      const col = map[k] ?? k;
      upd[col] = v;
    }
    const { sql } = await import("drizzle-orm");
    upd["updatedAt"] = sql`NOW()`;
    const [updated] = await db
      .update(agentRequestsTable)
      .set(upd)
      .where(eq(agentRequestsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update agent request");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// GET /api/agent-request/:requestId — public
router.get("/agent-request/:requestId", async (req, res): Promise<void> => {
  const { requestId } = req.params;
  const [record] = await db.select().from(agentRequestsTable).where(eq(agentRequestsTable.requestId, requestId));
  if (!record) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  res.json(record);
});

// Serve uploaded files
router.get("/agent-request/uploads/:filename", (req, res): void => {
  const filename = req.params["filename"];
  if (!filename || filename.includes("..")) { res.status(400).json({ error: "Invalid filename" }); return; }
  res.sendFile(path.join(process.cwd(), "uploads", "agent-requests", filename));
});

export default router;
