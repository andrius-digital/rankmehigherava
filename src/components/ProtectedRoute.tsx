import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowReseller?: boolean;
  teamPermission?: string;
}

function getTeamSession() {
  try {
    const raw = sessionStorage.getItem("rmh_team_session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false, allowReseller = false, teamPermission }) => {
  const { user, isLoading, isAdmin, isReseller } = useAuth();
  const location = useLocation();

  if (teamPermission) {
    const teamSession = getTeamSession();
    if (teamSession && teamSession.permissions?.includes(teamPermission)) {
      return <>{children}</>;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (allowReseller) {
    if (!isAdmin && !isReseller) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  if (isReseller && !isAdmin && !allowReseller && !requireAdmin) {
    return <Navigate to="/client-portal" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
