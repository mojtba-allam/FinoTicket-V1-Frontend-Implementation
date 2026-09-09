import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, Search, BookOpen, BarChart3, Settings, LogOut, Menu, X, Bell, ChevronLeft, Package, Tags, Building2, UserCheck, Shield, Workflow, Zap, Globe, Webhook, FileSearch, Ticket as TicketIcon, MessageSquare, Clock, AlertTriangle, TrendingUp, UserPlus, Plus, Send, Paperclip, Eye, EyeOff, Star, Filter, ArrowUpDown, MoreHorizontal, CheckCircle2, XCircle, Brain, Lightbulb, Link2, ChevronDown, Home, History } from 'lucide-react';
import { Button, Input, Textarea, Select, Badge, StatusBadge, Avatar, Modal, Drawer, Toast, EmptyState, Loading, Tabs, CopyButton, Card, KPICard, SearchInput, SegmentedControl, ErrorState, DegradedBanner, FileUpload, Pagination, Skeleton } from './components/ui';
import { NotificationCenter } from './components/NotificationCenter';
import { SLACountdown } from './components/SLACountdown';
import { ConfirmDialog } from './components/ConfirmDialog';
import { TagInput } from './components/TagInput';
import { PresenceSelect } from './components/PresenceSelect';
import { fa, en, type Lang } from './i18n';
import { mockUser, mockProducts, mockTickets, mockMessages, mockCustomers, mockCategories, mockDepartments, mockTeams, mockAgents, mockSLAPolicies, mockKnowledgeBases, mockArticles, mockAPIClients, mockWebhooks, mockAuditLogs, mockAIAnalyses, mockAISuggestions, mockSearchResults, mockAnalytics } from './data/mock';
import type { Ticket, Message, Role, Presence, TicketStatus, Priority } from './types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import LandingPage from './pages/landing/LandingPage';

// ========== CONTEXT ==========
interface AppContextType {
  user: typeof mockUser;
  lang: Lang;
  t: typeof fa;
  setLang: (l: Lang) => void;
  product: typeof mockProducts[0];
  setProduct: (p: typeof mockProducts[0]) => void;
  presence: Presence;
  setPresence: (p: Presence) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}
const AppContext = createContext<AppContextType>({} as AppContextType);
const useApp = () => useContext(AppContext);

// ========== APP PROVIDER ==========
function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fa');
  const [product, setProduct] = useState(mockProducts[0]);
  const [presence, setPresence] = useState<Presence>('ONLINE');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const t = lang === 'fa' ? fa : en;

  // Set direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => setToast({ msg, type });

  return (
    <AppContext.Provider value={{ user: mockUser, lang, t, setLang, product, setProduct, presence, setPresence, showToast }}>
      {children}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppContext.Provider>
  );
}

