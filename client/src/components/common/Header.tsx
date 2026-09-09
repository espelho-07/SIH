import React from 'react'
import { Link } from 'react-router-dom'
import { Activity, PhoneCall, Menu, X, UserCheck } from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/auth'

export const Header: React.FC = () => {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)

  // Quick Role Switching helper for development and evaluation
  const handleRoleChange = (role: UserRole) => {
    const roleProfiles: Record<UserRole, { name: string; title: string }> = {
      ROLE_PATIENT: { name: 'Ramesh Kumar', title: 'Citizen / Patient' },
      ROLE_ASHA: { name: 'Sunita Devi', title: 'ASHA Worker (Ward 4)' },
      ROLE_ANM: { name: 'Pooja Sharma', title: 'Auxiliary Nurse Midwife' },
      ROLE_DOCTOR: { name: 'Dr. Rajesh Verma', title: 'Medical Officer (MBBS)' },
      ROLE_SPECIALIST: { name: 'Dr. Anita Desai', title: 'Senior Cardiologist' },
      ROLE_FACILITY_STAFF: { name: 'Mahesh Patil', title: 'Hospital Admission Desk' },
      ROLE_DISTRICT_ADMIN: { name: 'Dr. K. S. Murthy', title: 'Chief Medical Officer' },
      ROLE_SUPER_ADMIN: { name: 'Admin User', title: 'System Administrator' },
    }

    setSession(
      {
        id: `USR-${role.toLowerCase()}`,
        phoneNumber: '+91 98765 43210',
        fullName: roleProfiles[role].name,
        role: role,
        facilityName: 'District Hospital, Varanasi',
        specialization: role === 'ROLE_DOCTOR' ? 'General Medicine' : undefined,
      },
      `mock-jwt-token-for-${role}`
    )
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 touch-target flex items-center justify-center cursor-pointer"
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-cyan-600 rounded-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  SANJEEVANI<span className="text-cyan-600">-CONNECT</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mt-0.5">
                  National Public Health Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Emergency 108 Hotline Action */}
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 active:bg-red-800 shadow-xs transition-colors cursor-pointer"
              aria-label="Call emergency ambulance 108"
            >
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              <span>108 SOS</span>
            </a>

            {/* Language Switcher */}
            <LanguageSelector />

            {/* Role Switcher Pill for Evaluation */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <UserCheck className="w-4 h-4 text-cyan-700" aria-hidden="true" />
              <select
                value={user?.role || 'ROLE_PATIENT'}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="text-xs font-medium py-1 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 cursor-pointer"
                aria-label="Switch active test role"
              >
                <option value="ROLE_PATIENT">Citizen (Patient)</option>
                <option value="ROLE_ASHA">ASHA Worker</option>
                <option value="ROLE_DOCTOR">Doctor / Clinician</option>
                <option value="ROLE_FACILITY_STAFF">Facility Staff</option>
                <option value="ROLE_DISTRICT_ADMIN">District Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
