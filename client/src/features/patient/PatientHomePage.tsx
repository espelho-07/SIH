import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  Building2,
  Droplet,
  Pill,
  PhoneCall,
  Clock,
  FileText,
  Share2,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LiveTokenCard } from '@/components/healthcare/LiveTokenCard'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/stores/authStore'
import type { FacilityTelemetry } from '@/types/facility'
import type { ActiveToken } from '@/types/queue'

// Verified facilities data (representative public facilities with accurate tier modeling)
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
      { name: 'Dr. Anita Desai', specialty: 'Cardiologist', isAvailableNow: true },
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
      { name: 'Dr. Arun Patel', specialty: 'General Practitioner', isAvailableNow: true },
    ],
    bloodUnitsAvailable: 0,
    lastUpdatedIso: '2026-09-09T08:00:00.000Z',
    isStale: true,
  },
]

export const PatientHomePage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Search & Speech State
  const [searchInput, setSearchInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceHeardQuery, setVoiceHeardQuery] = useState<string | null>(null)
  const [isMoreServicesOpen, setIsMoreServicesOpen] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Active OPD token
  const [activeToken] = useState<ActiveToken>({
    id: 'TKN-001',
    tokenNumber: 'B-042',
    facilityId: 'FAC-001',
    facilityName: 'District Hospital, Pandeypur',
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

  // Voice recognition simulation with vernacular confirmation
  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true)
      setVoiceHeardQuery(null)
      // Simulate speech-to-text recognition
      setTimeout(() => {
        setIsRecording(false)
        setVoiceHeardQuery('Kidney Dialysis & ICU Bed')
      }, 2200)
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Empathetic Greeting & Voice/Search Hero */}
      <div className="p-5 sm:p-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>{t('appName')} • जन स्वास्थ्य सेवा</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            {user?.fullName ? `नमस्ते, ${user.fullName.split(' ')[0]} 👋` : t('patientHome.greeting')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('patientHome.patientSubtitle')}
          </p>

          {/* Unified Voice & Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('patientHome.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white text-slate-900 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 transition-colors shadow-xs"
                aria-label="Search hospitals, specialties, or treatments"
              />
            </div>

            {/* Tactile Voice Action Button */}
            <Button
              type="button"
              variant={isRecording ? 'destructive' : 'primary'}
              onClick={handleVoiceToggle}
              leftIcon={isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              className="py-3 px-5 text-sm font-bold shrink-0 min-h-[48px] shadow-xs active:scale-95 transition-transform"
            >
              {isRecording ? t('patientHome.listening') : t('patientHome.voiceAction')}
            </Button>
          </div>

          {/* Voice Confirmation Card (Low Literacy Feedback Loop) */}
          {voiceHeardQuery && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>{t('patientHome.voiceConfirmed')}</strong> &ldquo;{voiceHeardQuery}&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={confirmVoiceQuery}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800 touch-target cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('patientHome.voiceConfirmAction')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 touch-target cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('patientHome.voiceRetryAction')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Treatment Matcher link */}
          <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
            <span>विशेष ऑपरेशन या जांच चाहिए?</span>
            <Link
              to="/patient/treatment-matcher"
              className="font-bold text-teal-700 hover:text-teal-800 underline ml-0.5"
            >
              इलाज खोजक (Treatment Matcher) &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Active Token / Care Continuity Banner (Immediate Action Need) */}
      {activeToken && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-700" aria-hidden="true" />
              {t('patientHome.activeTokenTitle')}
            </h2>
            <Link
              to="/patient/queue"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>{t('nav.queue')} &rarr;</span>
            </Link>
          </div>
          <LiveTokenCard token={activeToken} />
        </div>
      )}

      {/* 3. Four Core Healthcare Action Tiles (Clear Affordance, Need -> Action) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 px-1">
          मुख्य सुविधाएं (Primary Services)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Find Hospital */}
          <Card
            hoverable
            onClick={() => navigate('/patient/facilities')}
            className="p-4 flex flex-col items-center text-center space-y-2 border-slate-200/80 group cursor-pointer active:scale-98 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Building2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {t('patientHome.findFacilities')}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {t('patientHome.findFacilitiesSub')}
              </span>
            </div>
          </Card>

          {/* Tile 2: Treatment Matcher */}
          <Card
            hoverable
            onClick={() => navigate('/patient/treatment-matcher')}
            className="p-4 flex flex-col items-center text-center space-y-2 border-teal-200 bg-teal-50/20 group cursor-pointer active:scale-98 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Sparkles className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {t('patientHome.treatmentMatcher')}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {t('patientHome.treatmentMatcherSub')}
              </span>
            </div>
          </Card>

          {/* Tile 3: Live Queue & Token */}
          <Card
            hoverable
            onClick={() => navigate('/patient/queue')}
            className="p-4 flex flex-col items-center text-center space-y-2 border-slate-200/80 group cursor-pointer active:scale-98 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Clock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {t('patientHome.liveQueue')}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {t('patientHome.liveQueueSub')}
              </span>
            </div>
          </Card>

          {/* Tile 4: Blood Bank */}
          <Card
            hoverable
            onClick={() => navigate('/patient/blood')}
            className="p-4 flex flex-col items-center text-center space-y-2 border-slate-200/80 group cursor-pointer active:scale-98 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Droplet className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {t('patientHome.bloodBank')}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {t('patientHome.bloodBankSub')}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Progressive Disclosure: "Aur Suvidhayein" (More Services) */}
      <div className="border border-slate-200 rounded-2xl bg-white p-4 shadow-2xs">
        <button
          type="button"
          onClick={() => setIsMoreServicesOpen(!isMoreServicesOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer touch-target"
          aria-expanded={isMoreServicesOpen}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              {t('patientHome.moreServicesTitle')} (दवाइयां, पर्चे, रेफरल)
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-600">
              +4 सेवाएं
            </Badge>
          </div>
          <div className="p-1 rounded-md text-slate-500 hover:bg-slate-100">
            {isMoreServicesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isMoreServicesOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 mt-3 animate-fade-in">
            {/* Dispensary Medicines */}
            <button
              type="button"
              onClick={() => navigate('/patient/medicines')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 text-left space-y-1 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                {t('patientHome.checkMedicines')}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {t('patientHome.checkMedicinesSub')}
              </span>
            </button>

            {/* Prescriptions & Reports */}
            <button
              type="button"
              onClick={() => navigate('/patient/records')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 text-left space-y-1 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                {t('patientHome.myPrescriptions')}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {t('patientHome.myPrescriptionsSub')}
              </span>
            </button>

            {/* Referral Tracking */}
            <button
              type="button"
              onClick={() => navigate('/patient/referrals')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 text-left space-y-1 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                {t('patientHome.referrals')}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {t('patientHome.referralsSub')}
              </span>
            </button>

            {/* eSanjeevani Teleconsultation */}
            <button
              type="button"
              onClick={() => alert('eSanjeevani राष्ट्रीय टेली-परामर्श सेवा से कनेक्ट किया जा रहा है...')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 text-left space-y-1 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                टेली-कंसल्टेशन (104)
              </span>
              <span className="text-[10px] text-slate-500 block">
                घर बैठे डॉक्टर से सलाह लें
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Restrained 108 Emergency Banner */}
      <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <PhoneCall className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-red-950 leading-tight">
              {t('patientHome.emergencyTitle')}
            </h3>
            <p className="text-xs text-red-800 mt-0.5">
              {t('patientHome.emergencySubtitle')}
            </p>
          </div>
        </div>
        <a
          href="tel:108"
          className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs sm:text-sm font-extrabold text-center hover:bg-red-700 active:scale-95 transition-all shadow-xs touch-target flex items-center justify-center cursor-pointer"
        >
          {t('patientHome.callEmergencyBtn')}
        </a>
      </div>

      {/* 6. Nearby Public Facilities Directory (Clear, Calm, Accessible Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            निकटतम सरकारी अस्पताल (Nearby Facilities)
          </h2>
          <span className="text-xs text-slate-500">
            {filteredFacilities.length} अस्पताल उपलब्ध
          </span>
        </div>

        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="p-4 sm:p-5 hover:border-teal-300 transition-colors border-slate-200/90">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{facility.name}</h3>
                  <Badge variant="default" className="text-[10px]">
                    {facility.tier.replace('_', ' ')}
                  </Badge>
                  {facility.isAyushmanEmpaneled && (
                    <Badge variant="success" className="text-[10px]">
                      PM-JAY 100% मुफ्त
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {facility.address} &bull; <strong className="text-slate-800">{facility.distanceKm} km door</strong>
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

            {/* Bed Availability Grid */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs mb-3 border border-slate-200/80">
              <div>
                <span className="text-slate-500 block text-[11px]">ICU Beds</span>
                <span className="text-sm font-bold text-slate-900">
                  {facility.icuBeds.available} / {facility.icuBeds.total}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">खाली</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Oxygen Beds</span>
                <span className="text-sm font-bold text-slate-900">
                  {facility.oxygenBeds.available} / {facility.oxygenBeds.total}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">खाली</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Blood Stock</span>
                <span className="text-sm font-bold text-slate-900">
                  {facility.bloodUnitsAvailable} units
                </span>
              </div>
            </div>

            {/* Specialists Available Now */}
            <div className="text-xs text-slate-600 mb-3 flex flex-wrap items-center gap-1.5">
              <strong className="text-slate-800">ड्यूटी पर डॉक्टर:</strong>
              {facility.specialistsOnDuty.map((doc, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                    doc.isAvailableNow ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      doc.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  {doc.specialty} ({doc.name})
                </span>
              ))}
            </div>

            {/* Card Actions */}
            <div className="flex flex-wrap gap-2 pt-2.5 border-t border-slate-100 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/patient/facilities`)}
                className="text-xs font-semibold"
              >
                सुविधाएं व जांच देखें
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/patient/queue`)}
                className="text-xs font-bold"
              >
                ओपीडी टोकन लें (Get Token)
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

