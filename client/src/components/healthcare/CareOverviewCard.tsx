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
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* 1. Upcoming Appointments */}
      <Link
        to="/patient/appointments"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview.activeAppointmentCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Confirmed
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            Upcoming Appointments
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pandit Deendayal Upadhyay DH (General Medicine)
          </p>
        </div>
      </Link>

      {/* 2. Active Hospital Referrals & Transfers */}
      <Link
        to="/patient/referrals"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
            <Share2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
            <span>View Slip</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview.activeReferralCount}
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              Bed Locked
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            Active Hospital Referral
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sir Sunderlal Hospital, IMS BHU (Cardiology)
          </p>
        </div>
      </Link>

      {/* 3. Live OPD Queue Token */}
      <Link
        to="/patient/queue"
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            <Users2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
            <span>Live Status</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              2
            </span>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
              Tokens Active
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            Hospital Queue Tokens
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Token B-042 (OPD) & Token D-018 (Lab)
          </p>
        </div>
      </Link>

      {/* 4. Active Prescribed Medications */}
      <button
        type="button"
        onClick={onSelectMedicationsTab}
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200 text-left cursor-pointer"
      >
        <div className="flex items-start justify-between w-full">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <Pill className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
            <span>View List</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview.activeMedicationCount}
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              Active Rx
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            Active Prescriptions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atorvastatin, Aspirin, Telmisartan
          </p>
        </div>
      </button>
    </div>
  )
}
