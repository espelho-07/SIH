import React from 'react'
import { Building2, CheckCircle2 } from 'lucide-react'
import type { FacilityOwnership, FacilityTier } from '@/types/facility'

export interface GovernmentHealthcareBadgeProps {
  ownership: FacilityOwnership
  tier?: FacilityTier
  className?: string
}

export const GovernmentHealthcareBadge: React.FC<GovernmentHealthcareBadgeProps> = ({
  ownership,
  tier,
  className = '',
}) => {
  if (ownership === 'GOVERNMENT') {
    const tierLabel =
      tier === 'DISTRICT_HOSPITAL'
        ? 'District Hospital'
        : tier === 'TERTIARY_AIIMS'
        ? 'Apex Tertiary Hospital'
        : tier === 'CHC'
        ? 'Community Health Centre'
        : tier === 'PHC'
        ? 'Primary Health Centre'
        : 'Government Healthcare'

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-[#E6F4F1] text-[#004D40] border border-[#B2DFDB] ${className}`}
        title="Public Government Healthcare Institution — Subsidized / Free Services"
      >
        <Building2 className="w-3 h-3 text-[#0F5147] shrink-0" aria-hidden="true" />
        <span>{tierLabel}</span>
        <span className="w-1 h-1 rounded-full bg-[#0F5147]" aria-hidden="true" />
        <span className="font-bold">Public</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
      title="Private Healthcare Facility — Empaneled under PM-JAY / CGHS"
    >
      <CheckCircle2 className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
      <span>Private Empaneled</span>
    </span>
  )
}
