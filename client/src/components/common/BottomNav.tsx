import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Sparkles,
  Clock,
  PhoneCall,
  Menu,
} from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export const BottomNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  const navItems = [
    {
      label: t('nav.home'),
      to: '/patient/home',
      icon: Home,
      exact: true,
    },
    {
      label: t('nav.treatmentMatcher'),
      to: '/patient/treatment-matcher',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      label: t('nav.queue'),
      to: '/patient/queue',
      icon: Clock,
      pulse: true,
    },
    {
      label: '108 SOS',
      to: 'tel:108',
      isExternal: true,
      icon: PhoneCall,
      isEmergency: true,
    },
    {
      label: t('nav.more'),
      action: toggleSidebar,
      icon: Menu,
    },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon

          if (item.isExternal) {
            return (
              <a
                key={index}
                href={item.to}
                className="flex flex-col items-center justify-center gap-1 text-red-600 active:scale-95 transition-transform touch-target cursor-pointer relative"
                aria-label="Call Emergency Ambulance 108"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse shadow-xs">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-bold tracking-tight text-red-700 leading-none">
                  {item.label}
                </span>
              </a>
            )
          }

          if (item.action) {
            return (
              <button
                key={index}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform touch-target cursor-pointer"
                aria-label="Open Full Menu and Services"
              >
                <Icon className="w-5 h-5 text-slate-500" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight leading-none truncate max-w-[64px]">
                  {item.label}
                </span>
              </button>
            )
          }

          const isActive = location.pathname === item.to

          return (
            <NavLink
              key={index}
              to={item.to!}
              className={cn(
                'flex flex-col items-center justify-center gap-1 relative active:scale-95 transition-transform touch-target',
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-teal-700 stroke-[2.5]' : 'text-slate-400'
                  )}
                  aria-hidden="true"
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-teal-600 text-[8px] font-bold text-white rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
                {item.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-tight leading-none truncate max-w-[64px]',
                  isActive ? 'font-bold text-teal-800' : 'font-medium'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 w-8 h-0.5 bg-teal-700 rounded-full"
                  aria-hidden="true"
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
