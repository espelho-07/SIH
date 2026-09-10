import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Stethoscope,
  FileCheck2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import type { FollowUpCareItem } from '@/types/followUp'

export interface FollowUpHeroActionCardProps {
  followUp: FollowUpCareItem
  onSelect: (followUp: FollowUpCareItem) => void
}

export const FollowUpHeroActionCard: React.FC<FollowUpHeroActionCardProps> = ({
  followUp,
  onSelect,
}) => {
  const isMissed = followUp.status === 'MISSED'
  const isDue = followUp.status === 'DUE'

  return (
    <section
      role="region"
      aria-label="High-Priority Follow-Up Action"
      className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#0F5147]/50 transition-all duration-200 space-y-4"
    >
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
              isMissed
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : isDue
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-teal-100 text-teal-900 border border-teal-300'
            }`}
          >
            {isMissed ? (
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isMissed ? 'Follow-Up Due (Window Passed)' : 'Needs Your Attention'}</span>
          </span>

          <span className="text-xs font-semibold text-slate-500">
            {followUp.specialty} Continuity
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>
            {isMissed ? (
              <>Due was <strong>{followUp.recommendedDateIso}</strong></>
            ) : (
              <>Target: <strong>{followUp.recommendedDateIso}</strong></>
            )}
          </span>
        </div>
      </div>

      {/* Main Headline & Context */}
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {followUp.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          {followUp.clinicalReason}
        </p>
      </div>

      {/* Hospital & Clinician Context Bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-150 text-xs text-slate-700">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{followUp.facilityName}</span>
          <span className="text-slate-400">({followUp.departmentName})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
          <span>With <strong className="font-semibold text-slate-900">{followUp.doctorName}</strong></span>
        </div>
        {followUp.prerequisiteDiagnostics && followUp.prerequisiteDiagnostics.length > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Prerequisite report ready</span>
          </div>
        )}
      </div>

      {/* Patient Friendly Instruction Box if Missed */}
      {isMissed && followUp.missedNotice && (
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            {followUp.missedNotice}
          </p>
        </div>
      )}

      {/* Actions Row */}
      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(followUp)}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0F5147] hover:text-[#0B3D35] hover:underline cursor-pointer py-2.5 px-3 rounded-lg"
        >
          <span>View Full Clinical Details & Instructions</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/patient/appointments/book?facilityId=${followUp.facilityId}&doctorId=doc-001&followUpId=${followUp.id}&treatment=${encodeURIComponent(followUp.condition)}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs sm:text-sm font-bold rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>{isMissed ? 'Reschedule Follow-Up Appointment' : 'Book Follow-Up Slot'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
