import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Menu, X, MapPin, Check, PhoneCall, Bot, Bell } from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import { NotificationPopover } from '@/components/notification/NotificationPopover'
import { notificationService } from '@/services/notificationService'
import type { NotificationItem } from '@/types/notification'
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
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const setVoiceModalOpen = useUiStore((state) => state.setVoiceModalOpen)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)

  const [currentDistrict, setCurrentDistrict] = useState('Varanasi, UP')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([])
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadNotifs = async () => {
      try {
        const [count, list] = await Promise.all([
          notificationService.getUnreadCount(),
          notificationService.getNotifications(),
        ])
        if (isMounted) {
          setUnreadNotifsCount(count)
          setRecentNotifications(list)
        }
      } catch {
        // safe fallback
      }
    }

    loadNotifs()
    const unsubscribe = notificationService.subscribe(() => {
      loadNotifs()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id)
    const [count, list] = await Promise.all([
      notificationService.getUnreadCount(),
      notificationService.getNotifications(),
    ])
    setUnreadNotifsCount(count)
    setRecentNotifications(list)
  }

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead()
    const [count, list] = await Promise.all([
      notificationService.getUnreadCount(),
      notificationService.getNotifications(),
    ])
    setUnreadNotifsCount(count)
    setRecentNotifications(list)
  }

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
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 touch-target flex items-center justify-center cursor-pointer transition-colors"
                aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link
                to="/"
                className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#0F5147] rounded-lg group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0F5147] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#0A3F37] transition-colors">
                  <Plus className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
                    HEALTH<span className="text-[#0F5147] font-semibold">CONNECT</span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5 hidden xs:block">
                    Public Healthcare Access
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Location, 108 Emergency, Language, User Context */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Location Pill */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer touch-target"
                aria-label={`Current location: ${currentDistrict}. Tap to change district.`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#0F5147] shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-900 max-w-[90px] sm:max-w-none truncate">
                  {currentDistrict.split(',')[0]}
                </span>
                <span className="text-slate-500 font-normal hidden sm:inline">• Change</span>
              </button>

              {/* Restrained Emergency 108 Action */}
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer touch-target"
                aria-label="Call Emergency Ambulance 108"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <PhoneCall className="w-3 h-3 text-red-600" aria-hidden="true" />
                <span className="hidden sm:inline">108 Emergency</span>
                <span className="sm:hidden font-bold">108</span>
              </a>

              {/* HealthConnect AI & Voice Assistant Trigger */}
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#F2F9F8] hover:bg-[#E2F2EF] border border-[#D0EAE6] text-[#0F5147] rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer touch-target shadow-2xs"
                aria-label="Open Healthcare AI & Voice Assistant"
                title="AI & Voice Healthcare Assistant"
              >
                <Bot className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
                <span className="hidden sm:inline">Assistant</span>
              </button>

              {/* Notification Bell with Dynamic Unread Badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationPopoverOpen((prev) => !prev)}
                  className="relative inline-flex items-center justify-center p-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer touch-target shadow-2xs"
                  aria-label={`Notifications ${unreadNotifsCount > 0 ? `(${unreadNotifsCount} unread)` : ''}`}
                  title="Unified Notifications & Patient Action Center"
                >
                  <Bell className="w-4 h-4 text-slate-700" aria-hidden="true" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#0F5147] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-fade-in">
                      {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                    </span>
                  )}
                </button>

                <NotificationPopover
                  isOpen={isNotificationPopoverOpen}
                  onClose={() => setIsNotificationPopoverOpen(false)}
                  notifications={recentNotifications}
                  unreadCount={unreadNotifsCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </div>

              {/* Language Selector */}
              <LanguageSelector />

              {/* Role Context Pill for Dev / Evaluation */}
              <div className="hidden lg:flex items-center pl-2 border-l border-slate-200">
                <select
                  value={user?.role || 'ROLE_PATIENT'}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5147] cursor-pointer transition-colors shadow-2xs"
                  aria-label="Active session role"
                >
                  <option value="ROLE_PATIENT">Patient View</option>
                  <option value="ROLE_ASHA">ASHA Worker</option>
                  <option value="ROLE_DOCTOR">Physician View</option>
                  <option value="ROLE_FACILITY_STAFF">Facility Staff</option>
                  <option value="ROLE_DISTRICT_ADMIN">District Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* District Selection Sheet / Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0F5147]" />
                <h2 className="text-sm font-bold text-slate-900">
                  Select Healthcare Region
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Choose your district to see verified public healthcare facilities, real-time bed occupancy, and specialist on-duty status:
            </p>

            <div className="space-y-1 max-h-60 overflow-y-auto">
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2F9F8] text-[#0F5147] font-semibold border border-[#D1E5E2]'
                        : 'bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{dist}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0F5147]" />}
                  </button>
                )
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
