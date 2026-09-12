import React, { useState } from 'react';
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
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Mic,
  Video,
  ChevronRight,
  Calendar,
  Activity,
  Heart,
  FileText,
} from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { FamilyMemberSwitcher } from '@/components/patient/FamilyMemberSwitcher';
import { SmartHospitalAssistantModal } from '@/components/patient/SmartHospitalAssistantModal';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeMember } = useFamily();
  const { t } = useTranslation();

  const activeToken =
    INITIAL_LIVE_QUEUE.tokens.find(
      (t) => t.patientId === 'usr_pat_01'
    ) || INITIAL_LIVE_QUEUE.tokens[3];

  const activeReferral = INITIAL_REFERRALS[0];
  const nearbyFacilities = INITIAL_FACILITIES.slice(0, 3);

  // Voice & Facility Assistant Modal State
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'ASSISTANT' | 'STORES'>('ASSISTANT');

  const firstName = (activeMember?.name || user?.name || 'Citizen').split(' ')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8 font-sans">

      {/* ================================================== */}
      {/* 1. TOP GREETING BAR (Mobile Wireframe Standard) */}
      {/* ================================================== */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {t('patient.welcome', 'Hello')}, {firstName} 👋
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
              <ShieldCheck className="h-3 w-3 text-teal-600" /> {t('patient.abhaVerified', 'ABHA Verified')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            ABHA: <span className="font-mono text-slate-700 font-semibold">{activeMember.abhaId}</span> • {activeMember.name} ({activeMember.relation === 'SELF' ? 'Self' : activeMember.relationLabel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FamilyMemberSwitcher variant="banner" />
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. SEARCH BAR (Clean Pill Style matching Wireframe) */}
      {/* ================================================== */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          onClick={() => {
            setActiveModalTab('ASSISTANT');
            setIsFacilityModalOpen(true);
          }}
          placeholder="Search hospitals, medicines, doctors, symptoms..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100 cursor-pointer transition-all hover:border-slate-300"
          readOnly
        />
        <button
          type="button"
          onClick={() => {
            setActiveModalTab('ASSISTANT');
            setIsFacilityModalOpen(true);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer"
          title="Voice Search / Assistant"
        >
          <Mic className="h-4 w-4 text-teal-700" />
        </button>
      </div>

      {/* ================================================== */}
      {/* 3. HERO CARD: SANJEEVANI VOICE ASSISTANT */}
      {/* ================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-300 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shadow-sm">
              <Mic className="h-6 w-6 text-teal-300" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-700/80 border border-teal-500/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-100">
                  <Sparkles className="h-3 w-3 text-teal-300" /> AI Voice Triage
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  ગુજરાતી • हिन्दी • English
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-teal-100">
                  ● Real-Time Bed Match
                </span>
              </div>
              <h3 className="mt-1 text-base font-extrabold text-white sm:text-lg tracking-tight">
                "Tamare kem hospital javu che?" — Speak with Sanjeevani
              </h3>
              <p className="mt-0.5 text-xs text-teal-200/90 max-w-xl">
                Tell your symptom in voice or tap. Assistant directly finds the best hospital with on-duty doctors and available beds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            <Button
              onClick={() => {
                setActiveModalTab('ASSISTANT');
                setIsFacilityModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm font-extrabold text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              <Mic className="h-4 w-4 text-emerald-100 animate-pulse" />
              <span>🎙️ Ask Assistant (બોલો)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              onClick={() => {
                setActiveModalTab('STORES');
                setIsFacilityModalOpen(true);
              }}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs h-10 px-3.5 rounded-xl cursor-pointer"
            >
              <Pill className="h-3.5 w-3.5 text-emerald-300" />
              <span>{t('patient.findMedicalStores', 'Medical Stores')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. QUICK ACTIONS ROW (4 Icons matching Wireframe) */}
      {/* ================================================== */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {/* Hospitals */}
        <Link
          to="/patient/facilities"
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
            {t('patient.hospitalsNearYou', 'Hospitals')}
          </span>
        </Link>

        {/* Medicines / Jan Aushadhi */}
        <Link
          to="/patient/medical-stores"
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
            <Pill className="h-6 w-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
            {t('patient.findMedicalStores', 'Medicines')}
          </span>
        </Link>

        {/* Queue Token */}
        <Link
          to="/patient/tokens"
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs">
            <Ticket className="h-6 w-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
            {t('patient.myToken', 'Token')}
          </span>
        </Link>

        {/* Teleconsultation */}
        <Link
          to="/patient/teleconsultation"
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
            <Video className="h-6 w-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
            {t('navMap.Teleconsultation', 'Doctor Call')}
          </span>
        </Link>
      </div>

      {/* ================================================== */}
      {/* 5. TOKEN + REFERRAL SECTION */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* MY TOKEN CARD */}
        <Card className="overflow-hidden border-teal-200 bg-white shadow-xs rounded-2xl lg:col-span-3">
          <div className="flex items-center justify-between bg-teal-700 px-5 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
                <Ticket className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">
                {t('patient.myToken', 'My Token')}
              </span>
            </div>
            <StatusBadge
              status="WAITING"
              className="border-teal-600 bg-teal-800 text-[10px] text-white"
            />
          </div>

          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="sm:min-w-[95px]">
                <p className="text-[11px] font-medium text-slate-500">
                  {t('patient.yourToken', 'Your Token')}
                </p>
                <p className="mt-0.5 text-3xl font-black tracking-tight text-teal-800">
                  {activeToken.tokenNumber}
                </p>
              </div>

              <div className="grid flex-1 grid-cols-3 gap-2 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.nowServing', 'Now Serving')}
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {INITIAL_LIVE_QUEUE.currentTokenNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.beforeYou', 'Before You')}
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    7
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.waitTime', 'Wait Time')}
                  </p>
                  <p className="mt-1 text-base font-bold text-amber-600">
                    {activeToken.estimatedWaitMinutes} min
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-500">
                  {t('patient.turnCloser', 'Your turn is getting closer')}
                </span>
                <span className="text-[10px] font-bold text-teal-700">
                  45%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[45%] rounded-full bg-teal-600 transition-all" />
              </div>
            </div>

            {/* Hospital & View Live Queue Link */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate">
                  {activeToken.facilityName}
                </span>
              </div>

              <Link to="/patient/tokens">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 rounded-lg border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold cursor-pointer gap-1"
                >
                  {t('patient.viewQueueHistory', 'View Live Queue')}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* MY REFERRAL CARD */}
        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl lg:col-span-2">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <GitBranch className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('patient.myReferral', 'My Referral')}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {t('patient.referredVisit', 'Your referred visit')}
                  </p>
                </div>
              </div>

              <PriorityBadge priority={activeReferral.priority} />
            </div>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  {t('patient.hospital', 'Hospital')}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                  {activeReferral.toFacilityName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.doctorFor', 'Doctor For')}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-800">
                    {activeReferral.toSpecialty}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.visitTime', 'Visit Time')}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-teal-700">
                    {activeReferral.appointmentSlot || '10:00 AM'}
                  </p>
                </div>
              </div>
            </div>

            <Link to="/patient/referrals" className="mt-3 block">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs font-bold cursor-pointer rounded-xl h-8"
              >
                {t('patient.viewReferral', 'View Referral')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ================================================== */}
      {/* 6. RECOMMENDED / NEARBY HOSPITALS (Matching Wireframe) */}
      {/* ================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              {t('patient.hospitalsNearYou', 'Hospitals Near You')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('patient.checkAvailability', 'Check hospital location and availability')}
            </p>
          </div>

          <Link
            to="/patient/facilities"
            className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Map + Hospital List */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 lg:col-span-2 h-[220px] sm:h-[280px]">
            <MapView facilities={INITIAL_FACILITIES} />
          </div>

          <div className="space-y-2.5">
            {nearbyFacilities.map((facility) => (
              <Card
                key={facility.id}
                className="border-slate-200 bg-white p-3.5 shadow-2xs rounded-2xl transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold text-slate-900">
                      {facility.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {facility.distanceKm} km away
                    </div>
                  </div>

                  {facility.isOpen ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      {t('status.open', 'Open')}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                      {t('status.closed', 'Closed')}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px]">
                  <span className="text-slate-600">
                    <strong className="font-bold text-slate-900">{facility.availableBeds}</strong> {t('patient.beds', 'beds')}
                  </span>
                  <span className="text-red-700 font-medium">
                    <strong className="font-bold">{facility.icuBedsAvailable}</strong> {t('patient.icu', 'ICU')}
                  </span>
                </div>

                <Link to={`/patient/facilities/${facility.id}`} className="mt-2.5 block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-full text-xs font-bold cursor-pointer rounded-lg"
                  >
                    {t('patient.viewHospital', 'View Hospital')}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. SANJEEVANI VOICE ASSISTANT MODAL */}
      {/* ================================================== */}
      <SmartHospitalAssistantModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        defaultTab={activeModalTab}
      />

    </div>
  );
};