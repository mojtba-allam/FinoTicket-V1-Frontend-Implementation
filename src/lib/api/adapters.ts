// FinoTicket V1 — DTO → UI type adapters
// The backend speaks raw column values; `src/types` speaks the UI shape.
// Every shape mismatch is isolated here so pages/components never see DTOs.

import type {
  AgentDto,
  AiSuggestionDto,
  ArticleDto,
  AutomationDto,
  CategoryDto,
  CustomerDto,
  DepartmentDto,
  KnowledgeBaseDto,
  MessageDto,
  ProductChannelDto,
  ProductDto,
  SlaPolicyDto,
  TeamDto,
  TenantDto,
  TicketDto,
  TopicDto,
  UserDto,
  WebhookDto,
  WorkflowDto,
  WebhookDeliveryDto,
  OutboxEventDto,
  NotificationDto,
  AnalyticsSummaryDto,
  SearchHitDto,
} from './dto';
import type {
  Address,
  Agent,
  AISuggestion,
  Article,
  Attachment,
  Automation,
  Category,
  Channel,
  Customer,
  CustomerIdentity,
  CustomerStatus,
  Department,
  EntityStatus,
  KnowledgeBase,
  Message,
  MessageSender,
  Presence,
  Product,
  Role,
  SearchResult,
  SLAPolicy,
  Team,
  TeamScope,
  Tenant,
  Ticket,
  Topic,
  User,
  Webhook,
  WebhookDelivery,
  Workflow,
  WorkflowStep,
} from '../../types';
import type { Notification } from '../../components/NotificationCenter';

const DEFAULT_TENANT_ID = 'ten-1';

function asEntityStatus(value?: string | null): EntityStatus {
  const allowed: EntityStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'];
  return allowed.includes(value as EntityStatus) ? (value as EntityStatus) : 'ACTIVE';
}

function asPresence(value?: string | null): Presence {
  const allowed: Presence[] = ['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'];
  return allowed.includes(value as Presence) ? (value as Presence) : 'OFFLINE';
}

/** Tenant membership role → UI Role (platform roles never come from this path). */
function asTenantRole(value?: string | null): Role {
  const allowed: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'];
  return allowed.includes(value as Role) ? (value as Role) : 'AGENT';
}

function asUserStatus(value?: string | null): User['status'] {
  const allowed: User['status'][] = ['ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED'];
  return allowed.includes(value as User['status']) ? (value as User['status']) : 'ACTIVE';
}

function asChannel(value?: string | null): Channel {
  const allowed: Channel[] = [
    'WEB',
    'WIDGET',
    'EMAIL',
    'CHAT',
    'SMS',
    'PHONE',
    'API',
    'WHATSAPP',
    'SYSTEM',
  ];
  return allowed.includes(value as Channel) ? (value as Channel) : 'API';
}

function asTicketStatus(value?: string | null): Ticket['status'] {
  const allowed: Ticket['status'][] = [
    'OPEN',
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'WAITING_INTERNAL',
    'RESOLVED',
    'CLOSED',
  ];
  return allowed.includes(value as Ticket['status']) ? (value as Ticket['status']) : 'OPEN';
}

function asPriority(value?: string | null): Ticket['priority'] {
  const allowed: Ticket['priority'][] = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'];
  return allowed.includes(value as Ticket['priority'])
    ? (value as Ticket['priority'])
    : 'NORMAL';
}

/**
 * The backend exposes SLA deadlines but not a computed status.
 * Derive what the UI needs from the breach/due timestamps.
 */
function deriveSlaStatus(dto: TicketDto): Ticket['sla_status'] {
  if (dto.sla_breached_at) return 'BREACHED';
  const due = dto.resolve_due_at ?? dto.first_response_due_at;
  if (!due) return undefined;

  const remainingMs = new Date(due).getTime() - Date.now();
  if (Number.isNaN(remainingMs)) return undefined;
  if (remainingMs <= 0) return 'BREACHED';

  // Warn inside the last 20% of an hour-scale window, or under 30 minutes.
  const thirtyMinutes = 30 * 60 * 1000;
  return remainingMs <= thirtyMinutes ? 'WARNING' : 'ON_TRACK';
}

