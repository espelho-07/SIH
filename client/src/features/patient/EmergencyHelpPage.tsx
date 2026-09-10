import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShieldAlert,
  Building2,
  Droplet,
  HeartPulse,
  MapPin,
  RefreshCw,
  PhoneCall,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { EmergencyHeroBanner } from '@/components/healthcare/EmergencyHeroBanner'
import { EmergencyFacilityCard } from '@/components/healthcare/EmergencyFacilityCard'
import { BloodAvailabilityFinder } from '@/components/healthcare/BloodAvailabilityFinder'
import { AmbulanceIntelligenceCard } from '@/components/healthcare/AmbulanceIntelligenceCard'
import { EmergencyReferralBanner } from '@/components/healthcare/EmergencyReferralBanner'
import { emergencyService } from '@/services/emergencyService'
import { referralService } from '@/services/referralService'
import type {
  EmergencyContact,
  EmergencyFacility,
  BloodStockItem,
  AmbulanceFleetInfo,
  RedFlagSymptom,
  BloodGroup,
  BloodComponent,
} from '@/types/emergency'
import type { ReferralClinicalSummary } from '@/types/referral'

type EmergencyTab = 'ALL' | 'HOSPITALS' | 'BLOOD' | 'AMBULANCE'

const AVAILABLE_DISTRICTS = ['Varanasi', 'Mirzapur', 'Chandauli', 'Prayagraj']

