import React, { useState } from 'react'
import {
  Droplet,
  Search,
  PhoneCall,
  MapPin,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Building2,
  RefreshCw,
  X,
} from 'lucide-react'
import type { BloodStockItem, BloodGroup, BloodComponent } from '@/types/emergency'

export interface BloodAvailabilityFinderProps {
  bloodStock: BloodStockItem[]
  selectedGroup?: BloodGroup
  onGroupChange?: (group: BloodGroup | undefined) => void
  selectedComponent?: BloodComponent
  onComponentChange?: (comp: BloodComponent | undefined) => void
  className?: string
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COMPONENTS: Array<{ key: BloodComponent; label: string }> = [
  { key: 'PRBC', label: 'Packed Red Cells (PRBC)' },
  { key: 'WHOLE_BLOOD', label: 'Whole Blood' },
  { key: 'PLATELETS', label: 'Platelets (RDP/SDP)' },
  { key: 'FFP', label: 'Plasma (FFP)' },
]

export const BloodAvailabilityFinder: React.FC<BloodAvailabilityFinderProps> = ({
  bloodStock,
  selectedGroup,
  onGroupChange,
  selectedComponent,
  onComponentChange,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = bloodStock.filter((item) => {
    if (selectedGroup && item.bloodGroup !== selectedGroup) return false
    if (selectedComponent && item.component !== selectedComponent) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = item.facilityName.toLowerCase().includes(q)
      const matchAddress = item.address.toLowerCase().includes(q)
      const matchGroup = item.bloodGroup.toLowerCase().includes(q)
      if (!matchName && !matchAddress && !matchGroup) return false
    }
    return true
  })

  return (
    <section
      role="region"
      aria-label="Verified Blood Bank Availability"
      className={`rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
              <Droplet className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
              State Blood Transfusion Council
            </span>
            <span className="text-xs text-slate-500 font-mono">
              e-RaktKosh Sync
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Verified Blood Bank Stock
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Real-time cold-chain blood component inventory across public hospital blood banks in Varanasi district.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F9F8] border border-[#D0EAE6] text-[#0F5147] text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
            <span>NABL / NAT Tested</span>
          </span>
        </div>
      </div>

      {/* 1. Blood Group Fast-Filter Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Select Blood Group Required:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onGroupChange && onGroupChange(undefined)}
            className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !selectedGroup
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Groups ({bloodStock.length})
          </button>

          {BLOOD_GROUPS.map((group) => {
            const isSelected = selectedGroup === group
            const countForGroup = bloodStock.filter((b) => b.bloodGroup === group).length
            return (
              <button
                key={group}
                type="button"
                onClick={() => onGroupChange && onGroupChange(isSelected ? undefined : group)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-200'
                    : 'bg-rose-50/70 hover:bg-rose-100 text-rose-900 border border-rose-200'
                }`}
              >
                <Droplet className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-rose-600'}`} />
                <span>{group}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-rose-200/60 text-rose-800'}`}>
                  {countForGroup}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Component Type Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Component Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onComponentChange && onComponentChange(undefined)}
            className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              !selectedComponent
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Components
          </button>

          {COMPONENTS.map((c) => {
            const isSelected = selectedComponent === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onComponentChange && onComponentChange(isSelected ? undefined : c.key)}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital or area..."
            aria-label="Filter blood stock by hospital or location"
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear blood search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Results List */}
      <div className="space-y-3 pt-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                item.isStale
                  ? 'bg-amber-50/30 border-amber-300'
                  : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left Meta: Group Badge, Facility & Specs */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-black leading-none">{item.bloodGroup}</span>
                    <span className="text-[9px] font-bold uppercase tracking-tight text-rose-700 mt-0.5">
                      {item.component}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        <Building2 className="w-3 h-3 text-emerald-700" />
                        {item.facilityTier === 'TERTIARY_AIIMS' ? 'Apex Medical College' : item.facilityTier === 'DISTRICT_HOSPITAL' ? 'District Hospital' : 'CHC Storage Unit'}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                          item.isStale
                            ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {item.freshnessLabel}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-0.5">
                      {item.facilityName}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.address} • <strong>{item.distanceKm} km away</strong></span>
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Standard: {item.testingStandard}
                    </p>
                  </div>
                </div>

                {/* Right Meta: Units & Direct Dial */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Available Units</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl sm:text-2xl font-black ${item.unitsAvailable > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {item.unitsAvailable}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">units</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${item.contactPhone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer"
                      aria-label={`Call Blood Bank at ${item.facilityName}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Contact Blood Bank</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.facilityName + ' ' + item.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Get Directions"
                      aria-label={`Get directions to ${item.facilityName}`}
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Mandatory Stale Telemetry Warning Banner */}
              {item.isStale && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-950 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Stale Blood Telemetry Alert (&gt; 12 Hours):</strong>
                    <span>
                      Inventory synchronization has not updated recently. You must telephone the blood bank counter directly at {item.contactPhone} to verify cross-matched reserve availability before proceeding.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No matching blood stock found in current filters
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No verified public blood storage units match group {selectedGroup || 'all'} and component {selectedComponent || 'all'}. Reset filters to inspect all blood units.
            </p>
            <button
              type="button"
              onClick={() => {
                if (onGroupChange) onGroupChange(undefined)
                if (onComponentChange) onComponentChange(undefined)
                setSearchQuery('')
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Blood Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Public Blood Transfusion Policy Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
        <span className="font-bold text-slate-800 block">
          National Blood Transfusion Council (NBTC) Patient Entitlement:
        </span>
        <p className="leading-relaxed text-[11px]">
          Government blood banks do not charge for blood itself; nominal service charges for testing and component separation are waived 100% under Ayushman Bharat (PM-JAY) and for Thalassemia, Sickle Cell, and emergency trauma patients. Replacement blood donation is encouraged but never mandatory during critical resuscitation.
        </p>
      </div>
    </section>
  )
}
