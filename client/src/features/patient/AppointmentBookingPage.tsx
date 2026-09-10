import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Building2,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileText,
  Printer,
  ArrowLeft,
  AlertCircle,
  Check,
  Share2,
  RotateCcw,
} from 'lucide-react'
import { facilityService } from '@/services/facilityService'
import { appointmentService } from '@/services/appointmentService'
import { referralService } from '@/services/referralService'
import { followUpService } from '@/services/followUpService'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import { useAuthStore } from '@/stores/authStore'
import type { FacilityDetail, DoctorProfile } from '@/types/facility'
import type { AvailableDate, TimeSlot, AppointmentDetail } from '@/types/appointment'
import type { ReferralClinicalSummary } from '@/types/referral'
import type { FollowUpCareItem } from '@/types/followUp'

export const AppointmentBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)

  const queryFacilityId = searchParams.get('facilityId') || 'fac-varanasi-dh'
  const queryDeptId = searchParams.get('departmentId')
  const queryDoctorId = searchParams.get('doctorId')
  const queryTreatment = searchParams.get('treatment')
  const queryReferralId = searchParams.get('referralId')
  const queryFollowUpId = searchParams.get('followUpId')

  // Referral & Follow-Up Integration State
  const [originatingReferral, setOriginatingReferral] = useState<ReferralClinicalSummary | null>(null)
  const [originatingFollowUp, setOriginatingFollowUp] = useState<FollowUpCareItem | null>(null)

  // Facility & Doctor State
  const [facilities, setFacilities] = useState<FacilityDetail[]>([])
  const [selectedFacility, setSelectedFacility] = useState<FacilityDetail | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>('General Medicine')

  // Date & Slot State
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false)

  // Patient Info State
  const [patientName, setPatientName] = useState(currentUser?.fullName || 'Rajesh Sharma')
  const [patientPhone, setPatientPhone] = useState(currentUser?.phoneNumber || '+91 98765 43210')
  const [patientAge, setPatientAge] = useState(48)
  const [patientGender, setPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE')
  const [abhaId, setAbhaId] = useState(currentUser?.abhaNumber || '14-8842-1920-5531')
  const [chiefComplaint, setChiefComplaint] = useState(
    queryTreatment ? `Seeking consultation regarding ${queryTreatment}` : ''
  )
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  // Booking Flow Control
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bookedAppointment, setBookedAppointment] = useState<AppointmentDetail | null>(null)

  // Load facility data
  useEffect(() => {
    facilityService.getFacilities({ ownership: 'GOVERNMENT' }).then((list) => {
      // Map to full details
      Promise.all(list.map((f) => facilityService.getFacilityById(f.id))).then((fullList) => {
        const valid = fullList.filter((f): f is FacilityDetail => f !== null)
        setFacilities(valid)

        const matchedFacility = valid.find((f) => f.id === queryFacilityId) || valid[0]
        if (matchedFacility) {
          setSelectedFacility(matchedFacility)

          // Select doctor or first available
          let matchedDoc: DoctorProfile | null = null
          let matchedDept = 'General Medicine'

          for (const dept of matchedFacility.departments) {
            if (queryDeptId && dept.id === queryDeptId) {
              matchedDept = dept.name
              matchedDoc = dept.doctorsOnDuty.find((d) => d.id === queryDoctorId) || dept.doctorsOnDuty[0]
              break
            }
            if (queryDoctorId) {
              const doc = dept.doctorsOnDuty.find((d) => d.id === queryDoctorId)
              if (doc) {
                matchedDoc = doc
                matchedDept = dept.name
                break
              }
            }
          }

          if (!matchedDoc && matchedFacility.departments[0]?.doctorsOnDuty[0]) {
            matchedDoc = matchedFacility.departments[0].doctorsOnDuty[0]
            matchedDept = matchedFacility.departments[0].name
          }

          setSelectedDoctor(matchedDoc)
          setSelectedDepartmentName(matchedDept)
        }
      })
    })
  }, [queryFacilityId, queryDeptId, queryDoctorId])

  // Load available dates
  useEffect(() => {
    appointmentService.getAvailableDates().then((dates) => {
      setAvailableDates(dates)
      // Default to first available non-Sunday
      const firstAvailable = dates.find((d) => d.isAvailable)
      if (firstAvailable) {
        setSelectedDate(firstAvailable.date)
      }
    })
  }, [])

  // Load originating referral if referred
  useEffect(() => {
    if (queryReferralId) {
      referralService.getReferralById(queryReferralId).then((ref) => {
        if (ref) {
          setOriginatingReferral(ref)
          setPatientName(ref.patientName)
          setPatientAge(ref.patientAge)
          setPatientPhone(ref.patientPhone)
          if (ref.abhaId) setAbhaId(ref.abhaId)
          setChiefComplaint(`Referral #${ref.referralCode} from ${ref.referringFacilityName}: ${ref.clinicalReason}`)
        }
      })
    }
  }, [queryReferralId])

  // Load originating follow-up if booked from Care Continuity module
  useEffect(() => {
    if (queryFollowUpId) {
      followUpService.getFollowUpById(queryFollowUpId).then((fol) => {
        if (fol) {
          setOriginatingFollowUp(fol)
          setChiefComplaint(`[Clinical Follow-Up #${fol.id}] ${fol.title}: ${fol.clinicalReason}`)
          if (fol.departmentName) {
            setSelectedDepartmentName(fol.departmentName)
          }
        }
      })
    }
  }, [queryFollowUpId])

  // Load slots when date or doctor changes
  useEffect(() => {
    if (!selectedFacility || !selectedDoctor || !selectedDate) return
    let isMounted = true
    appointmentService
      .getSlotsForDate(selectedFacility.id, selectedDoctor.id, selectedDate)
      .then((slots) => {
        if (isMounted) {
          setAvailableSlots(slots)
          const firstOpen = slots.find((s) => s.available)
          setSelectedSlot(firstOpen || null)
          setIsLoadingSlots(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingSlots(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedFacility, selectedDoctor, selectedDate])

  const handleFacilityChange = (facilityId: string) => {
    const fac = facilities.find((f) => f.id === facilityId)
    if (fac) {
      setSelectedFacility(fac)
      setIsLoadingSlots(true)
      setSelectedSlot(null)
      const firstDept = fac.departments[0]
      if (firstDept) {
        setSelectedDepartmentName(firstDept.name)
        setSelectedDoctor(firstDept.doctorsOnDuty[0] || null)
      }
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    if (!selectedFacility) return
    for (const dept of selectedFacility.departments) {
      const doc = dept.doctorsOnDuty.find((d) => d.id === doctorId)
      if (doc) {
        setSelectedDoctor(doc)
        setIsLoadingSlots(true)
        setSelectedSlot(null)
        setSelectedDepartmentName(dept.name)
        break
      }
    }
  }

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!selectedFacility || !selectedDoctor || !selectedDate || !selectedSlot) {
      setErrorMessage('Please select a valid date and available time slot.')
      return
    }

    if (!patientName.trim() || !patientPhone.trim()) {
      setErrorMessage('Please provide the patient name and contact number.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await appointmentService.bookAppointment({
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        facilityTier: selectedFacility.tier,
        facilityAddress: selectedFacility.address,
        departmentId: selectedFacility.departments[0]?.id || 'dept-gen',
        departmentName: selectedDepartmentName,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        date: selectedDate,
        slotId: selectedSlot.id,
        timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
        type: 'OPD_IN_PERSON',
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender,
        abhaId: abhaId.trim() || undefined,
        chiefComplaint: chiefComplaint.trim() || 'General OPD medical consultation',
        isFirstVisit,
      })

      setBookedAppointment(result)

      if (originatingFollowUp) {
        try {
          await followUpService.scheduleFollowUpAppointment(originatingFollowUp.id, {
            appointmentId: result.id,
            date: selectedDate,
            timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            roomNumber: result.roomNumber || 'Room OPD-102',
          })
        } catch (err) {
          console.error('Error linking follow-up to appointment', err)
        }
      }
    } catch {
      setErrorMessage('That slot was just booked by another patient. Please choose another slot.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // SUCCESS CONFIRMATION VIEW
  if (bookedAppointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Success Badge Banner */}
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-emerald-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F5147] flex items-center justify-center mx-auto shadow-2xs">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              Government OPD Appointment Confirmed
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Appointment Successfully Booked
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your consultation has been reserved in the hospital's electronic registry. Free OPD consultation guaranteed.
            </p>
          </div>

          {/* Reference & QR Box */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl inline-block text-left w-full sm:w-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Appointment Reference ID</div>
            <div className="text-lg sm:text-xl font-mono font-black text-[#0F5147]">
              {bookedAppointment.referenceNumber}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Please show this ID or SMS at the hospital OPD kiosk</div>
          </div>
        </div>

        {/* Essential Booking Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F5147]" />
              <span>Consultation Summary</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {bookedAppointment.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Healthcare Facility</span>
              <p className="font-bold text-slate-900 text-sm">{bookedAppointment.facilityName}</p>
              <p className="text-slate-500 text-[11px]">{bookedAppointment.facilityAddress}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Consultant Physician</span>
              <p className="font-bold text-slate-900 text-sm">{bookedAppointment.doctorName}</p>
              <p className="text-slate-500 text-[11px]">{bookedAppointment.doctorSpecialty}</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
              <span className="text-slate-500 font-medium">Scheduled Date & Time</span>
              <p className="font-bold text-[#0F5147] text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {bookedAppointment.date}
              </p>
              <p className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {bookedAppointment.timeSlot}
              </p>
            </div>
            <span className="font-mono font-bold text-emerald-900 text-sm">₹0 (Free / Cashless)</span>
          </div>

          {originatingFollowUp && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-950">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#0F5147]" />
                <span>
                  Care Continuity loop scheduled for <strong>Follow-Up #{originatingFollowUp.id}</strong> ({originatingFollowUp.title}).
                </span>
              </div>
              <Link
                to="/patient/follow-ups"
                className="font-bold underline text-[#0F5147] hover:text-[#0B3D35]"
              >
                View Follow-Ups
              </Link>
            </div>
          )}

          {/* Pre-Visit Checklist */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pre-Visit Instructions:
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {bookedAppointment.instructions.map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5147] shrink-0 mt-0.5" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            to="/patient/appointments"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
          >
            <span>View in My Appointments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl active:scale-95 transition-all touch-target cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Slip</span>
            </button>

            <Link
              to="/patient/home"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all touch-target"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // BOOKING FORM VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/patient/home" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/patient/find-care" className="hover:text-slate-900 transition-colors">
          Find Care
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-900">Book OPD Appointment</span>
      </nav>

      {/* Header Banner */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F5147] bg-[#F2F9F8] px-2.5 py-0.5 rounded-full border border-[#D0EAE6]">
            Step-by-Step OPD Booking
          </span>
          <span className="text-xs text-slate-500">• 100% Cashless Public Healthcare</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Reserve Hospital Outpatient Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Schedule your consultation directly with certified government medical officers. Avoid prolonged waiting in registration queues.
        </p>
      </div>

      {originatingFollowUp && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#0F5147] shrink-0" />
            <span>
              Booking authorized follow-up consultation for <strong>Follow-Up #{originatingFollowUp.id}</strong> ({originatingFollowUp.title}).
            </span>
          </div>
          <Link
            to={`/patient/follow-ups/${originatingFollowUp.id}`}
            className="font-bold underline text-xs shrink-0 text-[#0F5147] hover:text-[#0B3D35]"
          >
            View Follow-Up Directives
          </Link>
        </div>
      )}

      {originatingReferral && (
        <div className="p-4 rounded-xl bg-[#F2F9F8] border border-[#D0EAE6] text-xs text-[#0F5147] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#0F5147] shrink-0" />
            <span>
              Booking priority OPD slot for <strong>Referral #{originatingReferral.referralCode}</strong> ({originatingReferral.requiredSpecialty}).
            </span>
          </div>
          <Link
            to={`/patient/referrals/${originatingReferral.id}`}
            className="font-bold underline text-xs shrink-0 hover:text-[#0B3D35]"
          >
            View Referral Details
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Scheduling Alert</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleConfirmBooking} className="space-y-6">
        {/* SECTION 1: FACILITY & DOCTOR SELECTION */}
        <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center border border-[#D0EAE6]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Healthcare Facility & Doctor</h2>
                <p className="text-[11px] text-slate-500">Choose hospital, clinical department, and on-duty doctor</p>
              </div>
            </div>
            {selectedFacility && (
              <GovernmentHealthcareBadge ownership={selectedFacility.ownership} tier={selectedFacility.tier} />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facility Picker */}
            <div className="space-y-1.5">
              <label htmlFor="facility-select" className="text-xs font-semibold text-slate-700">
                Hospital / Institution
              </label>
              <select
                id="facility-select"
                value={selectedFacility?.id || ''}
                onChange={(e) => handleFacilityChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.tier.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {selectedFacility && (
                <p className="text-[11px] text-slate-500">{selectedFacility.address}</p>
              )}
            </div>

            {/* Doctor Picker */}
            <div className="space-y-1.5">
              <label htmlFor="doctor-select" className="text-xs font-semibold text-slate-700">
                Doctor / Clinical Specialist
              </label>
              <select
                id="doctor-select"
                value={selectedDoctor?.id || ''}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              >
                {selectedFacility?.departments.flatMap((dept) =>
                  dept.doctorsOnDuty.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({dept.name})
                    </option>
                  ))
                )}
              </select>

              {selectedDoctor && (
                <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    Room {selectedDoctor.roomNumber}
                  </span>
                  <span>• {selectedDoctor.qualification}</span>
                  <span className="text-emerald-700 font-semibold">● Duty Hours: {selectedDoctor.dutyHours}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: DATE PICKER */}
        <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center border border-[#D0EAE6]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">2. Select Consultation Date</h2>
                <p className="text-[11px] text-slate-500">Routine OPD runs Monday through Saturday</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">Next 7 Days</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.date
              return (
                <button
                  key={item.date}
                  type="button"
                  disabled={!item.isAvailable}
                  onClick={() => {
                    setIsLoadingSlots(true)
                    setSelectedSlot(null)
                    setSelectedDate(item.date)
                  }}
                  className={`p-2.5 rounded-xl text-center border transition-all touch-target cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#0F5147] text-white border-[#0F5147] shadow-xs'
                      : item.isAvailable
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-slate-50/50 text-slate-300 border-slate-100 cursor-not-allowed'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider block">
                    {item.dayName.slice(0, 3)}
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono block leading-tight my-0.5">
                    {item.date.split('-')[2]}
                  </span>
                  <span className="text-[9px] block">
                    {item.isToday ? 'Today' : item.isAvailable ? 'Open' : 'Closed'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* SECTION 3: TIME SLOT SELECTION */}
        <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center border border-[#D0EAE6]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">3. Select Time Window</h2>
                <p className="text-[11px] text-slate-500">Pick an available 30-minute consultation slot</p>
              </div>
            </div>
            {selectedSlot && (
              <span className="text-xs font-bold text-[#0F5147] bg-[#F2F9F8] px-2.5 py-1 rounded-lg border border-[#D0EAE6]">
                Selected: {selectedSlot.startTime} - {selectedSlot.endTime}
              </span>
            )}
          </div>

          {isLoadingSlots ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading available hospital slots...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Morning Slots */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Morning OPD Session (08:30 AM — 01:00 PM)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots
                    .filter((s) => s.period === 'MORNING')
                    .map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-left transition-all touch-target cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F5147] text-white border-[#0F5147] shadow-xs'
                              : slot.available
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="text-xs font-bold font-mono block">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {slot.available ? `${slot.capacity - slot.bookedCount} slots open` : 'Slot Full'}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Afternoon OPD Session (02:00 PM — 04:00 PM)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots
                    .filter((s) => s.period === 'AFTERNOON')
                    .map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-left transition-all touch-target cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F5147] text-white border-[#0F5147] shadow-xs'
                              : slot.available
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="text-xs font-bold font-mono block">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {slot.available ? `${slot.capacity - slot.bookedCount} slots open` : 'Slot Full'}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: PATIENT DETAILS */}
        <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center border border-[#D0EAE6]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">4. Patient Information</h2>
                <p className="text-[11px] text-slate-500">Government OPD registration particulars</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ABHA Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="patient-name" className="text-xs font-semibold text-slate-700">
                Patient Full Name *
              </label>
              <input
                id="patient-name"
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name as per Aadhaar / ABHA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="patient-phone" className="text-xs font-semibold text-slate-700">
                Mobile Number *
              </label>
              <input
                id="patient-phone"
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="patient-age" className="text-xs font-semibold text-slate-700">
                Age (Years) *
              </label>
              <input
                id="patient-age"
                type="number"
                min={1}
                max={120}
                required
                value={patientAge}
                onChange={(e) => setPatientAge(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="patient-gender" className="text-xs font-semibold text-slate-700">
                Gender *
              </label>
              <select
                id="patient-gender"
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="patient-abha" className="text-xs font-semibold text-slate-700">
                ABHA ID (Ayushman Health Account)
              </label>
              <input
                id="patient-abha"
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="14-digit ABHA Number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label htmlFor="chief-complaint" className="text-xs font-semibold text-slate-700">
                Reason for Visit / Primary Symptoms
              </label>
              <textarea
                id="chief-complaint"
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Cough with fever for 3 days, headache, routine BP follow-up..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="first-visit"
                checked={isFirstVisit}
                onChange={(e) => setIsFirstVisit(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F5147] focus:ring-[#0F5147] border-slate-300"
              />
              <label htmlFor="first-visit" className="text-xs text-slate-700 cursor-pointer">
                This is my first visit to this hospital (a new Central OPD registry file will be created)
              </label>
            </div>
          </div>
        </section>

        {/* SECTION 5: FINAL CONFIRMATION & FREE CARE DISCLOSURE */}
        <section className="p-5 sm:p-6 bg-[#F2F9F8] rounded-2xl border border-[#D0EAE6] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F5147]" />
                Public Healthcare Assurance
              </h2>
              <p className="text-xs text-slate-600">
                All OPD appointments, doctor consultations, and generic medicines at public hospitals are 100% free under NHM.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Total Booking Fee</span>
              <span className="text-lg font-mono font-extrabold text-[#0F5147]">₹0 Free</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D0EAE6] flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/patient/find-care"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel & Return</span>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !selectedSlot}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs sm:text-sm font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming with Hospital...' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
