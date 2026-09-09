import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, Clock, AlertTriangle, MessageSquare, UserPlus, Shield } from 'lucide-react';
import { Badge } from './ui';

export interface Notification {
  id: string;
  type: 'sla_warning' | 'sla_breached' | 'assigned' | 'message' | 'mention' | 'status_change';
  title: string;
  description: string;
  ticket_id?: string;
  ticket_number?: string;
  created_at: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    type: 'sla_breached',
    title: 'SLA نقض شده',
    description: 'تیکت FT-1003 بیش از ۲ ساعت از زمان پاسخ اول گذشته',
    ticket_id: 't-003',
    ticket_number: 'FT-1003',
    created_at: '2024-12-20T11:30:00Z',
    read: false,
  },
  {
    id: 'n-2',
    type: 'assigned',
    title: 'تیکت جدید ارجاع شد',
    description: 'FT-1006 به شما ارجاع شد',
    ticket_id: 't-006',
    ticket_number: 'FT-1006',
    created_at: '2024-12-20T11:00:00Z',
    read: false,
  },
  {
    id: 'n-3',
    type: 'message',
    title: 'پیام جدید از مشتری',
    description: 'سارا احمدی پیامی در FT-1001 ارسال کرد',
    ticket_id: 't-001',
    ticket_number: 'FT-1001',
    created_at: '2024-12-20T10:45:00Z',
    read: true,
  },
  {
    id: 'n-4',
    type: 'sla_warning',
    title: 'هشدار SLA',
    description: 'FT-1002 کمتر از ۳۰ دقیقه تا نقض SLA',
    ticket_id: 't-002',
    ticket_number: 'FT-1002',
    created_at: '2024-12-20T10:00:00Z',
    read: true,
  },
];

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'sla_breached':
      return <AlertTriangle className="h-4 w-4 text-danger-500" />;
    case 'sla_warning':
      return <Clock className="h-4 w-4 text-warning-500" />;
    case 'assigned':
      return <UserPlus className="h-4 w-4 text-brand-500" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-accent-500" />;
    case 'mention':
      return <Shield className="h-4 w-4 text-brand-500" />;
    default:
      return <Bell className="h-4 w-4 text-text-muted" />;
  }
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'همین الان';
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  return `${diffDays} روز پیش`;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.ticket_id) {
      // Navigate to ticket - in real app would use router
      window.location.hash = `/desk/tickets/${notification.ticket_id}`;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="اعلان‌ها"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-ember-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl border border-border shadow-2xl z-50 overflow-hidden animate-fade-in"
          role="dialog"
          aria-label="مرکز اعلان‌ها"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-alt">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">اعلان‌ها</h3>
              {unreadCount > 0 && (
                <Badge variant="brand">{unreadCount} خوانده نشده</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium hover:text-brand-600 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                خواندن همه
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-text-muted">در حال بارگذاری...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-10 w-10 text-text-muted mx-auto mb-2" />
                <p className="text-sm font-medium">اعلانی وجود ندارد</p>
                <p className="text-xs text-text-muted mt-1">اعلان‌های جدید اینجا نمایش داده می‌شوند</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-right px-4 py-3 hover:bg-surface-hover transition-colors flex gap-3 ${!notification.read ? 'bg-brand-50/30' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notification.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {notification.ticket_number && (
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-alt border border-border">
                            {notification.ticket_number}
                          </span>
                        )}
                        <span className="text-xs text-text-muted">{getRelativeTime(notification.created_at)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-surface-alt">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.hash = '/desk';
              }}
              className="text-xs font-medium hover:text-brand-600 transition-colors w-full text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              مشاهده همه اعلان‌ها
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
