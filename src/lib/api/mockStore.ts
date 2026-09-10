// Mock Service Worker setup for FinoTicket API
// This provides in-memory persistence for all API operations with React reactivity

import { mockTickets, mockCustomers, mockMessages, mockCategories, mockDepartments, mockTeams, mockAgents, mockSLAPolicies, mockKnowledgeBases, mockArticles, mockProducts, mockTopics, mockTenants, mockAPIClients, mockWebhooks, mockAuditLogs } from '../../data/mock';
import type { Ticket, Customer, Message, Category, Department, Team, Agent, SLAPolicy, KnowledgeBase, Article, Product, Workflow, WorkflowStep, Topic, Tenant, Address, CustomerIdentity, Attachment, Automation, APIClient, Webhook, AuditLog } from '../../types';
import type { TimelineEvent } from '../../components/Timeline';

// In-memory store with subscription support
class MockStore {
  tickets: Ticket[] = [...mockTickets];
  customers: Customer[] = [...mockCustomers];
  messages: Message[] = [...mockMessages];
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
  automations: Automation[] = [
    {
      id: 'au-1',
      name: 'تغییر وضعیت به در انتظار مشتری',
      trigger_event: 'message.added',
      conditions: [{ field: 'sender_type', operator: 'equals', value: 'AGENT' }],
      actions: [{ type: 'set_status', value: 'WAITING_CUSTOMER' }],
      status: 'ACTIVE',
      created_at: '2024-01-10T08:00:00Z',
    },
    {
      id: 'au-2',
      name: 'اولویت‌بندی خودکار کلمات کلیدی',
      trigger_event: 'ticket.created',
      conditions: [{ field: 'subject', operator: 'contains', value: 'فوری' }],
      actions: [{ type: 'set_priority', value: 'HIGH' }],
      status: 'ACTIVE',
      created_at: '2024-01-12T10:30:00Z',
    },
  ];
  apiClients: APIClient[] = [...mockAPIClients];
  webhooks: Webhook[] = [...mockWebhooks];
  auditLogs: AuditLog[] = [...mockAuditLogs];
  
  // Append-only history log per ticket
  historyByTicketId: Map<string, TimelineEvent[]> = new Map();
  
  // Attachments per ticket
  ticketAttachments: Map<string, Attachment[]> = new Map();
  
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

