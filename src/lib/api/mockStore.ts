// Mock Service Worker setup for FinoTicket API
// This provides in-memory persistence for all API operations with React reactivity

import { mockTickets, mockCustomers, mockCategories, mockDepartments, mockTeams, mockAgents, mockSLAPolicies, mockKnowledgeBases, mockArticles, mockProducts, mockTopics, mockTenants } from '../../data/mock';
import type { Ticket, Customer, Message, Category, Department, Team, Agent, SLAPolicy, KnowledgeBase, Article, Product, Workflow, WorkflowStep, Topic, Tenant } from '../../types';
import type { TimelineEvent } from '../../components/Timeline';

// In-memory store with subscription support
class MockStore {
  tickets: Ticket[] = [...mockTickets];
  customers: Customer[] = [...mockCustomers];
  messages: Message[] = [];
  categories: Category[] = [...mockCategories];
  departments: Department[] = [...mockDepartments];
  teams: Team[] = [...mockTeams];
  agents: Agent[] = [...mockAgents];
  slaPolicies: SLAPolicy[] = [...mockSLAPolicies];
  knowledgeBases: KnowledgeBase[] = [...mockKnowledgeBases];
  articles: Article[] = [...mockArticles];
  products: Product[] = [...mockProducts];
  topics: Topic[] = [...mockTopics];
  tenants: Tenant[] = [...mockTenants];
  workflows: Workflow[] = [
    {
      id: 'wf-1',
      name: 'Auto-assign to Tech',
      event: 'ticket.created',
      status: 'ACTIVE',
      version: 2,
      steps: [
        {
          id: 'step-1',
          type: 'CONDITION',
          step_key: 'check_priority',
          config: { field: 'priority', operator: 'equals', value: 'HIGH' },
          sort_order: 0,
        },
        {
          id: 'step-2',
          type: 'ACTION',
          step_key: 'assign_department',
          config: { department_id: 'dept-tech', assignee_role: 'AGENT' },
          sort_order: 1,
        },
      ],
      created_at: '2024-01-10T08:00:00Z',
    },
    {
      id: 'wf-2',
      name: 'SLA Breach Notification',
      event: 'sla.breached',
      status: 'ACTIVE',
      version: 1,
      steps: [
        {
          id: 'step-3',
          type: 'NOTIFICATION',
          step_key: 'notify_manager',
          config: { channel: 'email', template: 'sla_breach', recipients: ['manager'] },
          sort_order: 0,
        },
      ],
      created_at: '2024-01-12T10:30:00Z',
    },
  ];
  
  // Append-only history log per ticket
  historyByTicketId: Map<string, TimelineEvent[]> = new Map();
  
