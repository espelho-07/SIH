import React, { useState, useEffect, useMemo } from 'react'
import {
  Activity,
  Search,
  ShieldCheck,
  RefreshCw,
  X,
  MapPin,
} from 'lucide-react'
import { diagnosticService } from '@/services/diagnosticService'
import type {
  DiagnosticOrder,
  DiagnosticReport,
  DiagnosticFacilityMatch,
} from '@/types/diagnostic'
import { DiagnosticOrderCard } from '@/components/healthcare/DiagnosticOrderCard'
import { DiagnosticNextActionBanner } from '@/components/healthcare/DiagnosticNextActionBanner'
import { LabReportViewer } from '@/components/healthcare/LabReportViewer'

type TabFilter = 'ALL' | 'ACTION_REQUIRED' | 'REPORTS_AVAILABLE' | 'PROCESSING'

export const DiagnosticsCenterPage: React.FC = () => {
  const [orders, setOrders] = useState<DiagnosticOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Report modal state
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Facility finder drawer state
  const [selectedOrderForFacility, setSelectedOrderForFacility] = useState<DiagnosticOrder | null>(null)
  const [matchedFacilities, setMatchedFacilities] = useState<DiagnosticFacilityMatch[]>([])
  const [isFacilityDrawerOpen, setIsFacilityDrawerOpen] = useState(false)

  // Load orders
  useEffect(() => {
    let isMounted = true

    diagnosticService
      .getDiagnosticOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load diagnostic orders:', err)
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === 'ACTION_REQUIRED') {
        if (!order.patientActionRequired && order.status !== 'SAMPLE_COLLECTION_PENDING') {
          return false
        }
      } else if (activeTab === 'REPORTS_AVAILABLE') {
        if (order.status !== 'REPORT_READY' && order.status !== 'REVIEWED') {
          return false
        }
      } else if (activeTab === 'PROCESSING') {
        if (order.status !== 'PROCESSING' && order.status !== 'SAMPLE_COLLECTED') {
          return false
        }
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTest = order.testName.toLowerCase().includes(q)
        const matchDoctor = order.orderingDoctorName.toLowerCase().includes(q)
        const matchFacility = order.orderingFacilityName.toLowerCase().includes(q)
        const matchIndication = order.clinicalIndication.toLowerCase().includes(q)
        const matchCode = order.orderCode.toLowerCase().includes(q)

        return matchTest || matchDoctor || matchFacility || matchIndication || matchCode
      }

      return true
    })
  }, [orders, activeTab, searchQuery])

  // View report click handler
  const handleViewReport = async (order: DiagnosticOrder) => {
    try {
      const report = await diagnosticService.getReportByOrderId(order.id)
      setSelectedReport(report)
      setIsReportOpen(true)
    } catch (err) {
      console.error('Failed to load report:', err)
    }
  }

  // Find facility click handler
  const handleFindFacility = async (order: DiagnosticOrder) => {
    setSelectedOrderForFacility(order)
    try {
      const matches = await diagnosticService.findFacilitiesForTest(order.testName)
      setMatchedFacilities(matches)
      setIsFacilityDrawerOpen(true)
    } catch (err) {
      console.error('Failed to match facilities:', err)
    }
  }

  const counts = {
    all: orders.length,
    actionRequired: orders.filter((o) => o.patientActionRequired || o.status === 'SAMPLE_COLLECTION_PENDING').length,
    reportsAvailable: orders.filter((o) => o.status === 'REPORT_READY' || o.status === 'REVIEWED').length,
    processing: orders.filter((o) => o.status === 'PROCESSING' || o.status === 'SAMPLE_COLLECTED').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">
          Loading diagnostic requisitions & laboratory investigations...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <section
        role="region"
        aria-label="Diagnostic Center Header"
        className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]">
                <Activity className="w-3.5 h-3.5 text-[#0F5147]" aria-hidden="true" />
                ABDM Diagnostic Portal
              </span>
              <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                ABHA: 14-8842-1920-5531
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Diagnostic Center & Lab Investigations
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Track doctor-prescribed blood tests, digital ECGs, and imaging across Varanasi district public hospitals and community health centres.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>100% Subsidized (NHM)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Next Best Action Banner */}
      <DiagnosticNextActionBanner orders={orders} onViewReport={handleViewReport} />

      {/* 3. Search & Category Filters */}
      <section aria-label="Diagnostic Filters and Search" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>All Requisitions</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100'}`}>
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ACTION_REQUIRED')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ACTION_REQUIRED'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Action Needed</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeTab === 'ACTION_REQUIRED' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
                {counts.actionRequired}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REPORTS_AVAILABLE')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'REPORTS_AVAILABLE'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Reports Ready</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeTab === 'REPORTS_AVAILABLE' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
                {counts.reportsAvailable}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PROCESSING')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'PROCESSING'
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Processing</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeTab === 'PROCESSING' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-900'}`}>
                {counts.processing}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test, doctor, facility..."
              aria-label="Search diagnostic tests"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4 pt-2">
            {filteredOrders.map((order) => (
              <DiagnosticOrderCard
                key={order.id}
                order={order}
                onViewReport={handleViewReport}
                onFindFacility={handleFindFacility}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Activity className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No diagnostic requisitions found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tests match your current tab or search criteria. Reset your filters to view all orders.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL')
                setSearchQuery('')
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. Clinical Safety & National Health Mission Policy */}
      <section
        role="contentinfo"
        aria-label="Diagnostic Safety Policy"
        className="p-5 sm:p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2.5"
      >
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Diagnostic Quality Governance & National Health Mission (NHM) Standards</span>
        </div>
        <p className="leading-relaxed">
          Diagnostic equipment operational status is verified in real-time through hospital bio-medical engineering telemetry. All tests are conducted under zero out-of-pocket charges at empanelled government public healthcare centres. HealthConnect does not autonomously diagnose medical conditions or issue clinical decisions.
        </p>
      </section>

      {/* 5. Lab Report Viewer Modal */}
      <LabReportViewer
        report={selectedReport}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* 6. Facility Matching Drawer for Sample Collection */}
      {isFacilityDrawerOpen && selectedOrderForFacility && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="facility-match-title"
        >
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFacilityDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 id="facility-match-title" className="font-bold text-slate-900 text-base">
                    Verified Diagnostic Facilities
                  </h3>
                  <p className="text-xs text-slate-500">
                    Performing: {selectedOrderForFacility.testName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFacilityDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {matchedFacilities.map((fac) => (
                  <div
                    key={fac.facilityId}
                    className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {fac.facilityTier}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          {fac.facilityName}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          <span>{fac.address} • <strong>{fac.distanceKm} km</strong></span>
                        </p>
                      </div>

                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Operational
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/80 space-y-1">
                      <div>Equipment: <strong className="text-slate-800">{fac.equipmentName}</strong></div>
                      <div>Sample Hours: {fac.sampleCollectionHours}</div>
                      <div>Turnaround: ~{fac.turnaroundTimeHours} hours</div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700">
                        100% Free under NHM
                      </span>

                      <button
                        type="button"
                        onClick={async () => {
                          await diagnosticService.scheduleSampleCollection(
                            selectedOrderForFacility.id,
                            fac.facilityId,
                            fac.nextAvailableSlot,
                          )
                          const updated = await diagnosticService.getDiagnosticOrders()
                          setOrders(updated)
                          setIsFacilityDrawerOpen(false)
                        }}
                        className="px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                      >
                        Confirm Collection Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
