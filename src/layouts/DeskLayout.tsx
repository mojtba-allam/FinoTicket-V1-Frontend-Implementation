import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, Search, BookOpen, BarChart3, LogOut, Menu, Package, Tags, Building2, UserCheck, Shield, Workflow, Zap, Globe, Webhook, FileSearch, Ticket as TicketIcon, Clock } from 'lucide-react';
import { NotificationCenter } from '../components/NotificationCenter';
import { PresenceSelect } from '../components/PresenceSelect';
import { ImpersonationBanner } from '../components/ImpersonationBanner';
import { useApp } from '../app/providers';
import { mockProducts } from '../data/mock';

export default function DeskLayout() {
  const { t, user, lang, setLang, product, setProduct, presence, setPresence } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProductSwitch, setShowProductSwitch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Console guard: redirect platform users to /platform
  if (user.console === 'platform') {
    return <Navigate to="/platform" replace />;
  }

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
              <div className="h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                {user.display_name.charAt(0)}
              </div>
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
              </button>
              {showProductSwitch && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg border border-border shadow-lg z-50 py-1">
                  {mockProducts.map(p => (
                    <button key={p.id} onClick={() => { setProduct(p); setShowProductSwitch(false); }}
                      className={`w-full text-right px-4 py-2 text-sm hover:bg-surface-hover ${p.id === product.id ? 'bg-brand-50 text-brand-700' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.status !== 'ACTIVE' && <span className="text-xs px-2 py-0.5 rounded-full bg-warning-50 text-warning-600">{p.status}</span>}
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

        {/* Impersonation Banner */}
        <ImpersonationBanner />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
