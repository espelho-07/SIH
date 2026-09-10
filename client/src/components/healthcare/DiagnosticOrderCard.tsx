import React from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Clock,
  FileText,
  ShieldCheck,
  Building2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users2,
  Share2,
} from 'lucide-react'
import type { DiagnosticOrder } from '@/types/diagnostic'

export interface DiagnosticOrderCardProps {
  order: DiagnosticOrder
  onViewReport: (order: DiagnosticOrder) => void
  onFindFacility?: (order: DiagnosticOrder) => void
  className?: string
}

export const DiagnosticOrderCard: React.FC<DiagnosticOrderCardProps> = ({
  order,
  onViewReport,
  onFindFacility,
  className = '',
}) => {
  const isReportReady = order.status === 'REPORT_READY' || order.status === 'REVIEWED'
  const isSamplePending = order.status === 'SAMPLE_COLLECTION_PENDING'
  const isProcessing = order.status === 'PROCESSING' || order.status === 'SAMPLE_COLLECTED'
  const isActionNeeded = order.patientActionRequired

  const getStatusBadge = () => {
    switch (order.status) {
      case 'REPORT_READY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Report Ready
          </span>
        )
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            Clinician Reviewed
          </span>
        )
      case 'SAMPLE_COLLECTION_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            Sample Collection Pending
          </span>
        )
      case 'PROCESSING':
      case 'SAMPLE_COLLECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
            Laboratory Processing
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            Ordered
          </span>
        )
    }
  }

  const getPriorityBadge = () => {
    if (order.priority === 'STAT_EMERGENCY') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
          STAT Emergency
        </span>
      )
    }
    if (order.priority === 'URGENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          Urgent Requisition
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 bg-slate-100">
        Routine Evaluation
      </span>
    )
  }

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-5 sm:p-6 bg-white shadow-xs hover:shadow-md ${
        isActionNeeded
          ? 'border-amber-300 ring-1 ring-amber-100'
          : 'border-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      {/* Header Meta: Category, Order Code, Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            {order.orderCode}
          </span>
          {getPriorityBadge()}
        </div>
        {getStatusBadge()}
      </div>

      {/* Test Name */}
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
        {order.testName}
      </h3>

      {/* Ordering Doctor & Facility */}
      <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          {order.orderingFacilityName}
        </span>
        <span className="text-slate-300">•</span>
        <span className="font-semibold text-slate-800">
          Ordered by {order.orderingDoctorName} ({order.orderingDoctorSpecialty})
        </span>
      </div>

      {/* Clinical Indication */}
      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-700">Clinical Reason: </span>
        {order.clinicalIndication}
      </p>

      {/* Patient Preparation Instructions Callout */}
      {order.patientPreparationInstructions && order.patientPreparationInstructions.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1">
          <span className="font-bold flex items-center gap-1 text-amber-900">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            Patient Preparation Required:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
            {order.patientPreparationInstructions.map((prep, i) => (
              <li key={i}>{prep}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Report Summary Snippet if Report Ready */}
      {order.reportSummarySnippet && isReportReady && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
          <span className="font-bold text-emerald-900 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Laboratory Findings Recorded:
          </span>
          <p className="font-medium text-emerald-950">
            {order.reportSummarySnippet}
          </p>
        </div>
      )}

      {/* Cross-Module Linked Context (Queue / Referral) */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-1 text-xs">
        {order.linkedQueueTokenNumber && (
          <Link
            to="/patient/queue"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100 transition-colors"
          >
            <Users2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
            <span>Phlebotomy Token: {order.linkedQueueTokenNumber}</span>
          </Link>
        )}

        {order.linkedReferralCode && (
          <Link
            to="/patient/referrals"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-semibold hover:bg-purple-100 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
            <span>Linked Referral: {order.linkedReferralCode}</span>
          </Link>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <span className="font-medium">Ordered: </span>
          <span>{new Date(order.orderedAtIso).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isReportReady && (
            <button
              type="button"
              onClick={() => onViewReport(order)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>View Verified Lab Report</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {isSamplePending && order.actionRoute && (
            <Link
              to={order.actionRoute}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Go to Phlebotomy Queue</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}

          {order.status === 'APPOINTMENT_NEEDED' && onFindFacility && (
            <button
              type="button"
              onClick={() => onFindFacility(order)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Find Collection Centre</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {isProcessing && (
            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200">
              Sample analyzing in laboratory
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
