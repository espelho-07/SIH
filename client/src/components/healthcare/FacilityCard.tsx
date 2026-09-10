import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  BedDouble,
  Droplet,
  Navigation,
} from 'lucide-react'
import { GovernmentHealthcareBadge } from './GovernmentHealthcareBadge'
import { FacilityAvailabilityBadge } from './FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from './ResourceFreshnessBadge'
import type { FacilityTelemetry } from '@/types/facility'

export interface FacilityCardProps {
  facility: FacilityTelemetry
  priorityLabel?: string
  className?: string
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  priorityLabel,
  className = '',
}) => {
  const activeSpecialists = facility.specialistsOnDuty.filter((s) => s.isAvailableNow)
  const isGovernment = facility.ownership === 'GOVERNMENT'

  return (
    <article
      className={`bg-white rounded-2xl border transition-all duration-150 p-4 sm:p-5 flex flex-col justify-between group ${
        isGovernment
          ? 'border-slate-200/90 hover:border-[#0F5147]/50 hover:shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      } ${className}`}
      aria-labelledby={`facility-title-${facility.id}`}
    >
      <div>
        {/* Top Badges: Government Ownership + Status + Freshness */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <GovernmentHealthcareBadge ownership={facility.ownership} tier={facility.tier} />
            {priorityLabel && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]">
                {priorityLabel}
              </span>
            )}
            {facility.isAyushmanEmpaneled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                Ayushman PM-JAY
              </span>
            )}
          </div>

          <FacilityAvailabilityBadge status={facility.operationalStatus} />
        </div>

        {/* Facility Header */}
        <div className="mb-3">
          <h2
            id={`facility-title-${facility.id}`}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0F5147] transition-colors leading-snug"
          >
            <Link to={`/patient/facility/${facility.id}`} className="focus-visible:outline-none focus-visible:underline">
              {facility.name}
            </Link>
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-slate-800">{facility.distanceKm} km away</span>
            {facility.estimatedTravelTimeMins && (
              <>
                <span>•</span>
                <span>~{facility.estimatedTravelTimeMins} mins travel</span>
              </>
            )}
            <span>•</span>
            <span className="truncate">{facility.district}</span>
          </div>
        </div>

        {/* Doctor & Clinical Capability Line */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
            <Stethoscope className="w-3.5 h-3.5 text-[#0F5147] shrink-0" aria-hidden="true" />
            {activeSpecialists.length > 0 ? (
              <span>
                <strong className="font-semibold text-slate-900">{activeSpecialists[0].name}</strong>{' '}
                <span className="text-slate-600">({activeSpecialists[0].specialty})</span> on duty today
              </span>
            ) : (
              <span className="text-slate-600">General OPD Medical Officer on duty</span>
            )}
          </div>

          {activeSpecialists.length > 1 && (
            <p className="text-[11px] text-slate-500 pl-5.5">
              + {activeSpecialists.length - 1} other active specialty consultants available
            </p>
          )}
        </div>

        {/* Live Resource Telemetry Strip */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 mb-3 text-center">
          <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase block tracking-wider">
              ICU Beds
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-950">
              {facility.icuBeds.available}{' '}
              <span className="text-[10px] font-normal text-emerald-700">/ {facility.icuBeds.total}</span>
            </span>
          </div>

          <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-100">
            <span className="text-[10px] font-semibold text-teal-800 uppercase block tracking-wider">
              Oxygen Beds
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-teal-950">
              {facility.oxygenBeds.available}{' '}
              <span className="text-[10px] font-normal text-teal-700">/ {facility.oxygenBeds.total}</span>
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-600 uppercase block tracking-wider">
              General Beds
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
              {facility.generalBeds.available}
            </span>
          </div>
        </div>

        {/* Secondary Info: Blood Bank + Emergency */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-0.5">
          <div className="flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
            <span>
              Blood Bank:{' '}
              <strong className="text-slate-800 font-semibold">
                {facility.bloodUnitsAvailable > 0 ? `${facility.bloodUnitsAvailable} units` : 'Standby'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{facility.hasEmergency24x7 ? '24x7 Emergency' : 'Day OPD'}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Freshness + Primary View Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        <ResourceFreshnessBadge
          lastUpdatedIso={facility.lastUpdatedIso}
          isStale={facility.isStale}
        />

        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${facility.name}, ${facility.address}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer touch-target flex items-center justify-center"
            title="Open Maps Directions"
            aria-label={`Get directions to ${facility.name}`}
          >
            <Navigation className="w-4 h-4" />
          </a>

          <Link
            to={`/patient/facility/${facility.id}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
          >
            <span>View Facility</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
