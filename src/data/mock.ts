import type { Ticket, Customer, Message, Category, Department, Team, Agent, Product, SLAPolicy, KnowledgeBase, Article, Webhook, APIClient, AuditLog, AIAnalysis, AISuggestion, SearchResult, AnalyticsData, User, Tenant, Topic } from '../types';

// Tenants
export const mockTenants: Tenant[] = [
  { id: 'ten-1', name: 'شرکت فینو', slug: 'fino-company', status: 'ACTIVE', owner_user_id: 'u-001', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'ten-2', name: 'شرکت آزمایشی', slug: 'test-company', status: 'SUSPENDED', owner_user_id: 'u-010', created_at: '2024-02-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
];

// Users
export const mockUser: User = {
  id: 'u-001',
  tenant_id: 'ten-1',
  console: 'tenant',
  email: 'admin@finoticket.ir',
  display_name: 'علی محمدی',
  role: 'ADMIN',
  presence: 'ONLINE',
  timezone: 'Asia/Tehran',
  language: 'fa',
  status: 'ACTIVE',
  created_at: '2024-01-01T00:00:00Z',
  avatar_url: '',
};

export const mockPlatformUser: User = {
  id: 'u-platform-001',
  tenant_id: undefined,
  console: 'platform',
  email: 'super@fino.local',
  display_name: 'Super Admin',
  role: 'PLATFORM_OWNER',
  presence: 'ONLINE',
  timezone: 'Asia/Tehran',
  language: 'fa',
  status: 'ACTIVE',
  created_at: '2024-01-01T00:00:00Z',
  avatar_url: '',
};

// Products (under tenant)
export const mockProducts: Product[] = [
  { id: 'p-001', tenant_id: 'ten-1', name: 'فینوپال', slug: 'finopal', status: 'ACTIVE', settings: {}, channels: ['WEB', 'WIDGET', 'EMAIL', 'API'], widget_branding: { primary_color: '#0B7C8C', welcome_text: 'سلام! چطور می‌تونیم کمکتون کنیم؟', title: 'پشتیبانی فینوپال' }, created_at: '2024-01-01' },
  { id: 'p-002', tenant_id: 'ten-1', name: 'فینوآی‌دی', slug: 'finoid', status: 'ACTIVE', settings: {}, channels: ['WEB', 'WIDGET', 'CHAT'], widget_branding: { primary_color: '#0891B2', welcome_text: 'پشتیبانی هویت دیجیتال', title: 'پشتیبانی فینوآی‌دی' }, created_at: '2024-02-01' },
  { id: 'p-003', tenant_id: 'ten-1', name: 'فینوبیت', slug: 'finobit', status: 'SUSPENDED', settings: {}, channels: ['WEB', 'EMAIL'], created_at: '2024-03-01' },
];

export const mockCustomers: Customer[] = [
  { id: 'c-001', display_name: 'سارا احمدی', status: 'ACTIVE', profile: { first_name: 'سارا', last_name: 'احمدی', email: 'sara@example.com', mobile: '09121234567' }, identities: [{ id: 'id-1', provider: 'FINOID', provider_user_id: 'fino-123', verification_status: 'VERIFIED' }], addresses: [{ id: 'a-1', type: 'HOME', title: 'منزل', address: 'تهران، خیابان ولیعصر', city: 'تهران', country: 'ایران' }], tags: ['vip', 'حقوقی'], created_at: '2024-01-15' },
  { id: 'c-002', display_name: 'رضا کریمی', status: 'ACTIVE', profile: { first_name: 'رضا', last_name: 'کریمی', email: 'reza@example.com', mobile: '09131234567' }, identities: [], addresses: [], tags: [], created_at: '2024-02-20' },
  { id: 'c-003', display_name: 'مریم حسینی', status: 'INACTIVE', profile: { first_name: 'مریم', last_name: 'حسینی', email: 'maryam@example.com' }, identities: [{ id: 'id-2', provider: 'FINOPAL', provider_user_id: 'fp-456', verification_status: 'UNVERIFIED' }], addresses: [], tags: ['تست'], created_at: '2024-03-10' },
];

// Tickets (under tenant)
export const mockTickets: Ticket[] = [
  { id: 't-001', tenant_id: 'ten-1', ticket_number: 'FT-1001', subject: 'مشکل در ورود به حساب کاربری', description: 'کاربر نمی‌تواند وارد حساب شود', status: 'OPEN', priority: 'HIGH', product_id: 'p-001', product_name: 'فینوپال', customer_id: 'c-001', customer_name: 'سارا احمدی', category_id: 'cat-1', category_name: 'احراز هویت', topic_id: 'topic-1', topic_name: 'مشکل ورود', department_id: 'd-1', department_name: 'فنی', team_id: 'tm-1', team_name: 'پشتیبانی فنی', assignee_id: 'u-001', assignee_name: 'علی محمدی', channel: 'WEB', source: 'widget', tags: ['login', 'urgent'], watchers: ['u-001', 'u-002'], sla_policy_id: 'sla-1', sla_status: 'WARNING', sla_first_response_due: '2024-12-20T14:00:00Z', created_at: '2024-12-20T10:00:00Z', updated_at: '2024-12-20T12:00:00Z' },
  { id: 't-002', tenant_id: 'ten-1', ticket_number: 'FT-1002', subject: 'درخواست تغییر شماره موبایل', status: 'IN_PROGRESS', priority: 'NORMAL', product_id: 'p-001', product_name: 'فینوپال', customer_id: 'c-002', customer_name: 'رضا کریمی', category_id: 'cat-2', category_name: 'حساب کاربری', department_id: 'd-1', department_name: 'فنی', assignee_id: 'u-001', assignee_name: 'علی محمدی', channel: 'EMAIL', source: 'email', tags: [], watchers: ['u-001'], sla_status: 'ON_TRACK', created_at: '2024-12-19T08:00:00Z', updated_at: '2024-12-20T09:00:00Z' },
  { id: 't-003', tenant_id: 'ten-1', ticket_number: 'FT-1003', subject: 'خطای ۵۰۰ در صفحه پرداخت', status: 'OPEN', priority: 'CRITICAL', product_id: 'p-002', product_name: 'فینوآی‌دی', customer_id: 'c-003', customer_name: 'مریم حسینی', category_id: 'cat-3', category_name: 'پرداخت', topic_id: 'topic-6', topic_name: 'خطای پرداخت', department_id: 'd-2', department_name: 'مالی', channel: 'WIDGET', source: 'widget', tags: ['bug', 'payment'], watchers: [], sla_status: 'BREACHED', sla_first_response_due: '2024-12-19T10:00:00Z', created_at: '2024-12-19T09:00:00Z', updated_at: '2024-12-19T09:00:00Z' },
  { id: 't-004', tenant_id: 'ten-1', ticket_number: 'FT-1004', subject: 'سوال درباره کارمزد انتقال', status: 'WAITING_CUSTOMER', priority: 'LOW', product_id: 'p-001', product_name: 'فینوپال', customer_id: 'c-001', customer_name: 'سارا احمدی', category_id: 'cat-4', category_name: 'عمومی', channel: 'CHAT', source: 'chat', tags: [], watchers: [], sla_status: 'ON_TRACK', created_at: '2024-12-18T14:00:00Z', updated_at: '2024-12-19T16:00:00Z' },
  { id: 't-005', tenant_id: 'ten-1', ticket_number: 'FT-1005', subject: 'درخواست حذف حساب', status: 'RESOLVED', priority: 'NORMAL', product_id: 'p-001', product_name: 'فینوپال', customer_id: 'c-002', customer_name: 'رضا کریمی', category_id: 'cat-2', category_name: 'حساب کاربری', assignee_id: 'u-002', assignee_name: 'فاطمه رضایی', channel: 'WEB', source: 'web', tags: [], watchers: [], sla_status: 'ON_TRACK', resolved_at: '2024-12-17T12:00:00Z', created_at: '2024-12-15T10:00:00Z', updated_at: '2024-12-17T12:00:00Z' },
  { id: 't-006', tenant_id: 'ten-1', ticket_number: 'FT-1006', subject: 'عدم دریافت کد تایید پیامکی', status: 'OPEN', priority: 'HIGH', product_id: 'p-002', product_name: 'فینوآی‌دی', customer_id: 'c-003', customer_name: 'مریم حسینی', category_id: 'cat-1', category_name: 'احراز هویت', topic_id: 'topic-2', topic_name: 'فراموشی رمز', channel: 'SMS', source: 'sms', tags: ['sms', 'otp'], watchers: [], sla_status: 'WARNING', created_at: '2024-12-20T11:00:00Z', updated_at: '2024-12-20T11:00:00Z' },
];

export const mockMessages: Message[] = [
  { id: 'm-001', ticket_id: 't-001', sender_type: 'CUSTOMER', sender_id: 'c-001', sender_name: 'سارا احمدی', body: 'سلام، من نمی‌تونم وارد حساب کاربریم بشم. خطای "اطلاعات ورود نامعتبر" نمایش داده میشه. لطفاً بررسی کنید.', is_internal: false, channel: 'WEB', attachments: [], created_at: '2024-12-20T10:00:00Z' },
  { id: 'm-002', ticket_id: 't-001', sender_type: 'AGENT', sender_id: 'u-001', sender_name: 'علی محمدی', body: 'سلام سارا خانم. لطفاً مرورگر خود را به‌روزرسانی کنید و مجدداً تلاش کنید.', is_internal: false, channel: 'WEB', attachments: [], created_at: '2024-12-20T10:30:00Z' },
  { id: 'm-003', ticket_id: 't-001', sender_type: 'AGENT', sender_id: 'u-001', sender_name: 'علی محمدی', body: 'بررسی شد - احتمالاً مشکل از سمت سرور احراز هویت است. باید به تیم فنی ارجاع بدیم.', is_internal: true, channel: 'WEB', attachments: [], created_at: '2024-12-20T10:35:00Z' },
  { id: 'm-004', ticket_id: 't-001', sender_type: 'CUSTOMER', sender_id: 'c-001', sender_name: 'سارا احمدی', body: 'ممنون. مرورگر رو آپدیت کردم ولی هنوز مشکل دارم. اسکرین‌شات ضمیمه کردم.', is_internal: false, channel: 'WEB', attachments: [{ id: 'att-1', filename: 'screenshot.png', mime_type: 'image/png', size: 245000, url: '#' }], created_at: '2024-12-20T11:00:00Z' },
  
  // t-002 messages
  { id: 'm-005', ticket_id: 't-002', sender_type: 'CUSTOMER', sender_id: 'c-002', sender_name: 'رضا کریمی', body: 'سلام، می‌خواستم شماره موبایلم رو تغییر بدم. شماره قدیمی: 09131234567، شماره جدید: 09129876543', is_internal: false, channel: 'EMAIL', attachments: [], created_at: '2024-12-19T08:00:00Z' },
  { id: 'm-006', ticket_id: 't-002', sender_type: 'AGENT', sender_id: 'u-001', sender_name: 'علی محمدی', body: 'سلام رضا آقا. برای تغییر شماره موبایل، لطفاً تصویر کارت ملی خود را ارسال کنید.', is_internal: false, channel: 'EMAIL', attachments: [], created_at: '2024-12-19T09:00:00Z' },
  
  // t-003 messages
  { id: 'm-007', ticket_id: 't-003', sender_type: 'CUSTOMER', sender_id: 'c-003', sender_name: 'مریم حسینی', body: 'سلام، هنگام پرداخت با خطای 500 مواجه می‌شم. لطفاً بررسی کنید.', is_internal: false, channel: 'WIDGET', attachments: [], created_at: '2024-12-19T09:00:00Z' },
  
  // t-004 messages
  { id: 'm-008', ticket_id: 't-004', sender_type: 'CUSTOMER', sender_id: 'c-001', sender_name: 'سارا احمدی', body: 'سلام، کارمزد انتقال وجه چقدره؟', is_internal: false, channel: 'CHAT', attachments: [], created_at: '2024-12-18T14:00:00Z' },
  { id: 'm-009', ticket_id: 't-004', sender_type: 'AGENT', sender_id: 'u-001', sender_name: 'علی محمدی', body: 'سلام سارا خانم. کارمزد انتقال وجه 0.5 درصد است. آیا سوال دیگری دارید؟', is_internal: false, channel: 'CHAT', attachments: [], created_at: '2024-12-18T14:30:00Z' },
  
  // t-005 messages
  { id: 'm-010', ticket_id: 't-005', sender_type: 'CUSTOMER', sender_id: 'c-002', sender_name: 'رضا کریمی', body: 'سلام، می‌خواستم حساب کاربریم رو حذف کنید.', is_internal: false, channel: 'WEB', attachments: [], created_at: '2024-12-15T10:00:00Z' },
  { id: 'm-011', ticket_id: 't-005', sender_type: 'AGENT', sender_id: 'u-002', sender_name: 'فاطمه رضایی', body: 'سلام رضا آقا. درخواست حذف حساب شما ثبت شد. ظرف 48 ساعت آینده حساب شما حذف خواهد شد.', is_internal: false, channel: 'WEB', attachments: [], created_at: '2024-12-15T11:00:00Z' },
  
  // t-006 messages
  { id: 'm-012', ticket_id: 't-006', sender_type: 'CUSTOMER', sender_id: 'c-003', sender_name: 'مریم حسینی', body: 'سلام، کد تایید پیامکی دریافت نمی‌کنم. شماره موبایلم 09123456789 هست.', is_internal: false, channel: 'SMS', attachments: [], created_at: '2024-12-20T11:00:00Z' },
];

// Categories (under departments)
export const mockCategories: Category[] = [
  // Department d-1 (فنی) categories
  { id: 'cat-1', tenant_id: 'ten-1', department_id: 'd-1', name: 'احراز هویت', slug: 'auth', status: 'ACTIVE', sort_order: 1, children: [] },
  { id: 'cat-2', tenant_id: 'ten-1', department_id: 'd-1', name: 'حساب کاربری', slug: 'account', status: 'ACTIVE', sort_order: 2, children: [] },
  // Department d-2 (مالی) categories
  { id: 'cat-3', tenant_id: 'ten-1', department_id: 'd-2', name: 'پرداخت', slug: 'payment', status: 'ACTIVE', sort_order: 1, children: [] },
  { id: 'cat-4', tenant_id: 'ten-1', department_id: 'd-2', name: 'کارمزد', slug: 'fee', status: 'ACTIVE', sort_order: 2, children: [] },
  // Department d-3 (پشتیبانی) categories
  { id: 'cat-5', tenant_id: 'ten-1', department_id: 'd-3', name: 'عمومی', slug: 'general', status: 'ACTIVE', sort_order: 1, children: [] },
  // Department d-4 (فنی هویت) categories
  { id: 'cat-6', tenant_id: 'ten-1', department_id: 'd-4', name: 'تایید هویت', slug: 'identity-verify', status: 'ACTIVE', sort_order: 1, children: [] },
];

// Departments (under products)
export const mockDepartments: Department[] = [
  // Product p-001 (فینوپال) departments
  { id: 'd-1', tenant_id: 'ten-1', product_id: 'p-001', name: 'فنی', slug: 'tech', status: 'ACTIVE' },
  { id: 'd-2', tenant_id: 'ten-1', product_id: 'p-001', name: 'مالی', slug: 'finance', status: 'ACTIVE' },
  { id: 'd-3', tenant_id: 'ten-1', product_id: 'p-001', name: 'پشتیبانی', slug: 'support', status: 'ACTIVE' },
  // Product p-002 (فینوآی‌دی) departments
  { id: 'd-4', tenant_id: 'ten-1', product_id: 'p-002', name: 'فنی هویت', slug: 'tech-identity', status: 'ACTIVE' },
  { id: 'd-5', tenant_id: 'ten-1', product_id: 'p-002', name: 'پشتیبانی هویت', slug: 'support-identity', status: 'ACTIVE' },
];

// Teams (with scope: DEPARTMENT or CATEGORY)
export const mockTeams: Team[] = [
  // Department-scoped team (covers entire d-1 department)
  { 
    id: 'tm-1', 
    tenant_id: 'ten-1', 
    product_id: 'p-001', 
    department_id: 'd-1', 
    category_id: null, 
    scope: 'DEPARTMENT',
    name: 'پشتیبانی فنی', 
    slug: 'tech-support', 
    status: 'ACTIVE', 
    members: [
      { user_id: 'u-001', user_name: 'علی محمدی', role: 'LEAD' }, 
      { user_id: 'u-002', user_name: 'فاطمه رضایی', role: 'MEMBER' }
    ] 
  },
  // Category-scoped team (specialized for cat-1 under d-1)
  { 
    id: 'tm-2', 
    tenant_id: 'ten-1', 
    product_id: 'p-001', 
    department_id: 'd-1', 
    category_id: 'cat-1', 
    scope: 'CATEGORY',
    name: 'تیم احراز هویت', 
    slug: 'auth-team', 
    status: 'ACTIVE', 
    members: [
      { user_id: 'u-002', user_name: 'فاطمه رضایی', role: 'LEAD' }
    ] 
  },
  // Department-scoped team for d-2
  { 
    id: 'tm-3', 
    tenant_id: 'ten-1', 
    product_id: 'p-001', 
    department_id: 'd-2', 
    category_id: null, 
    scope: 'DEPARTMENT',
    name: 'پشتیبانی مالی', 
    slug: 'finance-support', 
    status: 'ACTIVE', 
    members: [
      { user_id: 'u-003', user_name: 'حسن نوری', role: 'LEAD' }
    ] 
  },
];

// Agents (under tenant)
export const mockAgents: Agent[] = [
  { id: 'ag-1', tenant_id: 'ten-1', user_id: 'u-001', display_name: 'علی محمدی', timezone: 'Asia/Tehran', language: 'fa', max_active_tickets: 20, presence: 'ONLINE', status: 'ACTIVE' },
  { id: 'ag-2', tenant_id: 'ten-1', user_id: 'u-002', display_name: 'فاطمه رضایی', timezone: 'Asia/Tehran', language: 'fa', max_active_tickets: 15, presence: 'AWAY', status: 'ACTIVE' },
  { id: 'ag-3', tenant_id: 'ten-1', user_id: 'u-003', display_name: 'حسن نوری', timezone: 'Asia/Tehran', language: 'fa', max_active_tickets: 10, presence: 'BUSY', status: 'ACTIVE' },
];

// Topics (under categories) - NEW entity
export const mockTopics: Topic[] = [
  // Category cat-1 (احراز هویت) topics
  { id: 'topic-1', tenant_id: 'ten-1', category_id: 'cat-1', name: 'مشکل ورود', slug: 'login-issue', description: 'مشکلات مربوط به ورود به حساب کاربری', status: 'ACTIVE', sort_order: 1 },
  { id: 'topic-2', tenant_id: 'ten-1', category_id: 'cat-1', name: 'فراموشی رمز', slug: 'forgot-password', description: 'بازیابی رمز عبور', status: 'ACTIVE', sort_order: 2 },
  { id: 'topic-3', tenant_id: 'ten-1', category_id: 'cat-1', name: 'تایید دو مرحله‌ای', slug: '2fa', description: 'مشکلات احراز هویت دو مرحله‌ای', status: 'ACTIVE', sort_order: 3 },
  // Category cat-2 (حساب کاربری) topics
  { id: 'topic-4', tenant_id: 'ten-1', category_id: 'cat-2', name: 'تغییر اطلاعات', slug: 'update-info', description: 'تغییر اطلاعات حساب کاربری', status: 'ACTIVE', sort_order: 1 },
  { id: 'topic-5', tenant_id: 'ten-1', category_id: 'cat-2', name: 'حذف حساب', slug: 'delete-account', description: 'درخواست حذف حساب کاربری', status: 'ACTIVE', sort_order: 2 },
  // Category cat-3 (پرداخت) topics
  { id: 'topic-6', tenant_id: 'ten-1', category_id: 'cat-3', name: 'خطای پرداخت', slug: 'payment-error', description: 'مشکلات فنی در پرداخت', status: 'ACTIVE', sort_order: 1 },
  { id: 'topic-7', tenant_id: 'ten-1', category_id: 'cat-3', name: 'برگشت وجه', slug: 'refund', description: 'درخواست برگشت وجه', status: 'ACTIVE', sort_order: 2 },
];

export const mockSLAPolicies: SLAPolicy[] = [
  { id: 'sla-1', name: 'استاندارد', priority: 'NORMAL', first_response_seconds: 3600, resolution_seconds: 86400, status: 'ACTIVE' },
  { id: 'sla-2', name: 'فوری', priority: 'HIGH', first_response_seconds: 900, resolution_seconds: 14400, status: 'ACTIVE' },
  { id: 'sla-3', name: 'بحرانی', priority: 'CRITICAL', first_response_seconds: 300, resolution_seconds: 3600, status: 'ACTIVE' },
];

export const mockKnowledgeBases: KnowledgeBase[] = [
  { id: 'kb-1', name: 'راهنمای فینوپال', scope: 'PRODUCT', product_id: 'p-001', status: 'ACTIVE', articles_count: 12 },
  { id: 'kb-2', name: 'پایگاه دانش عمومی', scope: 'TENANT', status: 'ACTIVE', articles_count: 8 },
];

export const mockArticles: Article[] = [
  { id: 'art-1', kb_id: 'kb-1', title: 'نحوه بازیابی رمز عبور', slug: 'password-recovery', content: '# بازیابی رمز عبور\n\nبرای بازیابی رمز عبور:\n1. روی "فراموشی رمز" کلیک کنید\n2. ایمیل خود را وارد کنید\n3. لینک بازیابی را از ایمیل باز کنید\n4. رمز جدید تعیین کنید', summary: 'راهنمای گام‌به‌گام بازیابی رمز عبور', status: 'PUBLISHED', visibility: 'BOTH', tags: ['auth', 'password'], created_at: '2024-06-01', updated_at: '2024-10-15' },
  { id: 'art-2', kb_id: 'kb-1', title: 'راهنمای انتقال وجه', slug: 'transfer-guide', content: '# انتقال وجه\n\nبرای انتقال وجه بین حساب‌ها...', summary: 'آموزش انتقال وجه', status: 'PUBLISHED', visibility: 'BOTH', tags: ['payment', 'transfer'], created_at: '2024-07-01', updated_at: '2024-11-01' },
  { id: 'art-3', kb_id: 'kb-2', title: 'سیاست حریم خصوصی', slug: 'privacy-policy', content: '# سیاست حریم خصوصی\n\nاطلاعات شما نزد ما محفوظ است...', summary: 'خط‌مشی حریم خصوصی FinoTicket', status: 'DRAFT', visibility: 'AGENT', tags: ['legal'], created_at: '2024-08-01', updated_at: '2024-08-01' },
];

export const mockAPIClients: APIClient[] = [
  { id: 'ac-1', name: 'اپلیکیشن موبایل', client_id: 'cli_abc123', scopes: ['tickets:read', 'tickets:write', 'customers:read'], status: 'ACTIVE', last_used_at: '2024-12-20T10:00:00Z', created_at: '2024-06-01' },
  { id: 'ac-2', name: 'سرویس گزارش‌گیری', client_id: 'cli_def456', scopes: ['analytics:read', 'tickets:read'], status: 'ACTIVE', last_used_at: '2024-12-19T15:00:00Z', created_at: '2024-08-15' },
];

export const mockWebhooks: Webhook[] = [
  { id: 'wh-1', name: 'نوتیفیکیشن اسلک', url: 'https://hooks.slack.com/xxx', events: ['ticket.created', 'ticket.assigned'], status: 'ACTIVE', deliveries: [{ id: 'wd-1', webhook_id: 'wh-1', event: 'ticket.created', status: 'DELIVERED', attempts: 1, response_code: 200, created_at: '2024-12-20T10:01:00Z' }], created_at: '2024-09-01' },
  { id: 'wh-2', name: 'CRM Sync', url: 'https://crm.example.com/webhook', events: ['ticket.status_changed', 'customer.created'], status: 'ACTIVE', deliveries: [{ id: 'wd-2', webhook_id: 'wh-2', event: 'ticket.status_changed', status: 'FAILED', attempts: 3, response_code: 500, response_body: '{"error":"timeout"}', next_retry_at: '2024-12-20T11:00:00Z', created_at: '2024-12-20T09:00:00Z' }], created_at: '2024-10-01' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'al-1', actor_id: 'u-001', actor_name: 'علی محمدی', action: 'STATUS_CHANGE', entity_type: 'ticket', entity_id: 't-001', metadata: { from: 'OPEN', to: 'IN_PROGRESS' }, ip_address: '192.168.1.1', created_at: '2024-12-20T10:30:00Z' },
  { id: 'al-2', actor_id: 'u-001', actor_name: 'علی محمدی', action: 'ASSIGN', entity_type: 'ticket', entity_id: 't-002', metadata: { assignee: 'علی محمدی' }, ip_address: '192.168.1.1', created_at: '2024-12-20T09:00:00Z' },
  { id: 'al-3', actor_id: 'u-002', actor_name: 'فاطمه رضایی', action: 'CREATE', entity_type: 'customer', entity_id: 'c-003', metadata: {}, ip_address: '192.168.1.2', created_at: '2024-12-19T14:00:00Z' },
];

export const mockAIAnalyses: AIAnalysis[] = [
  { id: 'ai-1', ticket_id: 't-001', type: 'SENTIMENT', result: 'منفی - کاربر ناراحت است', confidence: 0.85, created_at: '2024-12-20T10:05:00Z' },
  { id: 'ai-2', ticket_id: 't-001', type: 'INTENT', result: 'درخواست کمک فنی - مشکل ورود', confidence: 0.92, created_at: '2024-12-20T10:05:00Z' },
  { id: 'ai-3', ticket_id: 't-001', type: 'LANGUAGE', result: 'fa', confidence: 0.99, created_at: '2024-12-20T10:05:00Z' },
];

export const mockAISuggestions: AISuggestion[] = [
  { id: 'ais-1', ticket_id: 't-001', type: 'REPLY', content: 'سلام سارا خانم، مشکل شما شناسایی شد. لطفاً کش مرورگر خود را پاک کنید و مجدداً تلاش نمایید. در صورت ادامه مشکل، اطلاعات بیشتری ارائه دهید.', confidence: 0.78, status: 'PENDING', sources: [{ title: 'نحوه بازیابی رمز عبور', url: '#', article_id: 'art-1' }], created_at: '2024-12-20T10:10:00Z' },
  { id: 'ais-2', ticket_id: 't-001', type: 'CATEGORY', content: 'احراز هویت > ورود', confidence: 0.91, status: 'PENDING', created_at: '2024-12-20T10:10:00Z' },
  { id: 'ais-3', ticket_id: 't-001', type: 'PRIORITY', content: 'HIGH', confidence: 0.88, status: 'ACCEPTED', created_at: '2024-12-20T10:10:00Z' },
];

export const mockSearchResults: SearchResult[] = [
  { id: 't-001', type: 'ticket', title: 'FT-1001 - مشکل در ورود به حساب کاربری', snippet: 'کاربر نمی‌تواند وارد حساب شود... خطای اطلاعات ورود نامعتبر', score: 0.95, url: '/desk/tickets/t-001' },
  { id: 't-006', type: 'ticket', title: 'FT-1006 - عدم دریافت کد تایید پیامکی', snippet: 'مشکل در دریافت OTP از طریق پیامک...', score: 0.82, url: '/desk/tickets/t-006' },
  { id: 'art-1', type: 'article', title: 'نحوه بازیابی رمز عبور', snippet: 'برای بازیابی رمز عبور روی فراموشی رمز کلیک کنید...', score: 0.75, url: '/desk/knowledge/articles/art-1' },
];

export const mockAnalytics: AnalyticsData = {
  kpis: { open_tickets: 24, unassigned: 5, breached_sla: 3, waiting_customer: 8, my_active: 7, avg_first_response: 1840, avg_resolution: 28800, satisfaction: 4.2 },
  tickets_over_time: [
    { date: '2024-12-14', created: 12, resolved: 10 }, { date: '2024-12-15', created: 15, resolved: 13 },
    { date: '2024-12-16', created: 8, resolved: 11 }, { date: '2024-12-17', created: 18, resolved: 14 },
    { date: '2024-12-18', created: 14, resolved: 16 }, { date: '2024-12-19', created: 20, resolved: 12 },
    { date: '2024-12-20', created: 16, resolved: 9 },
  ],
  by_status: [
    { status: 'باز', count: 12 }, { status: 'در حال بررسی', count: 8 }, { status: 'در انتظار مشتری', count: 5 },
    { status: 'حل شده', count: 18 }, { status: 'بسته', count: 45 },
  ],
  by_priority: [
    { priority: 'کم', count: 15 }, { priority: 'معمولی', count: 35 }, { priority: 'بالا', count: 12 },
    { priority: 'فوری', count: 5 }, { priority: 'بحرانی', count: 2 },
  ],
  sla_compliance: [
    { date: '2024-12-14', percentage: 92 }, { date: '2024-12-15', percentage: 88 },
    { date: '2024-12-16', percentage: 95 }, { date: '2024-12-17', percentage: 85 },
    { date: '2024-12-18', percentage: 90 }, { date: '2024-12-19', percentage: 78 },
    { date: '2024-12-20', percentage: 82 },
  ],
  by_department: [
    { department: 'فنی', count: 30 }, { department: 'مالی', count: 15 }, { department: 'پشتیبانی', count: 25 }, { department: 'مدیریت', count: 5 },
  ],
  agent_workload: [
    { agent: 'علی محمدی', active: 7 }, { agent: 'فاطمه رضایی', active: 5 }, { agent: 'حسن نوری', active: 3 },
  ],
  by_channel: [
    { channel: 'وب', count: 35 }, { channel: 'ویجت', count: 25 }, { channel: 'ایمیل', count: 15 },
    { channel: 'چت', count: 12 }, { channel: 'پیامک', count: 8 },
  ],
};
