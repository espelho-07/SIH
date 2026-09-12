import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/map/MapView';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { Link } from 'react-router-dom';

import {
  Search,
  MapPin,
  Building2,
  Stethoscope,
  Bed,
  Clock,
  Phone,
  Map as MapIcon,
  List,
  ShieldCheck,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';

export const FacilityDiscovery: React.FC = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  const [openOnly, setOpenOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [bedsOnly, setBedsOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [sortBy, setSortBy] = useState('DISTANCE');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  const [showFilters, setShowFilters] = useState(false);

  /* =====================================================
     FACILITY TYPE LABEL
  ====================================================== */
  const getFacilityType = (type: string) => {
    switch (type) {
      case 'DISTRICT_HOSPITAL':
        return t('facilities.districtHospital', 'District Hospital');
      case 'SUB_DISTRICT_HOSPITAL':
        return t('facilities.subDistrictHospital', 'Sub-District Hospital');
      case 'CHC':
        return t('facilities.chc', 'Community Health Centre');
      case 'PHC':
        return t('facilities.phc', 'Primary Health Centre');
      default:
        return t('facilities.hospital', 'Hospital');
    }
  };

  /* =====================================================
     DYNAMIC DISTRICTS
  ====================================================== */
  const districts = useMemo(() => {
    return Array.from(
      new Set(
        INITIAL_FACILITIES
          .map((facility) => facility.district)
          .filter(Boolean)
      )
    ).sort();
  }, []);

  /* =====================================================
     DYNAMIC SPECIALTIES
  ====================================================== */
  const specialties = useMemo(() => {
    return Array.from(
      new Set(
        INITIAL_FACILITIES.flatMap(
          (facility) => facility.specialties || []
        )
      )
    ).sort();
  }, []);

  /* =====================================================
     FILTER + SORT
  ====================================================== */
  const filteredFacilities = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();

    const filtered = INITIAL_FACILITIES.filter((facility) => {
      /* -------------------------
         SEARCH
      -------------------------- */
      const matchesSearch =
        !search ||
        facility.name.toLowerCase().includes(search) ||
        facility.district.toLowerCase().includes(search) ||
        facility.address.toLowerCase().includes(search) ||
        facility.specialties.some((specialty) =>
          specialty.toLowerCase().includes(search)
        );

      /* -------------------------
         TYPE
      -------------------------- */
      const matchesType =
        selectedType === 'ALL' ||
        facility.type === selectedType;

      /* -------------------------
         DISTRICT
      -------------------------- */
      const matchesDistrict =
        selectedDistrict === 'ALL' ||
        facility.district === selectedDistrict;

      /* -------------------------
         SPECIALTY
      -------------------------- */
      const matchesSpecialty =
        selectedSpecialty === 'ALL' ||
        facility.specialties.includes(selectedSpecialty);

      /* -------------------------
         OPEN
      -------------------------- */
      const matchesOpen =
        !openOnly || facility.isOpen;

      /* -------------------------
         EMERGENCY
      -------------------------- */
      const matchesEmergency =
        !emergencyOnly || facility.emergencyAvailable;

      /* -------------------------
         BEDS
      -------------------------- */
      const matchesBeds =
        !bedsOnly || facility.availableBeds > 0;

      /* -------------------------
         VERIFIED
      -------------------------- */
      const matchesVerified =
        !verifiedOnly || facility.isVerified;

      return (
        matchesSearch &&
        matchesType &&
        matchesDistrict &&
        matchesSpecialty &&
        matchesOpen &&
        matchesEmergency &&
        matchesBeds &&
        matchesVerified
      );
    });

    /* =====================================================
       SORT RESULTS
    ====================================================== */
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'DISTANCE':
          return (
            (a.distanceKm ?? Infinity) -
            (b.distanceKm ?? Infinity)
          );

        case 'WAITING':
          return (
            (a.currentWaitTimeMinutes ?? Infinity) -
            (b.currentWaitTimeMinutes ?? Infinity)
          );

        case 'BEDS':
          return (
            (b.availableBeds ?? 0) -
            (a.availableBeds ?? 0)
          );

        case 'NAME':
          return a.name.localeCompare(b.name);

        default:
          return 0;
      }
    });
  }, [
    searchQuery,
    selectedType,
    selectedDistrict,
    selectedSpecialty,
    openOnly,
    emergencyOnly,
    bedsOnly,
    verifiedOnly,
    sortBy,
  ]);

  /* =====================================================
     ACTIVE FILTER COUNT
  ====================================================== */
  const activeFilterCount =
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedDistrict !== 'ALL' ? 1 : 0) +
    (selectedSpecialty !== 'ALL' ? 1 : 0) +
    (openOnly ? 1 : 0) +
    (emergencyOnly ? 1 : 0) +
    (bedsOnly ? 1 : 0) +
    (verifiedOnly ? 1 : 0);

  /* =====================================================
     CLEAR ALL FILTERS
  ====================================================== */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedDistrict('ALL');
    setSelectedSpecialty('ALL');
    setOpenOnly(false);
    setEmergencyOnly(false);
    setBedsOnly(false);
    setVerifiedOnly(false);
    setSortBy('DISTANCE');
  };

  return (
    <div className="space-y-4">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <PageHeader
        title={t('facilities.findHospital', 'Find a Hospital')}
        subtitle={t('facilities.findHospitalSubtitle', 'Find a hospital or health centre near you.')}
        breadcrumbs={[
          { label: t('nav.dashboard', 'Dashboard'), to: '/patient' },
          { label: t('facilities.title', 'Hospitals') },
        ]}
      />

      {/* =====================================================
          TOP CONTROLS
      ====================================================== */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* LIST / MAP */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 w-fit shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'LIST'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            {t('facilities.viewList', 'List')}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('MAP')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'MAP'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            {t('facilities.viewMap', 'Map')}
          </button>
        </div>

        {/* FILTER BUTTON */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-teal-700" />
          <span>{t('facilities.filters', 'Filters')}</span>

          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1.5 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}

          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 text-slate-500 ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('facilities.searchPlaceholder', 'Search hospital, area, district or service...')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          FILTER PANEL (COLLAPSIBLE DRAWER)
      ====================================================== */}
      {showFilters && (
        <Card className="border-slate-200 shadow-sm animate-in fade-in-50 duration-150">
          <CardContent className="p-3.5 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* TYPE */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                  {t('facilities.hospitalType', 'Hospital Type')}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-500 shadow-2xs transition-colors cursor-pointer font-medium"
                >
                  <option value="ALL">{t('facilities.allTypes', 'All Hospitals')}</option>
                  <option value="DISTRICT_HOSPITAL">{t('facilities.districtHospital', 'District Hospital')}</option>
                  <option value="SUB_DISTRICT_HOSPITAL">{t('facilities.subDistrictHospital', 'Sub-District Hospital')}</option>
                  <option value="CHC">{t('facilities.chc', 'Community Health Centre')}</option>
                  <option value="PHC">{t('facilities.phc', 'Primary Health Centre')}</option>
                </select>
              </div>

              {/* DISTRICT */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                  {t('facilities.district', 'District')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-500 shadow-2xs transition-colors cursor-pointer font-medium"
                >
                  <option value="ALL">{t('facilities.allDistricts', 'All Districts')}</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* SPECIALTY */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                  {t('facilities.serviceSpecialty', 'Service / Specialty')}
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-500 shadow-2xs transition-colors cursor-pointer font-medium"
                >
                  <option value="ALL">{t('facilities.allServices', 'All Services')}</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* SORT */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                  {t('facilities.sortBy', 'Sort By')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-500 shadow-2xs transition-colors cursor-pointer font-medium"
                >
                  <option value="DISTANCE">{t('facilities.nearestFirst', 'Nearest First')}</option>
                  <option value="WAITING">{t('facilities.lowestWait', 'Lowest Waiting Time')}</option>
                  <option value="BEDS">{t('facilities.mostBeds', 'Most Beds Available')}</option>
                  <option value="NAME">{t('facilities.hospitalName', 'Hospital Name')}</option>
                </select>
              </div>
            </div>

            {/* AVAILABILITY PILL CHECKBOXES */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-[11px] font-semibold text-slate-600">
                {t('facilities.availabilityFilters', 'Availability Filters')}
              </p>

              <div className="flex flex-wrap gap-2">
                {/* OPEN NOW */}
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors shadow-2xs ${
                    openOnly
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={openOnly}
                    onChange={(e) => setOpenOnly(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  />
                  <span>{t('facilities.openNow', 'Open Now')}</span>
                </label>

                {/* EMERGENCY */}
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors shadow-2xs ${
                    emergencyOnly
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={emergencyOnly}
                    onChange={(e) => setEmergencyOnly(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  />
                  <span>{t('facilities.emergencyAvailable', 'Emergency Available')}</span>
                </label>

                {/* BEDS */}
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors shadow-2xs ${
                    bedsOnly
                      ? 'border-teal-300 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={bedsOnly}
                    onChange={(e) => setBedsOnly(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  />
                  <span>{t('facilities.bedsAvailable', 'Beds Available')}</span>
                </label>

                {/* VERIFIED */}
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors shadow-2xs ${
                    verifiedOnly
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  />
                  <span>{t('facilities.verifiedOnly', 'Verified Only')}</span>
                </label>
              </div>
            </div>

            {/* CLEAR FILTERS */}
            {activeFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                >
                  {t('facilities.clearAllFilters', 'Clear All Filters')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          RESULTS HEADER & ACTIVE FILTER BADGES
      ====================================================== */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t('facilities.hospitalsNearYou', 'Hospitals near you')}
          </p>
          <p className="text-[11px] text-slate-500">
            {filteredFacilities.length}{' '}
            {filteredFacilities.length === 1
              ? t('facilities.hospitalFound', 'hospital found')
              : t('facilities.hospitalsFound', 'hospitals found')}
          </p>
        </div>

        {/* ACTIVE FILTER SUMMARY BADGES */}
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedType !== 'ALL' && (
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-700 border border-teal-200/50">
              {getFacilityType(selectedType)}
            </span>
          )}

          {selectedDistrict !== 'ALL' && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 border border-slate-200">
              {selectedDistrict}
            </span>
          )}

          {selectedSpecialty !== 'ALL' && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 border border-blue-200/50">
              {selectedSpecialty}
            </span>
          )}

          {openOnly && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200/50">
              {t('facilities.open', 'Open')}
            </span>
          )}

          {emergencyOnly && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 border border-red-200/50">
              {t('facilities.emergency', 'Emergency')}
            </span>
          )}

          {bedsOnly && (
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-700 border border-teal-200/50">
              {t('facilities.beds', 'Beds')}
            </span>
          )}

          {verifiedOnly && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 border border-blue-200/50">
              {t('facilities.verified', 'Verified')}
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          MAP VIEW
      ====================================================== */}
      {viewMode === 'MAP' && (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <MapView
            facilities={filteredFacilities}
            className="h-[450px]"
          />
        </Card>
      )}

      {/* =====================================================
          HOSPITAL LIST
      ====================================================== */}
      {viewMode === 'LIST' && filteredFacilities.length > 0 && (
        <div className="space-y-2.5">
          {filteredFacilities.map((facility) => (
            <Card
              key={facility.id}
              className="border-slate-200 shadow-2xs transition-all hover:border-teal-300 hover:shadow-md"
            >
              <CardContent className="p-3.5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {/* =====================================================
                      HOSPITAL NAME & LOCATION
                  ====================================================== */}
                  <div className="flex min-w-0 items-start gap-3 lg:w-[30%]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {facility.name}
                        </h3>
                        {facility.isVerified && (
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                        )}
                      </div>

                      <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
                        {getFacilityType(facility.type)}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="h-3 w-3 text-teal-600 shrink-0" />
                        <span>{facility.distanceKm} km away</span>
                        <span>•</span>
                        <span>{facility.district}</span>
                      </div>
                    </div>
                  </div>

                  {/* =====================================================
                      STATUS BADGES
                  ====================================================== */}
                  <div className="lg:w-[14%]">
                    <div className="flex flex-wrap gap-1.5">
                      {facility.isOpen ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                          {t('facilities.openNow', 'Open Now')}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          {t('facilities.closed', 'Closed')}
                        </span>
                      )}

                      {facility.emergencyAvailable && (
                        <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-700">
                          {t('facilities.emergency', 'Emergency')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* =====================================================
                      SERVICES
                  ====================================================== */}
                  <div className="min-w-0 lg:w-[20%]">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        {t('facilities.services', 'Services')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {facility.specialties.slice(0, 2).map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] text-slate-700 font-medium"
                        >
                          {specialty}
                        </span>
                      ))}

                      {facility.specialties.length > 2 && (
                        <span className="rounded-md bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 text-[10px] text-slate-500 font-medium">
                          +{facility.specialties.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* =====================================================
                      LIVE METRICS (BEDS, WAITING, EMERGENCY)
                  ====================================================== */}
                  <div className="flex items-center gap-5 lg:flex-1">
                    {/* BEDS */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 border border-teal-100">
                        <Bed className="h-3.5 w-3.5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {t('facilities.beds', 'Beds')}
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {facility.availableBeds} {t('facilities.available', 'available')}
                        </p>
                      </div>
                    </div>

                    {/* WAITING */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 border border-amber-100">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {t('facilities.waiting', 'Waiting')}
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {facility.currentWaitTimeMinutes} min
                        </p>
                      </div>
                    </div>

                    {/* EMERGENCY */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 border border-red-100">
                        <Phone className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {t('facilities.emergency', 'Emergency')}
                        </p>
                        <p
                          className={`text-[10px] font-bold ${
                            facility.emergencyAvailable
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {facility.emergencyAvailable
                            ? t('facilities.statusAvailable', 'Available')
                            : t('facilities.statusNotAvailable', 'Not Available')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =====================================================
                      ACTION BUTTONS
                  ====================================================== */}
                  <div className="flex gap-2 lg:w-[190px]">
                    <Link
                      to={`/patient/facilities/${facility.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full text-[11px] font-semibold cursor-pointer"
                      >
                        {t('facilities.details', 'Details')}
                      </Button>
                    </Link>

                    <Link
                      to="/patient/tokens"
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-8 w-full bg-teal-700 text-[11px] font-semibold hover:bg-teal-800 shadow-2xs cursor-pointer"
                      >
                        {t('facilities.getToken', 'Get Token')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* =====================================================
          NO RESULTS EMPTY STATE
      ====================================================== */}
      {filteredFacilities.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-5 w-5 text-slate-400" />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-800">
              {t('facilities.noHospitalFound', 'No hospital found')}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {t('facilities.noHospitalDesc', 'No hospitals match your current search and filters.')}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs font-semibold cursor-pointer"
              onClick={clearFilters}
            >
              {t('facilities.clearAllFilters', 'Clear All Filters')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          HELP CALLOUT BOX
      ====================================================== */}
      <div className="flex items-center gap-2.5 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5 shadow-2xs">
        <MapPin className="h-4 w-4 shrink-0 text-teal-700" />
        <div>
          <p className="text-xs font-semibold text-teal-900">
            {t('facilities.helpTitle', 'Looking for a hospital nearby?')}
          </p>
          <p className="text-[10px] text-teal-700">
            {t('facilities.helpSubtitle', 'Search by hospital, district, service or use the filters above.')}
          </p>
        </div>
      </div>
    </div>
  );
};
