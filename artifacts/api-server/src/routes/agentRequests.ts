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

// Ensure uploads directory exists
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
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only jpg, png, pdf files allowed"));
  },
});

function generateRequestId(): string {
  const prefix = "LTT";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${date}-${rand}`;
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
  nearCompetitors: string;
  dailySalesEstimate: number;
}): number {
  let score = 0;
  if (data.areaTraffic === "high") score += 40;
  else if (data.areaTraffic === "medium") score += 25;
  else score += 10;

  if (data.nearCompetitors === "far") score += 30;
  else if (data.nearCompetitors === "medium") score += 20;
  else score += 10;

  const est = data.dailySalesEstimate;
  if (est >= 1000) score += 30;
  else if (est >= 500) score += 22;
  else if (est >= 200) score += 15;
  else if (est >= 100) score += 8;
  else score += 3;

  return Math.min(100, score);
}

function calcComplianceScore(data: {
  documentsComplete: boolean;
  brandIdentityCompliant: boolean;
}): number {
  let score = 0;
  if (data.documentsComplete) score += 50;
  if (data.brandIdentityCompliant) score += 50;
  return score;
}

async function sendEmail(requestId: string, employeeName: string, data: Record<string, unknown>, finalScore: number) {
  const smtpHost = process.env["SMTP_HOST"];
  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];
  const smtpPort = parseInt(process.env["SMTP_PORT"] ?? "587");

  const emailBody = `
طلب إنشاء وكيل جديد
====================
رقم الطلب: ${requestId}
الموظف: ${employeeName}
التاريخ: ${new Date().toLocaleString("ar-LY")}

بيانات الوكيل:
- الاسم: ${data["agentName"]}
- الهاتف: ${data["phone"]}
- المدينة: ${data["city"]}
- النوع: ${data["agentType"]}
- إحداثيات الموقع: ${data["latitude"] ?? "غير محدد"}, ${data["longitude"] ?? "غير محدد"}

الجاهزية التشغيلية:
- لوحة إعلانية: ${data["hasSignboard"] ? "نعم" : "لا"}
- أجهزة: ${data["hasDevices"] ? "نعم" : "لا"}
- جودة الإنترنت: ${data["internetQuality"]}
- جاهزية الموظفين: ${data["staffReadiness"]}/5

إمكانية المبيعات:
- حركة المنطقة: ${data["areaTraffic"]}
- قربه من المنافسين: ${data["nearCompetitors"]}
- تقدير المبيعات اليومية: ${data["dailySalesEstimate"]}

الامتثال:
- مستندات مكتملة: ${data["documentsComplete"] ? "نعم" : "لا"}
- التزام بالهوية البصرية: ${data["brandIdentityCompliant"] ? "نعم" : "لا"}

الملاحظات: ${data["notes"] ?? "لا يوجد"}

النتيجة النهائية: ${finalScore}/100
`;

  if (!smtpHost || !smtpUser || !smtpPass) {
    logger.info({ requestId, finalScore }, "Email would be sent (SMTP not configured):\n" + emailBody);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"منصة LTT" <${smtpUser}>`,
    to: ["y.rahuma@ltt.ly", "s.zawia@ltt.ly"],
    subject: `طلب إنشاء وكيل جديد - ${requestId}`,
    text: emailBody,
  });
}

// POST /api/agent-request — public, no auth required
router.post("/agent-request", upload.array("images", 5), async (req, res): Promise<void> => {
  try {
    const body = req.body as Record<string, string>;
    const files = (req.files as Express.Multer.File[]) ?? [];

    const {
      employeeName, employeeEmail, agentName, phone, city, agentType,
      latitude, longitude, locationDescription,
      hasSignboard, hasDevices, internetQuality, staffReadiness,
      areaTraffic, nearCompetitors, dailySalesEstimate,
      documentsComplete, brandIdentityCompliant, notes,
    } = body;

    if (!employeeName || !agentName || !phone || !city || !agentType) {
      res.status(400).json({ error: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    const parsedHasSignboard = hasSignboard === "true";
    const parsedHasDevices = hasDevices === "true";
    const parsedDocumentsComplete = documentsComplete === "true";
    const parsedBrandIdentityCompliant = brandIdentityCompliant === "true";
    const parsedStaffReadiness = parseInt(staffReadiness ?? "3") || 3;
    const parsedDailySalesEstimate = parseInt(dailySalesEstimate ?? "0") || 0;

    const readinessScore = calcReadinessScore({
      hasSignboard: parsedHasSignboard,
      hasDevices: parsedHasDevices,
      internetQuality: internetQuality ?? "medium",
      staffReadiness: parsedStaffReadiness,
    });

    const salesScore = calcSalesScore({
      areaTraffic: areaTraffic ?? "medium",
      nearCompetitors: nearCompetitors ?? "medium",
      dailySalesEstimate: parsedDailySalesEstimate,
    });

    const complianceScore = calcComplianceScore({
      documentsComplete: parsedDocumentsComplete,
      brandIdentityCompliant: parsedBrandIdentityCompliant,
    });

    const finalScore = Math.round(0.4 * readinessScore + 0.35 * salesScore + 0.25 * complianceScore);

    const requestId = generateRequestId();

    const basePath = process.env["BASE_PATH"] ?? "/api";
    const imageUrls = files.map((f) => `${basePath}/agent-request/uploads/${f.filename}`);

    const [saved] = await db.insert(agentRequestsTable).values({
      requestId,
      employeeName,
      employeeEmail: employeeEmail ?? `${employeeName.replace(/\s/g, ".")}@ltt.ly`,
      agentName,
      phone,
      city,
      agentType,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      locationDescription: locationDescription ?? undefined,
      hasSignboard: parsedHasSignboard,
      hasDevices: parsedHasDevices,
      internetQuality: internetQuality ?? "medium",
      staffReadiness: parsedStaffReadiness,
      areaTraffic: areaTraffic ?? "medium",
      nearCompetitors: nearCompetitors ?? "medium",
      dailySalesEstimate: parsedDailySalesEstimate,
      documentsComplete: parsedDocumentsComplete,
      brandIdentityCompliant: parsedBrandIdentityCompliant,
      notes: notes ?? undefined,
      readinessScore,
      salesScore,
      complianceScore,
      finalScore,
      imageUrls,
    }).returning();

    sendEmail(requestId, employeeName, body, finalScore).catch((err) => {
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
  if (!record) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }
  res.json(record);
});

// Serve uploaded files
router.get("/agent-request/uploads/:filename", (req, res): void => {
  const filename = req.params["filename"];
  if (!filename || filename.includes("..")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const filePath = path.join(process.cwd(), "uploads", "agent-requests", filename);
  res.sendFile(filePath);
});

export default router;
