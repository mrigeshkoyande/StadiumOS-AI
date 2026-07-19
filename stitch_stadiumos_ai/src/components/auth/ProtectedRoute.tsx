import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RedirectToLogin: React.FC = () => {
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('open-login-drawer'));
  }, []);
  return <Navigate to="/" replace />;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('stadiumos_user');
  
  if (!userStr) {
    // Not logged in, redirect to home and open login drawer
    return <RedirectToLogin />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'Admin') return <Navigate to="/admin" replace />;
      if (user.role === 'Fan') return <Navigate to="/ticket" replace />;
      if (user.role === 'Volunteer') return <Navigate to="/scanner" replace />;
      return <Navigate to="/operations" replace />;
    }
  } catch {
    localStorage.removeItem('stadiumos_user');
    return <RedirectToLogin />;
  }

  return <>{children}</>;
};
