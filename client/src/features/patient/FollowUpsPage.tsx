import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  RotateCcw,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { followUpService } from '@/services/followUpService'
import { FollowUpHeroActionCard } from '@/components/healthcare/FollowUpHeroActionCard'
import { FollowUpCareCard } from '@/components/healthcare/FollowUpCareCard'
import { FollowUpDetailModal } from '@/components/healthcare/FollowUpDetailModal'
import type {
  FollowUpCareItem,
  FollowUpSummaryStats,
} from '@/types/followUp'

type FollowUpTab = 'NEEDS_ATTENTION' | 'UPCOMING' | 'COMPLETED' | 'ALL'

export const FollowUpsPage: React.FC = () => {
  const { id: paramFollowUpId } = useParams<{ id?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<FollowUpTab>(
    (searchParams.get('tab') as FollowUpTab) || 'NEEDS_ATTENTION'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL')

  const [followUps, setFollowUps] = useState<FollowUpCareItem[]>([])
  const [stats, setStats] = useState<FollowUpSummaryStats>({
    needsAttentionCount: 0,
    upcomingCount: 0,
    completedCount: 0,
    totalCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Selected Detail Modal State
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpCareItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Feedback Notification Banner
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      followUpService.getFollowUps({
        statusCategory: activeTab,
        specialty: selectedSpecialty,
        searchQuery,
      }),
      followUpService.getSummaryStats(),
      paramFollowUpId ? followUpService.getFollowUpById(paramFollowUpId) : Promise.resolve(null),
    ])
      .then(([items, summary, directMatch]) => {
        if (isMounted) {
          setFollowUps(items)
          setStats(summary)
          if (directMatch) {
            setSelectedFollowUp(directMatch)
            setIsDetailOpen(true)
          }
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [activeTab, selectedSpecialty, searchQuery, paramFollowUpId])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const [items, summary] = await Promise.all([
        followUpService.getFollowUps({
          statusCategory: activeTab,
          specialty: selectedSpecialty,
          searchQuery,
        }),
        followUpService.getSummaryStats(),
      ])
      setFollowUps(items)
      setStats(summary)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: FollowUpTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const handleOpenDetail = (item: FollowUpCareItem) => {
    setSelectedFollowUp(item)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
  }

  const handleCheckInQueue = async (followUpId: string) => {
    try {
      const res = await followUpService.checkInFollowUpQueue(followUpId)
      setFeedbackNotice(`Live OPD Token issued: ${res.tokenNumber} for ${res.roomNumber}!`)
      await refreshData()
      setTimeout(() => setFeedbackNotice(null), 5000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReschedule = async (
    followUpId: string,
    newDate: string,
    newSlot: string,
    reason: string
  ) => {
    try {
      await followUpService.rescheduleFollowUp(followUpId, newDate, newSlot, reason)
      setFeedbackNotice(`Follow-up appointment rescheduled to ${newDate} (${newSlot}).`)
      await refreshData()
      setIsDetailOpen(false)
      setTimeout(() => setFeedbackNotice(null), 5000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = async (followUpId: string, reason: string) => {
    try {
      await followUpService.cancelFollowUp(followUpId, reason)
      setFeedbackNotice('Follow-up directive cancelled and recorded in audit log.')
      await refreshData()
      setIsDetailOpen(false)
      setTimeout(() => setFeedbackNotice(null), 5000)
    } catch (err) {
      console.error(err)
    }
  }

  // Find topmost high priority hero item for the Needs Attention tab
  const heroItem =
    activeTab === 'NEEDS_ATTENTION'
      ? followUps.find((item) => item.status === 'DUE' || item.status === 'MISSED')
      : null

  const remainingItems = heroItem
    ? followUps.filter((item) => item.id !== heroItem.id)
    : followUps

  const specialties = ['ALL', 'General Medicine', 'Cardiology', 'Orthopedics', 'Ophthalmology']

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Notification Banner */}
      {feedbackNotice && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-950 shadow-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#0F5147] bg-[#F2F9F8] border border-[#D0EAE6]">
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Care Continuity
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-semibold text-slate-500">
            National Health Mission Ongoing Care
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Follow-Up & Ongoing Care
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Stay on track with your public hospital treatments. Review scheduled reviews, doctor instructions, and prerequisite diagnostic reports without ever falling through the cracks.
        </p>
      </section>

      {/* Tab Navigation */}
      <nav aria-label="Follow-Up Categories" className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => handleTabChange('NEEDS_ATTENTION')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'NEEDS_ATTENTION'
              ? 'border-[#0F5147] text-[#0F5147]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Needs Attention</span>
          {stats.needsAttentionCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {stats.needsAttentionCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('UPCOMING')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'UPCOMING'
              ? 'border-[#0F5147] text-[#0F5147]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming Scheduled</span>
          {stats.upcomingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
              {stats.upcomingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('COMPLETED')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'COMPLETED'
              ? 'border-[#0F5147] text-[#0F5147]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed</span>
          {stats.completedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              {stats.completedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('ALL')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'border-[#0F5147] text-[#0F5147]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>All Registry</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {stats.totalCount}
          </span>
        </button>
      </nav>

      {/* Filter & Search Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search condition, clinician, hospital, or specialty..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F5147]"
          />
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 hidden sm:inline" />
          {specialties.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-[#0F5147] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {spec === 'ALL' ? 'All Specialties' : spec}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F5147]" />
          <span>Loading care continuity records...</span>
        </div>
      ) : followUps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center mx-auto border border-[#D0EAE6]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            You&apos;re all caught up!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'NEEDS_ATTENTION'
              ? 'No pending or missed follow-ups require your attention at this time.'
              : 'No follow-up records found matching the selected filter.'}
          </p>
          <div className="pt-2">
            <Link
              to="/patient/my-care"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs"
            >
              <span>View Longitudinal Health Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Hero Card for Needs Attention */}
          {heroItem && (
            <FollowUpHeroActionCard
              followUp={heroItem}
              onSelect={handleOpenDetail}
            />
          )}

          {/* Grid / List of Care Cards */}
          {remainingItems.length > 0 && (
            <div className="space-y-3">
              {heroItem && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
                  Additional Follow-Up Records ({remainingItems.length})
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remainingItems.map((item) => (
                  <FollowUpCareCard
                    key={item.id}
                    followUp={item}
                    onOpenDetail={handleOpenDetail}
                    onCheckInQueue={handleCheckInQueue}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Slide-over / Modal */}
      <FollowUpDetailModal
        followUp={selectedFollowUp}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onCheckInQueue={handleCheckInQueue}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />
    </div>
  )
}
