import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './app/providers';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import DeskLayout from './layouts/DeskLayout';
import PlatformLayout from './layouts/PlatformLayout';

// Public pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LegalPage from './pages/legal/LegalPage';
import WidgetPage from './pages/widget/WidgetPage';

// Desk pages
import DeskPage from './pages/desk/DeskPage';
import TicketListPage from './pages/desk/TicketListPage';
import CreateTicketPage from './pages/desk/CreateTicketPage';
import TicketDetailPage from './pages/desk/TicketDetailPage';
import CustomersPage from './pages/desk/CustomersPage';
import CustomerDetailPage from './pages/desk/CustomerDetailPage';
import SearchPage from './pages/desk/SearchPage';
import KnowledgePage from './pages/desk/KnowledgePage';
import ArticleReaderPage from './pages/desk/ArticleReaderPage';
import AnalyticsPage from './pages/desk/AnalyticsPage';

// Admin pages
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminProductDetailPage from './pages/admin/ProductDetailPage';
import ProductDepartmentsPage from './pages/admin/ProductDepartmentsPage';
import DepartmentDetailPage from './pages/admin/DepartmentDetailPage';
import CategoryDetailPage from './pages/admin/CategoryDetailPage';
import AdminCategoriesPage from './pages/admin/CategoriesPage';
import WorkflowDetailPage from './pages/admin/WorkflowDetailPage';
import TeamsPage from './pages/admin/TeamsPage';
import TeamDetailPage from './pages/admin/TeamDetailPage';
import CreateTeamPage from './pages/admin/CreateTeamPage';
import {
  AdminDepartmentsPage,
  AdminAgentsPage,
  AdminUsersPage,
  AdminSLAPage,
  AdminWorkflowsPage,
  AdminAutomationsPage,
  AdminKnowledgeBasesPage,
  AdminAPIClientsPage,
  AdminWebhooksPage,
  AdminAuditLogsPage,
} from './pages/admin/AdminPages';

// Platform pages
import PlatformOverviewPage from './pages/platform/PlatformOverviewPage';
import PlatformTenantsPage from './pages/platform/PlatformTenantsPage';
import PlatformTenantDetailPage from './pages/platform/PlatformTenantDetailPage';
import PlatformSettingsPage from './pages/platform/PlatformSettingsPage';
import PlatformAuditPage from './pages/platform/PlatformAuditPage';

// Error pages
import { ForbiddenPage, NotFoundPage } from './pages/system/ErrorPages';

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            {/* Public routes (no layout) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/widget" element={<WidgetPage />} />

            {/* Desk routes (with sidebar layout) */}
            <Route element={<DeskLayout />}>
              <Route path="/desk" element={<ProtectedRoute consoleType="tenant"><DeskPage /></ProtectedRoute>} />
              <Route path="/desk/tickets" element={<ProtectedRoute consoleType="tenant"><TicketListPage /></ProtectedRoute>} />
              <Route path="/desk/tickets/new" element={<ProtectedRoute consoleType="tenant"><CreateTicketPage /></ProtectedRoute>} />
              <Route path="/desk/tickets/:id" element={<ProtectedRoute consoleType="tenant"><TicketDetailPage /></ProtectedRoute>} />
              <Route path="/desk/customers" element={<ProtectedRoute consoleType="tenant"><CustomersPage /></ProtectedRoute>} />
              <Route path="/desk/customers/:id" element={<ProtectedRoute consoleType="tenant"><CustomerDetailPage /></ProtectedRoute>} />
              <Route path="/desk/search" element={<ProtectedRoute consoleType="tenant"><SearchPage /></ProtectedRoute>} />
              <Route path="/desk/knowledge" element={<ProtectedRoute consoleType="tenant"><KnowledgePage /></ProtectedRoute>} />
              <Route path="/desk/knowledge/articles/:id" element={<ProtectedRoute consoleType="tenant"><ArticleReaderPage /></ProtectedRoute>} />
              <Route path="/desk/analytics" element={<ProtectedRoute consoleType="tenant"><AnalyticsPage /></ProtectedRoute>} />

              {/* Admin routes (protected, with sidebar layout) */}
              <Route path="/admin/products" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminProductsPage /></ProtectedRoute>} />
              <Route path="/admin/products/:id" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminProductDetailPage /></ProtectedRoute>} />
              <Route path="/admin/products/:productId/departments" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><ProductDepartmentsPage /></ProtectedRoute>} />
              <Route path="/admin/departments/:departmentId" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><DepartmentDetailPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminCategoriesPage /></ProtectedRoute>} />
              <Route path="/admin/categories/:categoryId" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><CategoryDetailPage /></ProtectedRoute>} />
              <Route path="/admin/workflows/:id" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><WorkflowDetailPage /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminDepartmentsPage /></ProtectedRoute>} />
              <Route path="/admin/teams" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><TeamsPage /></ProtectedRoute>} />
              <Route path="/admin/teams/:teamId" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><TeamDetailPage /></ProtectedRoute>} />
              <Route path="/admin/departments/:departmentId/teams/create" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><CreateTeamPage /></ProtectedRoute>} />
              <Route path="/admin/categories/:categoryId/teams/create" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><CreateTeamPage /></ProtectedRoute>} />
              <Route path="/admin/agents" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminAgentsPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/sla" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminSLAPage /></ProtectedRoute>} />
              <Route path="/admin/workflows" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminWorkflowsPage /></ProtectedRoute>} />
              <Route path="/admin/automations" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminAutomationsPage /></ProtectedRoute>} />
              <Route path="/admin/knowledge-bases" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminKnowledgeBasesPage /></ProtectedRoute>} />
              <Route path="/admin/api-clients" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminAPIClientsPage /></ProtectedRoute>} />
              <Route path="/admin/webhooks" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER']}><AdminWebhooksPage /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute consoleType="tenant" allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}><AdminAuditLogsPage /></ProtectedRoute>} />

              {/* Error routes (with layout) */}
              <Route path="/forbidden" element={<ForbiddenPage />} />
            </Route>

            {/* Platform routes (with platform layout) */}
            <Route element={<PlatformLayout />}>
              <Route path="/platform" element={<ProtectedRoute consoleType="platform" allowedRoles={['PLATFORM_ADMIN', 'PLATFORM_OWNER']}><PlatformOverviewPage /></ProtectedRoute>} />
              <Route path="/platform/tenants" element={<ProtectedRoute consoleType="platform" allowedRoles={['PLATFORM_ADMIN', 'PLATFORM_OWNER']}><PlatformTenantsPage /></ProtectedRoute>} />
              <Route path="/platform/tenants/:tenantId" element={<ProtectedRoute consoleType="platform" allowedRoles={['PLATFORM_ADMIN', 'PLATFORM_OWNER']}><PlatformTenantDetailPage /></ProtectedRoute>} />
              <Route path="/platform/settings" element={<ProtectedRoute consoleType="platform" allowedRoles={['PLATFORM_ADMIN', 'PLATFORM_OWNER']}><PlatformSettingsPage /></ProtectedRoute>} />
              <Route path="/platform/audit" element={<ProtectedRoute consoleType="platform" allowedRoles={['PLATFORM_ADMIN', 'PLATFORM_OWNER']}><PlatformAuditPage /></ProtectedRoute>} />
            </Route>

            {/* 404 (no layout) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </AppProvider>
  );
}
