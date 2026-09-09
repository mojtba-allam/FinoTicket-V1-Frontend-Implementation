import React, { useState } from 'react';
import { Tags, Plus } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Select } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function AdminCategoriesPage() {
  const { t, lang, showToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  useMockStore();
  const categories = mockStore.getCategories();

  const handleCreate = () => {
    if (!name.trim() || !slug.trim()) {
      showToast(lang === 'fa' ? 'لطفاً نام و نامک را وارد کنید' : 'Please enter name and slug', 'error');
      return;
    }

    if (editingCategory) {
      mockStore.updateCategory(editingCategory.id, {
        name,
        slug,
        description,
        parent_id: parentId || undefined,
        status: status as any,
      });
      showToast(lang === 'fa' ? 'دسته‌بندی بروزرسانی شد' : 'Category updated', 'success');
    } else {
      mockStore.createCategory({
        name,
        slug,
        description,
        parent_id: parentId || undefined,
        status: status as any,
      });
      showToast(lang === 'fa' ? 'دسته‌بندی ایجاد شد' : 'Category created', 'success');
    }

    resetForm();
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setStatus('ACTIVE');
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parent_id || '');
    setStatus(cat.status);
    setShowCreate(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.admin.categories}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {lang === 'fa' ? 'دسته‌بندی جدید' : 'New Category'}
        </Button>
      </div>
      <Card padding={false}>
        <div className="p-4 space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className="border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(cat)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Tags className="h-5 w-5 text-brand-500" />
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-text-muted font-mono">{cat.slug}</span>
                </div>
                <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'default'}>
                  {cat.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                </Badge>
              </div>
              {cat.children && cat.children.length > 0 && (
                <div className="mr-8 mt-2 space-y-1.5">
                  {cat.children.map(child => (
                    <div key={child.id} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1 h-1 rounded-full bg-text-muted" />
                      <span>{child.name}</span>
                      <span className="text-xs text-text-muted font-mono">{child.slug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showCreate} onClose={resetForm} title={editingCategory ? (lang === 'fa' ? 'ویرایش دسته‌بندی' : 'Edit Category') : (lang === 'fa' ? 'دسته‌بندی جدید' : 'New Category')}>
        <div className="space-y-4">
          <Input 
            label={lang === 'fa' ? 'نام' : 'Name'} 
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام دسته‌بندی' : 'Category name'} 
          />
          <Input 
            label={lang === 'fa' ? 'نامک' : 'Slug'} 
            value={slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            placeholder="category-slug" 
          />
          <Input 
            label={lang === 'fa' ? 'توضیحات' : 'Description'} 
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            placeholder={lang === 'fa' ? 'توضیحات دسته‌بندی' : 'Category description'} 
          />
          <Select 
            label={lang === 'fa' ? 'دسته‌بندی والد' : 'Parent Category'} 
            options={[
              { value: '', label: lang === 'fa' ? 'بدون والد' : 'No parent' },
              ...categories.filter(c => c.id !== editingCategory?.id).map(c => ({ value: c.id, label: c.name }))
            ]}
            value={parentId}
            onChange={setParentId}
          />
          <Select 
            label={lang === 'fa' ? 'وضعیت' : 'Status'} 
            options={[
              { value: 'ACTIVE', label: lang === 'fa' ? 'فعال' : 'Active' },
              { value: 'INACTIVE', label: lang === 'fa' ? 'غیرفعال' : 'Inactive' },
            ]}
            value={status}
            onChange={setStatus}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate}>
              {editingCategory ? (lang === 'fa' ? 'بروزرسانی' : 'Update') : (lang === 'fa' ? 'ایجاد' : 'Create')}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
