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
  const { user } = useApp();
  const location = useLocation();

  // Check if user is authenticated (in real app, check auth state)
  // For now, we assume user is authenticated if they exist
  if (!user) {
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