  // Subscription system for React reactivity
  private listeners: Set<() => void> = new Set();
  private version: number = 0;

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    return this.version;
  }

  private notify() {
    this.version++;
    this.listeners.forEach(listener => listener());
  }

  // Tickets
  getTickets() {
    return this.tickets;
  }

  getTicket(id: string) {
    return this.tickets.find(t => t.id === id);
  }

  getTicketHistory(id: string): TimelineEvent[] {
    return this.historyByTicketId.get(id) || [];
  }

  private addHistoryEvent(ticketId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) {
    if (!this.historyByTicketId.has(ticketId)) {
      this.historyByTicketId.set(ticketId, []);
    }
    const events = this.historyByTicketId.get(ticketId)!;
    events.push({
      ...event,
      id: `evt-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    });
  }

  createTicket(ticket: Partial<Ticket>) {
    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      tenant_id: ticket.tenant_id || 'ten-1', // Default to demo tenant
      ticket_number: `FT-${1000 + this.tickets.length + 1}`,
      subject: ticket.subject || '',
      description: ticket.description,
      status: 'OPEN',
      priority: ticket.priority || 'NORMAL',
      product_id: ticket.product_id || '',
      product_name: ticket.product_name,
      customer_id: ticket.customer_id || '',
      customer_name: ticket.customer_name,
      category_id: ticket.category_id,
      category_name: ticket.category_name,
      department_id: ticket.department_id,
      department_name: ticket.department_name,
      team_id: ticket.team_id,
      team_name: ticket.team_name,
      assignee_id: ticket.assignee_id,
      assignee_name: ticket.assignee_name,
      channel: ticket.channel || 'WEB',
      source: ticket.source || 'web',
      tags: ticket.tags || [],
      watchers: ticket.watchers || [],
      sla_policy_id: ticket.sla_policy_id,
      sla_status: 'ON_TRACK',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);
    
    // Add history event
    this.addHistoryEvent(newTicket.id, {
      type: 'created',
      title: 'تیکت ایجاد شد',
      actor: ticket.customer_name || 'مشتری',
    });
    
    this.notify();
    return newTicket;
  }

  updateTicket(id: string, updates: Partial<Ticket>) {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.tickets[index] = { ...this.tickets[index], ...updates, updated_at: new Date().toISOString() };
    this.notify();
    return this.tickets[index];
  }

  assignTicket(id: string, assignee_id: string, assignee_name: string) {
    const result = this.updateTicket(id, { assignee_id, assignee_name });
    if (result) {
      this.addHistoryEvent(id, {
        type: 'assigned',
        title: `ارجاع به ${assignee_name}`,
        actor: 'سیستم',
      });
    }
    return result;
  }

  changeTicketStatus(id: string, status: Ticket['status']) {
    const result = this.updateTicket(id, { status });
    if (result) {
      this.addHistoryEvent(id, {
        type: 'status_change',
        title: `وضعیت تغییر کرد`,
        description: status,
        actor: 'کارشناس',
      });
    }
    return result;
  }

  changeTicketPriority(id: string, priority: Ticket['priority']) {
    const result = this.updateTicket(id, { priority });
    if (result) {
      this.addHistoryEvent(id, {
        type: 'updated',
        title: `اولویت تغییر کرد`,
        description: priority,
        actor: 'کارشناس',
      });
    }
    return result;
  }

  addWatcher(id: string, watcher_id: string) {
    const ticket = this.getTicket(id);
    if (!ticket) return null;
    if (!ticket.watchers.includes(watcher_id)) {
      ticket.watchers.push(watcher_id);
      this.addHistoryEvent(id, {
        type: 'updated',
        title: 'ناظر اضافه شد',
        actor: 'کارشناس',
      });
      this.notify();
    }
    return ticket;
  }

  removeWatcher(id: string, watcher_id: string) {
    const ticket = this.getTicket(id);
    if (!ticket) return null;
    ticket.watchers = ticket.watchers.filter((w: string) => w !== watcher_id);
    this.addHistoryEvent(id, {
      type: 'updated',
      title: 'ناظر حذف شد',
      actor: 'کارشناس',
    });
    this.notify();
    return ticket;
  }

  updateTicketTags(id: string, tags: string[]) {
    const result = this.updateTicket(id, { tags });
    if (result) {
      this.addHistoryEvent(id, {
        type: 'updated',
        title: 'برچسب‌ها بروزرسانی شد',
        actor: 'کارشناس',
      });
    }
    return result;
  }

  // Messages
  getMessages(ticketId: string) {
    return this.messages.filter(m => m.ticket_id === ticketId);
  }

  addMessage(message: Partial<Message>) {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      ticket_id: message.ticket_id || '',
      sender_type: message.sender_type || 'AGENT',
      sender_id: message.sender_id || '',
      sender_name: message.sender_name || '',
      body: message.body || '',
      is_internal: message.is_internal || false,
      channel: message.channel || 'WEB',
      attachments: message.attachments || [],
      created_at: new Date().toISOString(),
    };
    this.messages.push(newMessage);
    
    // Add history event for message
    this.addHistoryEvent(newMessage.ticket_id, {
      type: 'message',
      title: `${newMessage.sender_name} پیام ارسال کرد`,
      description: newMessage.body.substring(0, 100) + (newMessage.body.length > 100 ? '...' : ''),
      actor: newMessage.sender_name,
    });
    
    this.notify();
    return newMessage;
  }

  // Customers
  getCustomers() {
    return this.customers;
  }

  getCustomer(id: string) {
    return this.customers.find(c => c.id === id);
  }

  createCustomer(customer: Partial<Customer>) {
    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      display_name: customer.display_name || '',
      status: customer.status || 'ACTIVE',
      profile: customer.profile || {},
      identities: customer.identities || [],
      addresses: customer.addresses || [],
      tags: customer.tags || [],
      created_at: new Date().toISOString(),
    };
    this.customers.push(newCustomer);
    this.notify();
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.customers[index] = { ...this.customers[index], ...updates };
    this.notify();
    return this.customers[index];
  }

  // Categories
  getCategories() {
    return this.categories;
  }

  getCategory(id: string) {
    return this.categories.find(c => c.id === id);
  }

  createCategory(category: Partial<Category>) {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      tenant_id: category.tenant_id || 'ten-1',
      department_id: category.department_id || '',
      name: category.name || '',
      slug: category.slug || '',
      description: category.description,
      parent_id: category.parent_id,
      status: category.status || 'ACTIVE',
      sort_order: category.sort_order || this.categories.length + 1,
    };
    this.categories.push(newCategory);
    this.notify();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.categories[index] = { ...this.categories[index], ...updates };
    this.notify();
    return this.categories[index];
  }

  // Departments
  getDepartments() {
    return this.departments;
  }

  getDepartment(id: string) {
    return this.departments.find(d => d.id === id);
  }

  createDepartment(department: Partial<Department>) {
    const newDepartment: Department = {
      id: `d-${Date.now()}`,
      tenant_id: department.tenant_id || 'ten-1',
      product_id: department.product_id || '',
      name: department.name || '',
      slug: department.slug || '',
      description: department.description,
      status: department.status || 'ACTIVE',
    };
    this.departments.push(newDepartment);
    this.notify();
    return newDepartment;
  }

  updateDepartment(id: string, updates: Partial<Department>) {
    const index = this.departments.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.departments[index] = { ...this.departments[index], ...updates };
    this.notify();
    return this.departments[index];
  }

  // Teams
  getTeams() {
    return this.teams;
  }

  getTeam(id: string) {
    return this.teams.find(t => t.id === id);
  }

  createTeam(team: Partial<Team>) {
    const newTeam: Team = {
      id: `tm-${Date.now()}`,
      tenant_id: team.tenant_id || 'ten-1',
      product_id: team.product_id || '',
      department_id: team.department_id || '',
      category_id: team.category_id || null,
      scope: team.scope || 'DEPARTMENT',
      name: team.name || '',
      slug: team.slug || '',
      status: team.status || 'ACTIVE',
      members: team.members || [],
    };
    this.teams.push(newTeam);
    this.notify();
    return newTeam;
  }

  updateTeam(id: string, updates: Partial<Team>) {
    const index = this.teams.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.teams[index] = { ...this.teams[index], ...updates };
    this.notify();
    return this.teams[index];
  }

  // Agents
  getAgents() {
    return this.agents;
  }

  // SLA Policies
  getSLAPolicies() {
    return this.slaPolicies;
  }

  createSLAPolicy(policy: Partial<SLAPolicy>) {
    const newPolicy: SLAPolicy = {
      id: `sla-${Date.now()}`,
      name: policy.name || '',
      priority: policy.priority || 'NORMAL',
      first_response_seconds: policy.first_response_seconds || 3600,
      resolution_seconds: policy.resolution_seconds || 86400,
      business_hours_id: policy.business_hours_id,
      status: policy.status || 'ACTIVE',
    };
    this.slaPolicies.push(newPolicy);
    this.notify();
    return newPolicy;
  }

  updateSLAPolicy(id: string, updates: Partial<SLAPolicy>) {
    const index = this.slaPolicies.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.slaPolicies[index] = { ...this.slaPolicies[index], ...updates };
    this.notify();
    return this.slaPolicies[index];
  }

  // Products
  getProducts() {
    return this.products;
  }

  getProduct(id: string) {
    return this.products.find(p => p.id === id);
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...updates };
    this.notify();
    return this.products[index];
  }

  createProduct(product: Partial<Product>) {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      tenant_id: product.tenant_id || 'ten-1',
      name: product.name || '',
      slug: product.slug || '',
      status: product.status || 'ACTIVE',
      settings: product.settings || {},
      channels: product.channels || ['WEB'],
      widget_branding: product.widget_branding,
      created_at: new Date().toISOString(),
    };
    this.products.push(newProduct);
    this.notify();
    return newProduct;
  }

  // Workflows
  getWorkflows() {
    return this.workflows;
  }

  getWorkflow(id: string) {
    return this.workflows.find(w => w.id === id);
  }

  addWorkflowStep(workflowId: string, step: Omit<WorkflowStep, 'id'>) {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return null;

    const newStep: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
    };

    workflow.steps.push(newStep);
    workflow.version++;
    this.notify();
    return newStep;
  }

  updateWorkflowStep(workflowId: string, stepId: string, updates: Partial<WorkflowStep>) {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return null;

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) return null;

    Object.assign(step, updates);
    workflow.version++;
    this.notify();
    return step;
  }

  removeWorkflowStep(workflowId: string, stepId: string) {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return false;

    const index = workflow.steps.findIndex(s => s.id === stepId);
    if (index === -1) return false;

    workflow.steps.splice(index, 1);
    // Reorder remaining steps
    workflow.steps.forEach((step, idx) => {
      step.sort_order = idx;
    });
    workflow.version++;
    this.notify();
    return true;
  }

  moveWorkflowStep(workflowId: string, stepId: string, direction: 'up' | 'down') {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return false;

    const sortedSteps = [...workflow.steps].sort((a, b) => a.sort_order - b.sort_order);
    const index = sortedSteps.findIndex(s => s.id === stepId);
    
    if (index === -1) return false;
    if (direction === 'up' && index === 0) return false;
    if (direction === 'down' && index === sortedSteps.length - 1) return false;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap sort_order
    const tempOrder = sortedSteps[index].sort_order;
    sortedSteps[index].sort_order = sortedSteps[swapIndex].sort_order;
    sortedSteps[swapIndex].sort_order = tempOrder;

    workflow.version++;
    this.notify();
    return true;
  }

  // Topics
  getTopics() {
    return this.topics;
  }

  getTopicsByCategory(categoryId: string) {
    return this.topics.filter(t => t.category_id === categoryId);
  }

  createTopic(topic: Partial<Topic>) {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      tenant_id: topic.tenant_id || 'ten-1',
      category_id: topic.category_id || '',
      name: topic.name || '',
      slug: topic.slug || '',
      description: topic.description,
      status: topic.status || 'ACTIVE',
      sort_order: topic.sort_order || this.topics.length + 1,
    };
    this.topics.push(newTopic);
    this.notify();
    return newTopic;
  }

  updateTopic(id: string, updates: Partial<Topic>) {
    const index = this.topics.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.topics[index] = { ...this.topics[index], ...updates };
    this.notify();
    return this.topics[index];
  }

  // Tenants
  getTenants() {
    return this.tenants;
  }

  createTenant(tenant: Partial<Tenant>) {
    const newTenant: Tenant = {
      id: `ten-${Date.now()}`,
      name: tenant.name || '',
      slug: tenant.slug || '',
      status: tenant.status || 'ACTIVE',
      owner_user_id: tenant.owner_user_id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tenants.push(newTenant);
    this.notify();
    return newTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>) {
    const index = this.tenants.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.tenants[index] = { ...this.tenants[index], ...updates, updated_at: new Date().toISOString() };
    this.notify();
    return this.tenants[index];
  }

  suspendTenant(id: string) {
    return this.updateTenant(id, { status: 'SUSPENDED' });
  }

  // Hierarchy helpers
  getDepartmentsByProduct(productId: string) {
    return this.departments.filter(d => d.product_id === productId);
  }

  getCategoriesByDepartment(departmentId: string) {
    return this.categories.filter(c => c.department_id === departmentId);
  }

  getTeamsByDepartment(departmentId: string) {
    return this.teams.filter(t => t.department_id === departmentId && t.scope === 'DEPARTMENT');
  }

  getTeamsByCategory(categoryId: string) {
    return this.teams.filter(t => t.category_id === categoryId && t.scope === 'CATEGORY');
  }
}

// Singleton store
export const mockStore = new MockStore();

// React hook for subscribing to store changes
import { useSyncExternalStore } from 'react';

export function useMockStore() {
  const version = useSyncExternalStore(
    (callback) => mockStore.subscribe(callback),
    () => mockStore.getSnapshot()
  );
  return version;
}

// API client
export const api = {
  // Tickets
  tickets: {
    list: () => mockStore.getTickets(),
    get: (id: string) => mockStore.getTicket(id),
    create: (data: Partial<Ticket>) => mockStore.createTicket(data),
    update: (id: string, data: Partial<Ticket>) => mockStore.updateTicket(id, data),
    assign: (id: string, assignee_id: string, assignee_name: string) => mockStore.assignTicket(id, assignee_id, assignee_name),
    changeStatus: (id: string, status: Ticket['status']) => mockStore.changeTicketStatus(id, status),
    changePriority: (id: string, priority: Ticket['priority']) => mockStore.changeTicketPriority(id, priority),
    addWatcher: (id: string, watcher_id: string) => mockStore.addWatcher(id, watcher_id),
    removeWatcher: (id: string, watcher_id: string) => mockStore.removeWatcher(id, watcher_id),
    updateTags: (id: string, tags: string[]) => mockStore.updateTicketTags(id, tags),
  },

  // Messages
  messages: {
    list: (ticketId: string) => mockStore.getMessages(ticketId),
    create: (data: Partial<Message>) => mockStore.addMessage(data),
  },

  // Customers
  customers: {
    list: () => mockStore.getCustomers(),
    get: (id: string) => mockStore.getCustomer(id),
    create: (data: Partial<Customer>) => mockStore.createCustomer(data),
    update: (id: string, data: Partial<Customer>) => mockStore.updateCustomer(id, data),
  },

  // Categories
  categories: {
    list: () => mockStore.getCategories(),
    create: (data: Partial<Category>) => mockStore.createCategory(data),
    update: (id: string, data: Partial<Category>) => mockStore.updateCategory(id, data),
  },

  // Departments
  departments: {
    list: () => mockStore.getDepartments(),
    create: (data: Partial<Department>) => mockStore.createDepartment(data),
    update: (id: string, data: Partial<Department>) => mockStore.updateDepartment(id, data),
  },

  // Teams
  teams: {
    list: () => mockStore.getTeams(),
    create: (data: Partial<Team>) => mockStore.createTeam(data),
    update: (id: string, data: Partial<Team>) => mockStore.updateTeam(id, data),
  },

  // SLA Policies
  sla: {
    list: () => mockStore.getSLAPolicies(),
    create: (data: Partial<SLAPolicy>) => mockStore.createSLAPolicy(data),
    update: (id: string, data: Partial<SLAPolicy>) => mockStore.updateSLAPolicy(id, data),
  },

  // Products
  products: {
    list: () => mockStore.getProducts(),
    get: (id: string) => mockStore.getProduct(id),
    create: (data: Partial<Product>) => mockStore.createProduct(data),
    update: (id: string, data: Partial<Product>) => mockStore.updateProduct(id, data),
  },

  // Topics
  topics: {
    list: () => mockStore.getTopics(),
    listByCategory: (categoryId: string) => mockStore.getTopicsByCategory(categoryId),
    create: (data: Partial<Topic>) => mockStore.createTopic(data),
    update: (id: string, data: Partial<Topic>) => mockStore.updateTopic(id, data),
  },

  // Tenants
  tenants: {
    list: () => mockStore.getTenants(),
    create: (data: Partial<Tenant>) => mockStore.createTenant(data),
    update: (id: string, data: Partial<Tenant>) => mockStore.updateTenant(id, data),
    suspend: (id: string) => mockStore.suspendTenant(id),
  },
};
