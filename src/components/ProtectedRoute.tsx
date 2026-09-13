import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../app/providers';
import type { Role, PlatformRole, ConsoleType } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (Role | PlatformRole)[];
  consoleType?: ConsoleType;
}

export function ProtectedRoute({ children, allowedRoles, consoleType }: ProtectedRouteProps) {
  const { user, session, embedded, lang } = useApp();
  const location = useLocation();

  // Live mode requires a bearer token; mock mode relies on the demo user.
  if (!session.isAuthenticated) {
    // Inside an embed there is no login page to send the user to — the host
    // supplies a token via postMessage. Render a waiting panel instead of
    // redirecting to a route that does not exist in the shadow root.
    if (embedded) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40"
            aria-hidden="true"
          />
          <p className="text-sm opacity-70">
            {lang === 'fa'
              ? 'در انتظار احراز هویت…'
              : 'Waiting for authentication…'}
          </p>
        </div>
      );
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Console guard - redirect platform users from tenant routes and vice versa
  if (consoleType) {
    if (consoleType === 'platform' && user.console !== 'platform') {
      return <Navigate to="/forbidden" replace />;
    }
    if (consoleType === 'tenant' && user.console === 'platform') {
      return <Navigate to="/platform" replace />;
    }
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

// Hook to check if user can perform mutations
export function useCanMutate() {
  const { user } = useApp();
  
  // VIEWER role cannot mutate
  return user.role !== 'VIEWER';
}

// Hook to check if user is admin
export function useIsAdmin() {
  const { user } = useApp();
  
  return user.role === 'ADMIN' || user.role === 'OWNER';
}

// Hook to check if user is manager or above
export function useIsManager() {
  const { user } = useApp();
  
  return user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'OWNER';
}
