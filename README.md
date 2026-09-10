# FinoTicket V1 Frontend Implementation

A comprehensive multi-tenant ticket management system with organizational hierarchy, dual dashboards, and cascading assignment workflows.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture**: Complete tenant isolation with platform-level oversight
- **Organizational Hierarchy**: Products → Departments → Categories → Topics
- **Team Management**: Department-scoped and category-scoped teams with leads and members
- **Cascading Assignment**: Department → Team → Agent assignment workflow
- **Dual Dashboard System**:
  - **Platform Super Admin Console**: Manage all tenants, platform settings, and audit logs
  - **Tenant Admin Console**: Manage products, departments, teams, and tickets

### Ticket Management
- Full ticket lifecycle management
- SLA tracking and monitoring
- AI-powered suggestions (mock)
- Conversation threads with internal notes
- Customer 360° view
- Knowledge base integration

### Advanced Features
- **FilterBar**: Advanced filtering with URL sync (status, priority, product, category, topic, department, team, assignee, channel, tags, customer, date range)
- **Timeline**: Complete audit trail for all ticket changes
- **Reactive Store**: Real-time updates using `useSyncExternalStore`
- **Role-Based Access Control**: VIEWER, AGENT, MANAGER, ADMIN, OWNER roles
- **Bilingual Support**: Full Persian (fa) and English (en) i18n

## 🔐 Demo Accounts

The application includes two demo accounts for testing the dual dashboard system:

### Platform Super Admin
- **Email**: `super@fino.local`
- **Password**: `password` (any password works in demo)
- **Access**: Platform console at `/platform`
- **Capabilities**:
  - View all tenants
  - Create/suspend/restore tenants
  - Platform-wide settings
  - Audit log access

### Tenant Admin
- **Email**: `admin@finoticket.ir`
- **Password**: `password` (any password works in demo)
- **Access**: Tenant desk at `/desk`
- **Capabilities**:
  - Manage products, departments, categories, topics
  - Create and manage teams
  - Handle tickets with cascading assignment
  - Customer management
  - Knowledge base management

### Quick Login
The login page provides quick login buttons for both demo accounts:
- Click "سوپر ادمین / Super Admin" to login as platform admin
- Click "ادمین مستأجر / Tenant Admin" to login as tenant admin

## 📁 Project Structure

```
src/
├── app/
│   └── providers.tsx          # App context and state management
├── components/
│   ├── ui.tsx                 # Design system components
│   ├── FilterBar.tsx          # Advanced filtering component
│   ├── Timeline.tsx           # Audit trail component
│   ├── SLACountdown.tsx       # SLA timer component
│   ├── NotificationCenter.tsx # Notification system
│   ├── ProtectedRoute.tsx     # Route protection
│   └── ErrorBoundary.tsx      # Error handling
├── layouts/
│   ├── DeskLayout.tsx         # Tenant console layout
│   └── PlatformLayout.tsx     # Platform console layout
├── pages/
│   ├── landing/               # Marketing landing page
│   ├── auth/                  # Login, forgot password
│   ├── desk/                  # Tenant desk pages
│   │   ├── DeskPage.tsx       # Inbox
│   │   ├── TicketListPage.tsx # Ticket list with filters
│   │   ├── TicketDetailPage.tsx # Ticket detail with cascading assign
│   │   ├── CreateTicketPage.tsx # Create ticket
│   │   ├── CustomersPage.tsx  # Customer management
│   │   ├── CustomerDetailPage.tsx # Customer 360° view
│   │   ├── SearchPage.tsx     # Search with modes
│   │   ├── KnowledgePage.tsx  # Knowledge base
│   │   ├── ArticleReaderPage.tsx # Article reader
│   │   └── AnalyticsPage.tsx  # Analytics dashboard
│   ├── admin/                 # Tenant admin pages
│   │   ├── ProductsPage.tsx   # Products list
│   │   ├── ProductDetailPage.tsx # Product settings & branding
│   │   ├── ProductDepartmentsPage.tsx # Departments per product
│   │   ├── DepartmentDetailPage.tsx # Categories & teams per dept
│   │   ├── CategoryDetailPage.tsx # Topics & teams per category
│   │   ├── TeamsPage.tsx      # Teams list
│   │   ├── TeamDetailPage.tsx # Team editor with lead/members
│   │   ├── CreateTeamPage.tsx # Create team
│   │   └── AdminPages.tsx     # Other admin pages (SLA, workflows, etc.)
│   ├── platform/              # Platform super admin pages
│   │   ├── PlatformOverviewPage.tsx # Platform dashboard
│   │   ├── PlatformTenantsPage.tsx # Tenant management
│   │   ├── PlatformTenantDetailPage.tsx # Tenant detail
│   │   ├── PlatformSettingsPage.tsx # Platform settings
│   │   └── PlatformAuditPage.tsx # Audit log
│   ├── widget/                # Customer widget
│   └── system/                # Error pages (403, 404)
├── lib/
│   └── api/
│       └── mockStore.ts       # Reactive mock store
├── data/
│   └── mock.ts                # Mock data with full hierarchy
└── i18n/
    └── index.ts               # Persian/English translations
```

