import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  Mic,
  MicOff,
  PhoneCall,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import type { TreatmentMatchResult } from '@/types/facility'

export const TreatmentMatcherPage: React.FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('Kidney Dialysis')
  const [isSearching, setIsSearching] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const [results] = useState<TreatmentMatchResult[]>([
    {
      matchScore: 98,
      capabilityMatched: true,
      recommendedReason: 'Nephrologist on active duty + 3 Dialysis units functional + 4 ICU beds available',
      estimatedTravelTimeMins: 18,
      facility: {
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
          { name: 'Dr. Anita Desai', specialty: 'Nephrology', isAvailableNow: true },
          { name: 'Dr. R. K. Sharma', specialty: 'Intensive Care', isAvailableNow: true },
        ],
        bloodUnitsAvailable: 34,
        lastUpdatedIso: new Date().toISOString(),
        isStale: false,
      },
    },
    {
      matchScore: 82,
      capabilityMatched: true,
      recommendedReason: 'Dialysis unit operational, but Specialist on-call rather than on-site',
      estimatedTravelTimeMins: 28,
      facility: {
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
          { name: 'Dr. Meena Singh', specialty: 'General Medicine', isAvailableNow: true },
        ],
        bloodUnitsAvailable: 12,
        lastUpdatedIso: new Date().toISOString(),
        isStale: false,
      },
    },
  ])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
    }, 350)
  }

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true)
      setTimeout(() => {
        setQuery('Normal Delivery Maternity Care')
        setIsRecording(false)
      }, 1800)
    } else {
      setIsRecording(false)
    }
  }

  const commonProcedures = [
    { label: 'Kidney Dialysis', q: 'Kidney Dialysis' },
    { label: 'Normal & Cesarean Delivery', q: 'Maternity Delivery' },
    { label: 'Trauma & Fracture Casting', q: 'Bone Fracture Ortho' },
    { label: 'Pediatric ICU & Ventilator', q: 'Pediatric ICU' },
    { label: 'Cataract Eye Surgery', q: 'Cataract Eye Surgery' },
    { label: 'Cardiac & Chest Pain', q: 'Cardiac Care' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Navigation Header */}
      <div className="space-y-1.5">
        <Link
          to="/patient/home"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5147] hover:text-[#0A3F37] transition-colors mb-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F5147]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clinical Capability Matching Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What treatment do you need?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Search any medical condition, surgery, or specialty. We match verified facilities with confirmed specialists on duty and operational bed capacity.
        </p>
      </div>

      {/* Search Input Container */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="treatment-input" className="block text-xs font-bold uppercase tracking-wide text-slate-700">
            Search procedure, surgery, or specialty
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" aria-hidden="true" />
              <input
                id="treatment-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Kidney Dialysis, Pediatric ICU, Orthopaedic Fracture..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5147] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={handleVoiceToggle}
                className="min-h-[44px] px-3.5 font-semibold text-xs"
                leftIcon={isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4 text-[#0F5147]" />}
              >
                {isRecording ? 'Listening...' : 'Speak'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSearching}
                className="font-bold min-h-[44px] flex-1 sm:flex-initial px-5"
              >
                Find Best Matches
              </Button>
            </div>
          </div>

          {/* Quick Procedure Filter Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Popular:</span>
            {commonProcedures.map((proc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(proc.q)}
                className={`px-3 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
                  query === proc.q
                    ? 'bg-[#0F5147] text-white border-[#0F5147] font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {proc.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Recommendation Transparency Banner */}
      <div className="p-4 bg-[#F2F9F8] border border-[#D1E5E2] rounded-2xl text-xs text-slate-800 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-[#0F5147] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-bold text-slate-900 block">Verified Clinical Capability Matching</strong>
          <p className="text-slate-600 leading-relaxed">
            Recommendations are ranked by verified clinical equipment status, attending specialist duty shifts, and real-time bed capacity — not distance alone. Facilities empaneled under PM-JAY Ayushman Bharat provide 100% cashless care.
          </p>
        </div>
      </div>

      {/* Best Matches Results Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            Best Matched Facilities ({results.length} found)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Ranked by Clinical Readiness Score</span>
        </div>

        {results.map((res, index) => {
          const { facility, matchScore, recommendedReason, estimatedTravelTimeMins } = res
          return (
            <div
              key={facility.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all space-y-4"
            >
              {/* Card Header: Score, Facility, Distance */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {matchScore}% Readiness Match
                    </span>
                    <Badge variant="default" className="text-[10px] font-medium">
                      {facility.tier.replace('_', ' ')}
                    </Badge>
                    {facility.isAyushmanEmpaneled && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PM-JAY 100% Cashless
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {index + 1}. {facility.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {facility.address} &bull; <strong className="text-slate-800">{facility.distanceKm} km</strong> (~{estimatedTravelTimeMins} min travel time)
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

              {/* "Why this facility?" Structured Checklist */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <strong className="block font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  Why this facility?
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified specialist physician on active duty</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{facility.icuBeds.available} ICU and {facility.oxygenBeds.available} oxygen beds ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Cashless under Ayushman Bharat</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="w-4 h-4 text-[#0F5147] shrink-0" />
                    <span>Estimated {estimatedTravelTimeMins} min road transit</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/60 mt-1">
                  <strong>Clinical Rationale:</strong> {recommendedReason}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Connecting to ${facility.name} reception desk...`)}
                  leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  Contact Desk
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/patient/queue')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="text-xs font-bold"
                >
                  Get OPD Token
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
