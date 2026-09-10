import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  FileCheck2,
  Pill,
  Users,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { FollowUpTimelineVisualizer } from './FollowUpTimelineVisualizer'
import { MissedFollowUpReassuranceBanner } from './MissedFollowUpReassuranceBanner'
import type { FollowUpCareItem } from '@/types/followUp'

export interface FollowUpDetailModalProps {
  followUp: FollowUpCareItem | null
  isOpen: boolean
  onClose: () => void
  onCheckInQueue?: (followUpId: string) => void
  onReschedule?: (followUpId: string, newDate: string, newSlot: string, reason: string) => void
  onCancel?: (followUpId: string, reason: string) => void
}

export const FollowUpDetailModal: React.FC<FollowUpDetailModalProps> = ({
  followUp,
  isOpen,
  onClose,
  onCheckInQueue,
  onReschedule,
  onCancel,
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlot, setRescheduleSlot] = useState('10:00 AM - 10:30 AM')
  const [rescheduleReason, setRescheduleReason] = useState('Scheduling conflict / Work duty')

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('Symptoms completely resolved / Advised by doctor')

  if (!isOpen || !followUp) return null

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rescheduleDate) return
    if (onReschedule) {
      onReschedule(followUp.id, rescheduleDate, rescheduleSlot, rescheduleReason)
    }
    setShowRescheduleForm(false)
  }

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onCancel) {
      onCancel(followUp.id, cancelReason)
    }
    setShowCancelConfirm(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="followup-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2F9F8] border border-[#D0EAE6] text-[#0F5147] flex items-center justify-center font-mono font-bold text-xs">
              FOL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {followUp.id}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-[#0F5147]">
                  {followUp.specialty} Continuity Dossier
                </span>
              </div>
              <h2
                id="followup-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 leading-tight"
              >
                {followUp.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6 text-slate-800">
          {/* Missed Follow-up Banner if applicable */}
          {followUp.status === 'MISSED' && (
            <MissedFollowUpReassuranceBanner followUp={followUp} />
          )}

          {/* Care Continuity Stepper */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Care Continuity Pathway
            </span>
            <FollowUpTimelineVisualizer
              status={followUp.status}
              hasPrerequisiteDiagnostics={
                !!(followUp.prerequisiteDiagnostics && followUp.prerequisiteDiagnostics.length > 0)
              }
              scheduledDate={followUp.linkedAppointmentDate}
              completedDate={followUp.completedAtIso}
            />
          </div>

          {/* Section 1: Clinical Rationale & Directives */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#0F5147]" />
              <span>Authorized Clinical Review Purpose</span>
            </h3>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {followUp.clinicalReason}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>Prescribed by: <strong className="font-semibold text-slate-800">{followUp.doctorName}</strong> ({followUp.doctorRole})</span>
                <span>Reg No: <strong className="font-mono text-slate-700">{followUp.doctorRegistrationNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 2: Hospital & Department Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Building2 className="w-4 h-4 text-[#0F5147]" />
                <span className="font-semibold">Healthcare Facility</span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {followUp.facilityName}
              </p>
              <p className="text-xs text-slate-500">
                {followUp.facilityAddress}
              </p>
              <p className="text-xs font-medium text-[#0F5147] pt-0.5">
                {followUp.departmentName}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-4 h-4 text-[#0F5147]" />
                <span className="font-semibold">Recommended Window</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Target Date: {followUp.recommendedDateIso}
              </p>
              <p className="text-xs text-slate-600">
                Window: {followUp.windowStartIso} — {followUp.windowEndIso}
              </p>
              <div className="pt-1">
                {followUp.status === 'SCHEDULED' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Slot Booked: {followUp.linkedAppointmentDate} ({followUp.linkedAppointmentSlot})
                  </span>
                ) : followUp.status === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Episode Review Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Appointment Booking Open
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Patient Instructions Checklist */}
          {followUp.patientInstructions && followUp.patientInstructions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Patient Instructions (What to bring & prepare)
              </h3>
              <ul className="space-y-2">
                {followUp.patientInstructions.map((instruction, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                  >
                    <div className="w-5 h-5 rounded-md bg-white border border-slate-300 text-[#0F5147] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {idx + 1}
                    </div>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: Prerequisite Diagnostics & Linked Medications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Linked Diagnostic Reports & Prescriptions
            </h3>

            {/* Diagnostics */}
            {followUp.prerequisiteDiagnostics && followUp.prerequisiteDiagnostics.length > 0 && (
              <div className="space-y-2">
                {followUp.prerequisiteDiagnostics.map((diag, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          {diag.testName}
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          {diag.instructions}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/patient/diagnostics"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline shrink-0"
                    >
                      <span>View Certified Report</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Medications */}
            {followUp.linkedMedications && followUp.linkedMedications.length > 0 && (
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                    <Pill className="w-4 h-4 text-indigo-700" />
                    <span>Prescribed Medications Under Review</span>
                  </div>
                  <Link
                    to="/patient/medicines"
                    className="text-xs font-bold text-indigo-800 hover:underline"
                  >
                    View Active Rx
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {followUp.linkedMedications.map((med) => (
                    <div
                      key={med.medicineId}
                      className="p-2.5 bg-white rounded-lg border border-indigo-100 text-xs"
                    >
                      <span className="font-semibold text-slate-900 block">{med.name}</span>
                      <span className="text-slate-500 text-[11px]">{med.dosage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Frontline ASHA Continuity */}
          {followUp.frontlineContinuity && (
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>Frontline Healthcare Worker Outreach ({followUp.frontlineContinuity.workerRole})</span>
                </div>
                {followUp.frontlineContinuity.homeVisitStatus === 'COMPLETED' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-300 px-2 py-0.5 rounded">
                    Home Visit Done
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Assigned Worker: <strong>{followUp.frontlineContinuity.workerName}</strong> ({followUp.frontlineContinuity.assignedArea}).
              </p>
              {followUp.frontlineContinuity.notes && (
                <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-teal-100">
                  Worker Note: &ldquo;{followUp.frontlineContinuity.notes}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Section 6: Care Outcome (If completed) */}
          {followUp.status === 'COMPLETED' && followUp.outcomeSummary && (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Consultation Care Outcome Record</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {followUp.outcomeSummary}
              </p>
            </div>
          )}

          {/* Reschedule Form Toggle */}
          {showRescheduleForm && (
            <form
              onSubmit={handleRescheduleSubmit}
              className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950">
                Reschedule Follow-Up Appointment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    New Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5147]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Preferred Slot
                  </label>
                  <select
                    value={rescheduleSlot}
                    onChange={(e) => setRescheduleSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5147]"
                  >
                    <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM (Morning)</option>
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM (Morning)</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM (Mid-day)</option>
                    <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM (Afternoon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5147]"
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowRescheduleForm(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          )}

          {/* Cancellation Confirm Dialog */}
          {showCancelConfirm && (
            <form
              onSubmit={handleCancelSubmit}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-950">
                Cancel Follow-Up Directive
              </h4>
              <p className="text-xs text-rose-900 leading-relaxed">
                Cancelling marks this follow-up as discontinued in your longitudinal care record. Please provide a reason for the clinical audit trail.
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cancellation Reason
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Action Footer Bar */}
        <footer className="px-5 sm:px-6 py-4 border-t border-slate-150 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {followUp.status === 'SCHEDULED' && !showRescheduleForm && (
              <button
                type="button"
                onClick={() => setShowRescheduleForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </button>
            )}

            {followUp.status !== 'COMPLETED' && followUp.status !== 'CANCELLED' && !showCancelConfirm && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <span>Cancel Follow-Up</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>

            {followUp.status === 'DUE' && (
              <Link
                to={`/patient/appointments/book?facilityId=${followUp.facilityId}&doctorId=doc-001&followUpId=${followUp.id}&treatment=${encodeURIComponent(followUp.condition)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Follow-Up Slot</span>
              </Link>
            )}

            {followUp.status === 'MISSED' && (
              <Link
                to={`/patient/appointments/book?facilityId=${followUp.facilityId}&doctorId=doc-001&followUpId=${followUp.id}&treatment=${encodeURIComponent(followUp.condition)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Book Appointment</span>
              </Link>
            )}

            {followUp.status === 'SCHEDULED' && !followUp.linkedTokenNumber && onCheckInQueue && (
              <button
                type="button"
                onClick={() => onCheckInQueue(followUp.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Check In to Queue</span>
              </button>
            )}

            {followUp.status === 'SCHEDULED' && followUp.linkedTokenNumber && (
              <Link
                to="/patient/queue"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
              >
                <Clock className="w-4 h-4" />
                <span>View Queue Token ({followUp.linkedTokenNumber})</span>
              </Link>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
