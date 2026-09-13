import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check, Copy, Loader2, AlertCircle, Inbox, FileText } from 'lucide-react';

// ========== BUTTON ==========
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', style, ...props }: {
  children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'ember';
  size?: 'sm' | 'md' | 'lg'; className?: string; disabled?: boolean; onClick?: () => void; type?: 'button' | 'submit';
  style?: React.CSSProperties;
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-text border border-border hover:bg-surface-hover shadow-sm',
    ghost: 'text-text-secondary hover:bg-surface-hover',
    danger: 'bg-danger-500 text-white hover:bg-danger-600',
    success: 'bg-success-500 text-white hover:bg-success-600',
    ember: 'bg-ember-500 text-white hover:bg-ember-600 shadow-sm',
  };
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return <button type={type} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled} onClick={onClick} style={style} {...props}>{children}</button>;
}

// ========== INPUT ==========
export function Input({ label, error, className = '', icon, onChange, value, ...props }: {
  label?: string; error?: string; className?: string; icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number | readonly string[];
  [key: string]: any;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>}
        <input 
          {...props} 
          value={value}
          onChange={onChange}
          className={`w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${icon ? 'pr-10' : ''} ${error ? 'border-danger-500' : ''}`} 
        />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}

// ========== TEXTAREA ==========
export function Textarea({ label, error, className = '', rows = 4, onChange, value, ...props }: {
  label?: string; error?: string; className?: string; rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string | number | readonly string[];
  [key: string]: any;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <textarea 
        rows={rows} 
        {...props} 
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${error ? 'border-danger-500' : ''}`} 
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}

// ========== SELECT ==========
export function Select({ label, options, className = '', value, onChange, placeholder, error, ...props }: {
  label?: string; options: { value: string; label: string }[]; className?: string;
  value?: string; onChange?: (v: string) => void; placeholder?: string; error?: string; [key: string]: any;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        <select value={value} onChange={e => onChange?.(e.target.value)} className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${error ? 'border-danger-500' : 'border-border'}`} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}

