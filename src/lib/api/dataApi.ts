// FinoTicket V1 — unified data access
// One surface for both modes:
//   live → typed client against Laravel /api/v1 (DTOs mapped via adapters)
//   mock → existing in-memory mockStore (keeps the Pages demo working)
//
// Pages should import from here, never from `client.ts` or `mockStore.ts`
// directly, so switching modes needs no page changes.

import { isLiveMode } from './config';
import { sessionStore } from './session';
import { mockStore } from './mockStore';
import * as adapters from './adapters';
import type { ApiClient } from './client';
import type {
  Agent,
  Article,
  Automation,
  Category,
  Customer,
  Department,
  KnowledgeBase,
  Message,
  Product,
  SearchResult,
  SLAPolicy,
  Team,
  Tenant,
  Ticket,
  Topic,
  User,
  Webhook,
  Workflow,
} from '../../types';
import type { Notification } from '../../components/NotificationCenter';
import type { AnalyticsSummaryDto, ApiClientDto } from './dto';

export interface TicketListFilters {
  status?: string;
  priority?: string;
  customer_id?: string;
  department_id?: string;
  assigned_user_id?: string;
}

export interface CustomerListFilters {
  identity?: string;
  provider?: string;
}

export interface DataApi {
  readonly mode: 'live' | 'mock';

  tickets: {
    list(filters?: TicketListFilters): Promise<Ticket[]>;
    get(id: string): Promise<Ticket | undefined>;
    create(data: Record<string, unknown>): Promise<Ticket>;
    update(id: string, data: Partial<Ticket>): Promise<Ticket | undefined>;
    changeStatus(id: string, status: string, note?: string): Promise<Ticket | undefined>;
    changePriority(id: string, priority: string, note?: string): Promise<Ticket | undefined>;
    assign(
      id: string,
      data: { assigned_user_id?: string; team_id?: string; department_id?: string },
    ): Promise<Ticket | undefined>;
    messages(id: string): Promise<Message[]>;
    addMessage(id: string, data: { body: string; is_internal?: boolean }): Promise<Message>;
    watchers(id: string): Promise<{ user_id: string }[]>;
    addWatcher(id: string, userUuid: string): Promise<void>;
    removeWatcher(id: string, userUuid: string): Promise<void>;
    uploadAttachment(id: string, file: File): Promise<{ id: string; original_name: string; mime_type: string; size: number }>;
    attachmentUrl(id: string, attachmentUuid: string): string;
  };

  customers: {
    list(filters?: CustomerListFilters): Promise<Customer[]>;
    get(id: string): Promise<Customer | undefined>;
    create(data: { display_name: string; profile?: Record<string, unknown> }): Promise<Customer>;
    update(id: string, data: Partial<Customer>): Promise<Customer | undefined>;
    linkIdentity(id: string, data: { identifier: string; provider?: string }): Promise<void>;
    unlinkIdentity(id: string, identityUuid: string): Promise<void>;
  };

  departments: {
    list(productId?: string): Promise<Department[]>;
    create(data: {
      name: string;
      slug: string;
      product_id?: string;
      description?: string;
    }): Promise<Department>;
    update(id: string, data: Record<string, unknown>): Promise<Department>;
  };

  categories: {
    list(departmentId?: string): Promise<Category[]>;
    create(data: { name: string; slug: string; department_id?: string; parent_id?: string }): Promise<Category>;
    update(id: string, data: Record<string, unknown>): Promise<Category>;
  };

  topics: {
    list(categoryId?: string): Promise<Topic[]>;
    create(data: { name: string; slug: string; category_id?: string }): Promise<Topic>;
    update(id: string, data: Record<string, unknown>): Promise<Topic>;
  };

  teams: {
    list(departmentId?: string): Promise<Team[]>;
    create(data: Record<string, unknown>): Promise<Team>;
    update(id: string, data: Record<string, unknown>): Promise<Team>;
    addMember(id: string, data: { user_id: string; role?: string }): Promise<void>;
    removeMember(id: string, userUuid: string): Promise<void>;
  };

