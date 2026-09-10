import React, { useState } from 'react';
import { Ticket, Plus, History, Send, Home } from 'lucide-react';
import { Button, Input, Textarea, FileUpload } from '../../components/ui';
import { mockProducts, mockTickets } from '../../data/mock';

export default function WidgetPage() {
  const [screen, setScreen] = useState<'home' | 'new' | 'list' | 'detail'>('home');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);

  const branding = mockProducts[0].widget_branding!;

  // File upload validation
  const handleFileUpload = (files: File[]) => {
    const MAX_FILES = 5;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (pendingAttachments.length + files.length > MAX_FILES) {
      setShowToast('حداکثر ۵ فایل مجاز است');
      setTimeout(() => setShowToast(''), 3000);
      return;
    }

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setShowToast(`فایل "${file.name}" بزرگتر از ۵ مگابایت است`);
        setTimeout(() => setShowToast(''), 3000);
        return;
      }

      const isValidType = ALLOWED_TYPES.some(type => file.type.startsWith(type));
      if (!isValidType) {
        setShowToast(`فایل "${file.name}" فرمت معتبری ندارد`);
        setTimeout(() => setShowToast(''), 3000);
        return;
      }
    }

    setPendingAttachments([...pendingAttachments, ...files]);
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments(pendingAttachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-4 text-white" style={{ backgroundColor: branding.primary_color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
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
              <Input label="موضوع" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} placeholder="موضوع درخواست" />
              <Textarea label="توضیحات" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="مشکل خود را شرح دهید..." rows={4} />
              
              {/* Pending attachments */}
              {pendingAttachments.length > 0 && (
                <div className="space-y-2">
                  {pendingAttachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-surface-alt rounded-lg text-xs">
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-text-muted">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => removePendingAttachment(index)}
                        className="p-1 hover:bg-surface-hover rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <FileUpload onFiles={handleFileUpload} accept="image/*,.pdf,.doc,.docx" multiple />
              <Button className="w-full" onClick={() => { 
                setShowToast('تیکت ثبت شد!'); 
                setPendingAttachments([]);
                setScreen('list'); 
                setTimeout(() => setShowToast(''), 3000); 
              }}>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tk.status === 'OPEN' ? 'bg-brand-50 text-brand-700' : 'bg-success-50 text-success-700'}`}>
                      {tk.status === 'OPEN' ? 'باز' : tk.status === 'RESOLVED' ? 'حل شده' : tk.status}
                    </span>
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
                <button onClick={() => setScreen('list')} className="p-1 rounded hover:bg-surface-hover">
                  <History className="h-4 w-4" />
                </button>
                <span className="font-mono text-sm text-text-muted">FT-1001</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">باز</span>
              </div>
              <h3 className="font-semibold">مشکل در ورود به حساب کاربری</h3>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                <div className="p-3 rounded-lg bg-brand-50 mr-4">
                  <p className="text-xs text-text-muted mb-1">سارا احمدی • ۱۰:۰۰</p>
                  <p className="text-sm">سلام، من نمی‌تونم وارد حساب کاربریم بشم.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-alt ml-4">
                  <p className="text-xs text-text-muted mb-1">علی محمدی • ۱۰:۳۰</p>
                  <p className="text-sm">سلام سارا خانم. لطفاً مرورگر خود را به‌روزرسانی کنید.</p>
                </div>
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
