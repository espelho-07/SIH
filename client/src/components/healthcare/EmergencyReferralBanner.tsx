import React from 'react'
import { Link } from 'react-router-dom'
import { Share2, ArrowRight, AlertCircle } from 'lucide-react'
import type { ReferralClinicalSummary } from '@/types/referral'

export interface EmergencyReferralBannerProps {
  referral: ReferralClinicalSummary | null
  className?: string
}

export const EmergencyReferralBanner: React.FC<EmergencyReferralBannerProps> = ({
  referral,
  className = '',
}) => {
  if (!referral) return null

  return (
    <aside
      aria-label="Active Hospital Referral Context"
      className={`rounded-2xl border border-amber-300 bg-amber-50/50 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 shrink-0 mt-0.5">
          <Share2 className="w-5 h-5 text-amber-800" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
              Active Referral Linked
            </span>
            <span className="font-mono text-xs font-bold text-amber-900">
              {referral.referralCode}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            Designated Care Destination: {referral.receivingFacilityName || 'Assigned Receiving Hospital'}
          </h4>

          <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
            You have an active inter-facility referral for <strong>{referral.requiredSpecialty}</strong>.
            However, in any acute life-threatening emergency, go to the <strong>nearest 24x7 emergency room or dial 108</strong> without delay.
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
        <Link
          to={`/patient/referrals/${referral.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-200 border border-amber-300 transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-900" />
          <span>View Referral Slip</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-900" />
        </Link>
      </div>
    </aside>
  )
}
