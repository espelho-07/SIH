import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Mic,
  MicOff,
  Sparkles,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Droplet,
  Pill,
  FileText,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/stores/authStore'
import type { FacilityTelemetry } from '@/types/facility'
import type { ActiveToken } from '@/types/queue'

// Verified facilities data
const INITIAL_FACILITIES: FacilityTelemetry[] = [
  {
    id: 'FAC-001',
    name: 'Pandeypur District Hospital',
    tier: 'DISTRICT_HOSPITAL',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    address: 'Pandeypur Chowk, Varanasi - 221002',
    distanceKm: 2.8,
    isAyushmanEmpaneled: true,
    hasEmergency24x7: true,
    operationalStatus: 'OPERATIONAL',
    icuBeds: { total: 20, available: 4, occupied: 14, reserved: 2 },
    oxygenBeds: { total: 60, available: 18, occupied: 40, reserved: 2 },
    generalBeds: { total: 200, available: 42, occupied: 155, reserved: 3 },
    specialistsOnDuty: [
      { name: 'Dr. Anita Desai', specialty: 'Cardiology', isAvailableNow: true },
      { name: 'Dr. R. K. Sharma', specialty: 'Orthopaedics', isAvailableNow: true },
      { name: 'Dr. S. K. Gupta', specialty: 'General Surgery', isAvailableNow: false },
    ],
    bloodUnitsAvailable: 34,
    lastUpdatedIso: '2026-09-09T22:30:00.000Z',
    isStale: false,
  },
  {
    id: 'FAC-002',
    name: 'Shivpur Community Health Centre (CHC)',
    tier: 'CHC',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    address: 'Near Railway Station, Shivpur - 221003',
    distanceKm: 5.4,
    isAyushmanEmpaneled: true,
    hasEmergency24x7: true,
    operationalStatus: 'OPERATIONAL',
    icuBeds: { total: 6, available: 1, occupied: 5, reserved: 0 },
    oxygenBeds: { total: 25, available: 8, occupied: 16, reserved: 1 },
    generalBeds: { total: 50, available: 14, occupied: 36, reserved: 0 },
    specialistsOnDuty: [
      { name: 'Dr. Meena Singh', specialty: 'Obstetrics & Gynaecology', isAvailableNow: true },
      { name: 'Dr. V. K. Tiwari', specialty: 'Pediatrics', isAvailableNow: true },
    ],
    bloodUnitsAvailable: 12,
    lastUpdatedIso: '2026-09-09T22:00:00.000Z',
    isStale: false,
  },
  {
    id: 'FAC-003',
    name: 'Harahua Primary Health Centre (PHC)',
    tier: 'PHC',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    address: 'Main Road, Harahua Block',
    distanceKm: 9.1,
    isAyushmanEmpaneled: false,
    hasEmergency24x7: false,
    operationalStatus: 'OVERLOADED',
    icuBeds: { total: 0, available: 0, occupied: 0, reserved: 0 },
    oxygenBeds: { total: 8, available: 2, occupied: 6, reserved: 0 },
    generalBeds: { total: 16, available: 3, occupied: 13, reserved: 0 },
    specialistsOnDuty: [
      { name: 'Dr. Arun Patel', specialty: 'General Practice', isAvailableNow: true },
    ],
    bloodUnitsAvailable: 0,
    lastUpdatedIso: '2026-09-09T08:00:00.000Z',
    isStale: true,
  },
]

