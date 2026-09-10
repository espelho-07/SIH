import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Clock,
  FileText,
} from 'lucide-react'
import type { DiagnosticOrder } from '@/types/diagnostic'

export interface DiagnosticNextActionBannerProps {
  orders: DiagnosticOrder[]
  onViewReport: (order: DiagnosticOrder) => void
  className?: string
}

export const DiagnosticNextActionBanner: React.FC<DiagnosticNextActionBannerProps> = ({
  orders,
  onViewReport,
  className = '',
}) => {
  // Find highest priority actionable order:
  // 1. Report ready (actionable)
  // 2. Sample collection pending
  // 3. Appointment needed
  const reportReadyOrder = orders.find(
    (o) => o.status === 'REPORT_READY' && o.patientActionRequired,
  )
  const pendingCollectionOrder = orders.find(
    (o) => o.status === 'SAMPLE_COLLECTION_PENDING',
  )
  const actionNeededOrder = orders.find(
    (o) => o.status === 'APPOINTMENT_NEEDED' || o.patientActionRequired,
  )

  const activeOrder = reportReadyOrder || pendingCollectionOrder || actionNeededOrder

  if (!activeOrder) return null

  const isReportReady = activeOrder.status === 'REPORT_READY'

  return (
    <section
      role="region"
      aria-label="Action Required for Your Diagnostic Order"
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 shadow-xs ${
        isReportReady
          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-300 dark:border-emerald-700'
          : 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-emerald-500/10 border-amber-300 dark:border-amber-700'
      } ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isReportReady
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
            }`}
          >
            {isReportReady ? (
              <FileText className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Clock className="w-6 h-6" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isReportReady
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                }`}
              >
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                {isReportReady ? 'New Report Available' : 'Diagnostic Action Required'}
              </span>

              <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeOrder.orderCode}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {activeOrder.testName}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {activeOrder.nextActionInstruction}
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-2 md:pt-0">
          {isReportReady ? (
            <button
              type="button"
              onClick={() => onViewReport(activeOrder)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-bold text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <span>View Report Details</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : activeOrder.actionRoute ? (
            <Link
              to={activeOrder.actionRoute}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              <span>Proceed to Queue</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