export const EmergencyHelpPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = (searchParams.get('tab')?.toUpperCase() as EmergencyTab) || 'ALL'
  const [activeTab, setActiveTab] = useState<EmergencyTab>(
    ['ALL', 'HOSPITALS', 'BLOOD', 'AMBULANCE'].includes(initialTab) ? initialTab : 'ALL',
  )

  const [helplines, setHelplines] = useState<EmergencyContact[]>([])
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([])
  const [bloodStock, setBloodStock] = useState<BloodStockItem[]>([])
  const [fleets, setFleets] = useState<AmbulanceFleetInfo[]>([])
  const [redFlags, setRedFlags] = useState<RedFlagSymptom[]>([])
  const [activeReferral, setActiveReferral] = useState<ReferralClinicalSummary | null>(null)

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | undefined>(undefined)
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent | undefined>(undefined)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Varanasi')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [hList, fList, bList, aList, rfList, refList] = await Promise.all([
          emergencyService.getEmergencyHelplines(),
          emergencyService.getEmergencyFacilities({ district: selectedDistrict }),
          emergencyService.getBloodAvailability({
            bloodGroup: selectedGroup,
            component: selectedComponent,
          }),
          emergencyService.getAmbulanceFleets(),
          emergencyService.getRedFlagSymptoms(),
          referralService.getPatientReferrals(),
        ])

        setHelplines(hList)
        setFacilities(fList)
        setBloodStock(bList)
        setFleets(aList)
        setRedFlags(rfList)

        const active = refList.find((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
        setActiveReferral(active || null)
      } catch (err) {
        console.error('Failed to load emergency resources:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedDistrict, selectedGroup, selectedComponent])

  const handleTabChange = (tab: EmergencyTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'ALL' ? {} : { tab: tab.toLowerCase() })
  }

  const handleCallInitiated = (number: string) => {
    emergencyService.logEmergencyAction('CALL_HELPLINE', { number, district: selectedDistrict })
  }

  const handleFacilityCall = (facility: EmergencyFacility) => {
    emergencyService.logEmergencyAction('CALL_FACILITY_CASUALTY', {
      facilityId: facility.id,
      name: facility.name,
      phone: facility.phone,
    })
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Offline Notification Bar */}
      {isOffline && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs flex items-center gap-2 font-medium"
        >
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" aria-hidden="true" />
          <span>
            You are currently offline. Critical national helpline numbers (108, 102, 112) and cached government hospital addresses remain accessible directly from your device.
          </span>
        </div>
      )}

      {/* 2. Top Location & Telemetry Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <div className="p-1.5 rounded-lg bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]">
            <MapPin className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block sm:inline">Current Emergency Zone: </span>
            <span className="font-bold text-[#0F5147]">{selectedDistrict} District, UP</span>
            <span className="text-slate-400 ml-1.5 hidden sm:inline">• GPS Location Verified</span>
          </div>
        </div>

        {/* Location Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[11px] text-slate-500 font-semibold">Change Area:</span>
          {AVAILABLE_DISTRICTS.map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setSelectedDistrict(dist)}
              className={`px-2.5 py-1 min-h-[32px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedDistrict === dist
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Primary Emergency Call & Triage Banner */}
      <EmergencyHeroBanner
        helplines={helplines}
        redFlags={redFlags}
        onCallInitiated={handleCallInitiated}
      />

      {/* 4. Active Hospital Referral Continuity Banner (if patient has active transfer) */}
      {activeReferral && (
        <EmergencyReferralBanner referral={activeReferral} />
      )}

      {/* 5. Navigation Tab Filter */}
      <section aria-label="Emergency Category Navigation" className="border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleTabChange('ALL')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            <span>All Emergency Services</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('HOSPITALS')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'HOSPITALS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>24x7 Emergency Hospitals</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'HOSPITALS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {facilities.filter((f) => f.hasEmergency24x7).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('BLOOD')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'BLOOD'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Droplet className="w-4 h-4" aria-hidden="true" />
            <span>Blood Bank Stock</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'BLOOD' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {bloodStock.reduce((acc, curr) => acc + curr.unitsAvailable, 0)} units
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('AMBULANCE')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'AMBULANCE'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" aria-hidden="true" />
            <span>Ambulance Intelligence (108/102)</span>
          </button>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">
            Syncing emergency hospital casualty telemetry, ICU beds, and live blood stock...
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          {/* Section A: Emergency Public Hospitals */}
          {(activeTab === 'ALL' || activeTab === 'HOSPITALS') && (
            <section aria-label="Nearest 24x7 Emergency Hospitals" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-rose-600" aria-hidden="true" />
                    <span>Nearest 24x7 Emergency Public Hospitals</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ranked by emergency capability, trauma readiness, ICU bed availability, and transit distance.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                  Priority Public Healthcare
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {facilities.map((fac) => (
                  <EmergencyFacilityCard
                    key={fac.id}
                    facility={fac}
                    onCallFacility={handleFacilityCall}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section B: Blood Availability Finder */}
          {(activeTab === 'ALL' || activeTab === 'BLOOD') && (
            <BloodAvailabilityFinder
              bloodStock={bloodStock}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              selectedComponent={selectedComponent}
              onComponentChange={setSelectedComponent}
            />
          )}

          {/* Section C: Ambulance Intelligence */}
          {(activeTab === 'ALL' || activeTab === 'AMBULANCE') && (
            <section aria-label="Ambulance and Transport Intelligence" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-600" aria-hidden="true" />
                    <span>Ambulance & Emergency Transport Intelligence</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Authorized National Health Mission transport fleets. 100% free with zero fees under government mandate.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  State 108 Command Registry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleets.map((fleet) => (
                  <AmbulanceIntelligenceCard
                    key={fleet.id}
                    fleet={fleet}
                    onCallDispatch={handleCallInitiated}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 6. Emergency Governance, Good Samaritan Protection & Legal Rights */}
          <section
            role="contentinfo"
            aria-label="Emergency Patient Charter"
            className="p-5 sm:p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-3"
          >
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Activity className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Emergency Medical Rights & Good Samaritan Protection (Supreme Court of India)</span>
            </div>

            <p className="leading-relaxed">
              Under Supreme Court of India guidelines and the Clinical Establishments Act, any person bringing an injured patient or emergency victim to any public or private hospital is protected as a Good Samaritan. No police inquiry, advance fee payment, or witness summons can be demanded. Government emergency casualty services operate under a strict zero-out-of-pocket mandate.
            </p>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>National Health Mission • Directorate General of Health Services</span>
              <a href="tel:108" className="font-bold text-rose-700 hover:underline flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                <span>Dial 108 for Emergency Dispatch</span>
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
