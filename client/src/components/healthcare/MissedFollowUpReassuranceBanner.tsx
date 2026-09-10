import React from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake, Calendar, PhoneCall, RotateCcw } from 'lucide-react'
import type { FollowUpCareItem } from '@/types/followUp'

export interface MissedFollowUpReassuranceBannerProps {
  followUp: FollowUpCareItem
  className?: string
}

export const MissedFollowUpReassuranceBanner: React.FC<MissedFollowUpReassuranceBannerProps> = ({
  followUp,
  className = '',
}) => {
  return (
    <section
      role="region"
      aria-label="Care Continuity Re-engagement"
      className={`p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-3.5 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
          <HeartHandshake className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Care Continuity Support
            </span>
            <span className="text-xs text-amber-700">·</span>
            <span className="text-xs text-amber-800 font-medium">Non-Judgmental Care Team Policy</span>
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Missed your recommended follow-up date? We are here to support you.
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Life happens, personal emergencies arise, and public healthcare is always ready to continue your treatment without any penalty. Your medical history with <strong>{followUp.doctorName}</strong> remains active and preserved in your Ayushman Bharat record.
          </p>
        </div>
      </div>

      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <RotateCcw className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>Original Window: <strong>{followUp.windowStartIso}</strong> — <strong>{followUp.windowEndIso}</strong></span>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="tel:104"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors touch-target"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
            <span>Tele-Health 104</span>
          </a>

          <Link
            to={`/patient/appointments/book?facilityId=${followUp.facilityId}&doctorId=doc-001&followUpId=${followUp.id}&treatment=${encodeURIComponent(followUp.condition)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Re-Book Follow-Up Slot</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
