import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileText,
  Printer,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Building2,
  Check,
} from 'lucide-react'
import { appointmentService } from '@/services/appointmentService'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import type { AppointmentDetail } from '@/types/appointment'
import type { FacilityTier } from '@/types/facility'

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({
    'chk-1': true,
    'chk-2': true,
    'chk-3': false,
    'chk-4': false,
  })

  // Action Notice
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('Scheduling conflict / personal emergency')
  const [isCancelling, setIsCancelling] = useState(false)

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newSlot, setNewSlot] = useState('10:00 AM - 10:30 AM')
  const [isRescheduling, setIsRescheduling] = useState(false)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    appointmentService
      .getAppointmentById(id)
      .then((data) => {
        if (isMounted) {
          setAppointment(data)
          if (data) {
            setNewDate(data.date)
          }
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const toggleChecklistItem = (chkId: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [chkId]: !prev[chkId],
    }))
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment) return

    setIsCancelling(true)
    try {
      const updated = await appointmentService.cancelAppointment(appointment.id, cancelReason)
      setAppointment(updated)
      setShowCancelModal(false)
      setActionNotice('Appointment has been successfully cancelled.')
      setTimeout(() => setActionNotice(null), 4000)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment || !newDate || !newSlot) return

    setIsRescheduling(true)
    try {
      const updated = await appointmentService.rescheduleAppointment(
        appointment.id,
        newDate,
        'slot-rescheduled',
        newSlot,
        'Patient requested time shift'
      )
      setAppointment(updated)
      setShowRescheduleModal(false)
      setActionNotice(`Appointment rescheduled to ${newDate} (${newSlot}).`)
      setTimeout(() => setActionNotice(null), 4000)
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCheckInToken = async () => {
    if (!appointment) return
    try {
      const res = await appointmentService.checkInForToken(appointment.id)
      setAppointment((prev) => (prev ? { ...prev, tokenNumber: res.tokenNumber } : null))
      setActionNotice(`Live OPD Token issued: ${res.tokenNumber}. You are now in the clinic room queue!`)
      setTimeout(() => setActionNotice(null), 5000)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500 text-xs">
        Loading appointment dossier...
      </main>
    )
  }

  if (!appointment) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Appointment Not Found</h2>
        <p className="text-xs text-slate-500">
          The appointment reference you requested does not exist or has expired.
        </p>
        <Link
          to="/patient/appointments"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Appointments</span>
        </Link>
      </main>
    )
  }

  const isConfirmed = appointment.status === 'CONFIRMED'
  const isCompleted = appointment.status === 'COMPLETED'
  const isCancelled = appointment.status === 'CANCELLED'

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/patient/home" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/patient/appointments" className="hover:text-slate-900 transition-colors">
          My Appointments
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-mono font-bold text-slate-900">{appointment.referenceNumber}</span>
      </nav>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Dossier Bar */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-[#0F5147] bg-[#F2F9F8] px-3 py-1 rounded-lg border border-[#D0EAE6]">
              {appointment.referenceNumber}
            </span>
            <GovernmentHealthcareBadge ownership="GOVERNMENT" tier={appointment.facilityTier as FacilityTier} />
            {appointment.tokenNumber && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Token: {appointment.tokenNumber}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            OPD Consultation Dossier
          </h1>
          <p className="text-xs text-slate-500">
            Booked on {new Date(appointment.createdAt).toLocaleDateString()} via HealthConnect National Portal
          </p>
        </div>

        {/* Status Badge & Primary Action */}
        <div className="flex flex-wrap items-center gap-2">
          {isConfirmed && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Confirmed Slot
            </span>
          )}
          {isCompleted && (
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              Completed
            </span>
          )}
          {isCancelled && (
            <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Cancelled
            </span>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer touch-target transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Clinical Dossier + Pre-Visit Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Hospital & Clinical Info (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Facility & Doctor Details Card */}
          <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F5147]" />
              Hospital & Clinical Department
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  <Link to={`/patient/facility/${appointment.facilityId}`} className="hover:text-[#0F5147] transition-colors">
                    {appointment.facilityName}
                  </Link>
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0F5147] shrink-0" />
                  <span>{appointment.facilityAddress}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Consulting Clinician</span>
                  <strong className="text-slate-900 block text-sm">{appointment.doctorName}</strong>
                  <span className="text-slate-500">{appointment.doctorQualification}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Department & Room</span>
                  <strong className="text-slate-900 block text-sm">{appointment.departmentName}</strong>
                  <span className="text-[#0F5147] font-mono font-bold">Room {appointment.roomNumber}</span>
                </div>
              </div>

              {/* Quick Contact & Navigation Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${appointment.facilityName}, ${appointment.facilityAddress}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors touch-target"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#0F5147]" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${appointment.facilityPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors touch-target"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call Hospital Helpdesk</span>
                </a>
              </div>
            </div>
          </section>

          {/* Schedule & Timing Card */}
          <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F5147]" />
              Schedule & Token Status
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F2F9F8] border border-[#D0EAE6] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Scheduled Consultation Date
                </span>
                <span className="text-lg font-bold text-slate-900 block font-mono">
                  {appointment.date}
                </span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0F5147]" />
                  {appointment.timeSlot}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    OPD Token Status
                  </span>
                  {appointment.tokenNumber ? (
                    <div>
                      <span className="text-2xl font-mono font-extrabold text-[#0F5147] block">
                        {appointment.tokenNumber}
                      </span>
                      <span className="text-xs text-emerald-800 font-semibold">
                        Token Active • In Clinic Queue
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-semibold text-slate-700 block">
                        Not Checked In Yet
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Check in on the day of appointment to generate your live room token.
                      </span>
                    </div>
                  )}
                </div>

                {isConfirmed && !appointment.tokenNumber && (
                  <button
                    type="button"
                    onClick={handleCheckInToken}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Generate OPD Token Now</span>
                  </button>
                )}
              </div>
            </div>

            {/* Public Healthcare Fee Notice */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Consultation Fee: Free under National Health Mission</span>
              </div>
              <span className="font-mono font-bold text-emerald-900 text-sm">₹0</span>
            </div>
          </section>

          {/* Patient Details & Clinical Complaint */}
          <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F5147]" />
              Patient & Visit Notes
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Patient Name</span>
                <strong className="text-slate-900">{appointment.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Age / Gender</span>
                <strong className="text-slate-900">{appointment.patientAge} Years / {appointment.patientGender}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Phone</span>
                <strong className="text-slate-900">{appointment.patientPhone}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">ABHA Account</span>
                <strong className="font-mono text-slate-900">{appointment.abhaId || 'None'}</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-slate-700 block">Chief Complaint / Symptoms Reported:</span>
              <p className="text-slate-600">{appointment.chiefComplaint || 'Routine medical checkup'}</p>
            </div>
          </section>
        </div>

        {/* Right Column: Pre-Visit Interactive Checklist & Actions */}
        <div className="space-y-6">
          {/* Pre-Visit Checklist Card */}
          <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Pre-Visit Checklist</span>
              <span className="text-[10px] text-slate-400 font-normal">Prepare for OPD</span>
            </h2>

            <p className="text-xs text-slate-500">
              Ensure you have the required documents ready for a smooth OPD visit:
            </p>

            <div className="space-y-2.5 pt-1">
              {appointment.preVisitChecklist.map((item) => {
                const isChecked = !!checklistState[item.id]
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-start gap-2.5 cursor-pointer touch-target"
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-[#0F5147] text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className={`text-xs block font-semibold ${isChecked ? 'text-slate-900 line-through opacity-75' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Hospital Instructions */}
          <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              OPD Guidelines:
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              {appointment.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#0F5147] font-bold shrink-0">•</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Action Management Buttons */}
          {isConfirmed && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer touch-target"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reschedule Appointment</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer touch-target"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Cancel Appointment</span>
              </button>
            </div>
          )}

          {isCancelled && (
            <button
              type="button"
              onClick={() =>
                navigate(`/patient/appointments/book?facilityId=${appointment.facilityId}&doctorId=${appointment.doctorId}`)
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer touch-target"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Book Another Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Cancel OPD Appointment?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel your consultation ({appointment.referenceNumber}) with {appointment.doctorName}?
              </p>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div>
                <label htmlFor="cancel-detail-reason" className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Cancellation:
                </label>
                <select
                  id="cancel-detail-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20"
                >
                  <option value="Scheduling conflict / personal emergency">Scheduling conflict / personal emergency</option>
                  <option value="Symptoms resolved / feeling better">Symptoms resolved / feeling better</option>
                  <option value="Visited another healthcare facility">Visited another healthcare facility</option>
                  <option value="Unable to commute">Unable to commute</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Reschedule OPD Appointment
              </h3>
              <p className="text-xs text-slate-600">
                Select a new date and consultation window at {appointment.facilityName}.
              </p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label htmlFor="modal-reschedule-date" className="text-xs font-semibold text-slate-700 block mb-1">
                  Select New Date:
                </label>
                <input
                  id="modal-reschedule-date"
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="modal-reschedule-slot" className="text-xs font-semibold text-slate-700 block mb-1">
                  Select New Time Slot:
                </label>
                <select
                  id="modal-reschedule-slot"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM (Morning)</option>
                  <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM (Morning)</option>
                  <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM (Morning)</option>
                  <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM (Afternoon)</option>
                  <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM (Afternoon)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isRescheduling ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