// ========== LAYOUT ==========
function Layout({ children }: { children: React.ReactNode }) {
  const { t, user, lang, setLang, product, setProduct, presence, setPresence } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showProductSwitch, setShowProductSwitch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'desk', icon: LayoutDashboard, label: t.nav.desk, path: '/desk', roles: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { id: 'tickets', icon: Inbox, label: t.nav.tickets, path: '/desk/tickets', roles: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { id: 'customers', icon: Users, label: t.nav.customers, path: '/desk/customers', roles: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { id: 'search', icon: Search, label: t.nav.search, path: '/desk/search', roles: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { id: 'knowledge', icon: BookOpen, label: t.nav.knowledge, path: '/desk/knowledge', roles: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { id: 'analytics', icon: BarChart3, label: t.nav.analytics, path: '/desk/analytics', roles: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
  ];

  const adminItems = [
    { id: 'products', icon: Package, label: t.nav.products, path: '/admin/products', roles: ['OWNER', 'ADMIN'] },
    { id: 'categories', icon: Tags, label: t.nav.categories, path: '/admin/categories', roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'departments', icon: Building2, label: t.nav.departments, path: '/admin/departments', roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'teams', icon: UserCheck, label: t.nav.teams, path: '/admin/teams', roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'agents', icon: Users, label: t.nav.agents, path: '/admin/agents', roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'users', icon: Shield, label: t.nav.users, path: '/admin/users', roles: ['OWNER', 'ADMIN'] },
    { id: 'sla', icon: Clock, label: t.nav.sla, path: '/admin/sla', roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'workflows', icon: Workflow, label: t.nav.workflows, path: '/admin/workflows', roles: ['OWNER', 'ADMIN'] },
    { id: 'automations', icon: Zap, label: t.nav.automations, path: '/admin/automations', roles: ['OWNER', 'ADMIN'] },
    { id: 'kb', icon: BookOpen, label: t.nav.knowledge_bases, path: '/admin/knowledge-bases', roles: ['OWNER', 'ADMIN'] },
    { id: 'api', icon: Globe, label: t.nav.api_clients, path: '/admin/api-clients', roles: ['OWNER', 'ADMIN'] },
    { id: 'webhooks', icon: Webhook, label: t.nav.webhooks, path: '/admin/webhooks', roles: ['OWNER', 'ADMIN'] },
    { id: 'audit', icon: FileSearch, label: t.nav.audit_logs, path: '/admin/audit-logs', roles: ['OWNER', 'ADMIN', 'MANAGER'] },
  ];

  const filteredNav = navItems.filter(i => i.roles.includes(user.role));
  const filteredAdmin = adminItems.filter(i => i.roles.includes(user.role));
  const canAdmin = ['OWNER', 'ADMIN', 'MANAGER'].includes(user.role);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-alt">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-l border-border flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                <TicketIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--color-brand-700)' }}>{t.app.name}</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-surface-hover">
            <Menu className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {filteredNav.map(item => (
            <Link key={item.id} to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname.startsWith(item.path) ? 'bg-brand-50 text-brand-700 font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-text'}`}>
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
          
          {canAdmin && sidebarOpen && <div className="pt-3 pb-1 px-3"><span className="text-xs font-medium text-text-muted uppercase">{t.nav.admin}</span></div>}
          {canAdmin && filteredAdmin.map(item => (
            <Link key={item.id} to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname.startsWith(item.path) ? 'bg-brand-50 text-brand-700 font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-text'}`}>
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User */}
        {sidebarOpen && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3">
              <Avatar name={user.display_name} presence={presence} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.display_name}</p>
                <p className="text-xs text-text-muted">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Product Switcher */}
            <div className="relative">
              <button onClick={() => setShowProductSwitch(!showProductSwitch)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover text-sm">
                <Package className="h-4 w-4 text-brand-500" />
                <span className="font-medium">{product.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
              </button>
              {showProductSwitch && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg border border-border shadow-lg z-50 py-1">
                  {mockProducts.map(p => (
                    <button key={p.id} onClick={() => { setProduct(p); setShowProductSwitch(false); }}
                      className={`w-full text-right px-4 py-2 text-sm hover:bg-surface-hover ${p.id === product.id ? 'bg-brand-50 text-brand-700' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.status !== 'ACTIVE' && <Badge variant="warning">{p.status}</Badge>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Presence */}
            <PresenceSelect value={presence} onChange={setPresence} />

            {/* Language */}
            <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className="px-2.5 py-1.5 text-xs border border-border rounded-lg hover:bg-surface-hover font-medium">
              {lang === 'fa' ? 'EN' : 'فا'}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* Logout */}
            <Link to="/login" className="p-2 rounded-lg hover:bg-surface-hover">
              <LogOut className="h-5 w-5 text-text-secondary" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ========== LOGIN PAGE ==========
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@finoticket.ir');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email && password) navigate('/desk');
      else setError(fa.auth.invalid_credentials);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-mesh)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'var(--gradient-hero)' }}>
            <TicketIcon className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-brand-800)' }}>{fa.app.name}</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{fa.app.tagline}</p>
        </div>
        <Card className="!p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="bg-danger-50 border border-red-200 rounded-lg p-3 text-sm text-danger-600">{error}</div>}
            <Input label={fa.auth.email} type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            <Input label={fa.auth.password} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><span className="animate-spin">⏳</span> {fa.common.loading}</> : fa.auth.login_button}
            </Button>
            <p className="text-center text-xs text-text-muted">
              <Link to="/forgot-password" className="text-brand-600 hover:underline">{fa.auth.forgot_password}</Link>
            </p>
          </form>
        </Card>
            <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
              <Link to="/forgot-password" className="text-brand-600 hover:underline">{fa.auth.forgot_password}</Link>
            </p>
            <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>نسخه ۱.۰ — FinoTicket © 2024</p>      </div>
    </div>
  );
}

// ========== DESK / INBOX ==========
function DeskPage() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const tabs = [
    { id: 'all', label: t.common.all, count: mockTickets.length },
    { id: 'my', label: 'تیکت‌های من', count: mockTickets.filter(t => t.assignee_id === 'u-001').length },
    { id: 'unassigned', label: 'ارجاع نشده', count: mockTickets.filter(t => !t.assignee_id).length },
    { id: 'watching', label: 'تحت نظر', count: mockTickets.filter(t => t.watchers.includes('u-001')).length },
    { id: 'sla', label: 'ریسک SLA', count: mockTickets.filter(t => t.sla_status === 'WARNING' || t.sla_status === 'BREACHED').length },
  ];

  const filtered = mockTickets.filter(ticket => {
    if (activeTab === 'my' && ticket.assignee_id !== 'u-001') return false;
    if (activeTab === 'unassigned' && ticket.assignee_id) return false;
    if (activeTab === 'watching' && !ticket.watchers.includes('u-001')) return false;
    if (activeTab === 'sla' && ticket.sla_status !== 'WARNING' && ticket.sla_status !== 'BREACHED') return false;
    if (search && !ticket.subject.includes(search) && !ticket.ticket_number.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex h-full">
      {/* Ticket List */}
      <div className="w-96 border-l border-border bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t.nav.inbox}</h2>
            <Button size="sm" onClick={() => navigate('/desk/tickets/new')}><Plus className="h-4 w-4" /> جدید</Button>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="جستجوی تیکت..." />
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? <EmptyState title={t.common.empty} /> : filtered.map(ticket => (
            <div key={ticket.id} onClick={() => navigate(`/desk/tickets/${ticket.id}`)}
              className="px-4 py-3 border-b border-border hover:bg-surface-hover cursor-pointer transition-colors">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-muted">{ticket.ticket_number}</span>
                  <StatusBadge status={ticket.priority} type="priority" />
                </div>
                {ticket.sla_status && <StatusBadge status={ticket.sla_status} type="sla" />}
              </div>
              <p className="text-sm font-medium truncate mb-1">{ticket.subject}</p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{ticket.customer_name}</span>
                <span>•</span>
                <span>{ticket.product_name}</span>
                {ticket.assignee_name && <><span>•</span><span>{ticket.assignee_name}</span></>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex items-center justify-center bg-surface-alt">
        <EmptyState icon={<Inbox className="h-16 w-16 text-text-muted mb-4" />} title="یک تیکت را انتخاب کنید" description="برای مشاهده جزئیات، روی یکی از تیکت‌ها کلیک کنید" />
      </div>
    </div>
  );
}

// ========== TICKET LIST PAGE ==========
function TicketListPage() {
  const { t } = useApp();
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = mockTickets.filter(ticket => {
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    if (search && !ticket.subject.includes(search) && !ticket.ticket_number.includes(search)) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.tickets}</h1>
        <Button onClick={() => navigate('/desk/tickets/new')}><Plus className="h-4 w-4" /> {t.ticket.create}</Button>
      </div>
      
      <Card className="mb-4 !p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} /></div>
          <Select options={[{ value: '', label: 'همه وضعیت‌ها' }, ...Object.entries(t.ticket.statuses).map(([k, v]) => ({ value: k, label: v }))]} value={statusFilter} onChange={setStatusFilter} />
          <Select options={[{ value: '', label: 'همه اولویت‌ها' }, ...Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))]} value={priorityFilter} onChange={setPriorityFilter} />
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-text-muted">شماره</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">موضوع</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">مشتری</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">وضعیت</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">اولویت</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">ارجاع</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">SLA</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">کانال</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket.id} onClick={() => navigate(`/desk/tickets/${ticket.id}`)}
                  className="border-b border-border hover:bg-surface-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{ticket.ticket_number}</td>
                  <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                  <td className="px-4 py-3">{ticket.customer_name}</td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.priority} type="priority" /></td>
                  <td className="px-4 py-3 text-text-muted">{ticket.assignee_name || '—'}</td>
                  <td className="px-4 py-3">{ticket.sla_status ? <StatusBadge status={ticket.sla_status} type="sla" /> : '—'}</td>
                  <td className="px-4 py-3"><Badge variant="info">{t.ticket.channels[ticket.channel as keyof typeof t.ticket.channels] || ticket.channel}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState title={t.common.empty} />}
      </Card>
    </div>
  );
}

// ========== TICKET DETAIL ==========
function TicketDetailPage() {
  const { id } = useParams();
  const { t, showToast } = useApp();
  const navigate = useNavigate();
  const ticket = mockTickets.find(tk => tk.id === id);
  const messages = mockMessages.filter(m => m.ticket_id === id);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [tags, setTags] = useState(ticket?.tags || []);
  const [watchers, setWatchers] = useState<string[]>(ticket?.watchers || []);

  if (!ticket) return <div className="p-6"><ErrorState title="تیکت یافت نشد" /></div>;

  const analyses = mockAIAnalyses.filter(a => a.ticket_id === id);
  const suggestions = mockAISuggestions.filter(s => s.ticket_id === id);

  return (
    <div className="flex h-full">
      {/* Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/desk')} className="p-1 rounded hover:bg-surface-hover"><ChevronLeft className="h-5 w-5 flip-rtl" /></button>
            <span className="font-mono text-sm text-text-muted">{ticket.ticket_number}</span>
            <CopyButton text={ticket.ticket_number} />
            <StatusBadge status={ticket.status} />
            <StatusBadge status={ticket.priority} type="priority" />
            {ticket.sla_first_response_due && (
              <SLACountdown dueAt={ticket.sla_first_response_due} type="first_response" size="sm" />
            )}
          </div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
            <span>{ticket.customer_name}</span>
            <span>•</span>
            <span>{ticket.product_name}</span>
            <span>•</span>
            <span>{t.ticket.channels[ticket.channel as keyof typeof t.ticket.channels]}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.is_internal ? 'bg-amber-50 border border-amber-200 rounded-lg p-4' : ''}`}>
              <Avatar name={msg.sender_name} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.sender_name}</span>
                  <Badge variant={msg.sender_type === 'CUSTOMER' ? 'info' : msg.is_internal ? 'warning' : 'brand'}>
                    {msg.sender_type === 'CUSTOMER' ? 'مشتری' : msg.is_internal ? 'یادداشت داخلی' : 'کارشناس'}
                  </Badge>
                  <span className="text-xs text-text-muted">{new Date(msg.created_at).toLocaleString('fa-IR')}</span>
                </div>
                <p className="text-sm leading-relaxed">{msg.body}</p>
                {msg.attachments.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {msg.attachments.map(att => (
                      <div key={att.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt rounded-lg border border-border text-xs">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{att.filename}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="bg-white border-t border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <SegmentedControl
              options={[{ value: 'public', label: t.ticket.reply }, { value: 'internal', label: t.ticket.internal_note }]}
              value={isInternal ? 'internal' : 'public'}
              onChange={v => setIsInternal(v === 'internal')}
            />
          </div>
          <div className={`rounded-lg border ${isInternal ? 'border-amber-300 bg-amber-50' : 'border-border'} p-3`}>
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder={isInternal ? 'یادداشت داخلی...' : 'پاسخ خود را بنویسید...'}
              className="w-full bg-transparent text-sm resize-none outline-none min-h-[80px]" />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <FileUpload onFiles={() => {}} accept="image/*,.pdf,.doc,.docx" multiple />
              <Button onClick={() => { showToast('پیام ارسال شد'); setReply(''); }}>
                <Send className="h-4 w-4" /> {t.ticket.send}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-r border-border bg-white overflow-y-auto shrink-0">
        {/* Properties */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">{t.ticket.properties}</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">محصول</span><span>{ticket.product_name}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">دسته‌بندی</span><span>{ticket.category_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">دپارتمان</span><span>{ticket.department_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">تیم</span><span>{ticket.team_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">ارجاع به</span><span>{ticket.assignee_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">برچسب‌ها</span>
              <div className="flex gap-1">{ticket.tags.map(tag => <Badge key={tag} variant="default">{tag}</Badge>)}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowAssignModal(true)}>{t.ticket.assign}</Button>
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowStatusModal(true)}>{t.ticket.change_status}</Button>
          </div>
          <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => setShowPriorityModal(true)}>
            {t.ticket.change_priority}
          </Button>
          <Button size="sm" variant="success" className="w-full mt-2" onClick={() => setShowResolveModal(true)}>
            <CheckCircle2 className="h-4 w-4" /> حل شده
          </Button>
          <Button size="sm" variant="ghost" className="w-full mt-2" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" /> {t.ticket.history}
          </Button>

          {/* Tags Section */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-muted mb-2">برچسب‌ها</label>
            <TagInput value={tags} onChange={setTags} placeholder="برچسب جدید..." />
          </div>

          {/* Watchers Section */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-muted mb-2">ناظران</label>
            <div className="space-y-2">
              {watchers.length > 0 ? watchers.map(w => (
                <div key={w} className="flex items-center justify-between p-2 bg-surface-alt rounded">
                  <span className="text-sm">{mockAgents.find(a => a.user_id === w)?.display_name || w}</span>
                  <button onClick={() => setWatchers(watchers.filter(x => x !== w))} className="text-text-muted hover:text-danger-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )) : <p className="text-xs text-text-muted">ناظری اضافه نشده</p>}
              <Select 
                options={mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))} 
                placeholder="افزودن ناظر" 
                onChange={(v) => { if (v && !watchers.includes(v)) setWatchers([...watchers, v]); }}
              />
            </div>
          </div>
        </div>

        {/* Customer 360 */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">{t.ticket.customer_info}</h3>
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={ticket.customer_name || ''} />
            <div>
              <p className="text-sm font-medium">{ticket.customer_name}</p>
              <p className="text-xs text-text-muted">مشتری</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="w-full" onClick={() => navigate(`/desk/customers/${ticket.customer_id}`)}>
            مشاهده پروفایل کامل
          </Button>
        </div>

        {/* AI Copilot */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-brand-500" /> {t.ticket.ai_copilot}</h3>
            <Badge variant="brand">Beta</Badge>
          </div>
          
          {/* Analyses */}
          <div className="space-y-2 mb-4">
            {analyses.map(a => (
              <div key={a.id} className="bg-surface-alt rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-muted">{a.type}</span>
                  <span className="text-xs text-brand-600">{Math.round(a.confidence * 100)}%</span>
                </div>
                <p className="text-xs">{a.result}</p>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            {suggestions.map(s => (
              <div key={s.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={s.status === 'ACCEPTED' ? 'success' : s.status === 'REJECTED' ? 'danger' : 'warning'}>
                    {s.status === 'PENDING' ? 'در انتظار' : s.status === 'ACCEPTED' ? 'قبول شده' : 'رد شده'}
                  </Badge>
                  <span className="text-xs text-text-muted">{Math.round(s.confidence * 100)}% اطمینان</span>
                </div>
                <p className="text-xs mb-2 leading-relaxed">{s.content}</p>
                {s.sources && s.sources.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    {s.sources.map((src, i) => <span key={i} className="text-xs text-brand-600">{src.title}</span>)}
                  </div>
                )}
                {s.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="success" className="flex-1 text-xs" onClick={() => showToast('پیشنهاد قبول شد')}>
                      <CheckCircle2 className="h-3 w-3" /> قبول
                    </Button>
                    <Button size="sm" variant="danger" className="flex-1 text-xs" onClick={() => showToast('پیشنهاد رد شد')}>
                      <XCircle className="h-3 w-3" /> رد
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Similar Tickets */}
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">{t.ticket.similar_tickets}</h3>
          <div className="space-y-2">
            {mockTickets.filter(tk => tk.id !== ticket.id).slice(0, 3).map(tk => (
              <div key={tk.id} onClick={() => navigate(`/desk/tickets/${tk.id}`)}
                className="p-2.5 rounded-lg border border-border hover:bg-surface-hover cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-text-muted">{tk.ticket_number}</span>
                  <StatusBadge status={tk.status} />
                </div>
                <p className="text-xs truncate">{tk.subject}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${70 + Math.random() * 25}%` }} />
                  </div>
                  <span className="text-xs text-text-muted">شباهت</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title={t.ticket.assign}>
        <div className="space-y-4">
          <Select label="کارشناس" options={mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))} placeholder="انتخاب کارشناس" />
          <Select label="تیم" options={mockTeams.map(t => ({ value: t.id, label: t.name }))} placeholder="انتخاب تیم" />
          <Select label="دپارتمان" options={mockDepartments.map(d => ({ value: d.id, label: d.name }))} placeholder="انتخاب دپارتمان" />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('تیکت ارجاع شد'); setShowAssignModal(false); }}>ارجاع</Button>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title={t.ticket.change_status}>
        <div className="space-y-4">
          <Select label="وضعیت جدید" options={Object.entries(t.ticket.statuses).map(([k, v]) => ({ value: k, label: v }))} />
          <Textarea label="یادداشت (اختیاری)" placeholder="دلیل تغییر وضعیت..." rows={3} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('وضعیت تغییر کرد'); setShowStatusModal(false); }}>تغییر وضعیت</Button>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>

      {/* Priority Change Modal */}
      <Modal open={showPriorityModal} onClose={() => setShowPriorityModal(false)} title={t.ticket.change_priority}>
        <div className="space-y-4">
          <Select 
            label="اولویت جدید" 
            options={Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))} 
          />
          <Textarea label="دلیل (اختیاری)" placeholder="چرا اولویت تغییر می‌کند؟" rows={3} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('اولویت تغییر کرد'); setShowPriorityModal(false); }}>تغییر اولویت</Button>
            <Button variant="secondary" onClick={() => setShowPriorityModal(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>

      {/* Resolve/Close Confirm */}
      <ConfirmDialog
        open={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={() => { showToast('تیکت حل شد'); setShowResolveModal(false); }}
        title="حل کردن تیکت"
        description="آیا مطمئن هستید که می‌خواهید این تیکت را به عنوان حل شده علامت‌گذاری کنید؟ مشتری مطلع خواهد شد."
        confirmLabel="حل شده"
        cancelLabel="انصراف"
        variant="success"
      />

      {/* History Drawer */}
      <Drawer open={showHistory} onClose={() => setShowHistory(false)} title={t.ticket.history} side="left">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute right-3 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              <div className="relative flex gap-4">
                <div className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center z-10">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm font-medium">وضعیت تغییر کرد</p>
                  <p className="text-xs text-text-muted mt-1">باز → در حال بررسی</p>
                  <p className="text-xs text-text-muted mt-1">علی محمدی • ۲ ساعت پیش</p>
                </div>
              </div>
              <div className="relative flex gap-4">
                <div className="h-6 w-6 rounded-full bg-accent-500 flex items-center justify-center z-10">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm font-medium">ارجاع به علی محمدی</p>
                  <p className="text-xs text-text-muted mt-1">سیستم • ۳ ساعت پیش</p>
                </div>
              </div>
              <div className="relative flex gap-4">
                <div className="h-6 w-6 rounded-full bg-success-500 flex items-center justify-center z-10">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">تیکت ایجاد شد</p>
                  <p className="text-xs text-text-muted mt-1">سارا احمدی • ۵ ساعت پیش</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

// ========== CREATE TICKET ==========
function CreateTicketPage() {
  const { t, showToast, product } = useApp();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customer, setCustomer] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تیکت با موفقیت ایجاد شد');
    navigate('/desk/tickets');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover"><ChevronLeft className="h-5 w-5 flip-rtl" /></button>
        <h1 className="text-2xl font-bold">{t.ticket.create}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label={t.ticket.subject} value={subject} onChange={e => setSubject(e.target.value)} required placeholder="موضوع تیکت را وارد کنید" />
              <Textarea label={t.ticket.description} value={description} onChange={e => setDescription(e.target.value)} placeholder="توضیحات مشکل یا درخواست..." />
              
              <div className="grid grid-cols-2 gap-4">
                <Select label="مشتری" options={mockCustomers.map(c => ({ value: c.id, label: c.display_name }))} value={customer} onChange={setCustomer} placeholder="انتخاب مشتری" />
                <Select label="اولویت" options={Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))} value={priority} onChange={setPriority} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="دسته‌بندی" options={mockCategories.map(c => ({ value: c.id, label: c.name }))} value={category} onChange={setCategory} placeholder="انتخاب دسته" />
                <Select label="دپارتمان" options={mockDepartments.map(d => ({ value: d.id, label: d.name }))} placeholder="انتخاب دپارتمان" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">ضمیمه‌ها</label>
                <FileUpload onFiles={() => {}} multiple />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="submit">{t.common.create}</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>{t.common.cancel}</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Side Panel - AI Suggestions */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Brain className="h-4 w-4 text-brand-500" /> دستیار هوشمند</h3>
            <div className="space-y-3">
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-xs text-text-muted mb-1">تیکت‌های مشابه</p>
                <p className="text-sm text-text-secondary">در حال جستجو...</p>
                <div className="mt-2 animate-pulse-slow">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-xs text-text-muted mb-1">پیشنهاد دسته‌بندی</p>
                <p className="text-sm">—</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ========== CUSTOMERS ==========
function CustomersPage() {
  const { t, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const filtered = mockCustomers.filter(c => !search || c.display_name.includes(search) || c.profile.email?.includes(search));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.customers}</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> {t.customer.create}</Button>
      </div>

      <Card className="mb-4 !p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="جستجو بر اساس نام، ایمیل یا موبایل..." />
      </Card>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-text-muted">نام</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">ایمیل</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">موبایل</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">وضعیت</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">هویت‌ها</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">برچسب‌ها</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => navigate(`/desk/customers/${c.id}`)} className="border-b border-border hover:bg-surface-hover cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.display_name} size="sm" />
                    <span className="font-medium">{c.display_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{c.profile.email || '—'}</td>
                <td className="px-4 py-3 text-text-muted">{c.profile.mobile || '—'}</td>
                <td className="px-4 py-3"><Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'}>{c.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge></td>
                <td className="px-4 py-3">{c.identities.length > 0 ? c.identities.map(i => <Badge key={i.id} variant="info">{i.provider}</Badge>) : '—'}</td>
                <td className="px-4 py-3">{c.tags.length > 0 ? c.tags.map(tag => <Badge key={tag}>{tag}</Badge>) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState title={t.common.empty} />}
      </Card>

      {/* Create Customer Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t.customer.create}>
        <div className="space-y-4">
          <Input label={t.customer.display_name} placeholder="نام و نام خانوادگی" />
          <Input label="ایمیل" type="email" placeholder="email@example.com" />
          <Input label="موبایل" placeholder="09123456789" />
          <Select label="وضعیت" options={[{ value: 'ACTIVE', label: 'فعال' }, { value: 'INACTIVE', label: 'غیرفعال' }, { value: 'BLOCKED', label: 'مسدود' }]} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('مشتری ایجاد شد'); setShowCreate(false); }}>ایجاد</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ========== CUSTOMER DETAIL ==========
function CustomerDetailPage() {
  const { id } = useParams();
  const { t } = useApp();
  const navigate = useNavigate();
  const customer = mockCustomers.find(c => c.id === id);

  if (!customer) return <div className="p-6"><ErrorState title="مشتری یافت نشد" /></div>;

  const customerTickets = mockTickets.filter(tk => tk.customer_id === id);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover"><ChevronLeft className="h-5 w-5 flip-rtl" /></button>
        <h1 className="text-2xl font-bold">{customer.display_name}</h1>
        <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'default'}>{customer.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <h3 className="font-semibold mb-4">{t.customer.profile}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-muted">نام:</span> <span>{customer.profile.first_name} {customer.profile.last_name}</span></div>
              <div><span className="text-text-muted">ایمیل:</span> <span>{customer.profile.email || '—'}</span></div>
              <div><span className="text-text-muted">موبایل:</span> <span>{customer.profile.mobile || '—'}</span></div>
              <div><span className="text-text-muted">تاریخ ثبت:</span> <span>{new Date(customer.created_at).toLocaleDateString('fa-IR')}</span></div>
            </div>
          </Card>

          {/* Identities */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t.customer.identities}</h3>
              <Button size="sm" variant="secondary"><Link2 className="h-3.5 w-3.5" /> {t.customer.link_identity}</Button>
            </div>
            {customer.identities.length > 0 ? (
              <div className="space-y-2">
                {customer.identities.map(identity => (
                  <div key={identity.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{identity.provider}</Badge>
                      <span className="text-sm font-mono">{identity.provider_user_id}</span>
                    </div>
                    <Badge variant={identity.verification_status === 'VERIFIED' ? 'success' : 'warning'}>
                      {identity.verification_status === 'VERIFIED' ? 'تایید شده' : 'تایید نشده'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-text-muted">هویتی متصل نشده است</p>}
          </Card>

          {/* Ticket History */}
          <Card>
            <h3 className="font-semibold mb-4">{t.customer.ticket_history}</h3>
            {customerTickets.length > 0 ? (
              <div className="space-y-2">
                {customerTickets.map(tk => (
                  <div key={tk.id} onClick={() => navigate(`/desk/tickets/${tk.id}`)}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-surface-hover cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-text-muted">{tk.ticket_number}</span>
                      <span className="text-sm">{tk.subject}</span>
                    </div>
                    <StatusBadge status={tk.status} />
                  </div>
                ))}
              </div>
            ) : <EmptyState title="تیکتی ثبت نشده" />}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="text-center">
            <Avatar name={customer.display_name} size="lg" />
            <h3 className="font-semibold mt-3">{customer.display_name}</h3>
            <p className="text-sm text-text-muted">{customer.profile.email}</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-sm mb-3">{t.customer.tags}</h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags.length > 0 ? customer.tags.map(tag => <Badge key={tag}>{tag}</Badge>) : <span className="text-sm text-text-muted">بدون برچسب</span>}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-sm mb-3">{t.customer.addresses}</h3>
            {customer.addresses.length > 0 ? customer.addresses.map(addr => (
              <div key={addr.id} className="p-2.5 bg-surface-alt rounded-lg text-sm">
                <p className="font-medium">{addr.title}</p>
                <p className="text-text-muted text-xs mt-1">{addr.address}{addr.city ? `، ${addr.city}` : ''}</p>
              </div>
            )) : <p className="text-sm text-text-muted">آدرسی ثبت نشده</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ========== SEARCH PAGE ==========
function SearchPage() {
  const { t } = useApp();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('HYBRID');
  const [results, setResults] = useState(mockSearchResults);
  const [degraded] = useState(false);

  const handleSearch = () => {
    if (query) setResults(mockSearchResults.filter(r => r.title.includes(query) || r.snippet.includes(query) || true));
    else setResults(mockSearchResults);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t.search.title}</h1>

      {degraded && <DegradedBanner message={t.search.degraded} />}

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <SegmentedControl
            options={[{ value: 'KEYWORD', label: t.search.keyword }, { value: 'SEMANTIC', label: t.search.semantic }, { value: 'HYBRID', label: t.search.hybrid }]}
            value={mode} onChange={setMode}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} placeholder={t.search.placeholder} />
          </div>
          <Button onClick={handleSearch}>{t.common.search}</Button>
        </div>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-text-muted">{t.search.results}: {results.length}</p>
        {results.map(r => (
          <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={r.type === 'ticket' ? 'info' : r.type === 'article' ? 'brand' : 'success'}>
                    {r.type === 'ticket' ? 'تیکت' : r.type === 'article' ? 'مقاله' : 'مشتری'}
                  </Badge>
                  <span className="text-xs text-text-muted">امتیاز: {Math.round(r.score * 100)}%</span>
                </div>
                <h3 className="font-medium mb-1">{r.title}</h3>
                <p className="text-sm text-text-muted">{r.snippet}</p>
              </div>
            </div>
          </Card>
        ))}
        {results.length === 0 && <EmptyState title={t.search.no_results} />}
      </div>
    </div>
  );
}

// ========== KNOWLEDGE PAGE ==========
function KnowledgePage() {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = mockArticles.filter(a => !search || a.title.includes(search) || a.content.includes(search));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.knowledge}</h1>
      </div>

      <Card className="mb-6 !p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="جستجو در مقالات..." />
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* KB List */}
        <div>
          <h2 className="font-semibold mb-3">پایگاه‌های دانش</h2>
          <div className="space-y-3">
            {mockKnowledgeBases.map(kb => (
              <Card key={kb.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{kb.name}</h3>
                    <p className="text-xs text-text-muted">{kb.scope} • {kb.articles_count} مقاله</p>
                  </div>
                  <Badge variant={kb.status === 'ACTIVE' ? 'success' : 'default'}>{kb.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className="font-semibold mb-3">مقالات</h2>
          <div className="space-y-3">
            {filtered.map(article => (
              <div key={article.id} onClick={() => navigate(`/desk/knowledge/articles/${article.id}`)}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{article.title}</h3>
                  <Badge variant={article.status === 'PUBLISHED' ? 'success' : article.status === 'DRAFT' ? 'warning' : 'default'}>
                    {article.status === 'PUBLISHED' ? 'منتشر شده' : article.status === 'DRAFT' ? 'پیش‌نویس' : 'آرشیو'}
                  </Badge>
                </div>
                {article.summary && <p className="text-sm text-text-muted mb-2">{article.summary}</p>}
                <div className="flex items-center gap-2">
                  <Badge variant="info">{article.visibility === 'BOTH' ? 'عمومی' : article.visibility === 'AGENT' ? 'کارشناس' : 'مشتری'}</Badge>
                  {article.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ARTICLE READER ==========
function ArticleReaderPage() {
  const { id } = useParams();
  const { t } = useApp();
  const navigate = useNavigate();
  const article = mockArticles.find(a => a.id === id);

  if (!article) return <div className="p-6"><ErrorState title="مقاله یافت نشد" /></div>;

  const kb = mockKnowledgeBases.find(k => k.id === article.kb_id);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover">
          <ChevronLeft className="h-5 w-5 flip-rtl" />
        </button>
        <div>
          <p className="text-xs text-text-muted">{kb?.name}</p>
          <h1 className="text-2xl font-bold">{article.title}</h1>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <Badge variant={article.status === 'PUBLISHED' ? 'success' : article.status === 'DRAFT' ? 'warning' : 'default'}>
            {article.status === 'PUBLISHED' ? 'منتشر شده' : article.status === 'DRAFT' ? 'پیش‌نویس' : 'آرشیو'}
          </Badge>
          <Badge variant="info">{article.visibility === 'BOTH' ? 'عمومی' : article.visibility === 'AGENT' ? 'کارشناس' : 'مشتری'}</Badge>
          <div className="flex gap-1">
            {article.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
          </div>
        </div>

        {article.summary && (
          <div className="mb-6 p-4 bg-brand-50 rounded-lg border border-brand-200">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-brand-700)' }}>خلاصه</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{article.summary}</p>
          </div>
        )}

        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text)' }}>
          <div className="whitespace-pre-wrap leading-relaxed">{article.content}</div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-xs text-text-muted">
          <p>آخرین بروزرسانی: {new Date(article.updated_at).toLocaleDateString('fa-IR')}</p>
        </div>
      </Card>
    </div>
  );
}

// ========== ANALYTICS PAGE ==========
function AnalyticsPage() {
  const { t, product } = useApp();
  const data = mockAnalytics;
  const COLORS = ['#0B7C8C', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#F97316'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.analytics.title}</h1>
        <div className="flex items-center gap-3">
          <Badge variant="brand">{product.name}</Badge>
          <Button variant="secondary" size="sm"><BarChart3 className="h-4 w-4" /> خروجی CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label={t.analytics.open_tickets} value={data.kpis.open_tickets} icon={<Inbox className="h-6 w-6" />} color="brand" />
        <KPICard label={t.analytics.unassigned} value={data.kpis.unassigned} icon={<AlertTriangle className="h-6 w-6" />} color="warning" />
        <KPICard label={t.analytics.breached_sla} value={data.kpis.breached_sla} icon={<Clock className="h-6 w-6" />} color="danger" />
        <KPICard label={t.analytics.satisfaction} value={data.kpis.satisfaction} icon={<Star className="h-6 w-6" />} color="success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tickets Over Time */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.tickets_over_time}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.tickets_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="created" name="ایجاد شده" stroke="#0B7C8C" fill="#0B7C8C" fillOpacity={0.1} />
              <Area type="monotone" dataKey="resolved" name="حل شده" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* By Status */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_status}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status}: ${count}`}>
                {data.by_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.sla_compliance}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.sla_compliance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="percentage" name="انطباق %" stroke="#0B7C8C" strokeWidth={2} dot={{ fill: '#0B7C8C' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Agent Workload */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.agent_workload}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.agent_workload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="agent" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="active" name="تیکت فعال" fill="#0B7C8C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Department */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_department}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.by_department}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="تعداد" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Channel */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_channel}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.by_channel} dataKey="count" nameKey="channel" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({ channel, count }) => `${channel}: ${count}`}>
                {data.by_channel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* By Priority */}
        <Card>
          <h3 className="font-semibold mb-4">{t.analytics.by_priority}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.by_priority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="تعداد" radius={[4, 4, 0, 0]}>
                {data.by_priority.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.priority === 'کم' ? '#10b981' :
                    entry.priority === 'معمولی' ? '#0B7C8C' :
                    entry.priority === 'بالا' ? '#f59e0b' :
                    entry.priority === 'فوری' ? '#ef4444' : '#7c2d12'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ========== ADMIN PAGES ==========
function AdminProductsPage() {
  const { t, showToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.products}</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> محصول جدید</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {mockProducts.map(p => (
          <Card key={p.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-text-muted font-mono">{p.slug}</p>
              </div>
              <Badge variant={p.status === 'ACTIVE' ? 'success' : p.status === 'SUSPENDED' ? 'danger' : 'default'}>{p.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {p.channels.map(ch => <Badge key={ch} variant="info">{ch}</Badge>)}
            </div>
            {p.widget_branding && (
              <div className="text-xs text-text-muted">
                <span>ویجت: </span>
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: p.widget_branding.primary_color }} />
              </div>
            )}
          </Card>
        ))}
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="محصول جدید">
        <div className="space-y-4">
          <Input label="نام" placeholder="نام محصول" />
          <Input label="نامک" placeholder="product-slug" />
          <Select label="وضعیت" options={[{ value: 'ACTIVE', label: 'فعال' }, { value: 'SUSPENDED', label: 'معلق' }]} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('محصول ایجاد شد'); setShowCreate(false); }}>ایجاد</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminCategoriesPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.categories}</h1>
        <Button><Plus className="h-4 w-4" /> دسته جدید</Button>
      </div>
      <Card padding={false}>
        <div className="p-4 space-y-3">
          {mockCategories.map(cat => (
            <div key={cat.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Tags className="h-5 w-5 text-brand-500" />
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-text-muted font-mono">{cat.slug}</span>
                </div>
                <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'default'}>{cat.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
              </div>
              {cat.children && cat.children.length > 0 && (
                <div className="mr-8 mt-2 space-y-1.5">
                  {cat.children.map(child => (
                    <div key={child.id} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1 h-1 rounded-full bg-text-muted" />
                      <span>{child.name}</span>
                      <span className="text-xs text-text-muted font-mono">{child.slug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AdminDepartmentsPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.departments}</h1>
        <Button><Plus className="h-4 w-4" /> دپارتمان جدید</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {mockDepartments.map(d => (
          <Card key={d.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-brand-500" />
                <div>
                  <h3 className="font-medium">{d.name}</h3>
                  <p className="text-xs text-text-muted font-mono">{d.slug}</p>
                </div>
              </div>
              <Badge variant={d.status === 'ACTIVE' ? 'success' : 'default'}>{d.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminTeamsPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.teams}</h1>
        <Button><Plus className="h-4 w-4" /> تیم جدید</Button>
      </div>
      <div className="space-y-4">
        {mockTeams.map(team => (
          <Card key={team.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-xs text-text-muted">{team.department_name} • {team.slug}</p>
              </div>
              <Badge variant={team.status === 'ACTIVE' ? 'success' : 'default'}>{team.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {team.members.map(m => (
                <div key={m.user_id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt rounded-lg text-sm">
                  <Avatar name={m.user_name} size="sm" />
                  <span>{m.user_name}</span>
                  <Badge variant={m.role === 'LEAD' ? 'brand' : 'default'}>{m.role === 'LEAD' ? 'رهبر' : 'عضو'}</Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminAgentsPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.agents}</h1>
        <Button><UserPlus className="h-4 w-4" /> افزودن کارشناس</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {mockAgents.map(agent => (
          <Card key={agent.id}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={agent.display_name} presence={agent.presence} size="lg" />
              <div>
                <h3 className="font-medium">{agent.display_name}</h3>
                <StatusBadge status={agent.presence} type="presence" />
                <span className="text-xs text-text-muted mr-1">{agent.presence}</span>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-text-muted">
              <p>زمان‌بندی: {agent.timezone}</p>
              <p>حداکثر تیکت فعال: {agent.max_active_tickets}</p>
              <p>زبان: {agent.language === 'fa' ? 'فارسی' : 'English'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminUsersPage() {
  const { t, showToast } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const users = [
    { ...mockUser, role: 'ADMIN' as Role },
    { id: 'u-002', email: 'fateme@finoticket.ir', display_name: 'فاطمه رضایی', role: 'AGENT' as Role, status: 'ACTIVE' as const, presence: 'AWAY' as Presence, timezone: 'Asia/Tehran', language: 'fa' as const, created_at: '2024-02-01' },
    { id: 'u-003', email: 'hasan@finoticket.ir', display_name: 'حسن نوری', role: 'MANAGER' as Role, status: 'ACTIVE' as const, presence: 'BUSY' as Presence, timezone: 'Asia/Tehran', language: 'fa' as const, created_at: '2024-03-01' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.users}</h1>
        <Button onClick={() => setShowInvite(true)}><UserPlus className="h-4 w-4" /> {t.admin.invite_user}</Button>
      </div>
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-text-muted">کاربر</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">ایمیل</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">نقش</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">وضعیت</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">حضور</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border hover:bg-surface-hover">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={u.display_name} size="sm" /><span className="font-medium">{u.display_name}</span></div></td>
                <td className="px-4 py-3 text-text-muted">{u.email}</td>
                <td className="px-4 py-3"><Badge variant="brand">{u.role}</Badge></td>
                <td className="px-4 py-3"><Badge variant={u.status === 'ACTIVE' ? 'success' : 'default'}>{u.status === 'ACTIVE' ? 'فعال' : u.status}</Badge></td>
                <td className="px-4 py-3"><StatusBadge status={u.presence} type="presence" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title={t.admin.invite_user}>
        <div className="space-y-4">
          <Input label="ایمیل یا موبایل" placeholder="user@example.com" />
          <Select label={t.admin.role} options={[{ value: 'AGENT', label: 'کارشناس' }, { value: 'MANAGER', label: 'مدیر' }, { value: 'ADMIN', label: 'مدیر سیستم' }, { value: 'VIEWER', label: 'مشاهده‌گر' }]} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('دعوت‌نامه ارسال شد'); setShowInvite(false); }}>ارسال دعوت</Button>
            <Button variant="secondary" onClick={() => setShowInvite(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminSLAPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.sla}</h1>
        <Button><Plus className="h-4 w-4" /> سیاست جدید</Button>
      </div>
      <div className="space-y-4">
        {mockSLAPolicies.map(sla => (
          <Card key={sla.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{sla.name}</h3>
                <StatusBadge status={sla.priority} type="priority" />
              </div>
              <Badge variant={sla.status === 'ACTIVE' ? 'success' : 'default'}>{sla.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-text-muted text-xs">اولین پاسخ</p>
                <p className="font-medium">{Math.floor(sla.first_response_seconds / 60)} دقیقه</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-text-muted text-xs">حل نهایی</p>
                <p className="font-medium">{Math.floor(sla.resolution_seconds / 3600)} ساعت</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminWorkflowsPage() {
  const { t } = useApp();
  const workflows = [
    { id: 'wf-1', name: 'ارجاع خودکار به فنی', event: 'ticket.created', status: 'ACTIVE' as const, version: 2, steps: [{ id: 's1', type: 'CONDITION' as const, step_key: 'check_category', config: { field: 'category', op: 'equals', value: 'auth' }, sort_order: 1 }, { id: 's2', type: 'ACTION' as const, step_key: 'assign_dept', config: { department: 'tech' }, sort_order: 2 }] },
    { id: 'wf-2', name: 'اعلان SLA بحرانی', event: 'sla.warning', status: 'ACTIVE' as const, version: 1, steps: [{ id: 's3', type: 'NOTIFICATION' as const, step_key: 'notify_manager', config: { channel: 'email', template: 'sla_warning' }, sort_order: 1 }] },
    { id: 'wf-3', name: 'بستن خودکار تیکت‌های قدیمی', event: 'ticket.updated', status: 'DRAFT' as const, version: 1, steps: [] },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.workflows}</h1>
        <Button><Plus className="h-4 w-4" /> جریان جدید</Button>
      </div>
      <div className="space-y-4">
        {workflows.map(wf => (
          <Card key={wf.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{wf.name}</h3>
                <p className="text-xs text-text-muted">رویداد: {wf.event} • نسخه: {wf.version}</p>
              </div>
              <Badge variant={wf.status === 'ACTIVE' ? 'success' : wf.status === 'DRAFT' ? 'warning' : 'default'}>
                {wf.status === 'ACTIVE' ? 'فعال' : wf.status === 'DRAFT' ? 'پیش‌نویس' : 'غیرفعال'}
              </Badge>
            </div>
            {wf.steps.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {wf.steps.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <div className="shrink-0 px-3 py-2 bg-surface-alt rounded-lg border border-border text-xs">
                      <Badge variant="brand">{step.type}</Badge>
                      <p className="mt-1 font-mono text-text-muted">{step.step_key}</p>
                    </div>
                    {i < wf.steps.length - 1 && <span className="text-text-muted">←</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminAutomationsPage() {
  const { t } = useApp();
  const automations = [
    { id: 'au-1', name: 'تغییر وضعیت به در انتظار مشتری', trigger_event: 'message.added', conditions: [{ field: 'sender_type', op: 'equals', value: 'AGENT' }], actions: [{ type: 'set_status', value: 'WAITING_CUSTOMER' }], status: 'ACTIVE' as const },
    { id: 'au-2', name: 'اولویت‌بندی خودکار کلمات کلیدی', trigger_event: 'ticket.created', conditions: [{ field: 'body', op: 'contains', value: 'فوری' }], actions: [{ type: 'set_priority', value: 'HIGH' }], status: 'ACTIVE' as const },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.automations}</h1>
        <Button><Plus className="h-4 w-4" /> قانون جدید</Button>
      </div>
      <div className="space-y-4">
        {automations.map(au => (
          <Card key={au.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{au.name}</h3>
                <p className="text-xs text-text-muted">راه‌انداز: {au.trigger_event}</p>
              </div>
              <Badge variant={au.status === 'ACTIVE' ? 'success' : 'default'}>{au.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="font-medium text-text-muted mb-1">شرایط</p>
                {au.conditions.map((c, i) => <p key={i} className="font-mono">{c.field} {c.op} {c.value}</p>)}
              </div>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="font-medium text-text-muted mb-1">عملیات</p>
                {au.actions.map((a, i) => <p key={i} className="font-mono">{a.type}: {a.value}</p>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminAPIClientsPage() {
  const { t, showToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [newSecret, setNewSecret] = useState('');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.api_clients}</h1>
        <Button onClick={() => { setShowCreate(true); setNewSecret('sk_live_' + Math.random().toString(36).slice(2, 20)); }}>
          <Plus className="h-4 w-4" /> کلاینت جدید
        </Button>
      </div>
      <div className="space-y-4">
        {mockAPIClients.map(client => (
          <Card key={client.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-xs font-mono text-text-muted">ID: {client.client_id}</p>
              </div>
              <Badge variant={client.status === 'ACTIVE' ? 'success' : 'danger'}>{client.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {client.scopes.map(s => <Badge key={s} variant="info">{s}</Badge>)}
            </div>
            <p className="text-xs text-text-muted">آخرین استفاده: {client.last_used_at ? new Date(client.last_used_at).toLocaleString('fa-IR') : '—'}</p>
          </Card>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="کلاینت API جدید" size="lg">
        <div className="space-y-4">
          <Input label="نام" placeholder="نام کلاینت" />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">دسترسی‌ها</label>
            <div className="flex flex-wrap gap-2">
              {['tickets:read', 'tickets:write', 'customers:read', 'customers:write', 'analytics:read', 'knowledge:read', 'events:write'].map(s => (
                <label key={s} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm cursor-pointer hover:bg-surface-hover">
                  <input type="checkbox" className="rounded" /> {s}
                </label>
              ))}
            </div>
          </div>
          {newSecret && (
            <div className="bg-warning-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">⚠️ این رمز فقط یک‌بار نمایش داده می‌شود:</p>
              <div className="flex items-center gap-2 bg-white rounded px-3 py-2 font-mono text-sm">
                <code>{newSecret}</code>
                <CopyButton text={newSecret} />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button onClick={() => { showToast('کلاینت ایجاد شد'); setShowCreate(false); }}>ایجاد</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>انصراف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminWebhooksPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.webhooks}</h1>
        <Button><Plus className="h-4 w-4" /> وبهوک جدید</Button>
      </div>
      <div className="space-y-4">
        {mockWebhooks.map(wh => (
          <Card key={wh.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{wh.name}</h3>
                <p className="text-xs font-mono text-text-muted">{wh.url}</p>
              </div>
              <Badge variant={wh.status === 'ACTIVE' ? 'success' : 'default'}>{wh.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {wh.events.map(e => <Badge key={e} variant="info">{e}</Badge>)}
            </div>
            {/* Deliveries */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-text-muted mb-2">آخرین ارسال‌ها:</p>
              <div className="space-y-1.5">
                {wh.deliveries.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-xs p-2 bg-surface-alt rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={d.status === 'DELIVERED' ? 'success' : 'danger'}>{d.status === 'DELIVERED' ? 'موفق' : 'ناموفق'}</Badge>
                      <span className="text-text-muted">{d.event}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.response_code && <span className={d.response_code < 400 ? 'text-success-600' : 'text-danger-600'}>{d.response_code}</span>}
                      <span className="text-text-muted">{d.attempts} تلاش</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminAuditLogsPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.audit_logs}</h1>
      <Card className="mb-4 !p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput value="" onChange={() => {}} placeholder="جستجو در لاگ‌ها..." />
          <Select options={[{ value: '', label: 'همه عملیات' }, { value: 'CREATE', label: 'ایجاد' }, { value: 'UPDATE', label: 'ویرایش' }, { value: 'DELETE', label: 'حذف' }, { value: 'ASSIGN', label: 'ارجاع' }, { value: 'STATUS_CHANGE', label: 'تغییر وضعیت' }]} value="" onChange={() => {}} />
        </div>
      </Card>
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-text-muted">زمان</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">کاربر</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">عملیات</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">نوع</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">شناسه</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">IP</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id} className="border-b border-border hover:bg-surface-hover">
                <td className="px-4 py-3 text-text-muted text-xs">{new Date(log.created_at).toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3">{log.actor_name}</td>
                <td className="px-4 py-3"><Badge variant={log.action === 'CREATE' ? 'success' : log.action === 'DELETE' ? 'danger' : 'info'}>{log.action}</Badge></td>
                <td className="px-4 py-3 text-text-muted">{log.entity_type}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.entity_id}</td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminKnowledgeBasesPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.knowledge_bases}</h1>
        <Button><Plus className="h-4 w-4" /> پایگاه دانش جدید</Button>
      </div>
      <div className="space-y-4">
        {mockKnowledgeBases.map(kb => (
          <Card key={kb.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{kb.name}</h3>
                <p className="text-xs text-text-muted">محدوده: {kb.scope} {kb.product_id ? `• محصول: ${mockProducts.find(p => p.id === kb.product_id)?.name}` : ''}</p>
              </div>
              <Badge variant={kb.status === 'ACTIVE' ? 'success' : 'default'}>{kb.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</Badge>
            </div>
            <p className="text-sm text-text-muted">{kb.articles_count} مقاله</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ========== WIDGET ==========
function WidgetPage() {
  const [screen, setScreen] = useState<'home' | 'new' | 'list' | 'detail'>('home');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState('');

  const branding = mockProducts[0].widget_branding!;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Widget Container */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-border" dir="rtl">
        {/* Header */}
        <div className="p-4 text-white" style={{ backgroundColor: branding.primary_color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              <h2 className="font-bold">{branding.title}</h2>
            </div>
            <button onClick={() => setScreen('home')} className="p-1 rounded hover:bg-white/20">
              <Home className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">{branding.welcome_text}</p>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[400px]">
          {screen === 'home' && (
            <div className="space-y-3">
              <button onClick={() => setScreen('new')} className="w-full p-4 rounded-xl border-2 border-dashed border-brand-300 hover:border-brand-500 hover:bg-brand-50 transition-colors text-center">
                <Plus className="h-8 w-8 text-brand-500 mx-auto mb-2" />
                <p className="font-medium text-brand-700">تیکت جدید</p>
                <p className="text-xs text-text-muted mt-1">درخواست پشتیبانی ثبت کنید</p>
              </button>
              <button onClick={() => setScreen('list')} className="w-full p-4 rounded-xl border border-border hover:bg-surface-hover transition-colors text-center">
                <History className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="font-medium">تیکت‌های من</p>
                <p className="text-xs text-text-muted mt-1">مشاهده تیکت‌های قبلی</p>
              </button>
            </div>
          )}

          {screen === 'new' && (
            <div className="space-y-4">
              <Input label="موضوع" value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع درخواست" />
              <Textarea label="توضیحات" value={description} onChange={e => setDescription(e.target.value)} placeholder="مشکل خود را شرح دهید..." rows={4} />
              <FileUpload onFiles={() => {}} />
              <Button className="w-full" onClick={() => { setShowToast('تیکت ثبت شد!'); setScreen('list'); setTimeout(() => setShowToast(''), 3000); }}>
                <Send className="h-4 w-4" /> ثبت تیکت
              </Button>
              <button onClick={() => setScreen('home')} className="w-full text-center text-sm text-text-muted hover:text-text">بازگشت</button>
            </div>
          )}

          {screen === 'list' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">تیکت‌های شما</h3>
              {mockTickets.slice(0, 3).map(tk => (
                <div key={tk.id} onClick={() => setScreen('detail')}
                  className="p-3 rounded-lg border border-border hover:bg-surface-hover cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-text-muted">{tk.ticket_number}</span>
                    <StatusBadge status={tk.status} />
                  </div>
                  <p className="text-sm font-medium">{tk.subject}</p>
                  <p className="text-xs text-text-muted mt-1">{new Date(tk.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
              ))}
              <button onClick={() => setScreen('home')} className="w-full text-center text-sm text-text-muted hover:text-text mt-4">بازگشت</button>
            </div>
          )}

          {screen === 'detail' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setScreen('list')} className="p-1 rounded hover:bg-surface-hover"><ChevronLeft className="h-4 w-4 flip-rtl" /></button>
                <span className="font-mono text-sm text-text-muted">FT-1001</span>
                <StatusBadge status="OPEN" />
              </div>
              <h3 className="font-semibold">مشکل در ورود به حساب کاربری</h3>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {mockMessages.slice(0, 3).map(msg => (
                  <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.sender_type === 'CUSTOMER' ? 'bg-brand-50 mr-4' : 'bg-surface-alt ml-4'}`}>
                    <p className="text-xs text-text-muted mb-1">{msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>{msg.body}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex gap-2">
                  <input value={message} onChange={e => setMessage(e.target.value)} placeholder="پیام خود را بنویسید..."
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  <Button size="sm" onClick={() => { setShowToast('پیام ارسال شد'); setMessage(''); setTimeout(() => setShowToast(''), 2000); }}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border text-center">
          <p className="text-xs text-text-muted">پشتیبانی توسط FinoTicket</p>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
          {showToast}
        </div>
      )}
    </div>
  );
}

// ========== FORGOT PASSWORD ==========
function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-mesh)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-hero)' }}>
            <TicketIcon className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-brand-800)' }}>بازیابی رمز عبور</h1>
        </div>
        <Card className="!p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-success-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">ایمیل ارسال شد</h3>
              <p className="text-sm text-text-muted mb-4">لینک بازیابی به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.</p>
              <Link to="/login"><Button variant="secondary">بازگشت به ورود</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="ایمیل" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="email@example.com" required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
              </Button>
              <p className="text-center text-xs text-text-muted">
                <Link to="/login" className="text-brand-600 hover:underline">بازگشت به ورود</Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

// ========== PRIVACY / TERMS ==========
function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const { lang } = useApp();
  const isPrivacy = type === 'privacy';
  
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
            <TicketIcon className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold" style={{ color: 'var(--color-brand-700)' }}>فینوتیکت</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-brand-800)' }}>
          {isPrivacy ? 'سیاست حریم خصوصی' : 'شرایط استفاده'}
        </h1>
        <div className="prose max-w-none text-text-secondary">
          {isPrivacy ? (
            <>
              <p>فینوتیکت به حریم خصوصی کاربران خود متعهد است. این سیاست توضیح می‌دهد که ما چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم.</p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">۱. اطلاعات جمع‌آوری شده</h2>
              <p>ما اطلاعات زیر را جمع‌آوری می‌کنیم: نام، ایمیل، شماره تلفن، و داده‌های مربوط به تیکت‌های پشتیبانی.</p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">۲. استفاده از اطلاعات</h2>
              <p>اطلاعات شما فقط برای ارائه خدمات پشتیبانی و بهبود تجربه کاربری استفاده می‌شود.</p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">۳. امنیت</h2>
              <p>ما از رمزنگاری و پروتکل‌های امنیتی استاندارد برای محافظت از اطلاعات شما استفاده می‌کنیم.</p>
            </>
          ) : (
            <>
              <p>با استفاده از سرویس فینوتیکت، شما با شرایط زیر موافقت می‌کنید.</p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">۱. استفاده مجاز</h2>
              <p>شما متعهد می‌شوید که از سرویس فقط برای اهداف قانونی و مطابق با قوانین جمهوری اسلامی ایران استفاده کنید.</p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">۲. مسئولیت حساب</h2>
              <p>شما مسئول حفظ امنیت اطلاعات حساب کاربری خود هستید.</p>
              <h2 className="text-xl font-bold mt-6 mb-3 text-text">۳. محدودیت مسئولیت</h2>
              <p>فینوتیکت مسئولیتی در قبال خسارات ناشی از استفاده نادرست از سرویس ندارد.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== FORBIDDEN / NOT FOUND ==========
function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="h-20 w-20 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-10 w-10 text-danger-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">دسترسی ممنوع</h1>
        <p className="text-text-muted mb-4">شما مجوز مشاهده این صفحه را ندارید.</p>
        <Link to="/desk"><Button>بازگشت به میز کار</Button></Link>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-500 mb-4">۴۰۴</h1>
        <h2 className="text-xl font-bold mb-2">صفحه یافت نشد</h2>
        <p className="text-text-muted mb-4">صفحه مورد نظر وجود ندارد یا منتقل شده است.</p>
        <Link to="/desk"><Button>بازگشت به میز کار</Button></Link>
      </div>
    </div>
  );
}

// ========== MAIN APP ==========
export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/widget" element={<WidgetPage />} />
          <Route path="/desk" element={<Layout><DeskPage /></Layout>} />
          <Route path="/desk/tickets" element={<Layout><TicketListPage /></Layout>} />
          <Route path="/desk/tickets/new" element={<Layout><CreateTicketPage /></Layout>} />
          <Route path="/desk/tickets/:id" element={<Layout><TicketDetailPage /></Layout>} />
          <Route path="/desk/customers" element={<Layout><CustomersPage /></Layout>} />
          <Route path="/desk/customers/:id" element={<Layout><CustomerDetailPage /></Layout>} />
          <Route path="/desk/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/desk/knowledge" element={<Layout><KnowledgePage /></Layout>} />
          <Route path="/desk/knowledge/articles/:id" element={<Layout><ArticleReaderPage /></Layout>} />
          <Route path="/desk/analytics" element={<Layout><AnalyticsPage /></Layout>} />
          <Route path="/admin/products" element={<Layout><AdminProductsPage /></Layout>} />
          <Route path="/admin/categories" element={<Layout><AdminCategoriesPage /></Layout>} />
          <Route path="/admin/departments" element={<Layout><AdminDepartmentsPage /></Layout>} />
          <Route path="/admin/teams" element={<Layout><AdminTeamsPage /></Layout>} />
          <Route path="/admin/agents" element={<Layout><AdminAgentsPage /></Layout>} />
          <Route path="/admin/users" element={<Layout><AdminUsersPage /></Layout>} />
          <Route path="/admin/sla" element={<Layout><AdminSLAPage /></Layout>} />
          <Route path="/admin/workflows" element={<Layout><AdminWorkflowsPage /></Layout>} />
          <Route path="/admin/automations" element={<Layout><AdminAutomationsPage /></Layout>} />
          <Route path="/admin/knowledge-bases" element={<Layout><AdminKnowledgeBasesPage /></Layout>} />
          <Route path="/admin/api-clients" element={<Layout><AdminAPIClientsPage /></Layout>} />
          <Route path="/admin/webhooks" element={<Layout><AdminWebhooksPage /></Layout>} />
          <Route path="/admin/audit-logs" element={<Layout><AdminAuditLogsPage /></Layout>} />
          <Route path="/forbidden" element={<Layout><ForbiddenPage /></Layout>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
