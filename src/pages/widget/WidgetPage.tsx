import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ticket, Plus, History, Send, Home, ChevronLeft, Paperclip, X, Info, RefreshCw } from 'lucide-react';
import { Button, Input, Textarea, FileUpload, Badge, Select } from '../../components/ui';
import { mockProducts, mockCategories, mockTopics } from '../../data/mock';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { getDataApi } from '../../lib/api/dataApi';
import { describeError } from '../../lib/api/hooks';
import { isLiveMode } from '../../lib/api/config';
import { sessionStore } from '../../lib/api/session';
import { useApp } from '../../app/providers';

type Screen = 'home' | 'new' | 'list' | 'conversation';

interface MockToken {
  tenant_id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  scopes: string[];
  expires_at: string;
  jti: string;
  iat: number;
}

export default function WidgetPage() {
  const { lang } = useApp();
  useMockStore();
  const [searchParams] = useSearchParams();
  
  // State machine
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [message, setMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  
  // Token state
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  
  // Toast
  const [showToast, setShowToast] = useState('');

  const live = isLiveMode();

  // Mock product from query param or default
  const productId = searchParams.get('product') || 'p-001';
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];
  const branding = product.widget_branding!;

  // Mock token (educational demo) — replaced by a real mint in live mode.
  const mockToken: MockToken = {
    tenant_id: 'ten-1',
    product_id: product.id,
    customer_id: 'c-001',
    customer_name: 'سارا احمدی',
    scopes: ['tickets:create', 'tickets:read', 'tickets:reply'],
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    jti: `jti_${Math.random().toString(36).substring(2, 15)}`,
    iat: Math.floor(Date.now() / 1000),
  };

  // ---------------------------------------------------------------------
  // Live mode: mint a real widget token + load directory data from the API.
  // ---------------------------------------------------------------------
  const [liveToken, setLiveToken] = useState<string | null>(null);
  const [liveProducts, setLiveProducts] = useState<typeof mockProducts>([]);
  const [liveCategories, setLiveCategories] = useState<typeof mockCategories>([]);
  const [liveTopics, setLiveTopics] = useState<typeof mockTopics>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;

    (async () => {
      try {
        const api = getDataApi();
        const products = await api.products.list();
        if (cancelled) return;
        setLiveProducts(products as unknown as typeof mockProducts);

        const active = products.find((p) => p.id === productId) ?? products[0];
        if (!active) return;

        // Mint a short-lived signed customer token for the widget.
        const minted = await sessionStore.buildClient().auth.widgetToken(
          searchParams.get('customer') || '',
          ['tickets:create', 'tickets:read', 'tickets:reply'],
        );
        if (cancelled) return;
        setLiveToken(minted.data.access_token ?? minted.data.token ?? null);

        const [depts, cats] = await Promise.all([
          api.departments.list(active.id),
          api.categories.list(),
        ]);
        if (cancelled) return;

        const deptIds = new Set(depts.map((d) => d.id));
        const scoped = (cats as unknown as typeof mockCategories).filter(
          (c) => !c.department_id || deptIds.has(c.department_id),
        );
        setLiveCategories(scoped);
      } catch (err) {
        if (!cancelled) {
          setShowToast(describeError(err as Error) ?? '');
          setTimeout(() => setShowToast(''), 3000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, productId]);

  useEffect(() => {
    if (!live || !categoryId) {
      setLiveTopics([]);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const topics = await getDataApi().topics.list(categoryId);
        if (!cancelled) setLiveTopics(topics as unknown as typeof mockTopics);
      } catch (err) {
        if (!cancelled) {
          setShowToast(describeError(err as Error) ?? '');
          setTimeout(() => setShowToast(''), 3000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, categoryId]);

  // Check token expiration
  useEffect(() => {
    const checkExpiration = () => {
      const expiresAt = new Date(mockToken.expires_at).getTime();
      const now = Date.now();
      setTokenExpired(now >= expiresAt);
    };
    
    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get customer tickets
  const mockCustomerTickets = mockStore.getTickets().filter(t => t.customer_id === mockToken.customer_id);
  const customerTickets = live ? (liveTickets as unknown as typeof mockCustomerTickets) : mockCustomerTickets;
  const selectedTicket = live
    ? liveTickets.find((t) => t.id === selectedTicketId) ?? null
    : selectedTicketId
      ? mockStore.getTicket(selectedTicketId)
      : null;
  const messages = live
    ? liveMessages
    : selectedTicketId
      ? mockStore.getMessages(selectedTicketId)
      : [];

  // Load the widget customer's tickets in live mode.
  useEffect(() => {
    if (!live || !liveToken) return;
    let cancelled = false;

    (async () => {
      try {
        const api = getDataApi();
        const tickets = await api.tickets.list(undefined);
        if (!cancelled) {
          setLiveTickets(
            tickets.filter((tk) => !searchParams.get('customer') || tk.customer_id === searchParams.get('customer')),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setShowToast(describeError(err as Error) ?? '');
          setTimeout(() => setShowToast(''), 3000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, liveToken]);

  // Load the selected ticket's conversation in live mode.
  useEffect(() => {
    if (!live || !selectedTicketId) {
      setLiveMessages([]);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const api = getDataApi();
        const msgs = await api.tickets.messages(selectedTicketId);
        if (!cancelled) setLiveMessages(msgs);
      } catch (err) {
        if (!cancelled) {
          setShowToast(describeError(err as Error) ?? '');
          setTimeout(() => setShowToast(''), 3000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, selectedTicketId]);

  // Get categories and topics
  const categories = live ? liveCategories : mockCategories;
  const topics = live
    ? liveTopics
    : categoryId
      ? mockTopics.filter(t => t.category_id === categoryId)
      : [];

  // File upload validation
  const handleFileUpload = (files: File[]) => {
    const MAX_FILES = 5;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (pendingAttachments.length + files.length > MAX_FILES) {
      setShowToast(lang === 'fa' ? 'حداکثر ۵ فایل مجاز است' : 'Maximum 5 files allowed');
      setTimeout(() => setShowToast(''), 3000);
      return;
    }

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setShowToast(lang === 'fa' ? `فایل "${file.name}" بزرگتر از ۵ مگابایت است` : `File "${file.name}" exceeds 5MB`);
        setTimeout(() => setShowToast(''), 3000);
        return;
      }

      const isValidType = ALLOWED_TYPES.some(type => file.type.startsWith(type));
      if (!isValidType) {
        setShowToast(lang === 'fa' ? `فایل "${file.name}" فرمت معتبری ندارد` : `File "${file.name}" has invalid format`);
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

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      setShowToast(lang === 'fa' ? 'لطفاً موضوع و توضیحات را وارد کنید' : 'Please enter subject and description');
      setTimeout(() => setShowToast(''), 3000);
      return;
    }

    // ---- Live mode: create through the API (spec §24 widget surface). ----
    if (live) {
      try {
        const api = getDataApi();
        const created = await api.tickets.create({
          customer_id: searchParams.get('customer') || '',
          subject,
          body: description,
          priority: 'NORMAL',
          channel: 'WIDGET',
          source: 'WIDGET',
          category_id: categoryId || undefined,
          topic_id: topicId || undefined,
        } as never);

        for (const file of pendingAttachments) {
          try {
            await sessionStore.buildClient().tickets.uploadAttachment(created.id, file);
          } catch {
            // Attachment failures must not abort ticket creation.
          }
        }

        setSubject('');
        setDescription('');
        setCategoryId('');
        setTopicId('');
        setPendingAttachments([]);

        setLiveTickets((prev) => [created as never, ...prev]);
        setSelectedTicketId(created.id);
        setScreen('conversation');

        setShowToast(lang === 'fa' ? 'تیکت با موفقیت ایجاد شد' : 'Ticket created successfully');
        setTimeout(() => setShowToast(''), 3000);
      } catch (err) {
        setShowToast(describeError(err as Error) ?? '');
        setTimeout(() => setShowToast(''), 4000);
      }
      return;
    }

    // ---- Mock mode ----
    const newTicket = mockStore.createTicket({
      tenant_id: mockToken.tenant_id,
      product_id: product.id,
      product_name: product.name,
      customer_id: mockToken.customer_id,
      customer_name: mockToken.customer_name,
      subject,
      description,
      category_id: categoryId || undefined,
      category_name: categoryId ? categories.find(c => c.id === categoryId)?.name : undefined,
      topic_id: topicId || undefined,
      topic_name: topicId ? topics.find(t => t.id === topicId)?.name : undefined,
      channel: 'WIDGET',
      source: 'widget',
      status: 'OPEN',
      priority: 'NORMAL',
    });

    // Add initial message
    mockStore.addMessage({
      ticket_id: newTicket.id,
      sender_type: 'CUSTOMER',
      sender_id: mockToken.customer_id,
      sender_name: mockToken.customer_name,
      body: description,
      is_internal: false,
      channel: 'WIDGET',
      attachments: pendingAttachments.map(file => ({
        id: `att-${Date.now()}-${Math.random()}`,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
    });

    // Reset form
    setSubject('');
    setDescription('');
    setCategoryId('');
    setTopicId('');
    setPendingAttachments([]);

    // Navigate to conversation
    setSelectedTicketId(newTicket.id);
    setScreen('conversation');

    setShowToast(lang === 'fa' ? 'تیکت با موفقیت ایجاد شد' : 'Ticket created successfully');
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTicketId) return;

    if (live) {
      try {
        const api = getDataApi();
        const sent = await api.tickets.addMessage(selectedTicketId, {
          body: message,
          is_internal: false,
        });
        setLiveMessages((prev) => [...prev, sent as never]);
        setMessage('');
        setShowToast(lang === 'fa' ? 'پیام ارسال شد' : 'Message sent');
        setTimeout(() => setShowToast(''), 2000);
      } catch (err) {
        setShowToast(describeError(err as Error) ?? '');
        setTimeout(() => setShowToast(''), 4000);
      }
      return;
    }

    mockStore.addMessage({
      ticket_id: selectedTicketId,
      sender_type: 'CUSTOMER',
      sender_id: mockToken.customer_id,
      sender_name: mockToken.customer_name,
      body: message,
      is_internal: false,
      channel: 'WIDGET',
    });

    setMessage('');
    setShowToast(lang === 'fa' ? 'پیام ارسال شد' : 'Message sent');
    setTimeout(() => setShowToast(''), 2000);
  };

  const handleRefreshToken = async () => {
    // Mint a fresh widget token (live) or just re-arm the demo token (mock).
    if (live) {
      try {
        const minted = await sessionStore.buildClient().auth.widgetToken(
          searchParams.get('customer') || '',
          ['tickets:create', 'tickets:read', 'tickets:reply'],
        );
        setLiveToken(minted.data.access_token ?? minted.data.token ?? null);
        setShowToast(lang === 'fa' ? 'توکن با موفقیت بازیابی شد' : 'Token refreshed successfully');
      } catch (err) {
        setShowToast(describeError(err as Error) ?? '');
      }
    } else {
      setShowToast(lang === 'fa' ? 'توکن با موفقیت بازیابی شد' : 'Token refreshed successfully');
    }

    setTokenExpired(false);
    setTimeout(() => setShowToast(''), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-mesh)' }}>
      <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Header with branding */}
        <div className="p-4 text-white" style={{ backgroundColor: branding.primary_color }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="h-6 w-6" />
              ) : (
                <Ticket className="h-5 w-5" />
              )}
              <h2 className="font-bold text-sm">{branding.title}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowTokenPanel(!showTokenPanel)} 
                className="p-1.5 rounded hover:bg-white/20 transition-colors"
                title={lang === 'fa' ? 'نمایش اطلاعات توکن' : 'Show token info'}
              >
                <Info className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setScreen('home')} 
                className="p-1.5 rounded hover:bg-white/20 transition-colors"
                title={lang === 'fa' ? 'خانه' : 'Home'}
              >
                <Home className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-xs opacity-90">{branding.welcome_text}</p>
        </div>

        {/* Token Panel (Educational) */}
        {showTokenPanel && (
          <div className="bg-surface-alt border-b border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold">
                {lang === 'fa' ? 'اطلاعات توکن (آموزشی)' : 'Token Info (Educational)'}
              </h3>
              <button onClick={() => setShowTokenPanel(false)} className="p-1 rounded hover:bg-surface-hover">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">tenant_id:</span>
                <span className="truncate max-w-[180px]">{mockToken.tenant_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">product_id:</span>
                <span className="truncate max-w-[180px]">{mockToken.product_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">customer_id:</span>
                <span className="truncate max-w-[180px]">{mockToken.customer_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">scopes:</span>
                <span className="truncate max-w-[180px]">{mockToken.scopes.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">expires:</span>
                <span className={tokenExpired ? 'text-danger-500' : ''}>
                  {new Date(mockToken.expires_at).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                </span>
              </div>
              {tokenExpired && (
                <Button size="sm" variant="danger" className="w-full mt-2" onClick={handleRefreshToken}>
                  <RefreshCw className="h-3 w-3" />
                  {lang === 'fa' ? 'بازیابی توکن' : 'Refresh Token'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Token Expired Error */}
        {tokenExpired && !showTokenPanel && (
          <div className="bg-danger-50 border-b border-danger-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-danger-700">
                {lang === 'fa' ? 'توکن منقضی شده است' : 'Token expired'}
              </p>
              <Button size="sm" variant="danger" onClick={handleRefreshToken}>
                <RefreshCw className="h-3 w-3" />
                {lang === 'fa' ? 'بازیابی' : 'Refresh'}
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 min-h-[400px]">
          {/* HOME */}
          {screen === 'home' && !tokenExpired && (
            <div className="space-y-3">
              <button 
                onClick={() => setScreen('new')} 
                className="w-full p-4 rounded-xl border-2 border-dashed hover:bg-brand-50 transition-colors text-center"
                style={{ borderColor: branding.primary_color }}
              >
                <Plus className="h-8 w-8 mx-auto mb-2" style={{ color: branding.primary_color }} />
                <p className="font-medium" style={{ color: branding.primary_color }}>
                  {lang === 'fa' ? 'تیکت جدید' : 'New Ticket'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {lang === 'fa' ? 'درخواست پشتیبانی ثبت کنید' : 'Create a support request'}
                </p>
              </button>
              <button 
                onClick={() => setScreen('list')} 
                className="w-full p-4 rounded-xl border border-border hover:bg-surface-hover transition-colors text-center"
              >
                <History className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="font-medium">
                  {lang === 'fa' ? 'تیکت‌های من' : 'My Tickets'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {lang === 'fa' ? 'مشاهده تیکت‌های قبلی' : 'View previous tickets'}
                </p>
              </button>
            </div>
          )}

          {/* NEW TICKET */}
          {screen === 'new' && !tokenExpired && (
            <div className="space-y-4">
              <Input 
                label={lang === 'fa' ? 'موضوع' : 'Subject'} 
                value={subject} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} 
                placeholder={lang === 'fa' ? 'موضوع درخواست' : 'Ticket subject'} 
              />
              <Textarea 
                label={lang === 'fa' ? 'توضیحات' : 'Description'} 
                value={description} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
                placeholder={lang === 'fa' ? 'مشکل خود را شرح دهید...' : 'Describe your issue...'} 
                rows={4} 
              />
              
              <Select
                label={lang === 'fa' ? 'دسته‌بندی (اختیاری)' : 'Category (Optional)'}
                value={categoryId}
                onChange={setCategoryId}
                options={[
                  { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
              />

              {categoryId && topics.length > 0 && (
                <Select
                  label={lang === 'fa' ? 'موضوع (اختیاری)' : 'Topic (Optional)'}
                  value={topicId}
                  onChange={setTopicId}
                  options={[
                    { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                    ...topics.map(t => ({ value: t.id, label: t.name }))
                  ]}
                />
              )}
              
              {/* Pending attachments */}
              {pendingAttachments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    {lang === 'fa' ? 'پیوست‌ها' : 'Attachments'}
                  </label>
                  {pendingAttachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-surface-alt rounded-lg text-xs">
                      <Paperclip className="h-3 w-3 text-text-muted" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-text-muted">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => removePendingAttachment(index)}
                        className="p-1 hover:bg-surface-hover rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <FileUpload onFiles={handleFileUpload} accept="image/*,.pdf,.doc,.docx" multiple />
              
              <Button className="w-full" onClick={handleCreateTicket} style={{ backgroundColor: branding.primary_color }}>
                <Send className="h-4 w-4" /> 
                {lang === 'fa' ? 'ثبت تیکت' : 'Submit Ticket'}
              </Button>
              <button 
                onClick={() => setScreen('home')} 
                className="w-full text-center text-sm text-text-muted hover:text-text"
              >
                {lang === 'fa' ? 'بازگشت' : 'Back'}
              </button>
            </div>
          )}

          {/* MY TICKETS */}
          {screen === 'list' && !tokenExpired && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                {lang === 'fa' ? 'تیکت‌های شما' : 'Your Tickets'} ({customerTickets.length})
              </h3>
              {customerTickets.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    {lang === 'fa' ? 'هنوز تیکتی ثبت نکرده‌اید' : 'No tickets yet'}
                  </p>
                </div>
              ) : (
                customerTickets.map(tk => (
                  <div 
                    key={tk.id} 
                    onClick={() => {
                      setSelectedTicketId(tk.id);
                      setScreen('conversation');
                    }}
                    className="p-3 rounded-lg border border-border hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-text-muted">{tk.ticket_number}</span>
                      <Badge variant={tk.status === 'OPEN' ? 'brand' : tk.status === 'RESOLVED' ? 'success' : 'default'}>
                        {tk.status === 'OPEN' ? (lang === 'fa' ? 'باز' : 'Open') : 
                         tk.status === 'IN_PROGRESS' ? (lang === 'fa' ? 'در حال بررسی' : 'In Progress') :
                         tk.status === 'RESOLVED' ? (lang === 'fa' ? 'حل شده' : 'Resolved') : tk.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{tk.subject}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(tk.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                    </p>
                  </div>
                ))
              )}
              <button 
                onClick={() => setScreen('home')} 
                className="w-full text-center text-sm text-text-muted hover:text-text mt-4"
              >
                {lang === 'fa' ? 'بازگشت' : 'Back'}
              </button>
            </div>
          )}

          {/* CONVERSATION */}
          {screen === 'conversation' && selectedTicket && !tokenExpired && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setScreen('list')} 
                  className="p-1 rounded hover:bg-surface-hover"
                >
                  <ChevronLeft className="h-4 w-4 flip-rtl" />
                </button>
                <span className="font-mono text-sm text-text-muted">{selectedTicket.ticket_number}</span>
                <Badge variant={selectedTicket.status === 'OPEN' ? 'brand' : selectedTicket.status === 'RESOLVED' ? 'success' : 'default'}>
                  {selectedTicket.status === 'OPEN' ? (lang === 'fa' ? 'باز' : 'Open') : 
                   selectedTicket.status === 'IN_PROGRESS' ? (lang === 'fa' ? 'در حال بررسی' : 'In Progress') :
                   selectedTicket.status === 'RESOLVED' ? (lang === 'fa' ? 'حل شده' : 'Resolved') : selectedTicket.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm">{selectedTicket.subject}</h3>
              
              {/* Messages */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-lg ${
                      msg.sender_type === 'CUSTOMER' 
                        ? 'mr-4' 
                        : 'ml-4'
                    }`}
                    style={{ 
                      backgroundColor: msg.sender_type === 'CUSTOMER' 
                        ? `${branding.primary_color}15` 
                        : 'var(--color-surface-alt)' 
                    }}
                  >
                    <p className="text-xs text-text-muted mb-1">
                      {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm">{msg.body}</p>
                    {msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att: any) => (
                          <div key={att.id} className="flex items-center gap-2 text-xs">
                            <Paperclip className="h-3 w-3" />
                            <a href={att.url} download={att.filename} className="text-brand-600 hover:underline">
                              {att.filename}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply */}
              <div className="border-t border-border pt-3">
                <div className="flex gap-2">
                  <input 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder={lang === 'fa' ? 'پیام خود را بنویسید...' : 'Type your message...'}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="sm" onClick={handleSendMessage} style={{ backgroundColor: branding.primary_color }}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border text-center bg-surface-alt">
          <p className="text-xs text-text-muted">
            {lang === 'fa' ? 'پشتیبانی توسط FinoTicket' : 'Powered by FinoTicket'}
          </p>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in z-50">
          {showToast}
        </div>
      )}
    </div>
  );
}
