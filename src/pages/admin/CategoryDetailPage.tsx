import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Tag, Users } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Textarea, EmptyState, Tabs } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();
  
  useMockStore();
  const category = mockStore.getCategory(categoryId || '');
  const topics = categoryId ? mockStore.getTopicsByCategory(categoryId) : [];
  const department = category ? mockStore.getDepartment(category.department_id) : null;
  const product = department ? mockStore.getProduct(department.product_id) : null;

  const [activeTab, setActiveTab] = useState('topics');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  if (!category) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'دسته‌بندی یافت نشد' : 'Category not found'}</p>
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
    
    mockStore.createTopic({
      tenant_id: category.tenant_id,
      category_id: category.id,
      name,
      slug,
      description: description || undefined,
      status: 'ACTIVE',
      sort_order: topics.length + 1,
    });
    
    showToast(lang === 'fa' ? 'موضوع ایجاد شد' : 'Topic created', 'success');
    setShowCreate(false);
    setName('');
    setSlug('');
    setDescription('');
  };

  const tabs = [
    { id: 'topics', label: lang === 'fa' ? 'موضوعات' : 'Topics', count: topics.length },
    { id: 'teams', label: lang === 'fa' ? 'تیم‌ها' : 'Teams', count: 0 },
  ];

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/admin/products" className="hover:text-brand-600">
          {lang === 'fa' ? 'محصولات' : 'Products'}
        </Link>
        <span>/</span>
        {product && (
          <>
            <Link to={`/admin/products/${product.id}`} className="hover:text-brand-600">
              {product.name}
            </Link>
            <span>/</span>
          </>
        )}
        {department && (
          <>
            <Link to={`/admin/departments/${department.id}`} className="hover:text-brand-600">
              {department.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text">{category.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(department ? `/admin/departments/${department.id}` : '/admin/products')} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-sm text-text-muted mt-1">
              {category.description || (lang === 'fa' ? 'بدون توضیحات' : 'No description')}
            </p>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'topics' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {lang === 'fa' ? 'موضوعات' : 'Topics'}
              </h2>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" /> {lang === 'fa' ? 'موضوع جدید' : 'New Topic'}
              </Button>
            </div>

            {topics.length === 0 ? (
              <EmptyState
                icon={<Tag className="h-12 w-12 text-text-muted" />}
                title={lang === 'fa' ? 'هنوز موضوعی ثبت نشده' : 'No topics yet'}
                description={lang === 'fa' 
                  ? 'برای این دسته‌بندی هنوز موضوعی ایجاد نکرده‌اید.' 
                  : 'You haven\'t created any topics for this category yet.'}
                action={
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد موضوع' : 'Create Topic'}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {topics.map(topic => (
                  <Card key={topic.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Tag className="h-5 w-5 text-brand-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{topic.name}</h3>
                          <p className="text-xs text-text-muted font-mono mt-1">{topic.slug}</p>
                          {topic.description && (
                            <p className="text-sm text-text-secondary mt-2">{topic.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={topic.status === 'ACTIVE' ? 'success' : 'default'}>
                          {topic.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {lang === 'fa' ? 'ترتیب' : 'Order'}: {topic.sort_order}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'teams' && (
          <EmptyState
            icon={<Users className="h-12 w-12 text-text-muted" />}
            title={lang === 'fa' ? 'تیم‌ها به زودی' : 'Teams Coming Soon'}
            description={lang === 'fa' 
              ? 'مدیریت تیم‌ها در CHUNK 04 پیاده‌سازی خواهد شد.' 
              : 'Team management will be implemented in CHUNK 04.'}
          />
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={lang === 'fa' ? 'موضوع جدید' : 'New Topic'}>
        <div className="space-y-4">
          <Input 
            label={lang === 'fa' ? 'نام' : 'Name'} 
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام موضوع' : 'Topic name'} 
          />
          <Input 
            label={lang === 'fa' ? 'نامک' : 'Slug'} 
            value={slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            placeholder="topic-slug" 
          />
          <Textarea 
            label={lang === 'fa' ? 'توضیحات' : 'Description'} 
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder={lang === 'fa' ? 'توضیحات موضوع (اختیاری)' : 'Topic description (optional)'}
            rows={3}
          />
          <div className="bg-surface-alt rounded-lg p-3 text-sm">
            <p className="text-text-muted">
              {lang === 'fa' ? 'دسته‌بندی: ' : 'Category: '}
              <span className="font-medium text-text">{category.name}</span>
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
