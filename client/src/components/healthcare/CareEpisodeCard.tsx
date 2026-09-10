import React from 'react'
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
} from 'lucide-react'
import type { CareEpisode } from '@/types/record'

export interface CareEpisodeCardProps {
  episode: CareEpisode
  isSelected?: boolean
  onToggleSelect?: (episodeId: string) => void
  className?: string
}

export const CareEpisodeCard: React.FC<CareEpisodeCardProps> = ({
  episode,
  isSelected = false,
  onToggleSelect,
  className = '',
}) => {
  const isActive = episode.status === 'ACTIVE'
  const isUnderObservation = episode.status === 'UNDER_OBSERVATION'

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 ${
        isSelected
          ? 'bg-[#F2F9F8] border-[#0F5147] shadow-xs ring-1 ring-[#0F5147]'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      } ${className}`}
    >
      {/* Top Meta: Specialty & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
          <Stethoscope className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{episode.primarySpecialty}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isActive
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : isUnderObservation
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-slate-100 text-slate-700'
          }`}
        >
          {isActive ? 'Active Episode' : isUnderObservation ? 'Under Observation' : 'Resolved'}
        </span>
      </div>

      {/* Episode Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
        {episode.title}
      </h3>

      <p className="text-xs text-slate-500 mt-0.5 font-medium">
        Condition: {episode.conditionName}
      </p>

      {/* Summary Narrative */}
      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
        {episode.summary}
      </p>

      {/* Facilities Continuum */}
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          <span>Lead Facility: </span>
          <span className="font-semibold text-slate-900">
            {episode.leadFacilityName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span>Coordinated with:</span>
          {episode.associatedFacilities.map((fac, idx) => (
            <span
              key={idx}
              className="inline-block bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-xs border border-slate-200"
            >
              {fac}
            </span>
          ))}
        </div>
      </div>

      {/* Key Clinical Outcomes */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Care Continuity Milestones
        </span>
        <ul className="space-y-1 text-xs text-slate-600">
          {episode.keyOutcomes.map((outcome, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Footer */}
      {onToggleSelect && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {episode.eventCount} timeline touchpoints
          </span>

          <button
            type="button"
            onClick={() => onToggleSelect(episode.id)}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[#0F5147] text-white hover:bg-[#0A3F37]'
                : 'text-[#0F5147] bg-[#F2F9F8] hover:bg-[#E5F4F1] border border-[#D0EAE6]'
            }`}
          >
            <span>{isSelected ? 'Viewing Episode Events' : 'Filter Timeline to Episode'}</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