export const PatientHomePage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Search & Speech State
  const [searchInput, setSearchInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceHeardQuery, setVoiceHeardQuery] = useState<string | null>(null)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Active consultation task for personalized context
  const [activeToken] = useState<ActiveToken>({
    id: 'TKN-001',
    tokenNumber: 'B-042',
    facilityId: 'FAC-001',
    facilityName: 'Pandeypur District Hospital',
    departmentName: 'General OPD',
    doctorName: 'Dr. Rajesh Verma (MBBS)',
    roomNumber: '14',
    status: 'ISSUED',
    priority: 'GENERAL',
    currentServingToken: 'B-031',
    positionInQueue: 11,
    estimatedWaitMinutes: 28,
    delayReason: undefined,
    issuedAtIso: '2026-09-09T22:45:00.000Z',
  })

  // Filter facilities based on search query
  const filteredFacilities = INITIAL_FACILITIES.filter((f) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.specialistsOnDuty.some((s) => s.specialty.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    )
  })

  // Voice recognition simulation with clean verification feedback
  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true)
      setVoiceHeardQuery(null)
      setTimeout(() => {
        setIsRecording(false)
        setVoiceHeardQuery('Kidney Dialysis and ICU Beds')
      }, 1800)
    } else {
      setIsRecording(false)
    }
  }

  const confirmVoiceQuery = () => {
    if (voiceHeardQuery) {
      setSearchInput(voiceHeardQuery)
      setVoiceHeardQuery(null)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Hero Experience (Apple / Linear simplicity) */}
      <section className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0F5147]">
            {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Healthcare Network'} • Varanasi Region
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Search doctors, check verified bed readiness, match specialized procedures, or track your live consultation queue.
          </p>
        </div>

        {/* Master Search Bar with Integrated Voice Pill */}
        <div className="relative max-w-3xl">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search hospitals, specialists, or treatments (e.g. Dialysis, Orthopaedics)..."
              className="w-full pl-12 pr-36 py-3.5 bg-white text-slate-900 border border-slate-200/90 rounded-2xl text-sm font-medium placeholder:text-slate-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5147] transition-all"
              aria-label="Search healthcare network"
            />
            <div className="absolute right-2.5 flex items-center">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                aria-label="Search by voice"
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-600" /> : <Mic className="w-3.5 h-3.5 text-[#0F5147]" />}
                <span>{isRecording ? 'Listening...' : 'Speak'}</span>
              </button>
            </div>
          </div>

          {/* Voice Intake Confirmation Pill */}
          {voiceHeardQuery && (
            <div className="mt-3 p-3.5 bg-[#F2F9F8] border border-[#D1E5E2] rounded-xl text-xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F5147] shrink-0" />
                <span>
                  We heard: <strong>&ldquo;{voiceHeardQuery}&rdquo;</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={confirmVoiceQuery}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#0F5147] text-white rounded-lg font-semibold hover:bg-[#0A3F37] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Personalized Context: Your Next Healthcare Task */}
      {activeToken && (
        <section aria-labelledby="active-task-heading">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all hover:border-[#0F5147]/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2F9F8] text-[#0F5147] border border-[#D1E5E2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F5147] animate-pulse" />
                    Active OPD Appointment Today
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Room {activeToken.roomNumber}</span>
                </div>
                <h2 id="active-task-heading" className="text-lg font-bold text-slate-900">
                  {activeToken.facilityName}
                </h2>
                <p className="text-xs text-slate-600">
                  {activeToken.departmentName} &bull; Attending Physician: <strong className="text-slate-800">{activeToken.doctorName}</strong>
                </p>
              </div>

              {/* Status Snapshot & Direct Link */}
              <div className="flex flex-wrap items-center gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Your Token</span>
                    <span className="text-xl font-bold font-mono text-[#0F5147]">{activeToken.tokenNumber}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Now Serving</span>
                    <span className="text-xl font-bold font-mono text-slate-800">{activeToken.currentServingToken}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Est. Wait</span>
                    <span className="text-xl font-bold text-slate-800">~{activeToken.estimatedWaitMinutes}m</span>
                  </div>
                </div>

                <Link
                  to="/patient/queue"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0F5147] hover:bg-[#0A3F37] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer touch-target shadow-2xs"
                >
                  <span>Open Live Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Primary Healthcare Pathways (Curated & Asymmetric — Not repetitive cards!) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Primary Care Pathways
          </h2>
          <span className="text-xs text-slate-500 font-medium">Verified Public Network</span>
        </div>

        {/* Asymmetric 2-Block Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Featured 1: Find Healthcare */}
          <div
            onClick={() => navigate('/patient/facilities')}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#0F5147]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#F2F9F8] group-hover:text-[#0F5147] transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F5147] transition-colors">
                Find Nearest Facilities
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover verified Government Primary Health Centres, Community Health Centres, and District Hospitals with live ICU & oxygen bed availability.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#0F5147]">
              <span>Explore facilities directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Featured 2: Treatment Matcher */}
          <div
            onClick={() => navigate('/patient/treatment-matcher')}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#0F5147]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#F2F9F8] group-hover:text-[#0F5147] transition-colors">
                <Sparkles className="w-5 h-5 text-[#0F5147]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F5147] transition-colors">
                Treatment-Based Matcher
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need a specific procedure like dialysis, maternity delivery, or orthopaedic trauma? Match facilities with verified clinical equipment and active specialists.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#0F5147]">
              <span>Match care by condition</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Compact Editorial Row for Essential Services */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Live Queue */}
          <button
            type="button"
            onClick={() => navigate('/patient/queue')}
            className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-left transition-all cursor-pointer flex items-center gap-3 group"
          >
            <Clock className="w-4 h-4 text-slate-500 group-hover:text-[#0F5147] shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-tight">Live Queue</span>
              <span className="text-[10px] text-slate-500">Track token status</span>
            </div>
          </button>

          {/* Blood Stock */}
          <button
            type="button"
            onClick={() => navigate('/patient/blood')}
            className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-left transition-all cursor-pointer flex items-center gap-3 group"
          >
            <Droplet className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-tight">Blood Bank</span>
              <span className="text-[10px] text-slate-500">Live ABO/Rh units</span>
            </div>
          </button>

          {/* Dispensary Medicines */}
          <button
            type="button"
            onClick={() => navigate('/patient/medicines')}
            className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-left transition-all cursor-pointer flex items-center gap-3 group"
          >
            <Pill className="w-4 h-4 text-slate-500 group-hover:text-[#0F5147] shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-tight">Medicines</span>
              <span className="text-[10px] text-slate-500">Jan Aushadhi formulary</span>
            </div>
          </button>

          {/* Health Records */}
          <button
            type="button"
            onClick={() => navigate('/patient/records')}
            className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-left transition-all cursor-pointer flex items-center gap-3 group"
          >
            <FileText className="w-4 h-4 text-slate-500 group-hover:text-[#0F5147] shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-tight">Records</span>
              <span className="text-[10px] text-slate-500">ABHA digital prescriptions</span>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Purposeful Emergency Hotline (Clean, Restrained, Differentiated) */}
      <section aria-labelledby="emergency-banner-heading">
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <PhoneCall className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="emergency-banner-heading" className="text-sm font-bold text-red-950">
                Medical Emergency & Ambulance Dispatch (108)
              </h3>
              <p className="text-xs text-red-800">
                Toll-free 24/7 centralized emergency trauma response and ambulance dispatch service.
              </p>
            </div>
          </div>
          <a
            href="tel:108"
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center shrink-0 shadow-2xs touch-target flex items-center justify-center"
          >
            Call 108 Dispatch
          </a>
        </div>
      </section>

      {/* 5. Facility Discovery (Apple / Airbnb cleanliness) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Verified Public Healthcare Facilities
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredFacilities.length} facilities in {user?.facilityName ? 'your district' : 'Varanasi'} with real-time bed telemetry
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all space-y-3.5"
            >
              {/* Facility Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{facility.name}</h3>
                    <Badge variant="default" className="text-[10px] font-medium">
                      {facility.tier.replace('_', ' ')}
                    </Badge>
                    {facility.isAyushmanEmpaneled && (
                      <Badge variant="success" className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border-emerald-200">
                        PM-JAY Cashless
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {facility.address} &bull; <strong className="text-slate-800">{facility.distanceKm} km away</strong> (~12 min by road)
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <FacilityAvailabilityBadge status={facility.operationalStatus} />
                  <ResourceFreshnessBadge
                    lastUpdatedIso={facility.lastUpdatedIso}
                    isStale={facility.isStale}
                  />
                </div>
              </div>

              {/* Compact Resource Telemetry */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/70 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium uppercase">ICU Beds</span>
                  <span className="text-sm font-bold text-slate-900">
                    {facility.icuBeds.available} / {facility.icuBeds.total}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">avail</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium uppercase">Oxygen Beds</span>
                  <span className="text-sm font-bold text-slate-900">
                    {facility.oxygenBeds.available} / {facility.oxygenBeds.total}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">avail</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium uppercase">Blood Units</span>
                  <span className="text-sm font-bold text-slate-900">
                    {facility.bloodUnitsAvailable} units
                  </span>
                </div>
              </div>

              {/* Duty Specialists */}
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-700">Specialists on duty:</span>
                {facility.specialistsOnDuty.map((doc, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                      doc.isAvailableNow ? 'bg-[#F2F9F8] text-[#0F5147] font-medium' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        doc.isAvailableNow ? 'bg-[#0F5147]' : 'bg-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    {doc.specialty} ({doc.name})
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/patient/facilities')}
                  className="text-xs font-semibold"
                >
                  View Facility Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/patient/queue')}
                  className="text-xs font-semibold"
                >
                  Get OPD Token
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Clinical Transparency Note (Subtle AI / Clinical Boundary) */}
      <footer className="text-center text-xs text-slate-500 pt-6 pb-2 space-y-1">
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F5147]" />
          <span>Government verified public healthcare network &bull; Real-time facility telemetry updated periodically</span>
        </p>
        <p className="text-[11px] text-slate-500">
          AI-assisted search and matching &bull; Clinical decisions are made solely by certified attending physicians.
        </p>
      </footer>
    </div>
  )
}
