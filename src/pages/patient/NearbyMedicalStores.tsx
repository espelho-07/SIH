import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MedicalStore, StoreMedicineItem } from '@/types/medicalStore';
import { INITIAL_MEDICAL_STORES } from '@/mock/medicalStoresData';
import { INITIAL_HEALTH_RECORD, INITIAL_PRESCRIPTIONS } from '@/mock/mockData';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import {
  Search,
  Pill,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Building2,
  Navigation,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Percent,
  List,
  Map as MapIcon,
  X,
  FileText,
  BadgeCheck,
  ShoppingBag,
  Zap,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

const POPULAR_MEDICINE_QUICK_SEARCH = [
  'Paracetamol 650mg',
  'Pantoprazole 40mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Sorbitrate 5mg',
  'Aspirin 75mg',
  'Amoxicillin 625mg',
  'Cetirizine 10mg',
];

export const NearbyMedicalStores: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'ALL' | 'JAN_AUSHADHI' | 'LIVE_API' | '24X7' | 'OPEN_NOW'
  >('ALL');
  const [sortBy, setSortBy] = useState<'JAN_AUSHADHI_FIRST' | 'DISTANCE' | 'DISCOUNT'>(
    'JAN_AUSHADHI_FIRST'
  );
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  // Active citizen's prescribed medicines from ABHA vault
  const patientPrescriptions = INITIAL_PRESCRIPTIONS;
  const activeRxMedicines = patientPrescriptions[0]?.items || [
    { id: '1', medicineName: 'Tab. Sorbitrate 5mg', frequency: 'SOS' },
    { id: '2', medicineName: 'Tab. Aspirin 75mg', frequency: '1-0-0' },
    { id: '3', medicineName: 'Tab. Pantoprazole 40mg', frequency: '1-0-0' },
  ];

  const [activePrescriptionFilter, setActivePrescriptionFilter] = useState(false);

  // Reservation Modal State
  const [reservingStore, setReservingStore] = useState<MedicalStore | null>(null);
  const [reservedMedicine, setReservedMedicine] = useState<StoreMedicineItem | null>(null);
  const [reservationName, setReservationName] = useState('Rameshwar Sharma');
  const [reservationPhone, setReservationPhone] = useState('9876543210');
  const [reservationConfirmedCode, setReservationConfirmedCode] = useState<string | null>(null);

  // Filtered & Sorted Stores
  const filteredStores = useMemo(() => {
    let result = [...INITIAL_MEDICAL_STORES];

    // Filter by type
    if (selectedFilter === 'JAN_AUSHADHI') {
      result = result.filter((s) => s.isJanAushadhi);
    } else if (selectedFilter === 'LIVE_API') {
      result = result.filter((s) => s.hasLiveApi);
    } else if (selectedFilter === '24X7') {
      result = result.filter((s) => s.timings.includes('24'));
    } else if (selectedFilter === 'OPEN_NOW') {
      result = result.filter((s) => s.isOpenNow);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const matchesStoreName = s.name.toLowerCase().includes(q);
        const matchesArea = s.area.toLowerCase().includes(q) || s.fullAddress.toLowerCase().includes(q);
        const matchesMedicine = s.stockCatalog.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.genericName.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        );
        return matchesStoreName || matchesArea || matchesMedicine;
      });
    }

    // Active Prescription Filter: matching stores having any of the active Rx medicines
    if (activePrescriptionFilter) {
      const rxKeywords = activeRxMedicines.map((m) =>
        m.medicineName.toLowerCase().replace('tab.', '').replace('cap.', '').trim().slice(0, 8)
      );

      result = result.filter((s) => {
        if (!s.hasLiveApi) return true; // Keep local stores for calling
        return s.stockCatalog.some((item) =>
          rxKeywords.some((k) => item.name.toLowerCase().includes(k))
        );
      });
    }

    // Sorting (User Priority: ALWAYS JAN AUSHADHI FIRST, THEN DISTANCE)
    result.sort((a, b) => {
      if (sortBy === 'JAN_AUSHADHI_FIRST') {
        // 1. Jan Aushadhi Kendra ALWAYS takes top priority
        if (a.isJanAushadhi && !b.isJanAushadhi) return -1;
        if (!a.isJanAushadhi && b.isJanAushadhi) return 1;
        // 2. Secondary sort by distance
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === 'DISTANCE') {
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === 'DISCOUNT') {
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      }
      return 0;
    });

    return result;
  }, [searchQuery, selectedFilter, sortBy, activePrescriptionFilter, activeRxMedicines]);

  // Leaflet Map Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (viewMode !== 'MAP' || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [23.2268, 72.6515], // Gandhinagar center
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | Sanjeevani GIS Medical Network',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add Markers
    filteredStores.forEach((store) => {
      const isGovt = store.isJanAushadhi;
      const markerColor = isGovt ? '#0f766e' : store.hasLiveApi ? '#0284c7' : '#64748b';

      const customIcon = L.divIcon({
        className: 'custom-medical-pin',
        html: `
          <div style="
            background: ${markerColor};
            color: white;
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${isGovt ? '🏛 PMBJP' : '💊 Pharmacy'}</span>
            <span>(${store.distanceKm}km)</span>
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      const marker = L.marker([store.coordinates.lat, store.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${store.name}</strong>
          <span style="font-size: 11px; color: #64748b;">${store.area} • ${store.distanceKm} km away</span>
          <p style="font-size: 11px; margin-top: 6px; font-weight: bold; color: ${store.isOpenNow ? '#059669' : '#dc2626'}">
            ● ${store.isOpenNow ? 'Open Now' : 'Closed'} (${store.timings})
          </p>
          <div style="margin-top: 8px;">
            <a href="tel:${store.phone}" style="display: inline-block; background: #0f766e; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: bold;">
              📞 Call Store
            </a>
          </div>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewMode, filteredStores]);

  // Handle Reservation Submit
  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `PMBJP-HOLD-${Math.floor(1000 + Math.random() * 9000)}`;
    setReservationConfirmedCode(code);
  };

  return (
    <div className="space-y-4">
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <PageHeader
        title="Nearby Medical Stores & Jan Aushadhi Kendras"
        subtitle="Check live medicine stock at Government Jan Aushadhi Kendras (up to 80% cheaper) and verify stock at local private chemists."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Medical Stores' },
        ]}
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Map View</span>
            </button>
          </div>
        }
      />

      {/* ================================================== */}
      {/* SEARCH, FILTERS & ACTIVE PRESCRIPTION BUTTON */}
      {/* ================================================== */}
      <Card className="border-slate-200 bg-white shadow-2xs">
        <CardContent className="p-4 space-y-3.5">
          {/* Top Search Row */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine (e.g. Paracetamol, Metformin, Pantoprazole) or store name / sector..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Check from Active Prescription Button */}
            <button
              type="button"
              onClick={() => {
                setActivePrescriptionFilter(!activePrescriptionFilter);
                if (!activePrescriptionFilter) {
                  setSearchQuery('');
                }
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activePrescriptionFilter
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>
                {activePrescriptionFilter ? '✓ Checking Active Prescription' : 'Check from My Active Prescription'}
              </span>
            </button>
          </div>

          {/* Quick Medicine Pill Search */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Pill className="h-3.5 w-3.5 text-teal-700" />
              Popular Medicines:
            </span>
            {POPULAR_MEDICINE_QUICK_SEARCH.map((med, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(med.split(' ')[0]);
                  setActivePrescriptionFilter(false);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-colors ${
                  searchQuery.toLowerCase().includes(med.split(' ')[0].toLowerCase())
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border-slate-200'
                }`}
              >
                + {med}
              </button>
            ))}
          </div>

          {/* Active Prescription Notice Banner if enabled */}
          {activePrescriptionFilter && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 flex items-start gap-2.5 text-xs text-emerald-950">
              <Sparkles className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Filtering stores stocking your active prescription medicines:</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeRxMedicines.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-md bg-white border border-emerald-300 px-2 py-0.5 text-[11px] font-semibold text-emerald-900"
                    >
                      {m.medicineName} ({m.frequency})
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePrescriptionFilter(false)}
                className="text-emerald-800 hover:text-emerald-950 text-xs font-bold underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Filters & Sorting Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 pt-3 text-xs">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Stores ({INITIAL_MEDICAL_STORES.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('JAN_AUSHADHI')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'JAN_AUSHADHI'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <span>🏛 Jan Aushadhi (PMBJP)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('LIVE_API')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedFilter === 'LIVE_API'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🟢 Live API Connected
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('24X7')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedFilter === '24X7'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                24x7 Emergency
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <span className="text-slate-500 font-semibold text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="JAN_AUSHADHI_FIRST">★ Jan Aushadhi First, then Nearest</option>
                <option value="DISTANCE">Nearest First (Distance)</option>
                <option value="DISCOUNT">Highest Generic Savings (%)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* VIEW MODE 1: MAP VIEW */}
      {/* ================================================== */}
      {viewMode === 'MAP' && (
        <Card className="border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-teal-700" />
              <span>Interactive Map: Medical Stores in Gandhinagar</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-teal-800">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
                Jan Aushadhi (Govt)
              </span>
              <span className="flex items-center gap-1 font-bold text-sky-800">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                Live API Private
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                Local Chemist
              </span>
            </div>
          </div>
          <div ref={mapContainerRef} className="h-[460px] w-full" />
        </Card>
      )}

      {/* ================================================== */}
      {/* VIEW MODE 2: LIST VIEW OF STORES */}
      {/* ================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1 text-slate-500">
          <span>Showing <strong>{filteredStores.length}</strong> medical stores near your location</span>
          <span className="text-[11px] text-teal-800 font-semibold">
            ● Gandhinagar District Base • GPS: Sector 21
          </span>
        </div>

        {filteredStores.length === 0 ? (
          <Card className="p-12 text-center border-slate-200 bg-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No medical stores found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No medical stores match your search query "{searchQuery}". Try clearing filters or searching for generic terms like "Paracetamol" or "Jan Aushadhi".
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('ALL');
                setActivePrescriptionFilter(false);
              }}
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
            >
              Reset All Filters
            </Button>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {filteredStores.map((store) => {
              // Find matching medicine if search query is active
              const matchedMedicine = searchQuery.trim()
                ? store.stockCatalog.find(
                    (m) =>
                      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : null;

              return (
                <Card
                  key={store.id}
                  className={`overflow-hidden transition-all duration-200 ${
                    store.isJanAushadhi
                      ? 'border-teal-300 bg-gradient-to-r from-teal-50/40 via-white to-emerald-50/20 shadow-xs hover:border-teal-400'
                      : 'border-slate-200 bg-white shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* Top Row: Store Badge & Live Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {store.isJanAushadhi && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-800 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                              <Building2 className="h-3 w-3 text-amber-300" />
                              PMBJP Jan Aushadhi Kendra (Govt.)
                            </span>
                          )}

                          {store.type === 'HOSPITAL_PHARMACY' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-900 px-2.5 py-0.5 text-[10px] font-black uppercase border border-blue-200">
                              Hospital Attached OPD Dispensary
                            </span>
                          )}

                          {store.type === '24X7_EMERGENCY' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-black uppercase border border-rose-200">
                              24x7 Emergency Chemist
                            </span>
                          )}

                          {/* Live API vs Call Badge */}
                          {store.hasLiveApi ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Live Stock Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold border border-amber-300">
                              <Phone className="h-3 w-3 text-amber-700" />
                              Call to Verify Stock
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {store.name}
                        </h3>

                        <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <MapPin className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                            {store.distanceKm} km away • {store.area}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {store.timings}
                          </span>
                        </p>
                      </div>

                      {/* Right Metric: Discount / Savings */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0">
                        {store.discountPercentage && (
                          <div className="rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1 text-center shadow-2xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 block">
                              {store.isJanAushadhi ? 'Generic Savings' : 'Store Discount'}
                            </span>
                            <span className="text-sm sm:text-base font-black text-emerald-900">
                              Up to {store.discountPercentage}% Off
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400">
                          License: {store.licenseNumber}
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Stock Availability / Price Comparison (Live API) OR Call Warning (Non-API) */}
                    {store.hasLiveApi ? (
                      <div className="rounded-xl border border-teal-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-teal-700" />
                            <span>Live Stock & Subsidized Generic Pricing:</span>
                          </span>
                          {store.lastSyncTimestamp && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {store.lastSyncTimestamp}
                            </span>
                          )}
                        </div>

                        {/* If matching medicine searched */}
                        {matchedMedicine ? (
                          <div className="rounded-lg bg-teal-50/70 border border-teal-200 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 block">
                                {matchedMedicine.name} ({matchedMedicine.unit})
                              </span>
                              <span className="text-[11px] text-slate-600 block">
                                Generic: {matchedMedicine.genericName}
                              </span>
                              <span className="inline-block px-2 py-0.2 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ In Stock ({matchedMedicine.quantityAvailable} strips available)
                              </span>
                            </div>

                            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                              <div>
                                <span className="text-xs text-slate-400 line-through mr-1.5">
                                  ₹{matchedMedicine.brandPrice}
                                </span>
                                <span className="text-base font-black text-teal-900">
                                  ₹{matchedMedicine.genericPrice}
                                </span>
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Save ₹{(matchedMedicine.brandPrice || 0) - (matchedMedicine.genericPrice || 0)}!
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Sample preview of common medicines available at this store
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                            {store.stockCatalog.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-slate-200 p-2 bg-slate-50/60 flex items-center justify-between text-xs"
                              >
                                <div className="min-w-0 pr-1">
                                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                  <span className="text-[10px] font-bold text-emerald-700 block">
                                    ● In Stock ({item.quantityAvailable})
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-black text-teal-900">₹{item.genericPrice}</p>
                                  <span className="text-[9px] text-slate-400 line-through block">
                                    ₹{item.brandPrice}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Non-API Local Chemist Alert
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <strong className="font-bold text-amber-900">
                              Local Private Chemist • Direct Phone Stock Verification
                            </strong>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              This private store does not stream live automated inventory. Tap below to call chemist directly or send your doctor's prescription on WhatsApp to confirm current medicine stock and discounted pricing.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Direct Phone Call Button */}
                        <a href={`tel:${store.phone}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1.5 min-h-[38px] rounded-xl shadow-2xs cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call Store ({store.phone})</span>
                          </Button>
                        </a>

                        {/* WhatsApp Prescription Enquiry Button */}
                        {store.whatsappPhone && (
                          <a
                            href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(
                              `Namaste! I am checking medicine stock from my Sanjeevani Health Account. Do you have ${
                                searchQuery || 'prescribed medicines'
                              } available? Please let me know price & availability.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold gap-1.5 min-h-[38px] rounded-xl cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
                              <span>WhatsApp Enquiry</span>
                            </Button>
                          </a>
                        )}

                        {/* Google Maps Directions */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${store.name} ${store.fullAddress}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold gap-1.5 min-h-[38px] rounded-xl cursor-pointer"
                          >
                            <Navigation className="h-3.5 w-3.5 text-slate-500" />
                            <span>Directions</span>
                          </Button>
                        </a>
                      </div>

                      {/* 1-Hour Hold / Reservation (For Live API Connected Stores) */}
                      {store.hasLiveApi && (
                        <Button
                          onClick={() => {
                            setReservingStore(store);
                            setReservedMedicine(
                              matchedMedicine || store.stockCatalog[0] || null
                            );
                            setReservationConfirmedCode(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-white text-teal-900 border-teal-300 hover:bg-teal-50 font-bold gap-1.5 min-h-[38px] rounded-xl shadow-2xs cursor-pointer"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-teal-700" />
                          <span>Reserve for 1-Hr Pickup</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 1-HOUR PICKUP HOLD RESERVATION MODAL */}
      {/* ================================================== */}
      {reservingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-teal-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Reserve Medicines for 1-Hour Pickup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReservingStore(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reservationConfirmedCode ? (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    Pickup Reservation Confirmed!
                  </h4>
                  <p className="text-xs text-slate-600">
                    Your stock hold token has been dispatched to{' '}
                    <strong className="text-slate-900">{reservingStore.name}</strong>.
                  </p>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl inline-block">
                  <span className="text-[10px] font-bold text-teal-800 block uppercase">
                    Show Token at Counter:
                  </span>
                  <span className="text-lg font-black font-mono text-teal-900">
                    {reservationConfirmedCode}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Valid for 60 Minutes • Payment at Store
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setReservingStore(null)}
                    variant="primary"
                    size="sm"
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">{reservingStore.name}</p>
                  <p className="text-[11px] text-slate-500">{reservingStore.fullAddress}</p>
                  {reservedMedicine && (
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between">
                      <span className="font-semibold text-slate-800">{reservedMedicine.name}</span>
                      <strong className="text-teal-800 font-bold">₹{reservedMedicine.genericPrice}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Citizen / Patient Name:</label>
                  <input
                    type="text"
                    value={reservationName}
                    onChange={(e) => setReservationName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Contact Phone Number:</label>
                  <input
                    type="tel"
                    value={reservationPhone}
                    onChange={(e) => setReservationPhone(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  * Store holds the medicine for 60 minutes. Payment is made directly at the medical store counter during pickup.
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setReservingStore(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold"
                  >
                    Confirm 1-Hour Hold
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
