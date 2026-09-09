import React from 'react'
import { ShieldCheck, Plus } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-8 pb-20 lg:pb-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0F5147] flex items-center justify-center text-white">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-sm">
                SANJEEVANI CONNECT
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Integrated healthcare intelligence platform providing real-time facility telemetry, clinical capability matching, and care continuity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F5147]" />
              <span>ABDM & HL7 FHIR Interoperable</span>
            </div>
            <div>
              <span>Emergency Hotline: <strong className="text-slate-900">108</strong></span>
            </div>
            <div>
              <span>Health Helpline: <strong className="text-slate-900">104</strong></span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} SANJEEVANI CONNECT &bull; Enterprise Healthcare Intelligence</span>
          <span>DPDP Compliant &bull; Privacy-first Architecture</span>
        </div>
      </div>
    </footer>
  )
}
