import React from 'react'
import { Link } from 'react-router-dom'
import {
  Stethoscope,
  Activity,
  Pill,
  Share2,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  ShieldCheck,
  Building2,
  Paperclip,
} from 'lucide-react'
import type { CareTimelineEvent } from '@/types/record'

export interface CareTimelineItemProps {
  event: CareTimelineEvent
  onOpenDetail: (event: CareTimelineEvent) => void
  isLast?: boolean
}

export const CareTimelineItem: React.FC<CareTimelineItemProps> = ({
  event,
  onOpenDetail,
  isLast = false,
}) => {
  // Determine category badge and icon
  const getCategoryConfig = () => {
    switch (event.eventType) {
      case 'CLINICAL_ENCOUNTER':
        return {
          icon: <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          badgeText: 'Consultation',
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        }
      case 'DIAGNOSTIC_LAB':
        return {
          icon: <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />,
          bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
          badgeText: 'Diagnostics & Lab',
          badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
        }
      case 'PRESCRIPTION_MEDICINE':
        return {
          icon: <Pill className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          badgeText: 'Prescription Dispensed',
          badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
        }
      case 'REFERRAL_TRANSFER':
        return {
          icon: <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />,
          bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
          badgeText: 'Hospital Referral',
          badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
        }
      case 'APPOINTMENT_SCHEDULED':
        return {
          icon: <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
          badgeText: 'Appointment',
          badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
        }
      default:
        return {
          icon: <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" aria-hidden="true" />,
          bgColor: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
          badgeText: 'Clinical Note',
          badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        }
    }
  }

  const config = getCategoryConfig()

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Timeline vertical connector line */}
      {!isLast && (
        <div
          className="absolute left-5 sm:left-6 top-12 -bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 group-hover:bg-emerald-300 dark:group-hover:bg-emerald-700 transition-colors"
          aria-hidden="true"
        />
      )}

      {/* Node Icon Avatar */}
      <div
        className={`relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105 ${config.bgColor}`}
      >
        {config.icon}
      </div>

      {/* Event Card Content */}
      <div className="flex-1 pb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          {/* Header Row: Category Badge, Timestamp, Attachments */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badgeClass}`}
              >
                {config.badgeText}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {event.displayDate}
              </span>
            </div>

            {event.attachmentCount && event.attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                <Paperclip className="w-3 h-3" aria-hidden="true" />
                {event.attachmentCount} report{event.attachmentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Event Title */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {event.title}
          </h4>

          {/* Facility & Doctor Row */}
          <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {event.facilityName}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{event.department}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {event.clinicianName}
            </span>
          </div>

          {/* Clinical Snippet Section */}
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
            {event.chiefComplaint && (
              <p className="text-xs sm:text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Reason: </span>
                {event.chiefComplaint}
              </p>
            )}

            {event.diagnosis && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Diagnosis:</span>
                <span className="text-emerald-700 dark:text-emerald-400">{event.diagnosis}</span>
              </div>
            )}

            {/* Diagnostic Test Items preview */}
            {event.diagnostics && event.diagnostics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {event.diagnostics.map((diag, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/80 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 font-medium"
                  >
                    <span className="font-bold">{diag.testName}:</span>
                    <span>
                      {diag.resultValue} {diag.unit || ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Prescription Items preview */}
            {event.prescriptions && event.prescriptions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {event.prescriptions.map((rx) => (
                  <span
                    key={rx.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium"
                  >
                    <Pill className="w-3 h-3 text-amber-600" aria-hidden="true" />
                    <span>
                      {rx.medicineName} ({rx.dosage})
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* Referral summary preview */}
            {event.referralSummary && (
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-200">
                  <span>Referral: {event.referralSummary.referralCode}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Bed Locked
                  </span>
                </div>
                <p className="text-purple-800 dark:text-purple-300">
                  Destination: {event.referralSummary.destinationFacility}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Reason: {event.referralSummary.reason}
                </p>
              </div>
            )}
          </div>

          {/* Action Row & Digital Doctor Signature */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>
                Verified by {event.signedByDoctorName} ({event.doctorRegistrationNumber})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {event.actionRoute && event.actionLabel && (
                <Link
                  to={event.actionRoute}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[38px] text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-200 rounded-lg transition-colors"
                >
                  <span>{event.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => onOpenDetail(event)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>View Full Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
