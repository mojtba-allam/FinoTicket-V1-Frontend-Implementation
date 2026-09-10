import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { Button, Card, Badge, EmptyState, SearchInput, SegmentedControl, Select } from '../../components/ui';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { mockProducts, mockDepartments } from '../../data/mock';
import { useApp } from '../../app/providers';

export default function SearchPage() {
  const { t, lang } = useApp();
  useMockStore();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'KEYWORD' | 'SEMANTIC' | 'HYBRID'>('HYBRID');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, mode, productFilter, statusFilter, departmentFilter, dateFrom, dateTo]);

  const performSearch = () => {
    setLoading(true);
    
    const filters: any = {};
    if (productFilter) filters.product = productFilter;
    if (statusFilter) filters.status = statusFilter;
    if (departmentFilter) filters.department = departmentFilter;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;

    const searchResults = mockStore.search({
      q: query,
      mode,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    setResults(searchResults);
    setLoading(false);
  };

  const clearFilters = () => {
    setProductFilter('');
    setStatusFilter('');
    setDepartmentFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = productFilter || statusFilter || departmentFilter || dateFrom || dateTo;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t.search.title}</h1>

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <SegmentedControl
            options={[
              { value: 'KEYWORD', label: t.search.keyword },
              { value: 'SEMANTIC', label: t.search.semantic },
              { value: 'HYBRID', label: t.search.hybrid }
            ]}
            value={mode}
            onChange={(v) => setMode(v as 'KEYWORD' | 'SEMANTIC' | 'HYBRID')}
          />
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <SearchInput 
              value={query} 
              onChange={setQuery} 
              placeholder={t.search.placeholder} 
            />
          </div>
          {query && (
            <Button variant="ghost" onClick={() => setQuery('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-border">
          <Select
            label={lang === 'fa' ? 'محصول' : 'Product'}
            value={productFilter}
            onChange={setProductFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه' : 'All' },
              ...mockProducts.map(p => ({ value: p.id, label: p.name }))
            ]}
          />
          <Select
            label={lang === 'fa' ? 'وضعیت' : 'Status'}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه' : 'All' },
              { value: 'OPEN', label: lang === 'fa' ? 'باز' : 'Open' },
              { value: 'IN_PROGRESS', label: lang === 'fa' ? 'در حال بررسی' : 'In Progress' },
              { value: 'RESOLVED', label: lang === 'fa' ? 'حل شده' : 'Resolved' },
              { value: 'CLOSED', label: lang === 'fa' ? 'بسته' : 'Closed' },
            ]}
          />
          <Select
            label={lang === 'fa' ? 'دپارتمان' : 'Department'}
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={[
              { value: '', label: lang === 'fa' ? 'همه' : 'All' },
              ...mockDepartments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {lang === 'fa' ? 'از تاریخ' : 'From Date'}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {lang === 'fa' ? 'تا تاریخ' : 'To Date'}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              {lang === 'fa' ? 'پاک کردن فیلترها' : 'Clear Filters'}
            </Button>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {t.search.results}: {results.length}
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="animate-spin h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full" />
              {lang === 'fa' ? 'در حال جستجو...' : 'Searching...'}
            </div>
          )}
        </div>
        {results.map(r => (
          <div key={r.id} onClick={() => navigate(r.url)} className="cursor-pointer">
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={r.type === 'ticket' ? 'info' : r.type === 'article' ? 'brand' : 'success'}>
                      {r.type === 'ticket' ? (lang === 'fa' ? 'تیکت' : 'Ticket') : 
                       r.type === 'article' ? (lang === 'fa' ? 'مقاله' : 'Article') : 
                       (lang === 'fa' ? 'مشتری' : 'Customer')}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {lang === 'fa' ? 'امتیاز' : 'Score'}: {Math.round(r.score * 100)}%
                    </span>
                    {r.mode_score && (
                      <Badge variant="default" className="text-xs">
                        {mode === 'KEYWORD' && r.mode_score.keyword && `${lang === 'fa' ? 'کلمه‌ای' : 'Keyword'}: ${Math.round(r.mode_score.keyword * 100)}%`}
                        {mode === 'SEMANTIC' && r.mode_score.semantic && `${lang === 'fa' ? 'معنایی' : 'Semantic'}: ${Math.round(r.mode_score.semantic * 100)}%`}
                        {mode === 'HYBRID' && r.mode_score.hybrid && `${lang === 'fa' ? 'ترکیبی' : 'Hybrid'}: ${Math.round(r.mode_score.hybrid * 100)}%`}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{r.title}</h3>
                  <p className="text-sm text-text-muted">{r.snippet}</p>
                </div>
              </div>
            </Card>
          </div>
        ))}
        {results.length === 0 && !loading && <EmptyState title={t.search.no_results} />}
      </div>
    </div>
  );
}
