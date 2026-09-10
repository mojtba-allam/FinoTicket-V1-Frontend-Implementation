import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Paperclip, Brain, Lightbulb, CheckCircle2, XCircle, History, X, RefreshCw } from 'lucide-react';
import { Button, Input, Textarea, Select, Badge, StatusBadge, Avatar, Modal, Drawer, Card, FileUpload, SegmentedControl, EmptyState, ErrorState } from '../../components/ui';
import { SLACountdown } from '../../components/SLACountdown';
import { TagInput } from '../../components/TagInput';
import { Timeline, type TimelineEvent } from '../../components/Timeline';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';
import { useCanMutate } from '../../components/ProtectedRoute';
import { mockAIAnalyses, mockAISuggestions } from '../../data/mock';

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
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status || 'OPEN');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(ticket?.priority || 'NORMAL');
  const [showHistory, setShowHistory] = useState(false);
  const [tags, setTags] = useState<string[]>(ticket?.tags || []);
  const [watchers, setWatchers] = useState<string[]>(ticket?.watchers || []);
  const [suggestions, setSuggestions] = useState(mockAISuggestions.filter(s => s.ticket_id === id));
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; filename: string; type: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Cascading assign state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(ticket?.department_id || '');
  const [selectedTeamId, setSelectedTeamId] = useState(ticket?.team_id || '');
  const [selectedAgentId, setSelectedAgentId] = useState(ticket?.assignee_id || '');

  // Reclassify state
  const [selectedCategoryId, setSelectedCategoryId] = useState(ticket?.category_id || '');
  const [selectedTopicId, setSelectedTopicId] = useState(ticket?.topic_id || '');

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

  // Get available departments for this product
  const availableDepartments = useMemo(() => {
    return mockStore.getDepartmentsByProduct(ticket.product_id);
  }, [ticket.product_id]);

  // Get available teams based on selected department
  const availableTeams = useMemo(() => {
    if (!selectedDepartmentId) return [];
    
    // Get all teams for this department (both DEPARTMENT and CATEGORY scoped)
    const deptTeams = mockStore.getTeamsByDepartment(selectedDepartmentId);
    
    // If ticket has a category, also include category-scoped teams for that category
    if (ticket.category_id) {
      const categoryTeams = mockStore.getTeamsByCategory(ticket.category_id);
      // Combine and deduplicate
      const allTeams = [...deptTeams, ...categoryTeams];
      const uniqueTeams = allTeams.filter((team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
      );
      return uniqueTeams;
    }
    
    return deptTeams;
  }, [selectedDepartmentId, ticket.category_id]);

  // Get available agents based on selected team
  const availableAgents = useMemo(() => {
    if (!selectedTeamId) return [];
    
    const team = mockStore.getTeam(selectedTeamId);
    if (!team) return [];
    
    // Get agents who are members of this team
    return mockStore.getAgents().filter(agent => 
      team.members.some(member => member.user_id === agent.user_id)
    );
  }, [selectedTeamId]);

  // Handle department change - clear team and agent
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setSelectedTeamId('');
    setSelectedAgentId('');
  };

  // File upload validation and handling
  const handleFileUpload = (files: File[]) => {
    const MAX_FILES = 5;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    // Check total file count
    if (pendingAttachments.length + files.length > MAX_FILES) {
      showToast(
        lang === 'fa' 
          ? `حداکثر ${MAX_FILES} فایل می‌توانید ضمیمه کنید` 
          : `Maximum ${MAX_FILES} files allowed`,
        'error'
      );
      return;
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > MAX_SIZE) {
        showToast(
          lang === 'fa'
            ? `فایل "${file.name}" بزرگتر از ۵ مگابایت است`
            : `File "${file.name}" exceeds 5MB limit`,
          'error'
        );
        return;
      }

      // Check file type
      const isValidType = ALLOWED_TYPES.some(type => file.type.startsWith(type));
      if (!isValidType) {
        showToast(
          lang === 'fa'
            ? `فایل "${file.name}" فرمت معتبری ندارد. فقط تصاویر، PDF و Word مجاز هستند`
            : `File "${file.name}" has invalid format. Only images, PDF and Word are allowed`,
          'error'
        );
        return;
      }
    }

    // All validations passed, add files
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

  // Handle team change - clear agent
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedAgentId('');
  };

  const handleAssign = () => {
    const department = selectedDepartmentId 
      ? mockStore.getDepartment(selectedDepartmentId) 
      : null;
    const team = selectedTeamId 
      ? mockStore.getTeam(selectedTeamId) 
      : null;
    const agent = selectedAgentId 
      ? mockStore.getAgents().find(a => a.user_id === selectedAgentId)
      : null;

    mockStore.assignCascade(ticket.id, {
      department_id: department?.id,
      department_name: department?.name,
      team_id: team?.id,
      team_name: team?.name,
      assignee_id: agent?.user_id,
      assignee_name: agent?.display_name,
    });
    
    showToast(lang === 'fa' ? 'تیکت ارجاع شد' : 'Ticket assigned', 'success');
    setShowAssignModal(false);
    
    // Reset cascade state
    setSelectedDepartmentId('');
    setSelectedTeamId('');
    setSelectedAgentId('');
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
    if (!reply.trim() && pendingAttachments.length === 0) return;
    
    // Convert pending files to attachments
    const attachments = pendingAttachments.map(file => ({
      id: `att-${Date.now()}-${Math.random()}`,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploader_id: 'u-001',
      uploader_name: 'علی محمدی',
      created_at: new Date().toISOString(),
    }));
    
    mockStore.addMessage({
      ticket_id: ticket.id,
      sender_type: 'AGENT',
      sender_id: 'u-001',
      sender_name: 'علی محمدی',
      body: reply,
      is_internal: isInternal,
      channel: 'WEB',
      attachments,
    });
    
    setReply('');
    setPendingAttachments([]);
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.attachments.map(att => {
                      const isImage = att.mime_type.startsWith('image/');
                      return (
                        <div 
                          key={att.id} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt rounded-lg border border-border text-xs cursor-pointer hover:bg-surface-hover transition-colors"
                          onClick={() => {
                            if (isImage) {
                              setPreviewAttachment({ url: att.url, filename: att.filename, type: att.mime_type });
                            } else {
                              // For non-image files, trigger download
                              const link = document.createElement('a');
                              link.href = att.url;
                              link.download = att.filename;
                              link.click();
                            }
                          }}
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span>{att.filename}</span>
                          {isImage && <span className="text-brand-500">👁</span>}
                        </div>
                      );
                    })}
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
              
              {/* Pending attachments */}
              {pendingAttachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {pendingAttachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-surface-alt rounded-lg text-sm">
                      <Paperclip className="h-4 w-4 text-text-muted" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-text-muted">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => removePendingAttachment(index)}
                        className="p-1 hover:bg-surface-hover rounded transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-text-muted hover:text-danger-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <FileUpload onFiles={handleFileUpload} accept="image/*,.pdf,.doc,.docx" multiple />
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
            <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'دپارتمان' : 'Department'}</span><span>{ticket.department_name || '—'}</span></div>
            
            {/* Category Select */}
            {canMutate && ticket.department_id ? (
              <div className="mt-2">
                <label className="block text-xs text-text-muted mb-1">{lang === 'fa' ? 'دسته‌بندی' : 'Category'}</label>
                <Select
                  value={selectedCategoryId}
                  onChange={(v) => {
                    setSelectedCategoryId(v);
                    setSelectedTopicId(''); // Clear topic when category changes
                    if (v) {
                      const category = mockStore.getCategory(v);
                      mockStore.updateTicket(ticket.id, { 
                        category_id: v, 
                        category_name: category?.name,
                        topic_id: undefined,
                        topic_name: undefined
                      });
                    } else {
                      mockStore.updateTicket(ticket.id, { 
                        category_id: undefined, 
                        category_name: undefined,
                        topic_id: undefined,
                        topic_name: undefined
                      });
                    }
                  }}
                  options={[
                    { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                    ...mockStore.getCategoriesByDepartment(ticket.department_id).map(c => ({ value: c.id, label: c.name }))
                  ]}
                />
              </div>
            ) : (
              <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'دسته‌بندی' : 'Category'}</span><span>{ticket.category_name || '—'}</span></div>
            )}

            {/* Topic Select */}
            {canMutate && selectedCategoryId ? (
              <div className="mt-2">
                <label className="block text-xs text-text-muted mb-1">{lang === 'fa' ? 'موضوع' : 'Topic'}</label>
                <Select
                  value={selectedTopicId}
                  onChange={(v) => {
                    setSelectedTopicId(v);
                    if (v) {
                      const topic = mockStore.getTopics().find(t => t.id === v);
                      mockStore.updateTicket(ticket.id, { topic_id: v, topic_name: topic?.name });
                    } else {
                      mockStore.updateTicket(ticket.id, { topic_id: undefined, topic_name: undefined });
                    }
                  }}
                  options={[
                    { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                    ...mockStore.getTopicsByCategory(selectedCategoryId).map(t => ({ value: t.id, label: t.name }))
                  ]}
                />
              </div>
            ) : (
              <div className="flex justify-between"><span className="text-text-muted">{lang === 'fa' ? 'موضوع' : 'Topic'}</span><span>{ticket.topic_name || '—'}</span></div>
            )}

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
                  <span className="text-sm">{mockStore.getAgents().find(a => a.user_id === w)?.display_name || w}</span>
                  {canMutate && (
                    <button onClick={() => handleRemoveWatcher(w)} className="text-text-muted hover:text-danger-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )) : <p className="text-xs text-text-muted">{lang === 'fa' ? 'ناظری اضافه نشده' : 'No watchers added'}</p>}
              {canMutate && (
                <Select 
                  options={mockStore.getAgents().map(a => ({ value: a.user_id, label: a.display_name }))} 
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
          <div 
            className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-surface-hover rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate(`/desk/customers/${ticket.customer_id}`)}
          >
            <Avatar name={ticket.customer_name || ''} />
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-600 hover:underline">{ticket.customer_name}</p>
              <p className="text-xs text-text-muted">{lang === 'fa' ? 'مشتری' : 'Customer'}</p>
            </div>
          </div>
          {/* Identity badges */}
          {(() => {
            const customer = mockStore.getCustomer(ticket.customer_id);
            if (!customer || customer.identities.length === 0) return null;
            
            return (
              <div className="mb-3">
                <p className="text-xs text-text-muted mb-2">{lang === 'fa' ? 'هویت‌ها' : 'Identities'}</p>
                <div className="flex flex-wrap gap-1">
                  {customer.identities.slice(0, 2).map(identity => (
                    <Badge key={identity.id} variant={identity.verification_status === 'VERIFIED' ? 'success' : 'warning'}>
                      {identity.provider}
                      {identity.verification_status === 'VERIFIED' ? ' ✓' : ' ?'}
                    </Badge>
                  ))}
                  {customer.identities.length > 2 && (
                    <Badge variant="default">+{customer.identities.length - 2}</Badge>
                  )}
                </div>
              </div>
            );
          })()}
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

          {/* AI Suggestion Banner */}
          {suggestions.some(s => s.status === 'PENDING') && (
            <div className="mb-3 p-2 bg-accent-400/10 border border-accent-400/30 rounded-lg">
              <p className="text-xs text-accent-600 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {lang === 'fa' ? 'پیشنهاد هوش مصنوعی — قبل از ارسال بررسی کنید' : 'AI suggestion — review before send'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {suggestions.map(s => (
              <div key={s.id} className={`border rounded-lg p-3 ${
                s.status === 'ACCEPTED' ? 'border-success-200 bg-success-50' :
                s.status === 'REJECTED' ? 'border-danger-200 bg-danger-50 opacity-50' :
                'border-border'
              }`}>
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
                
                {/* Source Citations */}
                {s.sources && s.sources.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-text-muted mb-1">
                      {lang === 'fa' ? 'منابع:' : 'Sources:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {s.sources.map((source, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigate(`/desk/knowledge/articles/${source.article_id}`)}
                          className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded hover:bg-brand-100 transition-colors"
                        >
                          {source.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {s.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="success" className="flex-1 text-xs" onClick={() => {
                      // Insert suggestion into composer
                      setReply(s.content);
                      // Update suggestion status
                      setSuggestions(prev => prev.map(sug => 
                        sug.id === s.id ? { ...sug, status: 'ACCEPTED' as const } : sug
                      ));
                      showToast(lang === 'fa' ? 'پیشنهاد در پاسخ‌دهنده قرار گرفت' : 'Suggestion inserted into composer', 'success');
                    }}>
                      <CheckCircle2 className="h-3 w-3" /> {lang === 'fa' ? 'قبول' : 'Accept'}
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => {
                      // Edit mode - insert into composer for editing
                      setReply(s.content);
                      showToast(lang === 'fa' ? 'برای ویرایش در پاسخ‌دهنده قرار گرفت' : 'Inserted for editing', 'info');
                    }}>
                      {lang === 'fa' ? 'ویرایش' : 'Edit'}
                    </Button>
                    <Button size="sm" variant="danger" className="flex-1 text-xs" onClick={() => {
                      // Update suggestion status
                      setSuggestions(prev => prev.map(sug => 
                        sug.id === s.id ? { ...sug, status: 'REJECTED' as const } : sug
                      ));
                      showToast(lang === 'fa' ? 'پیشنهاد رد شد' : 'Suggestion rejected', 'info');
                    }}>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{lang === 'fa' ? 'تیکت‌های مشابه' : 'Similar Tickets'}</h3>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                // Trigger re-render by updating state
                setRefreshKey(prev => prev + 1);
              }}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {(() => {
              // Get similar tickets (same customer or same category)
              const similarTickets = mockStore.getTickets()
                .filter(tk => 
                  tk.id !== ticket.id && 
                  (tk.customer_id === ticket.customer_id || tk.category_id === ticket.category_id)
                )
                .map(tk => {
                  // Calculate similarity score (mock)
                  let score = 0;
                  if (tk.customer_id === ticket.customer_id) score += 0.5;
                  if (tk.category_id === ticket.category_id) score += 0.3;
                  if (tk.department_id === ticket.department_id) score += 0.2;
                  
                  return { ...tk, similarity_score: Math.min(score, 0.95) };
                })
                .sort((a, b) => b.similarity_score - a.similarity_score)
                .slice(0, 5);

              if (similarTickets.length === 0) {
                return (
                  <p className="text-xs text-text-muted text-center py-4">
                    {lang === 'fa' ? 'تیکت مشابهی یافت نشد' : 'No similar tickets found'}
                  </p>
                );
              }

              return similarTickets.map(tk => (
                <div 
                  key={tk.id} 
                  onClick={() => navigate(`/desk/tickets/${tk.id}`)}
                  className="p-2.5 rounded-lg border border-border hover:bg-surface-hover cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-text-muted">{tk.ticket_number}</span>
                      <StatusBadge status={tk.status} />
                    </div>
                    <span className="text-xs text-brand-600 font-medium">
                      {Math.round(tk.similarity_score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs truncate">{tk.subject}</p>
                  <div className="mt-1 h-1 bg-surface-alt rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${tk.similarity_score * 100}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Assign Modal - Cascading */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title={lang === 'fa' ? 'ارجاع تیکت' : 'Assign Ticket'}>
        <div className="space-y-4">
          {/* Department Select */}
          <Select 
            label={lang === 'fa' ? 'دپارتمان' : 'Department'}
            options={[
              { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
              ...availableDepartments.map(d => ({ value: d.id, label: d.name }))
            ]} 
            value={selectedDepartmentId}
            onChange={handleDepartmentChange}
          />

          {/* Team Select - filtered by department */}
          <Select 
            label={lang === 'fa' ? 'تیم' : 'Team'}
            options={[
              { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
              ...availableTeams.map(t => ({ 
                value: t.id, 
                label: `${t.name} (${t.scope === 'DEPARTMENT' ? (lang === 'fa' ? 'دپارتمان' : 'Dept') : (lang === 'fa' ? 'دسته' : 'Cat')})` 
              }))
            ]} 
            value={selectedTeamId}
            onChange={handleTeamChange}
            disabled={!selectedDepartmentId}
          />

          {/* Agent Select - filtered by team */}
          <Select 
            label={lang === 'fa' ? 'کارشناس' : 'Agent'}
            options={[
              { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
              ...availableAgents.map(a => ({ value: a.user_id, label: a.display_name }))
            ]} 
            value={selectedAgentId}
            onChange={setSelectedAgentId}
            disabled={!selectedTeamId}
          />

          {!selectedDepartmentId && (
            <p className="text-xs text-text-muted">
              {lang === 'fa' ? 'ابتدا دپارتمان را انتخاب کنید' : 'Select a department first'}
            </p>
          )}
          {selectedDepartmentId && !selectedTeamId && (
            <p className="text-xs text-text-muted">
              {lang === 'fa' ? 'تیمی را انتخاب کنید' : 'Select a team'}
            </p>
          )}
          {selectedTeamId && availableAgents.length === 0 && (
            <p className="text-xs text-warning-600">
              {lang === 'fa' ? 'این تیم هیچ عضوی ندارد' : 'This team has no members'}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleAssign} disabled={!selectedDepartmentId}>
              {lang === 'fa' ? 'ارجاع' : 'Assign'}
            </Button>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal open={showStatusModal} onClose={() => { setShowStatusModal(false); setSelectedStatus(ticket?.status || 'OPEN'); }} title={lang === 'fa' ? 'تغییر وضعیت' : 'Change Status'}>
        <div className="space-y-4">
          <Select 
            label={lang === 'fa' ? 'وضعیت جدید' : 'New Status'}
            options={Object.entries(t.ticket.statuses).map(([k, v]) => ({ value: k, label: v }))} 
            value={selectedStatus}
            onChange={(v) => setSelectedStatus(v as any)}
          />
          <Textarea label={lang === 'fa' ? 'یادداشت (اختیاری)' : 'Note (optional)'} placeholder={lang === 'fa' ? 'دلیل تغییر وضعیت...' : 'Reason for status change...'} rows={3} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleStatusChange(selectedStatus)}>
              {lang === 'fa' ? 'تغییر وضعیت' : 'Change Status'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowStatusModal(false); setSelectedStatus(ticket?.status || 'OPEN'); }}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Priority Modal */}
      <Modal open={showPriorityModal} onClose={() => { setShowPriorityModal(false); setSelectedPriority(ticket?.priority || 'NORMAL'); }} title={lang === 'fa' ? 'تغییر اولویت' : 'Change Priority'}>
        <div className="space-y-4">
          <Select 
            label={lang === 'fa' ? 'اولویت جدید' : 'New Priority'}
            options={Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))} 
            value={selectedPriority}
            onChange={(v) => setSelectedPriority(v as any)}
          />
          <Textarea label={lang === 'fa' ? 'دلیل (اختیاری)' : 'Reason (optional)'} placeholder={lang === 'fa' ? 'چرا اولویت تغییر می‌کند؟' : 'Why is priority changing?'} rows={3} />
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handlePriorityChange(selectedPriority)}>
              {lang === 'fa' ? 'تغییر اولویت' : 'Change Priority'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowPriorityModal(false); setSelectedPriority(ticket?.priority || 'NORMAL'); }}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Drawer */}
      <Drawer open={showHistory} onClose={() => setShowHistory(false)} title={lang === 'fa' ? 'تاریخچه' : 'History'} side="left">
        <Timeline events={sortedHistoryEvents} />
      </Drawer>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewAttachment(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setPreviewAttachment(null)}
              className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img 
              src={previewAttachment.url} 
              alt={previewAttachment.filename}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-2 text-center text-white text-sm">
              {previewAttachment.filename}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
