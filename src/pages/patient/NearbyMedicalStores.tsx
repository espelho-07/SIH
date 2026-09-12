import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MedicalStore, StoreMedicineItem } from '@/types/medicalStore';
import { INITIAL_MEDICAL_STORES } from '@/mock/medicalStoresData';
import { INITIAL_PRESCRIPTIONS } from '@/mock/mockData';
import L from 'leaflet';
import {
  Search,
  Pill,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Building2,
  Navigation,
  MessageCircle,
  Sparkles,
  List,
  Map as MapIcon,
  X,
  FileText,
  ShoppingBag,
  Info,
  Loader2,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

// Common quick search medicines in clean English
const POPULAR_MEDICINES = [
  'Paracetamol 650mg',
  'Pantoprazole 40mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Sorbitrate 5mg',
  'Cetirizine 10mg',
  'ORS Sachet',
];

export const NearbyMedicalStores: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'JAN_AUSHADHI' | '24X7'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  // Active citizen's prescribed medicines from ABHA vault
  const patientPrescriptions = INITIAL_PRESCRIPTIONS;
  const activeRxMedicines = patientPrescriptions[0]?.items || [
    { id: '1', medicineName: 'Tab. Sorbitrate 5mg', frequency: 'SOS' },
    { id: '2', medicineName: 'Tab. Aspirin 75mg', frequency: '1-0-0' },
    { id: '3', medicineName: 'Tab. Pantoprazole 40mg', frequency: '1-0-0' },
  ];

  const [activePrescriptionFilter, setActivePrescriptionFilter] = useState(false);

  // Prescription Pop-up Modal State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isScanningRx, setIsScanningRx] = useState(false);
  const [rxPriorityMode, setRxPriorityMode] = useState<'JAN_AUSHADHI_FIRST' | 'ALL_NEAREST'>(
    'JAN_AUSHADHI_FIRST'
  );

  // Reservation Modal State
  const [reservingStore, setReservingStore] = useState<MedicalStore | null>(null);
  const [reservedMedicine, setReservedMedicine] = useState<StoreMedicineItem | null>(null);
  const [reservationName, setReservationName] = useState('Rameshwar Sharma');
  const [reservationPhone, setReservationPhone] = useState('9876543210');
  const [reservationConfirmedCode, setReservationConfirmedCode] = useState<string | null>(null);

  // Open Prescription Check Pop-up with quick scanning transition
  const handleOpenPrescriptionCheck = () => {
    setIsPrescriptionModalOpen(true);
    setIsScanningRx(true);
    setTimeout(() => {
      setIsScanningRx(false);
    }, 750);
  };

  // Prescription Store Matching Algorithm
  const rxStoreMatches = useMemo(() => {
    const rxKeywords = activeRxMedicines.map((m) =>
      m.medicineName.toLowerCase().replace('tab.', '').replace('cap.', '').trim().slice(0, 8)
    );
    const totalRx = activeRxMedicines.length;

    const matches = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow).map((store) => {
      const availableItems: StoreMedicineItem[] = [];
      let totalGenericPrice = 0;
      let totalBrandPrice = 0;

      activeRxMedicines.forEach((rxMed) => {
        const keyword = rxMed.medicineName
          .toLowerCase()
          .replace('tab.', '')
          .replace('cap.', '')
          .trim()
          .slice(0, 8);
        const found = store.stockCatalog.find(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.genericName.toLowerCase().includes(keyword)
        );
        if (found) {
          availableItems.push(found);
          const gPrice = found.genericPrice ?? 0;
          const bPrice = found.brandPrice ?? (gPrice * 2);
          totalGenericPrice += gPrice;
          totalBrandPrice += bPrice;
        }
      });

      const matchedCount = availableItems.length;
      const is100Percent = matchedCount === totalRx;
      const savings = Math.max(0, totalBrandPrice - totalGenericPrice);

      return {
        store,
        availableItems,
        matchedCount,
        totalRx,
        is100Percent,
        totalGenericPrice,
        totalBrandPrice,
        savings,
      };
    });

    // Sorting inside prescription modal:
    // By default: Jan Aushadhi Priority (100% Jan Aushadhi first, then nearest)
    // If user changes to 'ALL_NEAREST': ranks 100% stores strictly by shortest distance regardless of store type!
    matches.sort((a, b) => {
      // 100% matched stores always come first
      if (a.is100Percent && !b.is100Percent) return -1;
      if (!a.is100Percent && b.is100Percent) return 1;

      if (rxPriorityMode === 'JAN_AUSHADHI_FIRST') {
        if (a.store.isJanAushadhi && !b.store.isJanAushadhi) return -1;
        if (!a.store.isJanAushadhi && b.store.isJanAushadhi) return 1;
      }
      return a.store.distanceKm - b.store.distanceKm;
    });

    return matches;
  }, [activeRxMedicines, rxPriorityMode]);

  // Filtered Stores for the Main Page: STRICTLY SHOW ONLY CURRENTLY OPEN STORES
  const filteredStores = useMemo(() => {
    // 1. Strict filter: only open stores
    let result = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow);

    // 2. Filter by Category
    if (selectedFilter === 'JAN_AUSHADHI') {
      result = result.filter((s) => s.isJanAushadhi);
    } else if (selectedFilter === '24X7') {
      result = result.filter((s) => s.timings.includes('24'));
    }

    // 3. Filter by Search Query
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

    // 4. Filter by Active Prescription
    if (activePrescriptionFilter) {
      const rxKeywords = activeRxMedicines.map((m) =>
        m.medicineName.toLowerCase().replace('tab.', '').replace('cap.', '').trim().slice(0, 8)
      );

      result = result.filter((s) => {
        // Keep private stores so patient can still contact them
        if (!s.stockCatalog || s.stockCatalog.length === 0) return true;
        return s.stockCatalog.some((item) =>
          rxKeywords.some((k) => item.name.toLowerCase().includes(k))
        );
      });
    }

    // 5. SORTING: ALWAYS JAN AUSHADHI FIRST, THEN NEAREST DISTANCE
    result.sort((a, b) => {
      if (a.isJanAushadhi && !b.isJanAushadhi) return -1;
      if (!a.isJanAushadhi && b.isJanAushadhi) return 1;
      return a.distanceKm - b.distanceKm;
    });

    return result;
  }, [searchQuery, selectedFilter, activePrescriptionFilter, activeRxMedicines]);

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
      attribution: '&copy; OpenStreetMap | Sanjeevani Network',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add Markers for Open Stores
    filteredStores.forEach((store) => {
      const isGovt = store.isJanAushadhi;
      const markerColor = isGovt ? '#0f766e' : '#2563eb';

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
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 230px;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${store.name}</strong>
          <span style="font-size: 11px; color: #64748b;">${store.area} • ${store.distanceKm} km away</span>
          <p style="font-size: 11px; margin-top: 6px; font-weight: bold; color: #059669">
            ● Open Now (${store.timings})
          </p>
          <div style="margin-top: 8px;">
            <a href="tel:${store.phone}" style="display: inline-block; background: #0f766e; color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: bold;">
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
        title={t('stores.title', 'Nearby Medical Stores & Jan Aushadhi Kendras')}
        subtitle={t('stores.subtitle', 'Find open pharmacies near you, check medicine stock, and call stores directly.')}
        breadcrumbs={[
          { label: t('nav.Dashboard', 'Dashboard'), to: '/patient' },
          { label: t('navMap.Medical Stores', 'Medical Stores') },
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
              <span>{t('stores.listView', 'List View')}</span>
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
              <span>{t('stores.mapView', 'Map View')}</span>
            </button>
          </div>
        }
      />

      {/* ================================================== */}
      {/* STATUS BAR: OPEN STORES ONLY & JAN AUSHADHI PRIORITY */}
      {/* ================================================== */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span className="font-bold">
            {t('stores.openStoresOnly', 'Showing currently open stores only')}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-semibold">
          <Building2 className="h-3.5 w-3.5 text-teal-700" />
          <span>{t('stores.janAushadhiPriority', 'Government Jan Aushadhi Kendras (up to 80% lower prices) are prioritized')}</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* SEARCH BAR & MEDICINE BUTTONS */}
      {/* ================================================== */}
      <Card className="border-slate-200 bg-white shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          {/* Main Search Input & Check from Prescription Trigger */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('stores.searchPlaceholder', 'Search medicine name or area (e.g. Paracetamol, Pantoprazole, Metformin)...')}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Check from Prescription Pop-up Button */}
            <button
              type="button"
              onClick={handleOpenPrescriptionCheck}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
            >
              <FileText className="h-4 w-4 text-emerald-200" />
              <span>📋 {t('stores.checkRxButton', 'Check from My Prescription')}</span>
            </button>
          </div>

          {/* Quick Common Medicine Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
              <Pill className="h-3.5 w-3.5 text-teal-700" />
              {t('stores.popularMedicines', 'Common Medicines:')}
            </span>
            {POPULAR_MEDICINES.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(item.split(' ')[0]);
                  setActivePrescriptionFilter(false);
                }}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-colors ${
                  searchQuery.toLowerCase().includes(item.split(' ')[0].toLowerCase())
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border-slate-200'
                }`}
              >
                + {item}
              </button>
            ))}
          </div>

          {/* Active Prescription Filter Active Info (if applied to main page) */}
          {activePrescriptionFilter && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 flex items-start justify-between gap-2 text-xs text-emerald-950">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Filtering stores for your active prescription medicines:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeRxMedicines.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-md bg-white border border-emerald-300 px-2 py-0.5 text-xs font-semibold text-emerald-900"
                      >
                        {m.medicineName} ({m.frequency})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePrescriptionFilter(false)}
                className="text-emerald-800 hover:text-emerald-950 font-bold underline shrink-0 cursor-pointer"
              >
                {t('common.clear', 'Clear Filter')}
              </button>
            </div>
          )}

          {/* Clean Simple Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-semibold mr-1">{t('common.filter', 'Filter')}:</span>
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFilter === 'ALL'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('stores.allStoresFilter', 'All Open Stores')} ({filteredStores.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('JAN_AUSHADHI')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFilter === 'JAN_AUSHADHI'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🏛️ {t('stores.janAushadhiFilter', 'Jan Aushadhi (Govt)')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('24X7')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFilter === '24X7'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⏰ {t('stores.emergencyFilter', '24x7 Open')}
              </button>
            </div>

            <span className="text-slate-500 text-[11px] font-medium">
              Gandhinagar • Nearest Stores
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* VIEW MODE 1: MAP VIEW */}
      {/* ================================================== */}
      {viewMode === 'MAP' && (
        <Card className="border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-teal-700" />
              <span>Map View: Open Medical Stores</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-teal-800">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
                Jan Aushadhi (Govt)
              </span>
              <span className="flex items-center gap-1 font-bold text-blue-800">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Private Pharmacy
              </span>
            </div>
          </div>
          <div ref={mapContainerRef} className="h-[460px] w-full" />
        </Card>
      )}

      {/* ================================================== */}
      {/* VIEW MODE 2: LIST VIEW OF OPEN STORES */}
      {/* ================================================== */}
      <div className="space-y-3">
        {filteredStores.length === 0 ? (
          <Card className="p-10 text-center border-slate-200 bg-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No open stores found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No open medical stores match your search "{searchQuery}". Try searching for another medicine or clearing the filter.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('ALL');
                setActivePrescriptionFilter(false);
              }}
              variant="outline"
              size="sm"
              className="mt-4 text-xs font-bold"
            >
              Reset Search
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredStores.map((store) => {
              // Check if searched medicine is available in this store
              const matchedMedicine = searchQuery.trim()
                ? store.stockCatalog.find(
                    (m) =>
                      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : null;

              const hasCatalog = store.stockCatalog && store.stockCatalog.length > 0;

              return (
                <Card
                  key={store.id}
                  className={`overflow-hidden transition-all duration-150 ${
                    store.isJanAushadhi
                      ? 'border-teal-300 bg-teal-50/20 shadow-xs'
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 space-y-3.5">
                    {/* Top Row: Store Name, Badges & Open Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {store.isJanAushadhi ? (
                            <>
                              <span className="inline-flex items-center gap-1 rounded-md bg-teal-800 text-white px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                                <Building2 className="h-3.5 w-3.5 text-amber-300" />
                                PMBJP Jan Aushadhi Kendra (Govt)
                              </span>
                              <span className="inline-flex items-center rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-xs font-bold">
                                Up to 80% Lower Prices
                              </span>
                            </>
                          ) : store.type === 'HOSPITAL_PHARMACY' ? (
                            <span className="inline-flex items-center rounded-md bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 text-xs font-bold">
                              Hospital OPD Dispensary (Free)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 text-xs font-bold">
                              Private Medical Store
                            </span>
                          )}

                          {store.timings.includes('24') && (
                            <span className="inline-flex items-center rounded-md bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 text-xs font-bold">
                              24x7 Open
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {store.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <MapPin className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                            {store.distanceKm} km away • {store.area}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            Open Now ({store.timings})
                          </span>
                        </div>
                      </div>

                      {/* Distance Badge */}
                      <div className="shrink-0 self-start sm:self-auto">
                        <span className="inline-block rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800">
                          {store.distanceKm} km
                        </span>
                      </div>
                    </div>

                    {/* Middle: Medicine & Price Availability Information */}
                    {hasCatalog ? (
                      <div className="rounded-xl border border-teal-200 bg-white p-3 space-y-2">
                        {matchedMedicine ? (
                          // If specific medicine was searched
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                            <div>
                              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>{matchedMedicine.name} ({matchedMedicine.unit}) - In Stock</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Generic Composition: {matchedMedicine.genericName}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{matchedMedicine.brandPrice}
                                </span>
                                <span className="text-lg font-black text-teal-900">
                                  ₹{matchedMedicine.genericPrice}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-700">
                                Save ₹{(matchedMedicine.brandPrice || 0) - (matchedMedicine.genericPrice || 0)} per pack
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Sample preview of 3 common medicines
                          <div>
                            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                              Available Essential Medicines & Generic Rates:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {store.stockCatalog.slice(0, 3).map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-lg border border-slate-200 p-2 bg-slate-50/70 flex items-center justify-between text-xs"
                                >
                                  <div className="min-w-0 pr-1">
                                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                    <span className="text-[11px] font-semibold text-emerald-700">
                                      In Stock
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-black text-teal-900">₹{item.genericPrice}</p>
                                    <span className="text-[10px] text-slate-400 line-through">
                                      ₹{item.brandPrice}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Traditional private store without digital catalog
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2.5 text-xs">
                        <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 font-bold block">
                            Direct Chemist Verification:
                          </strong>
                          <p className="text-amber-800 mt-0.5">
                            This local pharmacy can be contacted directly by phone or WhatsApp to confirm current medicine stock and prices.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons: Large & Easy to Tap */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. CALL BUTTON (Primary & Bold) */}
                        <a href={`tel:${store.phone}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5 h-10 px-4 rounded-xl shadow-2xs text-xs cursor-pointer"
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call Store ({store.phone})</span>
                          </Button>
                        </a>

                        {/* 2. WHATSAPP BUTTON */}
                        {store.whatsappPhone && (
                          <a
                            href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(
                              `Hello! I found your medical store on the Sanjeevani Citizen Portal. Do you have ${
                                searchQuery || 'this medicine'
                              } in stock? Please share availability and pricing.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold gap-1.5 h-10 px-3.5 rounded-xl text-xs cursor-pointer"
                            >
                              <MessageCircle className="h-4 w-4 text-emerald-700" />
                              <span>WhatsApp Enquiry</span>
                            </Button>
                          </a>
                        )}

                        {/* 3. DIRECTIONS */}
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
                            className="text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold gap-1.5 h-10 px-3 rounded-xl text-xs cursor-pointer"
                          >
                            <Navigation className="h-3.5 w-3.5 text-slate-500" />
                            <span>Directions</span>
                          </Button>
                        </a>
                      </div>

                      {/* 4. Jan Aushadhi 1-Hour Hold Reservation */}
                      {store.isJanAushadhi && (
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
                          className="bg-white text-teal-900 border-teal-300 hover:bg-teal-50 font-bold gap-1.5 h-10 px-3.5 rounded-xl shadow-2xs text-xs cursor-pointer"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-teal-700" />
                          <span>Hold for 1-Hr Pickup</span>
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
      {/* SMART PRESCRIPTION STORE MATCHER POP-UP MODAL */}
      {/* ================================================== */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Smart Prescription Store Matcher
                  </h3>
                  <p className="text-xs text-slate-500">
                    Find nearest pharmacies with 100% of your prescribed medicines
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SCANNING STATE ANIMATION */}
            {isScanningRx ? (
              <div className="py-12 text-center space-y-4">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    Checking your current prescription...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Scanning active medicines from ABHA vault across Gandhinagar pharmacies for single-stop availability.
                  </p>
                </div>
                {/* Medicines being scanned pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {activeRxMedicines.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold animate-pulse"
                    >
                      ● {m.medicineName}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* RESULTS AFTER SCANNING */
              <div className="space-y-4">
                {/* 1. Prescribed Medicines Strip */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      Doctor's Active Prescription ({activeRxMedicines.length} Medicines):
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Verified ABHA Record
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRxMedicines.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-md bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                      >
                        ✓ {m.medicineName} <span className="text-slate-400 font-normal">({m.frequency})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Priority Preference Toggle (Jan Aushadhi Default vs All Medical Stores) */}
                <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-teal-700" />
                      Store Priority Preference:
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {rxPriorityMode === 'JAN_AUSHADHI_FIRST'
                        ? 'Prioritizing Jan Aushadhi Kendras for up to 80% generic price savings.'
                        : 'Showing nearest stores by distance first (including all private pharmacies).'}
                    </p>
                  </div>

                  {/* Priority Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setRxPriorityMode('JAN_AUSHADHI_FIRST')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        rxPriorityMode === 'JAN_AUSHADHI_FIRST'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      🏛️ Jan Aushadhi Priority (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRxPriorityMode('ALL_NEAREST')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        rxPriorityMode === 'ALL_NEAREST'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      📍 All Stores (Nearest First)
                    </button>
                  </div>
                </div>

                {/* 3. Stores List With 100% Match Highlights */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Stores stocking your medicines (Nearest first):
                  </span>

                  {rxStoreMatches.map((match, idx) => {
                    const isTopRecommendation = idx === 0 && match.is100Percent;

                    return (
                      <div
                        key={match.store.id}
                        className={`rounded-2xl border p-4 space-y-3 transition-all ${
                          isTopRecommendation
                            ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400/50 shadow-sm'
                            : match.is100Percent
                            ? 'border-teal-300 bg-white shadow-2xs'
                            : 'border-slate-200 bg-slate-50/50 opacity-90'
                        }`}
                      >
                        {/* Top Store Badge & Name */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {isTopRecommendation && (
                                <span className="rounded-md bg-emerald-700 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-2xs flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-amber-300" />
                                  ★ Best Single-Stop Option (Shortest Distance)
                                </span>
                              )}

                              {match.is100Percent ? (
                                <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                  ✓ 100% Medicines at One Place ({match.matchedCount}/{match.totalRx})
                                </span>
                              ) : (
                                <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                                  {match.matchedCount > 0
                                    ? `${match.matchedCount} of ${match.totalRx} Medicines Available`
                                    : 'Call to Verify Stock'}
                                </span>
                              )}

                              {match.store.isJanAushadhi ? (
                                <span className="rounded-md bg-teal-800 text-white px-2 py-0.5 text-[10px] font-bold">
                                  Jan Aushadhi (Govt)
                                </span>
                              ) : (
                                <span className="rounded-md bg-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-bold">
                                  Private Pharmacy
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-slate-900">
                              {match.store.name}
                            </h4>

                            <p className="text-xs text-slate-500 mt-0.5">
                              📍 {match.store.distanceKm} km away • {match.store.area} • Open Now ({match.store.timings})
                            </p>
                          </div>

                          {/* Price / Savings Tag */}
                          {match.is100Percent && match.totalGenericPrice > 0 && (
                            <div className="text-left sm:text-right shrink-0 bg-white border border-emerald-200 rounded-xl p-2 sm:px-3">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                All 3 Medicines Total:
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{match.totalBrandPrice}
                                </span>
                                <span className="text-base font-black text-emerald-800">
                                  ₹{match.totalGenericPrice}
                                </span>
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-700 block">
                                You Save ₹{match.savings}!
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Available Medicines List */}
                        {match.availableItems.length > 0 && (
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                            <span className="text-[11px] font-bold text-slate-600 block mb-1">
                              Stock verified at this store:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                              {match.availableItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-lg bg-emerald-50/70 border border-emerald-200 px-2 py-1 flex items-center justify-between text-[11px]"
                                >
                                  <span className="font-semibold text-slate-800 truncate pr-1">
                                    ✓ {item.name}
                                  </span>
                                  <span className="font-bold text-emerald-900 shrink-0">
                                    ₹{item.genericPrice}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons Inside Modal */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <a href={`tel:${match.store.phone}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1 text-xs h-8 px-3 rounded-lg cursor-pointer"
                              >
                                <Phone className="h-3 w-3" />
                                <span>Call ({match.store.phone})</span>
                              </Button>
                            </a>

                            {match.store.whatsappPhone && (
                              <a
                                href={`https://wa.me/${match.store.whatsappPhone}?text=${encodeURIComponent(
                                  `Hello! I am checking my doctor prescription from Sanjeevani. Do you have all 3 medicines (${activeRxMedicines
                                    .map((m) => m.medicineName)
                                    .join(', ')}) ready for pickup?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold gap-1 text-xs h-8 px-2.5 rounded-lg cursor-pointer"
                                >
                                  <MessageCircle className="h-3 w-3 text-emerald-700" />
                                  <span>WhatsApp</span>
                                </Button>
                              </a>
                            )}

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${match.store.name} ${match.store.fullAddress}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold gap-1 text-xs h-8 px-2.5 rounded-lg cursor-pointer"
                              >
                                <Navigation className="h-3 w-3 text-slate-500" />
                                <span>Directions</span>
                              </Button>
                            </a>
                          </div>

                          {/* Quick 1-Hour Hold for Jan Aushadhi */}
                          {match.store.isJanAushadhi && (
                            <Button
                              onClick={() => {
                                setIsPrescriptionModalOpen(false);
                                setReservingStore(match.store);
                                setReservedMedicine(match.availableItems[0] || null);
                                setReservationConfirmedCode(null);
                              }}
                              variant="outline"
                              size="sm"
                              className="bg-white text-teal-900 border-teal-300 hover:bg-teal-50 font-bold gap-1 text-xs h-8 px-3 rounded-lg shadow-2xs cursor-pointer"
                            >
                              <ShoppingBag className="h-3 w-3 text-teal-700" />
                              <span>Hold 1-Hr Pickup</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPrescriptionModalOpen(false)}
                    className="text-xs font-semibold rounded-xl"
                  >
                    Close
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActivePrescriptionFilter(true);
                      setIsPrescriptionModalOpen(false);
                    }}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 rounded-xl px-4"
                  >
                    <span>View These Stores on Main Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SIMPLE 1-HOUR PICKUP HOLD MODAL */}
      {/* ================================================== */}
      {reservingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hold Medicine for Pickup
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Jan Aushadhi Kendra will hold this medicine for 1 hour
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReservingStore(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reservationConfirmedCode ? (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Medicine Reserved Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Show this pickup token at the Jan Aushadhi Kendra counter:
                  </p>
                </div>

                <div className="rounded-xl border-2 border-dashed border-teal-400 bg-teal-50/70 p-3 font-mono text-xl font-black text-teal-900 tracking-wider">
                  {reservationConfirmedCode}
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 font-medium">
                  The chemist will keep this medicine reserved for 1 hour. Please collect it before expiry.
                </div>

                <Button
                  onClick={() => setReservingStore(null)}
                  variant="primary"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold h-10 rounded-xl"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="space-y-3.5 text-xs">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold block">Store Name:</span>
                  <p className="font-bold text-slate-900">{reservingStore.name}</p>
                  <p className="text-slate-500 text-[11px]">📍 {reservingStore.area} ({reservingStore.distanceKm} km away)</p>
                </div>

                {reservedMedicine && (
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-950">{reservedMedicine.name}</p>
                      <span className="text-[11px] text-emerald-800">{reservedMedicine.unit}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-900">₹{reservedMedicine.genericPrice}</p>
                      <span className="text-[10px] text-emerald-700">Govt. Generic Rate</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Patient Name:
                    </label>
                    <input
                      type="text"
                      value={reservationName}
                      onChange={(e) => setReservationName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mobile Number:
                    </label>
                    <input
                      type="tel"
                      value={reservationPhone}
                      onChange={(e) => setReservationPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReservingStore(null)}
                    className="flex-1 h-10 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-10 rounded-xl"
                  >
                    Generate Hold Token
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
