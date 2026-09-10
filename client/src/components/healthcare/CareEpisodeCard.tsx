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
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      } ${className}`}
    >
      {/* Top Meta: Specialty & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          <Stethoscope className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{episode.primarySpecialty}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isActive
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : isUnderObservation
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {isActive ? 'Active Episode' : isUnderObservation ? 'Under Observation' : 'Resolved'}
        </span>
      </div>

      {/* Episode Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
        {episode.title}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
        Condition: {episode.conditionName}
      </p>

      {/* Summary Narrative */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
        {episode.summary}
      </p>

      {/* Facilities Continuum */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          <span>Lead Facility: </span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {episode.leadFacilityName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Coordinated with:</span>
          {episode.associatedFacilities.map((fac, idx) => (
            <span
              key={idx}
              className="inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 text-xs"
            >
              {fac}
            </span>
          ))}
        </div>
      </div>

      {/* Key Clinical Outcomes */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Care Continuity Milestones
        </span>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
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
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {episode.eventCount} timeline touchpoints
          </span>

          <button
            type="button"
            onClick={() => onToggleSelect(episode.id)}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60'
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
