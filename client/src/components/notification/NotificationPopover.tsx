import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  Settings,
  Calendar,
  Clock,
  Share2,
  Activity,
  Pill,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  X,
} from 'lucide-react'
import type { NotificationItem, NotificationCategory } from '@/types/notification'

export interface NotificationPopoverProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

function getCategoryMiniIcon(category: NotificationCategory) {
  switch (category) {
    case 'APPOINTMENT':
      return <Calendar className="w-3.5 h-3.5 text-[#0F5147]" />
    case 'QUEUE':
      return <Clock className="w-3.5 h-3.5 text-emerald-700" />
    case 'REFERRAL':
      return <Share2 className="w-3.5 h-3.5 text-blue-700" />
    case 'DIAGNOSTIC':
      return <Activity className="w-3.5 h-3.5 text-purple-700" />
    case 'PRESCRIPTION':
      return <Pill className="w-3.5 h-3.5 text-amber-700" />
    case 'FOLLOW_UP':
      return <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
    case 'EMERGENCY':
      return <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
    default:
      return <Bell className="w-3.5 h-3.5 text-slate-600" />
  }
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      onMarkAsRead(item.id)
    }
    onClose()
    if (item.actionUrl) {
      navigate(item.actionUrl)
    }
  }

  const previewItems = notifications.slice(0, 5)

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Notification quick preview"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-fade-in"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0F5147] text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F5147] hover:text-[#0B3D35] px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close popover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popover Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {previewItems.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
            <p className="text-xs font-semibold text-slate-700">No recent notifications</p>
            <p className="text-[11px] text-slate-500">
              When clinical updates occur, they will appear here in real time.
            </p>
          </div>
        ) : (
          previewItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={`w-full text-left p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                !item.isRead ? 'bg-[#F2F9F8]/50' : 'bg-white'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                {getCategoryMiniIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.sourceModule}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.relativeTime}
                  </span>
                </div>

                <p className={`text-xs leading-snug line-clamp-1 ${!item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                  {item.title}
                </p>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {item.message}
                </p>
              </div>

              {!item.isRead && (
                <span
                  className="w-2 h-2 rounded-full bg-[#0F5147] shrink-0 mt-1.5"
                  aria-hidden="true"
                />
              )}
            </button>
          ))
        )}
      </div>

      {/* Popover Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          to="/patient/notifications"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-semibold text-[#0F5147] hover:text-[#0B3D35] hover:underline"
        >
          <span>View all in Action Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/patient/notifications/preferences"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          title="Notification Preferences"
          aria-label="Notification Preferences"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