export function toTicket(dto: TicketDto): Ticket {
  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    ticket_number: dto.ticket_number,
    subject: dto.subject,
    description: dto.description ?? undefined,
    status: asTicketStatus(dto.status),
    priority: asPriority(dto.priority),
    product_id: '',
    customer_id: dto.customer_id ?? '',
    department_id: dto.department_id ?? undefined,
    category_id: dto.category_id ?? undefined,
    topic_id: dto.topic_id ?? undefined,
    team_id: dto.team_id ?? undefined,
    assignee_id: dto.assigned_user_id ?? undefined,
    channel: asChannel(dto.channel),
    source: dto.source ?? 'API',
    tags: [],
    watchers: [],
    sla_policy_id: dto.sla_policy_id ?? undefined,
    sla_status: deriveSlaStatus(dto),
    sla_first_response_due: dto.first_response_due_at ?? undefined,
    sla_resolution_due: dto.resolve_due_at ?? undefined,
    created_at: dto.created_at ?? new Date().toISOString(),
    updated_at: dto.updated_at ?? dto.created_at ?? new Date().toISOString(),
  };
}

export function toTickets(dtos: TicketDto[]): Ticket[] {
  return dtos.map(toTicket);
}

export function toMessage(dto: MessageDto, ticketId: string): Message {
  const senderType = (dto.sender_type ?? 'AGENT').toUpperCase();
  const allowedSenders: MessageSender[] = ['CUSTOMER', 'AGENT', 'BOT', 'SUPERVISOR'];

  return {
    id: dto.id,
    ticket_id: ticketId,
    sender_type: allowedSenders.includes(senderType as MessageSender)
      ? (senderType as MessageSender)
      : 'AGENT',
    sender_id: dto.sender_id ?? '',
    sender_name: dto.sender_id ?? '',
    body: dto.body,
    is_internal: Boolean(dto.is_internal) || dto.message_type === 'NOTE',
    channel: 'API',
    attachments: [],
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toMessages(dtos: MessageDto[], ticketId: string): Message[] {
  return dtos.map((dto) => toMessage(dto, ticketId));
}

export function toAttachment(dto: {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
}): Attachment {
  return {
    id: dto.id,
    filename: dto.original_name,
    mime_type: dto.mime_type,
    size: dto.size,
    url: '',
  };
}

const IDENTITY_VERIFICATION: CustomerIdentity['verification_status'][] = [
  'VERIFIED',
  'UNVERIFIED',
  'PENDING',
];

export function toCustomerIdentity(dto: {
  id: string;
  provider: string;
  provider_user_id?: string | null;
  verification_status?: string | null;
}): CustomerIdentity {
  const status = (dto.verification_status ?? 'UNVERIFIED').toUpperCase();

  return {
    id: dto.id,
    provider: dto.provider,
    provider_user_id: dto.provider_user_id ?? '',
    verification_status: IDENTITY_VERIFICATION.includes(
      status as CustomerIdentity['verification_status'],
    )
      ? (status as CustomerIdentity['verification_status'])
      : 'UNVERIFIED',
  };
}

export function toCustomer(dto: CustomerDto): Customer {
  const status = (dto.status ?? 'ACTIVE').toUpperCase();
  const allowed: CustomerStatus[] = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

  return {
    id: dto.id,
    display_name: dto.display_name,
    status: allowed.includes(status as CustomerStatus) ? (status as CustomerStatus) : 'ACTIVE',
    profile: {
      first_name: dto.profile?.first_name ?? undefined,
      last_name: dto.profile?.last_name ?? undefined,
      email: dto.profile?.email ?? undefined,
      mobile: dto.profile?.mobile ?? undefined,
    },
    identities: (dto.identities ?? []).map(toCustomerIdentity),
    addresses: (dto.addresses as Address[] | undefined) ?? [],
    tags: dto.tags ?? [],
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toCustomers(dtos: CustomerDto[]): Customer[] {
  return dtos.map(toCustomer);
}

export function toDepartment(dto: DepartmentDto): Department {
  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    product_id: dto.product_id ?? '',
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? undefined,
    status: asEntityStatus(dto.status),
  };
}

export function toDepartments(dtos: DepartmentDto[]): Department[] {
  return dtos.map(toDepartment);
}

export function toCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    department_id: dto.department_id ?? '',
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? undefined,
    parent_id: dto.parent_id ?? undefined,
    status: asEntityStatus(dto.status),
    sort_order: dto.sort_order ?? 0,
  };
}

export function toCategories(dtos: CategoryDto[]): Category[] {
  return dtos.map(toCategory);
}

export function toTopic(dto: TopicDto): Topic {
  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    category_id: dto.category_id ?? '',
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? undefined,
    status: asEntityStatus(dto.status),
    sort_order: dto.sort_order ?? 0,
  };
}