  createTicket(ticket: Partial<Ticket> & { attachments?: Attachment[] }) {
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
      topic_id: ticket.topic_id,
      topic_name: ticket.topic_name,
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

    // Create initial message with description and attachments if provided
    if (ticket.description || (ticket.attachments && ticket.attachments.length > 0)) {
      const initialMessage: Message = {
        id: `m-${Date.now()}`,
        ticket_id: newTicket.id,
        sender_type: 'CUSTOMER',
        sender_id: ticket.customer_id || '',
        sender_name: ticket.customer_name || 'Customer',
        body: ticket.description || '',
        is_internal: false,
        channel: newTicket.channel,
        attachments: ticket.attachments || [],
        created_at: new Date().toISOString(),
      };
      this.messages.push(initialMessage);
    }
    
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

  assignCascade(
    id: string, 
    data: { 
      department_id?: string; 
      department_name?: string;
      team_id?: string; 
      team_name?: string;
      assignee_id?: string; 
      assignee_name?: string;
    }
  ) {
    const result = this.updateTicket(id, {
      department_id: data.department_id,
      department_name: data.department_name,
      team_id: data.team_id,
      team_name: data.team_name,
      assignee_id: data.assignee_id,
      assignee_name: data.assignee_name,
    });
    
    if (result) {
      // Add history events for each level of assignment
      if (data.department_id) {
        this.addHistoryEvent(id, {
          type: 'assigned',
          title: `ارجاع به دپارتمان ${data.department_name || data.department_id}`,
          actor: 'سیستم',
        });
      }
      if (data.team_id) {
        this.addHistoryEvent(id, {
          type: 'assigned',
          title: `ارجاع به تیم ${data.team_name || data.team_id}`,
          actor: 'سیستم',
        });
      }
      if (data.assignee_id) {
        this.addHistoryEvent(id, {
          type: 'assigned',
          title: `ارجاع به ${data.assignee_name || data.assignee_id}`,
          actor: 'سیستم',
        });
      }
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

  // Attachments
  addTicketAttachment(ticketId: string, attachment: Partial<Attachment>) {
    const ticket = this.getTicket(ticketId);
    if (!ticket) return null;
    
    const newAttachment: Attachment = {
      id: `att-${Date.now()}`,
      filename: attachment.filename || '',
      mime_type: attachment.mime_type || '',
      size: attachment.size || 0,
      url: attachment.url || '',
      uploader_id: attachment.uploader_id,
      uploader_name: attachment.uploader_name,
      created_at: new Date().toISOString(),
    };
    
    // Store attachment in a separate map for the ticket
    if (!this.ticketAttachments.has(ticketId)) {
      this.ticketAttachments.set(ticketId, []);
    }
    this.ticketAttachments.get(ticketId)!.push(newAttachment);
    
    this.notify();
    return newAttachment;
  }

  removeTicketAttachment(ticketId: string, attachmentId: string) {
    const attachments = this.ticketAttachments.get(ticketId);
    if (!attachments) return false;
    
    const index = attachments.findIndex(a => a.id === attachmentId);
    if (index === -1) return false;
    
    attachments.splice(index, 1);
    this.notify();
    return true;
  }

  getTicketAttachments(ticketId: string): Attachment[] {
    return this.ticketAttachments.get(ticketId) || [];
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

  // Customer Addresses
  addCustomerAddress(customerId: string, address: Partial<Address>) {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;
    
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      type: address.type || 'HOME',
      title: address.title || '',
      address: address.address || '',
      postal_code: address.postal_code,
      city: address.city,
      province: address.province,
      country: address.country,
    };
    
    customer.addresses.push(newAddress);
    this.notify();
    return newAddress;
  }

  updateCustomerAddress(customerId: string, addressId: string, updates: Partial<Address>) {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;
    
    const addressIndex = customer.addresses.findIndex(a => a.id === addressId);
    if (addressIndex === -1) return null;
    
    customer.addresses[addressIndex] = { ...customer.addresses[addressIndex], ...updates };
    this.notify();
    return customer.addresses[addressIndex];
  }

  deleteCustomerAddress(customerId: string, addressId: string) {
    const customer = this.getCustomer(customerId);
    if (!customer) return false;
    
    const addressIndex = customer.addresses.findIndex(a => a.id === addressId);
    if (addressIndex === -1) return false;
    
    customer.addresses.splice(addressIndex, 1);
    this.notify();
    return true;
  }

  // Customer Identities
  linkCustomerIdentity(customerId: string, identity: Partial<CustomerIdentity>) {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;
    
    const newIdentity: CustomerIdentity = {
      id: `id-${Date.now()}`,
      provider: identity.provider || '',
      provider_user_id: identity.provider_user_id || '',
      verification_status: identity.verification_status || 'UNVERIFIED',
    };
    
    customer.identities.push(newIdentity);
    this.notify();
    return newIdentity;
  }

  unlinkCustomerIdentity(customerId: string, identityId: string) {
    const customer = this.getCustomer(customerId);
    if (!customer) return false;
    
    const identityIndex = customer.identities.findIndex(i => i.id === identityId);
    if (identityIndex === -1) return false;
    
    customer.identities.splice(identityIndex, 1);
    this.notify();
    return true;
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

  getAgent(id: string) {
    return this.agents.find(a => a.id === id);
  }

  createAgent(agent: Partial<Agent>) {
    const newAgent: Agent = {
      id: `ag-${Date.now()}`,
      tenant_id: agent.tenant_id || 'ten-1',
      user_id: agent.user_id || `user-${Date.now()}`,
      display_name: agent.display_name || '',
      avatar_url: agent.avatar_url,
      timezone: agent.timezone || 'Asia/Tehran',
      language: agent.language || 'fa',
      max_active_tickets: agent.max_active_tickets || 20,
      presence: agent.presence || 'OFFLINE',
      status: agent.status || 'ACTIVE',
    };
    this.agents.push(newAgent);
    this.notify();
    return newAgent;
  }

  updateAgent(id: string, updates: Partial<Agent>) {
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.agents[index] = { ...this.agents[index], ...updates };
    this.notify();
    return this.agents[index];
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

  // Automations
  getAutomations() {
    return this.automations;
  }

  getAutomation(id: string) {
    return this.automations.find(a => a.id === id);
  }

  createAutomation(automation: Partial<Automation>) {
    const newAutomation: Automation = {
      id: `au-${Date.now()}`,
      name: automation.name || '',
      trigger_event: automation.trigger_event || 'ticket.created',
      conditions: automation.conditions || [],
      actions: automation.actions || [],
      status: automation.status || 'ACTIVE',
      created_at: new Date().toISOString(),
    };
    this.automations.push(newAutomation);
    this.notify();
    return newAutomation;
  }

  updateAutomation(id: string, updates: Partial<Automation>) {
    const index = this.automations.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.automations[index] = { ...this.automations[index], ...updates };
    this.notify();
    return this.automations[index];
  }

  // API Clients
  getAPIClients() {
    return this.apiClients;
  }

  getAPIClient(id: string) {
    return this.apiClients.find(c => c.id === id);
  }

  createAPIClient(client: Partial<APIClient>) {
    const newClient: APIClient = {
      id: `client-${Date.now()}`,
      name: client.name || '',
      client_id: `cli_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `sec_${Math.random().toString(36).substring(2, 30)}`,
      scopes: client.scopes || [],
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };
    this.apiClients.push(newClient);
    this.notify();
    return newClient;
  }

  updateAPIClient(id: string, updates: Partial<APIClient>) {
    const index = this.apiClients.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.apiClients[index] = { ...this.apiClients[index], ...updates };
    this.notify();
    return this.apiClients[index];
  }

  rotateAPIClientSecret(id: string) {
    const client = this.getAPIClient(id);
    if (!client) return null;
    const newSecret = `sec_${Math.random().toString(36).substring(2, 30)}`;
    this.apiClients = this.apiClients.map(c => 
      c.id === id ? { ...c, client_secret: newSecret } : c
    );
    this.notify();
    return newSecret;
  }

  // Webhooks
  getWebhooks() {
    return this.webhooks;
  }

  getWebhook(id: string) {
    return this.webhooks.find(w => w.id === id);
  }

  createWebhook(webhook: Partial<Webhook>) {
    const newWebhook: Webhook = {
      id: `wh-${Date.now()}`,
      name: webhook.name || '',
      url: webhook.url || '',
      events: webhook.events || [],
      status: webhook.status || 'ACTIVE',
      deliveries: [],
      created_at: new Date().toISOString(),
    };
    this.webhooks.push(newWebhook);
    this.notify();
    return newWebhook;
  }

  updateWebhook(id: string, updates: Partial<Webhook>) {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index === -1) return null;
    this.webhooks[index] = { ...this.webhooks[index], ...updates };
    this.notify();
    return this.webhooks[index];
  }

  addWebhookDelivery(webhookId: string, delivery: any) {
    const webhook = this.getWebhook(webhookId);
    if (!webhook) return null;
    const newDelivery = {
      id: `del-${Date.now()}`,
      webhook_id: webhookId,
      event: delivery.event,
      status: delivery.status,
      attempts: delivery.attempts || 1,
      response_code: delivery.response_code,
      response_body: delivery.response_body,
      created_at: new Date().toISOString(),
    };
    webhook.deliveries.unshift(newDelivery);
    this.notify();
    return newDelivery;
  }

  // Audit Logs
  getAuditLogs() {
    return this.auditLogs;
  }

  addAuditLog(log: Partial<AuditLog>) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actor_id: log.actor_id || 'u-001',
      actor_name: log.actor_name || 'Unknown',
      action: log.action || 'CREATE',
      entity_type: log.entity_type || '',
      entity_id: log.entity_id || '',
      metadata: log.metadata || {},
      ip_address: log.ip_address || '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    this.notify();
    return newLog;
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

  // Knowledge Bases
  getKnowledgeBases() {
    return this.knowledgeBases;
  }

  getKnowledgeBase(id: string) {
    return this.knowledgeBases.find(kb => kb.id === id);
  }

  createKnowledgeBase(kb: Partial<KnowledgeBase>) {
    const newKB: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name: kb.name || '',
      scope: kb.scope || 'TENANT',
      product_id: kb.product_id,
      status: kb.status || 'ACTIVE',
      articles_count: 0,
    };
    this.knowledgeBases.push(newKB);
    this.notify();
    return newKB;
  }

  updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>) {
    const index = this.knowledgeBases.findIndex(kb => kb.id === id);
    if (index === -1) return null;
    this.knowledgeBases[index] = { ...this.knowledgeBases[index], ...updates };
    this.notify();
    return this.knowledgeBases[index];
  }

  // Articles
  getArticles() {
    return this.articles;
  }

  getArticle(id: string) {
    return this.articles.find(a => a.id === id);
  }

  getArticlesByKB(kbId: string) {
    return this.articles.filter(a => a.kb_id === kbId);
  }

  getPublishedArticles() {
    return this.articles.filter(a => a.status === 'PUBLISHED');
  }

  createArticle(article: Partial<Article>) {
    const newArticle: Article = {
      id: `art-${Date.now()}`,
      kb_id: article.kb_id || '',
      title: article.title || '',
      slug: article.slug || article.title?.toLowerCase().replace(/\s+/g, '-') || '',
      content: article.content || '',
      summary: article.summary,
      status: article.status || 'DRAFT',
      visibility: article.visibility || 'BOTH',
      tags: article.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.articles.push(newArticle);
    
    // Update KB articles count
    const kb = this.getKnowledgeBase(newArticle.kb_id);
    if (kb) {
      kb.articles_count++;
    }
    
    this.notify();
    return newArticle;
  }

  updateArticle(id: string, updates: Partial<Article>) {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    const oldStatus = this.articles[index].status;
    this.articles[index] = { 
      ...this.articles[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    // Update KB articles count if status changed
    if (updates.status && updates.status !== oldStatus) {
      const article = this.articles[index];
      const kb = this.getKnowledgeBase(article.kb_id);
      if (kb) {
        if (updates.status === 'PUBLISHED' && oldStatus !== 'PUBLISHED') {
          kb.articles_count++;
        } else if (updates.status !== 'PUBLISHED' && oldStatus === 'PUBLISHED') {
          kb.articles_count--;
        }
      }
    }
    
    this.notify();
    return this.articles[index];
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

  // Search
  search(params: { q: string; mode: 'KEYWORD' | 'SEMANTIC' | 'HYBRID'; filters?: any }) {
    const { q, mode, filters } = params;
    
    // Combine all searchable entities
    const tickets = this.tickets.map(t => ({
      id: t.id,
      type: 'ticket' as const,
      title: `${t.ticket_number} - ${t.subject}`,
      snippet: t.description || t.subject,
      url: `/desk/tickets/${t.id}`,
      product_id: t.product_id,
      status: t.status,
      department_id: t.department_id,
      created_at: t.created_at,
    }));

    const articles = this.articles
      .filter(a => a.status === 'PUBLISHED')
      .map(a => ({
        id: a.id,
        type: 'article' as const,
        title: a.title,
        snippet: a.summary || a.content.substring(0, 200),
        url: `/desk/knowledge/articles/${a.id}`,
      }));

    const customers = this.customers.map(c => ({
      id: c.id,
      type: 'customer' as const,
      title: c.display_name,
      snippet: c.profile.email || c.profile.mobile || '',
      url: `/desk/customers/${c.id}`,
    }));

    let allResults = [...tickets, ...articles, ...customers];

    // Apply filters
    if (filters) {
      if (filters.product) {
        allResults = allResults.filter(r => (r as any).product_id === filters.product);
      }
      if (filters.status) {
        allResults = allResults.filter(r => (r as any).status === filters.status);
      }
      if (filters.department) {
        allResults = allResults.filter(r => (r as any).department_id === filters.department);
      }
      if (filters.date_from) {
        allResults = allResults.filter(r => new Date((r as any).created_at) >= new Date(filters.date_from));
      }
      if (filters.date_to) {
        allResults = allResults.filter(r => new Date((r as any).created_at) <= new Date(filters.date_to));
      }
    }

    // Filter by query
    if (q) {
      allResults = allResults.filter(r => 
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.snippet.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Apply mode-specific scoring
    const results = allResults.map(r => {
      let score = 0.5; // base score
      
      if (q) {
        // Keyword mode: exact match scoring
        if (mode === 'KEYWORD') {
          const titleMatch = r.title.toLowerCase().includes(q.toLowerCase());
          const snippetMatch = r.snippet.toLowerCase().includes(q.toLowerCase());
          score = (titleMatch ? 0.9 : 0.5) + (snippetMatch ? 0.1 : 0);
        }
        // Semantic mode: simulated semantic similarity (randomized but consistent)
        else if (mode === 'SEMANTIC') {
          const hash = (r.title + q).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          score = 0.6 + (Math.abs(hash) % 40) / 100;
        }
        // Hybrid mode: blend of keyword and semantic
        else {
          const titleMatch = r.title.toLowerCase().includes(q.toLowerCase());
          const snippetMatch = r.snippet.toLowerCase().includes(q.toLowerCase());
          const keywordScore = (titleMatch ? 0.9 : 0.5) + (snippetMatch ? 0.1 : 0);
          const hash = (r.title + q).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          const semanticScore = 0.6 + (Math.abs(hash) % 40) / 100;
          score = (keywordScore + semanticScore) / 2;
        }
      }

      return {
        ...r,
        score: Math.min(score, 0.99),
        mode_score: {
          keyword: mode === 'KEYWORD' ? score : undefined,
          semantic: mode === 'SEMANTIC' ? score : undefined,
          hybrid: mode === 'HYBRID' ? score : undefined,
        }
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results;
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
