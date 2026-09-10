import React, { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  Printer,
  Search,
  Activity,
  AlertTriangle,
  Building2,
  Phone,
  Layers,
  Sparkles,
  Heart,
  X,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { careService } from '@/services/careService'
import type {
  MyCareOverview,
  CareTimelineEvent,
  CareEpisode,
  CareCategory,
  PrescriptionItem,
} from '@/types/record'
import { CareNextActionBanner } from '@/components/healthcare/CareNextActionBanner'
import { CareOverviewCard } from '@/components/healthcare/CareOverviewCard'
import { CareTimelineItem } from '@/components/healthcare/CareTimelineItem'
import { CareEpisodeCard } from '@/components/healthcare/CareEpisodeCard'
import { ActiveMedicationsCard } from '@/components/healthcare/ActiveMedicationsCard'
import { CareEventDetailDrawer } from '@/components/healthcare/CareEventDetailDrawer'

export const MyCarePage: React.FC = () => {
  const [overview, setOverview] = useState<MyCareOverview | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<CareTimelineEvent[]>([])
  const [episodes, setEpisodes] = useState<CareEpisode[]>([])
  const [medications, setMedications] = useState<PrescriptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [activeCategory, setActiveCategory] = useState<CareCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)

  // Drawer state
  const [selectedEvent, setSelectedEvent] = useState<CareTimelineEvent | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Load initial care data
  useEffect(() => {
    let isMounted = true

    async function loadCareData() {
      try {
        const [ov, tl, ep, meds] = await Promise.all([
          careService.getMyCareOverview(),
          careService.getCareTimeline('ALL'),
          careService.getCareEpisodes(),
          careService.getActiveMedications(),
        ])

        if (isMounted) {
          setOverview(ov)
          setTimelineEvents(tl)
          setEpisodes(ep)
          setMedications(meds)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load care data:', err)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCareData()

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered timeline events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((event) => {
      // Category filter
      if (activeCategory !== 'ALL' && event.category !== activeCategory) {
        return false
      }

      // Episode filter
      if (selectedEpisodeId && event.episodeId !== selectedEpisodeId) {
        return false
      }

      // Text query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = event.title.toLowerCase().includes(q)
        const matchFacility = event.facilityName.toLowerCase().includes(q)
        const matchDoctor = event.clinicianName.toLowerCase().includes(q)
        const matchDept = event.department.toLowerCase().includes(q)
        const matchDiagnosis = event.diagnosis ? event.diagnosis.toLowerCase().includes(q) : false
        const matchComplaint = event.chiefComplaint ? event.chiefComplaint.toLowerCase().includes(q) : false

        return matchTitle || matchFacility || matchDoctor || matchDept || matchDiagnosis || matchComplaint
      }

      return true
    })
  }, [timelineEvents, activeCategory, selectedEpisodeId, searchQuery])

  const handleOpenDetail = (event: CareTimelineEvent) => {
    setSelectedEvent(event)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedEvent(null)
  }

  const handleToggleEpisode = (episodeId: string) => {
    setSelectedEpisodeId((prev) => (prev === episodeId ? null : episodeId))
  }

  const handlePrintSummary = () => {
    window.print()
  }

  const categories: { key: CareCategory; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Records', count: timelineEvents.length },
    {
      key: 'CONSULTATIONS',
      label: 'Consultations',
      count: timelineEvents.filter((e) => e.category === 'CONSULTATIONS').length,
    },
    {
      key: 'DIAGNOSTICS',
      label: 'Diagnostics & Labs',
      count: timelineEvents.filter((e) => e.category === 'DIAGNOSTICS').length,
    },
    {
      key: 'MEDICINES',
      label: 'Prescriptions',
      count: timelineEvents.filter((e) => e.category === 'MEDICINES').length,
    },
    {
      key: 'REFERRALS',
      label: 'Referrals & Transfers',
      count: timelineEvents.filter((e) => e.category === 'REFERRALS').length,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">
          Loading your longitudinal health records from Ayushman Bharat repository...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Citizen Health Profile Header */}
      <section
        role="region"
        aria-label="Citizen Longitudinal Health Profile"
        className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* National Health ID Verification Seal */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
                ABHA Verified Identity
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                ABHA: {overview?.profile.abhaId || '14-8842-1920-5531'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {overview?.profile.patientName || 'Rajesh Sharma'}
              </h1>
              <p className="text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  {overview?.profile.age || 48} yrs • {overview?.profile.gender || 'Male'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
                  Primary Facility: {overview?.profile.primaryHealthCentre || 'CHC Shivpur'}
                </span>
              </p>
            </div>

            {/* Clinical Badges: Blood Group, Allergies, Chronic Conditions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <Heart className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                Blood Group: {overview?.profile.bloodGroup || 'B+'}
              </span>

              {overview?.profile.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                  title="Documented Medical Allergy"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  Allergy: {allergy}
                </span>
              ))}

              {overview?.profile.chronicConditions.map((cond, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-[#0F5147] border border-teal-200"
                >
                  <Activity className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
                  {cond}
                </span>
              ))}
            </div>
          </div>

          {/* Action Tools: Print Summary & Emergency Helpline */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrintSummary}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Print Health Dossier</span>
            </button>

            <a
              href="tel:108"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>Emergency 108</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Next Best Action Guidance Banner */}
      {overview?.nextAction && (
        <CareNextActionBanner guidance={overview.nextAction} />
      )}

      {/* 3. Active Care Snapshot Cards */}
      {overview && (
        <section aria-label="Active Public Care Summary">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0F5147]" aria-hidden="true" />
              <span>Active Care Touchpoints</span>
            </h2>
            <span className="text-xs text-slate-500">
              Synchronized across Purvanchal Health Network
            </span>
          </div>
          <CareOverviewCard
            overview={overview}
            onSelectMedicationsTab={() => setActiveCategory('MEDICINES')}
          />
        </section>
      )}

      {/* 4. Longitudinal Episodes of Care */}
      {episodes.length > 0 && (
        <section aria-label="Longitudinal Episodes of Care">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                <span>Connected Care Episodes</span>
              </h2>
              <p className="text-xs text-slate-500">
                Multi-facility patient journeys connecting initial CHC primary visits to tertiary hospital admissions
              </p>
            </div>

            {selectedEpisodeId && (
              <button
                type="button"
                onClick={() => setSelectedEpisodeId(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear Episode Filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((episode) => (
              <CareEpisodeCard
                key={episode.id}
                episode={episode}
                isSelected={selectedEpisodeId === episode.id}
                onToggleSelect={handleToggleEpisode}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Active Digital Medications & Prescriptions */}
      {medications.length > 0 && (
        <ActiveMedicationsCard medications={medications} />
      )}

      {/* 6. Longitudinal Timeline & Records */}
      <section aria-label="Longitudinal Care History Timeline" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0F5147]" aria-hidden="true" />
              <span>Longitudinal Health Records & Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical consultations, diagnostic assays, e-prescriptions, and hospital transfers
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, diagnosis, test..."
              aria-label="Search medical records"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F5147] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected Episode Filter Banner */}
        {selectedEpisodeId && (
          <div className="p-3.5 rounded-xl bg-[#F2F9F8] border border-[#D0EAE6] flex items-center justify-between text-xs text-[#0F5147]">
            <span className="font-semibold">
              Showing events linked to episode: {episodes.find((e) => e.id === selectedEpisodeId)?.title}
            </span>
            <button
              type="button"
              onClick={() => setSelectedEpisodeId(null)}
              className="font-bold underline hover:text-[#0A3F37] cursor-pointer"
            >
              Reset to Full Timeline
            </button>
          </div>
        )}

        {/* Timeline Events List */}
        {filteredEvents.length > 0 ? (
          <div className="mt-6">
            {filteredEvents.map((event, index) => (
              <CareTimelineItem
                key={event.id}
                event={event}
                onOpenDetail={handleOpenDetail}
                isLast={index === filteredEvents.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-white text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching health records found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We could not find any clinical entries matching your search or category filter. Try clearing your query.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL')
                setSearchQuery('')
                setSelectedEpisodeId(null)
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold text-[#0F5147] bg-[#F2F9F8] hover:bg-[#E5F4F1] border border-[#D0EAE6] rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </section>

      {/* 7. Clinical Governance, Privacy & ABDM Compliance */}
      <section
        role="contentinfo"
        aria-label="Clinical Data Governance"
        className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3"
      >
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <ShieldCheck className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
          <span>Ayushman Bharat Digital Mission (ABDM) Care Continuum & Clinical Governance</span>
        </div>

        <p className="leading-relaxed">
          HealthConnect operates under strict clinical verification protocols. All health events, diagnostic readings, and medication orders are authored by verified medical officers registered with the National Medical Commission (NMC) or State Medical Councils. HealthConnect does not autonomously diagnose, prescribe medications, or alter clinical plans without licensed practitioner authorization.
        </p>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-2 border-t border-slate-200 text-slate-500">
          <span>End-to-End Encrypted (AES-256)</span>
          <span>•</span>
          <span>Consent-Artefact Aligned</span>
          <span>•</span>
          <span>FHIR R4 Diagnostic & Care Plan Compliant</span>
        </div>
      </section>

      {/* 8. Slide-Over Event Detail Drawer */}
      <CareEventDetailDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
