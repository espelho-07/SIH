import React from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Share2,
  Activity,
  RotateCcw,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Building2,
  Stethoscope,
  Sparkles,
} from 'lucide-react'
import type { ActionCenterItem, ActionCenterTaskType } from '@/types/notification'

export interface ActionCenterHeroCardProps {
  action: ActionCenterItem
}

function getTaskIcon(taskType: ActionCenterTaskType) {
  switch (taskType) {
    case 'APPROACH_CONSULTATION_ROOM':
    case 'CHECK_IN_OPD_QUEUE':
      return <Clock className="w-5 h-5 text-emerald-700" aria-hidden="true" />
    case 'BOOK_REFERRAL_APPOINTMENT':
      return <Share2 className="w-5 h-5 text-blue-700" aria-hidden="true" />
    case 'SCHEDULE_FOLLOW_UP':
    case 'RESCHEDULE_MISSED_VISIT':
      return <RotateCcw className="w-5 h-5 text-teal-700" aria-hidden="true" />
    case 'COLLECT_DIAGNOSTIC_SAMPLE':
    case 'REVIEW_LAB_REPORT':
      return <Activity className="w-5 h-5 text-purple-700" aria-hidden="true" />
    default:
      return <Calendar className="w-5 h-5 text-[#0F5147]" aria-hidden="true" />
  }
}

export const ActionCenterHeroCard: React.FC<ActionCenterHeroCardProps> = ({ action }) => {
  const isCritical = action.priority === 'CRITICAL'
  const isHigh = action.priority === 'HIGH'

  return (
    <section
      role="region"
      aria-label={`Action required: ${action.title}`}
      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-4 shadow-sm ${
        isCritical
          ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200'
          : isHigh
            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
            : 'bg-white border-[#0F5147]/30 hover:border-[#0F5147]/60'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
              isCritical
                ? 'bg-red-100 text-red-900 border border-red-300'
                : isHigh
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-700 animate-pulse" aria-hidden="true" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
            )}
            <span>{isCritical ? 'Urgent Action Required' : 'Action Required'}</span>
          </span>

          <span className="text-xs font-semibold text-slate-500">
            {action.sourceModule}
          </span>
        </div>

        {action.deadlineContext && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{action.deadlineContext}</span>
          </div>
        )}
      </div>

      {/* Main Headline & Clinical Justification */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isCritical
              ? 'bg-red-100 border-red-200 text-red-700'
              : isHigh
                ? 'bg-amber-100 border-amber-200 text-amber-800'
                : 'bg-[#F2F9F8] border-[#D0EAE6] text-[#0F5147]'
          }`}
        >
          {getTaskIcon(action.taskType)}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {action.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {action.reason}
          </p>
        </div>
      </div>

      {/* Hospital & Clinician Context Bar */}
      {(action.facilityName || action.doctorName) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 px-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
          {action.facilityName && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
              <span className="font-semibold text-slate-900">{action.facilityName}</span>
            </div>
          )}
          {action.doctorName && (
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
              <span>With <strong className="font-semibold text-slate-900">{action.doctorName}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* CTA Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/80">
        <span className="text-xs text-slate-500">
          Resolved items update automatically across your longitudinal health profile.
        </span>

        <Link
          to={action.targetUrl}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs sm:text-sm font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
        >
          <span>{action.ctaText}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
