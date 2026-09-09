import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, SearchInput, StatusBadge, EmptyState, Card, Badge } from '../../components/ui';
import { FilterBar, useTicketFilters } from '../../components/FilterBar';
import { mockStore, useMockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';
import { useCanMutate } from '../../components/ProtectedRoute';

export default function TicketListPage() {
  const { t, lang } = useApp();
  const canMutate = useCanMutate();
  const navigate = useNavigate();
  const [filters, setFilters] = useTicketFilters();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Subscribe to store changes for reactivity
  useMockStore();

  // Get tickets from mockStore (live data)
  const allTickets = mockStore.getTickets();

  // Apply search + filters
  const filtered = useMemo(() => {
    return allTickets.filter(ticket => {
      if (search && !ticket.subject.includes(search) && !ticket.ticket_number.includes(search)) return false;
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.product && ticket.product_id !== filters.product) return false;
      if (filters.category && ticket.category_id !== filters.category) return false;
      if (filters.department && ticket.department_id !== filters.department) return false;
      if (filters.team && ticket.team_id !== filters.team) return false;
      if (filters.assignee && ticket.assignee_id !== filters.assignee) return false;
      if (filters.channel && ticket.channel !== filters.channel) return false;
      if (filters.source && ticket.source !== filters.source) return false;
      if (filters.tags && !ticket.tags.some(tag => tag.includes(filters.tags!))) return false;
      if (filters.customer && !ticket.customer_name?.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (filters.date_from && new Date(ticket.created_at) < new Date(filters.date_from)) return false;
      if (filters.date_to && new Date(ticket.created_at) > new Date(filters.date_to)) return false;
      return true;
    });
  }, [allTickets, search, filters]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.nav.tickets}</h1>
        {canMutate && (
          <Button onClick={() => navigate('/desk/tickets/new')}>
            <Plus className="h-4 w-4" /> {t.ticket.create}
          </Button>
        )}
      </div>

      <Card className="mb-4 !p-4">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder={lang === 'fa' ? 'جستجو...' : 'Search...'} />
          </div>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            {lang === 'fa' ? 'فیلترها' : 'Filters'}
          </Button>
        </div>
        {showFilters && (
          <FilterBar 
            filters={filters} 
            onChange={setFilters} 
            onClear={() => setFilters({})}
            lang={lang}
          />
        )}
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'شماره' : 'Number'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'موضوع' : 'Subject'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'مشتری' : 'Customer'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'اولویت' : 'Priority'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'ارجاع' : 'Assignee'}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">SLA</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">{lang === 'fa' ? 'کانال' : 'Channel'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket.id} onClick={() => navigate(`/desk/tickets/${ticket.id}`)}
                  className="border-b border-border hover:bg-surface-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{ticket.ticket_number}</td>
                  <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                  <td className="px-4 py-3">{ticket.customer_name}</td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.priority} type="priority" /></td>
                  <td className="px-4 py-3 text-text-muted">{ticket.assignee_name || '—'}</td>
                  <td className="px-4 py-3">{ticket.sla_status ? <StatusBadge status={ticket.sla_status} type="sla" /> : '—'}</td>
                  <td className="px-4 py-3"><Badge variant="info">{t.ticket.channels[ticket.channel as keyof typeof t.ticket.channels] || ticket.channel}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState title={t.common.empty} />}
      </Card>
    </div>
  );
}
