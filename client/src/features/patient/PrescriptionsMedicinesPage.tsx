import React, { useState, useEffect, useMemo } from 'react'
import {
  Pill,
  Search,
  ShieldCheck,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react'
import { prescriptionService } from '@/services/prescriptionService'
import type {
  DigitalPrescription,
  MedicineInventoryLocation,
} from '@/types/prescription'
import { DigitalPrescriptionCard } from '@/components/healthcare/DigitalPrescriptionCard'
import { MedicineInventoryCard } from '@/components/healthcare/MedicineInventoryCard'

type ActiveSection = 'PRESCRIPTIONS' | 'INVENTORY_FINDER'

export const PrescriptionsMedicinesPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<DigitalPrescription[]>([])
  const [inventoryLocations, setInventoryLocations] = useState<MedicineInventoryLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Navigation & Search
  const [activeSection, setActiveSection] = useState<ActiveSection>('PRESCRIPTIONS')
  const [searchQuery, setSearchQuery] = useState('')
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<'ALL' | 'JAN_AUSHADHI' | 'HOSPITAL'>('ALL')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [rxList, stockList] = await Promise.all([
          prescriptionService.getPrescriptions(),
          prescriptionService.searchMedicineAvailability(''),
        ])

        if (isMounted) {
          setPrescriptions(rxList)
          setInventoryLocations(stockList)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load prescription data:', err)
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered Inventory Locations
  const filteredLocations = useMemo(() => {
    return inventoryLocations.filter((loc) => {
      // Type filter
      if (facilityTypeFilter === 'JAN_AUSHADHI' && loc.facilityType !== 'JAN_AUSHADHI') {
        return false
      }
      if (
        facilityTypeFilter === 'HOSPITAL' &&
        loc.facilityType !== 'DISTRICT_HOSPITAL_PHARMACY' &&
        loc.facilityType !== 'CHC_PHARMACY'
      ) {
        return false
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchMed = loc.medicineName.toLowerCase().includes(q)
        const matchGen = loc.genericName.toLowerCase().includes(q)
        const matchFac = loc.facilityName.toLowerCase().includes(q)
        const matchAddress = loc.address.toLowerCase().includes(q)

        return matchMed || matchGen || matchFac || matchAddress
      }

      return true
    })
  }, [inventoryLocations, facilityTypeFilter, searchQuery])

  // Handler when clicking "Check Public Stock" inside a prescription card
  const handleSearchMedicine = (genericName: string) => {
    setSearchQuery(genericName)
    setActiveSection('INVENTORY_FINDER')
  }

  const activeRxCount = prescriptions.filter((p) => p.medicines.some((m) => m.status === 'ACTIVE')).length

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading active digital prescriptions & public pharmacy inventory...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <section
        role="region"
        aria-label="Prescriptions & Medicines Header"
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Pill className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                ABDM Digital Prescriptions
              </span>
              <span className="font-mono text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                ABHA: 14-8842-1920-5531
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Prescriptions & Medicine Availability
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              View authorized physician medication orders with exact dosage timetables, and discover verified generic stock across Jan Aushadhi Kendras and public hospital pharmacies.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 text-white border border-white/15 text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Jan Aushadhi Scheme (PMBJP)</span>
            </span>
          </div>
        </div>

        <div
          className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
      </section>

      {/* 2. Main Section Switcher Tabs */}
      <section aria-label="Section Navigation" className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSection('PRESCRIPTIONS')}
            className={`inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'PRESCRIPTIONS'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Active Prescriptions</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeSection === 'PRESCRIPTIONS' ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {activeRxCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('INVENTORY_FINDER')}
            className={`inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'INVENTORY_FINDER'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Find Public Medicine Stock</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeSection === 'INVENTORY_FINDER' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
              {inventoryLocations.length} locations
            </span>
          </button>
        </div>
      </section>

      {/* 3. Section A: Active Prescriptions List */}
      {activeSection === 'PRESCRIPTIONS' && (
        <section aria-label="Active Prescriptions" className="space-y-6">
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <DigitalPrescriptionCard
                key={rx.id}
                prescription={rx}
                onSearchMedicine={handleSearchMedicine}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Section B: Public Medicine Inventory Finder */}
      {activeSection === 'INVENTORY_FINDER' && (
        <section aria-label="Public Medicine Inventory Search" className="space-y-6">
          {/* Search Bar & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Quick Search Input */}
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine, generic name, or pharmacy..."
                aria-label="Search medicine availability"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Pharmacy Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setFacilityTypeFilter('ALL')}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  facilityTypeFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                All Public Pharmacies
              </button>

              <button
                type="button"
                onClick={() => setFacilityTypeFilter('JAN_AUSHADHI')}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  facilityTypeFilter === 'JAN_AUSHADHI'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Jan Aushadhi Kendras Only
              </button>

              <button
                type="button"
                onClick={() => setFacilityTypeFilter('HOSPITAL')}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  facilityTypeFilter === 'HOSPITAL'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Hospital Central Stores
              </button>
            </div>
          </div>

          {/* Quick Pre-Selected Medicine Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Quick Searches:</span>
            {['Atorvastatin', 'Aspirin', 'Telmisartan'].map((drug) => (
              <button
                key={drug}
                type="button"
                onClick={() => setSearchQuery(drug)}
                className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                  searchQuery.toLowerCase() === drug.toLowerCase()
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {drug}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-700 hover:text-amber-900 underline font-semibold ml-2"
              >
                Reset Search
              </button>
            )}
          </div>

          {/* Inventory Locations Grid */}
          {filteredLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map((location, idx) => (
                <MedicineInventoryCard key={idx} location={location} />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white dark:bg-slate-900">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No pharmacy inventory matched your query
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No public distribution centers currently report stock matching &ldquo;{searchQuery}&rdquo;. Try checking surrounding district hospital pharmacies or clearing your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setFacilityTypeFilter('ALL')
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Show All Public Pharmacies</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* 5. Medication Safety Policy & Jan Aushadhi Entitlement */}
      <section
        role="contentinfo"
        aria-label="Medication Safety Policy"
        className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2.5"
      >
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Clinical Prescribing & Generic Medication Quality Guarantee</span>
        </div>
        <p className="leading-relaxed">
          Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) products are tested in NABL-accredited laboratories and guaranteed bioequivalent to commercial branded formulations. HealthConnect does not autonomously prescribe, recommend, or modify medication dosages. Always follow your prescribing doctor&apos;s written orders.
        </p>
      </section>
    </div>
  )
}
