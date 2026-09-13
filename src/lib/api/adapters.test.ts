import { describe, expect, it } from 'vitest';
import {
  toAnalyticsData,
  toArticle,
  toCustomer,
  toCustomerIdentity,
  toKnowledgeBase,
  toMessage,
  toNotification,
  toSearchResult,
  toSlaPolicy,
  toTeam,
  toTenant,
  toTicket,
  toTickets,
  toTopic,
} from './adapters';
import { userFromScopes } from './session';
import type { TicketDto } from './dto';

function ticketDto(overrides: Partial<TicketDto> = {}): TicketDto {
  return {
    id: '01a0-ticket',
    ticket_number: 'FT-1001',
    subject: 'پرینتر کار نمی‌کند',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-02T08:00:00Z',
    ...overrides,
  } as TicketDto;
}

describe('ticket adapter', () => {
  it('maps DTO fields into the UI ticket shape', () => {
    const ticket = toTicket(
      ticketDto({
        customer_id: '01a0-customer',
        assigned_user_id: '01a0-agent',
        department_id: '01a0-dept',
        category_id: '01a0-cat',
        topic_id: '01a0-topic',
        channel: 'WIDGET',
        source: 'WEB',
      }),
    );

    expect(ticket.id).toBe('01a0-ticket');
    expect(ticket.status).toBe('IN_PROGRESS');
    expect(ticket.priority).toBe('HIGH');
    expect(ticket.customer_id).toBe('01a0-customer');
    expect(ticket.assignee_id).toBe('01a0-agent');
    expect(ticket.department_id).toBe('01a0-dept');
    expect(ticket.category_id).toBe('01a0-cat');
    expect(ticket.topic_id).toBe('01a0-topic');
    expect(ticket.channel).toBe('WIDGET');
  });

  it('falls back to safe defaults for unknown enum values', () => {
    const ticket = toTicket(
      ticketDto({ status: 'WEIRD' as never, priority: 'SUPER' as never, channel: 'FAX' as never }),
    );

    expect(ticket.status).toBe('OPEN');
    expect(ticket.priority).toBe('NORMAL');
    expect(ticket.channel).toBe('API');
  });

  it('derives SLA breach from sla_breached_at', () => {
    const ticket = toTicket(ticketDto({ sla_breached_at: '2026-09-01T10:00:00Z' }));
    expect(ticket.sla_status).toBe('BREACHED');
  });

  it('derives SLA warning when the deadline is inside 30 minutes', () => {
    const soon = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    expect(toTicket(ticketDto({ resolve_due_at: soon })).sla_status).toBe('WARNING');
  });

  it('derives SLA on-track when the deadline is far away', () => {
    const later = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    expect(toTicket(ticketDto({ resolve_due_at: later })).sla_status).toBe('ON_TRACK');
  });

  it('leaves SLA undefined when no deadlines exist', () => {
    expect(toTicket(ticketDto()).sla_status).toBeUndefined();
  });

  it('maps a collection', () => {
    expect(toTickets([ticketDto(), ticketDto({ id: 'second' })])).toHaveLength(2);
  });
});

describe('message adapter', () => {
  it('maps a customer reply', () => {
    const message = toMessage(
      {
        id: 'm-1',
        sender_type: 'CUSTOMER',
        body: 'سلام',
        created_at: '2026-09-01T09:00:00Z',
      },
      't-1',
    );

    expect(message.ticket_id).toBe('t-1');
    expect(message.sender_type).toBe('CUSTOMER');
    expect(message.is_internal).toBe(false);
  });

  it('treats NOTE messages as internal', () => {
    const message = toMessage(
      { id: 'm-2', body: 'یادداشت داخلی', message_type: 'NOTE' },
      't-1',
    );

    expect(message.is_internal).toBe(true);
  });

  it('defaults an unknown sender type to AGENT', () => {
    const message = toMessage({ id: 'm-3', body: 'x', sender_type: 'ROBOT' }, 't-1');
    expect(message.sender_type).toBe('AGENT');
  });
});

describe('customer adapter', () => {
  it('maps profile and identities', () => {
    const customer = toCustomer({
      id: 'c-1',
      display_name: 'سارا احمدی',
      status: 'ACTIVE',
      profile: { first_name: 'سارا', mobile: '09120000000' },
      identities: [
        { id: 'i-1', provider: 'FINOID', provider_user_id: 'finoid-1', verification_status: 'VERIFIED' },
      ],
      created_at: '2026-01-01T00:00:00Z',
    });

    expect(customer.profile.first_name).toBe('سارا');
    expect(customer.identities[0].verification_status).toBe('VERIFIED');
    expect(customer.addresses).toEqual([]);
  });

  it('normalizes an unknown identity verification status', () => {
    expect(
      toCustomerIdentity({ id: 'i-2', provider: 'EXTERNAL', verification_status: 'MAYBE' })
        .verification_status,
    ).toBe('UNVERIFIED');
  });

  it('normalizes an unknown customer status to ACTIVE', () => {
    expect(toCustomer({ id: 'c-2', display_name: 'x', status: 'ZOMBIE' }).status).toBe('ACTIVE');
  });
});

