import React from 'react'
import {
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Baby,
  Activity,
  HeartPulse,
} from 'lucide-react'
import type { AmbulanceFleetInfo } from '@/types/emergency'

export interface AmbulanceIntelligenceCardProps {
  fleet: AmbulanceFleetInfo
  onCallDispatch?: (helpline: string) => void
  className?: string
}

export const AmbulanceIntelligenceCard: React.FC<AmbulanceIntelligenceCardProps> = ({
  fleet,
  onCallDispatch,
  className = '',
}) => {
  const getIcon = () => {
    switch (fleet.serviceType) {
      case 'ALS':
        return <HeartPulse className="w-5 h-5 text-rose-600" aria-hidden="true" />
      case 'BLS':
        return <Activity className="w-5 h-5 text-cyan-600" aria-hidden="true" />
      case 'MATERNAL_INFANT':
        return <Baby className="w-5 h-5 text-amber-600" aria-hidden="true" />
      default:
        return <Activity className="w-5 h-5 text-emerald-600" aria-hidden="true" />
    }
  }

  const getBadgeColor = () => {
    switch (fleet.serviceType) {
      case 'ALS':
        return 'bg-rose-100 text-rose-900 border-rose-300'
      case 'BLS':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300'
      case 'MATERNAL_INFANT':
        return 'bg-amber-100 text-amber-900 border-amber-300'
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300'
    }
  }

  return (
    <article
      aria-labelledby={`amb-title-${fleet.id}`}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:shadow-md transition-all ${className}`}
    >
      {/* Header Meta */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeColor()}`}>
                {fleet.typeLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Clock className="w-3 h-3" />
                {fleet.operatingHours}
              </span>
            </div>

            <h3 id={`amb-title-${fleet.id}`} className="text-base sm:text-lg font-bold text-slate-900">
              {fleet.providerName}
            </h3>

            <p className="text-xs text-slate-600">
              Coverage: <strong>{fleet.coverageDistrict}</strong>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Charge Public Service
          </span>
          <span className="block text-[11px] text-slate-500 mt-0.5">
            {fleet.schemeName}
          </span>
        </div>
      </div>

      {/* Clinical Triage Suitability Callout */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
        <strong className="text-slate-900 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          Clinical Use & Triage Recommendation:
        </strong>
        <p className="leading-relaxed text-[11px]">
          {fleet.triageInstruction}
        </p>
      </div>

      {/* Capabilities & Onboard Equipment */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Onboard Resuscitation & Life-Support Equipment:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
          {fleet.capabilities.map((cap, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Telemetry Notice */}
      <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs text-cyan-950 space-y-1">
        <span className="font-bold flex items-center gap-1 text-cyan-900">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
          Centralized Tele-Command Dispatch:
        </span>
        <p className="text-[11px] leading-relaxed text-cyan-900">
          {fleet.dispatchNote}
        </p>
      </div>

      {/* Action Footers */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Toll-free emergency dial from any cellular or landline phone
        </span>

        <a
          href={`tel:${fleet.dispatchHelpline}`}
          onClick={() => onCallDispatch && onCallDispatch(fleet.dispatchHelpline)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors cursor-pointer"
          aria-label={`Dial ${fleet.dispatchHelpline} for ${fleet.providerName}`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Dispatch Center ({fleet.dispatchHelpline})</span>
        </a>
      </div>
    </article>
  )
}
