import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  Activity,
  AlertCircle,
  Download,
  FileCheck2,
  Microscope,
  FileText,
} from 'lucide-react'
import type { DiagnosticReport } from '@/types/diagnostic'

export interface LabReportViewerProps {
  report: DiagnosticReport | null
  isOpen: boolean
  onClose: () => void
}

export const LabReportViewer: React.FC<LabReportViewerProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate()
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !report) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-report-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Authorized Clinical Report
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                  {report.orderCode}
                </span>
              </div>
              <h2
                id="lab-report-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
              >
                {report.testName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Released on {new Date(report.releasedAtIso).toLocaleDateString()} at{' '}
                {new Date(report.releasedAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Print Official Report Slip"
                aria-label="Print Official Report Slip"
              >
                <Printer className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Close report viewer"
                aria-label="Close report viewer"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Scrollable Report Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Laboratory & Technical Particulars Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-cyan-600">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {report.facilityName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {report.departmentName} • {report.facilityTier}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                {report.analyzerEquipment && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Microscope className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>Instrument: {report.analyzerEquipment}</span>
                  </div>
                )}
                {report.specimenType && (
                  <div className="text-slate-500">
                    <span>Specimen: {report.specimenType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Table Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                  <span>Quantitative Laboratory Findings</span>
                </h4>
                <span className="text-xs text-slate-400">SI Standard Units</span>
              </div>

              <div className="space-y-3">
                {report.results.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                          {result.testName}
                        </h5>
                        {result.methodologyNotice && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {result.methodologyNotice}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Observed Value</span>
                        <span className="text-lg sm:text-xl font-extrabold text-cyan-950">
                          {result.resultValue} {result.unit || ''}
                        </span>
                      </div>
                    </div>

                    {result.referenceInterval && (
                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                        <span>Standard Biological Reference Interval:</span>
                        <span className="font-semibold text-slate-800">
                          {result.referenceInterval}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Authorized Clinician Note (Never AI Generated) */}
            {report.clinicianNote && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Clinician Note</span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    {report.verifiedByDoctorName}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                  {report.clinicianNote}
                </p>
              </div>
            )}

            {/* Strict Clinical Safety Gate Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">
                  Clinical Safety & Result Evaluation Notice:
                </span>
                {report.safetyDisclaimer}
              </div>
            </div>

            {/* Digital Authorization Seal */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <div>
                  <span className="font-bold text-slate-800 block">
                    Digitally Verified by {report.verifiedByDoctorName}
                  </span>
                  <span>Registration Number: {report.verifiedByDoctorRegistration}</span>
                </div>
              </div>
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                SHA-256 Validated
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Print Official Lab Slip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/patient/my-care')
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
                <span>View in Care Records</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
