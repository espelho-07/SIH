import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Search,
  MapPin,
  FileText,
  AlertCircle,
  XCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import { appointmentService } from '@/services/appointmentService'
import { queueService } from '@/services/queueService'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import type { AppointmentDetail } from '@/types/appointment'
import type { FacilityTier } from '@/types/facility'

export const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([])
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('UPCOMING')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Cancel Modal State
  const [cancellingAppointment, setCancellingAppointment] = useState<AppointmentDetail | null>(null)
  const [cancelReason, setCancelReason] = useState('Scheduling conflict / emergency')
  const [isCancelling, setIsCancelling] = useState(false)

  // Reschedule Modal State
  const [reschedulingAppointment, setReschedulingAppointment] = useState<AppointmentDetail | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlot, setRescheduleSlot] = useState('')
  const [isRescheduling, setIsRescheduling] = useState(false)

  // Success Notification
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const reloadAppointments = () => {
    appointmentService
      .getMyAppointments()
      .then((data) => setAppointments(data))
  }

  useEffect(() => {
    let isMounted = true
    appointmentService
      .getMyAppointments()
      .then((data) => {
        if (isMounted) {
          setAppointments(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered list
  const filteredAppointments = appointments.filter((apt) => {
    // Tab filter
    if (activeTab === 'UPCOMING' && apt.status !== 'CONFIRMED') return false
    if (activeTab === 'COMPLETED' && apt.status !== 'COMPLETED') return false
    if (activeTab === 'CANCELLED' && apt.status !== 'CANCELLED') return false

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        apt.referenceNumber.toLowerCase().includes(q) ||
        apt.facilityName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.departmentName.toLowerCase().includes(q)
      )
    }

    return true
  })

  const upcomingCount = appointments.filter((a) => a.status === 'CONFIRMED').length
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingAppointment) return

    setIsCancelling(true)
    try {
      await appointmentService.cancelAppointment(cancellingAppointment.id, cancelReason)
      setCancellingAppointment(null)
      reloadAppointments()
      setActionNotice(`Appointment ${cancellingAppointment.referenceNumber} has been cancelled.`)
      setTimeout(() => setActionNotice(null), 4000)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reschedulingAppointment || !rescheduleDate || !rescheduleSlot) return

    setIsRescheduling(true)
    try {
      await appointmentService.rescheduleAppointment(
        reschedulingAppointment.id,
        rescheduleDate,
        'slot-rescheduled',
        rescheduleSlot,
        'Patient requested time shift'
      )
      setReschedulingAppointment(null)
      reloadAppointments()
      setActionNotice(`Appointment ${reschedulingAppointment.referenceNumber} was rescheduled to ${rescheduleDate}.`)
      setTimeout(() => setActionNotice(null), 4000)
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCheckInToken = async (aptId: string) => {
    try {
      const result = await appointmentService.checkInForToken(aptId)
      await queueService.checkInAppointment(aptId)
      reloadAppointments()
      setActionNotice(`Live OPD Token issued: ${result.tokenNumber}. Estimated wait: ~${result.estimatedWaitMins} mins.`)
      setTimeout(() => setActionNotice(null), 5000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F5147] bg-[#F2F9F8] px-2.5 py-0.5 rounded-full border border-[#D0EAE6]">
              Care Continuity
            </span>
            <span className="text-xs text-slate-500">• Government OPD Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track and manage your upcoming consultations, view completed clinical visits, and access OPD entry slips.
          </p>
        </div>

        <Link
          to="/patient/appointments/book"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs sm:text-sm font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'CANCELLED'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({appointments.length})
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hospital, doctor or ID..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
          />
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No appointments found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'UPCOMING'
              ? 'You do not have any upcoming hospital visits scheduled. Book an appointment to skip the OPD registration line.'
              : 'There are no appointments matching your selected filter criteria.'}
          </p>
          <div className="pt-2">
            <Link
              to="/patient/appointments/book"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment Now</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'CONFIRMED'
            const isCompleted = apt.status === 'COMPLETED'
            const isCancelled = apt.status === 'CANCELLED'

            return (
              <article
                key={apt.id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all space-y-4"
              >
                {/* Card Top: Reference ID, Status Badge, Facility Tier */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#0F5147] bg-[#F2F9F8] px-2.5 py-1 rounded-lg border border-[#D0EAE6]">
                      {apt.referenceNumber}
                    </span>
                    <GovernmentHealthcareBadge ownership="GOVERNMENT" tier={apt.facilityTier as FacilityTier} />
                    {apt.tokenNumber && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Live Token: {apt.tokenNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed OPD Slot
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        Consultation Completed
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body: Hospital & Doctor Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hospital & Location */}
                  <div className="space-y-1 md:col-span-1">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Hospital
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      <Link to={`/patient/facility/${apt.facilityId}`} className="hover:text-[#0F5147] transition-colors">
                        {apt.facilityName}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0F5147] shrink-0" />
                      <span className="truncate">{apt.facilityAddress}</span>
                    </p>
                  </div>

                  {/* Doctor & Department */}
                  <div className="space-y-1 md:col-span-1">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Doctor & Department
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {apt.doctorName}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {apt.departmentName} • Room {apt.roomNumber}
                    </p>
                    <p className="text-[11px] text-slate-400">{apt.doctorSpecialty}</p>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="space-y-1 md:col-span-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                      Scheduled Date & Time
                    </span>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#0F5147]" />
                      {apt.date}
                    </p>
                    <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.timeSlot}
                    </p>
                    {apt.rescheduledFrom && (
                      <span className="text-[10px] text-amber-700 block">
                        Shifted from {apt.rescheduledFrom}
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient / Complaint Context */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Patient:</span>
                    <span>{apt.patientName} ({apt.patientAge}y, {apt.patientGender})</span>
                    {apt.abhaId && <span className="font-mono text-slate-400">• ABHA: {apt.abhaId}</span>}
                  </div>
                  {apt.chiefComplaint && (
                    <div className="text-slate-500 truncate max-w-sm">
                      <strong className="text-slate-700">Complaint:</strong> {apt.chiefComplaint}
                    </div>
                  )}
                </div>

                {/* Cancellation details if cancelled */}
                {isCancelled && apt.cancellationReason && (
                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Cancellation Reason: {apt.cancellationReason}</span>
                  </div>
                )}

                {/* Card Action Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/patient/appointments/${apt.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors touch-target"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Full Details</span>
                    </Link>

                    {isConfirmed && !apt.tokenNumber && (
                      <button
                        type="button"
                        onClick={() => handleCheckInToken(apt.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F2F9F8] hover:bg-[#D0EAE6] text-[#0F5147] text-xs font-bold rounded-xl border border-[#D0EAE6] transition-colors touch-target cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Check-in for OPD Token</span>
                      </button>
                    )}

                    {isConfirmed && apt.tokenNumber && (
                      <Link
                        to={`/patient/queue?token=${apt.tokenNumber}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors touch-target"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>View Live Queue ({apt.tokenNumber})</span>
                      </Link>
                    )}
                  </div>

                  {isConfirmed && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingAppointment(apt)
                          setRescheduleDate(apt.date)
                          setRescheduleSlot(apt.timeSlot)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors touch-target cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancellingAppointment(apt)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl transition-colors touch-target cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <Link
                      to="/patient/records"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F5147] hover:underline"
                    >
                      <span>View OPD Prescription</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {isCancelled && (
                    <Link
                      to={`/patient/appointments/book?facilityId=${apt.facilityId}&doctorId=${apt.doctorId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-lg transition-colors touch-target"
                    >
                      <span>Rebook Slot</span>
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancellingAppointment && (
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
                Cancel Appointment?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel your appointment ({cancellingAppointment.referenceNumber}) with {cancellingAppointment.doctorName}?
              </p>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div>
                <label htmlFor="cancel-reason-select" className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Cancellation:
                </label>
                <select
                  id="cancel-reason-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20"
                >
                  <option value="Scheduling conflict / emergency">Scheduling conflict / emergency</option>
                  <option value="Symptoms resolved / feeling better">Symptoms resolved / feeling better</option>
                  <option value="Consulted another hospital or doctor">Consulted another hospital or doctor</option>
                  <option value="Unable to arrange travel">Unable to arrange travel</option>
                  <option value="Other personal reason">Other personal reason</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                Note: Cancelling releases the doctor&apos;s OPD slot for other patients in need. You can book a new slot anytime.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingAppointment(null)}
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
      {reschedulingAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Reschedule OPD Slot
              </h3>
              <p className="text-xs text-slate-600">
                Move your appointment at {reschedulingAppointment.facilityName} to a new date/time.
              </p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label htmlFor="reschedule-date" className="text-xs font-semibold text-slate-700 block mb-1">
                  New Date:
                </label>
                <input
                  id="reschedule-date"
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="reschedule-slot-select" className="text-xs font-semibold text-slate-700 block mb-1">
                  New Time Slot:
                </label>
                <select
                  id="reschedule-slot-select"
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
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
                  onClick={() => setReschedulingAppointment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isRescheduling ? 'Rescheduling...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
