import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { UserRole } from '@/types/auth'

interface RoleGuardProps {
  allowedRoles: UserRole | UserRole[]
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { hasRole, user } = useAuth()

  const isAllowed = hasRole(allowedRoles)

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Restricted Access Console</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your current role (<span className="font-semibold text-slate-800">{user?.role || 'GUEST'}</span>) does not have authorization to view this medical workspace. This action has been logged for compliance auditing.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.assign('/patient/home')}
          >
            Return to Public Home
          </Button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
