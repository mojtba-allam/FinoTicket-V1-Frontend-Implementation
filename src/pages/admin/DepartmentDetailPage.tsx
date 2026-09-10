import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Plus, FolderTree, Users, UserCheck } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Textarea, EmptyState, Tabs } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function DepartmentDetailPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();
  
  useMockStore();
  const department = mockStore.getDepartment(departmentId || '');
  const categories = departmentId ? mockStore.getCategoriesByDepartment(departmentId) : [];
  const product = department ? mockStore.getProduct(department.product_id) : null;
  const departmentTeams = departmentId ? mockStore.getTeamsByDepartment(departmentId) : [];
  const agents = mockStore.getAgents();

  const [activeTab, setActiveTab] = useState('categories');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const getAgentName = (userId: string) => {
    const agent = agents.find(a => a.user_id === userId);
    return agent?.display_name || userId;
  };

  if (!department) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'دپارتمان یافت نشد' : 'Department not found'}</p>
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
    
    mockStore.createCategory({
      tenant_id: department.tenant_id,
      department_id: department.id,
      name,
      slug,
      description: description || undefined,
      status: 'ACTIVE',
      sort_order: categories.length + 1,
    });
    
    showToast(lang === 'fa' ? 'دسته‌بندی ایجاد شد' : 'Category created', 'success');
    setShowCreate(false);
    setName('');
    setSlug('');
    setDescription('');
  };

  const tabs = [
    { id: 'categories', label: lang === 'fa' ? 'دسته‌بندی‌ها' : 'Categories', count: categories.length },
    { id: 'teams', label: lang === 'fa' ? 'تیم‌ها' : 'Teams', count: departmentTeams.length },
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
            <Link to={`/admin/products/${product.id}/departments`} className="hover:text-brand-600">
              {lang === 'fa' ? 'دپارتمان‌ها' : 'Departments'}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text">{department.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(product ? `/admin/products/${product.id}/departments` : '/admin/products')} className="p-1 rounded hover:bg-surface-hover">
            <ChevronLeft className="h-5 w-5 flip-rtl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{department.name}</h1>
            <p className="text-sm text-text-muted mt-1">
              {department.description || (lang === 'fa' ? 'بدون توضیحات' : 'No description')}
            </p>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'categories' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {lang === 'fa' ? 'دسته‌بندی‌ها' : 'Categories'}
              </h2>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" /> {lang === 'fa' ? 'دسته‌بندی جدید' : 'New Category'}
              </Button>
            </div>

            {categories.length === 0 ? (
              <EmptyState
                icon={<FolderTree className="h-12 w-12 text-text-muted" />}
                title={lang === 'fa' ? 'هنوز دسته‌بندی‌ای ثبت نشده' : 'No categories yet'}
                description={lang === 'fa' 
                  ? 'برای این دپارتمان هنوز دسته‌بندی ایجاد نکرده‌اید.' 
                  : 'You haven\'t created any categories for this department yet.'}
                action={
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد دسته‌بندی' : 'Create Category'}
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/categories/${cat.id}`)}>
                    <Card>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FolderTree className="h-5 w-5 text-brand-500" />
                          <div>
                            <h3 className="font-semibold">{cat.name}</h3>
                            <p className="text-xs text-text-muted font-mono">{cat.slug}</p>
                          </div>
                        </div>
                        <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'default'}>
                          {cat.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                        </Badge>
                      </div>
                      {cat.description && (
                        <p className="text-sm text-text-secondary mt-2">{cat.description}</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-text-muted">
                          {lang === 'fa' ? 'برای مشاهده موضوعات کلیک کنید' : 'Click to view topics'}
                        </p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'teams' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {lang === 'fa' ? 'تیم‌های دپارتمان' : 'Department Teams'}
              </h2>
              <Button onClick={() => navigate(`/admin/departments/${departmentId}/teams/create`)}>
                <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد تیم' : 'Create Team'}
              </Button>
            </div>

            {departmentTeams.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12 text-text-muted" />}
                title={lang === 'fa' ? 'هنوز تیمی ثبت نشده' : 'No teams yet'}
                description={lang === 'fa' 
                  ? 'برای این دپارتمان هنوز تیمی ایجاد نکرده‌اید.' 
                  : 'You haven\'t created any teams for this department yet.'}
                action={
                  <Button onClick={() => navigate(`/admin/departments/${departmentId}/teams/create`)}>
                    <Plus className="h-4 w-4" /> {lang === 'fa' ? 'ایجاد تیم' : 'Create Team'}
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {departmentTeams.map(team => {
                  const lead = team.members.find(m => m.role === 'LEAD');
                  const leadName = lead ? getAgentName(lead.user_id) : null;
                  
                  return (
                    <div 
                      key={team.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/admin/teams/${team.id}`)}
                    >
                      <Card>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-brand-500" />
                            <div>
                              <h3 className="font-semibold">{team.name}</h3>
                              <p className="text-xs text-text-muted font-mono">{team.slug}</p>
                            </div>
                          </div>
                          <Badge variant={team.status === 'ACTIVE' ? 'success' : 'default'}>
                            {team.status === 'ACTIVE' ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}
                          </Badge>
                        </div>
                        <div className="space-y-2 mt-3 pt-3 border-t border-border">
                          {leadName && (
                            <div className="flex items-center gap-2 text-sm">
                              <UserCheck className="h-4 w-4 text-warning-500" />
                              <span className="text-text-muted">{lang === 'fa' ? 'سرتیم:' : 'Lead:'}</span>
                              <span className="font-medium">{leadName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-text-muted" />
                            <span className="text-text-muted">{lang === 'fa' ? 'اعضا:' : 'Members:'}</span>
                            <span className="font-medium">{team.members.length}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={lang === 'fa' ? 'دسته‌بندی جدید' : 'New Category'}>
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
          <Textarea 
            label={lang === 'fa' ? 'توضیحات' : 'Description'} 
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder={lang === 'fa' ? 'توضیحات دسته‌بندی (اختیاری)' : 'Category description (optional)'}
            rows={3}
          />
          <div className="bg-surface-alt rounded-lg p-3 text-sm">
            <p className="text-text-muted">
              {lang === 'fa' ? 'دپارتمان: ' : 'Department: '}
              <span className="font-medium text-text">{department.name}</span>
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
