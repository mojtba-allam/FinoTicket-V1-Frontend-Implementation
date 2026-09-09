import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './app/providers';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DeskPage from './pages/desk/DeskPage';
import TicketListPage from './pages/desk/TicketListPage';
import CreateTicketPage from './pages/desk/CreateTicketPage';
import TicketDetailPage from './pages/desk/TicketDetailPage';
import CustomersPage from './pages/desk/CustomersPage';
import CustomerDetailPage from './pages/desk/CustomerDetailPage';
import SearchPage from './pages/desk/SearchPage';
import KnowledgePage from './pages/desk/KnowledgePage';
import ArticleReaderPage from './pages/desk/ArticleReaderPage';

// Placeholder pages (to be extracted)
const AnalyticsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1></div>;
const AdminProductsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Products</h1></div>;
const AdminCategoriesPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Categories</h1></div>;
const AdminDepartmentsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Departments</h1></div>;
const AdminTeamsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Teams</h1></div>;
const AdminAgentsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Agents</h1></div>;
const AdminUsersPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Users</h1></div>;
const AdminSLAPage = () => <div className="p-6"><h1 className="text-2xl font-bold">SLA</h1></div>;
const AdminWorkflowsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Workflows</h1></div>;
const AdminAutomationsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Automations</h1></div>;
const AdminAPIClientsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">API Clients</h1></div>;
const AdminWebhooksPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Webhooks</h1></div>;
const AdminAuditLogsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Audit Logs</h1></div>;
const AdminKnowledgeBasesPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Knowledge Bases</h1></div>;
const WidgetPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Widget</h1></div>;
const ForgotPasswordPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Forgot Password</h1></div>;
const LegalPage = ({ type }: { type: 'privacy' | 'terms' }) => <div className="p-6"><h1 className="text-2xl font-bold">{type === 'privacy' ? 'Privacy' : 'Terms'}</h1></div>;
const ForbiddenPage = () => <div className="p-6"><h1 className="text-2xl font-bold">403 Forbidden</h1></div>;
const NotFoundPage = () => <div className="p-6"><h1 className="text-2xl font-bold">404 Not Found</h1></div>;

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/widget" element={<WidgetPage />} />

            {/* Desk routes */}
            <Route path="/desk" element={<DeskPage />} />
            <Route path="/desk/tickets" element={<TicketListPage />} />
            <Route path="/desk/tickets/new" element={<CreateTicketPage />} />
            <Route path="/desk/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/desk/customers" element={<CustomersPage />} />
            <Route path="/desk/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/desk/search" element={<SearchPage />} />
            <Route path="/desk/knowledge" element={<KnowledgePage />} />
            <Route path="/desk/knowledge/articles/:id" element={<ArticleReaderPage />} />
            <Route path="/desk/analytics" element={<AnalyticsPage />} />

            {/* Admin routes (protected) */}
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminCategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminDepartmentsPage /></ProtectedRoute>} />
            <Route path="/admin/teams" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminTeamsPage /></ProtectedRoute>} />
            <Route path="/admin/agents" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminAgentsPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/sla" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminSLAPage /></ProtectedRoute>} />
            <Route path="/admin/workflows" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminWorkflowsPage /></ProtectedRoute>} />
            <Route path="/admin/automations" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminAutomationsPage /></ProtectedRoute>} />
            <Route path="/admin/knowledge-bases" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminKnowledgeBasesPage /></ProtectedRoute>} />
            <Route path="/admin/api-clients" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminAPIClientsPage /></ProtectedRoute>} />
            <Route path="/admin/webhooks" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><AdminWebhooksPage /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminAuditLogsPage /></ProtectedRoute>} />

            {/* Error routes */}
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </AppProvider>
  );
}
