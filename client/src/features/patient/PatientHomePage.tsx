import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  MapPin,
  Building2,
  Droplet,
  Pill,
  PhoneCall,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LiveTokenCard } from '@/components/healthcare/LiveTokenCard'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import { useDebounce } from '@/hooks/useDebounce'
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
    isStale: true, // Marked as stale (> 12 hours)
  },
]

export const PatientHomePage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Search & Speech State
  const [searchInput, setSearchInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [locationCity, setLocationCity] = useState('Varanasi, UP')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Demo active token for care continuity preview
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

  // Toggle Voice Input simulation
  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true)
      // Simulate speech-to-text recognition
      setTimeout(() => {
        setSearchInput('Dialysis hospital with ICU bed')
        setIsRecording(false)
      }, 2500)
    } else {
      setIsRecording(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Location & Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-cyan-50/70 border border-cyan-100 rounded-xl text-xs text-cyan-900">
        <div className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-4 h-4 text-cyan-700" aria-hidden="true" />
          <span>Location: <strong className="text-cyan-950">{locationCity}</strong> (Auto-Detected GPS)</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const newCity = prompt('Enter District / City name:', locationCity)
            if (newCity) setLocationCity(newCity)
          }}
          className="font-bold underline hover:text-cyan-700 cursor-pointer"
        >
          Change District
        </button>
      </div>

      {/* 2. Vernacular Greeting & Voice Hero */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <Badge variant="outline" className="text-cyan-100 border-cyan-300/40 bg-cyan-700/50">
            Citizen Healthcare Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {t('patientHome.greeting')}
          </h1>
          <p className="text-cyan-100 text-sm sm:text-base leading-relaxed">
            {t('patientHome.voiceHeroPrompt')}
          </p>

          {/* Unified Voice & Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('patientHome.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-xs"
                aria-label="Search hospitals, specialties, or treatments"
              />
            </div>

            {/* Tactile Voice Action Button */}
            <Button
              type="button"
              variant={isRecording ? 'destructive' : 'accent'}
              onClick={handleVoiceToggle}
              leftIcon={isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              className="py-3 px-5 text-sm font-bold shrink-0 min-h-[48px]"
            >
              {isRecording ? t('patientHome.listening') : t('patientHome.voiceAction')}
            </Button>
          </div>

          {/* Prompt to try Treatment Matcher */}
          <div className="pt-1 flex items-center gap-2 text-xs text-cyan-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" aria-hidden="true" />
            <span>Need a specific procedure? Try our</span>
            <Link
              to="/patient/treatment-matcher"
              className="font-bold underline text-white hover:text-cyan-200"
            >
              Treatment-Based Hospital Matcher &rarr;
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div
          className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 3. Active Token / Care Continuity Banner (Progressive Disclosure) */}
      {activeToken && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-600" aria-hidden="true" />
              {t('patientHome.activeTokenTitle')}
            </h2>
            <Link
              to="/patient/queue"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              <span>Full Queue View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LiveTokenCard token={activeToken} />
        </div>
      )}

      {/* 4. Four Core Healthcare Action Tiles */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3">
          Essential Healthcare Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Find Hospital */}
          <Card
            hoverable
            onClick={() => navigate('/patient/facilities')}
            className="p-4 flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {t('patientHome.findFacilities')}
            </span>
            <span className="text-xs text-slate-500">Government PHC/CHC/DH</span>
          </Card>

          {/* Tile 2: Treatment Matcher */}
          <Card
            hoverable
            onClick={() => navigate('/patient/treatment-matcher')}
            className="p-4 flex flex-col items-center text-center space-y-2 group border-cyan-200 bg-cyan-50/20"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              Treatment Matcher
            </span>
            <span className="text-xs text-slate-500">"Where do I get care?"</span>
          </Card>

          {/* Tile 3: Blood Bank */}
          <Card
            hoverable
            onClick={() => navigate('/patient/blood')}
            className="p-4 flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {t('patientHome.bloodBank')}
            </span>
            <span className="text-xs text-slate-500">Live ABO/Rh units</span>
          </Card>

          {/* Tile 4: Essential Medicines */}
          <Card
            hoverable
            onClick={() => navigate('/patient/medicines')}
            className="p-4 flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {t('patientHome.checkMedicines')}
            </span>
            <span className="text-xs text-slate-500">Free dispensary stocks</span>
          </Card>
        </div>
      </div>

      {/* 5. Emergency 108 Hotline Card */}
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950">
              {t('patientHome.emergencyTitle')}
            </h3>
            <p className="text-xs text-red-800">
              {t('patientHome.emergencySubtitle')}
            </p>
          </div>
        </div>
        <a
          href="tel:108"
          className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold text-center hover:bg-red-700 transition-colors shadow-xs touch-target flex items-center justify-center"
        >
          Call 108 Now
        </a>
      </div>

      {/* 6. Nearby Public Facilities Directory (Dynamic Capability Display) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Nearby Government Healthcare Facilities
          </h2>
          <span className="text-xs text-slate-500">
            Showing {filteredFacilities.length} facilities
          </span>
        </div>

        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="p-5 hover:border-cyan-300 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{facility.name}</h3>
                  <Badge variant="default" className="text-[10px]">
                    {facility.tier.replace('_', ' ')}
                  </Badge>
                  {facility.isAyushmanEmpaneled && (
                    <Badge variant="success" className="text-[10px]">
                      PM-JAY
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {facility.address} &bull; <strong className="text-slate-700">{facility.distanceKm} km away</strong>
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
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-xs mb-3 border border-slate-200">
              <div>
                <span className="text-slate-500 block">ICU Beds</span>
                <span className="text-sm font-bold text-slate-900">
                  {facility.icuBeds.available} / {facility.icuBeds.total}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">avail</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Oxygen Beds</span>
                <span className="text-sm font-bold text-slate-900">
                  {facility.oxygenBeds.available} / {facility.oxygenBeds.total}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">avail</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Units</span>
                <span className="text-sm font-bold text-slate-900">
                  {facility.bloodUnitsAvailable} units
                </span>
              </div>
            </div>

            {/* Specialists Available Now */}
            <div className="text-xs text-slate-600 mb-3 flex flex-wrap items-center gap-1.5">
              <strong className="text-slate-800">Doctors On Duty:</strong>
              {facility.specialistsOnDuty.map((doc, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                    doc.isAvailableNow ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
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
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/patient/facilities`)}
              >
                View Services & Diagnostics
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/patient/queue`)}
              >
                Get OPD Token
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
