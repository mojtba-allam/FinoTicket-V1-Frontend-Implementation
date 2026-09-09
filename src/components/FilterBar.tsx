import React from 'react';
import { X } from 'lucide-react';
import { Button, Select, Badge } from './ui';
import { mockProducts, mockCategories, mockDepartments, mockTeams, mockAgents } from '../data/mock';
import { fa } from '../i18n';

interface FilterBarProps {
  filters: {
    status?: string;
    priority?: string;
    product?: string;
    category?: string;
    department?: string;
    team?: string;
    assignee?: string;
    channel?: string;
  };
  onChange: (filters: FilterBarProps['filters']) => void;
  onClear: () => void;
}

export function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
  const hasFilters = Object.values(filters).some(v => v);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">{fa.common.filter}</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
            پاک کردن
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          label="وضعیت"
          options={[
            { value: '', label: 'همه' },
            ...Object.entries(fa.ticket.statuses).map(([k, v]) => ({ value: k, label: v }))
          ]}
          value={filters.status || ''}
          onChange={v => updateFilter('status', v)}
        />

        <Select
          label="اولویت"
          options={[
            { value: '', label: 'همه' },
            ...Object.entries(fa.ticket.priorities).map(([k, v]) => ({ value: k, label: v }))
          ]}
          value={filters.priority || ''}
          onChange={v => updateFilter('priority', v)}
        />

        <Select
          label="محصول"
          options={[
            { value: '', label: 'همه' },
            ...mockProducts.map(p => ({ value: p.id, label: p.name }))
          ]}
          value={filters.product || ''}
          onChange={v => updateFilter('product', v)}
        />

        <Select
          label="دسته‌بندی"
          options={[
            { value: '', label: 'همه' },
            ...mockCategories.map(c => ({ value: c.id, label: c.name }))
          ]}
          value={filters.category || ''}
          onChange={v => updateFilter('category', v)}
        />

        <Select
          label="دپارتمان"
          options={[
            { value: '', label: 'همه' },
            ...mockDepartments.map(d => ({ value: d.id, label: d.name }))
          ]}
          value={filters.department || ''}
          onChange={v => updateFilter('department', v)}
        />

        <Select
          label="تیم"
          options={[
            { value: '', label: 'همه' },
            ...mockTeams.map(t => ({ value: t.id, label: t.name }))
          ]}
          value={filters.team || ''}
          onChange={v => updateFilter('team', v)}
        />

        <Select
          label="ارجاع به"
          options={[
            { value: '', label: 'همه' },
            ...mockAgents.map(a => ({ value: a.user_id, label: a.display_name }))
          ]}
          value={filters.assignee || ''}
          onChange={v => updateFilter('assignee', v)}
        />

        <Select
          label="کانال"
          options={[
            { value: '', label: 'همه' },
            ...Object.entries(fa.ticket.channels).map(([k, v]) => ({ value: k, label: v }))
          ]}
          value={filters.channel || ''}
          onChange={v => updateFilter('channel', v)}
        />
      </div>

      {hasFilters && (
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="brand">
              وضعیت: {fa.ticket.statuses[filters.status as keyof typeof fa.ticket.statuses]}
              <button onClick={() => updateFilter('status', '')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="brand">
              اولویت: {fa.ticket.priorities[filters.priority as keyof typeof fa.ticket.priorities]}
              <button onClick={() => updateFilter('priority', '')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.product && (
            <Badge variant="brand">
              محصول: {mockProducts.find(p => p.id === filters.product)?.name}
              <button onClick={() => updateFilter('product', '')} className="mr-1 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