// ========== BADGE ==========
export function Badge({ children, variant = 'default', className = '' }: {
  children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand'; className?: string;
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    brand: 'bg-brand-100 text-brand-700',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

// ========== STATUS BADGE ==========
export function StatusBadge({ status, type = 'ticket' }: { status?: string | null; type?: 'ticket' | 'priority' | 'sla' | 'presence' }) {
  // API-driven records may omit these fields; render a neutral dash instead of crashing.
  if (!status) return <span className="text-text-muted">—</span>;

  if (type === 'ticket') {
    const cls = `status-${status.toLowerCase()}`;
    const labels: Record<string, string> = { OPEN: 'باز', IN_PROGRESS: 'در حال بررسی', WAITING_CUSTOMER: 'در انتظار مشتری', WAITING_INTERNAL: 'در انتظار داخلی', RESOLVED: 'حل شده', CLOSED: 'بسته' };
    return <Badge className={cls}>{labels[status] || status}</Badge>;
  }
  if (type === 'priority') {
    const cls = `priority-${status.toLowerCase()}`;
    const labels: Record<string, string> = { LOW: 'کم', NORMAL: 'معمولی', HIGH: 'بالا', URGENT: 'فوری', CRITICAL: 'بحرانی' };
    return <span className={`text-xs font-medium ${cls}`}>{labels[status] || status}</span>;
  }
  if (type === 'sla') {
    const cls = `sla-${status.toLowerCase()}`;
    const labels: Record<string, string> = { ON_TRACK: '✓ به‌موقع', WARNING: '⚠ هشدار', BREACHED: '✗ نقض شده' };
    return <span className={`text-xs font-medium ${cls}`}>{labels[status] || status}</span>;
  }
  if (type === 'presence') {
    const colors: Record<string, string> = { ONLINE: 'bg-green-500', AWAY: 'bg-amber-500', BUSY: 'bg-red-500', OFFLINE: 'bg-gray-400' };
    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status] || 'bg-gray-400'}`} />;
  }
  return <Badge>{status}</Badge>;
}

// ========== AVATAR ==========
export function Avatar({ name, size = 'md', presence }: { name: string; size?: 'sm' | 'md' | 'lg'; presence?: string }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-accent-500'];
  const colorIdx = name.charCodeAt(0) % colors.length;
  return (
    <div className="relative inline-flex">
      <div className={`${sizes[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-medium`}>{initials}</div>
      {presence && <span className={`absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-white ${presence === 'ONLINE' ? 'bg-green-500' : presence === 'AWAY' ? 'bg-amber-500' : presence === 'BUSY' ? 'bg-red-500' : 'bg-gray-400'}`} />}
    </div>
  );
}

// ========== MODAL ==========
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative ${sizes[size]} w-full bg-white rounded-xl shadow-2xl animate-fade-in max-h-[90vh] overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ========== DRAWER ==========
export function Drawer({ open, onClose, title, children, side = 'left' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; side?: 'left' | 'right';
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-slide-in flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ========== TOAST ==========
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'warning' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: 'bg-success-500', error: 'bg-danger-500', warning: 'bg-warning-500', info: 'bg-brand-500' };
  return (
    <div className={`fixed bottom-6 left-6 z-[100] ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in flex items-center gap-3`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-white/20 rounded"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ========== EMPTY STATE ==========
export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon || <Inbox className="h-12 w-12 text-text-muted mb-4" />}
      <h3 className="text-lg font-medium text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ========== LOADING ==========
export function Loading({ text = 'در حال بارگذاری...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-3" />
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  );
}

// ========== SKELETON ==========
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-200 rounded animate-pulse-slow ${className}`} />;
}

// ========== TABS ==========
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text'}`}>
          {t.label}{t.count !== undefined && <span className="mr-1.5 text-xs bg-slate-100 rounded-full px-1.5 py-0.5">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ========== COPY BUTTON ==========
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text transition-colors" title="کپی">
      {copied ? <Check className="h-3.5 w-3.5 text-success-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ========== PAGINATION ==========
export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>قبلی</Button>
      <span className="text-sm text-text-muted">صفحه {page} از {totalPages}</span>
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>بعدی</Button>
    </div>
  );
}

// ========== CARD ==========
export function Card({ children, className = '', padding = true }: { children: React.ReactNode; className?: string; padding?: boolean }) {
  return <div className={`bg-white rounded-xl border border-border shadow-sm ${padding ? 'p-5' : ''} ${className}`}>{children}</div>;
}

// ========== KPI CARD ==========
export function KPICard({ label, value, icon, trend, color = 'brand' }: { label: string; value: string | number; icon: React.ReactNode; trend?: string; color?: string }) {
  const colors: Record<string, string> = { brand: 'bg-brand-50 text-brand-600', success: 'bg-emerald-50 text-emerald-600', warning: 'bg-amber-50 text-amber-600', danger: 'bg-red-50 text-red-600' };
  return (
    <Card className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
        {trend && <p className="text-xs text-text-secondary mt-0.5">{trend}</p>}
      </div>
    </Card>
  );
}

// ========== SEARCH INPUT ==========
export function SearchInput({ value, onChange, placeholder = 'جستجو...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-white pr-10 pl-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
    </div>
  );
}

// ========== SEGMENTED CONTROL ==========
export function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface-alt p-0.5">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${value === o.value ? 'bg-white shadow-sm font-medium text-brand-600' : 'text-text-muted hover:text-text'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ========== ERROR STATE ==========
export function ErrorState({ title = 'خطایی رخ داد', description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-danger-500 mb-4" />
      <h3 className="text-lg font-medium text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-4">{description}</p>}
      {onRetry && <Button variant="secondary" onClick={onRetry}>تلاش مجدد</Button>}
    </div>
  );
}

// ========== DEGRADED BANNER ==========
export function DegradedBanner({ message }: { message: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
      <p className="text-sm text-amber-800">{message}</p>
    </div>
  );
}

// ========== FILE UPLOAD ==========
export function FileUpload({ onFiles, accept, multiple = false }: { onFiles: (files: File[]) => void; accept?: string; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden"
        onChange={e => { if (e.target.files) onFiles(Array.from(e.target.files)); }} />
      <Button variant="secondary" size="sm" onClick={() => ref.current?.click()}>
        <FileText className="h-4 w-4" /> ضمیمه فایل
      </Button>
    </div>
  );
}
