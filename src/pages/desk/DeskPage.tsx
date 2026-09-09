import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Inbox } from 'lucide-react';
import { Button, SearchInput, Tabs, StatusBadge, EmptyState, Card } from '../../components/ui';
import { FilterBar, useTicketFilters, type TicketFilters } from '../../components/FilterBar';
import { mockStore } from '../../lib/api/mockStore';
import { useApp } from '../../app/providers';

export default function DeskPage() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useTicketFilters();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get tickets from mockStore (live data)
  const allTickets = mockStore.getTickets();

  // Apply tab filter
  const tabFiltered = useMemo(() => {
    return allTickets.filter(ticket => {
      if (activeTab === 'my' && ticket.assignee_id !== 'u-001') return false;
      if (activeTab === 'unassigned' && ticket.assignee_id) return false;
      if (activeTab === 'watching' && !ticket.watchers.includes('u-001')) return false;
      if (activeTab === 'sla' && ticket.sla_status !== 'WARNING' && ticket.sla_status !== 'BREACHED') return false;
      return true;
    });
  }, [allTickets, activeTab]);

  // Apply search + filters
  const filtered = useMemo(() => {
    return tabFiltered.filter(ticket => {
      if (search && !ticket.subject.includes(search) && !ticket.ticket_number.includes(search)) return false;
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.product && ticket.product_id !== filters.product) return false;
      if (filters.category && ticket.category_id !== filters.category) return false;
      if (filters.department && ticket.department_id !== filters.department) return false;
      if (filters.team && ticket.team_id !== filters.team) return false;
      if (filters.assignee && ticket.assignee_id !== filters.assignee) return false;
      if (filters.channel && ticket.channel !== filters.channel) return false;
      return true;
    });
  }, [tabFiltered, search, filters]);

  const tabs = [
    { id: 'all', label: lang === 'fa' ? 'همه' : 'All', count: allTickets.length },
    { id: 'my', label: lang === 'fa' ? 'تیکت‌های من' : 'My Tickets', count: allTickets.filter(t => t.assignee_id === 'u-001').length },
    { id: 'unassigned', label: lang === 'fa' ? 'ارجاع نشده' : 'Unassigned', count: allTickets.filter(t => !t.assignee_id).length },
    { id: 'watching', label: lang === 'fa' ? 'تحت نظر' : 'Watching', count: allTickets.filter(t => t.watchers.includes('u-001')).length },
    { id: 'sla', label: lang === 'fa' ? 'ریسک SLA' : 'SLA Risk', count: allTickets.filter(t => t.sla_status === 'WARNING' || t.sla_status === 'BREACHED').length },
  ];

  return (
    <div className="flex h-full">
      {/* Ticket List */}
      <div className="w-96 border-l border-border bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t.nav.inbox}</h2>
            <Button size="sm" onClick={() => navigate('/desk/tickets/new')}>
              <Plus className="h-4 w-4" /> {lang === 'fa' ? 'جدید' : 'New'}
            </Button>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder={lang === 'fa' ? 'جستجوی تیکت...' : 'Search tickets...'} />
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            {lang === 'fa' ? 'فیلترها' : 'Filters'}
          </Button>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-border bg-surface-alt">
            <FilterBar 
              filters={filters} 
              onChange={setFilters} 
              onClear={() => setFilters({})}
              lang={lang}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState 
              icon={<Inbox className="h-12 w-12 text-text-muted mb-4" />}
              title={lang === 'fa' ? 'تیکتی یافت نشد' : 'No tickets found'} 
              description={lang === 'fa' ? 'فیلترها را تغییر دهید یا تیکت جدید ایجاد کنید' : 'Try adjusting filters or create a new ticket'}
            />
          ) : (
            filtered.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => navigate(`/desk/tickets/${ticket.id}`)}
                className="px-4 py-3 border-b border-border hover:bg-surface-hover cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted">{ticket.ticket_number}</span>
                    <StatusBadge status={ticket.priority} type="priority" />
                  </div>
                  {ticket.sla_status && <StatusBadge status={ticket.sla_status} type="sla" />}
                </div>
                <p className="text-sm font-medium truncate mb-1">{ticket.subject}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{ticket.customer_name}</span>
                  <span>•</span>
                  <span>{ticket.product_name}</span>
                  {ticket.assignee_name && <><span>•</span><span>{ticket.assignee_name}</span></>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex items-center justify-center bg-surface-alt">
        <EmptyState 
          icon={<Inbox className="h-16 w-16 text-text-muted mb-4" />}
          title={lang === 'fa' ? 'یک تیکت را انتخاب کنید' : 'Select a ticket'} 
          description={lang === 'fa' ? 'برای مشاهده جزئیات، روی یکی از تیکت‌ها کلیک کنید' : 'Click on a ticket to view details'}
        />
      </div>
    </div>
  );
}