## 🏗️ Organizational Hierarchy

The system implements a complete organizational hierarchy:

```
Tenant (Company)
  └── Product (e.g., Finopal, Finoid)
        └── Department (e.g., Technical, Financial)
              ├── Category (e.g., Authentication, Account)
              │     └── Topic (e.g., Login Issue, Password Reset)
              └── Team (Department-scoped or Category-scoped)
                    ├── Lead (سرتیم)
                    └── Members (کارشناسان)
```

### Hierarchy Rules
1. **Products** belong to a tenant
2. **Departments** belong to a product
3. **Categories** belong to a department
4. **Topics** belong to a category
5. **Teams** can be:
   - **Department-scoped**: Covers entire department
   - **Category-scoped**: Specialized for specific category
6. **Team Members**:
   - Exactly one **Lead** (enforced by UI)
   - Multiple **Members** (agents)

## 🎯 Cascading Assignment

When assigning a ticket, the system enforces a cascading workflow:

1. **Select Department** → Filters available teams
2. **Select Team** → Shows only team members as agents
3. **Select Agent** → Must be a member of selected team

### Validation Rules
- Cannot select team without selecting department
- Cannot select agent without selecting team
- Agent list shows only members of selected team
- Timeline records each assignment level

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

## 📊 State Management

The application uses a custom reactive store (`mockStore`) with:
- **useSyncExternalStore**: React 18 hook for external store subscription
- **Automatic reactivity**: All components using `useMockStore()` re-render on changes
- **History tracking**: All mutations create timeline events
- **Cascade operations**: Complex operations like `assignCascade` handle multiple updates

### Example Usage
```typescript
// Subscribe to store
useMockStore();

// Get data
const tickets = mockStore.getTickets();

// Mutate data
mockStore.createTicket({ ... });
mockStore.assignCascade(ticketId, { department_id, team_id, assignee_id });
```

## 🎨 Design System

Built with Tailwind CSS and custom Fino Ocean theme:
- **Primary Color**: `#0B7C8C` (Ocean Teal)
- **Accent Color**: `#06B6D4` (Signal Cyan)
- **Ember Color**: `#F97316` (Marketing CTAs)
- **Typography**: Vazirmatn (Persian-friendly)
- **RTL Support**: Full right-to-left support for Persian

## 🌐 Internationalization

Full bilingual support:
- **Persian (fa)**: Default language, RTL layout
- **English (en)**: LTR layout
- Language toggle in header
- All UI strings translated

## 📝 Backend Integration

See [ORG_MODEL_DELTA.md](./ORG_MODEL_DELTA.md) for required backend schema changes to support the organizational hierarchy.

## 🚧 Current Status

### Completed (CHUNK 01-06)
- ✅ Data layer with full hierarchy
- ✅ Product → Department → Category → Topic navigation
- ✅ Team management with scope (department/category)
- ✅ Cascading ticket assignment
- ✅ Platform Super Admin console
- ✅ Tenant Admin console
- ✅ Dual dashboard system
- ✅ FilterBar with all filters
- ✅ Timeline audit trail
- ✅ Reactive store
- ✅ Full i18n support

### Future Work
- Backend API implementation
- Real authentication system
- MSW (Mock Service Worker) integration
- Storybook component documentation
- E2E tests with Playwright

## 📄 License

Proprietary - FinoTicket © 2024

## 🤝 Contributing

This is a demonstration project. For production use, please contact the FinoTicket development team.

---

**Built with**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts
