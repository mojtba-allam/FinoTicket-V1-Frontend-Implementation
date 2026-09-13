import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Select } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';

export default function PlatformTenantsPage() {
  const { lang, showToast } = useApp();
  const navigate = useNavigate();

  const { data: tenants, loading } = useCollection(
    () => mockStore.getTenants(),
    (api) => api.tenants.list(),
  );
  const { data: allProducts } = useCollection(
    () => mockStore.getProducts(),
    (api) => api.products.list(),
  );
  const { data: allAgents } = useCollection(
    () => mockStore.getAgents(),
    (api) => api.agents.list(),
  );
  const { data: allTickets } = useCollection(
    () => mockStore.getTickets(),
    (api) => api.tickets.list(),
  );
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');

  const handleCreate = () => {
    if (!name.trim() || !slug.trim()) {
      showToast(lang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill all fields', 'error');
      return;
    }

    mockStore.createTenant({
      name,
      slug,
      status,
      owner_user_id: `user-${Date.now()}`,
    });

    showToast(lang === 'fa' ? 'مستأجر ایجاد شد' : 'Tenant created', 'success');
    setShowCreate(false);
    setName('');
    setSlug('');
    setStatus('ACTIVE');
  };

  const handleSuspend = (tenantId: string) => {
    mockStore.suspendTenant(tenantId);
    showToast(lang === 'fa' ? 'مستأجر معلق شد' : 'Tenant suspended', 'success');
  };

  const handleRestore = (tenantId: string) => {
    mockStore.updateTenant(tenantId, { status: 'ACTIVE' });
    showToast(lang === 'fa' ? 'مستأجر فعال شد' : 'Tenant restored', 'success');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {lang === 'fa' ? 'مدیریت مستأجران' : 'Tenant Management'}
        </h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'مستأجر جدید' : 'New Tenant'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tenants.map(tenant => {
          const products = allProducts.filter(p => p.tenant_id === tenant.id);
          const agents = allAgents.filter(a => a.tenant_id === tenant.id);
          const tickets = allTickets.filter(t => t.tenant_id === tenant.id);
          const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

          return (
            <Card key={tenant.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-brand-500" />
                  <div>
                    <h3 className="font-semibold">{tenant.name}</h3>
                    <p className="text-xs text-text-muted font-mono">{tenant.slug}</p>
                  </div>
                </div>
                <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {tenant.status === 'ACTIVE' 
                    ? (lang === 'fa' ? 'فعال' : 'Active')
                    : (lang === 'fa' ? 'معلق' : 'Suspended')}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{lang === 'fa' ? 'محصولات' : 'Products'}</span>
                  <span className="font-medium">{products.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{lang === 'fa' ? 'کارشناسان' : 'Agents'}</span>
                  <span className="font-medium">{agents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{lang === 'fa' ? 'تیکت‌های باز' : 'Open Tickets'}</span>
                  <span className="font-medium">{openTickets}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => navigate(`/platform/tenants/${tenant.id}`)}
                >
                  {lang === 'fa' ? 'مشاهده' : 'View'}
                </Button>
                {tenant.status === 'ACTIVE' ? (
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => handleSuspend(tenant.id)}
                  >
                    <AlertTriangle className="h-3 w-3" /> {lang === 'fa' ? 'تعلیق' : 'Suspend'}
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleRestore(tenant.id)}
                  >
                    {lang === 'fa' ? 'فعال‌سازی' : 'Restore'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {tenants.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">
            {lang === 'fa' ? 'هنوز مستأجری ثبت نشده' : 'No tenants registered yet'}
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        title={lang === 'fa' ? 'ایجاد مستأجر جدید' : 'Create New Tenant'}
      >
        <div className="space-y-4">
          <Input 
            label={lang === 'fa' ? 'نام' : 'Name'}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام شرکت' : 'Company name'}
          />
          <Input 
            label={lang === 'fa' ? 'نامک' : 'Slug'}
            value={slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            placeholder="company-slug"
          />
          <Select 
            label={lang === 'fa' ? 'وضعیت' : 'Status'}
            value={status}
            onChange={(v) => setStatus(v as 'ACTIVE' | 'SUSPENDED')}
            options={[
              { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' },
              { value: 'SUSPENDED', label: lang === 'fa' ? 'معلق' : 'Suspended' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate}>
              {lang === 'fa' ? 'ایجاد' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
