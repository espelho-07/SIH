import React from 'react'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Percent,
} from 'lucide-react'
import type { MedicineInventoryLocation } from '@/types/prescription'

export interface MedicineInventoryCardProps {
  location: MedicineInventoryLocation
  className?: string
}

export const MedicineInventoryCard: React.FC<MedicineInventoryCardProps> = ({
  location,
  className = '',
}) => {
  const isInStock = location.availabilityStatus === 'IN_STOCK'
  const isLowStock = location.availabilityStatus === 'LOW_STOCK'
  const isOutOfStock = location.availabilityStatus === 'OUT_OF_STOCK'

  const savingsPercent =
    location.marketEquivalentPriceInr > 0 && location.mrpInr >= 0
      ? Math.round(
          ((location.marketEquivalentPriceInr - location.mrpInr) /
            location.marketEquivalentPriceInr) *
            100,
        )
      : 0

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md ${
        isOutOfStock
          ? 'border-slate-200 dark:border-slate-800 opacity-75'
          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
      } ${className}`}
    >
      {/* Top Meta: Facility Type, Availability Status, Freshness */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            {location.facilityType === 'JAN_AUSHADHI'
              ? 'Jan Aushadhi Kendra'
              : location.facilityType === 'DISTRICT_HOSPITAL_PHARMACY'
                ? 'District Hospital Pharmacy'
                : 'CHC Dispensary'}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
              location.isStale
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Clock className="w-3 h-3" aria-hidden="true" />
            {location.freshnessLabel}
          </span>
        </div>

        {isInStock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            In Stock ({location.unitsAvailable} units)
          </span>
        )}

        {isLowStock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            Low Stock ({location.unitsAvailable} left)
          </span>
        )}

        {isOutOfStock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Awaiting Stock
          </span>
        )}
      </div>

      {/* Facility Name */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
        {location.facilityName}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span>{location.address} • <strong>{location.distanceKm} km</strong> ({location.estimatedTravelTimeMins} min)</span>
      </p>

      {/* Affordability & Subsidy Strip */}
      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Government Subsidized Rate</span>
          <div className="flex items-baseline gap-2">
            {location.mrpInr === 0 ? (
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                100% Free (NHM / PM-JAY)
              </span>
            ) : (
              <>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  ₹{location.mrpInr}
                </span>
                <span className="line-through text-slate-400">
                  ₹{location.marketEquivalentPriceInr} (Commercial MRP)
                </span>
              </>
            )}
          </div>
        </div>

        {savingsPercent > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <Percent className="w-3 h-3" aria-hidden="true" />
            Save ~{savingsPercent}% on generic
          </span>
        )}
      </div>

      {/* Hours & Contact */}
      <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>Hours: {location.operatingHours}</span>
      </div>

      {/* Stale Warning Disclaimer */}
      {location.isStale && (
        <div className="mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span>Inventory data over 24 hours old. Please verify stock availability by phone before visiting.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <a
          href={`tel:${location.phone}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Call Pharmacy</span>
        </a>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.facilityName + ' ' + location.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 rounded-xl transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Get Directions</span>
        </a>
      </div>
    </div>
  )
}
