import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Search,
  Calendar,
  Clock,
  HeartPulse,
  FileText,
  Share2,
  Users,
  ShieldAlert,
  Stethoscope,
  BedDouble,
  BarChart3,
  RefreshCw,
  LogOut,
  Sparkles,
  Activity,
  Pill,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/auth'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export const Sidebar: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)

  const currentRole: UserRole = user?.role || 'ROLE_PATIENT'

  // Refined, English-first Navigation Items per Role
  const roleNavItems: Record<UserRole, NavItem[]> = {
    ROLE_PATIENT: [
      { label: 'Home', to: '/patient/home', icon: Home },
      { label: 'Find Care', to: '/patient/facilities', icon: Search },
      { label: 'Treatment Matcher', to: '/patient/treatment-matcher', icon: Sparkles },
      { label: 'Appointments', to: '/patient/appointments', icon: Calendar },
      { label: 'Live Queue', to: '/patient/queue', icon: Clock },
      { label: 'Referral Trail', to: '/patient/referrals', icon: Share2 },
      { label: 'Diagnostics & Labs', to: '/patient/diagnostics', icon: Activity },
      { label: 'Medicines & Rx', to: '/patient/medicines', icon: Pill },
      { label: 'My Care & Records', to: '/patient/my-care', icon: FileText },
    ],
    ROLE_ASHA: [
      { label: 'Overview', to: '/asha/dashboard', icon: Home },
      { label: 'Field Intake', to: '/asha/vitals', icon: HeartPulse },
      { label: 'Households', to: '/asha/households', icon: Users },
      { label: 'Priority Watch', to: '/asha/high-risk', icon: ShieldAlert, badge: 'Urgent' },
      { label: 'Sync Queue', to: '/asha/sync', icon: RefreshCw },
    ],
    ROLE_ANM: [
      { label: 'Overview', to: '/asha/dashboard', icon: Home },
      { label: 'Field Intake', to: '/asha/vitals', icon: HeartPulse },
      { label: 'Immunization', to: '/asha/households', icon: Users },
      { label: 'High-Risk Care', to: '/asha/high-risk', icon: ShieldAlert },
      { label: 'Sync Queue', to: '/asha/sync', icon: RefreshCw },
    ],
    ROLE_DOCTOR: [
      { label: 'OPD Desk', to: '/doctor/desk', icon: Stethoscope },
      { label: 'Consultation', to: '/doctor/consultation', icon: HeartPulse },
      { label: 'Initiate Referral', to: '/doctor/referral/new', icon: Share2 },
      { label: 'Patient Directory', to: '/doctor/patients', icon: FileText },
    ],
    ROLE_SPECIALIST: [
      { label: 'Specialist Console', to: '/doctor/desk', icon: Stethoscope },
      { label: 'Teleconsultation', to: '/doctor/teleconsult', icon: HeartPulse },
      { label: 'Inbound Referrals', to: '/doctor/inbound', icon: Share2 },
    ],
    ROLE_FACILITY_STAFF: [
      { label: 'Bed Census', to: '/facility/beds', icon: BedDouble },
      { label: 'Queue Dispenser', to: '/facility/tokens', icon: Clock },
      { label: 'Pharmacy Stocks', to: '/facility/pharmacy', icon: FileText },
      { label: 'Blood Bank Hub', to: '/facility/blood-bank', icon: HeartPulse },
    ],
    ROLE_DISTRICT_ADMIN: [
      { label: 'Command Center', to: '/admin/command', icon: BarChart3 },
      { label: 'Surveillance Map', to: '/admin/surveillance', icon: ShieldAlert },
      { label: 'Referral Dynamics', to: '/admin/referral-flow', icon: Share2 },
      { label: 'Resource Network', to: '/admin/inventory', icon: BedDouble },
    ],
    ROLE_SUPER_ADMIN: [
      { label: 'Command Center', to: '/admin/command', icon: BarChart3 },
      { label: 'Audit & Compliance', to: '/admin/audit', icon: FileText },
    ],
  }

  const activeItems = roleNavItems[currentRole] || roleNavItems.ROLE_PATIENT

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Modern Compact Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between pt-16 lg:pt-0',
          'transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]',
          isSidebarOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        )}
        aria-label="Application navigation"
      >
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {/* Active User Card: Understated */}
          <div className="px-3 py-2.5 mb-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Active Session
            </span>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
              {user?.fullName || 'Citizen User'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.facilityName || 'Public Portal'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5" aria-label="Role specific links">
            {activeItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-[#F2F9F8] text-[#0F5147] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        'text-slate-400 group-hover:text-slate-600'
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
