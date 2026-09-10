import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Share2,
  Users2,
  Pill,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import type { MyCareOverview } from '@/types/record'

export interface CareOverviewCardProps {
  overview: MyCareOverview
  onSelectMedicationsTab?: () => void
  className?: string
}

export const CareOverviewCard: React.FC<CareOverviewCardProps> = ({
  overview,
  onSelectMedicationsTab,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${className}`}>
      {/* 1. Upcoming Appointments */}
      <Link
        to="/patient/appointments"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0F5147] hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-[#0F5147] transition-colors">
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.activeAppointmentCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Confirmed
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            Upcoming Appointments
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pandit Deendayal Upadhyay DH (General Medicine)
          </p>
        </div>
      </Link>

      {/* 2. Active Hospital Referrals & Transfers */}
      <Link
        to="/patient/referrals"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0F5147] hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
            <Share2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-[#0F5147] transition-colors">
            <span>View Slip</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.activeReferralCount}
            </span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              Bed Locked
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            Active Hospital Referral
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sir Sunderlal Hospital, IMS BHU (Cardiology)
          </p>
        </div>
      </Link>

      {/* 3. Live OPD Queue Token */}
      <Link
        to="/patient/queue"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0F5147] hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
            <Users2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-[#0F5147] transition-colors">
            <span>Live Status</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              2
            </span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Tokens Active
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            Hospital Queue Tokens
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Token B-042 (OPD) & Token D-018 (Lab)
          </p>
        </div>
      </Link>

      {/* 4. Active Prescribed Medications */}
      <button
        type="button"
        onClick={onSelectMedicationsTab}
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0F5147] hover:shadow-sm transition-all duration-200 text-left cursor-pointer"
      >
        <div className="flex items-start justify-between w-full">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <Pill className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-[#0F5147] transition-colors">
            <span>View List</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.activeMedicationCount}
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              Active Rx
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            Active Prescriptions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Atorvastatin, Aspirin, Telmisartan
          </p>
        </div>
      </button>

      {/* 5. Follow-ups & Continuity */}
      <Link
        to="/patient/follow-ups"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0F5147] hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0F5147]">
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-[#0F5147] transition-colors">
            <span>Directives</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.activeFollowUpCount ?? 2}
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Due
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            Follow-Ups & Continuity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hypertension & Cardiac Reviews
          </p>
        </div>
      </Link>
    </div>
  )
}
