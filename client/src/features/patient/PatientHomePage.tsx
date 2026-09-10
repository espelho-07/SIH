import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Mic,
  MicOff,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  PhoneCall,
  Droplet,
  Pill,
  MapPin,
  ChevronRight,
  Sparkles,
  Share2,
  FileText,
  Activity,
  ShieldAlert,
} from 'lucide-react'
import { FacilityCard } from '@/components/healthcare/FacilityCard'
import { facilityService } from '@/services/facilityService'
import { appointmentService } from '@/services/appointmentService'
import { queueService } from '@/services/queueService'
import { referralService } from '@/services/referralService'
import { getSpeechRecognition } from '@/lib/speechRecognition'
import type { FacilityTelemetry } from '@/types/facility'
import type { AppointmentDetail } from '@/types/appointment'
import type { ActiveToken } from '@/types/queue'
import type { ReferralClinicalSummary } from '@/types/referral'

export const PatientHomePage: React.FC = () => {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)
  const [nearbyFacilities, setNearbyFacilities] = useState<FacilityTelemetry[]>([])
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true)
  const [activeAppointment, setActiveAppointment] = useState<AppointmentDetail | null>(null)
  const [activeQueueToken, setActiveQueueToken] = useState<ActiveToken | null>(null)
  const [activeReferral, setActiveReferral] = useState<ReferralClinicalSummary | null>(null)
  const [activeReferralCount, setActiveReferralCount] = useState(0)

  useEffect(() => {
    facilityService
      .getFacilities({ ownership: 'GOVERNMENT', sortBy: 'RECOMMENDED' })
      .then((data) => setNearbyFacilities(data.slice(0, 3)))
      .finally(() => setIsLoadingFacilities(false))

    appointmentService
      .getMyAppointments({ status: 'CONFIRMED' })
      .then((list) => {
        if (list.length > 0) {
          setActiveAppointment(list[0])
        }
      })

    queueService.getActiveToken().then((token) => {
      if (token && token.state !== 'COMPLETED' && token.state !== 'CANCELLED') {
        setActiveQueueToken(token)
      }
    })

    referralService.getPatientReferrals().then((refs) => {
      const active = refs.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
      setActiveReferralCount(active.length)
      if (active.length > 0) {
        setActiveReferral(active[0])
      }
    })
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/patient/find-care?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/patient/find-care')
    }
  }

  // Voice Search Input
  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      setVoiceNotice('Voice search not supported in this browser. Please type.')
      setTimeout(() => setVoiceNotice(null), 3500)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.continuous = false

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceNotice('Listening... speak hospital name, symptoms, or doctor')
      }

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript
        setIsListening(false)
        setSearchQuery(text)
        navigate(`/patient/find-care?q=${encodeURIComponent(text)}`)
      }

      recognition.onerror = () => {
        setIsListening(false)
        setVoiceNotice('Audio not understood. Please try again.')
        setTimeout(() => setVoiceNotice(null), 3000)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch {
      setIsListening(false)
      setVoiceNotice('Microphone access required for voice search.')
      setTimeout(() => setVoiceNotice(null), 3000)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. CONTEXT + WELCOME HERO */}
      <section className="space-y-4 pt-2">
        {/* Simple Location Bar */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2F9F8] border border-[#D0EAE6] text-xs text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
            <span>Healthcare in <strong className="font-bold text-slate-900">Varanasi, UP</strong></span>
          </div>

          <Link
            to="/patient/queue"
            className="text-xs font-semibold text-[#0F5147] hover:underline flex items-center gap-1"
          >
            <span>
              {activeQueueToken ? (
                <>
                  Live Token: <strong>{activeQueueToken.tokenNumber}</strong> ({activeQueueToken.positionInQueue} ahead)
                </>
              ) : (
                <>
                  Live Token: <strong>B-042</strong>
                </>
              )}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Immediate Question & Clarifying Subheading */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How can HealthConnect help you today?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Direct access to government hospitals, verified bed telemetry, specialist availability, and OPD token tracking across India&apos;s public health network.
          </p>
        </div>

        {/* Central Consumer Search Experience + Voice Action */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl pt-2">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-300 shadow-sm focus-within:border-[#0F5147] focus-within:ring-2 focus-within:ring-[#0F5147]/10 transition-all p-2">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, doctors or treatments (e.g. Cardiology, Dialysis)..."
              className="w-full px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              aria-label="Search hospitals, doctors or treatments"
            />

            {/* Voice Action Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              aria-label="Search by voice"
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4 text-[#0F5147]" />}
              <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
            </button>

            {/* Primary Search CTA */}
            <button
              type="submit"
              className="ml-2 px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs sm:text-sm font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
            >
              Search
            </button>
          </div>

          {voiceNotice && (
            <div className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg max-w-md">
              {voiceNotice}
            </div>
          )}
        </form>
      </section>

      {/* 2. PERSONAL CONTEXT CARD (Active referral, active queue, active appointment, or quick booking prompt) */}
      <section aria-label="Active healthcare task">
        {activeReferral &&
        (activeReferral.urgency === 'URGENT' ||
          activeReferral.patientActionRequired ||
          activeReferral.status === 'FALLBACK_REROUTING') ? (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-amber-300 ring-2 ring-amber-50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-200">
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Active Hospital Referral
                  </span>
                  <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                    {activeReferral.referralCode}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {activeReferral.requiredSpecialty} • {activeReferral.receivingFacilityName || 'Reviewing Facilities'}
                </h2>
                <p className="text-xs text-slate-600">
                  {activeReferral.nextActionInstruction}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link
                to={`/patient/referrals/${activeReferral.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
              >
                <span>Track Care Continuity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : activeQueueToken ? (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#D0EAE6] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F2F9F8] flex items-center justify-center text-[#0F5147] shrink-0 border border-[#D0EAE6]">
                <Clock className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F5147]">
                    Live OPD Queue Position
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#0F5147] bg-[#F2F9F8] px-2 py-0.5 rounded border border-[#D0EAE6]">
                    {activeQueueToken.tokenNumber}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Now serving <span className="font-mono font-bold text-slate-900">{activeQueueToken.currentServingToken}</span> • {activeQueueToken.positionInQueue} people ahead (~{activeQueueToken.estimatedWaitMinutes}m)
                </h2>
                <p className="text-xs text-slate-500">
                  {activeQueueToken.facilityName} • {activeQueueToken.roomNumber} ({activeQueueToken.doctorName})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link
                to="/patient/queue"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
              >
                <span>View Live Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : activeAppointment ? (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#D0EAE6] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F2F9F8] flex items-center justify-center text-[#0F5147] shrink-0 border border-[#D0EAE6]">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F5147]">
                    Upcoming OPD Consultation
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {activeAppointment.referenceNumber}
                  </span>
                  {activeAppointment.tokenNumber && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {activeAppointment.doctorName} ({activeAppointment.departmentName})
                </h2>
                <p className="text-xs text-slate-500">
                  {activeAppointment.facilityName} • {activeAppointment.date} ({activeAppointment.timeSlot})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link
                to={`/patient/appointments/${activeAppointment.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl active:scale-95 transition-all touch-target"
              >
                <span>View Details</span>
              </Link>

              <Link
                to="/patient/appointments"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
              >
                <span>All Appointments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F2F9F8] flex items-center justify-center text-[#0F5147] shrink-0 border border-[#D0EAE6]">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F5147]">
                  Fast-Track Hospital OPD Care
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Reserve an OPD consultation before visiting the hospital
                </h2>
                <p className="text-xs text-slate-500">
                  Government hospital OPD appointments are 100% free under the National Health Mission.
                </p>
              </div>
            </div>

            <Link
              to="/patient/appointments/book"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target shrink-0 self-end sm:self-center"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* 3. ASYMMETRIC PRIMARY ACTION PATHWAYS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Pathway A: Find Healthcare */}
        <Link
          to="/patient/find-care"
          className="group p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#0F5147]/60 hover:shadow-sm transition-all duration-150 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center border border-[#D0EAE6] group-hover:bg-[#0F5147] group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#0F5147] uppercase tracking-wider block">
                Primary Pathway
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0F5147] transition-colors mt-0.5">
                Find Nearby Healthcare Facilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Browse government district hospitals, CHCs, and PHCs with verified real-time ICU beds, oxygen supply, and on-duty specialists.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-[#0F5147]">
            <span>Explore Facilities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Secondary Pathway B: Treatment Matcher */}
        <Link
          to="/patient/treatment-matcher"
          className="group p-5 sm:p-6 bg-[#F2F9F8]/60 rounded-2xl border border-[#D0EAE6] hover:border-[#0F5147]/60 hover:shadow-sm transition-all duration-150 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-white text-[#0F5147] flex items-center justify-center border border-[#D0EAE6] group-hover:bg-[#0F5147] group-hover:text-white transition-colors">
              <Sparkles className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Clinical Suitability Match
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0F5147] transition-colors mt-0.5">
                Treatment & Procedure Matcher
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Describe your condition or required procedure (e.g. Dialysis, Cardiac Angiography) to discover the best public hospital equipped to treat you.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-[#0F5147]">
            <span>Match My Treatment</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* 4. SECONDARY SERVICES ROW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Emergency & Essential Services
          </h2>
          <span className="text-xs text-slate-400">Direct Public Health Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <Link
            to="/patient/my-care"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">My Care</span>
              <span className="text-[10px] text-slate-500">Timeline & EHR</span>
            </div>
          </Link>

          <Link
            to="/patient/appointments"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center shrink-0 border border-[#D0EAE6]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">Appointments</span>
              <span className="text-[10px] text-slate-500">Book OPD slot</span>
            </div>
          </Link>

          <Link
            to="/patient/referrals"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-800 relative"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold block leading-tight">Referrals</span>
                {activeReferralCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <span className="text-[10px] text-slate-500">Care transfer</span>
            </div>
          </Link>

          <Link
            to="/patient/diagnostics"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F5147] flex items-center justify-center shrink-0 border border-teal-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">Diagnostics</span>
              <span className="text-[10px] text-slate-500">Labs & Tests</span>
            </div>
          </Link>

          <Link
            to="/patient/medicines"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">Medicines</span>
              <span className="text-[10px] text-slate-500">Jan Aushadhi</span>
            </div>
          </Link>

          <Link
            to="/patient/queue"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">OPD Queue</span>
              <span className="text-[10px] text-slate-500">Virtual token</span>
            </div>
          </Link>

          <Link
            to="/patient/emergency?tab=HOSPITALS"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">Emergency ICU</span>
              <span className="text-[10px] text-slate-500">Live census</span>
            </div>
          </Link>

          <Link
            to="/patient/blood"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors flex items-center gap-2.5 text-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block leading-tight">Blood Bank</span>
              <span className="text-[10px] text-slate-500">Unit stock</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. CURATED NEARBY PUBLIC HOSPITALS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Nearby Public Healthcare Facilities
            </h2>
            <p className="text-xs text-slate-500">
              Verified government institutions with active emergency and outpatient care.
            </p>
          </div>

          <Link
            to="/patient/find-care"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0F5147] hover:underline"
          >
            <span>View all ({nearbyFacilities.length > 0 ? '5' : '0'})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingFacilities ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </section>

      {/* 6. EMERGENCY 108 CITIZEN ASSURANCE FOOTER */}
      <section className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            National Health Assurance
          </span>
          <h2 className="text-sm sm:text-base font-bold">
            Need urgent emergency ambulance or hospital admission?
          </h2>
          <p className="text-xs text-slate-300">
            Government emergency dispatch operates 24x7 with zero fees. Dial 108 directly from any mobile.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center sm:justify-end">
          <Link
            to="/patient/emergency"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all touch-target"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Emergency & Blood Hub</span>
          </Link>
          <a
            href="tel:108"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm touch-target"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 108 Now</span>
          </a>
        </div>
      </section>
    </main>
  )
}
