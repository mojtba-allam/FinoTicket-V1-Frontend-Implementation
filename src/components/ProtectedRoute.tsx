import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../app/providers';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useApp();
  const location = useLocation();

  // Check if user is authenticated (in real app, check auth state)
  // For now, we assume user is authenticated if they exist
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
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
