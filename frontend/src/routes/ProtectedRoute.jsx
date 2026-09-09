import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-space-md">
        <div className="w-12 h-12 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
        <span className="font-label-data-md uppercase text-primary tracking-widest animate-pulse">
          INITIALIZING CYBER LINK // CONNECTING TO SERVER...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
