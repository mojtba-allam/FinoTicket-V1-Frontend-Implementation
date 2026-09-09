import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './app/providers';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import DeskLayout from './layouts/DeskLayout';

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
import AdminCategoriesPage from './pages/admin/CategoriesPage';
import {
  AdminDepartmentsPage,
  AdminTeamsPage,
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

              {/* Admin routes (protected, with sidebar layout) */}
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

              {/* Error routes (with layout) */}
              <Route path="/forbidden" element={<ForbiddenPage />} />
            </Route>

            {/* 404 (no layout) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </AppProvider>
  );
}
