import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Mic,
  MicOff,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  Building2,
  Navigation,
} from 'lucide-react'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import { facilityService } from '@/services/facilityService'
import { getSpeechRecognition } from '@/lib/speechRecognition'
import type { TreatmentMatchResult } from '@/types/facility'

export const TreatmentMatcherPage: React.FC = () => {
  const [query, setQuery] = useState('Kidney Dialysis')
  const [isSearching, setIsSearching] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)
  const [results, setResults] = useState<TreatmentMatchResult[]>([])

  const executeSearch = useCallback((searchTerm: string) => {
    setIsSearching(true)
    facilityService
      .matchTreatment(searchTerm)
      .then((data) => setResults(data))
      .finally(() => setIsSearching(false))
  }, [])

  useEffect(() => {
    let isMounted = true
    facilityService.matchTreatment('Kidney Dialysis').then((data) => {
      if (isMounted) {
        setResults(data)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    executeSearch(query.trim())
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false)
      return
    }

    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      setVoiceNotice('Voice input not supported in this browser. Please type.')
      setTimeout(() => setVoiceNotice(null), 3000)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.continuous = false

      recognition.onstart = () => {
        setIsRecording(true)
        setVoiceNotice('Listening... describe your condition or treatment')
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setIsRecording(false)
        setQuery(transcript)
        setVoiceNotice(`Heard: "${transcript}"`)
        executeSearch(transcript)
      }

      recognition.onerror = () => {
        setIsRecording(false)
        setVoiceNotice('Could not understand voice. Please try again.')
        setTimeout(() => setVoiceNotice(null), 3000)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
    } catch {
      setIsRecording(false)
      setVoiceNotice('Audio permission denied. Please type.')
      setTimeout(() => setVoiceNotice(null), 3000)
    }
  }

  const commonProcedures = [
    { label: 'Kidney Dialysis', q: 'Kidney Dialysis' },
    { label: 'Cardiac Angiography', q: 'Cardiac Chest Pain' },
    { label: 'Normal Delivery / Maternity', q: 'Maternity Childbirth' },
    { label: 'Pediatric ICU (SNCU)', q: 'Pediatric Child Care' },
    { label: 'Orthopedic Fracture', q: 'Bone Fracture Ortho' },
    { label: 'Cataract Eye Surgery', q: 'Cataract Eye Surgery' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navigation Header */}
      <div className="space-y-1.5">
        <Link
          to="/patient/home"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5147] hover:underline mb-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F5147]">
          <Stethoscope className="w-4 h-4" />
          <span>Clinical Capability Matching</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What treatment do you need?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Search any illness, surgical procedure, or medical specialty. We analyze verified equipment telemetry, attending specialist duty rosters, and government bed capacity to recommend the right public hospital.
        </p>
      </div>

      {/* Search & Voice Input Box */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="treatment-input" className="block text-xs font-bold uppercase tracking-wide text-slate-700">
            Search condition, surgery, or specialty
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
              <input
                id="treatment-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Kidney Dialysis, Cardiac Angiography, Pediatric ICU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5147]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all touch-target cursor-pointer ${
                  isRecording
                    ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label="Search by voice"
              >
                {isRecording ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4 text-[#0F5147]" />}
                <span>{isRecording ? 'Listening...' : 'Voice'}</span>
              </button>

              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer disabled:opacity-50"
              >
                {isSearching ? 'Matching...' : 'Find Matches'}
              </button>
            </div>
          </div>

          {voiceNotice && (
            <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              {voiceNotice}
            </div>
          )}

          {/* Quick Filter Pills */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Popular:</span>
            {commonProcedures.map((proc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(proc.q)
                  executeSearch(proc.q)
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer touch-target ${
                  query === proc.q
                    ? 'bg-[#0F5147] text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {proc.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Trust & Clinical Transparency Box */}
      <div className="p-4 bg-[#F2F9F8] border border-[#D0EAE6] rounded-2xl text-xs text-slate-800 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-[#0F5147] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-bold text-slate-900 block">Verified Clinical Capability Matching</strong>
          <p className="text-slate-600 leading-relaxed">
            Recommendations prioritize public healthcare facilities equipped with functional diagnostic equipment, on-duty clinical specialists, and available ICU beds. All public facilities provide 100% cashless care under Ayushman Bharat (PM-JAY).
          </p>
        </div>
      </div>

      {/* Best Matched Results Listing */}
      <section className="space-y-4" aria-label="Treatment matching recommendations">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            Recommended Facilities ({results.length} matched)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Ranked by Clinical Readiness & Public Priority</span>
        </div>

        {results.map((res, index) => {
          const { facility, matchScore, recommendedReason, estimatedTravelTimeMins, rationaleChecklist } = res
          return (
            <article
              key={facility.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all space-y-4"
            >
              {/* Card Top: Match Score, Badges, Name */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {matchScore}% Capability Match
                    </span>
                    <GovernmentHealthcareBadge ownership={facility.ownership} tier={facility.tier} />
                    {facility.isAyushmanEmpaneled && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PM-JAY Cashless
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    <Link to={`/patient/facility/${facility.id}`} className="hover:text-[#0F5147] transition-colors">
                      {index + 1}. {facility.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#0F5147]" />
                    <span>{facility.distanceKm} km away (~{estimatedTravelTimeMins} min travel)</span>
                    <span>•</span>
                    <span>{facility.address}</span>
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <FacilityAvailabilityBadge status={facility.operationalStatus} />
                  <ResourceFreshnessBadge
                    lastUpdatedIso={facility.lastUpdatedIso}
                    isStale={facility.isStale}
                  />
                </div>
              </div>

              {/* "Why this facility?" Structured Multi-point Checklist */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F5147]" />
                  Why this facility?
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  {rationaleChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-emerald-900 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 mt-1">
                  <strong>Clinical Assessment:</strong> {recommendedReason}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>ICU Beds: <strong className="text-slate-900 font-bold">{facility.icuBeds.available}</strong></span>
                  <span>Oxygen: <strong className="text-slate-900 font-bold">{facility.oxygenBeds.available}</strong></span>
                  <span>General: <strong className="text-slate-900 font-bold">{facility.generalBeds.available}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/patient/facility/${facility.id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors touch-target"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/patient/appointments/book?facilityId=${facility.id}&treatment=${encodeURIComponent(query)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </Link>

                  <Link
                    to="/patient/queue"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors touch-target"
                  >
                    <span>OPD Queue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