  agents: {
    list(): Promise<Agent[]>;
    create(data: Record<string, unknown>): Promise<Agent>;
    update(id: string, data: Record<string, unknown>): Promise<Agent>;
  };

  slaPolicies: {
    list(): Promise<SLAPolicy[]>;
    create(data: Record<string, unknown>): Promise<SLAPolicy>;
    update(id: string, data: Record<string, unknown>): Promise<SLAPolicy>;
  };

  workflows: {
    list(): Promise<Workflow[]>;
    create(data: Record<string, unknown>): Promise<Workflow>;
    update(id: string, data: Record<string, unknown>): Promise<Workflow>;
    addStep(id: string, data: Record<string, unknown>): Promise<void>;
    updateStep(id: string, stepKey: string, data: Record<string, unknown>): Promise<void>;
    removeStep(id: string, stepKey: string): Promise<void>;
    reorderSteps(id: string, stepKeys: string[]): Promise<void>;
  };

  automations: {
    list(): Promise<Automation[]>;
    create(data: Record<string, unknown>): Promise<Automation>;
    update(id: string, data: Record<string, unknown>): Promise<Automation>;
  };

  knowledgeBases: {
    list(): Promise<KnowledgeBase[]>;
    create(data: { name: string; scope?: string; product_id?: string }): Promise<KnowledgeBase>;
    update(id: string, data: Record<string, unknown>): Promise<KnowledgeBase>;
  };

  articles: {
    list(): Promise<Article[]>;
    create(data: Record<string, unknown>): Promise<Article>;
    update(id: string, data: Record<string, unknown>): Promise<Article>;
    publish(id: string): Promise<Article>;
    chunks(id: string): Promise<Record<string, unknown>[]>;
  };

  webhooks: {
    list(): Promise<Webhook[]>;
    create(data: { name: string; url: string; events: string[] }): Promise<Webhook>;
    update(id: string, data: Record<string, unknown>): Promise<Webhook>;
    remove(id: string): Promise<void>;
  };

  tenants: {
    list(): Promise<Tenant[]>;
    create(data: { name: string; slug: string }): Promise<Tenant>;
    update(id: string, data: Partial<Tenant>): Promise<Tenant>;
  };

  products: {
    list(): Promise<Product[]>;
    create(data: { name: string; slug: string }): Promise<Product>;
    update(id: string, data: Record<string, unknown>): Promise<Product>;
  };

  apiClients: {
    list(): Promise<ApiClientDto[]>;
    create(data: { name: string; scopes: string[] }): Promise<ApiClientDto>;
    update(id: string, data: { name?: string; scopes?: string[]; status?: string }): Promise<ApiClientDto>;
    revoke(id: string): Promise<void>;
  };

  users: {
    list(): Promise<User[]>;
    invite(data: { email: string; name?: string; role?: string }): Promise<User>;
  };

  notifications: { list(): Promise<Notification[]> };

  auditLogs: {
    list(filters?: { action?: string; entity_type?: string; date_from?: string; date_to?: string; limit?: number }): Promise<Record<string, unknown>[]>;
    create(data: { action: string; entity_type: string; new_values?: Record<string, unknown> }): Promise<Record<string, unknown>>;
  };

  retention: {
    list(): Promise<Record<string, unknown>[]>;
    upsert(dataClass: string, retentionDays: number): Promise<Record<string, unknown>>;
  };

  metrics: { get(): Promise<Record<string, unknown>> };

  search: {
    query(q: string, mode?: 'KEYWORD' | 'SEMANTIC' | 'HYBRID'): Promise<SearchResult[]>;
    similar(ticketId: string): Promise<SearchResult[]>;
  };

  ai: {
    rag(question: string): Promise<{ answer: string; sources: { title: string; url: string }[] }>;
    copilot(ticketId: string, prompt?: string): Promise<{ id: string; content: string; status: string; sources?: { title: string; url: string }[] }>;
    analyze(ticketId: string): Promise<Record<string, unknown>[]>;
    suggestions(ticketId: string): Promise<Record<string, unknown>[]>;
    acceptSuggestion(id: string): Promise<{ id: string; status: string }>;
    rejectSuggestion(id: string): Promise<{ id: string; status: string }>;
  };

