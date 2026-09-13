// FinoTicket V1 — typed API client
// One function per route in FinoTicket-V1-Backend/routes/api.php.
// Every call returns raw DTOs; use `adapters.ts` to map into `src/types`.

import { request, resolveBaseUrl, type ApiEnvelope, type RequestOptions } from './http';
import type {
  AgentDto,
  AnalyticsSummaryDto,
  ApiClientDto,
  ArticleDto,
  AutomationDto,
  CategoryDto,
  CopilotResponseDto,
  CustomerDto,
  CustomerIdentityDto,
  DepartmentDto,
  Envelope,
  HealthDto,
  KnowledgeBaseDto,
  MessageDto,
  NotificationDto,
  OutboxEventDto,
  ProductChannelDto,
  ProductDto,
  RagResponseDto,
  SearchResponseDto,
  SimilarTicketsDto,
  SlaPolicyDto,
  TeamDto,
  TeamMemberDto,
  UserDto,
  TenantDto,
  TicketAttachmentDto,
  TicketDto,
  TokenResponse,
  TopicDto,
  WebhookDeliveryDto,
  WebhookDto,
  WidgetTokenResponse,
  WorkflowDto,
  WorkflowStepDto,
  AiAnalysisDto,
  AiSuggestionDto,
} from './dto';

export interface ClientConfig {
  /** Bearer token provider — read lazily so token rotation is picked up. */
  getToken: () => string | null;
  /** Called on 401 so the app can clear session state. */
  onUnauthorized?: () => void;
}

export interface TicketListParams {
  status?: string;
  priority?: string;
  customer_id?: string;
  department_id?: string;
  assigned_user_id?: string;
}

export interface CustomerListParams {
  identity?: string;
  provider?: string;
}

export interface SearchParams {
  q: string;
  mode?: 'KEYWORD' | 'SEMANTIC' | 'HYBRID';
  limit?: number;
}

export interface KnowledgeListParams {
  status?: string;
  knowledge_base_id?: string;
}

/**
 * Build a client bound to a token source.
 * Keeping this a factory (not a singleton) makes it testable with Vitest.
 */
