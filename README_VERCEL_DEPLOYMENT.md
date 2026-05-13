# LTT Agent Management Platform - دليل النشر على Vercel

---

<div dir="rtl">

# 🌐 منصة إدارة وكلاء LTT - النشر السحابي على Vercel

**Enterprise Grade Deployment Guide**  
**آخر تحديث: مايو 2026**

</div>

---

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#-نظرة-عامة-على-المشروع)
2. [تحليل العمارة الحالية والتعديلات](#-تحليل-العمارة-الحالية-والتعديلات)
3. [متطلبات النشر](#-متطلبات-النشر)
4. [هيكل المشروع بعد التعديل](#-هيكل-المشروع-بعد-التعديل)
5. [إنشاء حساب Neon Database](#-إنشاء-حساب-neon-database)
6. [ربط المشروع بـ GitHub](#-ربط-المشروع-b-github)
7. [نشر المشروع على Vercel](#-نشر-المشروع-على-vercel)
8. [إعداد Environment Variables](#-إعداد-environment-variables)
9. [تحديث قاعدة البيانات (Migration)](#-تحديث-قاعدة-البيانات-migration)
10. [نشر نموذج التفتيش الميداني](#-نشر-نموذج-التفتيش-الميداني)
11. [نشر API بشكل منفصل (اختياري)](#-نشر-api-bشكل-منفصل-اختياري)
12. [ربط Domain مخصص](#-ربط-domain-مخصص)
13. [التحديث المستمر (CI/CD)](#-التحديث-المستمر-cicd)
14. [استكشاف الأخطاء والحلول](#-استكشاف-الأخطاء-والحلول)
15. [النسخ الاحتياطي لقاعدة البيانات](#-النسخ-الاحتياطي-لقاعدة-البيانات)
16. [الأسئلة الشائعة](#-الأسئلة-الشائعة)

---

## 🏗️ نظرة عامة على المشروع

### ما هو LTT Agent Management Platform؟

منصة مؤسسية متكاملة لشركة **ليبيا للاتصالات والتقنية (LTT)** - قسم مبيعات التجزئة بالمنطقة الغربية. تهدف إلى إدارة وتنظيم أعمال الوكلاء والمندوبين وعمليات التفتيش الميداني والمخزون والتذاكر.

### المكونات الرئيسية

| المكون | الوصف | التقنية |
|--------|-------|---------|
| **لوحة الإدارة** | Dashboard للمشرفين والإدارة | React + Vite |
| **نموذج التفتيش** | نموذج ميداني للمفتشين (RTL عربي) | React + Vite |
| **API Server** | واجهات برمجية لجميع الخدمات | Express.js → Serverless Functions |
| **قاعدة بيانات** | تخزين جميع البيانات | PostgreSQL (Neon) |

---

## 🔄 تحليل العمارة الحالية والتعديلات

### ❌ المشاكل في العمارة القديمة (غير مناسبة لـ Vercel)

| المشكلة | التفاصيل | الإجراء |
|---------|----------|---------|
| **Express Server دائم التشغيل** | كان يستخدم PM2 لإبقاء الخادم شغال 24/7 | ✅ حُوّل إلى Serverless Functions |
| **PM2 Process Manager** | يعتمد على PM2 لإدارة العمليات | ✅ أُزيل بالكامل (غير ضروري مع Vercel) |
| **localhost Hardcoded** | URLs ثابتة مثل `localhost:8080` | ✅ أُزيلت واستُبدلت بـ environment variables |
| **منافذ ثابتة** | 8080, 20147, 5173 | ✅ أُزيلت (Vercel يدير المنافذ تلقائياً) |
| **File System Uploads** | رفع الملفات إلى مجلد محلي | ✅ حُوّل إلى Vercel Blob Storage |
| **PostgreSQL محلي** | `DB_HOST=127.0.0.1` | ✅ حُوّل إلى Neon Serverless PostgreSQL |

### ✅ العمارة الجديدة (Vercel-Compatible)

```
                    🌐 Internet
                        │
              ┌─────────┴─────────┐
              │                   │
        ┌─────┴─────┐      ┌─────┴─────┐
        │  Vercel   │      │  Vercel   │
        │  Edge     │      │  Serverless│
        │  Network  │      │  Functions │
        └─────┬─────┘      └─────┬─────┘
              │                   │
        ┌─────┴─────┐      ┌─────┴─────┐
        │  React    │      │  Express  │
        │  Frontend │      │  API      │
        │  (Static) │      │  (Serverless)│
        └───────────┘      └─────┬─────┘
                                 │
                          ┌──────┴──────┐
                          │  Neon       │
                          │  PostgreSQL │
                          │  (Serverless)│
                          └─────────────┘
```

---

## 📋 متطلبات النشر

### حساب مجاني مطلوب

| الخدمة | الرابط | خطة Vercel Free |
|--------|--------|-----------------|
| **GitHub** | https://github.com | حساب مجاني |
| **Vercel** | https://vercel.com | **Free Plan** (100GB bandwidth, 100h build/month) |
| **Neon** | https://neon.tech | **Free Plan** (0.5GB storage, 100h compute/month) |

### Vercel Free Plan Limits

| الميزة | الحد المسموح |
|--------|-------------|
| Bandwidth | 100 GB / month |
| Build Time | 100 hours / month |
| Serverless Functions | 100 GB-hours / month |
| Edge Functions | 500k invocations / month |
| Concurrent Builds | 1 |
|团队成员 | Unlimited |
| Custom Domains | 3 |

### متطلبات تقنية

- **Node.js**: 20.x أو أحدث (محلياً للاختبار)
- **pnpm**: 9.x أو أحدث
- **Git**: مثبت على جهاز التطوير

---

## 📂 هيكل المشروع بعد التعديل

```
ltt-agent-management-platform/
│
├── api/                          # ⬅️ Vercel Serverless Functions
│   ├── index.ts                  #    Express API entry point (main)
│   └── health.ts                 #    Health check endpoint
│
├── artifacts/
│   ├── ltt-platform/             # ⬅️ لوحة الإدارة (تستقبل VITE_API_URL)
│   │   ├── src/
│   │   ├── vite.config.ts        #    Vite config مع VITE_API_URL
│   │   ├── package.json
│   │   └── dist/                 #    Build output
│   │
│   └── agent-request-form/       # ⬅️ نموذج التفتيش (منشور منفصل أو متعدد)
│       ├── src/
│       ├── vite.config.ts        #    base: '/form/'
│       ├── package.json
│       └── dist/
│
├── lib/
│   ├── db/
│   │   └── src/
│   │       ├── vercel-db.ts      # ⬅️ Neon serverless connection
│   │       └── schema/           #    Drizzle ORM schema
│   ├── api-zod/                  #    Zod schemas
│   ├── api-client-react/         #    React Query hooks
│   └── api-spec/                 #    OpenAPI spec
│
├── vercel-env/
│   └── VERCEL_ENVIRONMENT_GUIDE.md  # ⬅️ دليل متغيرات البيئة
│
├── vercel.json                   # ⬅️ Vercel configuration
├── .env.example                  # ⬅️ نموذج متغيرات البيئة
├── package.json                  #    Root package.json مع scripts
├── pnpm-workspace.yaml           #    pnpm workspace config
└── README_VERCEL_DEPLOYMENT.md   # ⬅️ هذا الملف
```

---

## 🗄️ إنشاء حساب Neon Database

Neon هي خدمة PostgreSQL serverless متوافقة تماماً مع Vercel.

### الخطوة 1: إنشاء حساب

1. اذهب إلى https://console.neon.tech
2. سجل بحساب GitHub أو Google
3. اختر **Free Plan**

### الخطوة 2: إنشاء قاعدة بيانات جديدة

```
1. Dashboard → Projects → New Project
2. Name: ltt-platform
3. Region: US East (أو الأقرب لك)
4. PostgreSQL version: 16
5. Click "Create Project"
```

### الخطوة 3: الحصول على رابط الاتصال

```
1. في صفحة المشروع، ابحث عن "Connection Details"
2. انسخ "Connection String" (يبدأ بـ postgresql://)
3. يجب أن يبدو هكذا:
   postgresql://ltt_owner:xxxx@ep-yellow-xxxx.us-east-2.aws.neon.tech/ltt_platform?sslmode=require
```

### الخطوة 4: حفظ الرابط

> ⚠️ **هام**: احتفظ بهذا الرابط. ستحتاجه عند إعداد Environment Variables في Vercel.

### الخطوة 5: إنشاء الجداول (اختياري - يمكنك تأجيلها)

```sql
-- يمكنك الاتصال بقاعدة البيانات وإنشاء الجداول لاحقاً
-- أو استخدم Drizzle migrations (موصى به)
```

---

## 🔗 ربط المشروع بـ GitHub

### إنشاء Repository جديد

```bash
# 1. أنشئ repository جديد على GitHub (لا تضف README أو .gitignore)
# 2. في مجلد المشروع محلياً، شغّل:
cd C:\Users\m.adel\Desktop\Agent-Management-Platform

git init
git add .
git commit -m "Initial commit: LTT Platform Vercel-ready"

# 3. اربط مع GitHub
git remote add origin https://github.com/YOUR_USERNAME/ltt-agent-management-platform.git
git branch -M main
git push -u origin main
```

### بديل: ارفع المشروع من Vercel مباشرة

```
بدون Git: يمكنك رفع المشروع عبر Vercel CLI
```

---

## 🚀 نشر المشروع على Vercel

### الطريقة 1: عبر Vercel Dashboard (أسهل)

#### الخطوة 1: الدخول إلى Vercel

1. اذهب إلى https://vercel.com
2. سجل الدخول بحساب GitHub
3. اختر **"Add New..." → "Project"**

#### الخطوة 2: استيراد المشروع

```
1. اختر GitHub repository: ltt-agent-management-platform
2. أو استورد من Git repository آخر
```

#### الخطوة 3: إعدادات المشروع

في صفحة "Configure Project":

| الإعداد | القيمة |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | . (leave default) |
| **Build Command** | `cd artifacts/ltt-platform && pnpm run build` |
| **Output Directory** | `artifacts/ltt-platform/dist` |
| **Install Command** | `pnpm install --prod=false` |

#### الخطوة 4: إضافة Environment Variables

أضف المتغيرات التالية:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` من Neon | Production, Preview, Development |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Production, Preview, Development |
| `VITE_API_URL` | `/api` | Production, Preview, Development |

#### الخطوة 5: النشر

```
1. Click "Deploy"
2. انتظر 2-5 دقائق حتى يكتمل البناء
3. 🎉 سيظهر رابط مثل: https://ltt-agent-management-platform.vercel.app
```

### الطريقة 2: عبر Vercel CLI

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. النشر (من مجلد المشروع)
cd C:\Users\m.adel\Desktop\Agent-Management-Platform
vercel --prod

# 4. اتبع التعليمات:
#   - Set up and deploy: Y
#   - Which scope: اختر حسابك
#   - Link to existing project: N
#   - Project name: ltt-agent-management-platform
#   - Framework: Vite
#   - Root directory: ./
#   - Build command: cd artifacts/ltt-platform && pnpm run build
#   - Output directory: artifacts/ltt-platform/dist
#   - Install command: pnpm install --prod=false
```

### بعد النشر

```
🔗 Production URL: https://ltt-agent-management-platform.vercel.app
🔗 API URL:         https://ltt-agent-management-platform.vercel.app/api
🔗 Health Check:    https://ltt-agent-management-platform.vercel.app/api/health
```

---

## ⚙️ إعداد Environment Variables

### إضافة المتغيرات عبر Vercel Dashboard

```
1. افتح مشروعك على https://vercel.com
2. Settings → Environment Variables
3. أضف كل متغير من الجدول أدناه
```

### المتغيرات المطلوبة

| # | المتغير | القيمة | البيئات |
|---|---------|--------|---------|
| 1 | `DATABASE_URL` | رابط PostgreSQL من Neon | Production, Preview, Development |
| 2 | `SESSION_SECRET` | مفتاح عشوائي (64 حرف hex) | Production, Preview, Development |
| 3 | `VITE_API_URL` | `/api` | Production, Preview, Development |

### المتغيرات الاختيارية

| # | المتغير | القيمة الافتراضية | الوصف |
|---|---------|-------------------|-------|
| 4 | `TOKEN_EXPIRY` | `24h` | مدة صلاحية التوكن |
| 5 | `CORS_ORIGINS` | (domain Vercel) | النطاقات المسموح بها إضافياً |
| 6 | `LOG_LEVEL` | `info` | مستوى التسجيل |
| 7 | `DEFAULT_PASSWORD` | `LTT@2024` | كلمة السر الافتراضية |

### توليد SESSION_SECRET آمن

```bash
# شغّل هذا الأمر في Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# مثال للناتج:
# a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

### طريقة إضافة البيئة يدوياً عبر Vercel Dashboard

```
1. Open your project on Vercel
2. Go to Settings → Environment Variables
3. In the "Key" field, enter: DATABASE_URL
4. In the "Value" field, paste your Neon connection string
5. Select Environments: Production, Preview, Development
6. Click "Add"
7. كرر العملية لـ SESSION_SECRET و VITE_API_URL
```

---

## 🔄 تحديث قاعدة البيانات (Migration)

### باستخدام Drizzle Kit

```bash
# محلياً: قم بتوليد migration files
pnpm run db:generate

# ادفع التغييرات إلى Neon
DATABASE_URL="postgresql://..." pnpm run db:push
```

### عبر Vercel (بعد النشر)

```bash
# استخدم Vercel CLI
vercel env pull .env.production
pnpm run db:push
```

### الاتصال المباشر بـ Neon

```bash
# استخدم psql أو أي PostgreSQL client
psql "postgresql://ltt_owner:xxxx@ep-yellow-xxxx.us-east-2.aws.neon.tech/ltt_platform?sslmode=require"
```

### إنشاء الجداول يدوياً

```sql
-- الاتصال بقاعدة البيانات ثم شغّل:
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  score INTEGER DEFAULT 0,
  classification VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ... rest of tables
```

---

## 📝 نشر نموذج التفتيش الميداني

نموذج التفتيش (`agent-request-form`) هو تطبيق منفصل. يمكنك نشره كـ **Vercel project مستقل**.

### الطريقة 1: مشروع Vercel منفصل (موصى به)

```bash
# اذهب إلى مجلد النموذج
cd C:\Users\m.adel\Desktop\Agent-Management-Platform\artifacts\agent-request-form

# أنشئ vercel.json خاص به
echo '{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}' > vercel.json

# انشر
vercel --prod
```

### الطريقة 2: ضمن نفس المشروع (باستخدام base path `/form/`)

إذا كنت تريد النموذج ضمن نفس domain، فأنت بحاجة إلى build ثانٍ في نفس Vercel project. هذا يتطلب **Vercel Pro** أو استخدام monorepo deployment مع builds متعددة.

### إعدادات Vite للنموذج (موجودة مسبقاً)

```typescript
// artifacts/agent-request-form/vite.config.ts
export default defineConfig({
  base: '/form/',  // استخدم هذا المسار الأساسي
  build: {
    outDir: 'dist',
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '/api'),
  },
});
```

---

## 🌐 ربط Domain مخصص

### عبر Vercel Dashboard

```
1. افتح مشروعك على Vercel
2. Settings → Domains
3. اكتب: your-company.com
4. اختر "Add"
5. اتبع التعليمات لتحديث DNS:
   - أضف CNAME record:
     Type: CNAME
     Name: @ (أو www)
     Target: cname.vercel-dns.com
6. انتظر 5-30 دقيقة لتفعيل DNS
```

### عبر Cloudflare (اختياري)

إذا كنت تستخدم Cloudflare:

```
1. DNS → Add Record
2. Type: CNAME
3. Name: @
4. Target: ltt-agent-management-platform.vercel.app
5. Proxy status: DNS only (orange cloud OFF)
6. Save
```

### إعداد SSL (تلقائي مع Vercel)

✅ **ميزة رائعة: Vercel يوفر SSL تلقائياً ومجاناً!**

```
- لا حاجة لتثبيت Certbot
- لا حاجة لإدارة الشهادات
- Vercel يتولى كل شيء تلقائياً
- SSL/TLS مفعل افتراضياً
```

---

## 🔄 التحديث المستمر (CI/CD)

### آلية العمل

```
1. developer pushes to main branch on GitHub
2. Vercel detects the push automatically
3. Vercel runs the build
4. If successful → deployed to production
5. If failed → email notification
```

### الفروع المدعومة

| الفرع | البيئة | الرابط |
|-------|--------|--------|
| `main` | Production | `https://your-app.vercel.app` |
| `develop` | Preview | `https://develop-git.vercel.app` |
| أي فرع آخر | Preview | `https://branch-name.vercel.app` |

### إلغاء النشر التلقائي للفروع غير المرغوب فيها

```json
// في vercel.json
"git": {
  "deploymentEnabled": {
    "main": true,
    "develop": true
    // الفروع الأخرى لن تنشر تلقائياً
  }
}
```

---

## ❌ استكشاف الأخطاء والحلول

### 1. Build Error: `Cannot find module`

```
Error: Cannot find module '@workspace/db'

الحل:
1. تأكد من أن pnpm install يعمل بشكل صحيح
2. أضف في vercel.json:
   "installCommand": "pnpm install --prod=false"
3. تأكد من أن pnpm-workspace.yaml يحتوي على المسارات الصحيحة
```

### 2. CORS Error في المتصفح

```
Access to fetch at 'https://api.example.com' has been blocked by CORS

الحل:
1. تأكد من أن VITE_API_URL = '/api' (نفس domain)
2. أو أضف domainك في CORS_ORIGINS
3. تحقق من إعدادات CORS في api/index.ts
```

### 3. Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432

الحل:
1. هذا خطأ شائع عند استخدام localhost
2. تأكد من أن DATABASE_URL هو رابط Neon (وليس localhost)
3. تحقق من المتغير في Vercel Dashboard
4. أعد النشر بعد تصحيح المتغير
```

### 4. 404 بعد النشر

```
الصفحة لا تظهر بعد النشر

الحل:
1. تحقق من outputDirectory في vercel.json
2. تأكد من أن dist/ يحتوي على index.html
3. جرب: Vercel Dashboard → Deployments → Redeploy
```

### 5. API يعيد 502

```
502 Bad Gateway

الحل:
1. تحقق من Serverless Function logs في Vercel Dashboard
2. تأكد من أن الدالة لا تتجاوز 10 ثوانٍ (حد Vercel Free)
3. قسّم الاستعلامات الكبيرة إلى صفحات (pagination)
```

### 6. Build Timeout (أكثر من 45 دقيقة)

```
Error: Build cancelled due to timeout

الحل:
1. استخدم pnpm (أسرع من npm)
2. قلل حجم node_modules:
   - أزل dependencies غير المستخدمة
   - استخدم --prod=false فقط للضرورة
3. قسم المشروع إلى مشاريع Vercel منفصلة
```

### 7. الصور لا تظهر (Uploads)

```
الملفات المرفوعة لا تظهر بعد النشر

السبب: Vercel Serverless لا يدعم كتابة الملفات
الحل:
1. استخدم Vercel Blob Storage (مجاني)
2. أو استخدم خدمة خارجية مثل Cloudinary
3. أو استخدم AWS S3 (إذا كان متاحاً)
```

---

## 💾 النسخ الاحتياطي لقاعدة البيانات

### عبر Neon Dashboard

```
1. اذهب إلى https://console.neon.tech
2. اختر مشروعك ← Backups
3. اضغط "Create Backup" → اختر "Full Backup"
4. التحميل سيبدأ تلقائياً
```

### باستخدام Vercel Cron Job

```json
// vercel.json - مجدول النسخ الاحتياطي
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 2 * * *"  // كل يوم الساعة 2 صباحاً
    }
  ]
}
```

### نسخ احتياطي يدوي

```bash
# استخدم pg_dump مع رابط Neon
pg_dump "postgresql://user:pass@ep-example.aws.neon.tech/ltt_platform?sslmode=require" \
  -F c \
  -f backup_$(date +%Y%m%d).sql
```

### استعادة النسخة الاحتياطية

```bash
pg_restore "postgresql://user:pass@ep-example.aws.neon.tech/ltt_platform?sslmode=require" \
  -c \
  -F c \
  -d ltt_platform \
  backup_20260513.sql
```

---

## ❓ الأسئلة الشائعة

### س: هل Vercel Free Plan يكفي لتشغيل هذا المشروع؟

**ج:** نعم، إذا كان:
- عدد المستخدمين أقل من 1000 مستخدم نشط يومياً
- حجم البيانات أقل من 500MB
- لا يتجاوز Bandwidth 100GB/شهر
- لا يتجاوز Build Time 100 ساعة/شهر

### س: ماذا عن رفع الملفات والصور؟

**ج:** Vercel Serverless Functions لا تدعم تخزين الملفات. استخدم:
- **Vercel Blob Storage** (مجاني حتى 5GB) - موصى به
- **Cloudinary** (مجاني للصور)
- **Uploadthing** (مجاني لحد معين)

### س: هل يمكنني استخدام Supabase بدل Neon؟

**ج:** نعم،完全可以. كلاهما PostgreSQL serverless. فقط غير `DATABASE_URL`.

### س: ماذا عن الـ local storage (localStorage) للتطبيق؟

**ج:** Vercel Frontend هو موقع ثابت (static). `localStorage` يعمل طبيعياً في متصفح المستخدم ولا يتأثر بـ Vercel.

### س: هل يمكنني تشغيل Cron Jobs في Vercel Free؟

**ج:** نعم، مسموح بـ 2 Cron Jobs في الخطة المجانية.

### س: وكيف أرقي الخطة إذا احتجت أكثر؟

**ج:** Vercel Pro ($20/شهر) يمنحك:
- Bandwidth غير محدود
- Build Time: 3000 ساعة/شهر
- Serverless Functions: 1000 GB-hours
- Deploy from أي Git provider
- المزيد من الـ团队成员 والميزات

---

## ✅ قائمة التحقق النهائية

قبل اعتبار النشر مكتملاً، تأكد من:

- [ ] GitHub repository محدث بأحدث كود
- [ ] `vercel.json` موجود في جذر المشروع
- [ ] `DATABASE_URL` مضاف في Environment Variables (من Neon)
- [ ] `SESSION_SECRET` مضاف (مفتاح قوي عشوائي)
- [ ] `VITE_API_URL` مضاف بالقيمة `/api`
- [ ] لا يوجد أي `localhost` أو `127.0.0.1` في أي ملف
- [ ] `api/index.ts` موجود ويصدر Express app
- [ ] `lib/db/src/vercel-db.ts` يستخدم `@neondatabase/serverless`
- [ ] Vite config يستخدم `VITE_API_URL` (وليس IP hardcoded)
- [ ] Build يعمل محلياً بدون أخطاء: `pnpm run build:production`
- [ ] النشر على Vercel اكتمل بنجاح
- [ ] API يعمل: `https://your-app.vercel.app/api/health`
- [ ] Frontend يعمل: `https://your-app.vercel.app`
- [ ] Login يعمل مع بيانات المستخدمين
- [ ] جميع الصفحات تتنقل بشكل سليم
- [ ] قاعدة البيانات متصلة والبيانات ظاهرة

---

## 🏁 الخلاصة

تم تحويل مشروع **LTT Agent Management Platform** من:
- **❌ Architecture قديمة**: Express + PM2 + PostgreSQL محلي + localhost
- **✅ Architecture جديدة**: Vercel Serverless + Neon PostgreSQL + CI/CD تلقائي

**المميزات بعد النشر:**
- 🆓 **مجاني 100%** (Free Plan)
- ⚡ **تشغيل فوري** بدون maintenance
- 🔒 **SSL مجاني ومضمون**
- 🔄 **CI/CD تلقائي** مع GitHub
- 🌍 **متاح من أي مكان**
- 🛡️ **أمان من Vercel Edge Network**
- 📈 **قابلية توسعه تلقائية**

---

> **تم إعداد هذا الدليل بواسطة DevOps Engineer**
> **LTT Agent Management Platform - Vercel Deployment Guide**
> **© 2026 - جميع الحقوق محفوظة لشركة ليبيا للاتصالات والتقنية**

---

