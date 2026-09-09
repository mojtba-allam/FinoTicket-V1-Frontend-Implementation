import React from 'react';
import { Building2, UserCheck, Users, Shield, Clock, Workflow, Zap, BookOpen, Globe, Webhook, FileSearch } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { mockDepartments, mockTeams, mockAgents, mockSLAPolicies, mockKnowledgeBases, mockAPIClients, mockWebhooks, mockAuditLogs } from '../../data/mock';
import { useApp } from '../../app/providers';

export function AdminDepartmentsPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.departments}</h1>
      <div className="grid grid-cols-2 gap-4">
        {mockDepartments.map(d => (
          <Card key={d.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-brand-500" />
                <div>
                  <h3 className="font-medium">{d.name}</h3>
                  <p className="text-xs text-text-muted font-mono">{d.slug}</p>
                </div>
              </div>
              <Badge variant={d.status === 'ACTIVE' ? 'success' : 'default'}>
                {d.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminTeamsPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.teams}</h1>
      <div className="space-y-4">
        {mockTeams.map(team => (
          <Card key={team.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-xs text-text-muted">{team.department_name} • {team.slug}</p>
              </div>
              <Badge variant={team.status === 'ACTIVE' ? 'success' : 'default'}>
                {team.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {team.members.map(m => (
                <div key={m.user_id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt rounded-lg text-sm">
                  <div className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs">
                    {m.user_name.charAt(0)}
                  </div>
                  <span>{m.user_name}</span>
                  <Badge variant={m.role === 'LEAD' ? 'brand' : 'default'}>
                    {m.role === 'LEAD' ? (lang === 'fa' ? 'رهبر' : 'Lead') : (lang === 'fa' ? 'عضو' : 'Member')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminAgentsPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.agents}</h1>
      <div className="grid grid-cols-3 gap-4">
        {mockAgents.map(agent => (
          <Card key={agent.id}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-brand-500 flex items-center justify-center text-white text-lg font-bold">
                {agent.display_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{agent.display_name}</h3>
                <div className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${agent.presence === 'ONLINE' ? 'bg-success-500' : agent.presence === 'AWAY' ? 'bg-warning-500' : agent.presence === 'BUSY' ? 'bg-danger-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-text-muted">{agent.presence}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-text-muted">
              <p>{lang === 'fa' ? 'زمان‌بندی' : 'Timezone'}: {agent.timezone}</p>
              <p>{lang === 'fa' ? 'حداکثر تیکت فعال' : 'Max active'}: {agent.max_active_tickets}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const { t, lang } = useApp();
  const users = [
    { id: 'u-001', email: 'admin@finoticket.ir', display_name: 'علی محمدی', role: 'ADMIN' as const, status: 'ACTIVE' as const, presence: 'ONLINE' as const, timezone: 'Asia/Tehran', language: 'fa' as const, created_at: '2024-01-01' },
    { id: 'u-002', email: 'fateme@finoticket.ir', display_name: 'فاطمه رضایی', role: 'AGENT' as const, status: 'ACTIVE' as const, presence: 'AWAY' as const, timezone: 'Asia/Tehran', language: 'fa' as const, created_at: '2024-02-01' },
    { id: 'u-003', email: 'hasan@finoticket.ir', display_name: 'حسن نوری', role: 'MANAGER' as const, status: 'ACTIVE' as const, presence: 'BUSY' as const, timezone: 'Asia/Tehran', language: 'fa' as const, created_at: '2024-03-01' },
  ];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.users}</h1>
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'کاربر' : 'User'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'ایمیل' : 'Email'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'نقش' : 'Role'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
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
                <td className="px-4 py-3"><Badge variant={u.status === 'ACTIVE' ? 'success' : 'default'}>{u.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : u.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminSLAPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.sla}</h1>
      <div className="space-y-4">
        {mockSLAPolicies.map(sla => (
          <Card key={sla.id}>
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
        ))}
      </div>
    </div>
  );
}

export function AdminWorkflowsPage() {
  const { t, lang } = useApp();
  const workflows = [
    { id: 'wf-1', name: lang === 'fa' ? 'ارجاع خودکار به فنی' : 'Auto-assign to Tech', event: 'ticket.created', status: 'ACTIVE' as const, version: 2, steps: 2 },
    { id: 'wf-2', name: lang === 'fa' ? 'اعلان SLA بحرانی' : 'Critical SLA Alert', event: 'sla.warning', status: 'ACTIVE' as const, version: 1, steps: 1 },
  ];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.workflows}</h1>
      <div className="space-y-4">
        {workflows.map(wf => (
          <Card key={wf.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{wf.name}</h3>
                <p className="text-xs text-text-muted">{lang === 'fa' ? 'رویداد' : 'Event'}: {wf.event} • {lang === 'fa' ? 'نسخه' : 'Version'}: {wf.version}</p>
              </div>
              <Badge variant={wf.status === 'ACTIVE' ? 'success' : wf.status === 'DRAFT' ? 'warning' : 'default'}>
                {wf.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : wf.status === 'DRAFT' ? (lang === 'fa' ? 'پیش‌نویس' : 'Draft') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
            <p className="text-sm text-text-muted">{wf.steps} {lang === 'fa' ? 'مرحله' : 'steps'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminAutomationsPage() {
  const { t, lang } = useApp();
  const automations = [
    { id: 'au-1', name: lang === 'fa' ? 'تغییر وضعیت به در انتظار مشتری' : 'Set status to Waiting Customer', trigger_event: 'message.added', status: 'ACTIVE' as const },
    { id: 'au-2', name: lang === 'fa' ? 'اولویت‌بندی خودکار کلمات کلیدی' : 'Auto-prioritize keywords', trigger_event: 'ticket.created', status: 'ACTIVE' as const },
  ];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.automations}</h1>
      <div className="space-y-4">
        {automations.map(au => (
          <Card key={au.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{au.name}</h3>
                <p className="text-xs text-text-muted">{lang === 'fa' ? 'راه‌انداز' : 'Trigger'}: {au.trigger_event}</p>
              </div>
              <Badge variant={au.status === 'ACTIVE' ? 'success' : 'default'}>
                {au.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminKnowledgeBasesPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.knowledge_bases}</h1>
      <div className="space-y-4">
        {mockKnowledgeBases.map(kb => (
          <Card key={kb.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{kb.name}</h3>
                <p className="text-xs text-text-muted">{lang === 'fa' ? 'محدوده' : 'Scope'}: {kb.scope} {kb.product_id ? `• ${lang === 'fa' ? 'محصول' : 'Product'}` : ''}</p>
              </div>
              <Badge variant={kb.status === 'ACTIVE' ? 'success' : 'default'}>
                {kb.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
            <p className="text-sm text-text-muted">{kb.articles_count} {lang === 'fa' ? 'مقاله' : 'articles'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminAPIClientsPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.api_clients}</h1>
      <div className="space-y-4">
        {mockAPIClients.map(client => (
          <Card key={client.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-xs font-mono text-text-muted">ID: {client.client_id}</p>
              </div>
              <Badge variant={client.status === 'ACTIVE' ? 'success' : 'danger'}>{client.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {client.scopes.map(s => <Badge key={s} variant="info">{s}</Badge>)}
            </div>
            <p className="text-xs text-text-muted">{lang === 'fa' ? 'آخرین استفاده' : 'Last used'}: {client.last_used_at ? new Date(client.last_used_at).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US') : '—'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminWebhooksPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.webhooks}</h1>
      <div className="space-y-4">
        {mockWebhooks.map(wh => (
          <Card key={wh.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{wh.name}</h3>
                <p className="text-xs font-mono text-text-muted">{wh.url}</p>
              </div>
              <Badge variant={wh.status === 'ACTIVE' ? 'success' : 'default'}>
                {wh.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {wh.events.map(e => <Badge key={e} variant="info">{e}</Badge>)}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-text-muted mb-2">{lang === 'fa' ? 'آخرین ارسال‌ها' : 'Recent deliveries'}:</p>
              <div className="space-y-1.5">
                {wh.deliveries.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-xs p-2 bg-surface-alt rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={d.status === 'DELIVERED' ? 'success' : 'danger'}>
                        {d.status === 'DELIVERED' ? (lang === 'fa' ? 'موفق' : 'Success') : (lang === 'fa' ? 'ناموفق' : 'Failed')}
                      </Badge>
                      <span className="text-text-muted">{d.event}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.response_code && <span className={d.response_code < 400 ? 'text-success-600' : 'text-danger-600'}>{d.response_code}</span>}
                      <span className="text-text-muted">{d.attempts} {lang === 'fa' ? 'تلاش' : 'attempts'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminAuditLogsPage() {
  const { t, lang } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t.admin.audit_logs}</h1>
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'زمان' : 'Time'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'کاربر' : 'User'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'عملیات' : 'Action'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'نوع' : 'Type'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">ID</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id} className="border-b border-border hover:bg-surface-hover">
                <td className="px-4 py-3 text-text-muted text-xs">{new Date(log.created_at).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</td>
                <td className="px-4 py-3">{log.actor_name}</td>
                <td className="px-4 py-3"><Badge variant={log.action === 'CREATE' ? 'success' : log.action === 'DELETE' ? 'danger' : 'info'}>{log.action}</Badge></td>
                <td className="px-4 py-3 text-text-muted">{log.entity_type}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
