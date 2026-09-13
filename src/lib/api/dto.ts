// FinoTicket V1 — API DTOs
// Raw shapes exactly as returned by the Laravel /api/v1 surface.
// UI-facing shapes live in `src/types`; mapping happens in `adapters.ts`.

/** Standard list/single envelope. */
export interface Envelope<T> {
  data: T;
}

/** POST /api/v1/auth/token (OAuth2 client credentials). */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/** POST /api/v1/auth/widget-token (spec §24). */
export interface WidgetTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  token?: string;
}

export type TicketStatusDto =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'WAITING_INTERNAL'
  | 'RESOLVED'
  | 'CLOSED';

export type PriorityDto = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';

export interface TicketDto {
  id: string;
  ticket_number: string;
  subject: string;
  description?: string | null;
  status: TicketStatusDto;
  priority: PriorityDto;
  source?: string | null;
  channel?: string | null;
  customer_id?: string | null;
  conversation_id?: string | null;
  department_id?: string | null;
  team_id?: string | null;
  assigned_user_id?: string | null;
  category_id?: string | null;
  topic_id?: string | null;
  sla_policy_id?: string | null;
  first_response_due_at?: string | null;
  resolve_due_at?: string | null;
  sla_breached_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  attachments?: TicketAttachmentDto[];
}

export interface TicketAttachmentDto {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface MessageDto {
  id: string;
  sender_type?: string | null;
  sender_id?: string | null;
  body: string;
  is_internal?: boolean;
  message_type?: string | null;
  created_at?: string | null;
}

export interface CustomerIdentityDto {
  id: string;
  provider: string;
  provider_user_id?: string | null;
  external_id?: string | null;
  verification_status?: string | null;
}

export interface CustomerDto {
  id: string;
  display_name: string;
  status: string;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    mobile?: string | null;
  } | null;
  identities?: CustomerIdentityDto[];
  addresses?: unknown[];
  tags?: string[];
  created_at?: string | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  department_id?: string | null;
  status?: string;
  sort_order?: number;
}

export interface TopicDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category_id?: string | null;
  status?: string;
  sort_order?: number;
}

export interface DepartmentDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  product_id?: string | null;
  status?: string;
}

export interface TeamMemberDto {
  user_id: string;
  user_name?: string | null;
  role: 'LEAD' | 'MEMBER' | string;
}

export interface TeamDto {
  id: string;
  name: string;
  slug: string;
  department_id?: string | null;
  category_id?: string | null;
  scope?: string;
  status?: string;
  members?: TeamMemberDto[];
}

export interface AgentDto {
  id: string;
  user_id?: string | null;
  display_name: string;
  avatar_url?: string | null;
  timezone?: string | null;
  language?: string | null;
  max_active_tickets?: number | null;
  presence?: string | null;
  status?: string | null;
}

export interface UserDto {
  id: string;
  email: string;
  mobile?: string | null;
  role?: string | null;
  status?: string | null;
}

export interface SlaPolicyDto {
  id: string;
  name: string;
  priority: PriorityDto;
  first_response_seconds: number;
  resolution_seconds: number;
  status?: string;
}

export interface WorkflowStepDto {
  id: string;
  step_key: string;
  type: string;
  config: Record<string, unknown>;
  sort_order: number;
}

export interface WorkflowDto {
  id: string;
  name: string;
  event: string;
  status: string;
  version: number;
  steps?: WorkflowStepDto[];
  created_at?: string | null;
}

export interface AutomationDto {
  id: string;
  name: string;
  event?: string | null;
  trigger_event?: string | null;
  conditions?: Record<string, unknown>[];
  actions?: Record<string, unknown>[];
  status?: string;
  created_at?: string | null;
}

export interface KnowledgeBaseDto {
  id: string;
  name: string;
  scope: string;
  product_id?: string | null;
  status?: string;
  articles_count?: number;
}

export interface ArticleDto {
  id: string;
  title: string;
  slug: string;
  content?: string;
  summary?: string | null;
  status?: string;
  visibility?: string;
  tags?: string[];
  kb_id?: string | null;
  knowledge_base_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SearchHitDto {
  id?: string;
  ticket_id?: string;
  ticket_number?: string;
  subject?: string;
  title?: string;
  snippet?: string;
  score?: number;
  type?: string;
}

export interface SearchResponseDto {
  mode: string;
  q: string;
  hits: SearchHitDto[];
}

export interface SimilarTicketsDto {
  ticket_id: string;
  similar: SearchHitDto[];
}

export interface AiAnalysisDto {
  id: string;
  /** The API names this `analysis_type`, not `type`. */
  analysis_type?: string;
  type?: string;
  result: unknown;
  confidence?: number | null;
  model_provider?: string | null;
  model_name?: string | null;
  created_at?: string | null;
}

export interface AiSuggestionSourceDto {
  title: string;
  url?: string;
  article_id?: string;
}

export interface AiSuggestionDto {
  id: string;
  ticket_id: string;
  type: string;
  content: string;
  confidence?: number | null;
  status: string;
  sources?: AiSuggestionSourceDto[];
  created_at?: string | null;
}

export interface RagResponseDto {
  answer: string;
  sources?: AiSuggestionSourceDto[];
  approval_required?: boolean;
}

/** POST /api/v1/tickets/{id}/ai/copilot — nested suggestion envelope. */
export interface CopilotResponseDto {
  suggestion: AiSuggestionDto;
  answer?: string;
  sources?: AiSuggestionSourceDto[];
  requires_human_approval?: boolean;
}

export interface AnalyticsSummaryDto {
  tickets_total: number;
  tickets_open: number;
  tickets_by_status: Record<string, number>;
  tickets_unassigned?: number;
  tickets_breached_sla?: number;
  tickets_waiting_customer?: number;
  tickets_my_active?: number;
  sla_breach_rate?: number;
  avg_first_response_hours?: number;
  avg_resolution_hours?: number;
  tickets_over_time?: { date: string; created: number; resolved: number }[];
  tickets_by_priority?: Record<string, number>;
  tickets_by_channel?: Record<string, number>;
  sla_compliance_series?: { date: string; percentage: number }[];
  tickets_by_department?: { department: string; count: number }[];
  agent_workload?: { agent: string; active: number }[];
  knowledge_articles_published: number;
  tenant_id?: string | null;
  product_id?: string | null;
}

export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductChannelDto {
  channel: string;
  status?: string;
  settings?: Record<string, unknown> | null;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  tenant_id?: string | null;
  settings?: Record<string, unknown> | null;
  channels?: ProductChannelDto[];
  created_at?: string | null;
}

export interface ApiClientDto {
  id: string;
  name: string;
  client_id: string;
  client_secret?: string;
  scopes: string[];
  status: string;
  last_used_at?: string | null;
  created_at?: string | null;
}

export interface WebhookDeliveryDto {
  id: string;
  status: string;
  attempts: number;
  response_code?: number | null;
  response_body?: string | null;
  next_retry_at?: string | null;
  created_at?: string | null;
}

export interface WebhookDto {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  created_at?: string | null;
}

export interface OutboxEventDto {
  id: string;
  event_type: string;
  aggregate_type?: string | null;
  aggregate_id?: string | null;
  status: string;
  occurred_at?: string | null;
  published_at?: string | null;
}

export interface NotificationDto {
  id: string;
  type?: string;
  title?: string;
  description?: string;
  ticket_id?: string | null;
  ticket_number?: string | null;
  read?: boolean;
  created_at?: string | null;
}

export interface HealthDto {
  status?: string;
  checks?: Record<string, unknown>;
  [key: string]: unknown;
}
