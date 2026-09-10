import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Link2, Edit, Plus, Trash2, X } from 'lucide-react';
import { Button, Avatar, Badge, StatusBadge, Card, EmptyState, ErrorState, Modal, Input, Select } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';
import type { Address, CustomerIdentity, AddressType } from '../../types';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { t, lang, showToast } = useApp();
  const navigate = useNavigate();

  // Subscribe to store changes for reactivity
  useMockStore();

  // Get customer from mockStore (live data)
  const customer = mockStore.getCustomer(id || '');

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showLinkIdentity, setShowLinkIdentity] = useState(false);
  const [unlinkingIdentity, setUnlinkingIdentity] = useState<CustomerIdentity | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
  });
  const [addressForm, setAddressForm] = useState<{
    type: AddressType;
    title: string;
    address: string;
    postal_code: string;
    city: string;
    province: string;
    country: string;
  }>({
    type: 'HOME',
    title: '',
    address: '',
    postal_code: '',
    city: '',
    province: '',
    country: '',
  });
  const [identityForm, setIdentityForm] = useState({
    provider: '',
    provider_user_id: '',
    verification_status: 'UNVERIFIED' as const,
  });

  if (!customer) return <div className="p-6"><ErrorState title={lang === 'fa' ? 'مشتری یافت نشد' : 'Customer not found'} /></div>;

  // Get customer tickets from mockStore (live data)
  const allTickets = mockStore.getTickets();
  const customerTickets = allTickets.filter(tk => tk.customer_id === id);

  // Handlers
  const handleEditProfile = () => {
    setProfileForm({
      first_name: customer.profile.first_name || '',
      last_name: customer.profile.last_name || '',
      email: customer.profile.email || '',
      mobile: customer.profile.mobile || '',
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = () => {
    mockStore.updateCustomer(customer.id, {
      display_name: `${profileForm.first_name} ${profileForm.last_name}`.trim(),
      profile: {
        ...customer.profile,
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        mobile: profileForm.mobile,
      },
    });
    showToast(lang === 'fa' ? 'پروفایل بروزرسانی شد' : 'Profile updated', 'success');
    setShowEditProfile(false);
  };

  const handleAddAddress = () => {
    setAddressForm({
      type: 'HOME',
      title: '',
      address: '',
      postal_code: '',
      city: '',
      province: '',
      country: '',
    });
    setEditingAddress(null);
    setShowAddAddress(true);
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm({
      type: addr.type,
      title: addr.title,
      address: addr.address,
      postal_code: addr.postal_code || '',
      city: addr.city || '',
      province: addr.province || '',
      country: addr.country || '',
    });
    setEditingAddress(addr);
    setShowAddAddress(true);
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      mockStore.updateCustomerAddress(customer.id, editingAddress.id, addressForm);
      showToast(lang === 'fa' ? 'آدرس بروزرسانی شد' : 'Address updated', 'success');
    } else {
      mockStore.addCustomerAddress(customer.id, addressForm);
      showToast(lang === 'fa' ? 'آدرس اضافه شد' : 'Address added', 'success');
    }
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressId: string) => {
    mockStore.deleteCustomerAddress(customer.id, addressId);
    showToast(lang === 'fa' ? 'آدرس حذف شد' : 'Address deleted', 'success');
  };

  const handleLinkIdentity = () => {
    setIdentityForm({
      provider: '',
      provider_user_id: '',
      verification_status: 'UNVERIFIED',
    });
    setShowLinkIdentity(true);
  };

  const handleSaveIdentity = () => {
    mockStore.linkCustomerIdentity(customer.id, identityForm);
    showToast(lang === 'fa' ? 'هویت متصل شد' : 'Identity linked', 'success');
    setShowLinkIdentity(false);
  };

  const handleUnlinkIdentity = (identity: CustomerIdentity) => {
    setUnlinkingIdentity(identity);
  };

  const confirmUnlinkIdentity = () => {
    if (unlinkingIdentity) {
      mockStore.unlinkCustomerIdentity(customer.id, unlinkingIdentity.id);
      showToast(lang === 'fa' ? 'هویت حذف شد' : 'Identity unlinked', 'success');
      setUnlinkingIdentity(null);
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t.customer.profile}</h3>
              <Button size="sm" variant="secondary" onClick={handleEditProfile}>
                <Edit className="h-3.5 w-3.5" /> {lang === 'fa' ? 'ویرایش' : 'Edit'}
              </Button>
            </div>
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
              <Button size="sm" variant="secondary" onClick={handleLinkIdentity}>
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
                      <Badge variant={identity.verification_status === 'VERIFIED' ? 'success' : 'warning'}>
                        {identity.verification_status === 'VERIFIED' 
                          ? (lang === 'fa' ? 'تایید شده' : 'Verified') 
                          : (lang === 'fa' ? 'تایید نشده' : 'Unverified')}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleUnlinkIdentity(identity)}
                    >
                      <X className="h-4 w-4 text-danger-500" />
                    </Button>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{t.customer.addresses}</h3>
              <Button size="sm" variant="secondary" onClick={handleAddAddress}>
                <Plus className="h-3.5 w-3.5" /> {lang === 'fa' ? 'افزودن' : 'Add'}
              </Button>
            </div>
            {customer.addresses.length > 0 ? (
              <div className="space-y-2">
                {customer.addresses.map(addr => (
                  <div key={addr.id} className="p-2.5 bg-surface-alt rounded-lg text-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{addr.title}</p>
                        <p className="text-text-muted text-xs mt-1">
                          {addr.address}{addr.city ? `، ${addr.city}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditAddress(addr)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteAddress(addr.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-danger-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                {lang === 'fa' ? 'آدرسی ثبت نشده' : 'No addresses registered'}
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title={lang === 'fa' ? 'ویرایش پروفایل' : 'Edit Profile'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={lang === 'fa' ? 'نام' : 'First Name'}
              value={profileForm.first_name}
              onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
            />
            <Input
              label={lang === 'fa' ? 'نام خانوادگی' : 'Last Name'}
              value={profileForm.last_name}
              onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
            />
          </div>
          <Input
            label={lang === 'fa' ? 'ایمیل' : 'Email'}
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
          />
          <Input
            label={lang === 'fa' ? 'موبایل' : 'Mobile'}
            value={profileForm.mobile}
            onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveProfile}>
              {lang === 'fa' ? 'ذخیره' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setShowEditProfile(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Address Modal */}
      <Modal
        open={showAddAddress}
        onClose={() => { setShowAddAddress(false); setEditingAddress(null); }}
        title={editingAddress 
          ? (lang === 'fa' ? 'ویرایش آدرس' : 'Edit Address')
          : (lang === 'fa' ? 'افزودن آدرس' : 'Add Address')}
      >
        <div className="space-y-4">
          <Select
            label={lang === 'fa' ? 'نوع' : 'Type'}
            value={addressForm.type}
            onChange={(value) => setAddressForm({ ...addressForm, type: value as AddressType })}
            options={[
              { value: 'HOME', label: lang === 'fa' ? 'منزل' : 'Home' },
              { value: 'WORK', label: lang === 'fa' ? 'محل کار' : 'Work' },
              { value: 'OTHER', label: lang === 'fa' ? 'سایر' : 'Other' },
            ]}
          />
          <Input
            label={lang === 'fa' ? 'عنوان' : 'Title'}
            value={addressForm.title}
            onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
            placeholder={lang === 'fa' ? 'مثلاً: خانه اصلی' : 'e.g., Main house'}
          />
          <Input
            label={lang === 'fa' ? 'آدرس' : 'Address'}
            value={addressForm.address}
            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={lang === 'fa' ? 'شهر' : 'City'}
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
            />
            <Input
              label={lang === 'fa' ? 'استان' : 'Province'}
              value={addressForm.province}
              onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={lang === 'fa' ? 'کد پستی' : 'Postal Code'}
              value={addressForm.postal_code}
              onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
            />
            <Input
              label={lang === 'fa' ? 'کشور' : 'Country'}
              value={addressForm.country}
              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveAddress}>
              {editingAddress 
                ? (lang === 'fa' ? 'بروزرسانی' : 'Update')
                : (lang === 'fa' ? 'افزودن' : 'Add')}
            </Button>
            <Button variant="secondary" onClick={() => { setShowAddAddress(false); setEditingAddress(null); }}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Link Identity Modal */}
      <Modal
        open={showLinkIdentity}
        onClose={() => setShowLinkIdentity(false)}
        title={lang === 'fa' ? 'اتصال هویت' : 'Link Identity'}
      >
        <div className="space-y-4">
          <Select
            label={lang === 'fa' ? 'ارائه‌دهنده' : 'Provider'}
            value={identityForm.provider}
            onChange={(value) => setIdentityForm({ ...identityForm, provider: value })}
            options={[
              { value: 'FINOID', label: 'FinoID' },
              { value: 'FINOPAL', label: 'Finopal' },
              { value: 'GOOGLE', label: 'Google' },
              { value: 'OTHER', label: lang === 'fa' ? 'سایر' : 'Other' },
            ]}
          />
          <Input
            label={lang === 'fa' ? 'شناسه کاربری' : 'User ID'}
            value={identityForm.provider_user_id}
            onChange={(e) => setIdentityForm({ ...identityForm, provider_user_id: e.target.value })}
            placeholder={lang === 'fa' ? 'شناسه کاربر در ارائه‌دهنده' : 'User ID at provider'}
          />
          <Select
            label={lang === 'fa' ? 'وضعیت تایید' : 'Verification Status'}
            value={identityForm.verification_status}
            onChange={(value) => setIdentityForm({ ...identityForm, verification_status: value as any })}
            options={[
              { value: 'UNVERIFIED', label: lang === 'fa' ? 'تایید نشده' : 'Unverified' },
              { value: 'VERIFIED', label: lang === 'fa' ? 'تایید شده' : 'Verified' },
              { value: 'PENDING', label: lang === 'fa' ? 'در انتظار' : 'Pending' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveIdentity}>
              {lang === 'fa' ? 'اتصال' : 'Link'}
            </Button>
            <Button variant="secondary" onClick={() => setShowLinkIdentity(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unlink Identity Confirmation Modal */}
      <Modal
        open={!!unlinkingIdentity}
        onClose={() => setUnlinkingIdentity(null)}
        title={lang === 'fa' ? 'تایید حذف هویت' : 'Confirm Unlink Identity'}
      >
        <div className="space-y-4">
          <p className="text-sm">
            {lang === 'fa' 
              ? `آیا مطمئن هستید که می‌خواهید هویت ${unlinkingIdentity?.provider} را حذف کنید؟`
              : `Are you sure you want to unlink the ${unlinkingIdentity?.provider} identity?`}
          </p>
          {unlinkingIdentity && (
            <div className="p-3 bg-surface-alt rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="info">{unlinkingIdentity.provider}</Badge>
                <span className="text-sm font-mono">{unlinkingIdentity.provider_user_id}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="danger" onClick={confirmUnlinkIdentity}>
              {lang === 'fa' ? 'حذف' : 'Unlink'}
            </Button>
            <Button variant="secondary" onClick={() => setUnlinkingIdentity(null)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
