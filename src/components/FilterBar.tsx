import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button, Select, Badge } from './ui';
import { mockProducts, mockCategories, mockDepartments, mockTeams, mockAgents } from '../data/mock';
import { fa, en, type Lang } from '../i18n';

export interface TicketFilters {
  status?: string;
  priority?: string;
  product?: string;
  category?: string;
  department?: string;
  team?: string;
  assignee?: string;
  channel?: string;
  tags?: string;
  customer?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
}

interface FilterBarProps {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
  onClear: () => void;
  lang?: Lang;
}

export function FilterBar({ filters, onChange, onClear, lang = 'fa' }: FilterBarProps) {
  const t = lang === 'fa' ? fa : en;
  const hasFilters = Object.values(filters).some(v => v);

  const updateFilter = (key: keyof TicketFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const removeFilter = (key: keyof TicketFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">{t.common.filter}</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
            {lang === 'fa' ? 'پاک کردن' : 'Clear'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          label={lang === 'fa' ? 'وضعیت' : 'Status'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...Object.entries(t.ticket.statuses).map(([k, v]) => ({ value: k, label: v }))
          ]}
          value={filters.status || ''}
          onChange={v => updateFilter('status', v)}
        />

        <Select
          label={lang === 'fa' ? 'اولویت' : 'Priority'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...Object.entries(t.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))
          ]}
          value={filters.priority || ''}
          onChange={v => updateFilter('priority', v)}
        />

        <Select
          label={lang === 'fa' ? 'محصول' : 'Product'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...mockProducts.map(p => ({ value: p.id, label: p.name }))
          ]}
          value={filters.product || ''}
          onChange={v => updateFilter('product', v)}
        />

        <Select
          label={lang === 'fa' ? 'دسته‌بندی' : 'Category'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...mockCategories.map(c => ({ value: c.id, label: c.name }))
          ]}
          value={filters.category || ''}
          onChange={v => updateFilter('category', v)}
        />

        <Select
          label={lang === 'fa' ? 'دپارتمان' : 'Department'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...mockDepartments.map(d => ({ value: d.id, label: d.name }))
          ]}
          value={filters.department || ''}
          onChange={v => updateFilter('department', v)}
        />

        <Select
          label={lang === 'fa' ? 'تیم' : 'Team'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...mockTeams.map(t => ({ value: t.id, label: t.name }))
          ]}
          value={filters.team || ''}
          onChange={v => updateFilter('team', v)}
        />

        <Select
          label={lang === 'fa' ? 'ارجاع به' : 'Assignee'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))
          ]}
          value={filters.assignee || ''}
          onChange={v => updateFilter('assignee', v)}
        />

        <Select
          label={lang === 'fa' ? 'کانال' : 'Channel'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            ...Object.entries(t.ticket.channels).map(([k, v]) => ({ value: k, label: v }))
          ]}
          value={filters.channel || ''}
          onChange={v => updateFilter('channel', v)}
        />

        <Select
          label={lang === 'fa' ? 'منبع' : 'Source'}
          options={[
            { value: '', label: lang === 'fa' ? 'همه' : 'All' },
            { value: 'web', label: 'Web' },
            { value: 'email', label: 'Email' },
            { value: 'widget', label: 'Widget' },
            { value: 'api', label: 'API' },
            { value: 'phone', label: 'Phone' }
          ]}
          value={filters.source || ''}
          onChange={v => updateFilter('source', v)}
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {lang === 'fa' ? 'برچسب‌ها' : 'Tags'}
          </label>
          <input
            type="text"
            value={filters.tags || ''}
            onChange={e => updateFilter('tags', e.target.value)}
            placeholder={lang === 'fa' ? 'جستجوی برچسب...' : 'Search tags...'}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {lang === 'fa' ? 'مشتری' : 'Customer'}
          </label>
          <input
            type="text"
            value={filters.customer || ''}
            onChange={e => updateFilter('customer', e.target.value)}
            placeholder={lang === 'fa' ? 'جستجوی مشتری...' : 'Search customer...'}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {lang === 'fa' ? 'از تاریخ' : 'From Date'}
          </label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={e => updateFilter('date_from', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {lang === 'fa' ? 'تا تاریخ' : 'To Date'}
          </label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={e => updateFilter('date_to', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="brand">
              {lang === 'fa' ? 'وضعیت' : 'Status'}: {t.ticket.statuses[filters.status as keyof typeof t.ticket.statuses]}
              <button onClick={() => removeFilter('status')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="brand">
              {lang === 'fa' ? 'اولویت' : 'Priority'}: {t.ticket.priorities[filters.priority as keyof typeof t.ticket.priorities]}
              <button onClick={() => removeFilter('priority')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.product && (
            <Badge variant="brand">
              {lang === 'fa' ? 'محصول' : 'Product'}: {mockProducts.find(p => p.id === filters.product)?.name}
              <button onClick={() => removeFilter('product')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="brand">
              {lang === 'fa' ? 'دسته' : 'Category'}: {mockCategories.find(c => c.id === filters.category)?.name}
              <button onClick={() => removeFilter('category')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.department && (
            <Badge variant="brand">
              {lang === 'fa' ? 'دپارتمان' : 'Department'}: {mockDepartments.find(d => d.id === filters.department)?.name}
              <button onClick={() => removeFilter('department')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.assignee && (
            <Badge variant="brand">
              {lang === 'fa' ? 'ارجاع به' : 'Assignee'}: {mockAgents.find(a => a.user_id === filters.assignee)?.display_name}
              <button onClick={() => removeFilter('assignee')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.channel && (
            <Badge variant="brand">
              {lang === 'fa' ? 'کانال' : 'Channel'}: {t.ticket.channels[filters.channel as keyof typeof t.ticket.channels]}
              <button onClick={() => removeFilter('channel')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.source && (
            <Badge variant="brand">
              {lang === 'fa' ? 'منبع' : 'Source'}: {filters.source}
              <button onClick={() => removeFilter('source')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.tags && (
            <Badge variant="brand">
              {lang === 'fa' ? 'برچسب' : 'Tag'}: {filters.tags}
              <button onClick={() => removeFilter('tags')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.customer && (
            <Badge variant="brand">
              {lang === 'fa' ? 'مشتری' : 'Customer'}: {filters.customer}
              <button onClick={() => removeFilter('customer')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.date_from && (
            <Badge variant="brand">
              {lang === 'fa' ? 'از' : 'From'}: {filters.date_from}
              <button onClick={() => removeFilter('date_from')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.date_to && (
            <Badge variant="brand">
              {lang === 'fa' ? 'تا' : 'To'}: {filters.date_to}
              <button onClick={() => removeFilter('date_to')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for URL-synced filters
export function useTicketFilters(): [TicketFilters, (filters: TicketFilters) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TicketFilters = {
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    product: searchParams.get('product') || undefined,
    category: searchParams.get('category') || undefined,
    department: searchParams.get('department') || undefined,
    team: searchParams.get('team') || undefined,
    assignee: searchParams.get('assignee') || undefined,
    channel: searchParams.get('channel') || undefined,
    tags: searchParams.get('tags') || undefined,
    customer: searchParams.get('customer') || undefined,
  };

  const setFilters = (newFilters: TicketFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  return [filters, setFilters];
}
