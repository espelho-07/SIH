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
  RotateCcw,
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
          icon: <Stethoscope className="w-5 h-5 text-[#0F5147]" aria-hidden="true" />,
          bgColor: 'bg-emerald-50 border-emerald-200',
          badgeText: 'Consultation',
          badgeClass: 'bg-emerald-100 text-emerald-800',
        }
      case 'DIAGNOSTIC_LAB':
        return {
          icon: <Activity className="w-5 h-5 text-teal-600" aria-hidden="true" />,
          bgColor: 'bg-teal-50 border-teal-200',
          badgeText: 'Diagnostics & Lab',
          badgeClass: 'bg-teal-100 text-teal-800',
        }
      case 'PRESCRIPTION_MEDICINE':
        return {
          icon: <Pill className="w-5 h-5 text-amber-600" aria-hidden="true" />,
          bgColor: 'bg-amber-50 border-amber-200',
          badgeText: 'Prescription Dispensed',
          badgeClass: 'bg-amber-100 text-amber-800',
        }
      case 'REFERRAL_TRANSFER':
        return {
          icon: <Share2 className="w-5 h-5 text-purple-600" aria-hidden="true" />,
          bgColor: 'bg-purple-50 border-purple-200',
          badgeText: 'Hospital Referral',
          badgeClass: 'bg-purple-100 text-purple-800',
        }
      case 'APPOINTMENT_SCHEDULED':
        return {
          icon: <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />,
          bgColor: 'bg-blue-50 border-blue-200',
          badgeText: 'Appointment',
          badgeClass: 'bg-blue-100 text-blue-800',
        }
      case 'FOLLOW_UP_DUE':
        return {
          icon: <RotateCcw className="w-5 h-5 text-[#0F5147]" aria-hidden="true" />,
          bgColor: 'bg-[#F2F9F8] border-[#D0EAE6]',
          badgeText: 'Follow-Up Due',
          badgeClass: 'bg-emerald-100 text-emerald-900',
        }
      default:
        return {
          icon: <Clock className="w-5 h-5 text-slate-600" aria-hidden="true" />,
          bgColor: 'bg-slate-50 border-slate-200',
          badgeText: 'Clinical Note',
          badgeClass: 'bg-slate-100 text-slate-800',
        }
    }
  }

  const config = getCategoryConfig()

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Timeline vertical connector line */}
      {!isLast && (
        <div
          className="absolute left-5 sm:left-6 top-12 -bottom-4 w-0.5 bg-slate-200 -translate-x-1/2 group-hover:bg-emerald-300 transition-colors"
          aria-hidden="true"
        />
      )}

      {/* Node Icon Avatar */}
      <div
        className={`relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${config.bgColor}`}
      >
        {config.icon}
      </div>

      {/* Event Card Content */}
      <div className="flex-1 pb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200">
          {/* Header Row: Category Badge, Timestamp, Attachments */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badgeClass}`}
              >
                {config.badgeText}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {event.displayDate}
              </span>
            </div>

            {event.attachmentCount && event.attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                <Paperclip className="w-3 h-3" aria-hidden="true" />
                {event.attachmentCount} report{event.attachmentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Event Title */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {event.title}
          </h4>

          {/* Facility & Doctor Row */}
          <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {event.facilityName}
            </span>
            <span className="text-slate-300">•</span>
            <span>{event.department}</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-800">
              {event.clinicianName}
            </span>
          </div>

          {/* Clinical Snippet Section */}
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            {event.chiefComplaint && (
              <p className="text-xs sm:text-sm">
                <span className="font-semibold text-slate-700">Reason: </span>
                {event.chiefComplaint}
              </p>
            )}

            {event.diagnosis && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-800">
                <span>Diagnosis:</span>
                <span className="text-emerald-800 font-bold">{event.diagnosis}</span>
              </div>
            )}

            {/* Diagnostic Test Items preview */}
            {event.diagnostics && event.diagnostics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {event.diagnostics.map((diag, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs text-[#0F5147] font-medium"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium"
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
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-900">
                  <span>Referral: {event.referralSummary.referralCode}</span>
                  <span className="text-purple-800 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
                    Bed Locked
                  </span>
                </div>
                <p className="text-purple-800">
                  Destination: {event.referralSummary.destinationFacility}
                </p>
                <p className="text-slate-600">
                  Reason: {event.referralSummary.reason}
                </p>
              </div>
            )}
          </div>

          {/* Action Row & Digital Doctor Signature */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>
                Verified by {event.signedByDoctorName} ({event.doctorRegistrationNumber})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {event.actionRoute && event.actionLabel && (
                <Link
                  to={event.actionRoute}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[38px] text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <span>{event.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => onOpenDetail(event)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] text-xs font-semibold text-[#0F5147] bg-[#F2F9F8] hover:bg-[#E5F4F1] rounded-lg border border-[#D0EAE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 cursor-pointer"
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
