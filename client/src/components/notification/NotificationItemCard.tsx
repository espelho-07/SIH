import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Share2,
  Activity,
  Pill,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Building2,
  Stethoscope,
  Bell,
} from 'lucide-react'
import type { NotificationItem, NotificationCategory, NotificationPriority } from '@/types/notification'

export interface NotificationItemCardProps {
  notification: NotificationItem
  onMarkAsRead?: (id: string) => void
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case 'APPOINTMENT':
      return <Calendar className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
    case 'QUEUE':
      return <Clock className="w-4 h-4 text-emerald-700" aria-hidden="true" />
    case 'REFERRAL':
      return <Share2 className="w-4 h-4 text-blue-700" aria-hidden="true" />
    case 'DIAGNOSTIC':
      return <Activity className="w-4 h-4 text-purple-700" aria-hidden="true" />
    case 'PRESCRIPTION':
      return <Pill className="w-4 h-4 text-amber-700" aria-hidden="true" />
    case 'FOLLOW_UP':
      return <RotateCcw className="w-4 h-4 text-teal-700" aria-hidden="true" />
    case 'EMERGENCY':
      return <ShieldAlert className="w-4 h-4 text-red-700" aria-hidden="true" />
    default:
      return <Bell className="w-4 h-4 text-slate-600" aria-hidden="true" />
  }
}

function getPriorityBadge(priority: NotificationPriority) {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          Critical
        </span>
      )
    case 'IMPORTANT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          Important
        </span>
      )
    case 'ACTION_REQUIRED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
          Action Required
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          Info
        </span>
      )
  }
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <article
      role="article"
      aria-label={`${notification.priority} notification: ${notification.title}`}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
        notification.isRead
          ? 'bg-white/80 border-slate-200 hover:border-slate-300'
          : 'bg-white border-[#0F5147]/40 shadow-xs ring-1 ring-[#0F5147]/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Content */}
        <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              notification.isRead
                ? 'bg-slate-50 border-slate-200'
                : 'bg-[#F2F9F8] border-[#D0EAE6]'
            }`}
          >
            {getCategoryIcon(notification.category)}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Header: Badges & Relative Time */}
            <div className="flex flex-wrap items-center gap-2">
              {!notification.isRead && (
                <span
                  className="w-2 h-2 rounded-full bg-[#0F5147] shrink-0"
                  aria-label="Unread notification"
                  title="Unread"
                />
              )}
              {getPriorityBadge(notification.priority)}
              <span className="text-xs font-semibold text-slate-500">
                {notification.sourceModule}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <time
                dateTime={notification.timestampIso}
                className="text-xs text-slate-500 font-medium"
              >
                {notification.relativeTime}
              </time>
            </div>

            {/* Title */}
            <h3
              className={`text-sm sm:text-base tracking-tight leading-snug ${
                notification.isRead
                  ? 'font-bold text-slate-800'
                  : 'font-extrabold text-slate-900'
              }`}
            >
              {notification.title}
            </h3>

            {/* Clinical Message */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {notification.message}
            </p>

            {/* Facility & Clinician Context */}
            {(notification.facilityName || notification.doctorName) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-600">
                {notification.facilityName && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="font-medium text-slate-700">{notification.facilityName}</span>
                  </div>
                )}
                {notification.doctorName && (
                  <div className="flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>With <strong className="font-semibold text-slate-800">{notification.doctorName}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          {!notification.isRead && onMarkAsRead && (
            <button
              type="button"
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors cursor-pointer touch-target"
              title="Mark as read"
              aria-label={`Mark "${notification.title}" as read`}
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {notification.actionUrl && (
            <Link
              to={notification.actionUrl}
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-[#F2F9F8] border border-slate-200 hover:border-[#D0EAE6] text-[#0F5147] text-xs font-semibold rounded-xl active:scale-95 transition-all touch-target"
            >
              <span>{notification.actionLabel || 'View Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
