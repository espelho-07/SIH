import React from 'react'
import {
  Building2,
  PhoneCall,
  MapPin,
  Clock,
  Activity,
  BedDouble,
  Droplet,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react'
import type { EmergencyFacility } from '@/types/emergency'

export interface EmergencyFacilityCardProps {
  facility: EmergencyFacility
  onCallFacility?: (facility: EmergencyFacility) => void
  className?: string
}

export const EmergencyFacilityCard: React.FC<EmergencyFacilityCardProps> = ({
  facility,
  onCallFacility,
  className = '',
}) => {
  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'TERTIARY_AIIMS':
        return 'Apex Government Medical College & Trauma Centre'
      case 'DISTRICT_HOSPITAL':
        return 'District Hospital (24x7 Casualty)'
      case 'CHC':
        return 'Community Health Centre (First Referral Unit)'
      case 'PHC':
        return 'Primary Health Centre'
      default:
        return 'Public Health Facility'
    }
  }

  return (
    <article
      aria-labelledby={`emergency-fac-${facility.id}`}
      className={`rounded-2xl border transition-all duration-200 p-5 sm:p-6 bg-white shadow-xs hover:shadow-md ${
        facility.hasTraumaCenter
          ? 'border-rose-300 ring-1 ring-rose-100'
          : 'border-slate-200 hover:border-[#0F5147]/50'
      } ${className}`}
    >
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
            Government Public Hospital
          </span>

          {facility.hasTraumaCenter && (
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              <Activity className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
              Level-1 Trauma Ready
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
              facility.isStale
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Clock className="w-3 h-3" aria-hidden="true" />
            {facility.freshnessLabel}
          </span>
        </div>

        {facility.hasEmergency24x7 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            24x7 Emergency Open
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Day OPD Only (Emergency to 108)
          </span>
        )}
      </div>

      {/* Facility Name & Location */}
      <div className="space-y-1">
        <h2
          id={`emergency-fac-${facility.id}`}
          className="text-lg sm:text-xl font-bold text-slate-900 leading-snug"
        >
          {facility.name}
        </h2>

        <p className="text-xs text-slate-600 font-medium">
          {getTierLabel(facility.tier)}
        </p>

        <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>
            {facility.address} • <strong className="text-slate-800">{facility.distanceKm} km away</strong> (~{facility.estimatedTravelTimeMins} mins)
          </span>
        </p>
      </div>

      {/* Decision-Critical Capacity Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {/* ICU Bed Status */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            ICU Ventilator Beds
          </span>
          <span className="text-sm font-bold text-slate-900 block">
            {facility.icuBeds.available > 0 ? (
              <span className="text-emerald-700">{facility.icuBeds.available} Available</span>
            ) : (
              <span className="text-rose-700">Full (0 Avail)</span>
            )}
            <span className="text-slate-400 font-normal text-xs"> / {facility.icuBeds.total}</span>
          </span>
        </div>

        {/* Oxygen Bed Status */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            High-Flow Oxygen
          </span>
          <span className="text-sm font-bold text-slate-900 block">
            <span className="text-emerald-700">{facility.oxygenBeds.available} Available</span>
            <span className="text-slate-400 font-normal text-xs"> / {facility.oxygenBeds.total}</span>
          </span>
        </div>

        {/* Blood Bank Availability */}
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
            On-Site Blood Bank
          </span>
          <span className="text-sm font-bold text-slate-900 block">
            {facility.bloodBankAvailable ? (
              <span className="text-emerald-700 font-bold">{facility.bloodUnitsTotal} units ready</span>
            ) : (
              <span className="text-slate-500">No Storage Hub</span>
            )}
          </span>
        </div>
      </div>

      {/* On-Duty Doctor Banner */}
      {facility.onDutyEmergencyDoctor && (
        <div className="mt-3 p-2.5 rounded-xl bg-[#F2F9F8] border border-[#D0EAE6] text-xs text-slate-700 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
          <span className="truncate">
            <strong className="text-slate-900">On-Duty Emergency Medical Officer:</strong> {facility.onDutyEmergencyDoctor}
          </span>
        </div>
      )}

      {/* Stale Data Warning */}
      {facility.isStale && (
        <div className="mt-2.5 p-2 rounded-lg bg-amber-50 text-[11px] text-amber-900 flex items-center gap-1.5 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span>Facility telemetry is over 12 hours old. Call the emergency helpline to verify bed availability before travel.</span>
        </div>
      )}

      {/* Direct Action Footers */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Ayushman Bharat Zero Out-of-Pocket Triage</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${facility.phone}`}
            onClick={() => onCallFacility && onCallFacility(facility)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            aria-label={`Call Casualty Helpline for ${facility.name}`}
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Call Casualty ({facility.phone})</span>
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.name + ' ' + facility.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            aria-label={`Get directions to ${facility.name}`}
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </article>
  )
}