  analytics: {
    summary(): Promise<AnalyticsSummaryDto | null>;
  };
}

/** Live implementation — each call maps DTOs into UI types. */
function createLiveApi(client: ApiClient): DataApi {
  return {
    mode: 'live',

    tickets: {
      async list(filters) {
        const { data } = await client.tickets.list(filters as never);
        return adapters.toTickets(data);
      },
      async get(id) {
        const { data } = await client.tickets.get(id);
        return adapters.toTicket(data);
      },
      async create(payload) {
        const body = payload as { customer_id: string; subject: string };
        const { data } = await client.tickets.create({
          customer_id: body.customer_id,
          subject: body.subject,
          ...payload,
        } as never);
        return adapters.toTicket(data);
      },
      async update(id, changes) {
        const { data } = await client.tickets.update(id, changes as never);
        return adapters.toTicket(data);
      },
      async changeStatus(id, status, note) {
        const { data } = await client.tickets.changeStatus(id, status, note);
        return adapters.toTicket(data);
      },
      async changePriority(id, priority, note) {
        const { data } = await client.tickets.changePriority(id, priority, note);
        return adapters.toTicket(data);
      },
      async assign(id, payload) {
        const { data } = await client.tickets.assign(id, payload);
        return adapters.toTicket(data);
      },
      async messages(id) {
        const { data } = await client.tickets.messages(id);
        return adapters.toMessages(data, id);
      },
      async addMessage(id, payload) {
        const { data } = await client.tickets.addMessage(id, payload);
        return adapters.toMessage(data, id);
      },
      async watchers(id) {
        const { data } = await client.tickets.watchers(id);
        return data;
      },
      async addWatcher(id, userUuid) {
        await client.tickets.addWatcher(id, userUuid);
      },
      async removeWatcher(id, userUuid) {
        await client.tickets.removeWatcher(id, userUuid);
      },
      async uploadAttachment(id, file) {
        const { data } = await client.tickets.uploadAttachment(id, file);
        return data;
      },
      attachmentUrl(id, attachmentUuid) {
        return client.tickets.attachmentUrl(id, attachmentUuid);
      },
    },

    customers: {
      async list(filters) {
        const { data } = await client.customers.list(filters);
        return adapters.toCustomers(data);
      },
      async get(id) {
        const { data } = await client.customers.get(id);
        return adapters.toCustomer(data);
      },
      async create(payload) {
        const { data } = await client.customers.create(payload);
        return adapters.toCustomer(data);
      },
      async update(id, changes) {
        // Now backed by PATCH /customers/{uuid}.
        const { data } = await client.customers.update(id, {
          display_name: changes.display_name,
          status: changes.status,
          profile: changes.profile as Record<string, unknown> | undefined,
        });
        return adapters.toCustomer(data);
      },
      async linkIdentity(id, payload) {
        await client.customers.linkIdentity(id, payload);
      },
      async unlinkIdentity(id, identityUuid) {
        await client.customers.unlinkIdentity(id, identityUuid);
      },
    },

    departments: {
      async list(productId) {
        const { data } = await client.departments.list(productId ? { product_id: productId } : undefined);
        return adapters.toDepartments(data);
      },
      async create(payload) {
        const { data } = await client.departments.create(payload);
        return adapters.toDepartment(data);
      },
      async update(id, payload) {
        const { data } = await client.departments.update(id, payload);
        return adapters.toDepartment(data);
      },
    },

    categories: {
      async list(departmentId) {
        const { data } = await client.categories.list(
          departmentId ? { department_id: departmentId } : undefined,
        );
        return adapters.toCategories(data);
      },
      async create(payload) {
        const { data } = await client.categories.create(payload);
        return adapters.toCategory(data);
      },
      async update(id, payload) {
        const { data } = await client.categories.update(id, payload);
        return adapters.toCategory(data);
      },
    },

    topics: {
      async list(categoryId) {
        const { data } = await client.topics.list(
          categoryId ? { category_id: categoryId } : undefined,
        );
        return adapters.toTopics(data);
      },
      async create(payload) {
        const { data } = await client.topics.create(payload);
        return adapters.toTopic(data);
      },
      async update(id, payload) {
        const { data } = await client.topics.update(id, payload);
        return adapters.toTopic(data);
      },
    },

    teams: {
      async list(departmentId) {
        const { data } = await client.teams.list(
          departmentId ? { department_id: departmentId } : undefined,
        );
        return adapters.toTeams(data);
      },
      async create(payload) {
        const { data } = await client.teams.create(payload);
        return adapters.toTeam(data);
      },
      async update(id, payload) {
        const { data } = await client.teams.update(id, payload);
        return adapters.toTeam(data);
      },
      async addMember(id, payload) {
        await client.teams.addMember(id, payload);
      },
      async removeMember(id, userUuid) {
        await client.teams.removeMember(id, userUuid);
      },
    },

    agents: {
      async list() {
        const { data } = await client.agents.list();
        return adapters.toAgents(data);
      },
      async create(payload) {
        const { data } = await client.agents.create(payload);
        return adapters.toAgent(data);
      },
      async update(id, payload) {
        const { data } = await client.agents.update(id, payload);
        return adapters.toAgent(data);
      },
    },

    slaPolicies: {
      async list() {
        const { data } = await client.slaPolicies.list();
        return adapters.toSlaPolicies(data);
      },
      async create(payload) {
        const { data } = await client.slaPolicies.create(payload);
        return adapters.toSlaPolicy(data);
      },
      async update(id, payload) {
        const { data } = await client.slaPolicies.update(id, payload);
        return adapters.toSlaPolicy(data);
      },
    },

    workflows: {
      async list() {
        const { data } = await client.workflows.list();
        return adapters.toWorkflows(data);
      },
      async create(payload) {
        const { data } = await client.workflows.create(payload);
        return adapters.toWorkflow(data);
      },
      async addStep(id, payload) {
        await client.workflows.addStep(id, payload);
      },
      async update(id, payload) {
        const { data } = await client.workflows.update(id, payload);
        return adapters.toWorkflow(data);
      },
      async updateStep(id, stepKey, payload) {
        await client.workflows.updateStep(id, stepKey, payload);
      },
      async removeStep(id, stepKey) {
        await client.workflows.removeStep(id, stepKey);
      },
      async reorderSteps(id, stepKeys) {
        await client.workflows.reorderSteps(id, stepKeys);
      },
    },

    automations: {
      async list() {
        const { data } = await client.automations.list();
        return adapters.toAutomations(data);
      },
      async create(payload) {
        const { data } = await client.automations.create(payload);
        return adapters.toAutomation(data);
      },
      async update(id, payload) {
        const { data } = await client.automations.update(id, payload);
        return adapters.toAutomation(data);
      },
    },

    knowledgeBases: {
      async list() {
        const { data } = await client.knowledge.bases();
        return adapters.toKnowledgeBases(data);
      },
      async create(payload) {
        const { data } = await client.knowledge.createBase(payload);
        return adapters.toKnowledgeBase(data);
      },
      async update(id, payload) {
        const { data } = await client.knowledge.updateBase(id, payload);
        return adapters.toKnowledgeBase(data);
      },
    },

    articles: {
      async list() {
        const { data } = await client.knowledge.articles();
        return adapters.toArticles(data);
      },
      async create(payload) {
        const { data } = await client.knowledge.createArticle(payload);
        return adapters.toArticle(data);
      },
      async update(id, payload) {
        const { data } = await client.knowledge.updateArticle(id, payload);
        return adapters.toArticle(data);
      },
      async publish(id) {
        const { data } = await client.knowledge.publishArticle(id);
        return adapters.toArticle(data);
      },
      async chunks(id) {
        const { data } = await client.knowledge.articleChunks(id);
        return data;
      },
    },

    webhooks: {
      async list() {
        const { data } = await client.webhooks.list();
        return adapters.toWebhooks(data);
      },
      async create(payload) {
        const { data } = await client.webhooks.create(payload);
        return adapters.toWebhook(data);
      },
      async update(id, payload) {
        const { data } = await client.webhooks.update(id, payload);
        return adapters.toWebhook(data);
      },
      async remove(id) {
        await client.webhooks.remove(id);
      },
    },

    tenants: {
      async list() {
        const { data } = await client.tenants.list();
        return adapters.toTenants(data);
      },
      async create(payload) {
        const { data } = await client.tenants.create(payload);
        return adapters.toTenant(data);
      },
      async update(id, changes) {
        const { data } = await client.tenants.update(id, changes);
        return adapters.toTenant(data);
      },
    },

    products: {
      async list() {
        const { data } = await client.products.list();
        return adapters.toProducts(data);
      },
      async create(payload) {
        const { data } = await client.products.create(payload);
        return adapters.toProduct(data);
      },
      async update(id, payload) {
        const { data } = await client.products.update(id, payload);
        return adapters.toProduct(data);
      },
    },

    apiClients: {
      async list() {
        const { data } = await client.apiClients.list();
        return data;
      },
      async create(payload) {
        const { data } = await client.apiClients.create(payload);
        return data;
      },
      async update(id, payload) {
        const { data } = await client.apiClients.update(id, payload);
        return data;
      },
      async revoke(id) {
        await client.apiClients.revoke(id);
      },
    },

    users: {
      async list() {
        const { data } = await client.users.list();
        return adapters.toUsers(data);
      },
      async invite(payload) {
        const { data } = await client.users.invite(payload);
        return adapters.toUser(data);
      },
    },

    notifications: {
      async list() {
        const { data } = await client.notifications.list();
        return adapters.toNotifications(data);
      },
    },

    auditLogs: {
      async list(filters) {
        const { data } = await client.auditLogs.list(filters);
        return data as unknown as Record<string, unknown>[];
      },
      async create(payload) {
        const { data } = await client.auditLogs.create(payload);
        return data as unknown as Record<string, unknown>;
      },
    },

    retention: {
      async list() {
        const { data } = await client.retention.list();
        return data;
      },
      async upsert(dataClass, retentionDays) {
        const { data } = await client.retention.upsert(dataClass, retentionDays);
        return data;
      },
    },

    metrics: {
      async get() {
        return client.metrics.get();
      },
    },

    search: {
      async query(q, mode) {
        const { data } = await client.search.query({ q, mode });
        return adapters.toSearchResults(data.hits);
      },
      async similar(ticketId) {
        const { data } = await client.search.similar(ticketId);
        return adapters.toSearchResults(data.similar);
      },
    },

    ai: {
      async rag(question) {
        const response = await client.ai.rag(question);
        // The endpoint returns either a bare object or { data: {...} }.
        const body = (response as { data?: unknown }).data ?? response;

        return body as { answer: string; sources: { title: string; url: string }[] };
      },
      async copilot(ticketId, prompt) {
        const { data } = await client.ai.copilot(ticketId, prompt);

        return {
          id: data.suggestion.id,
          content: data.suggestion.content,
          status: data.suggestion.status,
          sources: (data.suggestion.sources ?? []).map((source) => ({
            title: source.title,
            url: source.url ?? '',
          })),
        };
      },
      async analyze(ticketId) {
        const { data } = await client.ai.analyze(ticketId);
        return data as unknown as Record<string, unknown>[];
      },
      async suggestions(ticketId) {
        const { data } = await client.ai.suggestions(ticketId);
        return data as unknown as Record<string, unknown>[];
      },
      async acceptSuggestion(id) {
        const { data } = await client.ai.acceptSuggestion(id);
        return { id: data.id, status: data.status };
      },
      async rejectSuggestion(id) {
        const { data } = await client.ai.rejectSuggestion(id);
        return { id: data.id, status: data.status };
      },
    },

    analytics: {
      async summary() {
        const { data } = await client.analytics.summary();
        return data;
      },
    },
  };
}

