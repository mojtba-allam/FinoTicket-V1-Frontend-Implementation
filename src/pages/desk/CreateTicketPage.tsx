import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Select, Card, FileUpload } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useCollection, describeError } from '../../lib/api/hooks';
import { getDataApi } from '../../lib/api/dataApi';
import { isLiveMode } from '../../lib/api/config';
import { useApp } from '../../app/providers';
import { useCanMutate } from '../../components/ProtectedRoute';

export default function CreateTicketPage() {
  const { t, lang, showToast, product } = useApp();
  const navigate = useNavigate();
  const canMutate = useCanMutate();
  const live = isLiveMode();
  useMockStore();

  // VIEWER gate - redirect to forbidden
  if (!canMutate) {
    navigate('/forbidden');
    return null;
  }

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customer, setCustomer] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [errors, setErrors] = useState<{ subject?: string; customer?: string }>({});
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  
  // Cascading classification state
  const [departmentId, setDepartmentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Customers come from the API in live mode, the store in mock mode.
  const { data: customers } = useCollection(
    () => mockStore.getCustomers(),
    (api) => api.customers.list(),
  );

  // Taxonomy cascades. Each level is fetched scoped to its parent so live mode
  // never mixes mock UUIDs into a real ticket (the API accepts ?parent_id).
  const { data: departments } = useCollection(
    () => mockStore.getDepartmentsByProduct(product.id),
    (api) => api.departments.list(product.id),
  );

  const { data: categories } = useCollection(
    () => (departmentId ? mockStore.getCategoriesByDepartment(departmentId) : []),
    (api) => (departmentId ? api.categories.list(departmentId) : Promise.resolve([])),
    [departmentId],
  );

  const { data: topics } = useCollection(
    () => (categoryId ? mockStore.getTopicsByCategory(categoryId) : []),
    (api) => (categoryId ? api.topics.list(categoryId) : Promise.resolve([])),
    [categoryId],
  );

  // Teams: department-scoped plus, when a category is chosen, category-scoped
  // teams for that category — deduplicated.
  const { data: teams } = useCollection(
    () => {
      if (!departmentId) return [];
      const deptTeams = mockStore.getTeamsByDepartment(departmentId);
      const catTeams = categoryId ? mockStore.getTeamsByCategory(categoryId) : [];
      return [...deptTeams, ...catTeams].filter(
        (team, index, self) => index === self.findIndex(t => t.id === team.id),
      );
    },
    async (api) => {
      if (!departmentId) return [];
      const deptTeams = await api.teams.list(departmentId);
      if (!categoryId) return deptTeams;
      const all = await api.teams.list();
      const catTeams = all.filter(t => t.scope === 'CATEGORY' && t.category_id === categoryId);
      return [...deptTeams, ...catTeams].filter(
        (team, index, self) => index === self.findIndex(t => t.id === team.id),
      );
    },
    [departmentId, categoryId],
  );

  // Agents: members of the selected team.
  const { data: agents } = useCollection(
    () => {
      if (!teamId) return [];
      const team = mockStore.getTeam(teamId);
      if (!team) return [];
      return mockStore.getAgents().filter(agent =>
        team.members.some(member => member.user_id === agent.user_id),
      );
    },
    async (api) => {
      if (!teamId) return [];
      const all = await api.teams.list();
      const team = all.find(t => t.id === teamId);
      if (!team?.members?.length) return [];
      const memberIds = new Set(team.members.map(m => m.user_id));
      const allAgents = await api.agents.list();
      return allAgents.filter(agent => memberIds.has(agent.user_id));
    },
    [teamId],
  );

  // Cascade handlers - clear children when parent changes
  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId);
    setCategoryId('');
    setTopicId('');
    setTeamId('');
    setAssigneeId('');
  };

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    setTopicId('');
    setTeamId('');
    setAssigneeId('');
  };

  const handleTopicChange = (topId: string) => {
    setTopicId(topId);
  };

  const handleTeamChange = (tmId: string) => {
    setTeamId(tmId);
    setAssigneeId('');
  };

  // File upload validation
  const handleFileUpload = (files: File[]) => {
    const MAX_FILES = 5;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (pendingAttachments.length + files.length > MAX_FILES) {
      showToast(lang === 'fa' ? 'حداکثر ۵ فایل مجاز است' : 'Maximum 5 files allowed', 'error');
      return;
    }

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        showToast(lang === 'fa' ? `فایل "${file.name}" بزرگتر از ۵ مگابایت است` : `File "${file.name}" exceeds 5MB`, 'error');
        return;
      }

      const isValidType = ALLOWED_TYPES.some(type => file.type.startsWith(type));
      if (!isValidType) {
        showToast(lang === 'fa' ? `فایل "${file.name}" فرمت معتبری ندارد` : `File "${file.name}" has invalid format`, 'error');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: { subject?: string; customer?: string } = {};
    if (!subject.trim()) {
      newErrors.subject = lang === 'fa' ? 'موضوع الزامی است' : 'Subject is required';
    }
    if (!customer) {
      newErrors.customer = lang === 'fa' ? 'مشتری الزامی است' : 'Customer is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // ---- Live mode: create through the API -------------------------------
    if (live) {
      try {
        const created = await getDataApi().tickets.create({
          customer_id: customer,
          subject,
          body: description,
          priority,
          channel: 'WEB',
          source: 'WEB',
          department_id: departmentId || undefined,
          category_id: categoryId || undefined,
          topic_id: topicId || undefined,
        });

        // Attachments upload separately against the created ticket.
        for (const file of pendingAttachments) {
          await getDataApi().tickets.uploadAttachment(created.id, file);
        }

        showToast(lang === 'fa' ? 'تیکت با موفقیت ایجاد شد' : 'Ticket created successfully', 'success');
        navigate(`/desk/tickets/${created.id}`);
      } catch (error) {
        showToast(describeError(error as Error) ?? 'Create failed', 'error');
      }

      return;
    }

    // ---- Mock mode -------------------------------------------------------
    const selectedCustomer = customers.find(c => c.id === customer);
    const selectedDepartment = departmentId ? mockStore.getDepartment(departmentId) : null;
    const selectedCategory = categoryId ? mockStore.getCategory(categoryId) : null;
    const selectedTopic = topicId ? mockStore.getTopics().find(t => t.id === topicId) : null;
    const selectedTeam = teamId ? mockStore.getTeam(teamId) : null;
    const selectedAgent = assigneeId ? mockStore.getAgents().find(a => a.user_id === assigneeId) : null;

    const newTicket = mockStore.createTicket({
      subject,
      description,
      product_id: product.id,
      product_name: product.name,
      customer_id: customer,
      customer_name: selectedCustomer?.display_name,
      department_id: departmentId || undefined,
      department_name: selectedDepartment?.name,
      category_id: categoryId || undefined,
      category_name: selectedCategory?.name,
      topic_id: topicId || undefined,
      topic_name: selectedTopic?.name,
      team_id: teamId || undefined,
      team_name: selectedTeam?.name,
      assignee_id: assigneeId || undefined,
      assignee_name: selectedAgent?.display_name,
      priority: priority as any,
      attachments: pendingAttachments.map(file => ({
        id: `att-${Date.now()}-${Math.random()}`,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
    });

    showToast(lang === 'fa' ? 'تیکت با موفقیت ایجاد شد' : 'Ticket created successfully', 'success');
    navigate(`/desk/tickets/${newTicket.id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover">
          <svg className="h-5 w-5 flip-rtl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{t.ticket.create}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label={t.ticket.subject} 
            value={subject} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors({ ...errors, subject: undefined });
            }}
            error={errors.subject}
            required 
            placeholder={lang === 'fa' ? 'موضوع تیکت را وارد کنید' : 'Enter ticket subject'} 
          />
          
          <Textarea 
            label={t.ticket.description} 
            value={description} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
            placeholder={lang === 'fa' ? 'توضیحات مشکل یا درخواست...' : 'Describe the issue or request...'} 
          />

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {lang === 'fa' ? 'پیوست‌ها' : 'Attachments'}
            </label>
            
            {/* Pending attachments list */}
            {pendingAttachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {pendingAttachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-surface-alt rounded-lg text-sm">
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-text-muted text-xs">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={lang === 'fa' ? 'مشتری' : 'Customer'} 
              options={customers.map(c => ({ value: c.id, label: c.display_name }))} 
              value={customer} 
              onChange={(v) => {
                setCustomer(v);
                if (errors.customer) setErrors({ ...errors, customer: undefined });
              }}
              error={errors.customer}
              placeholder={lang === 'fa' ? 'انتخاب مشتری' : 'Select customer'} 
            />
            
            <Select 
              label={lang === 'fa' ? 'اولویت' : 'Priority'} 
              options={Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))} 
              value={priority} 
              onChange={setPriority} 
            />
          </div>

          {/* Cascading Classification */}
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3">
              {lang === 'fa' ? 'طبقه‌بندی و ارجاع' : 'Classification & Assignment'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label={lang === 'fa' ? 'دپارتمان' : 'Department'} 
                options={[
                  { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                  ...departments.map(d => ({ value: d.id, label: d.name }))
                ]} 
                value={departmentId} 
                onChange={handleDepartmentChange}
              />
              
              <Select 
                label={lang === 'fa' ? 'دسته‌بندی' : 'Category'} 
                options={[
                  { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]} 
                value={categoryId} 
                onChange={handleCategoryChange}
                disabled={!departmentId}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Select 
                label={lang === 'fa' ? 'موضوع' : 'Topic'} 
                options={[
                  { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                  ...topics.map(t => ({ value: t.id, label: t.name }))
                ]} 
                value={topicId} 
                onChange={handleTopicChange}
                disabled={!categoryId}
              />
              
              <Select 
                label={lang === 'fa' ? 'تیم (اختیاری)' : 'Team (Optional)'} 
                options={[
                  { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                  ...teams.map(t => ({ 
                    value: t.id, 
                    label: `${t.name} (${t.scope === 'DEPARTMENT' ? (lang === 'fa' ? 'دپارتمان' : 'Dept') : (lang === 'fa' ? 'دسته' : 'Cat')})` 
                  }))
                ]} 
                value={teamId} 
                onChange={handleTeamChange}
                disabled={!departmentId}
              />
            </div>

            <div className="mt-4">
              <Select 
                label={lang === 'fa' ? 'کارشناس (اختیاری)' : 'Agent (Optional)'} 
                options={[
                  { value: '', label: lang === 'fa' ? 'انتخاب کنید' : 'Select' },
                  ...agents.map(a => ({ value: a.user_id, label: a.display_name }))
                ]} 
                value={assigneeId} 
                onChange={setAssigneeId}
                disabled={!teamId}
              />
              {teamId && agents.length === 0 && (
                <p className="text-xs text-warning-600 mt-1">
                  {lang === 'fa' ? 'این تیم هیچ عضوی ندارد' : 'This team has no members'}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit">{t.common.create}</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>{t.common.cancel}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
