import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  FileCheck2,
  Pill,
  Users,
} from 'lucide-react'
import type { FollowUpCareItem } from '@/types/followUp'

export interface FollowUpCareCardProps {
  followUp: FollowUpCareItem
  onOpenDetail: (followUp: FollowUpCareItem) => void
  onCheckInQueue?: (followUpId: string) => void
}

export const FollowUpCareCard: React.FC<FollowUpCareCardProps> = ({
  followUp,
  onOpenDetail,
  onCheckInQueue,
}) => {
  const getStatusBadge = () => {
    switch (followUp.status) {
      case 'DUE':
        return {
          label: 'Follow-Up Due',
          classes: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />,
        }
      case 'SCHEDULED':
      case 'UPCOMING':
        return {
          label: 'Appointment Scheduled',
          classes: 'bg-sky-100 text-sky-900 border-sky-300',
          icon: <Calendar className="w-3.5 h-3.5 text-sky-700" aria-hidden="true" />,
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          classes: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />,
        }
      case 'MISSED':
        return {
          label: 'Window Passed',
          classes: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />,
        }
      default:
        return {
          label: followUp.status,
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />,
        }
    }
  }

  const badge = getStatusBadge()

  return (
    <article
      aria-labelledby={`followup-heading-${followUp.id}`}
      className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#0F5147]/50 hover:shadow-xs transition-all duration-150 flex flex-col justify-between gap-4"
    >
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.classes}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>

            {followUp.urgency === 'PRIORITY' && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                Priority Care
              </span>
            )}
          </div>

          <span className="font-mono text-xs text-slate-400 font-semibold">
            {followUp.id}
          </span>
        </div>

        {/* Title & Clinical Reason */}
        <div>
          <h3
            id={`followup-heading-${followUp.id}`}
            className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[#0F5147] transition-colors"
          >
            {followUp.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {followUp.clinicalReason}
          </p>
        </div>

        {/* Facility & Doctor Meta */}
        <div className="space-y-1.5 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#0F5147] shrink-0" aria-hidden="true" />
            <span className="font-medium text-slate-800 truncate">{followUp.facilityName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{followUp.departmentName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5 text-[#0F5147] shrink-0" aria-hidden="true" />
            <span>Consultant: <strong className="font-semibold text-slate-800">{followUp.doctorName}</strong></span>
          </div>

          {/* Date Context */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            {followUp.status === 'SCHEDULED' && followUp.linkedAppointmentDate ? (
              <span className="font-medium text-sky-900">
                Confirmed Appointment: <strong>{followUp.linkedAppointmentDate}</strong> ({followUp.linkedAppointmentSlot || 'Morning'})
              </span>
            ) : followUp.status === 'COMPLETED' && followUp.completedAtIso ? (
              <span className="text-slate-600">
                Completed on <strong>{new Date(followUp.completedAtIso).toLocaleDateString()}</strong>
              </span>
            ) : (
              <span className={followUp.status === 'MISSED' ? 'text-amber-900 font-medium' : 'text-slate-700'}>
                Target Window: <strong>{followUp.windowStartIso}</strong> to <strong>{followUp.windowEndIso}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Diagnostic / Med Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {followUp.prerequisiteDiagnostics && followUp.prerequisiteDiagnostics.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900">
              <FileCheck2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              <span>Prerequisite Lab Report Ready</span>
            </span>
          )}

          {followUp.linkedMedications && followUp.linkedMedications.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-900">
              <Pill className="w-3 h-3 text-indigo-600" aria-hidden="true" />
              <span>{followUp.linkedMedications.length} Prescriptions Linked</span>
            </span>
          )}

          {followUp.frontlineContinuity && followUp.frontlineContinuity.homeVisitStatus === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-900">
              <Users className="w-3 h-3 text-teal-700" aria-hidden="true" />
              <span>ASHA Visit: {followUp.frontlineContinuity.homeVisitDate}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => onOpenDetail(followUp)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0F5147] hover:underline cursor-pointer py-2 touch-target"
        >
          <span>View Details & Instructions</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2">
          {followUp.status === 'DUE' && (
            <Link
              to={`/patient/appointments/book?facilityId=${followUp.facilityId}&doctorId=doc-001&followUpId=${followUp.id}&treatment=${encodeURIComponent(followUp.condition)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Book Appointment</span>
            </Link>
          )}

          {followUp.status === 'MISSED' && (
            <Link
              to={`/patient/appointments/book?facilityId=${followUp.facilityId}&doctorId=doc-001&followUpId=${followUp.id}&treatment=${encodeURIComponent(followUp.condition)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reschedule Follow-Up</span>
            </Link>
          )}

          {followUp.status === 'SCHEDULED' && (
            <>
              {followUp.linkedTokenNumber ? (
                <Link
                  to="/patient/queue"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors touch-target"
                >
                  <span>Token: {followUp.linkedTokenNumber}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onCheckInQueue && onCheckInQueue(followUp.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all touch-target cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Check In (Queue)</span>
                </button>
              )}

              {followUp.linkedAppointmentId && (
                <Link
                  to={`/patient/appointments/${followUp.linkedAppointmentId}`}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors touch-target"
                >
                  <span>View Slip</span>
                </Link>
              )}
            </>
          )}

          {followUp.status === 'COMPLETED' && (
            <button
              type="button"
              onClick={() => onOpenDetail(followUp)}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors touch-target cursor-pointer"
            >
              <span>View Care Outcome</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
