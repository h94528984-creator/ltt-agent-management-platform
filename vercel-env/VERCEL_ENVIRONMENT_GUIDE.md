# LTT Platform - Vercel Environment Variables Guide

## 📋 المتغيرات المطلوبة في Vercel Dashboard

يجب إضافة المتغيرات التالية في Vercel Dashboard:
**Project Settings → Environment Variables**

---

### 🔴 إلزامي (Required)

| المتغير | الوصف | مثال |
|---------|-------|------|
| `DATABASE_URL` | رابط قاعدة بيانات PostgreSQL (Neon) | `postgresql://user:pass@ep-example.aws.neon.tech/ltt_platform?sslmode=require` |
| `SESSION_SECRET` | مفتاح تشفير الجلسات (عشوائي آمن) | `a1b2c3d4e5f6...` (64 حرف عشوائي) |
| `VITE_API_URL` | رابط API (يُستخدم في Frontend) | `/api` (لنفس domain) أو `https://your-app.vercel.app/api` |

### 🟡 موصى به (Recommended)

| المتغير | الوصف | القيمة الافتراضية |
|---------|-------|-------------------|
| `NODE_ENV` | بيئة التشغيل | `production` |
| `CORS_ORIGINS` | النطاقات المسموح بها (مفصولة بفاصلة) | (domain تلقائي من Vercel) |
| `TOKEN_EXPIRY` | مدة صلاحية التوكن | `24h` |
| `LOG_LEVEL` | مستوى التسجيل | `info` |

### 🟢 اختياري (Optional)

| المتغير | الوصف | القيمة الافتراضية |
|---------|-------|-------------------|
| `DEFAULT_PASSWORD` | كلمة سر المستخدمين الافتراضية | `LTT@2024` |
| `MAX_FILE_SIZE` | الحجم الأقصى للملفات المرفوعة | `10485760` (10MB) |

---

## 🔧 كيفية إضافة المتغيرات

### الطريقة 1: عبر Vercel Dashboard
1. اذهب إلى https://vercel.com/YOUR_TEAM/ltt-platform/settings/environment-variables
2. أضف كل متغير في الجدول أعلاه
3. اختر البيئات: `Production`, `Preview`, `Development`
4. احفظ

### الطريقة 2: عبر Vercel CLI
```bash
vercel env add DATABASE_URL production
# الصق الرابط ثم اضغط Enter

vercel env add SESSION_SECRET production
# الصق المفتاح

vercel env add VITE_API_URL production
# اكتب: /api
```

### الطريقة 3: عبر ملف .env (للتطوير المحلي)
```bash
# انسخ ملف .env.example إلى .env
cp .env.example .env
# عدل القيم حسب بيئتك
```

---

## 🔐 توليد SESSION_SECRET

```bash
# استخدم هذا الأمر لتوليد مفتاح عشوائي آمن
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# الناتج مثال: a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

---

## ⚡ ملاحظات مهمة

1. `VITE_API_URL` يجب أن يكون `/api` إذا كان API و Frontend على نفس domain Vercel
2. `DATABASE_URL` يجب أن يكون من **Neon** (وليس localhost)
3. لا تضع `localhost` أو `127.0.0.1` في أي متغير
4. Vercel Free Plan يسمح بـ 100 ساعة Build في الشهر
5. Vercel Blob Storage منفصل (اختياري للملفات)
