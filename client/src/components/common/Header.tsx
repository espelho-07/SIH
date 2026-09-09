import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, PhoneCall, Menu, X, MapPin, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './LanguageSelector'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/auth'

const COMMON_DISTRICTS = [
  'Varanasi, UP',
  'Prayagraj, UP',
  'Gorakhpur, UP',
  'Lucknow, UP',
  'Mirzapur, UP',
  'Chandauli, UP',
  'Patna, Bihar',
]

export const Header: React.FC = () => {
  const { t } = useTranslation()
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)

  const [currentDistrict, setCurrentDistrict] = useState('Varanasi, UP')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  // Role Switching helper for development and evaluation
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
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 touch-target flex items-center justify-center cursor-pointer"
                aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link
                to="/"
                className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-teal-700 rounded-lg group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-800 transition-colors">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                    संजीवनी <span className="text-teal-700 font-extrabold">SANJEEVANI</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 tracking-wide mt-0.5 hidden xs:block">
                    राष्ट्रीय स्वास्थ्य सेवा • National Health
                  </span>
                </div>
              </Link>
            </div>

            {/* Location Pill: Interactive */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-teal-800 transition-colors cursor-pointer touch-target"
                aria-label={`Current location: ${currentDistrict}. Click to change.`}
              >
                <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[120px]">{currentDistrict}</span>
                <span className="text-[10px] text-teal-700 font-bold underline ml-0.5">
                  {t('common.changeLocation')}
                </span>
              </button>

              {/* Emergency 108 Hotline Action */}
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 active:bg-red-800 shadow-xs transition-colors cursor-pointer touch-target"
                aria-label="Call emergency ambulance 108"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                <span className="font-extrabold tracking-tight">108 SOS</span>
              </a>

              {/* Language Switcher */}
              <LanguageSelector />

              {/* Role Switcher Pill for Testing */}
              <div className="hidden xl:flex items-center pl-2 border-l border-slate-200">
                <select
                  value={user?.role || 'ROLE_PATIENT'}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="text-xs font-semibold py-1 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 cursor-pointer"
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

      {/* District Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {t('common.location')} (जिला चुनें)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select your district to find nearest hospitals, emergency beds, and real-time OPD queues:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {COMMON_DISTRICTS.map((dist) => {
                const isSelected = currentDistrict === dist
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      setCurrentDistrict(dist)
                      setIsLocationModalOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 border border-teal-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span>{dist}</span>
                    {isSelected && <Check className="w-4 h-4 text-teal-700" />}
                  </button>
                )
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

