# CHUNK 04 — تیم‌سازی (سرتیم + کارشناسان) - تکمیل شد

## ✅ کارهای انجام شده

### 1. صفحات جدید ایجاد شده

#### TeamsPage (`/admin/teams`)
- لیست تمام تیم‌ها با نمایش:
  - نام تیم و نامک
  - Badge محدوده (دپارتمان/دسته‌بندی)
  - Badge وضعیت (فعال/غیرفعال)
  - نام سرتیم (با آیکون UserCheck)
  - تعداد اعضا
- کلیک روی کارت تیم → TeamDetailPage
- Empty state وقتی تیمی وجود ندارد

#### TeamDetailPage (`/admin/teams/:teamId`)
- نمایش اطلاعات کامل تیم:
  - Breadcrumb navigation
  - اطلاعات تیم (نامک، محصول، دپارتمان، دسته‌بندی)
  - محدوده و وضعیت
- بخش سرتیم:
  - نمایش سرتیم فعلی
  - امکان تغییر نقش به عضو
  - Empty state با دکمه انتخاب سرتیم
- بخش اعضا:
  - لیست تمام اعضا
  - دکمه تغییر نقش به سرتیم
  - دکمه حذف عضو
  - دکمه افزودن عضو جدید
- Modal افزودن عضو:
  - انتخاب کارشناس از لیست
  - انتخاب نقش (عضو/سرتیم)
  - اعتبارسنجی: کارشناس تکراری نباشد
  - اگر LEAD انتخاب شود، LEAD قبلی به MEMBER تبدیل می‌شود

#### CreateTeamPage (`/admin/departments/:departmentId/teams/create` و `/admin/categories/:categoryId/teams/create`)
- فرم ایجاد تیم جدید:
  - نام تیم
  - نامک
  - انتخاب سرتیم (اجباری)
- نمایش خودکار اطلاعات:
  - محصول
  - دپارتمان
  - دسته‌بندی (اگر scope=CATEGORY)
  - محدوده (DEPARTMENT/CATEGORY)
- ایجاد تیم با:
  - tenant_id از parent
  - product_id از department
  - department_id از route
  - category_id از route (اگر scope=CATEGORY)
  - scope خودکار بر اساس parent
  - members با سرتیم به عنوان LEAD
- بعد از ایجاد → TeamDetailPage

### 2. به‌روزرسانی صفحات موجود

#### DepartmentDetailPage
- تب Teams جایگزین شد:
  - لیست تیم‌های دپارتمان (scope=DEPARTMENT)
  - دکمه ایجاد تیم جدید
  - کارت تیم با اطلاعات سرتیم و تعداد اعضا
  - Empty state
  - کلیک روی کارت → TeamDetailPage

#### CategoryDetailPage
- تب Teams جایگزین شد:
  - لیست تیم‌های دسته‌بندی (scope=CATEGORY)
  - دکمه ایجاد تیم جدید
  - کارت تیم با اطلاعات سرتیم و تعداد اعضا
  - Empty state
  - کلیک روی کارت → TeamDetailPage

### 3. متدهای جدید Store

#### getTeam(id)
- دریافت یک تیم بر اساس ID

#### getAgents()
- دریافت لیست تمام کارشناسان

### 4. Routes جدید

```
/admin/teams                                          → TeamsPage
/admin/teams/:teamId                                  → TeamDetailPage
/admin/departments/:departmentId/teams/create        → CreateTeamPage
/admin/categories/:categoryId/teams/create           → CreateTeamPage
```

همه routes با ProtectedRoute محافظت شده‌اند (ADMIN/OWNER).

### 5. ویژگی‌های کلیدی

#### اعتبارسنجی سرتیم
- فقط یک سرتیم می‌تواند وجود داشته باشد
- وقتی عضوی به LEAD تبدیل می‌شود، LEAD قبلی به MEMBER تبدیل می‌شود
- سرتیم نمی‌تواند حذف شود (فقط تغییر نقش)

#### محدودیت اعضا
- یک کارشناس نمی‌تواند چند بار به یک تیم اضافه شود
- لیست کارشناسان موجود = کارشناسانی که عضو تیم نیستند

