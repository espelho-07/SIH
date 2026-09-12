import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/map/MapView';
import {
  INITIAL_FACILITIES,
  INITIAL_LIVE_QUEUE,
  INITIAL_REFERRALS,
} from '@/mock/mockData';
import { INITIAL_MEDICAL_STORES } from '@/mock/medicalStoresData';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Building2,
  GitBranch,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Pill,
  Sparkles,
  Percent,
  Search,
  Phone,
  MessageCircle,
  Navigation,
  X,
  ExternalLink,
  Bed,
} from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { FamilyMemberSwitcher } from '@/components/patient/FamilyMemberSwitcher';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeMember } = useFamily();

  const activeToken =
    INITIAL_LIVE_QUEUE.tokens.find(
      (t) => t.patientId === 'usr_pat_01'
    ) || INITIAL_LIVE_QUEUE.tokens[3];

  const activeReferral = INITIAL_REFERRALS[0];

  const nearbyFacilities = INITIAL_FACILITIES.slice(0, 3);

  // Large Modal State & Filters
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'HOSPITALS' | 'STORES'>('HOSPITALS');
  const [modalHospitalSearch, setModalHospitalSearch] = useState('');
  const [modalStoreSearch, setModalStoreSearch] = useState('');
  const [modalStoreFilter, setModalStoreFilter] = useState<'ALL' | 'JAN_AUSHADHI' | '24X7'>('ALL');

  const openStores = useMemo(() => {
    let list = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow);
    if (modalStoreFilter === 'JAN_AUSHADHI') {
      list = list.filter((s) => s.isJanAushadhi);
    } else if (modalStoreFilter === '24X7') {
      list = list.filter((s) => s.timings.includes('24'));
    }
    if (modalStoreSearch.trim()) {
      const q = modalStoreSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.stockCatalog.some((m) => m.name.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (a.isJanAushadhi && !b.isJanAushadhi) return -1;
      if (!a.isJanAushadhi && b.isJanAushadhi) return 1;
      return a.distanceKm - b.distanceKm;
    });
    return list;
  }, [modalStoreSearch, modalStoreFilter]);

  const modalHospitals = useMemo(() => {
    let list = [...INITIAL_FACILITIES];
    if (modalHospitalSearch.trim()) {
      const q = modalHospitalSearch.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [modalHospitalSearch]);

  return (
    <div className="space-y-7 font-sans">

      {/* ================================================== */}
      {/* CITIZEN HEALTH BAR / ABHA IDENTITY */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700/80 border border-teal-500/40 text-white shadow-xs">
              <ShieldCheck className="h-6 w-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold tracking-tight text-white sm:text-base">
                  Ayushman Bharat Citizen Health Portal
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-700/80 border border-teal-500/50 px-2 py-0.5 text-[10px] font-semibold text-teal-100">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> ABHA Verified
                </span>
              </div>
              <p className="text-xs text-teal-200/90 mt-0.5 font-mono">
                ABHA ID: {activeMember.abhaId} • Active: {activeMember.name} ({activeMember.relation === 'SELF' ? 'Self' : activeMember.relationLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <FamilyMemberSwitcher variant="banner" />
            <div className="flex items-center gap-1.5 rounded-xl bg-teal-800/80 border border-teal-600/40 px-3 py-1.5 text-xs text-teal-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>OPD Active Today</span>
            </div>
          </div>
        </div>
      </div>


      {/* ================================================== */}
      {/* TOKEN + REFERRAL */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">


        {/* ================================================== */}
        {/* MY TOKEN */}
        {/* ================================================== */}

        <Card className="overflow-hidden border-teal-200 bg-white shadow-sm lg:col-span-3">

          {/* Header */}

          <div className="flex items-center justify-between bg-teal-700 px-5 py-3.5 text-white">

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">

                <Ticket className="h-4 w-4" />

              </div>

              <span className="text-sm font-semibold">
                My Token
              </span>

            </div>

            <StatusBadge
              status="WAITING"
              className="border-teal-600 bg-teal-800 text-[10px] text-white"
            />

          </div>


          <CardContent className="p-5">

            {/* Main Token Information */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">


              {/* Token */}

              <div className="sm:min-w-[95px]">

                <p className="text-[11px] font-medium text-slate-500">
                  Your Token
                </p>

                <p className="mt-0.5 text-3xl font-bold tracking-tight text-teal-800">
                  {activeToken.tokenNumber}
                </p>

              </div>


              {/* Information */}

              <div className="grid flex-1 grid-cols-3 gap-3 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">

                <div>

                  <p className="text-[10px] font-medium text-slate-400">
                    Now Serving
                  </p>

                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {INITIAL_LIVE_QUEUE.currentTokenNumber}
                  </p>

                </div>


                <div>

                  <p className="text-[10px] font-medium text-slate-400">
                    Before You
                  </p>

                  <p className="mt-1 text-base font-semibold text-slate-900">
                    7
                  </p>

                </div>


                <div>

                  <p className="text-[10px] font-medium text-slate-400">
                    Wait Time
                  </p>

                  <p className="mt-1 text-base font-semibold text-amber-600">
                    {activeToken.estimatedWaitMinutes} min
                  </p>

                </div>

              </div>

            </div>


            {/* Progress */}

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-[10px] text-slate-400">
                  Your turn is getting closer
                </span>

                <span className="text-[10px] font-medium text-teal-700">
                  45%
                </span>

              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">

                <div className="h-full w-[45%] rounded-full bg-teal-600" />

              </div>

            </div>


            {/* Hospital & View Live Queue Link */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-teal-700" />
                <span className="text-xs font-medium text-slate-600">
                  {activeToken.facilityName}
                </span>
              </div>

              <Link to="/patient/tokens">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 rounded-lg border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold cursor-pointer gap-1"
                >
                  View Live Queue & History
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>

        </Card>


        {/* ================================================== */}
        {/* MY REFERRAL */}
        {/* ================================================== */}

        <Card className="border-slate-200 bg-white shadow-sm lg:col-span-2">

          <CardContent className="p-5">

            {/* Header */}

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">

                  <GitBranch className="h-4 w-4 text-amber-600" />

                </div>

                <div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    My Referral
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Your referred visit
                  </p>

                </div>

              </div>

              <PriorityBadge
                priority={activeReferral.priority}
              />

            </div>


            {/* Referral Details */}
<div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">

  <div>

    <p className="text-[10px] font-medium text-slate-400">
      Hospital
    </p>

    <p className="mt-0.5 text-sm font-semibold text-slate-900">
      {activeReferral.toFacilityName}
    </p>

  </div>


  <div className="grid grid-cols-2 gap-4">

    <div>

      <p className="text-[10px] font-medium text-slate-400">
        Doctor For
      </p>

      <p className="mt-0.5 text-xs font-medium text-slate-800">
        {activeReferral.toSpecialty}
      </p>

    </div>


    <div>

      <p className="text-[10px] font-medium text-slate-400">
        Visit Time
      </p>

      <p className="mt-0.5 text-xs font-medium text-teal-700">
        {activeReferral.appointmentSlot || 'Not fixed yet'}
      </p>

    </div>

  </div>

</div>


            {/* View Referral */}

            <Link
              to="/patient/referrals"
              className="mt-4 block"
            >

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
              >

                View Referral

                <ArrowRight className="h-3.5 w-3.5" />

              </Button>

            </Link>

          </CardContent>

        </Card>

      </div>


      {/* ================================================== */}
      {/* FIND NEARBY HOSPITALS & MEDICAL STORES BANNER */}
      {/* ================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-50/70 to-teal-100/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm ring-4 ring-teal-100">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-800 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Building2 className="h-3 w-3 text-teal-300" /> Civil & Govt Hospitals
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                  <Pill className="h-3 w-3 text-emerald-700" /> PMBJP Jan Aushadhi (Up to 80% Off)
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 border border-sky-300 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                  ● Real-Time Availability
                </span>
              </div>
              <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                Find Nearby Hospitals & Medical Stores Near You
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 max-w-xl">
                Check live hospital bed/ICU availability and find currently open Jan Aushadhi kendras or pharmacies in one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              onClick={() => {
                setActiveModalTab('HOSPITALS');
                setIsFacilityModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="w-full sm:w-auto gap-1.5 bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-bold text-xs h-10 px-4 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Find Hospitals & Medical Stores
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>


      {/* ================================================== */}
      {/* NEARBY HOSPITALS */}
      {/* ================================================== */}

      <section>

        {/* Section Header */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Hospitals Near You
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Check hospital location and availability
            </p>

          </div>


          {/* Find Hospital */}

          <Link to="/patient/facilities">

            <Button
              variant="primary"
              size="sm"
              className="w-full gap-1.5 bg-teal-700 text-xs hover:bg-teal-800 sm:w-auto"
            >

              <Building2 className="h-3.5 w-3.5" />

              Find Hospital

              <ArrowRight className="h-3.5 w-3.5" />

            </Button>

          </Link>

        </div>


        {/* Map + Hospital List */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">


          {/* MAP */}

          <div className="overflow-hidden rounded-2xl lg:col-span-2">

            <MapView facilities={INITIAL_FACILITIES} />

          </div>


          {/* HOSPITALS */}

          <div className="space-y-3">

            {nearbyFacilities.map((facility) => (

              <Card
                key={facility.id}
                className="border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >

                {/* Hospital Header */}

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {facility.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">

                      <MapPin className="h-3 w-3" />

                      {facility.distanceKm} km away

                    </div>

                  </div>


                  {facility.isOpen ? (

                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      Open
                    </span>

                  ) : (

                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      Closed
                    </span>

                  )}

                </div>


                {/* Availability */}

                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">

                  <div className="flex items-center gap-1.5">

                    <Building2 className="h-3.5 w-3.5 text-teal-700" />

                    <span className="text-[11px] text-slate-600">
                      <strong className="font-semibold text-slate-900">
                        {facility.availableBeds}
                      </strong>{' '}
                      beds
                    </span>

                  </div>


                  <span className="text-[11px] text-red-700">

                    <strong className="font-semibold">
                      {facility.icuBedsAvailable}
                    </strong>{' '}
                    ICU

                  </span>

                </div>


                {/* View Hospital */}

                <Link
                  to={`/patient/facilities/${facility.id}`}
                  className="mt-3 block"
                >

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-xs"
                  >

                    View Hospital

                  </Button>

                </Link>

              </Card>

            ))}

          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* LARGE 2-TAB POP-UP MODAL: HOSPITALS & MEDICAL STORES */}
      {/* ================================================== */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5 bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Find Nearby Hospitals & Medical Stores
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explore real-time beds, emergency facilities, and open pharmacies across Gandhinagar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFacilityModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2 Big Tabs Switcher */}
            <div className="border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab('HOSPITALS')}
                className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'HOSPITALS'
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Nearby Hospitals</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    activeModalTab === 'HOSPITALS'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {INITIAL_FACILITIES.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('STORES')}
                className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'STORES'
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Pill className="h-4 w-4" />
                <span>Medical Stores & Jan Aushadhi</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    activeModalTab === 'STORES'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {openStores.length} Open
                </span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeModalTab === 'HOSPITALS' ? (
                /* TAB 1: HOSPITALS */
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={modalHospitalSearch}
                      onChange={(e) => setModalHospitalSearch(e.target.value)}
                      placeholder="Search hospital name, area, or facility type (e.g. Civil Hospital, CHC, ICU)..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    {modalHospitalSearch && (
                      <button
                        type="button"
                        onClick={() => setModalHospitalSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Hospital Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {modalHospitals.map((facility) => (
                      <div
                        key={facility.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="rounded-md bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                                  {facility.type}
                                </span>
                                {facility.emergencyAvailable && (
                                  <span className="rounded-md bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                                    24x7 Emergency
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {facility.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-teal-700 shrink-0" />
                                {facility.distanceKm} km away • {facility.address}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                facility.isOpen
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {facility.isOpen ? 'Open Now' : 'Closed'}
                            </span>
                          </div>

                          {/* Beds and ICU Availability */}
                          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-4 w-4 text-teal-700 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 block font-medium">General Beds</span>
                                <span className="font-bold text-slate-900">{facility.availableBeds} available</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bed className="h-4 w-4 text-red-600 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 block font-medium">ICU Beds</span>
                                <span className="font-bold text-red-700">{facility.icuBedsAvailable} available</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${facility.contactNumber || '108'}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-8 px-2.5 rounded-lg gap-1 cursor-pointer"
                              >
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </Button>
                            </a>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${facility.name} ${facility.address}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs h-8 px-2.5 rounded-lg gap-1 cursor-pointer"
                              >
                                <Navigation className="h-3 w-3 text-slate-500" />
                                <span>Directions</span>
                              </Button>
                            </a>
                          </div>

                          <Link
                            to={`/patient/facilities/${facility.id}`}
                            onClick={() => setIsFacilityModalOpen(false)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-teal-300 text-teal-800 hover:bg-teal-50 text-xs h-8 px-2.5 rounded-lg font-bold gap-1 cursor-pointer"
                            >
                              <span>Details</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* TAB 2: MEDICAL STORES */
                <div className="space-y-4">
                  {/* Search & Filter Row */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={modalStoreSearch}
                        onChange={(e) => setModalStoreSearch(e.target.value)}
                        placeholder="Search medicine name or area (e.g. Paracetamol, Metformin, Sector 21)..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                      {modalStoreSearch && (
                        <button
                          type="button"
                          onClick={() => setModalStoreSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setModalStoreFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalStoreFilter === 'ALL'
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All Open Stores ({openStores.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalStoreFilter('JAN_AUSHADHI')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalStoreFilter === 'JAN_AUSHADHI'
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        🏛️ Jan Aushadhi (Govt)
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalStoreFilter('24X7')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalStoreFilter === '24X7'
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ⏰ 24x7 Open
                      </button>
                    </div>
                  </div>

                  {/* Medical Store Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {openStores.map((store) => (
                      <div
                        key={store.id}
                        className={`rounded-2xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
                          store.isJanAushadhi
                            ? 'border-teal-300 bg-teal-50/20 shadow-xs'
                            : 'border-slate-200 bg-white shadow-2xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                {store.isJanAushadhi ? (
                                  <>
                                    <span className="rounded-md bg-teal-800 text-white px-2 py-0.5 text-[10px] font-bold">
                                      PMBJP Jan Aushadhi (Govt)
                                    </span>
                                    <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                      Up to 80% Off
                                    </span>
                                  </>
                                ) : (
                                  <span className="rounded-md bg-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-bold">
                                    Private Chemist
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {store.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                📍 {store.distanceKm} km away • {store.area} • Open ({store.timings})
                              </p>
                            </div>
                          </div>

                          {/* Stock Summary Preview */}
                          {store.stockCatalog && store.stockCatalog.length > 0 ? (
                            <div className="rounded-xl border border-teal-200 bg-white p-2.5">
                              <span className="text-[10px] font-bold text-slate-500 block mb-1">
                                Sample Generic Stock:
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                {store.stockCatalog.slice(0, 2).map((item) => (
                                  <div key={item.id} className="rounded-md bg-slate-50 p-1.5">
                                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                                    <p className="text-emerald-700 font-bold">
                                      ₹{item.genericPrice}{' '}
                                      <span className="text-slate-400 line-through text-[9px]">
                                        ₹{item.brandPrice}
                                      </span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-900">
                              📞 Call chemist to verify current stock & discounted price.
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${store.phone}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 px-2.5 rounded-lg gap-1 cursor-pointer"
                              >
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </Button>
                            </a>
                            {store.whatsappPhone && (
                              <a
                                href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(
                                  'Hello! I am checking medicine stock from Sanjeevani. Do you have required medicines available?'
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 text-xs h-8 px-2.5 rounded-lg font-bold gap-1 cursor-pointer"
                                >
                                  <MessageCircle className="h-3 w-3 text-emerald-700" />
                                  <span>WhatsApp</span>
                                </Button>
                              </a>
                            )}
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
                                className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs h-8 px-2.5 rounded-lg font-semibold gap-1 cursor-pointer"
                              >
                                <Navigation className="h-3 w-3 text-slate-500" />
                                <span>Directions</span>
                              </Button>
                            </a>
                          </div>

                          <Link
                            to="/patient/medical-stores"
                            onClick={() => setIsFacilityModalOpen(false)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-teal-300 text-teal-800 hover:bg-teal-50 text-xs h-8 px-2.5 rounded-lg font-bold gap-1 cursor-pointer"
                            >
                              <span>Full View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 p-3 sm:p-4 bg-slate-50">
              <div>
                {activeModalTab === 'HOSPITALS' ? (
                  <Link
                    to="/patient/facilities"
                    onClick={() => setIsFacilityModalOpen(false)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <span>Go to Full Hospital Discovery Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/patient/medical-stores"
                    onClick={() => setIsFacilityModalOpen(false)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <span>Go to Full Medical Stores & Prescription Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFacilityModalOpen(false)}
                className="text-xs font-semibold rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};