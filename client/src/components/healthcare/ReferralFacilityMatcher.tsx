import React, { useState } from 'react'
import {
  Building2,
  MapPin,
  Clock,
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
  ChevronRight,
  Stethoscope,
} from 'lucide-react'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import type { ReceivingFacilityMatch } from '@/types/referral'

export interface ReferralFacilityMatcherProps {
  matches: ReceivingFacilityMatch[]
  selectedFacilityId?: string | null
  onSelectFacility: (facilityId: string) => Promise<void>
  isSelecting?: boolean
  isFallbackMode?: boolean
}

export const ReferralFacilityMatcher: React.FC<ReferralFacilityMatcherProps> = ({
  matches,
  selectedFacilityId,
  onSelectFacility,
  isSelecting = false,
  isFallbackMode = false,
}) => {
  const [confirmingFacilityId, setConfirmingFacilityId] = useState<string | null>(null)

  const handleConfirm = async (facilityId: string) => {
    setConfirmingFacilityId(facilityId)
    try {
      await onSelectFacility(facilityId)
    } finally {
      setConfirmingFacilityId(null)
    }
  }

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
        <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">No Matched Facilities Available</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No public healthcare facilities in this district currently meet all the specialized diagnostic criteria. Please contact the 108 referral coordinator helpline.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Explanation Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F5147] bg-[#F2F9F8] px-2 py-0.5 rounded border border-[#D0EAE6] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0F5147]" />
              Treatment & Diagnostic Matching
            </span>
            <span className="text-xs text-slate-500">• {matches.length} Verified Receiving Facilities</span>
          </div>
          <p className="text-xs text-slate-600">
            Ranked by required diagnostic equipment, specialist presence on duty, and public health bed availability.
          </p>
        </div>
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-1 gap-4">
        {matches.map((item) => {
          const isCurrentSelected = selectedFacilityId === item.facilityId
          const isPendingConfirm = confirmingFacilityId === item.facilityId

          return (
            <article
              key={item.facilityId}
              className={`p-5 sm:p-6 bg-white rounded-2xl border transition-all ${
                isCurrentSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Header: Name, Badges, Match Score */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <GovernmentHealthcareBadge
                      ownership={item.ownership}
                      tier={item.facilityTier}
                    />
                    {item.isAyushmanEmpaneled && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        100% Cashless PM-JAY
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {item.distanceKm} km (~{item.estimatedTravelTimeMins} mins)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.facilityName}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0F5147] shrink-0" />
                    <span>{item.address}</span>
                  </p>
                </div>

                {/* Match Score Gauge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-black">{item.matchScore}% Match</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Verified Fit</span>
                </div>
              </div>

              {/* Body: WHY THIS FACILITY IS SUITABLE (Strict User Requirement) */}
              <div className="py-3 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Why this facility is suitable for your referral:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {item.reasonsWhySuitable.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bed & Specialist Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 pb-1 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">ICU Beds</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
                    {item.availableIcuBeds} Open
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">General Beds</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-teal-600" />
                    {item.availableGeneralBeds} Open
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Specialists</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                    <Stethoscope className="w-3.5 h-3.5 text-[#0F5147]" />
                    {item.specialistsOnDuty.length > 0 ? item.specialistsOnDuty[0].split('(')[0] : 'On Duty'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Helpline</span>
                  <a
                    href={`tel:${item.emergencyHelpline}`}
                    className="font-bold text-[#0F5147] flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {item.emergencyHelpline}
                  </a>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Next available: {item.nextAvailableSlot}</span>
                </div>

                {isCurrentSelected ? (
                  <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Currently Assigned & Locked</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirm(item.facilityId)}
                    disabled={isSelecting || isPendingConfirm}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs cursor-pointer touch-target"
                  >
                    <span>
                      {isPendingConfirm
                        ? 'Locking Bed...'
                        : isFallbackMode
                        ? 'Accept Alternative Facility'
                        : 'Select & Lock Bed'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
