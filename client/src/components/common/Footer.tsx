import React from 'react'
import { Phone, ShieldCheck, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-8 pb-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          {/* Emergency Helplines */}
          <div>
            <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-red-400" aria-hidden="true" />
              National Emergency Helplines (Toll-Free)
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li><strong className="text-white font-mono">108</strong> — Emergency Ambulance (ALS/BLS)</li>
              <li><strong className="text-white font-mono">102</strong> — Free Transport for Pregnant Mothers & Infants</li>
              <li><strong className="text-white font-mono">104</strong> — State Health Advice Helpline & Grievance</li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div>
            <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Standards & Security Compliance
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Engineered in full compliance with the Digital Personal Data Protection (DPDP) Act 2023,
              Ayushman Bharat Digital Mission (ABDM) guidelines, and HL7 FHIR R4 clinical data interoperability standards.
            </p>
          </div>

          {/* Platform Identity */}
          <div>
            <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              SANJEEVANI-CONNECT (SIH26133)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Smart India Hackathon 2026 Innovation Initiative dedicated to rural health equity,
              real-time emergency triage, and closed-loop care continuity.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} Government of India • Ministry of Health & Family Welfare</span>
          <span>Version 2.0.0-PROD • Offline-Ready PWA</span>
        </div>
      </div>
    </footer>
  )
}
