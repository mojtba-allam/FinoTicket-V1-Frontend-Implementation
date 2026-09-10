import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Settings, FileSearch, LogOut, Menu, Ticket as TicketIcon } from 'lucide-react';
import { useApp } from '../app/providers';

export default function PlatformLayout() {
  const { t, user, lang, setLang, presence, setPresence } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: lang === 'fa' ? 'نمای کلی' : 'Overview', path: '/platform' },
    { id: 'tenants', icon: Building2, label: lang === 'fa' ? 'مستأجران' : 'Tenants', path: '/platform/tenants' },
    { id: 'settings', icon: Settings, label: lang === 'fa' ? 'تنظیمات' : 'Settings', path: '/platform/settings' },
    { id: 'audit', icon: FileSearch, label: lang === 'fa' ? 'گزارش حسابرسی' : 'Audit', path: '/platform/audit' },
  ];

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
              <div>
                <span className="font-bold block" style={{ color: 'var(--color-brand-700)' }}>{t.app.name}</span>
                <span className="text-xs text-text-muted">{lang === 'fa' ? 'سوپر ادمین' : 'Super Admin'}</span>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-surface-hover">
            <Menu className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.id} to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === item.path ? 'bg-brand-50 text-brand-700 font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-text'}`}>
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
                <p className="text-xs text-text-muted">{lang === 'fa' ? 'سوپر ادمین' : 'Super Admin'}</p>
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
            <h2 className="text-lg font-semibold">
              {lang === 'fa' ? 'کنسول مدیریت پلتفرم' : 'Platform Management Console'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
            <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className="px-2.5 py-1.5 text-xs border border-border rounded-lg hover:bg-surface-hover font-medium">
              {lang === 'fa' ? 'EN' : 'فا'}
            </button>

            {/* Logout */}
            <button onClick={() => navigate('/login')} className="p-2 rounded-lg hover:bg-surface-hover">
              <LogOut className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
