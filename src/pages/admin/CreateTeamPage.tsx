import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { mockStore } from '../../lib/api/mockStore';
import { useCollection, describeError } from '../../lib/api/hooks';
import { getDataApi } from '../../lib/api/dataApi';
import { isLiveMode } from '../../lib/api/config';
import { useApp } from '../../app/providers';
import type { Team } from '../../types';

export default function CreateTeamPage() {
  const { departmentId, categoryId } = useParams<{ departmentId?: string; categoryId?: string }>();
  const navigate = useNavigate();
  const { lang, showToast } = useApp();

  // Live mode loads from the API; mock mode reads the in-memory store.
  const { data: agents, loading: agentsLoading } = useCollection(
    () => mockStore.getAgents(),
    (api) => api.agents.list(),
  );
  const { data: allDepartments, loading: departmentsLoading } = useCollection(
    () => mockStore.getDepartments(),
    (api) => api.departments.list(),
  );
  const { data: allCategories, loading: categoriesLoading } = useCollection(
    () => mockStore.getCategories(),
    (api) => api.categories.list(),
  );
  const { data: allProducts, loading: productsLoading } = useCollection(
    () => mockStore.getProducts(),
    (api) => api.products.list(),
  );

  const loading = agentsLoading || departmentsLoading || categoriesLoading || productsLoading;

  // Determine scope and get parent entities
  const department = departmentId ? allDepartments.find(item => item.id === departmentId) ?? null : null;
  const category = categoryId ? allCategories.find(item => item.id === categoryId) ?? null : null;
  const product = department ? allProducts.find(item => item.id === department.product_id) ?? null : null;

  const scope = category ? 'CATEGORY' : 'DEPARTMENT';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [leadId, setLeadId] = useState('');

  if (!department && !category) {
    if (loading) return null;
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{lang === 'fa' ? 'دپارتمان یا دسته‌بندی یافت نشد' : 'Department or category not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/admin/teams')} className="mt-4">
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      showToast(lang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill all fields', 'error');
      return;
    }

    if (!leadId) {
      showToast(lang === 'fa' ? 'لطفاً سرتیم را انتخاب کنید' : 'Please select a lead', 'error');
      return;
    }

    const leadAgent = agents.find(a => a.user_id === leadId);
    if (!leadAgent) {
      showToast(lang === 'fa' ? 'کارشناس یافت نشد' : 'Agent not found', 'error');
      return;
    }

    const teamData: Partial<Team> = {
      tenant_id: department?.tenant_id || category?.tenant_id || 'ten-1',
      product_id: department?.product_id || '',
      department_id: department?.id || category?.department_id || '',
      category_id: category?.id || null,
      scope: scope as 'DEPARTMENT' | 'CATEGORY',
      name,
      slug,
      status: 'ACTIVE',
      members: [
        {
          user_id: leadId,
          user_name: leadAgent.display_name,
          role: 'LEAD',
        },
      ],
    };

    if (isLiveMode()) {
      try {
        const created = await getDataApi().teams.create(teamData);
        showToast(lang === 'fa' ? 'تیم ایجاد شد' : 'Team created', 'success');
        navigate(`/admin/teams/${created.id}`);
      } catch (error) {
        showToast(describeError(error as Error) ?? 'Create failed', 'error');
      }
      return;
    }

    const newTeam = mockStore.createTeam(teamData);

    showToast(lang === 'fa' ? 'تیم ایجاد شد' : 'Team created', 'success');
    navigate(`/admin/teams/${newTeam.id}`);
  };

  const getBreadcrumb = () => {
    if (category && department && product) {
      return (
        <>
          <Link to="/admin/products" className="hover:text-brand-600">
            {lang === 'fa' ? 'محصولات' : 'Products'}
          </Link>
          <span>/</span>
          <Link to={`/admin/products/${product.id}`} className="hover:text-brand-600">
            {product.name}
          </Link>
          <span>/</span>
          <Link to={`/admin/departments/${department.id}`} className="hover:text-brand-600">
            {department.name}
          </Link>
          <span>/</span>
          <Link to={`/admin/categories/${category.id}`} className="hover:text-brand-600">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-text">{lang === 'fa' ? 'ایجاد تیم' : 'Create Team'}</span>
        </>
      );
    } else if (department && product) {
      return (
        <>
          <Link to="/admin/products" className="hover:text-brand-600">
            {lang === 'fa' ? 'محصولات' : 'Products'}
          </Link>
          <span>/</span>
          <Link to={`/admin/products/${product.id}`} className="hover:text-brand-600">
            {product.name}
          </Link>
          <span>/</span>
          <Link to={`/admin/departments/${department.id}`} className="hover:text-brand-600">
            {department.name}
          </Link>
          <span>/</span>
          <span className="text-text">{lang === 'fa' ? 'ایجاد تیم' : 'Create Team'}</span>
        </>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        {getBreadcrumb()}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(category ? `/admin/categories/${category.id}` : `/admin/departments/${department?.id}`)} 
          className="p-1 rounded hover:bg-surface-hover"
        >
          <ChevronLeft className="h-5 w-5 flip-rtl" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {lang === 'fa' ? 'ایجاد تیم جدید' : 'Create New Team'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {scope === 'DEPARTMENT' 
              ? (lang === 'fa' ? `تیم دپارتمان: ${department?.name}` : `Department team: ${department?.name}`)
              : (lang === 'fa' ? `تیم دسته‌بندی: ${category?.name}` : `Category team: ${category?.name}`)}
          </p>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <Input 
            label={lang === 'fa' ? 'نام تیم' : 'Team Name'} 
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder={lang === 'fa' ? 'نام تیم را وارد کنید' : 'Enter team name'} 
          />
          <Input 
            label={lang === 'fa' ? 'نامک' : 'Slug'} 
            value={slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            placeholder="team-slug" 
          />
          <Select
            label={lang === 'fa' ? 'سرتیم' : 'Team Lead'}
            value={leadId}
            onChange={setLeadId}
            options={agents.map(a => ({
              value: a.user_id,
              label: a.display_name,
            }))}
          />
          
          <div className="bg-surface-alt rounded-lg p-4 text-sm">
            <p className="text-text-muted mb-2">
              {lang === 'fa' ? 'اطلاعات تیم:' : 'Team Information:'}
            </p>
            <div className="space-y-1">
              {product && (
                <p>
                  <span className="text-text-muted">{lang === 'fa' ? 'محصول: ' : 'Product: '}</span>
                  <span className="font-medium">{product.name}</span>
                </p>
              )}
              {department && (
                <p>
                  <span className="text-text-muted">{lang === 'fa' ? 'دپارتمان: ' : 'Department: '}</span>
                  <span className="font-medium">{department.name}</span>
                </p>
              )}
              {category && (
                <p>
                  <span className="text-text-muted">{lang === 'fa' ? 'دسته‌بندی: ' : 'Category: '}</span>
                  <span className="font-medium">{category.name}</span>
                </p>
              )}
              <p>
                <span className="text-text-muted">{lang === 'fa' ? 'محدوده: ' : 'Scope: '}</span>
                <span className="font-medium">
                  {scope === 'DEPARTMENT' 
                    ? (lang === 'fa' ? 'دپارتمان' : 'Department')
                    : (lang === 'fa' ? 'دسته‌بندی' : 'Category')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate}>
              {lang === 'fa' ? 'ایجاد تیم' : 'Create Team'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate(category ? `/admin/categories/${category.id}` : `/admin/departments/${department?.id}`)}
            >
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
