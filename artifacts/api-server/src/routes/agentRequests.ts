import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { db, agentRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

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
