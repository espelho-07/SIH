import React, { useState } from 'react'
import {
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Baby,
  Activity,
  Info,
} from 'lucide-react'
import type { EmergencyContact, RedFlagSymptom } from '@/types/emergency'

export interface EmergencyHeroBannerProps {
  helplines: EmergencyContact[]
  redFlags: RedFlagSymptom[]
  onCallInitiated?: (number: string) => void
  className?: string
}

export const EmergencyHeroBanner: React.FC<EmergencyHeroBannerProps> = ({
  helplines,
  redFlags,
  onCallInitiated,
  className = '',
}) => {
  const [showRedFlags, setShowRedFlags] = useState(false)

  const handleCall = (num: string) => {
    if (onCallInitiated) onCallInitiated(num)
  }

  const primaryHelpline = helplines.find((h) => h.helplineNumber === '108') || helplines[0]
  const maternalHelpline = helplines.find((h) => h.helplineNumber === '102')
  const unifiedHelpline = helplines.find((h) => h.helplineNumber === '112')

  return (
    <section
      role="region"
      aria-label="Immediate Emergency Assistance"
      className={`rounded-3xl border border-rose-200 bg-gradient-to-b from-rose-50/70 via-white to-white p-6 sm:p-8 shadow-xs space-y-6 ${className}`}
    >
      {/* Top Notice Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" aria-hidden="true" />
              Life-Threatening Emergency Protocol
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Activity className="w-3 h-3 text-[#0F5147]" aria-hidden="true" />
              National Health Mission
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
            Immediate Emergency Assistance
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
            If you or someone near you is experiencing severe trauma, chest pain, stroke signs, or breathing failure, <strong>contact government emergency services immediately</strong>. Do not wait for an app appointment.
          </p>
        </div>

        {/* 100% Free Public Guarantee Badge */}
        <div className="shrink-0 self-start sm:self-center">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
            <span className="block text-[11px] font-normal text-emerald-700">Government Guarantee</span>
            <span>100% Free 24x7 Service</span>
          </div>
        </div>
      </div>

      {/* Primary Call Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Main CTA: 108 Emergency Medical */}
        {primaryHelpline && (
          <a
            href={`tel:${primaryHelpline.helplineNumber}`}
            onClick={() => handleCall(primaryHelpline.helplineNumber)}
            className="md:col-span-1 p-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] focus:outline-none focus:ring-4 focus:ring-rose-300 cursor-pointer"
            aria-label={`Dial ${primaryHelpline.helplineNumber} for Emergency Medical & Ambulance`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-100 block">
                  Primary Medical Emergency
                </span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight block mt-0.5">
                  Dial 108
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                <PhoneCall className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>

            <div className="pt-2 border-t border-rose-500/60 flex items-center justify-between text-xs font-semibold text-rose-100">
              <span>Ambulance & Casualty Dispatch</span>
              <span className="font-bold underline">Tap to Call Now →</span>
            </div>
          </a>
        )}

        {/* Secondary: 102 Maternal & Infant */}
        {maternalHelpline && (
          <a
            href={`tel:${maternalHelpline.helplineNumber}`}
            onClick={() => handleCall(maternalHelpline.helplineNumber)}
            className="p-5 rounded-2xl bg-white hover:bg-amber-50/50 border border-amber-300 text-slate-900 shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            aria-label={`Dial ${maternalHelpline.helplineNumber} for Maternal & Infant Transport`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                  Maternal & Infant (JSSK)
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                  Dial 102
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Baby className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Labor & Neonatal Ambulance</span>
              <span className="text-amber-800 font-bold">Call 102 →</span>
            </div>
          </a>
        )}

        {/* Secondary: 112 Unified Emergency */}
        {unifiedHelpline && (
          <a
            href={`tel:${unifiedHelpline.helplineNumber}`}
            onClick={() => handleCall(unifiedHelpline.helplineNumber)}
            className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            aria-label={`Dial ${unifiedHelpline.helplineNumber} for Unified Emergency`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  All-in-One Emergency (ERSS)
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                  Dial 112
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Police, Fire, Disaster & Health</span>
              <span className="text-slate-800 font-bold">Call 112 →</span>
            </div>
          </a>
        )}
      </div>

      {/* Accordion: Recognized Red-Flag Clinical Signs */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowRedFlags(!showRedFlags)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-rose-100/60 hover:bg-rose-100 text-rose-950 text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-rose-200"
          aria-expanded={showRedFlags}
        >
          <div className="flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
            <span>Not sure if it is an acute emergency? Review clinical red flags</span>
          </div>
          {showRedFlags ? (
            <ChevronUp className="w-4 h-4 shrink-0 text-rose-700" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0 text-rose-700" aria-hidden="true" />
          )}
        </button>

        {showRedFlags && (
          <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-slate-600 leading-relaxed">
              If the patient exhibits any of these signs, initiate an emergency call immediately. Do not administer oral liquids to unconscious or seizing individuals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {redFlags.map((rf) => (
                <div
                  key={rf.id}
                  className="p-3 rounded-xl bg-rose-50/40 border border-rose-100 space-y-1 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="font-bold text-slate-900 block">{rf.symptom}</strong>
                      <span className="text-[11px] text-rose-900 font-medium">{rf.clinicalRisk}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 pt-1 text-[11px] leading-relaxed border-t border-rose-100/80">
                    <strong>Action:</strong> {rf.immediateAction}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>Guidelines sourced from Directorate General of Health Services (DGHS) Emergency Medicine protocols.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