export function createApiClient(config: ClientConfig) {
  const auth = (): RequestOptions => ({ token: config.getToken() });

  /** Run a call and notify the app when the session is no longer valid. */
  async function guarded<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error && typeof error === 'object' && (error as { status?: number }).status === 401) {
        config.onUnauthorized?.();
      }
      throw error;
    }
  }

  const get = <T>(path: string, query?: RequestOptions['query']) =>
    request<Envelope<T>>(path, { ...auth(), query });

  const post = <T>(path: string, body?: unknown, extra: RequestOptions = {}) =>
    request<Envelope<T>>(path, { ...auth(), ...extra, method: 'POST', body });

  const patch = <T>(path: string, body?: unknown) =>
    request<Envelope<T>>(path, { ...auth(), method: 'PATCH', body });

  const put = <T>(path: string, body?: unknown) =>
    request<Envelope<T>>(path, { ...auth(), method: 'PUT', body });

  const del = <T>(path: string) =>
    request<Envelope<T>>(path, { ...auth(), method: 'DELETE' });

  return {
    /** Unauthenticated endpoints. */
    health: {
      all: () => request<HealthDto>('/api/v1/health', { token: null }),
      live: () => request<HealthDto>('/api/v1/health/live', { token: null }),
      ready: () => request<HealthDto>('/api/v1/health/ready', { token: null }),
      openapi: () =>
        request<Record<string, unknown>>('/api/v1/openapi.json', { token: null }),
    },

    auth: {
      /** OAuth2 client credentials (spec §24). */
      token: (clientId: string, clientSecret: string) =>
        request<TokenResponse>('/api/v1/auth/token', {
          token: null,
          method: 'POST',
          body: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          },
        }),

      /** Short-lived signed customer token for the widget (spec §24). */
      widgetToken: (customerId: string, scopes?: string[]) =>
        post<WidgetTokenResponse>('/api/v1/auth/widget-token', {
          customer_id: customerId,
          scopes,
        }),
    },

    tenants: {
      list: () => get<TenantDto[]>('/api/v1/tenants'),
      get: (uuid: string) => get<TenantDto>(`/api/v1/tenants/${uuid}`),
      update: (uuid: string, data: Partial<TenantDto>) =>
        patch<TenantDto>(`/api/v1/tenants/${uuid}`, data),
      create: (data: { name: string; slug: string }) =>
        post<TenantDto>('/api/v1/tenants', data),
    },

    products: {
      list: () => get<ProductDto[]>('/api/v1/products'),
      get: (uuid: string) => get<ProductDto>(`/api/v1/products/${uuid}`),
      create: (data: { name: string; slug: string }) =>
        post<ProductDto>('/api/v1/products', data),
      update: (uuid: string, data: Partial<ProductDto>) =>
        patch<ProductDto>(`/api/v1/products/${uuid}`, data),
      channels: (uuid: string) => get<ProductChannelDto[]>(`/api/v1/products/${uuid}/channels`),
      updateChannels: (uuid: string, channels: ProductChannelDto[]) =>
        put<ProductChannelDto[]>(`/api/v1/products/${uuid}/channels`, { channels }),
    },

    apiClients: {
      list: () => get<ApiClientDto[]>('/api/v1/api-clients'),
      get: (uuid: string) => get<ApiClientDto>(`/api/v1/api-clients/${uuid}`),
      create: (data: { name: string; scopes: string[] }) =>
        post<ApiClientDto>('/api/v1/api-clients', data),
      update: (uuid: string, data: { name?: string; scopes?: string[]; status?: string }) =>
        patch<ApiClientDto>(`/api/v1/api-clients/${uuid}`, data),
      revoke: (uuid: string) =>
        post<{ id: string; status: string }>(`/api/v1/api-clients/${uuid}/revoke`),
    },

    customers: {
      list: (params?: CustomerListParams) =>
        get<CustomerDto[]>('/api/v1/customers', params as RequestOptions['query']),
      get: (uuid: string) => get<CustomerDto>(`/api/v1/customers/${uuid}`),
      create: (data: {
        display_name: string;
        status?: string;
        profile?: Record<string, unknown>;
      }) => post<CustomerDto>('/api/v1/customers', data),
      update: (uuid: string, data: {
        display_name?: string;
        status?: string;
        profile?: Record<string, unknown>;
      }) => patch<CustomerDto>(`/api/v1/customers/${uuid}`, data),
      linkIdentity: (uuid: string, data: { identifier: string; provider?: string }) =>
        post<CustomerIdentityDto>(`/api/v1/customers/${uuid}/identities`, data),
      unlinkIdentity: (uuid: string, identityUuid: string) =>
        del<{ removed: boolean }>(`/api/v1/customers/${uuid}/identities/${identityUuid}`),
    },

    departments: {
      list: (params?: { product_id?: string }) =>
        get<DepartmentDto[]>('/api/v1/departments', params as RequestOptions['query']),
      create: (data: {
        name: string;
        slug?: string;
        product_id?: string;
        description?: string;
        status?: string;
      }) => post<DepartmentDto>('/api/v1/departments', data),
      update: (
        uuid: string,
        data: { name?: string; slug?: string; description?: string; status?: string },
      ) => patch<DepartmentDto>(`/api/v1/departments/${uuid}`, data),
    },

    teams: {
      list: (params?: { department_id?: string; scope?: string }) =>
        get<TeamDto[]>('/api/v1/teams', params as RequestOptions['query']),
      create: (data: Record<string, unknown>) => post<TeamDto>('/api/v1/teams', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<TeamDto>(`/api/v1/teams/${uuid}`, data),
      members: (uuid: string) => get<TeamMemberDto[]>(`/api/v1/teams/${uuid}/members`),
      addMember: (uuid: string, data: { user_id: string; role?: string }) =>
        post<TeamMemberDto>(`/api/v1/teams/${uuid}/members`, data),
      removeMember: (uuid: string, userUuid: string) =>
        del<{ removed: boolean }>(`/api/v1/teams/${uuid}/members/${userUuid}`),
    },

    agents: {
      list: () => get<AgentDto[]>('/api/v1/agents'),
      get: (uuid: string) => get<AgentDto>(`/api/v1/agents/${uuid}`),
      create: (data: Record<string, unknown>) => post<AgentDto>('/api/v1/agents', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<AgentDto>(`/api/v1/agents/${uuid}`, data),
    },

    users: {
      list: () => get<UserDto[]>('/api/v1/users'),
      invite: (data: { email: string; name?: string; role?: string }) =>
        post<UserDto>('/api/v1/users/invite', data),
    },

    categories: {
      list: (params?: { department_id?: string }) =>
        get<CategoryDto[]>('/api/v1/categories', params as RequestOptions['query']),
      get: (uuid: string) => get<CategoryDto>(`/api/v1/categories/${uuid}`),
      create: (data: Record<string, unknown>) =>
        post<CategoryDto>('/api/v1/categories', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<CategoryDto>(`/api/v1/categories/${uuid}`, data),
    },

    topics: {
      list: (params?: { category_id?: string }) =>
        get<TopicDto[]>('/api/v1/topics', params as RequestOptions['query']),
      get: (uuid: string) => get<TopicDto>(`/api/v1/topics/${uuid}`),
      create: (data: Record<string, unknown>) => post<TopicDto>('/api/v1/topics', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<TopicDto>(`/api/v1/topics/${uuid}`, data),
    },

    tickets: {
      list: (params?: TicketListParams) =>
        get<TicketDto[]>('/api/v1/tickets', params as RequestOptions['query']),
      get: (uuid: string) => get<TicketDto>(`/api/v1/tickets/${uuid}`),
      create: (
        data: {
          customer_id: string;
          subject: string;
          body?: string;
          description?: string;
          priority?: string;
          channel?: string;
          source?: string;
          department_id?: string;
          category_id?: string;
          topic_id?: string;
        },
        idempotencyKey?: string,
      ) =>
        post<TicketDto>('/api/v1/tickets', data, {
          idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
        }),
      update: (uuid: string, data: Partial<TicketDto>) =>
        patch<TicketDto>(`/api/v1/tickets/${uuid}`, data),
      remove: (uuid: string) => del<{ id: string; deleted: boolean }>(`/api/v1/tickets/${uuid}`),
      changeStatus: (uuid: string, status: string, note?: string) =>
        post<TicketDto>(`/api/v1/tickets/${uuid}/status`, { status, note }),
      changePriority: (uuid: string, priority: string, note?: string) =>
        patch<TicketDto>(`/api/v1/tickets/${uuid}`, { priority, note }),
      assign: (
        uuid: string,
        data: { assigned_user_id?: string; team_id?: string; department_id?: string },
      ) => post<TicketDto>(`/api/v1/tickets/${uuid}/assign`, data),
      messages: (uuid: string) => get<MessageDto[]>(`/api/v1/tickets/${uuid}/messages`),
      addMessage: (
        uuid: string,
        data: { body: string; is_internal?: boolean; message_type?: string },
        idempotencyKey?: string,
      ) =>
        post<MessageDto>(`/api/v1/tickets/${uuid}/messages`, data, {
          idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
        }),
      watchers: (uuid: string) => get<{ user_id: string }[]>(`/api/v1/tickets/${uuid}/watchers`),
      addWatcher: (uuid: string, userUuid: string) =>
        post<{ user_id: string }>(`/api/v1/tickets/${uuid}/watchers`, { user_id: userUuid }),
      removeWatcher: (uuid: string, userUuid: string) =>
        del<{ removed: boolean }>(`/api/v1/tickets/${uuid}/watchers/${userUuid}`),
      uploadAttachment: async (uuid: string, file: File) => {
        const form = new FormData();
        form.append('file', file);

        const token = config.getToken();
        const response = await fetch(`${resolveBaseUrl()}/api/v1/tickets/${uuid}/attachments`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: form,
        });

        if (!response.ok) {
          throw new Error(`Attachment upload failed with status ${response.status}.`);
        }

        return (await response.json()) as ApiEnvelope<TicketAttachmentDto>;
      },
      attachmentUrl: (uuid: string, attachmentUuid: string) =>
        `${resolveBaseUrl()}/api/v1/tickets/${uuid}/attachments/${attachmentUuid}/download`,
    },

    events: {
      list: () => get<OutboxEventDto[]>('/api/v1/events'),
      publish: (eventType: string, payload?: unknown) =>
        post<OutboxEventDto>('/api/v1/events/publish', {
          event_type: eventType,
          payload,
        }),
    },

    slaPolicies: {
      list: () => get<SlaPolicyDto[]>('/api/v1/sla-policies'),
      get: (uuid: string) => get<SlaPolicyDto>(`/api/v1/sla-policies/${uuid}`),
      create: (data: Record<string, unknown>) =>
        post<SlaPolicyDto>('/api/v1/sla-policies', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<SlaPolicyDto>(`/api/v1/sla-policies/${uuid}`, data),
    },

    workflows: {
      list: () => get<WorkflowDto[]>('/api/v1/workflows'),
      get: (uuid: string) => get<WorkflowDto>(`/api/v1/workflows/${uuid}`),
      create: (data: Record<string, unknown>) => post<WorkflowDto>('/api/v1/workflows', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<WorkflowDto>(`/api/v1/workflows/${uuid}`, data),
      addStep: (uuid: string, data: Record<string, unknown>) =>
        post<WorkflowStepDto>(`/api/v1/workflows/${uuid}/steps`, data),
      updateStep: (uuid: string, stepKey: string, data: Record<string, unknown>) =>
        patch<WorkflowStepDto>(`/api/v1/workflows/${uuid}/steps/${stepKey}`, data),
      removeStep: (uuid: string, stepKey: string) =>
        del<{ message: string }>(`/api/v1/workflows/${uuid}/steps/${stepKey}`),
      reorderSteps: (uuid: string, stepKeys: string[]) =>
        post<WorkflowDto>(`/api/v1/workflows/${uuid}/steps/reorder`, { step_keys: stepKeys }),
      executions: () =>
        get<Record<string, unknown>[]>('/api/v1/workflow-executions'),
    },

    automations: {
      list: () => get<AutomationDto[]>('/api/v1/automations'),
      get: (uuid: string) => get<AutomationDto>(`/api/v1/automations/${uuid}`),
      create: (data: Record<string, unknown>) =>
        post<AutomationDto>('/api/v1/automations', data),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<AutomationDto>(`/api/v1/automations/${uuid}`, data),
    },

    webhooks: {
      list: () => get<WebhookDto[]>('/api/v1/webhooks'),
      get: (uuid: string) => get<WebhookDto>(`/api/v1/webhooks/${uuid}`),
      create: (
        data: { name: string; url: string; events: string[] },
        idempotencyKey?: string,
      ) =>
        post<WebhookDto>('/api/v1/webhooks', data, {
          idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
        }),
      update: (uuid: string, data: Record<string, unknown>) =>
        patch<WebhookDto>(`/api/v1/webhooks/${uuid}`, data),
      remove: (uuid: string) => del<{ message: string }>(`/api/v1/webhooks/${uuid}`),
      deliveries: (uuid: string) =>
        get<WebhookDeliveryDto[]>(`/api/v1/webhooks/${uuid}/deliveries`),
    },

    notifications: {
      list: () => get<NotificationDto[]>('/api/v1/notifications'),
    },

    search: {
      query: (params: SearchParams) =>
        get<SearchResponseDto>('/api/v1/search', {
          q: params.q,
          mode: params.mode,
          limit: params.limit,
        }),
      health: () => get<Record<string, unknown>>('/api/v1/search/health'),
      reindex: () => post<Record<string, unknown>>('/api/v1/search/reindex'),
      similar: (ticketUuid: string, limit?: number) =>
        get<SimilarTicketsDto>(`/api/v1/tickets/${ticketUuid}/similar`, { limit }),
    },

    knowledge: {
      bases: () => get<KnowledgeBaseDto[]>('/api/v1/knowledge/bases'),
      base: (uuid: string) => get<KnowledgeBaseDto>(`/api/v1/knowledge/bases/${uuid}`),
      createBase: (data: Record<string, unknown>) =>
        post<KnowledgeBaseDto>('/api/v1/knowledge/bases', data),
      updateBase: (uuid: string, data: Record<string, unknown>) =>
        patch<KnowledgeBaseDto>(`/api/v1/knowledge/bases/${uuid}`, data),
      articles: (params?: KnowledgeListParams) =>
        get<ArticleDto[]>('/api/v1/knowledge/articles', params as RequestOptions['query']),
      article: (uuid: string) => get<ArticleDto>(`/api/v1/knowledge/articles/${uuid}`),
      createArticle: (data: Record<string, unknown>) =>
        post<ArticleDto>('/api/v1/knowledge/articles', data),
      updateArticle: (uuid: string, data: Record<string, unknown>) =>
        patch<ArticleDto>(`/api/v1/knowledge/articles/${uuid}`, data),
      publishArticle: (uuid: string) =>
        post<ArticleDto>(`/api/v1/knowledge/articles/${uuid}/publish`),
      articleChunks: (uuid: string) =>
        get<Record<string, unknown>[]>(`/api/v1/knowledge/articles/${uuid}/chunks`),
    },

    ai: {
      /** The API expects `q` (not `question`) — see AiController::rag. */
      rag: (question: string, knowledgeBaseId?: string) =>
        request<RagResponseDto & { data?: RagResponseDto }>('/api/v1/ai/rag', {
          ...auth(),
          method: 'POST',
          body: { q: question, knowledge_base_id: knowledgeBaseId },
        }),
      analyze: (ticketUuid: string, type?: string) =>
        post<AiAnalysisDto[]>(`/api/v1/tickets/${ticketUuid}/ai/analyze`, { type }),
      analyses: (ticketUuid: string) =>
        get<AiAnalysisDto[]>(`/api/v1/tickets/${ticketUuid}/ai/analyses`),
      /** Returns a nested { suggestion, answer, sources, requires_human_approval } payload. */
      copilot: (ticketUuid: string, prompt?: string) =>
        post<CopilotResponseDto>(`/api/v1/tickets/${ticketUuid}/ai/copilot`, { prompt }),
      suggestions: (ticketUuid: string) =>
        get<AiSuggestionDto[]>(`/api/v1/tickets/${ticketUuid}/ai/suggestions`),
      acceptSuggestion: (uuid: string) =>
        post<AiSuggestionDto>(`/api/v1/ai/suggestions/${uuid}/accept`),
      rejectSuggestion: (uuid: string) =>
        post<AiSuggestionDto>(`/api/v1/ai/suggestions/${uuid}/reject`),
    },

    analytics: {
      summary: () => get<AnalyticsSummaryDto>('/api/v1/analytics/summary'),
    },

    // L8 — audit logs (§12), retention policies (§37), observability (§41).
    auditLogs: {
      list: (filters?: {
        action?: string;
        entity_type?: string;
        actor_id?: number;
        date_from?: string;
        date_to?: string;
        limit?: number;
      }) => get<Record<string, unknown>[]>('/api/v1/audit-logs', filters as RequestOptions['query']),
      get: (uuid: string) => get<Record<string, unknown>>(`/api/v1/audit-logs/${uuid}`),
      create: (data: {
        action: string;
        entity_type: string;
        entity_id?: string;
        old_values?: Record<string, unknown>;
        new_values?: Record<string, unknown>;
      }) => post<Record<string, unknown>>('/api/v1/audit-logs', data),
    },

    retention: {
      list: () => get<Record<string, unknown>[]>('/api/v1/retention-policies'),
      upsert: (dataClass: string, retentionDays: number) =>
        put<Record<string, unknown>>(`/api/v1/retention-policies/${dataClass}`, {
          retention_days: retentionDays,
        }),
    },

    metrics: {
      get: () => request<Record<string, unknown>>('/api/v1/metrics', { ...auth() }),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