describe('org hierarchy adapters', () => {
  it('maps a category-scoped team', () => {
    const team = toTeam({
      id: 'tm-1',
      name: 'تیم فنی',
      slug: 'tech',
      department_id: 'd-1',
      category_id: 'cat-1',
      scope: 'CATEGORY',
      members: [{ user_id: 'u-1', user_name: 'حسن', role: 'LEAD' }],
    });

    expect(team.scope).toBe('CATEGORY');
    expect(team.category_id).toBe('cat-1');
    expect(team.members[0].role).toBe('LEAD');
  });

  it('defaults an unknown team scope to DEPARTMENT', () => {
    expect(toTeam({ id: 'tm-2', name: 'x', slug: 'x', scope: 'SQUAD' }).scope).toBe('DEPARTMENT');
  });

  it('maps a topic including its category parent', () => {
    const topic = toTopic({ id: 'tp-1', name: 'شبکه', slug: 'network', category_id: 'cat-9' });
    expect(topic.category_id).toBe('cat-9');
    expect(topic.sort_order).toBe(0);
  });

  it('maps an SLA policy', () => {
    const policy = toSlaPolicy({
      id: 'sla-1',
      name: 'Normal',
      priority: 'NORMAL',
      first_response_seconds: 3600,
      resolution_seconds: 28800,
    });

    expect(policy.first_response_seconds).toBe(3600);
    expect(policy.status).toBe('ACTIVE');
  });
});

describe('knowledge/search/misc adapters', () => {
  it('maps a knowledge base', () => {
    const kb = toKnowledgeBase({ id: 'kb-1', name: 'راهنما', scope: 'TENANT', articles_count: 4 });
    expect(kb.articles_count).toBe(4);
    expect(kb.scope).toBe('TENANT');
  });

  it('maps an article, preferring kb_id then knowledge_base_id', () => {
    expect(toArticle({ id: 'a-1', title: 't', slug: 's' }).kb_id).toBe('');
    expect(
      toArticle({ id: 'a-2', title: 't', slug: 's', knowledge_base_id: 'kb-9' }).kb_id,
    ).toBe('kb-9');
  });

  it('maps a search hit into a UI result with a desk URL', () => {
    const result = toSearchResult({
      ticket_id: 't-9',
      ticket_number: 'FT-1009',
      subject: 'چاپگر',
      score: 0.87,
    });

    expect(result.type).toBe('ticket');
    expect(result.title).toBe('چاپگر');
    expect(result.url).toBe('/desk/tickets/t-9');
    expect(result.score).toBeCloseTo(0.87);
  });

  it('maps a notification', () => {
    const notification = toNotification({
      id: 'n-1',
      type: 'assigned',
      title: 'ارجاع شد',
      description: 'FT-1006',
      read: false,
      created_at: '2026-09-01T00:00:00Z',
    });

    expect(notification.read).toBe(false);
    expect(notification.type).toBe('assigned');
  });

  it('maps a tenant', () => {
    const tenant = toTenant({ id: 'ten-1', name: 'Fino', slug: 'fino', status: 'ACTIVE' });
    expect(tenant.status).toBe('ACTIVE');
  });
});

describe('analytics adapter', () => {
  it('maps the full live summary into UI chart series', () => {
    const data = toAnalyticsData({
      tickets_total: 22,
      tickets_open: 22,
      tickets_by_status: { OPEN: 20, CLOSED: 2 },
      tickets_unassigned: 13,
      tickets_breached_sla: 3,
      tickets_waiting_customer: 4,
      tickets_my_active: 0,
      sla_breach_rate: 13.6,
      avg_first_response_hours: 1.25,
      avg_resolution_hours: 8.5,
      tickets_over_time: [{ date: '2026-09-01', created: 5, resolved: 2 }],
      tickets_by_priority: { HIGH: 22 },
      tickets_by_channel: { API: 18, WEB: 4 },
      sla_compliance_series: [{ date: '2026-09-01', percentage: 95 }],
      tickets_by_department: [{ department: 'Support', count: 22 }],
      agent_workload: [{ agent: 'Demo Agent', active: 9 }],
      knowledge_articles_published: 3,
    });

    expect(data.kpis.open_tickets).toBe(22);
    expect(data.kpis.unassigned).toBe(13);
    expect(data.kpis.breached_sla).toBe(3);
    expect(data.kpis.waiting_customer).toBe(4);
    expect(data.by_status).toEqual([
      { status: 'OPEN', count: 20 },
      { status: 'CLOSED', count: 2 },
    ]);
    expect(data.by_priority).toEqual([{ priority: 'HIGH', count: 22 }]);
    expect(data.by_channel).toEqual([
      { channel: 'API', count: 18 },
      { channel: 'WEB', count: 4 },
    ]);
    expect(data.tickets_over_time).toHaveLength(1);
    expect(data.sla_compliance).toHaveLength(1);
    expect(data.by_department[0].department).toBe('Support');
    expect(data.agent_workload[0].active).toBe(9);
  });

  it('returns empty series (not undefined) for a compact summary', () => {
    const data = toAnalyticsData({
      tickets_total: 0,
      tickets_open: 0,
      tickets_by_status: {},
      knowledge_articles_published: 0,
    });

    expect(data.kpis.unassigned).toBe(0);
    expect(data.tickets_over_time).toEqual([]);
    expect(data.by_status).toEqual([]);
    expect(data.by_priority).toEqual([]);
    expect(data.sla_compliance).toEqual([]);
    expect(data.by_department).toEqual([]);
    expect(data.agent_workload).toEqual([]);
    expect(data.by_channel).toEqual([]);
  });
});

describe('session user derivation from scopes', () => {
  it('grants ADMIN for write scopes on a tenant console', () => {
    const user = userFromScopes(['tickets:read', 'tickets:write'], 'tenant');
    expect(user.role).toBe('ADMIN');
    expect(user.console).toBe('tenant');
  });

  it('downgrades to VIEWER when only read scopes are granted', () => {
    const user = userFromScopes(['tickets:read'], 'tenant');
    expect(user.role).toBe('VIEWER');
  });

  it('maps the platform console to PLATFORM_ADMIN and no tenant', () => {
    const user = userFromScopes(['tickets:read'], 'platform');
    expect(user.role).toBe('PLATFORM_ADMIN');
    expect(user.tenant_id).toBeUndefined();
  });
});
