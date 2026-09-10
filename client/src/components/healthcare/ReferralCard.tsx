import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  BedDouble,
} from 'lucide-react'
import { ReferralStatusBadge } from '@/components/healthcare/ReferralStatusBadge'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import type { ReferralClinicalSummary } from '@/types/referral'

export interface ReferralCardProps {
  referral: ReferralClinicalSummary
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ referral }) => {
  const isUrgent = referral.urgency === 'URGENT' || referral.urgency === 'CRITICAL_TRAUMA'
  const isPendingAction = referral.patientActionRequired || referral.status === 'FALLBACK_REROUTING'

  return (
    <article
      className={`p-5 sm:p-6 bg-white rounded-2xl border transition-all ${
        isPendingAction
          ? 'border-amber-300 ring-2 ring-amber-50 shadow-xs'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Card Header: Ref Code, Urgency, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-black text-[#0F5147] bg-[#F2F9F8] px-2.5 py-1 rounded-lg border border-[#D0EAE6]">
            {referral.referralCode}
          </span>

          {isUrgent && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              {referral.urgency === 'CRITICAL_TRAUMA' ? 'Critical Emergency' : 'Urgent Transfer'}
            </span>
          )}

          <GovernmentHealthcareBadge ownership="GOVERNMENT" tier={referral.referringFacilityTier} />
        </div>

        <ReferralStatusBadge status={referral.status} />
      </div>

      {/* Hospital Transfer Corridor: From PHC -> To Receiving Hospital */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {/* Originating Facility */}
        <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Referring Facility (Origin)
          </span>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {referral.referringFacilityName}
          </h4>
          <p className="text-xs text-slate-600 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-[#0F5147] shrink-0" />
            <span>{referral.referringDoctorName} ({referral.referringDoctorSpecialty})</span>
          </p>
        </div>

        {/* Receiving Facility */}
        <div className="space-y-1 bg-[#F2F9F8]/60 p-3.5 rounded-xl border border-[#D0EAE6]">
          <span className="text-[10px] text-[#0F5147] font-bold uppercase tracking-wider block">
            Receiving Facility (Destination)
          </span>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {referral.receivingFacilityName || 'Matching Recommended Facility...'}
          </h4>
          {referral.receivingFacilityAddress ? (
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0F5147] shrink-0" />
              <span className="truncate">{referral.receivingFacilityAddress}</span>
            </p>
          ) : (
            <p className="text-xs text-amber-700 font-medium">
              Review verified facilities to confirm transfer
            </p>
          )}
        </div>
      </div>

      {/* Clinical Indication & Plain Explanation */}
      <div className="space-y-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">Required Specialty:</span>
          <span className="text-xs font-semibold text-[#0F5147] bg-[#F2F9F8] px-2 py-0.5 rounded border border-[#D0EAE6]">
            {referral.requiredSpecialty}
          </span>
        </div>
        <p className="text-xs text-slate-600 line-clamp-2">
          <strong className="text-slate-800">Reason: </strong>
          {referral.plainLanguageExplanation}
        </p>
      </div>

      {/* Bed / Token / Queue Indicators if available */}
      {(referral.bedReserved || referral.linkedQueueToken) && (
        <div className="flex flex-wrap items-center gap-3 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 mb-3">
          {referral.bedReserved && (
            <span className="flex items-center gap-1 font-semibold">
              <BedDouble className="w-3.5 h-3.5 text-emerald-700" />
              Priority {referral.bedReservationType || 'ICU'} Bed Locked
            </span>
          )}
          {referral.linkedQueueToken && (
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              Inbound Token: <strong className="font-mono">{referral.linkedQueueToken}</strong>
            </span>
          )}
          <span className="text-emerald-700 ml-auto text-[11px] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Cashless PM-JAY
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Issued on {new Date(referral.createdAtIso).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Link
            to={`/patient/referrals/${referral.id}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
          >
            <span>
              {referral.status === 'FALLBACK_REROUTING'
                ? 'Review Alternatives'
                : referral.status === 'COMPLETED'
                ? 'View Care Summary'
                : 'Track Care Continuity'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