/** Mock implementation — wraps the existing synchronous store in promises. */
function createMockApi(): DataApi {
  const asPromise = <T>(value: T): Promise<T> => Promise.resolve(value);
  /** mockStore returns `null`; the DataApi contract uses `undefined`. */
  const optional = <T>(value: T | null): T | undefined => value ?? undefined;

  return {
    mode: 'mock',

    tickets: {
      list: (filters) =>
        asPromise(
          mockStore.getTickets().filter((ticket) => {
            if (!filters) return true;
            if (filters.status && ticket.status !== filters.status) return false;
            if (filters.priority && ticket.priority !== filters.priority) return false;
            if (filters.customer_id && ticket.customer_id !== filters.customer_id) return false;
            if (filters.department_id && ticket.department_id !== filters.department_id) {
              return false;
            }
            if (filters.assigned_user_id && ticket.assignee_id !== filters.assigned_user_id) {
              return false;
            }
            return true;
          }),
        ),
      get: (id) => asPromise(optional(mockStore.getTicket(id))),
      create: (data) =>
        asPromise(mockStore.createTicket(data as never) as unknown as Ticket),
      update: (id, data) => asPromise(optional(mockStore.updateTicket(id, data))),
      changeStatus: (id, status, note) =>
        asPromise(optional(mockStore.changeTicketStatus(id, status as never, note))),
      changePriority: (id, priority, note) =>
        asPromise(optional(mockStore.changeTicketPriority(id, priority as never, note))),
      assign: (id, data) => {
        const assigneeId = data.assigned_user_id ?? data.team_id ?? data.department_id ?? '';
        const agent = mockStore.getAgents().find((candidate) => candidate.id === assigneeId);
        return asPromise(
          optional(mockStore.assignTicket(id, assigneeId, agent?.display_name ?? assigneeId)),
        );
      },
      messages: (id) => asPromise(mockStore.getMessages(id)),
      addMessage: (id, data) =>
        asPromise(
          mockStore.addMessage({
            ticket_id: id,
            body: data.body,
            is_internal: data.is_internal ?? false,
          } as never),
        ),
      watchers: (id) => {
        const ticket = mockStore.getTicket(id);
        return asPromise((ticket?.watchers ?? []).map((user_id) => ({ user_id })));
      },
      addWatcher: (id, userUuid) => {
        mockStore.addWatcher(id, userUuid);
        return asPromise(undefined);
      },
      removeWatcher: (id, userUuid) => {
        mockStore.removeWatcher(id, userUuid);
        return asPromise(undefined);
      },
      uploadAttachment: (id, file) =>
        asPromise(
          mockStore.addTicketAttachment(id, {
            filename: file.name,
            mime_type: file.type,
            size: file.size,
            url: '',
          }) as { id: string; filename: string; mime_type: string; size: number },
        ).then((a) => ({
          id: a.id,
          original_name: a.filename,
          mime_type: a.mime_type,
          size: a.size,
        })),
      attachmentUrl: () => '',
    },

    customers: {
      list: () => asPromise(mockStore.getCustomers()),
      get: (id) => asPromise(optional(mockStore.getCustomer(id))),
      create: (data) =>
        asPromise(mockStore.createCustomer(data as never) as unknown as Customer),
      update: (id, data) => asPromise(optional(mockStore.updateCustomer(id, data))),
      linkIdentity: (id, data) => {
        mockStore.linkCustomerIdentity(id, {
          provider: data.provider ?? 'FINOID',
          provider_user_id: data.identifier,
        } as never);
        return asPromise(undefined);
      },
      unlinkIdentity: (id, identityId) => {
        mockStore.unlinkCustomerIdentity(id, identityId);
        return asPromise(undefined);
      },
    },

    departments: {
      list: (productId) =>
        asPromise(
          productId
            ? mockStore.getDepartments().filter((d) => d.product_id === productId)
            : mockStore.getDepartments(),
        ),
      create: (data) =>
        asPromise(mockStore.createDepartment(data as never) as unknown as Department),
      update: (id, data) =>
        asPromise(mockStore.updateDepartment(id, data as never) as unknown as Department),
    },

    categories: {
      list: (departmentId) =>
        asPromise(
          departmentId
            ? mockStore.getCategories().filter((c) => c.department_id === departmentId)
            : mockStore.getCategories(),
        ),
      create: (data) =>
        asPromise(mockStore.createCategory(data as never) as unknown as Category),
      update: (id, data) =>
        asPromise(mockStore.updateCategory(id, data as never) as unknown as Category),
    },

    topics: {
      list: (categoryId) =>
        asPromise(
          categoryId
            ? mockStore.getTopics().filter((t) => t.category_id === categoryId)
            : mockStore.getTopics(),
        ),
      create: (data) => asPromise(mockStore.createTopic(data as never) as unknown as Topic),
      update: (id, data) =>
        asPromise(mockStore.updateTopic(id, data as never) as unknown as Topic),
    },

    teams: {
      list: (departmentId) =>
        asPromise(
          departmentId
            ? mockStore.getTeams().filter((t) => t.department_id === departmentId)
            : mockStore.getTeams(),
        ),
      create: (data) => asPromise(mockStore.createTeam(data as never) as unknown as Team),
      update: (id, data) =>
        asPromise(mockStore.updateTeam(id, data as never) as unknown as Team),
      addMember: (id, data) => {
        mockStore.addTeamMember(id, data as never);
        return asPromise(undefined);
      },
      removeMember: (id, userUuid) => {
        mockStore.removeTeamMember(id, userUuid);
        return asPromise(undefined);
      },
    },

    agents: {
      list: () => asPromise(mockStore.getAgents()),
      create: (data) =>
        asPromise(mockStore.createAgent(data as never) as unknown as Agent),
      update: (id, data) =>
        asPromise(mockStore.updateAgent(id, data as never) as unknown as Agent),
    },

    slaPolicies: {
      list: () => asPromise(mockStore.getSLAPolicies()),
      create: (data) =>
        asPromise(mockStore.createSLAPolicy(data as never) as unknown as SLAPolicy),
      update: (id, data) =>
        asPromise(mockStore.updateSLAPolicy(id, data as never) as unknown as SLAPolicy),
    },

    workflows: {
      list: () => asPromise(mockStore.getWorkflows()),
      create: (data) =>
        asPromise(mockStore.createWorkflow(data as never) as unknown as Workflow),
      update: (id, data) =>
        asPromise(mockStore.updateWorkflow(id, data as never) as unknown as Workflow),
      addStep: (id, data) => {
        mockStore.addWorkflowStep(id, data as never);
        return asPromise(undefined);
      },
      updateStep: (id, stepKey, data) => {
        mockStore.updateWorkflowStep(id, stepKey, data as never);
        return asPromise(undefined);
      },
      removeStep: (id, stepKey) => {
        mockStore.removeWorkflowStep(id, stepKey);
        return asPromise(undefined);
      },
      reorderSteps: (id, stepKeys) => {
        mockStore.reorderWorkflowSteps(id, stepKeys);
        return asPromise(undefined);
      },
    },

    automations: {
      list: () => asPromise(mockStore.getAutomations()),
      create: (data) =>
        asPromise(mockStore.createAutomation(data as never) as unknown as Automation),
      update: (id, data) =>
        asPromise(mockStore.updateAutomation(id, data as never) as unknown as Automation),
    },

    knowledgeBases: {
      list: () => asPromise(mockStore.getKnowledgeBases()),
      create: (data) =>
        asPromise(mockStore.createKnowledgeBase(data as never) as unknown as KnowledgeBase),
      update: (id, data) =>
        asPromise(mockStore.updateKnowledgeBase(id, data as never) as unknown as KnowledgeBase),
    },

    articles: {
      list: () => asPromise(mockStore.getArticles()),
      create: (data) => asPromise(mockStore.createArticle(data as never) as unknown as Article),
      update: (id, data) =>
        asPromise(mockStore.updateArticle(id, data as never) as unknown as Article),
      publish: (id) =>
        asPromise(mockStore.publishArticle(id) as unknown as Article),
      chunks: () => asPromise([] as Record<string, unknown>[]),
    },

    webhooks: {
      list: () => asPromise(mockStore.getWebhooks()),
      create: (data) => asPromise(mockStore.createWebhook(data as never) as unknown as Webhook),
      update: (id, data) =>
        asPromise(mockStore.updateWebhook(id, data as never) as unknown as Webhook),
      remove: (id) => {
        mockStore.removeWebhook(id);
        return asPromise(undefined);
      },
    },

    tenants: {
      list: () => asPromise(mockStore.getTenants()),
      create: (data) => asPromise(mockStore.createTenant(data as never) as unknown as Tenant),
      update: (id, data) =>
        asPromise(mockStore.updateTenant(id, data as never) as unknown as Tenant),
    },

    products: {
      list: () => asPromise(mockStore.getProducts()),
      create: (data) => asPromise(mockStore.createProduct(data as never) as unknown as Product),
      update: (id, data) =>
        asPromise(mockStore.updateProduct(id, data as never) as unknown as Product),
    },

    apiClients: {
      list: () => asPromise(mockStore.getAPIClients() as unknown as ApiClientDto[]),
      create: (data) =>
        asPromise(mockStore.createAPIClient(data as never) as unknown as ApiClientDto),
      update: (id, data) =>
        asPromise(mockStore.updateAPIClient(id, data as never) as unknown as ApiClientDto),
      revoke: (id) => {
        mockStore.revokeAPIClient(id);
        return asPromise(undefined);
      },
    },

    users: {
      list: () => asPromise(mockStore.getUsers()),
      invite: (data) =>
        asPromise(mockStore.inviteUser(data as never) as unknown as User),
    },
    notifications: { list: () => asPromise(mockStore.getNotifications()) },

    auditLogs: {
      list: (filters) => {
        let logs = mockStore.getAuditLogs() as unknown as Record<string, unknown>[];
        if (filters?.action) {
          logs = logs.filter((log) => log.action === filters.action);
        }
        return asPromise(filters?.limit ? logs.slice(0, filters.limit) : logs);
      },
      create: (data) =>
        asPromise(
          mockStore.addAuditLog(data as never) as unknown as Record<string, unknown>,
        ),
    },

    retention: {
      // Mock mode has no persistence for policies; return sensible defaults.
      list: () => asPromise([] as Record<string, unknown>[]),
      upsert: (dataClass, retentionDays) =>
        asPromise({ data_class: dataClass, retention_days: retentionDays, status: 'ACTIVE' }),
    },

    metrics: {
      get: () =>
        asPromise({
          service: 'finoticket',
          version: 'mock',
          metrics: { database: {}, queue: {}, api: {}, ai: {}, search: {} },
        }),
    },

    search: {
      query: (q, mode) =>
        asPromise(
          mockStore.search({ q, mode: mode ?? 'KEYWORD' }) as unknown as SearchResult[],
        ),
      similar: () => asPromise([] as SearchResult[]),
    },

    ai: {
      rag: () => asPromise({ answer: '', sources: [] }),
      copilot: (_ticketId, prompt) =>
        asPromise({
          id: `sug-${Date.now()}`,
          content: prompt ?? '',
          status: 'PENDING',
          sources: [],
        }),
      analyze: () => asPromise([]),
      suggestions: () => asPromise([]),
      acceptSuggestion: (id) => asPromise({ id, status: 'ACCEPTED' }),
      rejectSuggestion: (id) => asPromise({ id, status: 'REJECTED' }),
    },

    analytics: {
      // Mock analytics are computed in-page from mockStore series.
      summary: () => asPromise(null),
    },
  };
}

let cached: DataApi | null = null;

/** Resolve the data API for the configured mode. */
export function getDataApi(): DataApi {
  if (cached) return cached;

  cached = isLiveMode() ? createLiveApi(sessionStore.buildClient()) : createMockApi();
  return cached;
}

/** Drop the cached instance (used after login/logout and in tests). */
export function resetDataApi() {
  cached = null;
}

export { createLiveApi, createMockApi };
