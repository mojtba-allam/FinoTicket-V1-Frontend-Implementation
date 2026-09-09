import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Link2 } from 'lucide-react';
import { Button, Avatar, Badge, StatusBadge, Card, EmptyState, ErrorState } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { t, lang } = useApp();
  const navigate = useNavigate();

  // Subscribe to store changes for reactivity
  useMockStore();

  // Get customer from mockStore (live data)
  const customer = mockStore.getCustomer(id || '');

  if (!customer) return <div className="p-6"><ErrorState title={lang === 'fa' ? 'مشتری یافت نشد' : 'Customer not found'} /></div>;

  // Get customer tickets from mockStore (live data)
  const allTickets = mockStore.getTickets();
  const customerTickets = allTickets.filter(tk => tk.customer_id === id);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-surface-hover">
          <ChevronLeft className="h-5 w-5 flip-rtl" />
        </button>
        <h1 className="text-2xl font-bold">{customer.display_name}</h1>
        <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'default'}>
          {customer.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <h3 className="font-semibold mb-4">{t.customer.profile}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">{lang === 'fa' ? 'نام:' : 'Name:'}</span>{' '}
                <span>{customer.profile.first_name} {customer.profile.last_name}</span>
              </div>
              <div>
                <span className="text-text-muted">{lang === 'fa' ? 'ایمیل:' : 'Email:'}</span>{' '}
                <span>{customer.profile.email || '—'}</span>
              </div>
              <div>
                <span className="text-text-muted">{lang === 'fa' ? 'موبایل:' : 'Mobile:'}</span>{' '}
                <span>{customer.profile.mobile || '—'}</span>
              </div>
              <div>
                <span className="text-text-muted">{lang === 'fa' ? 'تاریخ ثبت:' : 'Created:'}</span>{' '}
                <span>{new Date(customer.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
              </div>
            </div>
          </Card>

          {/* Identities */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t.customer.identities}</h3>
              <Button size="sm" variant="secondary">
                <Link2 className="h-3.5 w-3.5" /> {t.customer.link_identity}
              </Button>
            </div>
            {customer.identities.length > 0 ? (
              <div className="space-y-2">
                {customer.identities.map(identity => (
                  <div key={identity.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{identity.provider}</Badge>
                      <span className="text-sm font-mono">{identity.provider_user_id}</span>
                    </div>
                    <Badge variant={identity.verification_status === 'VERIFIED' ? 'success' : 'warning'}>
                      {identity.verification_status === 'VERIFIED' 
                        ? (lang === 'fa' ? 'تایید شده' : 'Verified') 
                        : (lang === 'fa' ? 'تایید نشده' : 'Unverified')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                {lang === 'fa' ? 'هویتی متصل نشده است' : 'No identities linked'}
              </p>
            )}
          </Card>

          {/* Ticket History */}
          <Card>
            <h3 className="font-semibold mb-4">{t.customer.ticket_history}</h3>
            {customerTickets.length > 0 ? (
              <div className="space-y-2">
                {customerTickets.map(tk => (
                  <div 
                    key={tk.id} 
                    onClick={() => navigate(`/desk/tickets/${tk.id}`)}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-surface-hover cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-text-muted">{tk.ticket_number}</span>
                      <span className="text-sm">{tk.subject}</span>
                    </div>
                    <StatusBadge status={tk.status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={lang === 'fa' ? 'تیکتی ثبت نشده' : 'No tickets found'} />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="text-center">
            <Avatar name={customer.display_name} size="lg" />
            <h3 className="font-semibold mt-3">{customer.display_name}</h3>
            <p className="text-sm text-text-muted">{customer.profile.email}</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-sm mb-3">{t.customer.tags}</h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags.length > 0 
                ? customer.tags.map(tag => <Badge key={tag}>{tag}</Badge>) 
                : <span className="text-sm text-text-muted">{lang === 'fa' ? 'بدون برچسب' : 'No tags'}</span>}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-sm mb-3">{t.customer.addresses}</h3>
            {customer.addresses.length > 0 ? (
              customer.addresses.map(addr => (
                <div key={addr.id} className="p-2.5 bg-surface-alt rounded-lg text-sm">
                  <p className="font-medium">{addr.title}</p>
                  <p className="text-text-muted text-xs mt-1">
                    {addr.address}{addr.city ? `، ${addr.city}` : ''}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted">
                {lang === 'fa' ? 'آدرسی ثبت نشده' : 'No addresses registered'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
