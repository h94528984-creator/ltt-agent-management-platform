# LTT Agent Management Platform - دليل النشر على Netlify

---

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#-نظرة-عامة-على-المشروع)
2. [العمارة الجديدة (Netlify)](#-العمارة-الجديدة-netlify)
3. [التغييرات الجذرية Breaking Changes](#-التغييرات-الجذرية-breaking-changes)
4. [متطلبات النشر](#-متطلبات-النشر)
5. [هيكل المشروع النهائي](#-هيكل-المشروع-النهائي)
6. [إعداد قاعدة البيانات (Neon)](#-إعداد-قاعدة-البيانات-neon)
7. [نشر المشروع على Netlify](#-نشر-المشروع-على-netlify)
8. [إعداد Environment Variables](#-إعداد-environment-variables)
9. [التطوير المحلي (Local Development)](#-التطوير-المحلي-local-development)
10. [رفع نموذج التفتيش (اختياري)](#-رفع-نموذج-التفتيش-اختياري)
11. [ربط Domain مخصص](#-ربط-domain-مخصص)
12. [CI/CD مع GitHub](#-cicd-مع-github)
13. [النسخ الاحتياطي](#-النسخ-الاحتياطي)
14. [استكشاف الأخطاء](#-استكشاف-الأخطاء)
15. [قائمة التحقق النهائية](#-قائمة-التحقق-النهائية)

---

## 🏗️ نظرة عامة على المشروع

**LTT Agent Management Platform** هي منصة مؤسسية متكاملة لشركة **ليبيا للاتصالات والتقنية (LTT)**. تم تحويلها بالكامل لتعمل على **Netlify Free Plan** مع **Neon PostgreSQL** كقاعدة بيانات.

### المكونات بعد التحويل

| المكون | التقنية | الاستضافة |
|--------|---------|-----------|
| الواجهة الأمامية | React 19 + Vite | Netlify Static |
| API | Serverless Functions | Netlify Functions |
| قاعدة البيانات | PostgreSQL (Neon) | Neon.tech |
| Build | pnpm + TypeScript | Netlify Build |

---

## 🆕 العمارة الجديدة (Netlify)

### قبل التحويل (Vercel)
```
api/index.ts ← Express app (ممنوع في Netlify)
         ↓
Vercel Serverless Functions
```

### بعد التحويل (Netlify)
```
netlify/functions/api.ts ← نقطة دخول وحيدة (بدون Express)
         ↓
    يوزع على handlers/
    ├── agents.ts
    ├── tickets.ts
    ├── users.ts
    ├── auth.ts
    └── ...
         ↓
    Drizzle ORM → Neon PostgreSQL
```

### تدفق البيانات

```
🌐 متصفح المستخدم
      │
      ▼
Netlify Edge Network
      │
      ├─ /api/* → redirect to /.netlify/functions/api
      │                │
      │                ▼
      │         netlify/functions/api.ts
      │                │
      │          يطابق المسار (Route Matcher)
      │                │
      │          ┌──────┴──────┐
      │          │  Handler    │
      │          │  (agents,   │
      │          │   tickets…) │
      │          └──────┬──────┘
      │                 │
      │          Drizzle ORM
      │                 │
      │                 ▼
      │          Neon PostgreSQL
      │
      └─ /* → index.html (SPA fallback)
```

---

## 🔴 التغييرات الجذرية (Breaking Changes)

### 1. ❌ Express أُزيل بالكامل

```
قبل:  api/index.ts ← Express app مع app.get(), app.post()
بعد:  netlify/functions/api.ts ← Netlify Function خالص
                                  يستخدم HandlerEvent, HandlerResponse
```

### 2. ❌ Vercel-specific imports أُزيلت

```
قبل:  import type { VercelRequest, VercelResponse } from '@vercel/node'
بعد:  import type { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions'
```

### 3. ❌ API response pattern تغير

| | Vercel | Netlify |
|---|--------|---------|
| التوقيع | `res.json({…})` | `return { statusCode, body }` |
| CORS | `cors()` middleware | يدوياً في الـ headers |
| Body | `req.body` (parsed) | `JSON.parse(event.body)` |

### 4. ❌ مسارات API تغيرت

```
قبل:  /api/*
بعد:  /.netlify/functions/api  (مع redirect تلقائي)
```

### 5. ❌ Build command تغير

```
قبل:  cd artifacts/ltt-platform && vite build
بعد:  pnpm run build:netlify
      (يبني المكتبات أولاً ثم frontend)
```

### 6. ❌ Localhost references أُزيلت

- لا يوجد `localhost:8080` 
- لا يوجد `localhost:20147`
- API URL متغير: `VITE_API_URL=/api`

### 7. ✅ المحتفظ به (Unchanged)

| المكون | الحالة |
|--------|--------|
| Drizzle ORM Schema | ✅ بدون تغيير |
| Neon PostgreSQL | ✅ بدون تغيير |
| Frontend (React) | ✅ بدون تغيير |
| Tailwind CSS | ✅ بدون تغيير |
| pnpm workspace | ✅ بدون تغيير |

---

## 📋 متطلبات النشر

### حسابات مجانية مطلوبة

| الخدمة | الرابط | الخطة المجانية |
|--------|--------|----------------|
| **GitHub** | https://github.com | مجاني |
| **Netlify** | https://netlify.com | **Free Plan** (100GB bandwidth, 300 min build/month) |
| **Neon** | https://neon.tech | **Free Plan** (0.5GB storage) |

### متطلبات محلية

```bash
Node.js >= 20
pnpm >= 9
Netlify CLI (اختياري للتطوير): npm install -g netlify-cli
```

---

## 📂 هيكل المشروع النهائي

```
ltt-agent-management-platform/
│
├── netlify.toml                   # ⬅️ إعدادات Netlify
│
├── netlify/
│   └── functions/
│       ├── api.ts                 # ⬅️ نقطة الدخول لجميع API
│       │
│       └── handlers/              # ⬅️ معالجات منفصلة لكل مورد
│           ├── index.ts           #    تصدير الكل
│           ├── health.ts          #    /api/health
│           ├── auth.ts            #    /api/auth/login
│           ├── agents.ts          #    /api/agents
│           ├── agent-requests.ts  #    /api/agent-requests
│           ├── tickets.ts         #    /api/tickets
│           ├── users.ts           #    /api/users
│           ├── inventory.ts       #    /api/inventory
│           ├── dashboard.ts       #    /api/dashboard/stats
│           ├── analytics.ts       #    /api/analytics
│           ├── documents.ts       #    /api/documents
│           ├── sales-logs.ts      #    /api/sales-logs
│           └── notifications.ts   #    /api/notifications
│
├── artifacts/
│   ├── ltt-platform/              # ⬅️ لوحة الإدارة
│   │   ├── src/
│   │   ├── vite.config.ts         #    VITE_API_URL = /api
│   │   └── package.json
│   │
│   └── agent-request-form/        # ⬅️ نموذج التفتيش
│       ├── src/
│       ├── vite.config.ts
│       └── package.json
│
├── lib/
│   ├── db/src/
│   │   ├── netlify-db.ts          # ⬅️ اتصال بقاعدة البيانات (Neon)
│   │   └── schema/                #    Drizzle schema
│   ├── api-zod/
│   └── api-client-react/
│
├── package.json
├── pnpm-workspace.yaml
└── README_NETLIFY_DEPLOYMENT.md   # ⬅️ هذا الملف
```

---

## 🗄️ إعداد قاعدة البيانات (Neon)

### الخطوة 1: إنشاء حساب Neon

1. اذهب إلى https://console.neon.tech
2. سجل بـ GitHub
3. اختر **Free Plan**

### الخطوة 2: إنشاء قاعدة بيانات

```
1. Projects → New Project
2. Name: ltt-platform
3. Region: US East
4. Create
```

### الخطوة 3: الحصول على رابط الاتصال

```
1. Connection Details → Connection String
2. انسخ الرابط (يبدأ بـ postgresql://)
3. احفظه في مكان آمن
```

### رابط قاعدة البيانات الخاص بك

```
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

⚠️ هذا الرابط سيُستخدم فقط في **Netlify Environment Variables** - لا تضعه في أي ملف كود.

---

## 🚀 نشر المشروع على Netlify

### الطريقة 1: عبر Netlify Dashboard (أسهل)

#### الخطوة 1: ارفع الكود إلى GitHub

```bash
cd C:\Users\m.adel\Desktop\Agent-Management-Platform
git init
git add .
git commit -m "Netlify-ready: LTT Platform"
git remote add origin https://github.com/YOUR_USERNAME/ltt-agent-management-platform.git
git branch -M main
git push -u origin main
```

#### الخطوة 2: استيراد المشروع في Netlify

```
1. اذهب إلى https://app.netlify.com
2. اضغط "Add new site" → "Import an existing project"
3. اختر GitHub → Authorize
4. ابحث عن: ltt-agent-management-platform
```

#### الخطوة 3: إعدادات البناء

في صفحة "Site settings":

| الإعداد | القيمة |
|---------|--------|
| **Build command** | `pnpm run build:netlify` |
| **Publish directory** | `artifacts/ltt-platform/dist` |
| **Functions directory** | `netlify/functions` |

#### الخطوة 4: إضافة Environment Variables

**أضف المتغير التالي فوراً:**

```
Key:   DATABASE_URL
Value: postgresql://<user>:<password>@<host>/<database>?sslmode=require
Scope: All deploy contexts
```

#### الخطوة 5: انشر

```
اضغط "Deploy site"
انتظر 2-3 دقائق
🎉 سيظهر رابط مثل: https://ltt-platform-abc123.netlify.app
```

### الطريقة 2: عبر Netlify CLI

```bash
# 1. تثبيت Netlify CLI
npm install -g netlify-cli

# 2. تسجيل الدخول
netlify login

# 3. ربط المشروع
cd C:\Users\m.adel\Desktop\Agent-Management-Platform
netlify init

# 4. أضف Environment Variable
netlify env:set DATABASE_URL "postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# 5. انشر
netlify deploy --prod
```

---

## ⚙️ إعداد Environment Variables

### المتغيرات المطلوبة في Netlify

| المتغير | القيمة | البيئات |
|---------|--------|---------|
| `DATABASE_URL` | `postgresql://<user>:<password>@<host>/<database>?sslmode=require` | Production, Deploy Preview, Branch Deploy |
| `VITE_API_URL` | `/api` | Production, Deploy Preview, Branch Deploy |

### المتغيرات الاختيارية

| المتغير | القيمة الافتراضية | الوصف |
|---------|-------------------|-------|
| `SESSION_SECRET` | (مفتاح عشوائي) | تشفير الجلسات |
| `TOKEN_EXPIRY` | `24h` | مدة صلاحية التوكن |
| `NODE_ENV` | `production` | بيئة التشغيل |
| `LOG_LEVEL` | `info` | مستوى التسجيل |

### طريقة الإضافة

```
Netlify Dashboard → Site Settings → Environment Variables → Add Variable
```

---

## 💻 التطوير المحلي (Local Development)

### متطلبات

```bash
# تثبيت الاعتماديات
pnpm install

# تثبيت Netlify CLI للتطوير المحلي
npm install -g netlify-cli
```

### ملف .env المحلي

```bash
# انسخ .env.example إلى .env
cp .env.example .env

# أضف DATABASE_URL للتطوير المحلي
echo 'DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"' >> .env
```

### تشغيل التطوير المحلي

```bash
# الخيار 1: تشغيل frontend فقط (بدون Functions)
pnpm run dev

# الخيار 2: تشغيل كل شيء محلياً (Netlify Dev)
pnpm run netlify:dev
# هذا يشغل:
#   - Frontend (Vite)
#   - Netlify Functions محلياً
#   - على http://localhost:8888
```

Netlify Dev يحاكي بيئة Netlify كاملة محلياً:
- API: `http://localhost:8888/.netlify/functions/api`
- Frontend: `http://localhost:8888`
- Auto redirects: `/api/*` → Functions

### Push Schema إلى قاعدة البيانات

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require" \
  pnpm run db:push
```

---

## 📝 رفع نموذج التفتيش (اختياري)

نموذج التفتيش (`agent-request-form`) يمكن رفعه كـ **موقع Netlify منفصل**:

```bash
# 1. اذهب إلى مجلد النموذج
cd artifacts/agent-request-form

# 2. أنشئ netlify.toml خاص به
echo '{
  "build": {
    "command": "pnpm run build",
    "publish": "dist"
  }
}' > netlify.toml

# 3. ارفعه
netlify deploy --prod
```

رابط النموذج سيكون: `https://ltt-form-xxxxx.netlify.app`

---

## 🔗 ربط Domain مخصص

```
1. Netlify Dashboard → Site Settings → Domain Management
2. Add custom domain: ltt.company.com
3. اتبع التعليمات لتحديث DNS:
   - Type: CNAME
   - Name: ltt
   - Target: your-site.netlify.app
4. SSL (تلقائي من Netlify) ✓
```

SSL مجاني وتلقائي مع Netlify.

---

## 🔄 CI/CD مع GitHub

### آلية العمل

```
Git Push → Netlify detects change → Auto-build → Auto-deploy
```

### الفروع

| الفرع | البيئة | الرابط |
|-------|--------|--------|
| `main` | Production | `https://ltt-platform.netlify.app` |
| `develop` | Deploy Preview | `https://develop--ltt-platform.netlify.app` |
| أي فرع | Deploy Preview | `https://branch-name--ltt-platform.netlify.app` |

### إلغاء النشر للفروع غير المرغوب فيها

```toml
# في netlify.toml
[build]
  ignore = "git diff --quiet HEAD~1 -- ."
```

---

## 💾 النسخ الاحتياطي

### عبر Neon Dashboard

```
1. https://console.neon.tech
2. Project → Backups → Create Backup
```

### عبر pg_dump (يدوي)

```bash
pg_dump "postgresql://<user>:<password>@<host>/<database>?sslmode=require" \
  -F c \
  -f backup_$(date +%Y%m%d).sql
```

### عبر Netlify Cron Job

```toml
# أضف في netlify.toml (يتطلب Netlify Pro)
[[crons]]
  schedule = "0 2 * * *"
  command = "curl -X POST https://your-site.netlify.app/api/cron/backup"
```

---

## ❌ استكشاف الأخطاء

### 1. Build Error: Cannot find module

```
Error: Cannot find module '../../lib/db/src/queries/agents'

الحل:
1. تأكد من pnpm install --prod=false
2. في netlify.toml أضف:
   [functions]
     node_bundler = "esbuild"
3. تأكد من وجود الملفات في lib/db/src/queries/
```

### 2. CORS Error

```
Access to fetch at '/api/agents' blocked by CORS

الحل:
1. تأكد من أن VITE_API_URL = "/api"
2. تأكد من أن api.ts يضيف CORS headers
3. اختبر مباشرة: /.netlify/functions/api/health
```

### 3. Database Connection Error

```
{
  "error": "DATABASE_URL is not configured"
}

الحل:
1. اذهب إلى Netlify Dashboard → Environment Variables
2. تأكد من وجود DATABASE_URL
3. القيمة:
   postgresql://<user>:<password>@<host>/<database>?sslmode=require
4. أعد النشر (Deploy → Redeploy)
```

### 4. 404 لجميع الصفحات

```
جميع الصفحات ترجع 404

الحل:
1. تأكد من SPA fallback redirect في netlify.toml:
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
2. تأكد من وجود artifacts/ltt-platform/dist/index.html
```

### 5. .netlify/functions/api لا يعمل

```
اختبار: https://your-site.netlify.app/.netlify/functions/api/health

إذا لم يعمل:
1. تحقق من Functions directory في Netlify Dashboard
2. تأكد من netlify.toml:
   [functions]
     directory = "netlify/functions"
3. تحقق من logs: Netlify → Functions → api → View logs
```

---

## ✅ قائمة التحقق النهائية

- [ ] `netlify.toml` موجود في جذر المشروع
- [ ] `netlify/functions/api.ts` هو نقطة الدخول الوحيدة
- [ ] `netlify/functions/handlers/` يحتوي على جميع المعالجات
- [ ] `DATABASE_URL` مضاف في Netlify Environment Variables
- [ ] `VITE_API_URL=/api` مضاف في Netlify Environment Variables
- [ ] لا يوجد Express في أي ملف
- [ ] لا يوجد `import` من `@vercel/` أو `vercel`
- [ ] جميع الـ handlers تستخدم `HandlerEvent` / `HandlerResponse` من `@netlify/functions`
- [ ] `pnpm run build:netlify` يعمل محلياً
- [ ] Frontend يستخدم `import.meta.env.VITE_API_URL` لاستدعاء API
- [ ] `lib/db/src/netlify-db.ts` جاهز ويستخدم `DATABASE_URL` من env
- [ ] `pnpm-workspace.yaml` لا يحتوي على Vercel-specific settings
- [ ] `.env` غير مضمن في Git
- [ ] النشر على Netlify اكتمل بنجاح
- [ ] `https://your-site.netlify.app/api/health` يعيد JSON
- [ ] `https://your-site.netlify.app` يعرض لوحة الإدارة
- [ ] قاعدة البيانات متصلة والبيانات ظاهرة

---

## 🏁 الخلاصة

تم تحويل **LTT Agent Management Platform** بالكامل من:

| من | إلى |
|----|-----|
| ✅ Vercel Serverless | ✅ **Netlify Functions** |
| ✅ Express routing | ✅ **Netlify-native router** |
| ✅ `api/` directory | ✅ `netlify/functions/` |
| ✅ Vercel Free Plan | ✅ **Netlify Free Plan** |
| ✅ Neon PostgreSQL | ✅ **Neon PostgreSQL** (بدون تغيير) |

**المميزات:**
- 🆓 مجاني 100%
- 🔄 CI/CD تلقائي مع GitHub
- 🔒 SSL مجاني
- ⚡ CDN عالمي
- 📦 لا يحتاج إلى خادم دائم

---

> **تم إعداد هذا الدليل بواسطة DevOps Engineer**
> **LTT Agent Management Platform - Netlify Deployment Guide**
> **📅 مايو 2026**

