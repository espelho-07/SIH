import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Mic,
  MicOff,
  ArrowUpDown,
  Building2,
  MapPin,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react'
import { FacilityCard } from '@/components/healthcare/FacilityCard'
import { facilityService } from '@/services/facilityService'
import { getSpeechRecognition } from '@/lib/speechRecognition'
import type { FacilityTelemetry, FacilityFilterParams, FacilityTier } from '@/types/facility'

export const FindCarePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialTier = (searchParams.get('tier') as FacilityTier) || 'ALL'

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedOwnership, setSelectedOwnership] = useState<'ALL' | 'GOVERNMENT' | 'PRIVATE'>('GOVERNMENT')
  const [selectedTier, setSelectedTier] = useState<'ALL' | FacilityTier>(initialTier)
  const [onlyIcuAvailable, setOnlyIcuAvailable] = useState(false)
  const [onlyOxygenAvailable, setOnlyOxygenAvailable] = useState(false)
  const [onlyEmergency24x7, setOnlyEmergency24x7] = useState(false)
  const [onlyAyushman, setOnlyAyushman] = useState(false)
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'DISTANCE' | 'AVAILABLE_BEDS'>('RECOMMENDED')
  const [refreshKey, setRefreshKey] = useState(0)

  // Voice recognition state
  const [isListening, setIsListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)

  // Data fetching state
  const [facilities, setFacilities] = useState<FacilityTelemetry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refetch when filters change
  useEffect(() => {
    let isMounted = true
    const filters: FacilityFilterParams = {
      query: searchQuery,
      ownership: selectedOwnership,
      tier: selectedTier,
      hasIcuAvailable: onlyIcuAvailable,
      hasOxygenAvailable: onlyOxygenAvailable,
      hasEmergency24x7: onlyEmergency24x7,
      isAyushmanEmpaneled: onlyAyushman,
      sortBy,
    }

    facilityService
      .getFacilities(filters)
      .then((data) => {
        if (isMounted) {
          setFacilities(data)
          setIsLoading(false)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        console.error(err)
        if (isMounted) {
          setError('Unable to fetch live healthcare facilities. Please try again.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [
    searchQuery,
    selectedOwnership,
    selectedTier,
    onlyIcuAvailable,
    onlyOxygenAvailable,
    onlyEmergency24x7,
    onlyAyushman,
    sortBy,
    refreshKey,
  ])

  // Handle text search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(searchQuery ? { q: searchQuery } : {})
    setRefreshKey((k) => k + 1)
  }

  // Voice Search simulation/browser Web Speech API
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      // Graceful fallback for non-supported browsers
      setVoiceNotice('Voice search not supported in this browser. Please type your query.')
      setTimeout(() => setVoiceNotice(null), 4000)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceNotice('Listening... speak hospital name, doctor, or treatment')
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        setVoiceNotice(`Heard: "${transcript}"`)
        setIsListening(false)
        setSearchParams({ q: transcript })
        setRefreshKey((k) => k + 1)
      }

      recognition.onerror = () => {
        setIsListening(false)
        setVoiceNotice('Could not understand audio. Please try speaking again.')
        setTimeout(() => setVoiceNotice(null), 3000)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch {
      setIsListening(false)
      setVoiceNotice('Audio permissions not granted. Please type query.')
      setTimeout(() => setVoiceNotice(null), 3000)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedOwnership('GOVERNMENT')
    setSelectedTier('ALL')
    setOnlyIcuAvailable(false)
    setOnlyOxygenAvailable(false)
    setOnlyEmergency24x7(false)
    setOnlyAyushman(false)
    setSortBy('RECOMMENDED')
    setSearchParams({})
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedOwnership !== 'GOVERNMENT' ||
    selectedTier !== 'ALL' ||
    onlyIcuAvailable ||
    onlyOxygenAvailable ||
    onlyEmergency24x7 ||
    onlyAyushman

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb / Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/patient/home" className="hover:text-[#0F5147] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Find Care</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Public Healthcare Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Verified public hospitals, community health centres, live bed telemetry & on-duty doctors.
          </p>
        </div>

        {/* Location Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-[#0F5147]" />
          <span>Searching around: <strong className="font-semibold text-slate-900">Varanasi, UP</strong></span>
        </div>
      </div>

      {/* Primary Consumer Search Bar + Voice */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-xs focus-within:border-[#0F5147] focus-within:ring-2 focus-within:ring-[#0F5147]/10 transition-all p-1.5">
          <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital name, specialty (e.g. Cardiology), or doctor..."
            className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            aria-label="Search healthcare facilities"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSearchParams({})
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 touch-target flex items-center justify-center cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all touch-target cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Search by voice'}
            title="Search by voice"
          >
            {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4 text-[#0F5147]" />}
            <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* Search Action */}
          <button
            type="submit"
            className="ml-1.5 px-4 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
          >
            Search
          </button>
        </div>

        {voiceNotice && (
          <div className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            {voiceNotice}
          </div>
        )}
      </form>

      {/* Filter Chips Bar (Mobile scrollable, Desktop aligned) */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Public Healthcare Priority Toggle */}
          <button
            type="button"
            onClick={() => setSelectedOwnership('GOVERNMENT')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer touch-target ${
              selectedOwnership === 'GOVERNMENT'
                ? 'bg-[#0F5147] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Government Public (Priority)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOwnership('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer touch-target ${
              selectedOwnership === 'ALL'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Types
          </button>

          {/* Tier Quick Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as FacilityTier | 'ALL')}
            className="text-xs font-medium py-1.5 px-3 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer"
            aria-label="Filter by facility tier"
          >
            <option value="ALL">All Levels (PHC to Apex)</option>
            <option value="DISTRICT_HOSPITAL">District Hospitals</option>
            <option value="TERTIARY_AIIMS">Tertiary / AIIMS</option>
            <option value="CHC">Community Health Centres (CHCs)</option>
            <option value="PHC">Primary Health Centres (PHCs)</option>
          </select>

          {/* Toggle: ICU beds available */}
          <button
            type="button"
            onClick={() => setOnlyIcuAvailable(!onlyIcuAvailable)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer touch-target ${
              onlyIcuAvailable
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ICU Available
          </button>

          {/* Toggle: 24x7 Emergency */}
          <button
            type="button"
            onClick={() => setOnlyEmergency24x7(!onlyEmergency24x7)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer touch-target ${
              onlyEmergency24x7
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            24x7 Emergency
          </button>

          {/* Toggle: Ayushman PM-JAY */}
          <button
            type="button"
            onClick={() => setOnlyAyushman(!onlyAyushman)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer touch-target ${
              onlyAyushman
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ayushman PM-JAY
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'RECOMMENDED' | 'DISTANCE' | 'AVAILABLE_BEDS')}
            className="text-xs font-semibold py-1.5 px-3 rounded-full border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-none cursor-pointer"
            aria-label="Sort facilities"
          >
            <option value="RECOMMENDED">Public Priority (Default)</option>
            <option value="DISTANCE">Nearest First</option>
            <option value="AVAILABLE_BEDS">Most Beds Available</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Header: Count & Telemetry Note */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong className="text-slate-900 font-bold">{facilities.length}</strong> facilities in Varanasi district
        </span>
        <span className="hidden sm:inline text-slate-400">
          Telemetry synced with District Control Room • Refreshed in real-time
        </span>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-1/4" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-14 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">{error}</h2>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] text-white rounded-xl text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State: No Facilities Matched */}
      {!isLoading && !error && facilities.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              No matching healthcare facilities found
            </h2>
            <p className="text-xs text-slate-500">
              We could not find facilities matching &quot;{searchQuery}&quot; with your active filters.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-[#0F5147] text-white text-xs font-semibold rounded-xl"
            >
              Clear All Filters
            </button>
            <Link
              to="/patient/treatment-matcher"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-xl"
            >
              Try Treatment Matcher
            </Link>
          </div>
        </div>
      )}

      {/* Facility Results Grid */}
      {!isLoading && !error && facilities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {facilities.map((facility, index) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              priorityLabel={index === 0 && sortBy === 'RECOMMENDED' ? 'Top Recommendation' : undefined}
            />
          ))}
        </div>
      )}

      {/* Emergency Help Banner Footer */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-sm font-bold text-red-900 flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            In need of emergency medical transport?
          </h2>
          <p className="text-xs text-red-700">
            Dial 108 for government emergency ambulance or 102 for free pregnant woman / infant transport.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="tel:108"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs touch-target"
          >
            Call 108 (Ambulance)
          </a>
          <a
            href="tel:102"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-red-700 border border-red-300 text-xs font-bold rounded-xl active:scale-95 transition-all touch-target"
          >
            Call 102 (Maternal)
          </a>
        </div>
      </section>
    </div>
  )
}
