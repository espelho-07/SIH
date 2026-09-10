import React from 'react'
import {
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  AlertOctagon,
  RefreshCw,
  Calendar,
  XCircle,
  FileCheck2,
} from 'lucide-react'
import type { ReferralStatus } from '@/types/referral'

export interface ReferralStatusBadgeProps {
  status: ReferralStatus
  className?: string
}

export const ReferralStatusBadge: React.FC<ReferralStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'ACCEPTED_BED_LOCKED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Accepted • Bed Locked</span>
        </span>
      )
    case 'IN_TRANSIT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 animate-pulse ${className}`}
        >
          <Truck className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
          <span>In Transit / En Route</span>
        </span>
      )
    case 'PATIENT_ARRIVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 ${className}`}
        >
          <Building2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>Arrived • Reception Check-in</span>
        </span>
      )
    case 'IN_TREATMENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 ${className}`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>In Specialist Consultation</span>
        </span>
      )
    case 'FALLBACK_REROUTING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>Action Needed: Alternative Matched</span>
        </span>
      )
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200 ${className}`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          <span>Facility Over capacity</span>
        </span>
      )
    case 'APPOINTMENT_BOOKED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 ${className}`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Appointment Scheduled</span>
        </span>
      )
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Care Completed • Closed</span>
        </span>
      )
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Cancelled</span>
        </span>
      )
    case 'SUBMITTED':
    case 'PENDING_CONFIRMATION':
    case 'PENDING_ACCEPTANCE':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>Awaiting Facility Acceptance</span>
        </span>
      )
  }
}
