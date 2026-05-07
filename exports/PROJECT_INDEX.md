# فهرس مشروع LTT Sales Platform

> دليل مرجعي شامل: هيكل المشروع، الأكواد حسب اللغة، وطبقات الحماية.

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| اسم المشروع | LTT Sales Platform — نظام متابعة الوكلاء وعمليات المراكز |
| الجهة | Libya Telecom & Technology — قسم التجزئة، المنطقة الغربية |
| النوع | Monorepo (pnpm workspaces) |
| إجمالي ملفات الكود | 281 ملف |
| إجمالي أسطر TS/TSX | **32,482 سطر** |
| اللغات الأساسية | TypeScript, TSX (React), SQL, CSS, HTML |

---

## 2. الأكواد حسب اللغة

| اللغة | الامتداد | عدد الملفات | الاستخدام |
|---|---|---:|---|
| TypeScript React | `.tsx` | 192 | واجهات React (صفحات + مكونات UI) |
| TypeScript | `.ts` | 59 | منطق الخادم، مخطط قاعدة البيانات، الأدوات المساعدة |
| JSON | `.json` | 18 | إعدادات الحزم وtsconfig وOpenAPI |
| TOML | `.toml` | 4 | إعدادات artifacts (`artifact.toml`) |
| HTML | `.html` | 3 | نقطة الدخول لكل تطبيق Vite |
| CSS | `.css` | 3 | أنماط Tailwind v4 لكل تطبيق |
| YAML | `.yaml` | 1 | `pnpm-workspace.yaml` |
| SQL | `.sql` | 1 | `seed-snapshot.sql` (بيانات أولية) |

---

## 3. هيكل المجلدات (Monorepo)