export function toTopics(dtos: TopicDto[]): Topic[] {
  return dtos.map(toTopic);
}

export function toTeam(dto: TeamDto): Team {
  const scope: TeamScope = (dto.scope ?? '').toUpperCase() === 'CATEGORY' ? 'CATEGORY' : 'DEPARTMENT';

  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    product_id: '',
    department_id: dto.department_id ?? '',
    category_id: dto.category_id ?? null,
    scope,
    name: dto.name,
    slug: dto.slug,
    status: asEntityStatus(dto.status),
    members: (dto.members ?? []).map((member) => ({
      user_id: member.user_id,
      user_name: member.user_name ?? member.user_id,
      role: (member.role ?? 'MEMBER').toUpperCase() === 'LEAD' ? 'LEAD' : 'MEMBER',
    })),
  };
}

export function toTeams(dtos: TeamDto[]): Team[] {
  return dtos.map(toTeam);
}

export function toAgent(dto: AgentDto): Agent {
  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    user_id: dto.user_id ?? '',
    display_name: dto.display_name,
    avatar_url: dto.avatar_url ?? undefined,
    timezone: dto.timezone ?? 'Asia/Tehran',
    language: (dto.language ?? 'fa') === 'en' ? 'en' : 'fa',
    max_active_tickets: dto.max_active_tickets ?? 20,
    presence: asPresence(dto.presence),
    status: asEntityStatus(dto.status),
  };
}

export function toAgents(dtos: AgentDto[]): Agent[] {
  return dtos.map(toAgent);
}

/** Tenant user directory row → UI User (console is always 'tenant' here). */
export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    tenant_id: DEFAULT_TENANT_ID,
    console: 'tenant',
    email: dto.email,
    mobile: dto.mobile ?? undefined,
    display_name: dto.email.split('@')[0] ?? dto.email,
    role: asTenantRole(dto.role),
    presence: 'OFFLINE',
    timezone: 'Asia/Tehran',
    language: 'fa',
    status: asUserStatus(dto.status),
    created_at: new Date().toISOString(),
  };
}

export function toUsers(dtos: UserDto[]): User[] {
  return dtos.map(toUser);
}

export function toSlaPolicy(dto: SlaPolicyDto): SLAPolicy {
  return {
    id: dto.id,
    name: dto.name,
    priority: asPriority(dto.priority),
    first_response_seconds: dto.first_response_seconds,
    resolution_seconds: dto.resolution_seconds,
    status: asEntityStatus(dto.status),
  };
}

export function toSlaPolicies(dtos: SlaPolicyDto[]): SLAPolicy[] {
  return dtos.map(toSlaPolicy);
}

