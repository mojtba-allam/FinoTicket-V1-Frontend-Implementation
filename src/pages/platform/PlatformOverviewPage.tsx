import React from 'react';
import { Building2, Users, Ticket, AlertTriangle } from 'lucide-react';
import { Card, KPICard } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';

export default function PlatformOverviewPage() {
  const { lang } = useApp();

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: tenants } = useCollection(
    () => mockStore.getTenants(),
    (api) => api.tenants.list(),
  );
  const { data: products } = useCollection(
    () => mockStore.getProducts(),
    (api) => api.products.list(),
  );
  const { data: tickets } = useCollection(
    () => mockStore.getTickets(),
    (api) => api.tickets.list(),
  );
  const { data: agents } = useCollection(
    () => mockStore.getAgents(),
    (api) => api.agents.list(),
  );

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const suspendedTenants = tenants.filter(t => t.status === 'SUSPENDED').length;
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {lang === 'fa' ? 'نمای کلی پلتفرم' : 'Platform Overview'}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          label={lang === 'fa' ? 'کل مستأجران' : 'Total Tenants'}
          value={tenants.length}
          icon={<Building2 className="h-6 w-6" />}
          color="brand"
        />
        <KPICard
          label={lang === 'fa' ? 'مستأجران فعال' : 'Active Tenants'}
          value={activeTenants}
          icon={<Building2 className="h-6 w-6" />}
          color="success"
        />
        <KPICard
          label={lang === 'fa' ? 'مستأجران معلق' : 'Suspended Tenants'}
          value={suspendedTenants}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="warning"
        />
        <KPICard
          label={lang === 'fa' ? 'تیکت‌های باز' : 'Open Tickets'}
          value={openTickets}
          icon={<Ticket className="h-6 w-6" />}
          color="brand"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">{lang === 'fa' ? 'آمار محصولات' : 'Products Statistics'}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">{lang === 'fa' ? 'کل محصولات' : 'Total Products'}</span>
              <span className="text-2xl font-bold">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">{lang === 'fa' ? 'محصولات فعال' : 'Active Products'}</span>
              <span className="text-2xl font-bold text-success-600">
                {products.filter(p => p.status === 'ACTIVE').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">{lang === 'fa' ? 'محصولات معلق' : 'Suspended Products'}</span>
              <span className="text-2xl font-bold text-warning-600">
                {products.filter(p => p.status === 'SUSPENDED').length}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">{lang === 'fa' ? 'آمار کارشناسان' : 'Agents Statistics'}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">{lang === 'fa' ? 'کل کارشناسان' : 'Total Agents'}</span>
              <span className="text-2xl font-bold">{agents.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">{lang === 'fa' ? 'آنلاین' : 'Online'}</span>
              <span className="text-2xl font-bold text-success-600">
                {agents.filter(a => a.presence === 'ONLINE').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">{lang === 'fa' ? 'مشغول' : 'Busy'}</span>
              <span className="text-2xl font-bold text-warning-600">
                {agents.filter(a => a.presence === 'BUSY').length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <h3 className="font-semibold mb-4">{lang === 'fa' ? 'آخرین فعالیت‌ها' : 'Recent Activity'}</h3>
        <div className="space-y-3">
          {tickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                  {ticket.ticket_number.slice(-2)}
                </div>
                <div>
                  <p className="font-medium text-sm">{ticket.subject}</p>
                  <p className="text-xs text-text-muted">
                    {ticket.customer_name} • {ticket.product_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === 'OPEN' ? 'bg-brand-50 text-brand-700' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-warning-50 text-warning-700' :
                  'bg-success-50 text-success-700'
                }`}>
                  {ticket.status === 'OPEN' ? (lang === 'fa' ? 'باز' : 'Open') :
                   ticket.status === 'IN_PROGRESS' ? (lang === 'fa' ? 'در حال بررسی' : 'In Progress') :
                   (lang === 'fa' ? 'حل شده' : 'Resolved')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
