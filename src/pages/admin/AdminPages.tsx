import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCheck, Users, Shield, Clock, Workflow, Zap, BookOpen, Globe, Webhook, FileSearch, Plus } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Select, EmptyState } from '../../components/ui';
import { mockKnowledgeBases, mockAPIClients, mockWebhooks, mockAuditLogs } from '../../data/mock';
import { useApp } from '../../app/providers';
import { mockStore, useMockStore } from '../../lib/api/mockStore';

export function AdminDepartmentsPage() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  useMockStore();
  const departments = mockStore.getDepartments();
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.departments}</h1>
      </div>
      
      {departments.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'دپارتمانی وجود ندارد' : 'No departments'}
          description={lang === 'fa' ? 'برای شروع، اولین دپارتمان را ایجاد کنید' : 'Create your first department to get started'}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {departments.map(d => {
            const product = mockStore.getProduct(d.product_id);
            return (
              <div key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/departments/${d.id}`)}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-brand-500" />
                      <div>
                        <h3 className="font-medium">{d.name}</h3>
                        <p className="text-xs text-text-muted font-mono">{d.slug}</p>
                        {product && (
                          <p className="text-xs text-text-muted mt-1">
                            {lang === 'fa' ? 'محصول' : 'Product'}: {product.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={d.status === 'ACTIVE' ? 'success' : 'default'}>
                      {d.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                    </Badge>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminAgentsPage() {
  const { t, lang, showToast } = useApp();
  const navigate = useNavigate();
  useMockStore();
  
  const [search, setSearch] = useState('');
  const [presenceFilter, setPresenceFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  
  const agents = mockStore.getAgents();
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !search || 
      agent.display_name.toLowerCase().includes(search.toLowerCase()) ||
      agent.user_id.toLowerCase().includes(search.toLowerCase());
    const matchesPresence = !presenceFilter || agent.presence === presenceFilter;
    return matchesSearch && matchesPresence;
  });

  const handleCreate = () => {
    setEditingAgent(null);
    setShowCreate(true);
  };

  const handleEdit = (agent: any) => {
    setEditingAgent(agent);
    setShowCreate(true);
  };

  const handleSave = (agentData: any) => {
    if (editingAgent) {
      mockStore.updateAgent(editingAgent.id, agentData);
      showToast(lang === 'fa' ? 'کارشناس بروزرسانی شد' : 'Agent updated', 'success');
    } else {
      mockStore.createAgent(agentData);
      showToast(lang === 'fa' ? 'کارشناس ایجاد شد' : 'Agent created', 'success');
    }
    setShowCreate(false);
    setEditingAgent(null);
  };

  const handleDeactivate = (agentId: string) => {
    mockStore.updateAgent(agentId, { status: 'INACTIVE' });
    showToast(lang === 'fa' ? 'کارشناس غیرفعال شد' : 'Agent deactivated', 'success');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.agents}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'کارشناس جدید' : 'New Agent'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={lang === 'fa' ? 'جستجو...' : 'Search...'}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={presenceFilter}
            onChange={setPresenceFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه وضعیت‌ها' : 'All Status' },
              { value: 'ONLINE', label: lang === 'fa' ? 'آنلاین' : 'Online' },
              { value: 'AWAY', label: lang === 'fa' ? 'دور' : 'Away' },
              { value: 'BUSY', label: lang === 'fa' ? 'مشغول' : 'Busy' },
              { value: 'OFFLINE', label: lang === 'fa' ? 'آفلاین' : 'Offline' },
            ]}
          />
        </div>
      </Card>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'کارشناسی یافت نشد' : 'No agents found'}
          description={lang === 'fa' ? 'کارشناس جدید ایجاد کنید' : 'Create a new agent'}
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد کارشناس' : 'Create Agent'}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(agent)}>
              <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-brand-500 flex items-center justify-center text-white text-lg font-bold">
                  {agent.display_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{agent.display_name}</h3>
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${agent.presence === 'ONLINE' ? 'bg-success-500' : agent.presence === 'AWAY' ? 'bg-warning-500' : agent.presence === 'BUSY' ? 'bg-danger-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-text-muted">{agent.presence}</span>
                  </div>
                </div>
                <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'default'}>
                  {agent.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm text-text-muted">
                <p>{lang === 'fa' ? 'زمان‌بندی' : 'Timezone'}: {agent.timezone}</p>
                <p>{lang === 'fa' ? 'حداکثر تیکت فعال' : 'Max active'}: {agent.max_active_tickets}</p>
                <p>{lang === 'fa' ? 'زبان' : 'Language'}: {agent.language === 'fa' ? 'فارسی' : 'English'}</p>
              </div>
              {agent.status === 'ACTIVE' && (
                <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full text-danger-500 hover:text-danger-600"
                    onClick={() => handleDeactivate(agent.id)}
                  >
                    {lang === 'fa' ? 'غیرفعال کردن' : 'Deactivate'}
                  </Button>
                </div>
              )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <AgentFormModal
          agent={editingAgent}
          onSave={handleSave}
          onClose={() => {
            setShowCreate(false);
            setEditingAgent(null);
          }}
        />
      )}
    </div>
  );
}

function AgentFormModal({ agent, onSave, onClose }: { agent: any; onSave: (data: any) => void; onClose: () => void }) {
  const { lang } = useApp();
  const [formData, setFormData] = useState({
    display_name: agent?.display_name || '',
    timezone: agent?.timezone || 'Asia/Tehran',
    language: agent?.language || 'fa',
    max_active_tickets: agent?.max_active_tickets || 20,
    presence: agent?.presence || 'OFFLINE',
    status: agent?.status || 'ACTIVE',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name.trim()) {
      alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={true} onClose={onClose} title={agent ? (lang === 'fa' ? 'ویرایش کارشناس' : 'Edit Agent') : (lang === 'fa' ? 'کارشناس جدید' : 'New Agent')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={lang === 'fa' ? 'نام نمایشی' : 'Display Name'}
          value={formData.display_name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, display_name: e.target.value })}
          required
        />
        <Select
          label={lang === 'fa' ? 'منطقه زمانی' : 'Timezone'}
          value={formData.timezone}
          onChange={(v) => setFormData({ ...formData, timezone: v })}
          options={[
            { value: 'Asia/Tehran', label: 'Tehran (UTC+3:30)' },
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'New York (UTC-5)' },
            { value: 'Europe/London', label: 'London (UTC+0)' },
          ]}
        />
        <Select
          label={lang === 'fa' ? 'زبان' : 'Language'}
          value={formData.language}
          onChange={(v) => setFormData({ ...formData, language: v as 'fa' | 'en' })}
          options={[
            { value: 'fa', label: 'فارسی' },
            { value: 'en', label: 'English' },
          ]}
        />
        <Input
          label={lang === 'fa' ? 'حداکثر تیکت فعال' : 'Max Active Tickets'}
          type="number"
          value={formData.max_active_tickets}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, max_active_tickets: parseInt(e.target.value) })}
          min="1"
          max="100"
        />
        <Select
          label={lang === 'fa' ? 'وضعیت حضور' : 'Presence'}
          value={formData.presence}
          onChange={(v) => setFormData({ ...formData, presence: v as any })}
          options={[
            { value: 'ONLINE', label: lang === 'fa' ? 'آنلاین' : 'Online' },
            { value: 'AWAY', label: lang === 'fa' ? 'دور' : 'Away' },
            { value: 'BUSY', label: lang === 'fa' ? 'مشغول' : 'Busy' },
            { value: 'OFFLINE', label: lang === 'fa' ? 'آفلاین' : 'Offline' },
          ]}
        />
        <div className="flex gap-3 pt-4">
          <Button type="submit">
            {agent ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'ایجاد' : 'Create')}
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            {lang === 'fa' ? 'انصراف' : 'Cancel'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminUsersPage() {
  const { t, lang, showToast } = useApp();
  useMockStore();
  
  const [showInvite, setShowInvite] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER'>('VIEWER');
  const [status, setStatus] = useState<'ACTIVE' | 'INVITED' | 'SUSPENDED'>('INVITED');

  const users = mockStore.getUsers().filter(u => u.console === 'tenant');

  const handleInvite = () => {
    if (!email.trim() || !displayName.trim()) {
      showToast(lang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill all fields', 'error');
      return;
    }

    if (editingUser) {
      mockStore.updateUser(editingUser.id, { role, status });
      showToast(lang === 'fa' ? 'کاربر بروزرسانی شد' : 'User updated', 'success');
    } else {
      mockStore.inviteUser({
        email,
        display_name: displayName,
        role,
        status,
      });
      showToast(lang === 'fa' ? 'دعوت‌نامه ارسال شد' : 'Invitation sent', 'success');
    }

    resetForm();
  };

  const resetForm = () => {
    setShowInvite(false);
    setEditingUser(null);
    setEmail('');
    setDisplayName('');
    setRole('VIEWER');
    setStatus('INVITED');
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEmail(user.email);
    setDisplayName(user.display_name);
    setRole(user.role as any);
    setStatus(user.status as any);
    setShowInvite(true);
  };

  const handleDeactivate = (userId: string) => {
    mockStore.updateUser(userId, { status: 'SUSPENDED' });
    showToast(lang === 'fa' ? 'کاربر غیرفعال شد' : 'User deactivated', 'success');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.users}</h1>
        <Button onClick={() => setShowInvite(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'دعوت کاربر' : 'Invite User'}
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'کاربری وجود ندارد' : 'No users'}
          description={lang === 'fa' ? 'اولین کاربر را دعوت کنید' : 'Invite your first user'}
          action={
            <Button onClick={() => setShowInvite(true)}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'دعوت کاربر' : 'Invite User'}
            </Button>
          }
        />
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'کاربر' : 'User'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'ایمیل' : 'Email'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'نقش' : 'Role'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                        {u.display_name.charAt(0)}
                      </div>
                      <span className="font-medium">{u.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant="brand">{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'INVITED' ? 'warning' : 'default'}>
                      {u.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : 
                       u.status === 'INVITED' ? (lang === 'fa' ? 'دعوت شده' : 'Invited') : 
                       (lang === 'fa' ? 'معلق' : 'Suspended')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(u)}>
                        {lang === 'fa' ? 'ویرایش' : 'Edit'}
                      </Button>
                      {u.status === 'ACTIVE' && (
                        <Button size="sm" variant="ghost" onClick={() => handleDeactivate(u.id)}>
                          {lang === 'fa' ? 'غیرفعال' : 'Deactivate'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Invite/Edit Modal */}
      {showInvite && (
        <Modal open={true} onClose={resetForm} title={editingUser ? (lang === 'fa' ? 'ویرایش کاربر' : 'Edit User') : (lang === 'fa' ? 'دعوت کاربر' : 'Invite User')}>
          <div className="space-y-4">
            <Input
              label={lang === 'fa' ? 'ایمیل' : 'Email'}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={!!editingUser}
            />
            <Input
              label={lang === 'fa' ? 'نام نمایشی' : 'Display Name'}
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              placeholder={lang === 'fa' ? 'نام کاربر' : 'User name'}
              disabled={!!editingUser}
            />
            <Select
              label={lang === 'fa' ? 'نقش' : 'Role'}
              value={role}
              onChange={(v) => setRole(v as any)}
              options={[
                { value: 'OWNER', label: lang === 'fa' ? 'مالک' : 'Owner' },
                { value: 'ADMIN', label: lang === 'fa' ? 'مدیر' : 'Admin' },
                { value: 'MANAGER', label: lang === 'fa' ? 'مدیر ارشد' : 'Manager' },
                { value: 'AGENT', label: lang === 'fa' ? 'کارشناس' : 'Agent' },
                { value: 'VIEWER', label: lang === 'fa' ? 'مشاهده‌کننده' : 'Viewer' },
              ]}
            />
            {!editingUser && (
              <Select
                label={lang === 'fa' ? 'وضعیت' : 'Status'}
                value={status}
                onChange={(v) => setStatus(v as any)}
                options={[
                  { value: 'INVITED', label: lang === 'fa' ? 'دعوت شده' : 'Invited' },
                  { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' },
                ]}
              />
            )}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleInvite}>
                {editingUser ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'دعوت' : 'Invite')}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                {lang === 'fa' ? 'انصراف' : 'Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AdminSLAPage() {
  const { t, lang, showToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editingSLA, setEditingSLA] = useState<any>(null);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [firstResponseMinutes, setFirstResponseMinutes] = useState(60);
  const [resolutionHours, setResolutionHours] = useState(24);
  const [status, setStatus] = useState('ACTIVE');

  useMockStore();
  const slaPolicies = mockStore.getSLAPolicies();

  const handleCreate = () => {
    if (!name.trim()) {
      showToast(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name', 'error');
      return;
    }

    if (editingSLA) {
      mockStore.updateSLAPolicy(editingSLA.id, {
        name,
        priority: priority as any,
        first_response_seconds: firstResponseMinutes * 60,
        resolution_seconds: resolutionHours * 3600,
        status: status as any,
      });
      showToast(lang === 'fa' ? 'SLA بروزرسانی شد' : 'SLA updated', 'success');
    } else {
      mockStore.createSLAPolicy({
        name,
        priority: priority as any,
        first_response_seconds: firstResponseMinutes * 60,
        resolution_seconds: resolutionHours * 3600,
        status: status as any,
      });
      showToast(lang === 'fa' ? 'SLA ایجاد شد' : 'SLA created', 'success');
    }

    resetForm();
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingSLA(null);
    setName('');
    setPriority('NORMAL');
    setFirstResponseMinutes(60);
    setResolutionHours(24);
    setStatus('ACTIVE');
  };

  const handleEdit = (sla: any) => {
    setEditingSLA(sla);
    setName(sla.name);
    setPriority(sla.priority);
    setFirstResponseMinutes(Math.floor(sla.first_response_seconds / 60));
    setResolutionHours(Math.floor(sla.resolution_seconds / 3600));
    setStatus(sla.status);
    setShowCreate(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.sla}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'SLA جدید' : 'New SLA'}
        </Button>
      </div>
      <div className="space-y-4">
        {slaPolicies.map(sla => (
          <div key={sla.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(sla)}>
            <Card>
              <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{sla.name}</h3>
                <Badge variant={sla.priority === 'LOW' ? 'success' : sla.priority === 'NORMAL' ? 'info' : sla.priority === 'HIGH' ? 'warning' : 'danger'}>
                  {sla.priority}
                </Badge>
              </div>
              <Badge variant={sla.status === 'ACTIVE' ? 'success' : 'default'}>
                {sla.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-text-muted text-xs">{lang === 'fa' ? 'اولین پاسخ' : 'First response'}</p>
                <p className="font-medium">{Math.floor(sla.first_response_seconds / 60)} {lang === 'fa' ? 'دقیقه' : 'min'}</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-text-muted text-xs">{lang === 'fa' ? 'حل نهایی' : 'Resolution'}</p>
                <p className="font-medium">{Math.floor(sla.resolution_seconds / 3600)} {lang === 'fa' ? 'ساعت' : 'hours'}</p>
              </div>
            </div>
            </Card>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={resetForm} title={editingSLA ? (lang === 'fa' ? 'ویرایش SLA' : 'Edit SLA') : (lang === 'fa' ? 'SLA جدید' : 'New SLA')}>
        <div className="space-y-4">
          <Input 
            label={lang === 'fa' ? 'نام' : 'Name'} 
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام SLA' : 'SLA name'} 
          />
          <Select 
            label={lang === 'fa' ? 'اولویت' : 'Priority'} 
            options={[
              { value: 'LOW', label: lang === 'fa' ? 'کم' : 'Low' },
              { value: 'NORMAL', label: lang === 'fa' ? 'معمولی' : 'Normal' },
              { value: 'HIGH', label: lang === 'fa' ? 'بالا' : 'High' },
              { value: 'URGENT', label: lang === 'fa' ? 'فوری' : 'Urgent' },
              { value: 'CRITICAL', label: lang === 'fa' ? 'بحرانی' : 'Critical' },
            ]}
            value={priority}
            onChange={setPriority}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {lang === 'fa' ? 'اولین پاسخ (دقیقه)' : 'First response (minutes)'}
              </label>
              <input
                type="number"
                value={firstResponseMinutes}
                onChange={(e) => setFirstResponseMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {lang === 'fa' ? 'حل نهایی (ساعت)' : 'Resolution (hours)'}
              </label>
              <input
                type="number"
                value={resolutionHours}
                onChange={(e) => setResolutionHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                min="1"
              />
            </div>
          </div>
          <Select 
            label={lang === 'fa' ? 'وضعیت' : 'Status'} 
            options={[
              { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' },
              { value: 'INACTIVE', label: lang === 'fa' ? 'غیرفعال' : 'Inactive' },
            ]}
            value={status}
            onChange={setStatus}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate}>
              {editingSLA ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'ایجاد' : 'Create')}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdminWorkflowsPage() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  useMockStore();
  const workflows = mockStore.getWorkflows();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.workflows}</h1>
      <div className="space-y-4">
        {workflows.map(wf => (
          <div key={wf.id} onClick={() => navigate(`/admin/workflows/${wf.id}`)} className="cursor-pointer">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{wf.name}</h3>
                  <p className="text-xs text-text-muted">{lang === 'fa' ? 'رویداد' : 'Event'}: {wf.event} • {lang === 'fa' ? 'نسخه' : 'Version'}: {wf.version}</p>
                </div>
                <Badge variant={wf.status === 'ACTIVE' ? 'success' : wf.status === 'DRAFT' ? 'warning' : 'default'}>
                  {wf.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : wf.status === 'DRAFT' ? (lang === 'fa' ? 'پیش‌نویس' : 'Draft') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                </Badge>
              </div>
              <p className="text-sm text-text-muted">{wf.steps.length} {lang === 'fa' ? 'مرحله' : 'steps'}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAutomationsPage() {
  const { t, lang, showToast } = useApp();
  useMockStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  
  const automations = mockStore.getAutomations();

  const handleCreate = () => {
    setEditingAutomation(null);
    setShowCreate(true);
  };

  const handleEdit = (automation: any) => {
    setEditingAutomation(automation);
    setShowCreate(true);
  };

  const handleSave = (automationData: any) => {
    if (editingAutomation) {
      mockStore.updateAutomation(editingAutomation.id, automationData);
      showToast(lang === 'fa' ? 'اتوماسیون بروزرسانی شد' : 'Automation updated', 'success');
    } else {
      mockStore.createAutomation(automationData);
      showToast(lang === 'fa' ? 'اتوماسیون ایجاد شد' : 'Automation created', 'success');
    }
    setShowCreate(false);
    setEditingAutomation(null);
  };

  const handleToggle = (automationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    mockStore.updateAutomation(automationId, { status: newStatus });
    showToast(
      newStatus === 'ACTIVE' 
        ? (lang === 'fa' ? 'اتوماسیون فعال شد' : 'Automation enabled')
        : (lang === 'fa' ? 'اتوماسیون غیرفعال شد' : 'Automation disabled'),
      'success'
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.automations}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'اتوماسیون جدید' : 'New Automation'}
        </Button>
      </div>

      {automations.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'اتوماسیونی وجود ندارد' : 'No automations'}
          description={lang === 'fa' ? 'اتوماسیون جدید ایجاد کنید' : 'Create a new automation'}
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد اتوماسیون' : 'Create Automation'}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {automations.map(au => (
            <div key={au.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(au)}>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{au.name}</h3>
                    <p className="text-xs text-text-muted mt-1">
                      {lang === 'fa' ? 'راه‌انداز' : 'Trigger'}: {au.trigger_event}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={au.status === 'ACTIVE' ? 'success' : 'default'}>
                      {au.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(au.id, au.status);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        au.status === 'ACTIVE' ? 'bg-success-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          au.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Conditions */}
                {au.conditions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-text-muted mb-2">
                      {lang === 'fa' ? 'شرایط' : 'Conditions'}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {au.conditions.map((cond: any, i: number) => (
                        <Badge key={i} variant="info">
                          {cond.field} {cond.operator} {cond.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {au.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-text-muted mb-2">
                      {lang === 'fa' ? 'عملیات' : 'Actions'}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {au.actions.map((action: any, i: number) => (
                        <Badge key={i} variant="brand">
                          {action.type}: {action.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <AutomationFormModal
          automation={editingAutomation}
          onSave={handleSave}
          onClose={() => {
            setShowCreate(false);
            setEditingAutomation(null);
          }}
        />
      )}
    </div>
  );
}

function AutomationFormModal({ automation, onSave, onClose }: { automation: any; onSave: (data: any) => void; onClose: () => void }) {
  const { lang } = useApp();
  const [formData, setFormData] = useState({
    name: automation?.name || '',
    trigger_event: automation?.trigger_event || 'ticket.created',
    conditions: automation?.conditions || [],
    actions: automation?.actions || [],
    status: automation?.status || 'ACTIVE',
  });

  const [newCondition, setNewCondition] = useState({ field: '', operator: 'equals', value: '' });
  const [newAction, setNewAction] = useState({ type: 'set_priority', value: '' });

  const handleAddCondition = () => {
    if (newCondition.field && newCondition.value) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, { ...newCondition }],
      });
      setNewCondition({ field: '', operator: 'equals', value: '' });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_: any, i: number) => i !== index),
    });
  };

  const handleAddAction = () => {
    if (newAction.type && newAction.value) {
      setFormData({
        ...formData,
        actions: [...formData.actions, { ...newAction }],
      });
      setNewAction({ type: 'set_priority', value: '' });
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_: any, i: number) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={true} onClose={onClose} title={automation ? (lang === 'fa' ? 'ویرایش اتوماسیون' : 'Edit Automation') : (lang === 'fa' ? 'اتوماسیون جدید' : 'New Automation')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={lang === 'fa' ? 'نام' : 'Name'}
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          label={lang === 'fa' ? 'رویداد راه‌انداز' : 'Trigger Event'}
          value={formData.trigger_event}
          onChange={(v) => setFormData({ ...formData, trigger_event: v })}
          options={[
            { value: 'ticket.created', label: lang === 'fa' ? 'ایجاد تیکت' : 'Ticket Created' },
            { value: 'ticket.status_changed', label: lang === 'fa' ? 'تغییر وضعیت تیکت' : 'Ticket Status Changed' },
            { value: 'ticket.assigned', label: lang === 'fa' ? 'ارجاع تیکت' : 'Ticket Assigned' },
            { value: 'message.added', label: lang === 'fa' ? 'افزودن پیام' : 'Message Added' },
          ]}
        />

        {/* Conditions */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {lang === 'fa' ? 'شرایط' : 'Conditions'}
          </label>
          <div className="space-y-2 mb-3">
            {formData.conditions.map((cond: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-surface-alt rounded">
                <Badge variant="info">{cond.field} {cond.operator} {cond.value}</Badge>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveCondition(i)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Select
              value={newCondition.field}
              onChange={(v) => setNewCondition({ ...newCondition, field: v })}
              options={[
                { value: '', label: lang === 'fa' ? 'فیلد' : 'Field' },
                { value: 'priority', label: lang === 'fa' ? 'اولویت' : 'Priority' },
                { value: 'status', label: lang === 'fa' ? 'وضعیت' : 'Status' },
                { value: 'subject', label: lang === 'fa' ? 'موضوع' : 'Subject' },
                { value: 'sender_type', label: lang === 'fa' ? 'نوع فرستنده' : 'Sender Type' },
              ]}
            />
            <Select
              value={newCondition.operator}
              onChange={(v) => setNewCondition({ ...newCondition, operator: v })}
              options={[
                { value: 'equals', label: '=' },
                { value: 'contains', label: lang === 'fa' ? 'شامل' : 'Contains' },
                { value: 'not_equals', label: '!=' },
              ]}
            />
            <Input
              value={newCondition.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCondition({ ...newCondition, value: e.target.value })}
              placeholder={lang === 'fa' ? 'مقدار' : 'Value'}
            />
            <Button type="button" variant="secondary" onClick={handleAddCondition}>
              +
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {lang === 'fa' ? 'عملیات' : 'Actions'}
          </label>
          <div className="space-y-2 mb-3">
            {formData.actions.map((action: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-surface-alt rounded">
                <Badge variant="brand">{action.type}: {action.value}</Badge>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveAction(i)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Select
              value={newAction.type}
              onChange={(v) => setNewAction({ ...newAction, type: v })}
              options={[
                { value: 'set_priority', label: lang === 'fa' ? 'تنظیم اولویت' : 'Set Priority' },
                { value: 'set_status', label: lang === 'fa' ? 'تنظیم وضعیت' : 'Set Status' },
                { value: 'assign_team', label: lang === 'fa' ? 'ارجاع به تیم' : 'Assign Team' },
                { value: 'add_tag', label: lang === 'fa' ? 'افزودن برچسب' : 'Add Tag' },
              ]}
            />
            <Input
              value={newAction.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAction({ ...newAction, value: e.target.value })}
              placeholder={lang === 'fa' ? 'مقدار' : 'Value'}
            />
            <Button type="button" variant="secondary" onClick={handleAddAction}>
              +
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">
            {automation ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'ایجاد' : 'Create')}
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            {lang === 'fa' ? 'انصراف' : 'Cancel'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminKnowledgeBasesPage() {
  const { t, lang, showToast } = useApp();
  const navigate = useNavigate();
  useMockStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const knowledgeBases = mockStore.getKnowledgeBases();

  const handleCreate = (kbData: any) => {
    mockStore.createKnowledgeBase(kbData);
    showToast(lang === 'fa' ? 'پایگاه دانش ایجاد شد' : 'Knowledge base created', 'success');
    setShowCreate(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.knowledge_bases}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'پایگاه دانش جدید' : 'New Knowledge Base'}
        </Button>
      </div>

      {knowledgeBases.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'پایگاه دانش وجود ندارد' : 'No knowledge bases'}
          description={lang === 'fa' ? 'پایگاه دانش جدید ایجاد کنید' : 'Create a new knowledge base'}
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد پایگاه دانش' : 'Create Knowledge Base'}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {knowledgeBases.map(kb => (
            <Card key={kb.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{kb.name}</h3>
                  <p className="text-xs text-text-muted">
                    {lang === 'fa' ? 'محدوده' : 'Scope'}: {kb.scope} {kb.product_id ? `• ${lang === 'fa' ? 'محصول' : 'Product'}` : ''}
                  </p>
                </div>
                <Badge variant={kb.status === 'ACTIVE' ? 'success' : 'default'}>
                  {kb.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  {kb.articles_count} {lang === 'fa' ? 'مقاله' : 'articles'}
                </p>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/knowledge-bases/${kb.id}/articles`)}>
                  {lang === 'fa' ? 'مشاهده مقالات' : 'View Articles'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <KnowledgeBaseFormModal
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function KnowledgeBaseFormModal({ onSave, onClose }: { onSave: (data: any) => void; onClose: () => void }) {
  const { lang } = useApp();
  const [name, setName] = useState('');
  const [scope, setScope] = useState<'TENANT' | 'PRODUCT' | 'GLOBAL'>('TENANT');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
      return;
    }
    onSave({ name, scope, status });
  };

  return (
    <Modal open={true} onClose={onClose} title={lang === 'fa' ? 'پایگاه دانش جدید' : 'New Knowledge Base'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={lang === 'fa' ? 'نام' : 'Name'}
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />
        <Select
          label={lang === 'fa' ? 'محدوده' : 'Scope'}
          value={scope}
          onChange={(v) => setScope(v as any)}
          options={[
            { value: 'TENANT', label: lang === 'fa' ? 'مستأجر' : 'Tenant' },
            { value: 'PRODUCT', label: lang === 'fa' ? 'محصول' : 'Product' },
            { value: 'GLOBAL', label: lang === 'fa' ? 'عمومی' : 'Global' },
          ]}
        />
        <Select
          label={lang === 'fa' ? 'وضعیت' : 'Status'}
          value={status}
          onChange={(v) => setStatus(v as any)}
          options={[
            { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' },
            { value: 'INACTIVE', label: lang === 'fa' ? 'غیرفعال' : 'Inactive' },
          ]}
        />
        <div className="flex gap-3 pt-4">
          <Button type="submit">{lang === 'fa' ? 'ایجاد' : 'Create'}</Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            {lang === 'fa' ? 'انصراف' : 'Cancel'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminAPIClientsPage() {
  const { t, lang, showToast } = useApp();
  useMockStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  const clients = mockStore.getAPIClients();

  const handleCreate = () => {
    setEditingClient(null);
    setShowCreate(true);
  };

  const handleSave = (clientData: any) => {
    if (editingClient) {
      mockStore.updateAPIClient(editingClient.id, clientData);
      showToast(lang === 'fa' ? 'کلاینت بروزرسانی شد' : 'Client updated', 'success');
    } else {
      const newClient = mockStore.createAPIClient(clientData);
      setShowSecret(newClient.client_secret!);
      showToast(lang === 'fa' ? 'کلاینت ایجاد شد' : 'Client created', 'success');
    }
    setShowCreate(false);
    setEditingClient(null);
  };

  const handleRotateSecret = (clientId: string) => {
    const newSecret = mockStore.rotateAPIClientSecret(clientId);
    if (newSecret) {
      setShowSecret(newSecret);
      showToast(lang === 'fa' ? 'رمز چرخانده شد' : 'Secret rotated', 'success');
    }
  };

  const handleToggleStatus = (clientId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    mockStore.updateAPIClient(clientId, { status: newStatus });
    showToast(
      newStatus === 'ACTIVE' 
        ? (lang === 'fa' ? 'کلاینت فعال شد' : 'Client activated')
        : (lang === 'fa' ? 'کلاینت غیرفعال شد' : 'Client revoked'),
      'success'
    );
  };

  const availableScopes = [
    'tickets:read',
    'tickets:write',
    'customers:read',
    'customers:write',
    'events:write',
    'knowledge:read',
    'analytics:read',
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.api_clients}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'کلاینت جدید' : 'New Client'}
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'کلاینت API وجود ندارد' : 'No API clients'}
          description={lang === 'fa' ? 'کلاینت جدید ایجاد کنید' : 'Create a new client'}
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد کلاینت' : 'Create Client'}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {clients.map(client => (
            <Card key={client.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-xs font-mono text-text-muted">ID: {client.client_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={client.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {client.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Revoked')}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleToggleStatus(client.id, client.status)}
                  >
                    {client.status === 'ACTIVE' 
                      ? (lang === 'fa' ? 'غیرفعال' : 'Revoke')
                      : (lang === 'fa' ? 'فعال' : 'Activate')}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {client.scopes.map(s => <Badge key={s} variant="info">{s}</Badge>)}
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{lang === 'fa' ? 'آخرین استفاده' : 'Last used'}: {client.last_used_at ? new Date(client.last_used_at).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US') : '—'}</span>
                <Button size="sm" variant="ghost" onClick={() => handleRotateSecret(client.id)}>
                  {lang === 'fa' ? 'چرخاندن رمز' : 'Rotate Secret'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <APIClientFormModal
          client={editingClient}
          scopes={availableScopes}
          onSave={handleSave}
          onClose={() => {
            setShowCreate(false);
            setEditingClient(null);
          }}
        />
      )}

      {/* Secret Reveal Modal */}
      {showSecret && (
        <Modal open={true} onClose={() => setShowSecret(null)} title={lang === 'fa' ? 'رمز کلاینت' : 'Client Secret'}>
          <div className="space-y-4">
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm font-medium text-warning-800 mb-2">
                {lang === 'fa' ? '⚠️ این رمز فقط یک‌بار نمایش داده می‌شود' : '⚠️ This secret is shown only once'}
              </p>
              <div className="flex items-center gap-2 p-3 bg-white rounded border border-border">
                <code className="flex-1 text-sm font-mono break-all">{showSecret}</code>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => {
                    navigator.clipboard.writeText(showSecret);
                    showToast(lang === 'fa' ? 'کپی شد' : 'Copied', 'success');
                  }}
                >
                  {lang === 'fa' ? 'کپی' : 'Copy'}
                </Button>
              </div>
            </div>
            <Button onClick={() => setShowSecret(null)} className="w-full">
              {lang === 'fa' ? 'بستن' : 'Close'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function APIClientFormModal({ client, scopes, onSave, onClose }: { client: any; scopes: string[]; onSave: (data: any) => void; onClose: () => void }) {
  const { lang } = useApp();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    scopes: client?.scopes || [],
  });

  const handleToggleScope = (scope: string) => {
    setFormData({
      ...formData,
      scopes: formData.scopes.includes(scope)
        ? formData.scopes.filter((s: string) => s !== scope)
        : [...formData.scopes, scope],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
      return;
    }
    if (formData.scopes.length === 0) {
      alert(lang === 'fa' ? 'لطفاً حداقل یک دسترسی انتخاب کنید' : 'Please select at least one scope');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={true} onClose={onClose} title={client ? (lang === 'fa' ? 'ویرایش کلاینت' : 'Edit Client') : (lang === 'fa' ? 'کلاینت جدید' : 'New Client')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={lang === 'fa' ? 'نام' : 'Name'}
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            {lang === 'fa' ? 'دسترسی‌ها' : 'Scopes'}
          </label>
          <div className="space-y-2">
            {scopes.map(scope => (
              <label key={scope} className="flex items-center gap-2 p-2 bg-surface-alt rounded cursor-pointer hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={formData.scopes.includes(scope)}
                  onChange={() => handleToggleScope(scope)}
                  className="rounded"
                />
                <span className="text-sm font-mono">{scope}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit">
            {client ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'ایجاد' : 'Create')}
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            {lang === 'fa' ? 'انصراف' : 'Cancel'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminWebhooksPage() {
  const { t, lang, showToast } = useApp();
  useMockStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const [showDeliveries, setShowDeliveries] = useState<string | null>(null);
  
  const webhooks = mockStore.getWebhooks();

  const handleCreate = () => {
    setEditingWebhook(null);
    setShowCreate(true);
  };

  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook);
    setShowCreate(true);
  };

  const handleSave = (webhookData: any) => {
    if (editingWebhook) {
      mockStore.updateWebhook(editingWebhook.id, webhookData);
      showToast(lang === 'fa' ? 'وبهوک بروزرسانی شد' : 'Webhook updated', 'success');
    } else {
      mockStore.createWebhook(webhookData);
      showToast(lang === 'fa' ? 'وبهوک ایجاد شد' : 'Webhook created', 'success');
    }
    setShowCreate(false);
    setEditingWebhook(null);
  };

  const handleTestDelivery = (webhookId: string) => {
    const webhook = mockStore.getWebhook(webhookId);
    if (!webhook || webhook.events.length === 0) {
      showToast(lang === 'fa' ? 'رویدادی برای ارسال وجود ندارد' : 'No events to send', 'error');
      return;
    }

    const event = webhook.events[0];
    const success = Math.random() > 0.3; // 70% success rate
    
    mockStore.addWebhookDelivery(webhookId, {
      event,
      status: success ? 'DELIVERED' : 'FAILED',
      attempts: 1,
      response_code: success ? 200 : 500,
      response_body: success 
        ? '{"status":"ok"}'
        : '{"error":"Internal server error"}',
    });

    showToast(
      success 
        ? (lang === 'fa' ? 'ارسال موفق' : 'Delivery successful')
        : (lang === 'fa' ? 'ارسال ناموفق' : 'Delivery failed'),
      success ? 'success' : 'error'
    );
  };

  const handleToggleStatus = (webhookId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    mockStore.updateWebhook(webhookId, { status: newStatus });
    showToast(
      newStatus === 'ACTIVE' 
        ? (lang === 'fa' ? 'وبهوک فعال شد' : 'Webhook activated')
        : (lang === 'fa' ? 'وبهوک غیرفعال شد' : 'Webhook deactivated'),
      'success'
    );
  };

  const availableEvents = [
    'ticket.created',
    'ticket.updated',
    'ticket.assigned',
    'ticket.status_changed',
    'ticket.message_added',
    'ticket.resolved',
    'ticket.closed',
    'customer.created',
    'customer.updated',
    'sla.warning',
    'sla.breached',
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.webhooks}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'وبهوک جدید' : 'New Webhook'}
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <EmptyState
          icon={<Webhook className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'وبهوک وجود ندارد' : 'No webhooks'}
          description={lang === 'fa' ? 'وبهوک جدید ایجاد کنید' : 'Create a new webhook'}
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد وبهوک' : 'Create Webhook'}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {webhooks.map(wh => (
            <Card key={wh.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold">{wh.name}</h3>
                  <p className="text-xs font-mono text-text-muted">{wh.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wh.status === 'ACTIVE' ? 'success' : 'default'}>
                    {wh.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleToggleStatus(wh.id, wh.status)}
                  >
                    {wh.status === 'ACTIVE' 
                      ? (lang === 'fa' ? 'غیرفعال' : 'Deactivate')
                      : (lang === 'fa' ? 'فعال' : 'Activate')}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {wh.events.map(e => <Badge key={e} variant="info">{e}</Badge>)}
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                <span>{wh.deliveries.length} {lang === 'fa' ? 'ارسال' : 'deliveries'}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleTestDelivery(wh.id)}>
                    {lang === 'fa' ? 'ارسال آزمایشی' : 'Test Delivery'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(wh)}>
                    {lang === 'fa' ? 'ویرایش' : 'Edit'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeliveries(wh.id)}>
                    {lang === 'fa' ? 'گزارش ارسال‌ها' : 'View Deliveries'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <WebhookFormModal
          webhook={editingWebhook}
          events={availableEvents}
          onSave={handleSave}
          onClose={() => {
            setShowCreate(false);
            setEditingWebhook(null);
          }}
        />
      )}

      {/* Deliveries Drawer */}
      {showDeliveries && (
        <WebhookDeliveriesDrawer
          webhookId={showDeliveries}
          onClose={() => setShowDeliveries(null)}
        />
      )}
    </div>
  );
}

function WebhookFormModal({ webhook, events, onSave, onClose }: { webhook: any; events: string[]; onSave: (data: any) => void; onClose: () => void }) {
  const { lang } = useApp();
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    events: webhook?.events || [],
    status: webhook?.status || 'ACTIVE',
  });

  const handleToggleEvent = (event: string) => {
    setFormData({
      ...formData,
      events: formData.events.includes(event)
        ? formData.events.filter((e: string) => e !== event)
        : [...formData.events, event],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
      return;
    }
    if (!formData.url.trim()) {
      alert(lang === 'fa' ? 'لطفاً URL را وارد کنید' : 'Please enter a URL');
      return;
    }
    if (formData.events.length === 0) {
      alert(lang === 'fa' ? 'لطفاً حداقل یک رویداد انتخاب کنید' : 'Please select at least one event');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal open={true} onClose={onClose} title={webhook ? (lang === 'fa' ? 'ویرایش وبهوک' : 'Edit Webhook') : (lang === 'fa' ? 'وبهوک جدید' : 'New Webhook')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={lang === 'fa' ? 'نام' : 'Name'}
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="URL"
          value={formData.url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://example.com/webhook"
          required
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            {lang === 'fa' ? 'رویدادها' : 'Events'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {events.map(event => (
              <label key={event} className="flex items-center gap-2 p-2 bg-surface-alt rounded cursor-pointer hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={formData.events.includes(event)}
                  onChange={() => handleToggleEvent(event)}
                  className="rounded"
                />
                <span className="text-xs font-mono">{event}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit">
            {webhook ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'ایجاد' : 'Create')}
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            {lang === 'fa' ? 'انصراف' : 'Cancel'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function WebhookDeliveriesDrawer({ webhookId, onClose }: { webhookId: string; onClose: () => void }) {
  const { lang } = useApp();
  useMockStore();
  
  const webhook = mockStore.getWebhook(webhookId);
  if (!webhook) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{lang === 'fa' ? 'گزارش ارسال‌ها' : 'Delivery Log'}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-surface-hover">
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {webhook.deliveries.length === 0 ? (
            <EmptyState
              title={lang === 'fa' ? 'ارسالی وجود ندارد' : 'No deliveries yet'}
              description={lang === 'fa' ? 'هنوز هیچ ارسال انجام نشده' : 'No deliveries have been made yet'}
            />
          ) : (
            <div className="space-y-3">
              {webhook.deliveries.map(delivery => (
                <Card key={delivery.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={delivery.status === 'DELIVERED' ? 'success' : 'danger'}>
                        {delivery.status === 'DELIVERED' ? (lang === 'fa' ? 'موفق' : 'Success') : (lang === 'fa' ? 'ناموفق' : 'Failed')}
                      </Badge>
                      <span className="text-sm font-medium">{delivery.event}</span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(delivery.created_at).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">{lang === 'fa' ? 'تلاش‌ها' : 'Attempts'}:</span>
                      <span className="font-medium">{delivery.attempts}</span>
                    </div>
                    {delivery.response_code && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">{lang === 'fa' ? 'کد پاسخ' : 'Response Code'}:</span>
                        <span className={`font-mono ${delivery.response_code < 400 ? 'text-success-600' : 'text-danger-600'}`}>
                          {delivery.response_code}
                        </span>
                      </div>
                    )}
                    {delivery.response_body && (
                      <div>
                        <p className="text-text-muted mb-1">{lang === 'fa' ? 'بدنه پاسخ' : 'Response Body'}:</p>
                        <pre className="p-2 bg-surface-alt rounded text-xs overflow-x-auto">
                          {delivery.response_body}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminAuditLogsPage() {
  const { t, lang } = useApp();
  useMockStore();
  
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  
  const logs = mockStore.getAuditLogs();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !search || 
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntityType = !entityTypeFilter || log.entity_type === entityTypeFilter;
    const matchesActor = !actorFilter || log.actor_name.toLowerCase().includes(actorFilter.toLowerCase());
    return matchesSearch && matchesAction && matchesEntityType && matchesActor;
  });

  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entity_type)));
  const uniqueActors = Array.from(new Set(logs.map(log => log.actor_name)));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.audit_logs}</h1>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-4 gap-4">
          <Input
            placeholder={lang === 'fa' ? 'جستجو...' : 'Search...'}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه عملیات' : 'All Actions' },
              { value: 'CREATE', label: lang === 'fa' ? 'ایجاد' : 'Create' },
              { value: 'UPDATE', label: lang === 'fa' ? 'بروزرسانی' : 'Update' },
              { value: 'DELETE', label: lang === 'fa' ? 'حذف' : 'Delete' },
              { value: 'LOGIN', label: lang === 'fa' ? 'ورود' : 'Login' },
              { value: 'LOGOUT', label: lang === 'fa' ? 'خروج' : 'Logout' },
            ]}
          />
          <Select
            value={entityTypeFilter}
            onChange={setEntityTypeFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه انواع' : 'All Types' },
              ...uniqueEntityTypes.map(type => ({ value: type, label: type })),
            ]}
          />
          <Select
            value={actorFilter}
            onChange={setActorFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه کاربران' : 'All Users' },
              ...uniqueActors.map(actor => ({ value: actor, label: actor })),
            ]}
          />
        </div>
      </Card>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileSearch className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'گزارشی یافت نشد' : 'No logs found'}
          description={lang === 'fa' ? 'فیلترها را تغییر دهید' : 'Try adjusting your filters'}
        />
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'زمان' : 'Time'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'کاربر' : 'User'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'عملیات' : 'Action'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'نوع' : 'Type'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">ID</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-4 py-3 text-text-muted text-xs">
                    {new Date(log.created_at).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                  </td>
                  <td className="px-4 py-3">{log.actor_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={log.action === 'CREATE' ? 'success' : log.action === 'DELETE' ? 'danger' : 'info'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{log.entity_type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.entity_id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