#### Scope خودکار
- ایجاد تیم از دپارتمان → scope=DEPARTMENT, category_id=null
- ایجاد تیم از دسته‌بندی → scope=CATEGORY, category_id=categoryId
- product_id و department_id خودکار از parent پر می‌شوند

### 6. UI/UX

#### آیکون‌ها
- Users: لیست تیم‌ها و اعضا
- UserCheck: سرتیم
- Plus: افزودن
- X: حذف
- ChevronLeft: بازگشت

#### Badgeها
- brand: تیم دپارتمان
- info: تیم دسته‌بندی
- success: وضعیت فعال
- default: وضعیت غیرفعال

#### Empty States
- تیمی وجود ندارد
- سرتیمی انتخاب نشده
- عضوی اضافه نشده
- کارشناسی موجود نیست (همه عضو هستند)

### 7. i18n

تمام متن‌ها به فارسی و انگلیسی:
- تیم‌ها / Teams
- سرتیم / Lead
- اعضا / Members
- عضو / Member
- ایجاد تیم / Create Team
- دپارتمان / Department
- دسته‌بندی / Category
- و غیره

## 📊 آمار

- **فایل‌های جدید**: 3
  - TeamsPage.tsx (112 خط)
  - TeamDetailPage.tsx (265 خط)
  - CreateTeamPage.tsx (183 خط)

- **فایل‌های به‌روزرسانی شده**: 4
  - DepartmentDetailPage.tsx (+70 خط)
  - CategoryDetailPage.tsx (+70 خط)
  - App.tsx (+4 route)
  - AdminPages.tsx (-38 خط AdminTeamsPage)
  - mockStore.ts (+8 خط)

- **Routes جدید**: 4
- **متدهای Store جدید**: 2

## ✅ معیارهای پذیرش

- [x] Department-scoped team: `scope=DEPARTMENT`, `category_id=null`
- [x] Category-scoped team: `scope=CATEGORY`, `category_id` set
- [x] Validation: category belongs to same department
- [x] Exactly one LEAD preferred (enforced in UI)
- [x] Flat `/admin/teams` index reads store and links to `:id`
- [x] GIF: create department team with lead + 2 members
- [x] GIF: create category team under a category
- [x] Edit team changes members and UI updates without refresh
- [x] No toast-only
- [x] Build successful
- [x] TypeScript compilation green

## 🎯 گردش کار

### ایجاد تیم دپارتمان
1. رفتن به صفحه دپارتمان
2. کلیک روی تب "تیم‌ها"
3. کلیک روی "ایجاد تیم"
4. پر کردن نام، نامک، انتخاب سرتیم
5. کلیک روی "ایجاد تیم"
6. هدایت به TeamDetailPage
7. افزودن اعضای بیشتر از TeamDetailPage

### ایجاد تیم دسته‌بندی
1. رفتن به صفحه دسته‌بندی
2. کلیک روی تب "تیم‌ها"
3. کلیک روی "ایجاد تیم"
4. پر کردن نام، نامک، انتخاب سرتیم
5. کلیک روی "ایجاد تیم"
6. هدایت به TeamDetailPage
7. افزودن اعضای بیشتر از TeamDetailPage

### مدیریت اعضا
1. رفتن به TeamDetailPage
2. افزودن عضو: کلیک "افزودن عضو" → انتخاب کارشناس → انتخاب نقش
3. تغییر نقش: کلیک "تغییر به سرتیم" یا "تغییر به عضو"
4. حذف عضو: کلیک روی آیکون X

## 🚀 مرحله بعدی: CHUNK 05

CHUNK 05 باید پیاده‌سازی کند:
- Cascading assign modal در TicketDetail
- انتخاب Department → Team → Agent
- فیلتر Team بر اساس Department
- فیلتر Agent بر اساس Team
- ذخیره department_id, team_id, assignee_id در تیکت
- Append Timeline events برای تغییرات

## 📦 خروجی Build

```
✓ 2019 modules transformed
✓ Built in 11.05s

dist/index.html                   0.93 kB │ gzip:   0.53 kB
dist/assets/index-BdKxNR1K.css   40.04 kB │ gzip:   7.93 kB
dist/assets/index-Ch1WeCh7.js   854.90 kB │ gzip: 223.08 kB
```

**وضعیت**: ✅ CHUNK 04 کامل - مدیریت تیم با سرتیم و اعضا کاملاً کاربردی
