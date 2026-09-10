import React from 'react'
import { ShieldAlert, AlertTriangle } from 'lucide-react'

interface AssistantDisclaimerBannerProps {
  isEmergency?: boolean
  className?: string
}

export const AssistantDisclaimerBanner: React.FC<AssistantDisclaimerBannerProps> = ({
  isEmergency = false,
  className = '',
}) => {
  if (isEmergency) {
    return (
      <div
        role="alert"
        className={`p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 shadow-2xs flex items-start gap-3 ${className}`}
      >
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-red-950 flex items-center gap-2">
            <span>Critical Emergency Safety Protocol</span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          </div>
          <p className="text-red-800 leading-relaxed">
            If you or someone in your care is experiencing severe pain, difficulty breathing, chest tightness, stroke symptoms, heavy bleeding, or loss of consciousness, call national emergency services immediately.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold active:scale-95 transition-transform"
            >
              Call 108 (Free NHM)
            </a>
            <a
              href="tel:102"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-red-50 text-red-800 border border-red-300 rounded-lg font-semibold active:scale-95 transition-transform"
            >
              Call 102 (Matritva Vahan)
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role="note"
      className={`p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2.5 text-xs ${className}`}
    >
      <ShieldAlert className="w-4 h-4 text-[#0F5147] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="space-y-0.5">
        <p className="font-semibold text-slate-900">
          Clinical Boundaries & Data Safety
        </p>
        <p className="text-slate-600 leading-relaxed">
          HealthConnect Assistant is a public healthcare navigation aid. It does not provide medical diagnoses, alter prescriptions, or override doctors. Always consult authorized medical practitioners for clinical advice.
        </p>
      </div>
    </div>
  )
}