```
artifacts-monorepo/
├── artifacts/                    ← التطبيقات القابلة للنشر
│   ├── ltt-platform/             ← لوحة الإدارة (React+Vite) → /
│   ├── agent-request-form/       ← نموذج التفتيش الميداني (React+Vite) → /form/
│   ├── api-server/               ← خادم Express 5 → /api
│   └── mockup-sandbox/           ← بيئة معاينة المكونات
├── lib/                          ← مكتبات مشتركة
│   ├── db/                       ← مخطط Drizzle ORM
│   ├── api-spec/                 ← مواصفات OpenAPI + Orval
│   ├── api-zod/                  ← مخططات Zod (مولّدة)
│   └── api-client-react/         ← React Query hooks (مولّدة)
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

---

## 4. فهرس الواجهة الأمامية — لوحة الإدارة (`artifacts/ltt-platform`)

### 4.1 الصفحات (`src/pages/`)

| الملف | المسار | الوصف |
|---|---|---|
| `Login.tsx` | `/login` | تسجيل الدخول (بريد + كلمة مرور) |
| `Dashboard.tsx` | `/` | بطاقات KPI، تنبيهات الوثائق، رسوم بيانية، تذاكرك |
| `Agents.tsx` | `/agents` | إدارة الوكلاء (190+) مع بطاقات تصنيف ووثائق |
| `Documents.tsx` | `/documents` | التراخيص والمستندات مع تتبع الانتهاء |
| `Entities.tsx` | `/entities` | كيانات الشركة (مراكز خدمة، نقاط بيع، سيارات متنقلة) |
| `Inspections.tsx` | `/inspections` | تقارير التفتيش (للأدمن فقط) |
| `MapView.tsx` | `/map` | خريطة Leaflet تفاعلية لكل النقاط |
| `Tickets.tsx` | `/tickets` | إدارة التذاكر مع منتقي خرائط |
| `Analytics.tsx` | `/analytics` | تحليلات متعددة الرسوم البيانية |
| `Inventory.tsx` | `/inventory` | المخزون والتنبيهات |
| `Users.tsx` | `/users` | إدارة المستخدمين (إضافة/تعديل/حذف — أدمن) |
| `not-found.tsx` | * | صفحة 404 |

### 4.2 المكونات الخاصة (`src/components/`)

| الملف | الوظيفة |
|---|---|
| `Sidebar.tsx` | شريط التنقل الجانبي (RTL) |
| `MapPicker.tsx` | منتقي إحداثيات على خريطة Leaflet |
| `UserModal.tsx` | نافذة إضافة/تعديل المستخدمين |
| `ui/*.tsx` (54 ملف) | مكتبة shadcn/ui |

### 4.3 الأدوات المساعدة (`src/lib/`)

| الملف | الوظيفة |
|---|---|
| `api.ts` | عميل HTTP (`get/post/patch/delete`) مع توكن تلقائي |
| `auth.ts` | إدارة جلسة المستخدم في localStorage |
| `documentStatus.ts` | حساب حالة المستندات (منتهي/سينتهي/سارٍ) |
| `exportCsv.ts` | تصدير CSV |
| `utils.ts` | `cn()` لدمج Tailwind classes |

---

## 5. فهرس الواجهة الأمامية — نموذج التفتيش (`artifacts/agent-request-form`)

| الملف | الوظيفة |
|---|---|
| `pages/Login.tsx` | تسجيل دخول المفتش |
| `pages/AgentRequestForm.tsx` | النموذج الرئيسي (تفتيش / وكيل جديد، GPS، رفع صور، تقييم) |
| `data/agentsList.ts` | قائمة احتياطية (المصدر الأساسي = API) |

---

## 6. فهرس الخادم (`artifacts/api-server`)

### 6.1 نقطة الدخول والإعداد

| الملف | الوظيفة |
|---|---|
| `src/index.ts` | تشغيل الخادم على PORT |
| `src/app.ts` | إعداد Express (middlewares + routes) |
| `src/lib/logger.ts` | Logger pino (لا تستخدم console.log) |
| `src/lib/auth.ts` | توقيع HMAC والتحقق منه |
| `src/lib/scoring.ts` | حساب نقاط الوكلاء |
| `src/lib/bootstrapData.ts` | البذر التلقائي عند الفراغ |
| `src/middlewares/requireAuth.ts` | حماية المسارات بالتوكن |

### 6.2 المسارات (`src/routes/`)

| الملف | المسارات الأساسية |
|---|---|
| `auth.ts` | `POST /api/auth/login`, `GET /api/auth/me` |
| `users.ts` | `GET/POST/PATCH/DELETE /api/users` |
| `agents.ts` | CRUD على `/api/agents` |
| `agentRequests.ts` | `/api/agent-requests` (متعدد الكيانات) |
| `documents.ts` | `/api/documents` + `/agent-status` |
| `inspections.ts` | تقارير التفتيش |
| `tickets.ts` | `/api/tickets` |
| `inventory.ts` | المخزون |
| `salesLogs.ts` | سجلات المبيعات |
| `scores.ts` | نقاط الوكلاء |
| `notifications.ts` | الإشعارات |
| `dashboard.ts` | إحصاءات لوحة التحكم |
| `admin.ts` | `POST /api/admin/reseed` (أدمن فقط) |
| `health.ts` | `GET /api/healthz` |
| `index.ts` | تجميع كل المسارات |

---

## 7. فهرس قاعدة البيانات (`lib/db/src/schema/`)

| الجدول | الوصف |
|---|---|
| `users` | المستخدمون (19) — `fullName`, `email`, `passwordHash`, `role` |
| `agents` | الوكلاء (190+) — تصنيف A–E، خدمات، إحداثيات |
| `agentRequests` | جدول متعدد الأغراض (وكيل/مركز/POS/سيارة/تفتيش) |
| `agentDocuments` | المستندات + تواريخ الانتهاء |
| `documentHistory` | سجل تدقيق التغييرات |
| `agentScores` | تفاصيل التقييم |
| `inspections` | تقارير التفتيش |
| `tickets` | التذاكر — `createdById`, `assignedToId`, إحداثيات |
| `inventory` | المخزون |
| `salesLogs` | سجلات المبيعات |
| `notifications` | إشعارات المستخدمين |

---

## 8. فهرس عقد الـ API (`lib/api-spec`, `lib/api-zod`, `lib/api-client-react`)

| الملف | المحتوى |
|---|---|
| `api-spec/orval.config.ts` | إعداد توليد Orval |
| `api-zod/src/generated/api.ts` | مخططات Zod مولّدة من OpenAPI |
| `api-client-react/src/generated/api.ts` | React Query hooks مولّدة |
| `api-client-react/src/custom-fetch.ts` | عميل HTTP مخصص |

> تجديد المولّدات: `pnpm --filter @workspace/api-spec run codegen`

---

## 9. 🔒 طبقات الحماية (Security Layers)

### الطبقة 1 — حماية النقل (Transport)
| الآلية | التفاصيل |
|---|---|
| HTTPS / TLS | إجباري عبر بروكسي Replit في الإنتاج |
| Reverse Proxy | mTLS بين البروكسي والخدمة |
| المنافذ الداخلية | غير مكشوفة للإنترنت (الوصول فقط عبر `$REPLIT_DOMAINS`) |

### الطبقة 2 — المصادقة (Authentication)
| الآلية | الملف | التفاصيل |
|---|---|---|
| توقيع HMAC | `api-server/src/lib/auth.ts` | توقيع التوكن بـ `SESSION_SECRET` (سرّي بيئي) |
| تخزين كلمات المرور | `users.passwordHash` | تجزئة (hash) — لا يُرجَع أبداً في API |
| تخزين التوكن | localStorage `ltt_token` | يُرسَل في `Authorization: Bearer` |
| التحقق التلقائي | `middlewares/requireAuth.ts` | يضع `req.userId` بعد فك التوكن |

### الطبقة 3 — التفويض (Authorization / RBAC)
| المستوى | التطبيق |
|---|---|
| 9 أدوار | `admin`, `head_of_unit`, `indirect_sales`, `agent_affairs`, `inspection_team`, `technical_support`, `airport_team`, `centers_support`, `viewer` |
| فحص الأدمن للخادم | استعلام `usersTable.role === 'admin'` داخل المسارات الحساسة (`admin.ts`) |
| فحص الأدمن للواجهة | `getUser()?.role === 'admin'` يُخفي أزرار حذف/تعديل/مزامنة |
| المسارات المخفية | صفحة Inspections مخفية وغير محمّلة لغير الأدمن |
| منع الحذف الذاتي | لا يمكن للأدمن حذف حسابه (`getUser()?.id !== user.id`) |

### الطبقة 4 — التحقق من المدخلات (Input Validation)
| الآلية | الموقع |
|---|---|
| Zod schemas | كل مسارات الخادم تتحقق من body/params/query بـ Zod |
| توليد تلقائي | المخططات مولّدة من OpenAPI لضمان التطابق |
| فحص الأنواع | TypeScript strict مفعّل في كل المساحة |

### الطبقة 5 — حماية قاعدة البيانات
| الآلية | التفاصيل |
|---|---|
| Parameterized queries | Drizzle ORM يستخدم prepared statements (لا SQL injection) |
| FK constraints | علاقات مرجعية على كل المفاتيح الأجنبية |
| Migrations منضبطة | `pnpm --filter @workspace/db run push` |
| فصل بيئات | `DATABASE_URL` للتطوير، `PROD_DATABASE_URL` للإنتاج |
| نسخ احتياطية | snapshot SQL مضمّن في الخادم للبذر الطارئ |

### الطبقة 6 — حماية الجلسة والملفات
| الآلية | التفاصيل |
|---|---|
| تنظيف ردود API | `passwordHash` يُحذف من كل الردود قبل الإرسال |
| رفع الملفات | حدود حجم في multer + تخزين معزول `uploads/` |
| التحقق من نوع الملف | للصور فقط (JPEG/PNG/WebP) |
| CORS | مُقيَّد على نفس الأصل عبر البروكسي |

### الطبقة 7 — التدقيق والمراقبة (Audit & Monitoring)
| الآلية | الملف/الجدول |
|---|---|
| سجل تغييرات الوثائق | `document_history` (من، متى، ماذا) |
| Logger مهيكل | `pino` عبر `req.log` و `logger` |
| سجلات الإنتاج | `fetchDeploymentLogs` |
| فحوص الصحة | `GET /api/healthz` |

### الطبقة 8 — إدارة الأسرار (Secrets Management)
| المتغير | الاستخدام |
|---|---|
| `SESSION_SECRET` | توقيع توكن HMAC |
| `DATABASE_URL` | اتصال PostgreSQL (التطوير) |
| `PROD_DATABASE_URL` | اتصال الإنتاج |
| `PORT`, `BASE_PATH` | يُحقن من نظام Replit |

> 🚫 لا توجد مفاتيح API في الكود — كل الأسرار من البيئة فقط.

### الطبقة 9 — حواجز التشغيل في الإنتاج
| الآلية | التفاصيل |
|---|---|
| البذر التلقائي | يعمل فقط عندما `users` فارغ — لا يُكتب فوق بيانات موجودة |
| إعادة البذر اليدوية | `POST /api/admin/reseed` تتطلب توكن أدمن |
| تأكيد المتصفح | زر المزامنة يطلب تأكيد المستخدم قبل الحذف |
| تنظيف SQL | إزالة `\` meta-commands و`DISABLE TRIGGER` تلقائياً (Postgres المُدار يرفضها) |

---

## 10. أوامر سريعة

```bash
pnpm install                                          # تثبيت الحزم
pnpm run typecheck                                    # فحص الأنواع الكامل
pnpm run typecheck:libs                               # فحص المكتبات فقط
pnpm --filter @workspace/api-spec run codegen         # توليد hooks من OpenAPI
pnpm --filter @workspace/db run push                  # دفع المخطط لـ PostgreSQL
pnpm --filter @workspace/api-server run dev           # تشغيل الخادم محلياً
pnpm --filter @workspace/ltt-platform run dev         # تشغيل لوحة الإدارة
pnpm --filter @workspace/agent-request-form run dev   # تشغيل نموذج التفتيش
```

---

## 11. مفاتيح المسارات (للاستيعاب السريع)

| المنطقة | الملف الأهم |
|---|---|
| تسجيل الدخول | `artifacts/ltt-platform/src/pages/Login.tsx` + `api-server/src/routes/auth.ts` |
| إضافة/تعديل مستخدم | `artifacts/ltt-platform/src/components/UserModal.tsx` |
| حماية الأدمن | `getUser()?.role === 'admin'` في كل صفحة + `admin.ts` للخادم |
| البذر التلقائي | `artifacts/api-server/src/lib/bootstrapData.ts` |
| مخطط DB | `lib/db/src/schema/index.ts` (يصدّر كل الجداول) |
| توقيع التوكن | `artifacts/api-server/src/lib/auth.ts` |
| الواجهة العربية RTL | كل `index.html` يحتوي `dir="rtl"` + خط Cairo |

---

*تم إنشاء هذا الفهرس في 2026-05-07.*
