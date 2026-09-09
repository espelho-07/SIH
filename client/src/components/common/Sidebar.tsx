import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Search,
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

  // Navigation Items per Role
  const roleNavItems: Record<UserRole, NavItem[]> = {
    ROLE_PATIENT: [
      { label: 'Patient Home', to: '/patient/home', icon: Home },
      { label: 'Treatment Matcher', to: '/patient/treatment-matcher', icon: Sparkles, badge: 'AI' },
      { label: 'Live Queue & Token', to: '/patient/queue', icon: Clock },
      { label: 'Find Healthcare', to: '/patient/facilities', icon: Search },
      { label: 'Referral Trail', to: '/patient/referrals', icon: Share2 },
      { label: 'Health Records (FHIR)', to: '/patient/records', icon: FileText },
    ],
    ROLE_ASHA: [
      { label: 'ASHA Dashboard', to: '/asha/dashboard', icon: Home },
      { label: 'Field Vitals Intake', to: '/asha/vitals', icon: HeartPulse },
      { label: 'Household Register', to: '/asha/households', icon: Users },
      { label: 'High-Risk Watchlist', to: '/asha/high-risk', icon: ShieldAlert, badge: 'Urgent' },
      { label: 'Offline Sync Queue', to: '/asha/sync', icon: RefreshCw },
    ],
    ROLE_ANM: [
      { label: 'ANM Dashboard', to: '/asha/dashboard', icon: Home },
      { label: 'Field Vitals Intake', to: '/asha/vitals', icon: HeartPulse },
      { label: 'Immunization Register', to: '/asha/households', icon: Users },
      { label: 'High-Risk Mothers', to: '/asha/high-risk', icon: ShieldAlert },
      { label: 'Offline Sync Queue', to: '/asha/sync', icon: RefreshCw },
    ],
    ROLE_DOCTOR: [
      { label: 'OPD Desk Queue', to: '/doctor/desk', icon: Stethoscope },
      { label: 'Consultation Studio', to: '/doctor/consultation', icon: HeartPulse },
      { label: 'Initiate Referral', to: '/doctor/referral/new', icon: Share2 },
      { label: 'Patient Records', to: '/doctor/patients', icon: FileText },
    ],
    ROLE_SPECIALIST: [
      { label: 'Specialist Desk', to: '/doctor/desk', icon: Stethoscope },
      { label: 'Teleconsultation Calls', to: '/doctor/teleconsult', icon: HeartPulse },
      { label: 'Inbound Referrals', to: '/doctor/inbound', icon: Share2 },
    ],
    ROLE_FACILITY_STAFF: [
      { label: 'Bed Census Telemetry', to: '/facility/beds', icon: BedDouble },
      { label: 'Queue Token Dispenser', to: '/facility/tokens', icon: Clock },
      { label: 'Pharmacy Stocks', to: '/facility/pharmacy', icon: FileText },
      { label: 'Blood Bank Hub', to: '/facility/blood-bank', icon: HeartPulse },
    ],
    ROLE_DISTRICT_ADMIN: [
      { label: 'Command Center', to: '/admin/command', icon: BarChart3 },
      { label: 'Outbreak Heatmap', to: '/admin/surveillance', icon: ShieldAlert },
      { label: 'Referral Bottlenecks', to: '/admin/referral-flow', icon: Share2 },
      { label: 'Resource Intelligence', to: '/admin/inventory', icon: BedDouble },
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Persistent Desktop Sidebar / Drawer on Mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between pt-16 lg:pt-0',
          'transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]',
          isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {/* User Role Card */}
          <div className="p-3 mb-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 block">
              Active Console
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.fullName || 'Guest Citizen'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.facilityName || 'Public Portal'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Role specific links">
            {activeItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-cyan-50 text-cyan-800 border-l-4 border-cyan-600'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-500" aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>Reset Session / Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
