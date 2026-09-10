import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Share2,
  Search,
  AlertTriangle,
  Phone,
  Sparkles,
  Building2,
} from 'lucide-react'
import { referralService } from '@/services/referralService'
import { ReferralCard } from '@/components/healthcare/ReferralCard'
import type { ReferralClinicalSummary } from '@/types/referral'

export const PatientReferralsPage: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralClinicalSummary[]>([])
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ACTION_NEEDED' | 'COMPLETED' | 'ALL'>('ACTIVE')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    referralService
      .getPatientReferrals()
      .then((data) => {
        if (isMounted) {
          setReferrals(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered referrals
  const filteredReferrals = referrals.filter((ref) => {
    // Tab filtering
    if (activeTab === 'ACTIVE') {
      if (ref.status === 'COMPLETED' || ref.status === 'CANCELLED') return false
    } else if (activeTab === 'ACTION_NEEDED') {
      if (!ref.patientActionRequired && ref.status !== 'FALLBACK_REROUTING') return false
    } else if (activeTab === 'COMPLETED') {
      if (ref.status !== 'COMPLETED') return false
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        ref.referralCode.toLowerCase().includes(q) ||
        ref.referringFacilityName.toLowerCase().includes(q) ||
        (ref.receivingFacilityName && ref.receivingFacilityName.toLowerCase().includes(q)) ||
        ref.requiredSpecialty.toLowerCase().includes(q) ||
        ref.clinicalReason.toLowerCase().includes(q)
      )
    }

    return true
  })

  const activeCount = referrals.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length
  const actionNeededCount = referrals.filter((r) => r.patientActionRequired || r.status === 'FALLBACK_REROUTING').length
  const completedCount = referrals.filter((r) => r.status === 'COMPLETED').length

  const hasUrgentActive = referrals.some(
    (r) =>
      (r.urgency === 'URGENT' || r.urgency === 'CRITICAL_TRAUMA') &&
      r.status !== 'COMPLETED' &&
      r.status !== 'CANCELLED'
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F5147] bg-[#F2F9F8] px-2.5 py-0.5 rounded-full border border-[#D0EAE6]">
              Care Continuity
            </span>
            <span className="text-xs text-slate-500">• Inter-Facility Referrals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Referral Trail & Hospital Transfers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track secondary and tertiary referrals issued by your clinic doctor, verify receiving hospital bed availability, and continue care without paper gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <a
            href="tel:108"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
          >
            <Phone className="w-4 h-4" />
            <span>Emergency 108 Helpline</span>
          </a>
        </div>
      </div>

      {/* Emergency Alert Banner if any referral is urgent */}
      {hasUrgentActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Time-Sensitive Clinical Referral Active
              </h4>
              <p className="text-xs text-amber-800">
                You have an active urgent referral with locked bed capacity. Report to the receiving facility within your designated SLA window.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
            Priority Care
          </span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active & In-Progress ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTION_NEEDED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ACTION_NEEDED'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Action Needed ({actionNeededCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed & Closed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white text-[#0F5147] font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({referrals.length})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hospital, specialty, ref ID..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 focus:border-[#0F5147]"
          />
        </div>
      </div>

      {/* Referrals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredReferrals.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No referrals found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'ACTIVE'
              ? 'You do not have any active inter-facility hospital referrals at this time.'
              : 'There are no referrals matching your selected filter criteria.'}
          </p>
          <div className="pt-2">
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>View Appointments</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReferrals.map((referral) => (
            <ReferralCard key={referral.id} referral={referral} />
          ))}
        </div>
      )}

      {/* Explanatory Public Healthcare Note */}
      <footer className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <Sparkles className="w-4 h-4 text-[#0F5147] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">National Health Mission Closed-Loop Referrals:</span>
          <p>
            When a government doctor refers you to a higher facility, HealthConnect electronically transmits your clinical triage and locks verified bed/OPD capacity to eliminate overcrowding at district hospital gates.
          </p>
        </div>
      </footer>
    </div>
  )
}
