import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, SearchInput, Avatar, Badge, Card, Modal, Input, Select, EmptyState } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function CustomersPage() {
  const { t, lang, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const navigate = useNavigate();

  // Subscribe to store changes for reactivity
  useMockStore();

  // Get customers from mockStore (live data)
  const allCustomers = mockStore.getCustomers();

  const filtered = allCustomers.filter(c => 
    !search || 
    c.display_name.includes(search) || 
    c.profile.email?.includes(search) ||
    c.profile.mobile?.includes(search)
  );

  const handleCreate = () => {
    if (!displayName.trim()) {
      showToast(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name', 'error');
      return;
    }

    mockStore.createCustomer({
      display_name: displayName,
      status: status as any,
      profile: {
        email: email || undefined,
        mobile: mobile || undefined,
      },
    });

    showToast(lang === 'fa' ? 'مشتری با موفقیت ایجاد شد' : 'Customer created successfully', 'success');
    setShowCreate(false);
    setDisplayName('');
    setEmail('');
    setMobile('');
    setStatus('ACTIVE');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.customers}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {t.customer.create}
        </Button>
      </div>

      <Card className="mb-4 !p-4">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder={lang === 'fa' ? 'جستجو بر اساس نام، ایمیل یا موبایل...' : 'Search by name, email or mobile...'} 
        />
      </Card>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'نام' : 'Name'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'ایمیل' : 'Email'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'موبایل' : 'Mobile'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'هویت‌ها' : 'Identities'}</th>
              <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'برچسب‌ها' : 'Tags'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => navigate(`/desk/customers/${c.id}`)} className="border-b border-border hover:bg-surface-hover cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.display_name} size="sm" />
                    <span className="font-medium">{c.display_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{c.profile.email || '—'}</td>
                <td className="px-4 py-3 text-text-muted">{c.profile.mobile || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'}>
                    {c.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {c.identities.length > 0 
                    ? c.identities.map(i => <Badge key={i.id} variant="info">{i.provider}</Badge>) 
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {c.tags.length > 0 
                    ? c.tags.map(tag => <Badge key={tag}>{tag}</Badge>) 
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState title={t.common.empty} />}
      </Card>

      {/* Create Customer Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t.customer.create}>
        <div className="space-y-4">
          <Input 
            label={t.customer.display_name} 
            value={displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full name'} 
          />
          <Input 
            label={lang === 'fa' ? 'ایمیل' : 'Email'} 
            type="email" 
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="email@example.com" 
          />
          <Input 
            label={lang === 'fa' ? 'موبایل' : 'Mobile'} 
            value={mobile}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
            placeholder="09123456789" 
          />
          <Select 
            label={lang === 'fa' ? 'وضعیت' : 'Status'} 
            options={[
              { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' }, 
              { value: 'INACTIVE', label: lang === 'fa' ? 'غیرفعال' : 'Inactive' }, 
              { value: 'BLOCKED', label: lang === 'fa' ? 'مسدود' : 'Blocked' }
            ]}
            value={status}
            onChange={setStatus}
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