export function toWorkflow(dto: WorkflowDto): Workflow {
  const status = (dto.status ?? 'DRAFT').toUpperCase();

  return {
    id: dto.id,
    name: dto.name,
    event: dto.event,
    status:
      status === 'ACTIVE' || status === 'INACTIVE'
        ? (status as Workflow['status'])
        : 'DRAFT',
    version: dto.version ?? 1,
    steps: (dto.steps ?? []).map(
      (step): WorkflowStep => ({
        id: step.id,
        type: step.type as WorkflowStep['type'],
        step_key: step.step_key,
        config: step.config ?? {},
        sort_order: step.sort_order ?? 0,
      }),
    ),
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toWorkflows(dtos: WorkflowDto[]): Workflow[] {
  return dtos.map(toWorkflow);
}

export function toAutomation(dto: AutomationDto): Automation {
  return {
    id: dto.id,
    name: dto.name,
    trigger_event: dto.trigger_event ?? dto.event ?? '',
    conditions: dto.conditions ?? [],
    actions: dto.actions ?? [],
    status: asEntityStatus(dto.status),
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toAutomations(dtos: AutomationDto[]): Automation[] {
  return dtos.map(toAutomation);
}

export function toKnowledgeBase(dto: KnowledgeBaseDto): KnowledgeBase {
  return {
    id: dto.id,
    name: dto.name,
    scope: (dto.scope ?? 'TENANT').toUpperCase() as KnowledgeBase['scope'],
    product_id: dto.product_id ?? undefined,
    status: asEntityStatus(dto.status),
    articles_count: dto.articles_count ?? 0,
  };
}

export function toKnowledgeBases(dtos: KnowledgeBaseDto[]): KnowledgeBase[] {
  return dtos.map(toKnowledgeBase);
}

export function toArticle(dto: ArticleDto): Article {
  return {
    id: dto.id,
    kb_id: dto.kb_id ?? dto.knowledge_base_id ?? '',
    title: dto.title,
    slug: dto.slug,
    content: dto.content ?? '',
    summary: dto.summary ?? undefined,
    status: (dto.status ?? 'DRAFT').toUpperCase() as Article['status'],
    visibility: (dto.visibility ?? 'AGENT').toUpperCase() as Article['visibility'],
    tags: dto.tags ?? [],
    created_at: dto.created_at ?? new Date().toISOString(),
    updated_at: dto.updated_at ?? dto.created_at ?? new Date().toISOString(),
  };
}

export function toArticles(dtos: ArticleDto[]): Article[] {
  return dtos.map(toArticle);
}

export function toWebhookDelivery(dto: WebhookDeliveryDto): WebhookDelivery {
  return {
    id: dto.id,
    webhook_id: '',
    event: '',
    status: (dto.status ?? 'PENDING') as WebhookDelivery['status'],
    attempts: dto.attempts ?? 0,
    response_code: dto.response_code ?? undefined,
    response_body: dto.response_body ?? undefined,
    next_retry_at: dto.next_retry_at ?? undefined,
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toWebhook(dto: WebhookDto, deliveries: WebhookDeliveryDto[] = []): Webhook {
  return {
    id: dto.id,
    name: dto.name,
    url: dto.url,
    events: dto.events ?? [],
    status: asEntityStatus(dto.status),
    deliveries: deliveries.map((delivery) => ({
      ...toWebhookDelivery(delivery),
      webhook_id: dto.id,
    })),
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toWebhooks(dtos: WebhookDto[]): Webhook[] {
  return dtos.map((dto) => toWebhook(dto));
}

export function toOutboxEvent(dto: OutboxEventDto): {
  id: string;
  type: string;
  aggregate: string;
  status: string;
  occurred_at: string;
  published_at?: string;
} {
  return {
    id: dto.id,
    type: dto.event_type,
    aggregate: `${dto.aggregate_type ?? 'unknown'}:${dto.aggregate_id ?? ''}`,
    status: dto.status,
    occurred_at: dto.occurred_at ?? new Date().toISOString(),
    published_at: dto.published_at ?? undefined,
  };
}

export function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: (dto.type ?? 'message') as Notification['type'],
    title: dto.title ?? '',
    description: dto.description ?? '',
    ticket_id: dto.ticket_id ?? undefined,
    ticket_number: dto.ticket_number ?? undefined,
    created_at: dto.created_at ?? new Date().toISOString(),
    read: Boolean(dto.read),
  };
}

export function toNotifications(dtos: NotificationDto[]): Notification[] {
  return dtos.map(toNotification);
}

export function toAISuggestion(dto: AiSuggestionDto, ticketId?: string): AISuggestion {
  return {
    id: dto.id,
    ticket_id: dto.ticket_id ?? ticketId ?? '',
    type: (dto.type ?? 'REPLY').toUpperCase() as AISuggestion['type'],
    content: dto.content,
    confidence: dto.confidence ?? 0,
    status: (dto.status ?? 'PENDING').toUpperCase() as AISuggestion['status'],
    sources: (dto.sources ?? []).map((source) => ({
      title: source.title,
      url: source.url ?? '',
      article_id: source.article_id,
    })),
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toAISuggestions(dtos: AiSuggestionDto[], ticketId?: string): AISuggestion[] {
  return dtos.map((dto) => toAISuggestion(dto, ticketId));
}

export function toSearchResult(hit: SearchHitDto): SearchResult {
  const id = hit.ticket_id ?? hit.id ?? '';

  return {
    id,
    type: (hit.type ?? 'ticket').toLowerCase() as SearchResult['type'],
    title: hit.subject ?? hit.title ?? hit.ticket_number ?? id,
    snippet: hit.snippet ?? '',
    score: hit.score ?? 0,
    url: `/desk/tickets/${id}`,
  };
}

export function toSearchResults(hits: SearchHitDto[]): SearchResult[] {
  return hits.map(toSearchResult);
}

export function toTenant(dto: TenantDto): Tenant {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    status: asEntityStatus(dto.status) as Tenant['status'],
    owner_user_id: '',
    created_at: dto.created_at ?? new Date().toISOString(),
    updated_at: dto.updated_at ?? new Date().toISOString(),
  };
}

export function toTenants(dtos: TenantDto[]): Tenant[] {
  return dtos.map(toTenant);
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    tenant_id: dto.tenant_id ?? DEFAULT_TENANT_ID,
    name: dto.name,
    slug: dto.slug,
    status: asEntityStatus(dto.status) as Product['status'],
    settings: Object.fromEntries(
      Object.entries(dto.settings ?? {}).map(([key, value]) => [key, String(value)]),
    ),
    channels: (dto.channels ?? []).map((channel: ProductChannelDto) =>
      asChannel(channel.channel),
    ),
    created_at: dto.created_at ?? new Date().toISOString(),
  };
}

export function toProducts(dtos: ProductDto[]): Product[] {
  return dtos.map(toProduct);
}

/**
 * Analytics: map the backend summary onto the shape the desk page renders.
 * Every series the API can honestly supply is passed through; the page shows
 * an empty-state for series the tenant has no data for yet.
 */
export function toAnalyticsData(dto: AnalyticsSummaryDto) {
  const byStatus = Object.entries(dto.tickets_by_status ?? {}).map(([status, count]) => ({
    status,
    count: Number(count),
  }));

  const byPriority = Object.entries(dto.tickets_by_priority ?? {}).map(([priority, count]) => ({
    priority,
    count: Number(count),
  }));

  const byChannel = Object.entries(dto.tickets_by_channel ?? {}).map(([channel, count]) => ({
    channel,
    count: Number(count),
  }));

  return {
    kpis: {
      open_tickets: dto.tickets_open ?? 0,
      unassigned: dto.tickets_unassigned ?? 0,
      breached_sla: dto.tickets_breached_sla ?? 0,
      waiting_customer: dto.tickets_waiting_customer ?? 0,
      my_active: dto.tickets_my_active ?? 0,
      avg_first_response: dto.avg_first_response_hours ?? 0,
      avg_resolution: dto.avg_resolution_hours ?? 0,
      satisfaction: 0,
    },
    tickets_over_time: dto.tickets_over_time ?? [],
    by_status: byStatus,
    by_priority: byPriority,
    sla_compliance: dto.sla_compliance_series ?? [],
    by_department: dto.tickets_by_department ?? [],
    agent_workload: dto.agent_workload ?? [],
    by_channel: byChannel,
  };
}
