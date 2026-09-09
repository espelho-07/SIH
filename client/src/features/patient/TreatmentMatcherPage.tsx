import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  Mic,
  MicOff,
  PhoneCall,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import type { TreatmentMatchResult } from '@/types/facility'

export const TreatmentMatcherPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('Kidney Dialysis')
  const [isSearching, setIsSearching] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const [results] = useState<TreatmentMatchResult[]>([
    {
      matchScore: 98,
      capabilityMatched: true,
      recommendedReason: 'नेफ्रोलॉजिस्ट (किडनी विशेषज्ञ) ऑन-ड्यूटी + 3 डायलिसिस मशीनें चालू + 4 आईसीयू बेड उपलब्ध',
      estimatedTravelTimeMins: 18,
      facility: {
        id: 'FAC-001',
        name: 'Pandeypur District Hospital (जिला अस्पताल)',
        tier: 'DISTRICT_HOSPITAL',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        address: 'Pandeypur Chowk, Varanasi - 221002',
        distanceKm: 2.8,
        isAyushmanEmpaneled: true,
        hasEmergency24x7: true,
        operationalStatus: 'OPERATIONAL',
        icuBeds: { total: 20, available: 4, occupied: 14, reserved: 2 },
        oxygenBeds: { total: 60, available: 18, occupied: 40, reserved: 2 },
        generalBeds: { total: 200, available: 42, occupied: 155, reserved: 3 },
        specialistsOnDuty: [
          { name: 'Dr. Anita Desai', specialty: 'Nephrologist (किडनी विशेषज्ञ)', isAvailableNow: true },
          { name: 'Dr. R. K. Sharma', specialty: 'Intensive Care (आईसीयू)', isAvailableNow: true },
        ],
        bloodUnitsAvailable: 34,
        lastUpdatedIso: new Date().toISOString(),
        isStale: false,
      },
    },
    {
      matchScore: 82,
      capabilityMatched: true,
      recommendedReason: 'डायलिसिस यूनिट चालू है, लेकिन डॉक्टर ऑन-कॉल उपलब्ध हैं',
      estimatedTravelTimeMins: 28,
      facility: {
        id: 'FAC-002',
        name: 'Shivpur Community Health Centre (सामुदायिक स्वास्थ्य केंद्र)',
        tier: 'CHC',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        address: 'Near Railway Station, Shivpur - 221003',
        distanceKm: 5.4,
        isAyushmanEmpaneled: true,
        hasEmergency24x7: true,
        operationalStatus: 'OPERATIONAL',
        icuBeds: { total: 6, available: 1, occupied: 5, reserved: 0 },
        oxygenBeds: { total: 25, available: 8, occupied: 16, reserved: 1 },
        generalBeds: { total: 50, available: 14, occupied: 36, reserved: 0 },
        specialistsOnDuty: [
          { name: 'Dr. Meena Singh', specialty: 'General Physician', isAvailableNow: true },
        ],
        bloodUnitsAvailable: 12,
        lastUpdatedIso: new Date().toISOString(),
        isStale: false,
      },
    },
  ])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
    }, 400)
  }

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true)
      setTimeout(() => {
        setQuery('Normal Delivery Maternity Hospital')
        setIsRecording(false)
      }, 2000)
    } else {
      setIsRecording(false)
    }
  }

  const commonProcedures = [
    { label: 'डायलिसिस (Dialysis)', q: 'Kidney Dialysis' },
    { label: 'प्रसव / डिलीवरी (Maternity)', q: 'Normal & Cesarean Delivery' },
    { label: 'हड्डी रोग व फ्रैक्चर (Fracture)', q: 'Bone Fracture Ortho' },
    { label: 'शिशु रोग व आईसीयू (Pediatric)', q: 'Pediatric ICU' },
    { label: 'मोतियाबिंद आंख ऑपरेशन (Cataract)', q: 'Cataract Eye Surgery' },
    { label: 'ह्रदय रोग / सीने में दर्द (Cardiac)', q: 'Heart Emergency' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="space-y-1">
        <Link
          to="/patient/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 touch-target mb-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Home)</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
          <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>सत्यापित अस्पताल मिलान (Verified Care Matching)</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          {t('treatment.pageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('treatment.pageSubtitle')}
        </p>
      </div>

      {/* Search Input Form */}
      <Card className="p-4 sm:p-5 bg-white shadow-xs border-teal-200">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="treatment-input" className="block text-xs sm:text-sm font-bold text-slate-800">
            {t('treatment.inputLabel')}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
              <input
                id="treatment-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('treatment.inputPlaceholder')}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={handleVoiceToggle}
                className="min-h-[44px] px-3 font-bold text-xs"
                leftIcon={isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4 text-teal-700" />}
              >
                {isRecording ? 'सुन रहे हैं...' : 'बोलें'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSearching}
                className="font-bold min-h-[44px] flex-1 sm:flex-initial"
              >
                अस्पताल खोजें
              </Button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span className="font-bold text-slate-700">{t('treatment.quickChipsLabel')}</span>
            {commonProcedures.map((proc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(proc.q)}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer touch-target ${
                  query === proc.q
                    ? 'bg-teal-700 text-white border-teal-700 font-bold'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border-slate-200'
                }`}
              >
                {proc.label}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Reassurance Banner */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block">100% पारदर्शी एवं जांचे-परखे परिणाम:</strong>
          <span>अस्पतालों की रैंकिंग सिर्फ दूरी से नहीं, बल्कि विशेषज्ञ डॉक्टर की वास्तविक मौजूदगी और चालू बेड की जांच के आधार पर की जाती है।</span>
        </div>
      </div>

      {/* Ranked Results Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            सिफारिश किए गए अस्पताल ({results.length} मिले)
          </h2>
          <span className="text-xs text-slate-500">सुविधा मिलान स्कोर के आधार पर</span>
        </div>

        {results.map((res, index) => {
          const { facility, matchScore, recommendedReason, estimatedTravelTimeMins } = res
          return (
            <Card key={facility.id} className="p-4 sm:p-5 border-slate-200/90 hover:border-teal-400 transition-all space-y-3.5">
              {/* Top Bar: Match Score + Tier + Freshness */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {matchScore}% {t('treatment.matchScore')}
                    </span>
                    <Badge variant="default" className="text-[10px]">
                      {facility.tier.replace('_', ' ')}
                    </Badge>
                    {facility.isAyushmanEmpaneled && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {t('treatment.ayushmanCard')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
                    {index + 1}. {facility.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {facility.address} &bull; <strong className="text-slate-800">{facility.distanceKm} km</strong> (~{estimatedTravelTimeMins} मिनट सड़क मार्ग से)
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

              {/* "Why choose this hospital?" Checklist */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <strong className="block font-bold text-slate-900">
                  {t('treatment.whyHospital')} (यह अस्पताल क्यों चुनें?)
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('treatment.specialistReady')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{facility.icuBeds.available} आईसीयू व {facility.oxygenBeds.available} ऑक्सीजन बेड खाली हैं</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>आयुष्मान कार्ड 100% स्वीकार्य</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>लगभग {estimatedTravelTimeMins} मिनट की दूरी</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 mt-2">
                  <strong>टिप्पणी:</strong> {recommendedReason}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`${facility.name} के आपातकालीन रिसेप्शन नंबर पर कॉल मिलाया जा रहा है...`)}
                  leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  {t('treatment.callDeskBtn')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/patient/queue')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="text-xs font-bold"
                >
                  {t('treatment.bookTokenBtn')}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

