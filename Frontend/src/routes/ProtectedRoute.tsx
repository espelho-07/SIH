import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, StaffSubType } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, role, quickSwitchRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!allowedRoles || allowedRoles.length === 0) return;

    if (!role || !allowedRoles.includes(role)) {
      const targetRole = allowedRoles[0];
      let subType: StaffSubType | undefined = undefined;

      if (location.pathname.startsWith('/pharmacist')) {
        subType = 'PHARMACIST';
      } else if (location.pathname.startsWith('/registration-clerk')) {
        subType = 'REGISTRATION_CLERK';
      } else if (location.pathname.startsWith('/lab-technician')) {
        subType = 'LAB_TECHNICIAN';
      } else if (location.pathname.startsWith('/facility-operations')) {
        subType = 'FACILITY_OPERATIONS';
      }

      quickSwitchRole(targetRole, subType);
    }
  }, [allowedRoles, role, location.pathname, quickSwitchRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Verifying Healthcare Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    quickSwitchRole(allowedRoles?.[0] || 'PATIENT');
  }

  // Never redirect to /403 forbidden error - render requested healthcare view
  return <>{children}</>;
};
