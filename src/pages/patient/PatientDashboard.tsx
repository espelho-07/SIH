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
} from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { FamilyMemberSwitcher } from '@/components/patient/FamilyMemberSwitcher';
import { SmartHospitalAssistantModal } from '@/components/patient/SmartHospitalAssistantModal';
import { useTranslation } from 'react-i18next';

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
  const [activeModalTab, setActiveModalTab] = useState<'ASSISTANT' | 'STORES' | 'TRIAGE'>('ASSISTANT');

  return (
    <div className="relative min-h-full space-y-7 font-sans">
      {/* Liquid Light Green Ambient Background Mesh Glows */}
      <div className="pointer-events-none absolute -top-10 left-1/4 -z-10 h-80 w-80 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="pointer-events-none absolute top-72 right-5 -z-10 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-10 -z-10 h-72 w-72 rounded-full bg-emerald-100/35 blur-3xl" />

      {/* ================================================== */}
      {/* CITIZEN HEALTH BAR / ABHA IDENTITY (Liquid Light Green) */}
      {/* ================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-300/60 bg-gradient-to-r from-emerald-500/90 via-teal-600/90 to-emerald-600/95 p-5 text-white shadow-lg backdrop-blur-md">
        {/* Ambient Liquid Aura Highlights */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-emerald-300/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-teal-300/30 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 border border-white/30 text-white shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold tracking-tight text-white sm:text-base drop-shadow-xs">
                  {t('patient.portalTitle', 'Ayushman Bharat Citizen Health Portal')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-200" /> {t('patient.abhaVerified', 'ABHA Verified')}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5 font-mono">
                ABHA ID: {activeMember.abhaId} • Active: {activeMember.name} ({activeMember.relation === 'SELF' ? 'Self' : activeMember.relationLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <FamilyMemberSwitcher variant="banner" />
            <div className="flex items-center gap-1.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
              <span>{t('patient.opdActiveToday', 'OPD Active Today')}</span>
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

        <Card className="overflow-hidden rounded-3xl border border-emerald-100/80 bg-white/95 shadow-sm backdrop-blur-md lg:col-span-3 transition-all hover:shadow-md hover:border-emerald-200">

          {/* Header - Liquid Light Mint/Green Glass */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50/80 to-emerald-50/60 border-b border-emerald-100/80 px-5 py-3.5 text-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 shadow-2xs">
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block leading-tight">
                  {t('patient.myToken', 'My Token')}
                </span>
                <span className="text-[10px] font-medium text-emerald-700">
                  Live OPD Queue Connected
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 border border-emerald-300/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              WAITING
            </span>
          </div>

          <CardContent className="p-5">
            {/* Main Token Information */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Token */}
              <div className="sm:min-w-[100px]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('patient.yourToken', 'Your Token')}
                </p>
                <p className="mt-0.5 text-3xl sm:text-4xl font-black tracking-tight text-emerald-700 font-mono">
                  {activeToken.tokenNumber}
                </p>
              </div>

              {/* Information in Soft Liquid Light Green Cards */}
              <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-3 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/50 p-2.5 text-center sm:text-left">
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.nowServing', 'Now Serving')}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-900 font-mono">
                    {INITIAL_LIVE_QUEUE.currentTokenNumber}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/50 p-2.5 text-center sm:text-left">
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.beforeYou', 'Before You')}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-900">
                    7
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/50 p-2.5 text-center sm:text-left">
                  <p className="text-[10px] font-medium text-slate-400">
                    {t('patient.waitTime', 'Wait Time')}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-emerald-700">
                    {activeToken.estimatedWaitMinutes} min
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar in Liquid Light Green */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-500">
                  {t('patient.turnCloser', 'Your turn is getting closer')}
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  45%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100/60 p-0.5">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-xs" />
              </div>
            </div>

            {/* Hospital & View Live Queue Link */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-slate-700">
                  {activeToken.facilityName}
                </span>
              </div>

              <Link to="/patient/tokens">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 font-semibold cursor-pointer gap-1.5 bg-emerald-50/30 shadow-2xs"
                >
                  {t('patient.viewQueueHistory', 'View Live Queue & History')}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>


        {/* ================================================== */}
        {/* MY REFERRAL */}
        {/* ================================================== */}

        <Card className="rounded-3xl border border-emerald-100/80 bg-white/95 shadow-sm backdrop-blur-md lg:col-span-2 transition-all hover:shadow-md hover:border-emerald-200">

          <CardContent className="p-5">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-600 shadow-2xs">
                  <GitBranch className="h-4 w-4" />
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

            {/* Referral Details in soft liquid light green box */}
            <div className="space-y-3 rounded-2xl border border-emerald-100/60 bg-emerald-50/30 p-4">
              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  {t('patient.hospital', 'Hospital')}
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {activeReferral.toFacilityName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-emerald-100/40">
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
                  <p className="mt-0.5 text-xs font-bold text-emerald-700">
                    {activeReferral.appointmentSlot || t('patient.notFixedYet', 'Not fixed yet')}
                  </p>
                </div>
              </div>
            </div>

            {/* View Referral */}
            <Link to="/patient/referrals" className="mt-4 block">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs h-8 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 font-semibold bg-emerald-50/20 shadow-2xs"
              >
                {t('patient.viewReferral', 'View Referral')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

          </CardContent>

        </Card>

      </div>


      {/* ================================================== */}
      {/* SANJEEVANI VOICE & HOSPITAL ASSISTANT (Liquid Light Green Glow) */}
      {/* ================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-300/60 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-xl">
        {/* Animated Fluid Liquid Blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 border border-white/30 text-white shadow-md backdrop-blur-md">
              <Mic className="h-7 w-7 text-emerald-100 animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
                  <Sparkles className="h-3 w-3 text-emerald-200" /> AI Voice Triage
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 border border-emerald-300/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-100">
                  Gujarati • Hindi • English
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-100">
                  ● Real-Time Doctor & Bed Match
                </span>
              </div>
              <h3 className="mt-1.5 text-base sm:text-lg font-black text-white tracking-tight drop-shadow-xs">
                "Tamare kem hospital javu che?" — Speak with Sanjeevani Assistant
              </h3>
              <p className="mt-0.5 text-xs text-emerald-100/90 max-w-xl leading-relaxed">
                Tell your symptom (fracture, fever, chest pain, delivery) in voice or tap. Assistant directly finds the best hospital with on-duty doctors and available beds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap">
            <Button
              onClick={() => {
                setActiveModalTab('ASSISTANT');
                setIsFacilityModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="w-full sm:w-auto gap-2 bg-white hover:bg-emerald-50 text-emerald-900 shadow-md font-extrabold text-xs h-10 px-4 rounded-xl cursor-pointer transition-all hover:scale-102"
            >
              <Mic className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>🎙️ Ask Assistant (બોલો)</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
            </Button>

            <Button
              onClick={() => {
                setActiveModalTab('TRIAGE');
                setIsFacilityModalOpen(true);
              }}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-1.5 bg-white/15 hover:bg-white/25 text-white border-white/30 font-bold text-xs h-10 px-3.5 rounded-xl cursor-pointer backdrop-blur-md"
            >
              <span>🩺</span>
              <span>Check Symptoms</span>
            </Button>

            <Button
              onClick={() => {
                setActiveModalTab('STORES');
                setIsFacilityModalOpen(true);
              }}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-1.5 bg-white/15 hover:bg-white/25 text-white border-white/30 font-bold text-xs h-10 px-3.5 rounded-xl cursor-pointer backdrop-blur-md"
            >
              <Pill className="h-3.5 w-3.5 text-emerald-200" />
              <span>Medical Stores</span>
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
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t('patient.hospitalsNearYou', 'Hospitals Near You')}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {t('patient.checkAvailability', 'Check hospital location and availability')}
            </p>
          </div>

          {/* Find Hospital */}
          <Link to="/patient/facilities">
            <Button
              variant="primary"
              size="sm"
              className="w-full gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-xs hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-xs font-semibold sm:w-auto"
            >
              <Building2 className="h-3.5 w-3.5" />
              {t('patient.findHospital', 'Find Hospital')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>


        {/* Map + Hospital List */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* MAP */}
          <div className="overflow-hidden rounded-3xl border border-emerald-100/80 shadow-xs lg:col-span-2">
            <MapView facilities={INITIAL_FACILITIES} />
          </div>


          {/* HOSPITALS */}
          <div className="space-y-3">
            {nearbyFacilities.map((facility) => (
              <Card
                key={facility.id}
                className="border-emerald-100/80 bg-white/95 p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300 rounded-3xl backdrop-blur-sm"
              >
                {/* Hospital Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {facility.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      {facility.distanceKm} {t('common.kmAway', 'km away')}
                    </div>
                  </div>

                  {facility.isOpen ? (
                    <span className="shrink-0 rounded-full bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-2xs">
                      {t('status.open', 'Open')}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {t('status.closed', 'Closed')}
                    </span>
                  )}
                </div>

                {/* Availability */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50/40 border border-emerald-100/60 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] text-slate-600">
                      <strong className="font-bold text-emerald-800">
                        {facility.availableBeds}
                      </strong>{' '}
                      {t('patient.beds', 'beds')}
                    </span>
                  </div>

                  <span className="text-[11px] text-rose-700">
                    <strong className="font-semibold">
                      {facility.icuBedsAvailable}
                    </strong>{' '}
                    {t('patient.icu', 'ICU')}
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
                    className="h-8 w-full text-xs rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-semibold bg-emerald-50/20 shadow-2xs"
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
      {/* SANJEEVANI VOICE & HOSPITAL ASSISTANT MODAL */}
      {/* ================================================== */}
      <SmartHospitalAssistantModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        defaultTab={activeModalTab}
      />

    </div>
  );
};