// FinoTicket V1 - Core Types

// Console types for dual dashboard
export type ConsoleType = 'platform' | 'tenant';

// Platform roles
export type PlatformRole = 'PLATFORM_OWNER' | 'PLATFORM_ADMIN';

// Tenant roles (existing)
export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER';
export type Presence = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'WAITING_INTERNAL' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type Channel = 'WEB' | 'WIDGET' | 'EMAIL' | 'CHAT' | 'SMS' | 'PHONE' | 'API' | 'WHATSAPP' | 'SYSTEM';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type ProductStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Visibility = 'AGENT' | 'CUSTOMER' | 'BOTH';
export type KBScope = 'GLOBAL' | 'TENANT' | 'PRODUCT';
export type SearchMode = 'KEYWORD' | 'SEMANTIC' | 'HYBRID';
export type AddressType = 'HOME' | 'WORK' | 'OTHER';
export type TeamRole = 'LEAD' | 'MEMBER';
export type WebhookDeliveryStatus = 'PENDING' | 'SENDING' | 'DELIVERED' | 'FAILED';
export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type WorkflowExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type AIAnalysisType = 'SUMMARY' | 'INTENT' | 'CATEGORY' | 'SENTIMENT' | 'LANGUAGE' | 'PRIORITY' | 'SIMILARITY';
export type AISuggestionType = 'REPLY' | 'SUMMARY' | 'CATEGORY' | 'PRIORITY' | 'NEXT_ACTION' | 'KNOWLEDGE';
export type AISuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type MessageSender = 'CUSTOMER' | 'AGENT' | 'BOT' | 'SUPERVISOR';
export type SLAStatus = 'ON_TRACK' | 'WARNING' | 'BREACHED';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ASSIGN' | 'STATUS_CHANGE';

// Tenant - represents a company/organization
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id?: string; // null for platform users
  console: ConsoleType; // 'platform' or 'tenant'
  email: string;
  mobile?: string;
  display_name: string;
  avatar_url?: string;
  role: Role | PlatformRole; // tenant role or platform role
  presence: Presence;
  timezone: string;
  language: 'fa' | 'en';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REMOVED';
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  name: string;
  slug: string;
  status: ProductStatus;
  settings: Record<string, string>;
  channels: Channel[];
  widget_branding?: WidgetBranding;
  created_at: string;
}

export interface WidgetBranding {
  primary_color: string;
  logo_url?: string;
  welcome_text: string;
  title: string;
}

export interface Customer {
  id: string;
  display_name: string;
  status: CustomerStatus;
  profile: CustomerProfile;
  identities: CustomerIdentity[];
  addresses: Address[];
  tags: string[];
  created_at: string;
}

export interface CustomerProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
}

export interface CustomerIdentity {
  id: string;
  provider: string;
  provider_user_id: string;
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
}

export interface Address {
  id: string;
  type: AddressType;
  title: string;
  address: string;
  postal_code?: string;
  city?: string;
  province?: string;
  country?: string;
}

export interface Ticket {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  ticket_number: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: Priority;
  product_id: string;
  product_name?: string;
  customer_id: string;
  customer_name?: string;
  department_id?: string;
  department_name?: string;
  category_id?: string;
  category_name?: string;
  topic_id?: string; // NEW: leaf classification
  topic_name?: string;
  team_id?: string;
  team_name?: string;
  assignee_id?: string;
  assignee_name?: string;
  channel: Channel;
  source: string;
  tags: string[];
  watchers: string[];
  sla_policy_id?: string;
  sla_status?: SLAStatus;
  sla_first_response_due?: string;
  sla_resolution_due?: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  ticket_id: string;
  sender_type: MessageSender;
  sender_id: string;
  sender_name: string;
  body: string;
  is_internal: boolean;
  channel: Channel;
  attachments: Attachment[];
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  uploader_id?: string;
  uploader_name?: string;
  created_at?: string;
}

export interface Department {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  product_id: string; // Hierarchy: belongs to product
  name: string;
  slug: string;
  description?: string;
  status: EntityStatus;
}

export interface Category {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  department_id: string; // Hierarchy: belongs to department
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  status: EntityStatus;
  sort_order: number;
  children?: Category[];
}

// NEW: Topic - leaf classification under category
export interface Topic {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  category_id: string; // Hierarchy: belongs to category
  name: string;
  slug: string;
  description?: string;
  status: EntityStatus;
  sort_order: number;
}

export type TeamScope = 'DEPARTMENT' | 'CATEGORY';

export interface Team {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  product_id: string; // Hierarchy: belongs to product
  department_id: string; // Hierarchy: belongs to department
  category_id?: string | null; // Hierarchy: if scope=CATEGORY
  scope: TeamScope; // DEPARTMENT or CATEGORY scoped
  name: string;
  slug: string;
  status: EntityStatus;
  members: TeamMember[];
}

export interface TeamMember {
  user_id: string;
  user_name: string;
  role: TeamRole;
}

export interface Agent {
  id: string;
  tenant_id: string; // Hierarchy: belongs to tenant
  user_id: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
  language: 'fa' | 'en';
  max_active_tickets: number;
  presence: Presence;
  status: EntityStatus;
}

export interface SLAPolicy {
  id: string;
  name: string;
  priority: Priority;
  first_response_seconds: number;
  resolution_seconds: number;
  business_hours_id?: string;
  status: EntityStatus;
}

export interface Workflow {
  id: string;
  name: string;
  event: string;
  status: WorkflowStatus;
  version: number;
  steps: WorkflowStep[];
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  type: 'CONDITION' | 'ACTION' | 'DELAY' | 'WEBHOOK' | 'NOTIFICATION' | 'AI';
  step_key: string;
  config: Record<string, unknown>;
  sort_order: number;
}

export interface Automation {
  id: string;
  name: string;
  trigger_event: string;
  conditions: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  status: EntityStatus;
  created_at: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  scope: KBScope;
  product_id?: string;
  status: EntityStatus;
  articles_count: number;
}

export interface Article {
  id: string;
  kb_id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  status: ArticleStatus;
  visibility: Visibility;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface APIClient {
  id: string;
  name: string;
  client_id: string;
  client_secret?: string; // Only shown once on create
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  last_used_at?: string;
  created_at: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: EntityStatus;
  deliveries: WebhookDelivery[];
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  response_code?: number;
  response_body?: string;
  next_retry_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  ticket_id: string;
  type: AIAnalysisType;
  result: string;
  confidence: number;
  created_at: string;
}

export interface AISuggestion {
  id: string;
  ticket_id: string;
  type: AISuggestionType;
  content: string;
  confidence: number;
  status: AISuggestionStatus;
  sources?: { title: string; url: string; article_id?: string }[];
  created_at: string;
}

export interface SearchResult {
  id: string;
  type: 'ticket' | 'customer' | 'article';
  title: string;
  snippet: string;
  score: number;
  url: string;
}

export interface AnalyticsData {
  kpis: {
    open_tickets: number;
    unassigned: number;
    breached_sla: number;
    waiting_customer: number;
    my_active: number;
    avg_first_response: number;
    avg_resolution: number;
    satisfaction: number;
  };
  tickets_over_time: { date: string; created: number; resolved: number }[];
  by_status: { status: string; count: number }[];
  by_priority: { priority: string; count: number }[];
  sla_compliance: { date: string; percentage: number }[];
  by_department: { department: string; count: number }[];
  agent_workload: { agent: string; active: number }[];
  by_channel: { channel: string; count: number }[];
}
