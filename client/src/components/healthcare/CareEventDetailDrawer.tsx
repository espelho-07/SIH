import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Pill,
  Share2,
  AlertCircle,
  FileCheck2,
  Download,
} from 'lucide-react'
import type { CareTimelineEvent } from '@/types/record'

export interface CareEventDetailDrawerProps {
  event: CareTimelineEvent | null
  isOpen: boolean
  onClose: () => void
}

export const CareEventDetailDrawer: React.FC<CareEventDetailDrawerProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background body scroll when drawer is open
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

  if (!isOpen || !event) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="care-detail-title"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  ABDM Verified Record
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {event.displayDate}
                </span>
              </div>
              <h2
                id="care-detail-title"
                className="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                {event.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Record ID: {event.id} • Registered in Public EHR Repository
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Print Clinical Record"
                aria-label="Print Clinical Record"
              >
                <Printer className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Close drawer"
                aria-label="Close drawer"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Scrollable Clinical Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Facility & Clinician Metadata Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {event.facilityName}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {event.facilityTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {event.department}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Attending Clinician: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {event.clinicianName}
                  </span>
                  <span className="text-slate-400"> ({event.clinicianRole})</span>
                </div>
                <div>
                  <span className="text-slate-400">Registration: </span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                    {event.doctorRegistrationNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnosis & Clinical Presentation */}
            {(event.chiefComplaint || event.diagnosis || event.clinicalNotes) && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Clinical Encounter Notes
                </h4>

                {event.diagnosis && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                      Primary Clinical Diagnosis
                    </span>
                    <p className="text-base font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">
                      {event.diagnosis}
                    </p>
                  </div>
                )}

                {event.chiefComplaint && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Chief Complaint / Presentation:{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{event.chiefComplaint}</span>
                  </div>
                )}

                {event.clinicalNotes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold block text-xs uppercase text-slate-500 mb-1">
                      Physician Observations & Plan
                    </span>
                    {event.clinicalNotes}
                  </div>
                )}
              </div>
            )}

            {/* Clinical Vital Signs Grid */}
            {event.vitals && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recorded Vital Signs
                  </h4>
                  {event.vitals.recordedAtIso && (
                    <span className="text-xs text-slate-400">
                      Taken {new Date(event.vitals.recordedAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {event.vitals.bloodPressureSystolic && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Activity className="w-4 h-4" aria-hidden="true" />
                        <span className="text-xs font-medium">Blood Pressure</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {event.vitals.bloodPressureSystolic}/{event.vitals.bloodPressureDiastolic}
                      </span>
                      <span className="text-xs text-slate-400 block">mmHg</span>
                    </div>
                  )}

                  {event.vitals.pulseBpm && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Heart className="w-4 h-4 text-rose-500" aria-hidden="true" />
                        <span className="text-xs font-medium">Heart Rate</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {event.vitals.pulseBpm}
                      </span>
                      <span className="text-xs text-slate-400 block">bpm</span>
                    </div>
                  )}

                  {event.vitals.spo2Percent && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Wind className="w-4 h-4 text-sky-500" aria-hidden="true" />
                        <span className="text-xs font-medium">Oxygen SpO2</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {event.vitals.spo2Percent}%
                      </span>
                      <span className="text-xs text-slate-400 block">Room Air</span>
                    </div>
                  )}

                  {event.vitals.temperatureFahrenheit && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Thermometer className="w-4 h-4 text-amber-500" aria-hidden="true" />
                        <span className="text-xs font-medium">Temperature</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {event.vitals.temperatureFahrenheit}°
                      </span>
                      <span className="text-xs text-slate-400 block">Fahrenheit</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnostic Tests & Laboratory Section */}
            {event.diagnostics && event.diagnostics.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Diagnostic Reports & Investigations
                </h4>

                <div className="space-y-3">
                  {event.diagnostics.map((diag, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-800 space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide">
                            {diag.category}
                          </span>
                          <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                            {diag.testName}
                          </h5>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Observed Value</span>
                          <span className="text-base sm:text-lg font-extrabold text-cyan-950 dark:text-cyan-100">
                            {diag.resultValue} {diag.unit || ''}
                          </span>
                        </div>
                      </div>

                      {diag.referenceRange && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Standard Reference Interval: </span>
                          <span>{diag.referenceRange}</span>
                        </div>
                      )}

                      {diag.interpretationNotice && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-cyan-100 dark:border-cyan-900">
                          {diag.interpretationNotice}
                        </p>
                      )}

                      {diag.verifiedByDoctor && (
                        <div className="text-xs text-slate-400 pt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
                          <span>Verified by {diag.verifiedByDoctor}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Clinical Safety Disclosure */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    These diagnostic measurements are recorded for physician review. HealthConnect does not autonomously evaluate medical severity or provide independent diagnosis. Please review all findings with your physician.
                  </span>
                </div>
              </div>
            )}

            {/* Prescribed Medications Section */}
            {event.prescriptions && event.prescriptions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Digital Prescriptions & Dosage Directions
                </h4>

                <div className="space-y-3">
                  {event.prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800 space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 mt-0.5">
                            <Pill className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                              {rx.medicineName}
                            </h5>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Generic: {rx.genericName} • Strength: {rx.dosage}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                          {rx.frequency}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900">
                        <span className="font-semibold block text-slate-900 dark:text-white mb-0.5">
                          Patient Instructions:
                        </span>
                        {rx.instructions}
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span>Course: {rx.durationDays} days</span>
                        {rx.refillsRemaining !== undefined && (
                          <span>Refills remaining: {rx.refillsRemaining}</span>
                        )}
                        <span>Dispensed by Jan Aushadhi Kendra</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referral / Inter-facility Details */}
            {event.referralSummary && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Inter-Facility Hospital Referral Record
                </h4>

                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                        {event.referralSummary.referralCode}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white text-base">
                        {event.referralSummary.destinationFacility}
                      </h5>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                      Bed Locked
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Clinical Reason: </span>
                    {event.referralSummary.reason}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/patient/referrals/ref-001"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open Full Transfer Dossier</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Digital Seal */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Digitally Sealed by {event.signedByDoctorName}
                  </span>
                  <span>Medical Council Registration: {event.doctorRegistrationNumber}</span>
                </div>
              </div>
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                SHA-256 Verified
              </span>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors min-h-[44px]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download / Print Slip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-sm font-semibold transition-colors min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
