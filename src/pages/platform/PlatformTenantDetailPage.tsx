import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Building2, Package, Users, Ticket, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, KPICard } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function PlatformTenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { lang } = useApp();
  const navigate = useNavigate();
  useMockStore();
  
  const tenant = mockStore.getTenants().find(t => t.id === tenantId);

  if (!tenant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">
            {lang === 'fa' ? 'مستأجر یافت نشد' : 'Tenant not found'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/platform/tenants')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const products = mockStore.getProducts().filter(p => p.tenant_id === tenant.id);
  const agents = mockStore.getAgents().filter(a => a.tenant_id === tenant.id);
  const tickets = mockStore.getTickets().filter(t => t.tenant_id === tenant.id);
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/platform/tenants" className="hover:text-brand-600">
          {lang === 'fa' ? 'مستأجران' : 'Tenants'}
        </Link>
        <span>/</span>
        <span className="text-text">{tenant.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/platform/tenants')} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            <p className="text-sm text-text-muted font-mono">{tenant.slug}</p>
          </div>
        </div>
        <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'warning'}>
          {tenant.status === 'ACTIVE' 
            ? (lang === 'fa' ? 'فعال' : 'Active')
            : (lang === 'fa' ? 'معلق' : 'Suspended')}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          label={lang === 'fa' ? 'محصولات' : 'Products'}
          value={products.length}
          icon={<Package className="h-6 w-6" />}
          color="brand"
        />
        <KPICard
          label={lang === 'fa' ? 'کارشناسان' : 'Agents'}
          value={agents.length}
          icon={<Users className="h-6 w-6" />}
          color="brand"
        />
        <KPICard
          label={lang === 'fa' ? 'تیکت‌های باز' : 'Open Tickets'}
          value={openTickets}
          icon={<Ticket className="h-6 w-6" />}
          color="warning"
        />
        <KPICard
          label={lang === 'fa' ? 'تیکت‌های حل شده' : 'Resolved Tickets'}
          value={resolvedTickets}
          icon={<Ticket className="h-6 w-6" />}
          color="success"
        />
      </div>

      {/* Products List */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-4">{lang === 'fa' ? 'محصولات' : 'Products'}</h3>
        {products.length === 0 ? (
          <p className="text-text-muted text-center py-4">
            {lang === 'fa' ? 'هنوز محصولی ثبت نشده' : 'No products registered yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-brand-500" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-text-muted font-mono">{product.slug}</p>
                  </div>
                </div>
                <Badge variant={product.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {product.status === 'ACTIVE' 
                    ? (lang === 'fa' ? 'فعال' : 'Active')
                    : (lang === 'fa' ? 'معلق' : 'Suspended')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Agents List */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-4">{lang === 'fa' ? 'کارشناسان' : 'Agents'}</h3>
        {agents.length === 0 ? (
          <p className="text-text-muted text-center py-4">
            {lang === 'fa' ? 'هنوز کارشناسی ثبت نشده' : 'No agents registered yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                    {agent.display_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{agent.display_name}</p>
                    <p className="text-xs text-text-muted">{agent.timezone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    agent.presence === 'ONLINE' ? 'bg-success-500' :
                    agent.presence === 'AWAY' ? 'bg-warning-500' :
                    agent.presence === 'BUSY' ? 'bg-danger-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-xs text-text-muted">{agent.presence}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Tickets */}
      <Card>
        <h3 className="font-semibold mb-4">{lang === 'fa' ? 'آخرین تیکت‌ها' : 'Recent Tickets'}</h3>
        {tickets.length === 0 ? (
          <p className="text-text-muted text-center py-4">
            {lang === 'fa' ? 'هنوز تیکتی ثبت نشده' : 'No tickets registered yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {tickets.slice(0, 10).map(ticket => (
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
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'danger' : 'default'}>
                    {ticket.priority === 'LOW' ? (lang === 'fa' ? 'کم' : 'Low') :
                     ticket.priority === 'NORMAL' ? (lang === 'fa' ? 'معمولی' : 'Normal') :
                     ticket.priority === 'HIGH' ? (lang === 'fa' ? 'بالا' : 'High') :
                     (lang === 'fa' ? 'فوری' : 'Urgent')}
                  </Badge>
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
        )}
      </Card>
    </div>
  );
}
