import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  Phone,
  PhoneCall,
  Navigation,
  Share2,
  ShieldCheck,
  Stethoscope,
  Activity,
  Droplet,
  Pill,
  ArrowLeft,
  CheckCircle2,
  FileText,
  UserCheck,
} from 'lucide-react'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import { FacilityAvailabilityBadge } from '@/components/healthcare/FacilityAvailabilityBadge'
import { ResourceFreshnessBadge } from '@/components/healthcare/ResourceFreshnessBadge'
import { facilityService } from '@/services/facilityService'
import type { FacilityDetail } from '@/types/facility'

export const FacilityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [facility, setFacility] = useState<FacilityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPARTMENTS' | 'DIAGNOSTICS' | 'MEDICINES' | 'BLOOD'>('OVERVIEW')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    let isMounted = true
    if (id) {
      facilityService.getFacilityById(id).then((data) => {
        if (isMounted) {
          setFacility(data)
          setIsLoading(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [id])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Healthcare Facility Not Found</h1>
        <p className="text-xs text-slate-500">
          The facility you requested may have been relocated or is not registered in the current district network.
        </p>
        <Link
          to="/patient/find-care"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facility Directory</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl transition-colors cursor-pointer"
          aria-label="Share facility information"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Facility Header Hero Card */}
      <header className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <GovernmentHealthcareBadge ownership={facility.ownership} tier={facility.tier} />
            {facility.isAyushmanEmpaneled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Ayushman Bharat (PM-JAY) Cashless
              </span>
            )}
          </div>

          <FacilityAvailabilityBadge status={facility.operationalStatus} />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {facility.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{facility.address}</span>
          </p>
        </div>

        {/* Operating Hours & Distance Banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{facility.operatingHours}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#0F5147]" />
            <span className="font-semibold text-slate-900">
              {facility.distanceKm} km away (~{facility.estimatedTravelTimeMins} mins travel)
            </span>
          </div>

          <ResourceFreshnessBadge lastUpdatedIso={facility.lastUpdatedIso} isStale={facility.isStale} />
        </div>

        {/* Quick Action Button Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <Link
            to={`/patient/appointments/book?facilityId=${facility.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
          >
            <Calendar className="w-4 h-4" />
            <span>Book OPD Appointment</span>
          </Link>

          <Link
            to="/patient/queue"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl active:scale-95 transition-all touch-target"
          >
            <Clock className="w-4 h-4 text-slate-600" />
            <span>Get Live OPD Token</span>
          </Link>

          <a
            href={`tel:${facility.phone}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl active:scale-95 transition-all touch-target"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>Call Facility ({facility.phone.split(' ')[2]})</span>
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${facility.name}, ${facility.address}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl active:scale-95 transition-all touch-target"
          >
            <Navigation className="w-4 h-4 text-[#0F5147]" />
            <span>Get Directions</span>
          </a>

          <a
            href="tel:108"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl active:scale-95 transition-all ml-auto touch-target"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>Emergency 108</span>
          </a>
        </div>
      </header>

      {/* Real-time Telemetry Census Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-800 uppercase text-[10px]">ICU Beds</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">
            {facility.icuBeds.available}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">
            of {facility.icuBeds.total} total ICU beds
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-teal-800 uppercase text-[10px]">Oxygen Beds</span>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">
            {facility.oxygenBeds.available}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">
            of {facility.oxygenBeds.total} piped O2 beds
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 uppercase text-[10px]">OPD Waiting</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">
            ~{facility.liveQueueOverview.averageWaitMins}m
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Token {facility.liveQueueOverview.currentServingToken} now in room
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-rose-700 uppercase text-[10px]">Blood Bank</span>
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">
            {facility.bloodBankDetails.totalUnits}
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            tested units in stock
          </span>
        </div>
      </section>

      {/* Progressive Tabbed Sections */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'Clinical Overview', icon: Activity },
            { id: 'DEPARTMENTS', label: `Departments (${facility.departments.length})`, icon: Stethoscope },
            { id: 'DIAGNOSTICS', label: `Diagnostics (${facility.diagnosticEquipment.length})`, icon: FileText },
            { id: 'MEDICINES', label: `Essential Medicines (${facility.medicineStockPercentage}%)`, icon: Pill },
            { id: 'BLOOD', label: 'Blood Availability', icon: Droplet },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer touch-target ${
                  isActive
                    ? 'border-[#0F5147] text-[#0F5147] bg-[#F2F9F8]/60'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                  Doctors & Specialists On Duty Today
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {facility.specialistsOnDuty.map((spec, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{spec.name}</h3>
                          <p className="text-[11px] text-slate-500">{spec.specialty}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          spec.isAvailableNow
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {spec.isAvailableNow ? 'Available Now' : 'Off Shift'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public Trust & Free Services Box */}
              <div className="p-4 rounded-xl bg-[#E6F4F1] border border-[#B2DFDB] space-y-2">
                <h2 className="text-xs font-bold text-[#004D40] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5147]" />
                  Public Healthcare Assurance
                </h2>
                <p className="text-xs text-[#004D40]/90 leading-relaxed">
                  As a certified public institution under the National Health Mission, all primary OPD consultations,
                  emergency triage, essential laboratory tests, and institutional deliveries are conducted free of charge
                  or at nominal government rates.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 'DEPARTMENTS' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Operating clinical outpatient and inpatient departments with scheduled consultation timings:
              </p>
              <div className="space-y-3">
                {facility.departments.map((dept) => (
                  <div key={dept.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900">{dept.name}</h2>
                      <span className="text-xs font-medium text-slate-500">{dept.opdTimings}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {dept.doctorsOnDuty.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                          <div>
                            <span className="font-semibold text-slate-900">{doc.name}</span>
                            <span className="text-slate-500 ml-1.5">({doc.qualification})</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-slate-500 font-mono">{doc.roomNumber}</span>
                            <span className="text-emerald-700 font-medium">● Available</span>
                            <Link
                              to={`/patient/appointments/book?facilityId=${facility.id}&departmentId=${dept.id}&doctorId=${doc.id}`}
                              className="px-2.5 py-1 bg-[#F2F9F8] hover:bg-[#D0EAE6] text-[#0F5147] border border-[#D0EAE6] rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Book Slot
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS */}
          {activeTab === 'DIAGNOSTICS' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Live verification of medical diagnostic equipment and laboratory capabilities:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {facility.diagnosticEquipment.map((eq, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-900">{eq.name}</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {eq.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Report turnaround: ~{eq.turnaroundTimeMins} mins</span>
                      <span>Verified: {eq.lastTested}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDICINES */}
          {activeTab === 'MEDICINES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-emerald-950">Essential Medicine Stock Availability</span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">Supplied under Jan Aushadhi & State Drug Warehousing</p>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-900">{facility.medicineStockPercentage}%</span>
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2">Common Medicines in Stock:</h2>
                <div className="flex flex-wrap gap-2">
                  {facility.commonMedicinesAvailable.map((med, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      ✓ {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLOOD BANK */}
          {activeTab === 'BLOOD' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-rose-950">Blood Bank Status: Operational</span>
                  <p className="text-[11px] text-rose-800 mt-0.5">Tested whole blood & packed red blood cell units</p>
                </div>
                <span className="text-xl font-bold font-mono text-rose-900">{facility.bloodBankDetails.totalUnits} Units</span>
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2">Available Blood Groups:</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.entries(facility.bloodBankDetails.groups).map(([group, units]) => (
                    <div key={group} className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                      <span className="text-sm font-bold text-slate-900 block">{group}</span>
                      <span className="text-xs font-semibold text-rose-700 font-mono">{units} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
