import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  const navItems = [
    {
      label: 'Home',
      to: '/patient/home',
      icon: Home,
    },
    {
      label: 'Find Care',
      to: '/patient/treatment-matcher',
      icon: Sparkles,
    },
    {
      label: 'Queue',
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
      label: 'More',
      action: toggleSidebar,
      icon: Menu,
    },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40 lg:hidden shadow-[0_-2px_10px_rgba(15,23,42,0.04)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
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
                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
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
                className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 active:scale-95 transition-transform touch-target cursor-pointer"
                aria-label="Open Full Navigation"
              >
                <Icon className="w-5 h-5 text-slate-400" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight leading-none text-slate-600">
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
                isActive ? 'text-[#0F5147]' : 'text-slate-400 hover:text-slate-700'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-[#0F5147] stroke-[2.2]' : 'text-slate-400'
                  )}
                  aria-hidden="true"
                />
                {item.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-tight leading-none',
                  isActive ? 'font-bold text-[#0F5147]' : 'font-medium text-slate-500'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 w-6 h-0.5 bg-[#0F5147] rounded-full"
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

