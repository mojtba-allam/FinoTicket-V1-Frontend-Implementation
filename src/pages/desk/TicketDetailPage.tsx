import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Paperclip, Brain, Lightbulb, CheckCircle2, XCircle, History, X } from 'lucide-react';
import { Button, Input, Textarea, Select, Badge, StatusBadge, Avatar, Modal, Drawer, Card, FileUpload, SegmentedControl, EmptyState, ErrorState } from '../../components/ui';
import { SLACountdown } from '../../components/SLACountdown';
import { TagInput } from '../../components/TagInput';
import { Timeline, type TimelineEvent } from '../../components/Timeline';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';
import { useCanMutate } from '../../components/ProtectedRoute';
import { mockAgents, mockTeams, mockDepartments, mockAIAnalyses, mockAISuggestions, mockTickets } from '../../data/mock';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { t, lang, showToast } = useApp();
  const navigate = useNavigate();
  
  // Check if user can mutate (not VIEWER)
  const canMutate = useCanMutate();
  
  // Subscribe to store changes for reactivity
  useMockStore();
  
  // Get ticket from mockStore (live data)
  const ticket = mockStore.getTicket(id || '');
  const messages = mockStore.getMessages(id || '');
  const historyEvents = mockStore.getTicketHistory(id || '');
  
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [tags, setTags] = useState<string[]>(ticket?.tags || []);
  const [watchers, setWatchers] = useState<string[]>(ticket?.watchers || []);

  // Sort history events by timestamp (newest first)
  const sortedHistoryEvents = useMemo(() => {
    return [...historyEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [historyEvents]);

  if (!ticket) {
    return (
      <div className="p-6">
        <ErrorState title={lang === 'fa' ? 'تیکت یافت نشد' : 'Ticket not found'} />
      </div>
    );
  }

  const analyses = mockAIAnalyses.filter(a => a.ticket_id === id);
  const suggestions = mockAISuggestions.filter(s => s.ticket_id === id);

  const handleAssign = (assignee_id: string, assignee_name: string) => {
    mockStore.assignTicket(ticket.id, assignee_id, assignee_name);
    showToast(lang === 'fa' ? 'تیکت ارجاع شد' : 'Ticket assigned');
    setShowAssignModal(false);
  };

  const handleStatusChange = (status: any) => {
    mockStore.changeTicketStatus(ticket.id, status);
    showToast(lang === 'fa' ? 'وضعیت تغییر کرد' : 'Status changed');
    setShowStatusModal(false);
  };

  const handlePriorityChange = (priority: any) => {
    mockStore.changeTicketPriority(ticket.id, priority);
    showToast(lang === 'fa' ? 'اولویت تغییر کرد' : 'Priority changed');
    setShowPriorityModal(false);
  };

  const handleSendMessage = () => {
    if (!reply.trim()) return;
    mockStore.addMessage({
      ticket_id: ticket.id,
      sender_type: 'AGENT',
      sender_id: 'u-001',
      sender_name: 'علی محمدی',
      body: reply,
      is_internal: isInternal,
      channel: 'WEB',
    });
    setReply('');
    showToast(lang === 'fa' ? 'پیام ارسال شد' : 'Message sent');
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    mockStore.updateTicketTags(ticket.id, newTags);
  };

  const handleAddWatcher = (watcher_id: string) => {
    if (watcher_id && !watchers.includes(watcher_id)) {
      const newWatchers = [...watchers, watcher_id];
      setWatchers(newWatchers);
      mockStore.addWatcher(ticket.id, watcher_id);
    }
  };

  const handleRemoveWatcher = (watcher_id: string) => {
    const newWatchers = watchers.filter(w => w !== watcher_id);
    setWatchers(newWatchers);
    mockStore.removeWatcher(ticket.id, watcher_id);
  };

  return (
    <div className="flex h-full">
      {/* Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/desk')} className="p-1 rounded hover:bg-surface-hover">
              <ChevronLeft className="h-5 w-5 flip-rtl" />
            </button>
            <span className="font-mono text-sm text-text-muted">{ticket.ticket_number}</span>
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
                    {msg.sender_type === 'CUSTOMER' 
                      ? (lang === 'fa' ? 'مشتری' : 'Customer')
                      : msg.is_internal 
                        ? (lang === 'fa' ? 'یادداشت داخلی' : 'Internal Note')
                        : (lang === 'fa' ? 'کارشناس' : 'Agent')}
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
        {canMutate ? (
          <div className="bg-white border-t border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <SegmentedControl
                options={[
                  { value: 'public', label: lang === 'fa' ? 'پاسخ' : 'Reply' },
                  { value: 'internal', label: lang === 'fa' ? 'یادداشت داخلی' : 'Internal Note' }
                ]}
                value={isInternal ? 'internal' : 'public'}
                onChange={v => setIsInternal(v === 'internal')}
              />
            </div>
            <div className={`rounded-lg border ${isInternal ? 'border-amber-300 bg-amber-50' : 'border-border'} p-3`}>
              <textarea 
                value={reply} 
                onChange={e => setReply(e.target.value)}
                placeholder={isInternal 
                  ? (lang === 'fa' ? 'یادداشت داخلی...' : 'Internal note...')
                  : (lang === 'fa' ? 'پاسخ خود را بنویسید...' : 'Type your reply...')}
                className="w-full bg-transparent text-sm resize-none outline-none min-h-[80px]" 
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <FileUpload onFiles={() => {}} accept="image/*,.pdf,.doc,.docx" multiple />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" /> {lang === 'fa' ? 'ارسال' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-alt border-t border-border p-4 text-center text-sm text-text-muted">
            {lang === 'fa' ? 'شما مجاز به ارسال پاسخ نیستید' : 'You do not have permission to reply'}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-r border-border bg-white overflow-y-auto shrink-0">
        {/* Properties */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">{lang === 'fa' ? 'ویژگی‌ها' : 'Properties'}</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'محصول' : 'Product'}</span><span>{ticket.product_name}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'دسته‌بندی' : 'Category'}</span><span>{ticket.category_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'دپارتمان' : 'Department'}</span><span>{ticket.department_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'تیم' : 'Team'}</span><span>{ticket.team_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'ارجاع به' : 'Assignee'}</span><span>{ticket.assignee_name || '—'}</span></div>
          </div>
          {canMutate && (
            <>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowAssignModal(true)}>
                  {lang === 'fa' ? 'ارجاع' : 'Assign'}
                </Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowStatusModal(true)}>
                  {lang === 'fa' ? 'وضعیت' : 'Status'}
                </Button>
              </div>
              <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => setShowPriorityModal(true)}>
                {lang === 'fa' ? 'تغییر اولویت' : 'Change Priority'}
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="w-full mt-2" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" /> {lang === 'fa' ? 'تاریخچه' : 'History'}
          </Button>

          {/* Tags */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-muted mb-2">
              {lang === 'fa' ? 'برچسب‌ها' : 'Tags'}
            </label>
            {canMutate ? (
              <TagInput value={tags} onChange={handleTagsChange} placeholder={lang === 'fa' ? 'برچسب جدید...' : 'New tag...'} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs">{tag}</span>
                )) : <p className="text-xs text-text-muted">{lang === 'fa' ? 'بدون برچسب' : 'No tags'}</p>}
              </div>
            )}
          </div>

          {/* Watchers */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-muted mb-2">
              {lang === 'fa' ? 'ناظران' : 'Watchers'}
            </label>
            <div className="space-y-2">
              {watchers.length > 0 ? watchers.map(w => (
                <div key={w} className="flex items-center justify-between p-2 bg-surface-alt rounded">
                  <span className="text-sm">{mockAgents.find(a => a.user_id === w)?.display_name || w}</span>
                  {canMutate && (
                    <button onClick={() => handleRemoveWatcher(w)} className="text-text-muted hover:text-danger-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )) : <p className="text-xs text-text-muted">{lang === 'fa' ? 'ناظری اضافه نشده' : 'No watchers added'}</p>}
              {canMutate && (
                <Select 
                  options={mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))} 
                  placeholder={lang === 'fa' ? 'افزودن ناظر' : 'Add watcher'} 
                  onChange={handleAddWatcher}
                />
              )}
            </div>
          </div>
        </div>

        {/* Customer 360 */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">{lang === 'fa' ? 'اطلاعات مشتری' : 'Customer Info'}</h3>
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={ticket.customer_name || ''} />
            <div>
              <p className="text-sm font-medium">{ticket.customer_name}</p>
              <p className="text-xs text-text-muted">{lang === 'fa' ? 'مشتری' : 'Customer'}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="w-full" onClick={() => navigate(`/desk/customers/${ticket.customer_id}`)}>
            {lang === 'fa' ? 'مشاهده پروفایل کامل' : 'View full profile'}
          </Button>
        </div>

        {/* AI Copilot */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-brand-500" /> {lang === 'fa' ? 'دستیار هوشمند' : 'AI Copilot'}
            </h3>
            <Badge variant="brand">Beta</Badge>
          </div>
          
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

          <div className="space-y-2">
            {suggestions.map(s => (
              <div key={s.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={s.status === 'ACCEPTED' ? 'success' : s.status === 'REJECTED' ? 'danger' : 'warning'}>
                    {s.status === 'PENDING' 
                      ? (lang === 'fa' ? 'در انتظار' : 'Pending')
                      : s.status === 'ACCEPTED' 
                        ? (lang === 'fa' ? 'قبول شده' : 'Accepted')
                        : (lang === 'fa' ? 'رد شده' : 'Rejected')}
                  </Badge>
                  <span className="text-xs text-text-muted">{Math.round(s.confidence * 100)}% {lang === 'fa' ? 'اطمینان' : 'confidence'}</span>
                </div>
                <p className="text-xs mb-2 leading-relaxed">{s.content}</p>
                {s.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="success" className="flex-1 text-xs" onClick={() => showToast(lang === 'fa' ? 'پیشنهاد قبول شد' : 'Suggestion accepted')}>
                      <CheckCircle2 className="h-3 w-3" /> {lang === 'fa' ? 'قبول' : 'Accept'}
                    </Button>
                    <Button size="sm" variant="danger" className="flex-1 text-xs" onClick={() => showToast(lang === 'fa' ? 'پیشنهاد رد شد' : 'Suggestion rejected')}>
                      <XCircle className="h-3 w-3" /> {lang === 'fa' ? 'رد' : 'Reject'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Similar Tickets */}
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">{lang === 'fa' ? 'تیکت‌های مشابه' : 'Similar Tickets'}</h3>
          <div className="space-y-2">
            {mockTickets.filter(tk => tk.id !== ticket.id).slice(0, 3).map(tk => (
              <div key={tk.id} onClick={() => navigate(`/desk/tickets/${tk.id}`)}
                className="p-2.5 rounded-lg border border-border hover:bg-surface-hover cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-text-muted">{tk.ticket_number}</span>
                  <StatusBadge status={tk.status} />
                </div>
                <p className="text-xs truncate">{tk.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title={lang === 'fa' ? 'ارجاع تیکت' : 'Assign Ticket'}>
        <div className="space-y-4">
          <Select 
            label={lang === 'fa' ? 'کارشناس' : 'Agent'}
            options={mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))} 
            placeholder={lang === 'fa' ? 'انتخاب کارشناس' : 'Select agent'}
          />
          <Select 
            label={lang === 'fa' ? 'تیم' : 'Team'}
            options={mockTeams.map(t => ({ value: t.id, label: t.name }))} 
            placeholder={lang === 'fa' ? 'انتخاب تیم' : 'Select team'}
          />
          <Select 
            label={lang === 'fa' ? 'دپارتمان' : 'Department'}
            options={mockDepartments.map(d => ({ value: d.id, label: d.name }))} 
            placeholder={lang === 'fa' ? 'انتخاب دپارتمان' : 'Select department'}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleAssign('u-001', 'علی محمدی')}>
              {lang === 'fa' ? 'ارجاع' : 'Assign'}
            </Button>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title={lang === 'fa' ? 'تغییر وضعیت' : 'Change Status'}>
        <div className="space-y-4">
          <Select 
            label={lang === 'fa' ? 'وضعیت جدید' : 'New Status'}
            options={Object.entries(t.ticket.statuses).map(([k, v]) => ({ value: k, label: v }))} 
          />
          <Textarea label={lang === 'fa' ? 'یادداشت (اختیاری)' : 'Note (optional)'} placeholder={lang === 'fa' ? 'دلیل تغییر وضعیت...' : 'Reason for status change...'} rows={3} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleStatusChange('IN_PROGRESS')}>
              {lang === 'fa' ? 'تغییر وضعیت' : 'Change Status'}
            </Button>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Priority Modal */}
      <Modal open={showPriorityModal} onClose={() => setShowPriorityModal(false)} title={lang === 'fa' ? 'تغییر اولویت' : 'Change Priority'}>
        <div className="space-y-4">
          <Select 
            label={lang === 'fa' ? 'اولویت جدید' : 'New Priority'}
            options={Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))} 
          />
          <Textarea label={lang === 'fa' ? 'دلیل (اختیاری)' : 'Reason (optional)'} placeholder={lang === 'fa' ? 'چرا اولویت تغییر می‌کند؟' : 'Why is priority changing?'} rows={3} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handlePriorityChange('HIGH')}>
              {lang === 'fa' ? 'تغییر اولویت' : 'Change Priority'}
            </Button>
            <Button variant="secondary" onClick={() => setShowPriorityModal(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Drawer */}
      <Drawer open={showHistory} onClose={() => setShowHistory(false)} title={lang === 'fa' ? 'تاریخچه' : 'History'} side="left">
        <Timeline events={sortedHistoryEvents} />
      </Drawer>
    </div>
  );
}
