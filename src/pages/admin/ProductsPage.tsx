import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Select } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection } from '../../lib/api/hooks';
import { useApp } from '../../app/providers';

export default function AdminProductsPage() {
  const { t, lang, showToast } = useApp();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: products } = useCollection(
    () => mockStore.getProducts(),
    (api) => api.products.list(),
  );

  const handleCreate = () => {
    if (!name.trim() || !slug.trim()) {
      showToast(lang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill all fields', 'error');
      return;
    }
    
    mockStore.createProduct({
      name,
      slug,
      status: status as any,
    });
    
    showToast(lang === 'fa' ? 'محصول ایجاد شد' : 'Product created', 'success');
    setShowCreate(false);
    setName('');
    setSlug('');
    setStatus('ACTIVE');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.products}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'محصول جدید' : 'New Product'}
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/products/${p.id}`)}>
            <Card>
              <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-text-muted font-mono">{p.slug}</p>
              </div>
              <Badge variant={p.status === 'ACTIVE' ? 'success' : p.status === 'SUSPENDED' ? 'danger' : 'default'}>
                {p.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : 
                 p.status === 'SUSPENDED' ? (lang === 'fa' ? 'معلق' : 'Suspended') : 
                 (lang === 'fa' ? 'آرشیو' : 'Archived')}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {p.channels.map(ch => <Badge key={ch} variant="info">{ch}</Badge>)}
            </div>
            {p.widget_branding && (
              <div className="text-xs text-text-muted">
                <span>{lang === 'fa' ? 'ویجت: ' : 'Widget: '}</span>
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: p.widget_branding.primary_color }} />
              </div>
            )}
            </Card>
          </div>
        ))}
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={lang === 'fa' ? 'محصول جدید' : 'New Product'}>
        <div className="space-y-4">
          <Input label={lang === 'fa' ? 'نام' : 'Name'} value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder={lang === 'fa' ? 'نام محصول' : 'Product name'} />
          <Input label={lang === 'fa' ? 'نامک' : 'Slug'} value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)} placeholder="product-slug" />
          <Select 
            label={lang === 'fa' ? 'وضعیت' : 'Status'} 
            options={[
              { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' }, 
              { value: 'SUSPENDED', label: lang === 'fa' ? 'معلق' : 'Suspended' }
            ]}
            value={status}
            onChange={setStatus}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate}>{lang === 'fa' ? 'ایجاد' : 'Create'}</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>{lang === 'fa' ? 'انصراف' : 'Cancel'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
