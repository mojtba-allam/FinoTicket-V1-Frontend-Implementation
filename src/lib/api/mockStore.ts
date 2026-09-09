// Mock Service Worker setup for FinoTicket API
// This provides in-memory persistence for all API operations

import { mockTickets, mockCustomers, mockCategories, mockDepartments, mockTeams, mockAgents, mockSLAPolicies, mockKnowledgeBases, mockArticles, mockProducts } from '../../data/mock';
import type { Ticket, Customer, Message, Category, Department, Team, Agent, SLAPolicy, KnowledgeBase, Article, Product } from '../../types';

// In-memory store
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

  // Tickets
  getTickets() {
    return this.tickets;
  }

  getTicket(id: string) {
    return this.tickets.find(t => t.id === id);
  }

  createTicket(ticket: Partial<Ticket>) {
    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
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
    return newTicket;
  }

  updateTicket(id: string, updates: Partial<Ticket>) {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.tickets[index] = { ...this.tickets[index], ...updates, updated_at: new Date().toISOString() };
    return this.tickets[index];
  }

  assignTicket(id: string, assignee_id: string, assignee_name: string) {
    return this.updateTicket(id, { assignee_id, assignee_name });
  }

  changeTicketStatus(id: string, status: Ticket['status']) {
    return this.updateTicket(id, { status });
  }

  changeTicketPriority(id: string, priority: Ticket['priority']) {
    return this.updateTicket(id, { priority });
  }

  addWatcher(id: string, watcher_id: string) {
    const ticket = this.getTicket(id);
    if (!ticket) return null;
    if (!ticket.watchers.includes(watcher_id)) {
      ticket.watchers.push(watcher_id);
    }
    return ticket;
  }

  removeWatcher(id: string, watcher_id: string) {
    const ticket = this.getTicket(id);
    if (!ticket) return null;
    ticket.watchers = ticket.watchers.filter((w: string) => w !== watcher_id);
    return ticket;
  }

  updateTicketTags(id: string, tags: string[]) {
    return this.updateTicket(id, { tags });
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
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.customers[index] = { ...this.customers[index], ...updates };
    return this.customers[index];
  }

  // Categories
  getCategories() {
    return this.categories;
  }

  createCategory(category: Partial<Category>) {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: category.name || '',
      slug: category.slug || '',
      description: category.description,
      parent_id: category.parent_id,
      status: category.status || 'ACTIVE',
      sort_order: category.sort_order || this.categories.length + 1,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  // Departments
  getDepartments() {
    return this.departments;
  }

  createDepartment(department: Partial<Department>) {
    const newDepartment: Department = {
      id: `d-${Date.now()}`,
      name: department.name || '',
      slug: department.slug || '',
      description: department.description,
      status: department.status || 'ACTIVE',
    };
    this.departments.push(newDepartment);
    return newDepartment;
  }

  // Teams
  getTeams() {
    return this.teams;
  }

  createTeam(team: Partial<Team>) {
    const newTeam: Team = {
      id: `tm-${Date.now()}`,
      name: team.name || '',
      slug: team.slug || '',
      department_id: team.department_id || '',
      department_name: team.department_name,
      status: team.status || 'ACTIVE',
      members: team.members || [],
    };
    this.teams.push(newTeam);
    return newTeam;
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
    return newPolicy;
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
    return this.products[index];
  }
}

// Singleton store
export const mockStore = new MockStore();

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
  },

  // Departments
  departments: {
    list: () => mockStore.getDepartments(),
    create: (data: Partial<Department>) => mockStore.createDepartment(data),
  },

  // Teams
  teams: {
    list: () => mockStore.getTeams(),
    create: (data: Partial<Team>) => mockStore.createTeam(data),
  },

  // SLA Policies
  sla: {
    list: () => mockStore.getSLAPolicies(),
    create: (data: Partial<SLAPolicy>) => mockStore.createSLAPolicy(data),
  },

  // Products
  products: {
    list: () => mockStore.getProducts(),
    get: (id: string) => mockStore.getProduct(id),
    update: (id: string, data: Partial<Product>) => mockStore.updateProduct(id, data),
  },
};
