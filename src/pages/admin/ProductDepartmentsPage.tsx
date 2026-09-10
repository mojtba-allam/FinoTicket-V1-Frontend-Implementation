import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Building2 } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Textarea, EmptyState } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function ProductDepartmentsPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();
  
  useMockStore();
  const product = mockStore.getProduct(productId || '');
  const departments = productId ? mockStore.getDepartmentsByProduct(productId) : [];

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'محصول یافت نشد' : 'Product not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/admin/products')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    if (!name.trim() || !slug.trim()) {
      showToast(lang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill all fields', 'error');
      return;
    }
    
    mockStore.createDepartment({
      tenant_id: product.tenant_id,
      product_id: product.id,
      name,
      slug,
      description: description || undefined,
      status: 'ACTIVE',
    });
    
    showToast(lang === 'fa' ? 'دپارتمان ایجاد شد' : 'Department created', 'success');
    setShowCreate(false);
    setName('');
    setSlug('');
    setDescription('');
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/admin/products" className="hover:text-brand-600">
          {lang === 'fa' ? 'محصولات' : 'Products'}
        </Link>
        <span>/</span>
        <Link to={`/admin/products/${product.id}`} className="hover:text-brand-600">
          {product.name}
        </Link>
        <span>/</span>
        <span className="text-text">{lang === 'fa' ? 'دپارتمان‌ها' : 'Departments'}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/admin/products/${product.id}`)} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {lang === 'fa' ? 'دپارتمان‌های' : 'Departments of'} {product.name}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {lang === 'fa' 
                ? `${departments.length} دپارتمان ثبت شده` 
                : `${departments.length} department${departments.length !== 1 ? 's' : ''} registered`}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'دپارتمان جدید' : 'New Department'}
        </Button>
      </div>

      {departments.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-text-muted" />}
          title={lang === 'fa' ? 'هنوز دپارتمانی ثبت نشده' : 'No departments yet'}
          description={lang === 'fa' 
            ? 'برای این محصول هنوز دپارتمانی ایجاد نکرده‌اید. اولین دپارتمان را ایجاد کنید.' 
            : 'You haven\'t created any departments for this product yet. Create your first department.'}
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد دپارتمان' : 'Create Department'}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {departments.map(dept => (
            <Card key={dept.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-brand-500" />
                  <div>
                    <h3 className="font-semibold">{dept.name}</h3>
                    <p className="text-xs text-text-muted font-mono">{dept.slug}</p>
                  </div>
                </div>
                <Badge variant={dept.status === 'ACTIVE' ? 'success' : 'default'}>
                  {dept.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                </Badge>
              </div>
              {dept.description && (
                <p className="text-sm text-text-secondary mt-2">{dept.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={lang === 'fa' ? 'دپارتمان جدید' : 'New Department'}>
        <div className="space-y-4">
          <Input 
            label={lang === 'fa' ? 'نام' : 'Name'} 
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام دپارتمان' : 'Department name'} 
          />
          <Input 
            label={lang === 'fa' ? 'نامک' : 'Slug'} 
            value={slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            placeholder="department-slug" 
          />
          <Textarea 
            label={lang === 'fa' ? 'توضیحات' : 'Description'} 
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder={lang === 'fa' ? 'توضیحات دپارتمان (اختیاری)' : 'Department description (optional)'}
            rows={3}
          />
          <div className="bg-surface-alt rounded-lg p-3 text-sm">
            <p className="text-text-muted">
              {lang === 'fa' ? 'محصول: ' : 'Product: '}
              <span className="font-medium text-text">{product.name}</span>
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate}>{lang === 'fa' ? 'ایجاد' : 'Create'}</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>{lang === 'fa' ? 'انصراف' : 'Cancel'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
