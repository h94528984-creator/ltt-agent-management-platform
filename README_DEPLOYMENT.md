# LTT Agent Management Platform - دليل النشر والإنتاج (Deployment Guide)

---

## 📋 فهرس المحتويات

1. [متطلبات النظام](#-متطلبات-النظام)
2. [هيكل مجلدات الإنتاج](#-هيكل-مجلدات-الإنتاج)
3. [تثبيت PostgreSQL](#-تثبيت-postgresql)
4. [تثبيت Node.js و pnpm و PM2](#-تثبيت-nodejs-و-pnpm-و-pm2)
5. [إعداد قاعدة البيانات](#-إعداد-قاعدة-البيانات)
6. [إعداد جدار الحماية (Firewall)](#-إعداد-جدار-الحماية-firewall)
7. [ضبط متغيرات البيئة](#-ضبط-متغيرات-البيئة)
8. [بناء المشروع (Build)](#-بناء-المشروع-build)
9. [تشغيل النظام (Start)](#-تشغيل-النظام-start)
10. [إدارة الخدمات عبر PM2](#-إدارة-الخدمات-عبر-pm2)
11. [النسخ الاحتياطي (Backup)](#-النسخ-الاحتياطي-backup)
12. [استعادة النسخ الاحتياطي (Restore)](#-استعادة-النسخ-الاحتياطي-restore)
13. [تحديث النظام (Update)](#-تحديث-النظام-update)
14. [إعادة التشغيل بعد انقطاع الكهرباء](#-إعادة-التشغيل-بعد-انقطاع-الكهرباء)
15. [مراقبة النظام (Monitoring)](#-مراقبة-النظام-monitoring)
16. [استكشاف الأخطاء (Troubleshooting)](#-استكشاف-الأخطاء-troubleshooting)
17. [نقاط Endpoint الصحية](#-نقاط-endpoint-الصحية)
18. [أمان إضافي](#-أمان-إضافي)
19. [ملخص أوامر CMD](#-ملخص-أوامر-cmd)

---

## 🖥️ متطلبات النظام

### Hardware (الحد الأدنى)
| المكون | المتطلب |
|--------|---------|
| **المعالج (CPU)** | 4 cores (Intel i5 أو AMD Ryzen 5) |
| **الذاكرة (RAM)** | 8 GB (16 GB موصى به) |
| **التخزين** | 100 GB SSD |
| **الشبكة** | ثابت IP داخل الشبكة: `192.168.1.50` |

### Software
| البرنامج | الإصدار | رابط التحميل |
|----------|---------|--------------|
| **Windows** | 11 Pro / Server 2022+ | - |
| **Node.js** | 24.x LTS | https://nodejs.org |
| **PostgreSQL** | 16.x | https://www.postgresql.org/download/ |
| **pnpm** | 9+ | تثبت عبر: `npm install -g pnpm` |
| **PM2** | آخر إصدار | تثبت عبر: `npm install -g pm2` |
| **Git** | آخر إصدار | https://git-scm.com/ (اختياري للتحديث) |

---

## 📂 هيكل مجلدات الإنتاج

```
C:\Users\m.adel\Desktop\Agent-Management-Platform\
│
├── package.json                 # ملف المشروع الرئيسي
├── pnpm-workspace.yaml          # إعدادات pnpm workspace
├── tsconfig.base.json           # إعدادات TypeScript
├── ecosystem.config.js          # إعدادات PM2 (تشغيل الخدمات)
├── .env.production              # متغيرات البيئة للإنتاج
├── start-production.bat         # سكريبت بدء التشغيل
├── backup-database.bat          # سكريبت النسخ الاحتياطي
│
├── artifacts/                   # كود المصدر للتطبيقات
│   ├── api-server/              # خادم API (Express 5)
│   ├── ltt-platform/            # لوحة الإدارة (React + Vite)
│   └── agent-request-form/      # نموذج التفتيش (React + Vite)
│
├── lib/                         # المكتبات المشتركة
│   ├── db/                      # Drizzle ORM schema
│   ├── api-spec/                # OpenAPI spec
│   ├── api-zod/                 # Zod schemas
│   └── api-client-react/        # React Query hooks
│
└── deployment/                  # ⬅️ مجلد النشر والإنتاج
    ├── production/
    │   ├── backend/             # إعدادات Express للإنتاج
    │   ├── frontend/            # إعدادات Vite للإنتاج
    │   ├── uploads/             # الملفات المرفوعة
    │   │   ├── photos/         # صور التفتيش
    │   │   ├── documents/      # مستندات الوكلاء
    │   │   ├── avatars/        # صور المستخدمين
    │   │   └── temp/           # ملفات مؤقتة
    │   ├── backups/            # نسخ قاعدة البيانات الاحتياطية
    │   └── logs/               # سجلات PM2
    └── scripts/
        └── firewall-setup.bat  # سكريبت إعداد جدار الحماية
```

---

## 🔧 تثبيت PostgreSQL

### الخطوة 1: تحميل PostgreSQL
1. اذهب إلى https://www.postgresql.org/download/windows/
2. حمل الإصدار 16.x لنظام Windows
3. شغّل المثبت

### الخطوة 2: أثناء التثبيت
```
Password for superuser (postgres): postgres
Port: 5432
Locale: Arabic_Libya.1256
```
✅ دوّن كلمة السر! ستحتاجها لاحقاً.

### الخطوة 3: إعداد pg_hba.conf
افتح الملف:
```
C:\Program Files\PostgreSQL\16\data\pg_hba.conf
```

أضف السطر التالي للسماح بالاتصالات المحلية:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
```

### الخطوة 4: إضافة PostgreSQL إلى PATH
```
CMD (كـ Administrator):
  setx PATH "%PATH%;C:\Program Files\PostgreSQL\16\bin"
```

### الخطوة 5: تشغيل الخدمة
```
CMD:
  net start postgresql-x64-16
```
أو من Services.msc → PostgreSQL → Start

### الخطوة 6: اختبر الاتصال
```
CMD:
  psql -U postgres -c "SELECT version();"
  # كلمة السر: postgres
```

---

## 📦 تثبيت Node.js و pnpm و PM2

### Node.js
1. حمل من https://nodejs.org (إصدار 24.x LTS)
2. شغّل المثبت ✅ تأكد من تحديد "Add to PATH"
3. اختبر:
```
CMD:
  node --version
  npm --version
```

### pnpm
```
CMD:
  npm install -g pnpm
  pnpm --version
```

### PM2
```
CMD:
  npm install -g pm2
  pm2 --version
```

### Git (اختياري - للتحديثات)
```
CMD:
  npm install -g git
  git --version
```

---

## 🗄️ إعداد قاعدة البيانات

### إنشاء المستخدم وقاعدة البيانات
افتح `psql` أو `pgAdmin`:

```sql
-- الاتصال بـ PostgreSQL
psql -U postgres

-- إنشاء مستخدم للتطبيق
CREATE USER ltt_admin WITH PASSWORD 'Y0urStr0ngP@ssw0rd!';

-- إنشاء قاعدة البيانات
CREATE DATABASE ltt_platform OWNER ltt_admin;

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE ltt_platform TO ltt_admin;
GRANT ALL ON SCHEMA public TO ltt_admin;

-- اختبر
\c ltt_platform
\du
\q
```

### دفع Schema إلى قاعدة البيانات
```
CMD (من مجلد المشروع):
  pnpm run db:push
```

### بذر البيانات الافتراضية (Seed)
إذا كان هناك سكريبت Seed:
```
CMD:
  pnpm --filter @workspace/db run seed
```

---

## 🔥 إعداد جدار الحماية (Firewall)

### الطريقة 1: استخدام السكريبت (موصى به)
```
CMD (كـ Administrator):
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  deployment\scripts\firewall-setup.bat
```

### الطريقة 2: يدوياً عبر CMD
```
CMD (كـ Administrator):
  netsh advfirewall firewall add rule name="LTT-API-Server" protocol=TCP dir=in localport=8080 action=allow
  netsh advfirewall firewall add rule name="LTT-Management-Platform" protocol=TCP dir=in localport=20147 action=allow
  netsh advfirewall firewall add rule name="LTT-Agent-Form" protocol=TCP dir=in localport=5173 action=allow
```

### الطريقة 3: عبر Windows Firewall GUI
1. اذهب إلى `Control Panel\System and Security\Windows Defender Firewall`
2. اختر "Advanced Settings"
3. اختر "Inbound Rules" ← "New Rule..."
4. اختر "Port" ← TCP ← أضف المنافذ: `8080, 20147, 5173`
5. اختر "Allow the connection"
6. طبق القاعدة على Domain, Private, Public

### التحقق من القواعد
```
CMD:
  netsh advfirewall firewall show rule name="LTT-*"
```

---

## ⚙️ ضبط متغيرات البيئة

### تعديل .env.production
```
افتح الملف .env.production وعدل القيم التالية:
```

```env
# ⚡ الأهم: غيّر كلمة سر قاعدة البيانات
DB_PASSWORD=Y0urStr0ngP@ssw0rd!

# ⚡ الأهم: غيّر SESSION_SECRET (استخدم كلمة عشوائية قوية)
SESSION_SECRET=your-strong-random-secret-at-least-32-chars

# ⚡ تأكد من صحة IP السيرفر
API_URL=http://192.168.1.50:8080
PLATFORM_URL=http://192.168.1.50:20147
FORM_URL=http://192.168.1.50:5173
```

### توليد SESSION_SECRET قوي
```
CMD:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
انسخ الناتج وضعه في `SESSION_SECRET` في ملف `.env.production`.

---

## 🏗️ بناء المشروع (Build)

### بناء المكتبات أولاً
```
CMD:
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  pnpm run build:libs
```

### بناء جميع التطبيقات
```
CMD:
  pnpm run build:production
```

أو خطوة بخطوة:
```
CMD:
  pnpm --filter @workspace/db run build
  pnpm --filter @workspace/api-spec run build
  pnpm --filter @workspace/api-zod run build
  pnpm --filter @workspace/api-client-react run build
  pnpm --filter @workspace/api-server run build
  pnpm --filter @workspace/ltt-platform run build
  pnpm --filter @workspace/agent-request-form run build
```

### تنظيف البناء
```
CMD:
  pnpm run clean:dist
```

---

## 🚀 تشغيل النظام (Start)

### الطريقة 1: سكريبت التشغيل الآلي (أسهل)
```
CMD (كـ Administrator):
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  start-production.bat
```

### الطريقة 2: يدوياً عبر PM2
```
CMD:
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  pm2 start ecosystem.config.js --env production
  pm2 save
```

### الطريقة 3: عبر npm script
```
CMD:
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  pnpm run start:pm2
```

### التحقق من التشغيل
```
CMD:
  pm2 status
```

يجب أن ترى 3 عمليات:
| Name | Status | Port |
|------|--------|------|
| ltt-api-server | online | 8080 |
| ltt-platform | online | 20147 |
| ltt-agent-form | online | 5173 |

ثم اختبر من متصفح على أي جهاز في الشبكة:
- http://192.168.1.50:20147 ← لوحة الإدارة
- http://192.168.1.50:5173 ← نموذج التفتيش
- http://192.168.1.50:8080/api/health ← API (يفضل JSON للتحقق)

---

## 📊 إدارة الخدمات عبر PM2

### الحالة
```
CMD:
  pm2 status               # عرض حالة جميع الخدمات
  pm2 show ltt-api-server  # تفاصيل خدمة معينة
```

### الإيقاف
```
CMD:
  pm2 stop all                # إيقاف الكل
  pm2 stop ltt-api-server     # إيقاف خدمة معينة
```

### إعادة التشغيل
```
CMD:
  pm2 restart all             # إعادة تشغيل الكل
  pm2 restart ltt-api-server  # إعادة تشغيل خدمة معينة
  pm2 reload all              # reload بدون downtime
```

### المشاهدة الحية (Monitor)
```
CMD:
  pm2 monit              # واجهة مراقبة تفاعلية
  pm2 status             # جدول الحالة
  pm2 list               # قائمة الخدمات
```

### السجلات (Logs)
```
CMD:
  pm2 logs               # عرض كل السجلات
  pm2 logs ltt-api-server --lines 100   # آخر 100 سطر
  pm2 logs ltt-platform --lines 50
  pm2 logs ltt-agent-form --lines 50
  pm2 logs --json        # سجلات بصيغة JSON
  pm2 flush              # مسح جميع السجلات
```

### PM2 Startup (التشغيل التلقائي بعد إعادة تشغيل Windows)
```
CMD (كـ Administrator):
  pm2 startup
  pm2 save
```
⚠️ سيُنشئ هذا الأمر سكريبت بدء تشغيل تلقائي لـ PM2 عند إقلاع Windows.

### حفظ واستعادة قائمة العمليات
```
CMD:
  pm2 save          # حفظ القائمة الحالية
  pm2 resurrect     # استعادة القائمة (بعد إعادة التشغيل)
```

---

## 💾 النسخ الاحتياطي (Backup)

### الطريقة 1: سكريبت النسخ الاحتياطي
```
CMD:
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  backup-database.bat
```
سينشئ ملف نسخ في:
`deployment/production/backups/ltt_platform_YYYY-MM-DD_HH-MM.zip`

### الطريقة 2: إنشاء جدولة أسبوعية (Task Scheduler)

1. افتح **Task Scheduler**
2. اختر "Create Basic Task..."
3. الاسم: `LTT - Database Backup`
4. المشغّل (Trigger): **Daily** الساعة 2:00 ص
5. الإجراء (Action): **Start a program**
6. Program: `C:\Users\m.adel\Desktop\Agent-Management-Platform\backup-database.bat`
7. ✅ "Run whether user is logged on or not"
8. ✅ "Run with highest privileges"

### الطريقة 3: يدوياً عبر pg_dump
```
CMD:
  "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" ^
    -h 127.0.0.1 ^
    -U ltt_admin ^
    -d ltt_platform ^
    -F c ^
    -b ^
    -f "C:\Users\m.adel\Desktop\Agent-Management-Platform\deployment\production\backups\manual_backup.sql"
```

### الاحتفاظ بالنسخ
- السكريبت يحذف تلقائياً النسخ الأقدم من **30 يوماً**
- يمكنك تعديل المدة في `backup-database.bat` (معامل `-d 30`)

---

## 🔄 استعادة النسخ الاحتياطي (Restore)

### عبر pg_restore
```
CMD:
  "C:\Program Files\PostgreSQL\16\bin\pg_restore.exe" ^
    -h 127.0.0.1 ^
    -U ltt_admin ^
    -d ltt_platform ^
    -c ^
    "C:\Users\m.adel\Desktop\Agent-Management-Platform\deployment\production\backups\ltt_platform_FILE_NAME.sql"
```

### عبر psql (ملفات SQL نصية)
```
CMD:
  psql -h 127.0.0.1 -U ltt_admin -d ltt_platform -f backup_file.sql
```

⚠️ **تنبيه**: الاستعادة ستحذف جميع البيانات الموجودة قبل الاستعادة!

---

## 🔄 تحديث النظام (Update)

### خطوات التحديث الروتيني:

```
CMD:
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform

  الخطوة 1: نسخ احتياطي
  backup-database.bat

  الخطوة 2: سحب التحديثات من Git
  git pull origin main

  الخطوة 3: تثبيت الاعتماديات الجديدة
  pnpm install --prod=false

  الخطوة 4: بناء المكتبات
  pnpm run build:libs

  الخطوة 5: بناء التطبيقات
  pnpm run build:production

  الخطوة 6: تحديث قاعدة البيانات
  pnpm run db:push

  الخطوة 7: إعادة تشغيل الخدمات
  pm2 reload all

  الخطوة 8: التحقق
  pm2 status
  curl http://192.168.1.50:8080/api/health
```

### تحديث سريع (تغيير كود فقط بدون DB)
```
CMD:
  git pull origin main
  pnpm run build:production
  pm2 reload all
```

---

## ⚡ إعادة التشغيل بعد انقطاع الكهرباء

### خطوات الاستعادة الكاملة:

```
الخطوة 1: تشغيل السيرفر
  اضغط زر التشغيل → انتظر حتى يفتح Windows

الخطوة 2: تشغيل PostgreSQL
  CMD (كـ Administrator):
    net start postgresql-x64-16

  أو اذهب إلى Services.msc → PostgreSQL → Start

الخطوة 3: التحقق من PostgreSQL
  CMD:
    psql -U ltt_admin -d ltt_platform -c "SELECT NOW();"
    (كلمة السر: التي حددتها في .env.production)

الخطوة 4: تشغيل PM2 واستعادة الخدمات
  CMD:
    cd C:\Users\m.adel\Desktop\Agent-Management-Platform
    pm2 resurrect
    pm2 status

الخطوة 5: التحقق من جميع الخدمات
  افتح المتصفح واختبر:
    http://192.168.1.50:20147
    http://192.168.1.50:5173
    http://192.168.1.50:8080/api/health
```

### إذا لم يعمل pm2 resurrect:
```
CMD:
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  pm2 start ecosystem.config.js --env production
  pm2 save
```

### إذا لم يعمل PM2 أصلاً:
```
CMD:
  npm install -g pm2
  cd C:\Users\m.adel\Desktop\Agent-Management-Platform
  pm2 start ecosystem.config.js --env production
  pm2 save
  pm2 startup
```

---

## 📈 مراقبة النظام (Monitoring)

### PM2 Dashboard
```
CMD:
  pm2 monit
```
يعرض: CPU, Memory, Logs لكل خدمة بشكل حي.

### PM2 Status
```
CMD:
  pm2 status
```

### PM2 Logs
```
CMD:
  pm2 logs               # جميع الخدمات
  pm2 logs --lines 200   # آخر 200 سطر
```

### نقطة التحقق الصحية (Health Check)
```
CMD:
  curl http://192.168.1.50:8080/api/health
```

الرد المتوقع:
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "production",
  "memory": { ... },
  "version": "v24.x.x"
}
```

### مراقبة موارد Windows
```
CMD:
  tasklist | findstr node      # عمليات Node.js
  tasklist | findstr postgres  # عمليات PostgreSQL
  wmic cpu get loadpercentage  # استخدام المعالج
```

---

## ❌ استكشاف الأخطاء (Troubleshooting)

### 1. المنفذ مشغول (Port already in use)
```
CMD:
  netstat -ano | findstr :8080
  netstat -ano | findstr :20147
  netstat -ano | findstr :5173
```
إذا كان المنفذ مشغولاً:
```
  taskkill /PID <PID> /F
```

### 2. فشل الاتصال بقاعدة البيانات
```
تحقق من:
  1. PostgreSQL service running → net start postgresql-x64-16
  2. Password in .env.production matches
  3. User exists: psql -U postgres -c "\du"
  4. Database exists: psql -U postgres -c "\l"
  5. Port: psql -U postgres -p 5432
```

### 3. PM2 لا يبدأ
```
CMD:
  pm2 kill
  pm2 start ecosystem.config.js --env production
  pm2 save
```

### 4. CORS Error في المتصفح
```
تحقق من:
  1. .env.production → CORS_ORIGIN يحتوي على URL المتصفح
  2. Express server يستخدم الـ corsOptions الصحيحة
  3. IP السيرفر ثابت (192.168.1.50)
```

### 5. خطأ 404 بعد البناء
```
تحقق من:
  1. Vite base path: '/'
  2. الملفات موجودة في dist/:
     dir artifacts\ltt-platform\dist
     dir artifacts\agent-request-form\dist
```

### 6. الملفات المرفوعة لا تظهر
```
تحقق من:
  1. مجلد uploads موجود:
     dir deployment\production\uploads
  2. Express static serving يعمل:
     app.use('/uploads', express.static(uploadDir));
```

---

## 🩺 نقاط Endpoint الصحية

### Health Check
```
GET http://192.168.1.50:8080/api/health
```

### قاعدة البيانات
```
GET http://192.168.1.50:8080/api/health/db
```

### API Root
```
GET http://192.168.1.50:8080/api
```

---

## 🔒 أمان إضافي

### 1. تغيير كلمة سر PostgreSQL
```sql
ALTER USER ltt_admin WITH PASSWORD 'NewStrongPass123!';
```
ثم حدث `DB_PASSWORD` في `.env.production`.

### 2. تعطيل تسجيل الدخول عن بعد لـ PostgreSQL
في `pg_hba.conf`:
```
# Allow only local connections
host    all             all             127.0.0.1/32            md5
# host    all             all             0.0.0.0/0               reject
```
ثم أعد تشغيل PostgreSQL.

### 3. استخدام HTTPS (للمستقبل)
لإضافة SSL لاحقاً:
1. استخدم IIS Reverse Proxy مع SSL
2. أو استخدم Nginx على Windows
3. أو استخدم Let's Encrypt مع Certbot

### 4. PM2 Hardening
```
CMD:
  pm2 unstartup            # إذا كنت لا تريد التشغيل التلقائي
  pm2 startup              # للتشغيل التلقائي الآمن
```

---

## 📝 ملخص أوامر CMD

### التنقل
```cmd
cd C:\Users\m.adel\Desktop\Agent-Management-Platform
```

### البناء
```cmd
pnpm install --prod=false
pnpm run build:libs
pnpm run build:production
```

### التشغيل
```cmd
pm2 start ecosystem.config.js --env production
pm2 save
```

### الإدارة
```cmd
pm2 status          # الحالة
pm2 logs            # السجلات
pm2 monit           # مراقبة حية
pm2 restart all     # إعادة تشغيل
pm2 stop all        # إيقاف
pm2 reload all      # إعادة تحميل
```

### الصيانة
```cmd
backup-database.bat           # نسخ احتياطي
pnpm run db:push              # تحديث DB schema
pm2 resurrect                  # استعادة بعد انقطاع الكهرباء
```

### اختبر
```cmd
curl http://192.168.1.50:8080/api/health
```

---

## 🏁 التحقق النهائي

بعد إكمال جميع الخطوات، استخدم قائمة التحقق التالية:

- [ ] PostgreSQL يعمل (`net start postgresql-x64-16`)
- [ ] قاعدة البيانات منشأة (`psql -U ltt_admin -d ltt_platform -c "SELECT 1"`)
- [ ] الـ Schema مدفوع (`pnpm run db:push`)
- [ ] PM2 service running (`pm2 status`)
- [ ] API متاح (`curl http://192.168.1.50:8080/api/health`)
- [ ] Platform متاح (`http://192.168.1.50:20147` في المتصفح)
- [ ] Form متاح (`http://192.168.1.50:5173` في المتصفح)
- [ ] جدار الحماية مفتوح للمنافذ الثلاثة
- [ ] PM2 startup مفعل (`pm2 startup` + `pm2 save`)
- [ ] النسخ الاحتياطي مجدول في Task Scheduler
- [ ] `.env.production` بكلمات سر آمنة وIP صحيح
- [ ] يمكن الوصول من أجهزة الشبكة الداخلية

---

> **تم إعداد دليل النشر بواسطة DevOps Engineer**
> **LTT Agent Management Platform - Internal Production Deployment**
> **آخر تحديث: مايو 2026**
