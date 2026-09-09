import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import type { TreatmentMatchResult } from '@/types/facility'

export const TreatmentMatcherPage: React.FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('Kidney Dialysis with Nephrologist')
  const [isSearching, setIsSearching] = useState(false)
  const [results] = useState<TreatmentMatchResult[]>([
    {
      matchScore: 96,
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
          { name: 'Dr. Anita Desai', specialty: 'Nephrologist', isAvailableNow: true },
          { name: 'Dr. R. K. Sharma', specialty: 'Intensive Care', isAvailableNow: true },
        ],
        bloodUnitsAvailable: 34,
        lastUpdatedIso: new Date().toISOString(),
        isStale: false,
      },
    },
    {
      matchScore: 78,
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
          { name: 'Dr. Meena Singh', specialty: 'General Physician', isAvailableNow: true },
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
      // Results already structured
    }, 600)
  }

  const commonProcedures = [
    'Dialysis & Nephrology',
    'Normal & Cesarean Delivery (Maternal)',
    'Bone Fracture & Trauma Ortho',
    'Pediatric ICU & Incubator',
    'Cataract Eye Surgery',
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
          <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Intelligent Care Matching Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          "Mujhe Ye Treatment Kahan Milega?"
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Search any medical condition or procedure to find matched government hospitals with confirmed specialist doctors on duty, equipment readiness, and bed availability.
        </p>
      </div>

      {/* Search Input Form */}
      <Card className="p-5 bg-white shadow-sm border-cyan-200">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="treatment-input" className="block text-sm font-semibold text-slate-800">
            What treatment, specialty, or condition do you need?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
              <input
                id="treatment-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Kidney dialysis, Pediatric ventilator, Fracture..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSearching}
              className="font-bold min-h-[44px]"
            >
              Match Facilities
            </Button>
          </div>

          {/* Rapid suggestions */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Quick Searches:</span>
            {commonProcedures.map((proc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(proc)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 rounded-full border border-slate-200 transition-colors cursor-pointer"
              >
                {proc}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* AI Clinical Transparency Disclosure */}
      <Alert variant="info" title="Verified Hospital Capability Matching">
        Results are ranked by verified clinical capability (equipment status + specialist on duty + bed availability), not merely distance. Ayushman Bharat (PM-JAY) empaneled facilities provide 100% cashless care.
      </Alert>

      {/* Ranked Results Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Recommended Facilities ({results.length} Found)
          </h2>
          <span className="text-xs text-slate-500">Sorted by Capability Match Score</span>
        </div>

        {results.map((res, index) => {
          const { facility, matchScore, recommendedReason, estimatedTravelTimeMins } = res
          return (
            <Card key={facility.id} className="p-5 border-slate-300 hover:border-cyan-500 transition-all">
              {/* Top Bar: Match Score + Tier + Freshness */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {matchScore}% Capability Match
                    </span>
                    <Badge variant="default" className="text-[10px]">
                      {facility.tier.replace('_', ' ')}
                    </Badge>
                    {facility.isAyushmanEmpaneled && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        100% Cashless (PM-JAY)
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                    {index + 1}. {facility.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {facility.address} &bull; <strong className="text-slate-700">{facility.distanceKm} km</strong> (~{estimatedTravelTimeMins} mins by road)
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

              {/* Rationale for recommendation */}
              <div className="my-3 p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                <strong className="block mb-0.5 text-emerald-950 font-semibold">Why this hospital?</strong>
                {recommendedReason}
              </div>

              {/* Live Availability Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2">
                <div className="p-2 bg-slate-50 rounded-md">
                  <span className="text-slate-500 block">ICU Beds</span>
                  <span className="font-bold text-slate-900">
                    {facility.icuBeds.available} Available
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-md">
                  <span className="text-slate-500 block">Oxygen Beds</span>
                  <span className="font-bold text-slate-900">
                    {facility.oxygenBeds.available} Available
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-md">
                  <span className="text-slate-500 block">Specialist</span>
                  <span className="font-bold text-slate-900">
                    {facility.specialistsOnDuty[0]?.name || 'On Duty'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-md">
                  <span className="text-slate-500 block">Blood Units</span>
                  <span className="font-bold text-slate-900">
                    {facility.bloodUnitsAvailable} Units
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Calling ${facility.name} emergency desk...`)}
                >
                  Call Facility Desk
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/patient/queue')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Book OPD Slot / Get Token
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
