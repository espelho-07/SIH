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
  ShieldCheck,
  CheckCircle2,
  Pill,
  Sparkles,
  Mic,
  HeartPulse,
  Users,
  Clock3,
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

  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    'ASSISTANT' | 'STORES'
  >('ASSISTANT');

  return (
    <div className="min-h-full space-y-8 bg-[#F7F4ED] px-1 pb-8 font-sans text-[#29332F]">

      {/* ================================================== */}
      {/* WELCOME / HEALTH IDENTITY */}
      {/* ================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] border border-[#E5DED2] bg-[#FFFDF8] px-6 py-6 shadow-[0_18px_45px_rgba(82,122,104,0.08)] sm:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#DDEDF2] opacity-70 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#F6DED2] opacity-60 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-[#E2F0E8] opacity-70 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#E2F0E8] text-[#527A68] shadow-sm">
              <HeartPulse className="h-7 w-7" />
            </div>

            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#789084]">
                  Your health space
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-[#F0E7D8] px-2.5 py-1 text-[10px] font-bold text-[#92704E]">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('patient.abhaVerified', 'ABHA Verified')}
                </span>
              </div>

              <h1 className="text-xl font-bold tracking-tight text-[#29332F] sm:text-2xl">
                {t(
                  'patient.portalTitle',
                  'Ayushman Bharat Citizen Health Portal'
                )}
              </h1>

              <p className="mt-1 text-xs text-[#71807A]">
                ABHA ID: {activeMember.abhaId}
                <span className="mx-2 text-[#C7CEC9]">•</span>
                Active: {activeMember.name} (
                {activeMember.relation === 'SELF'
                  ? 'Self'
                  : activeMember.relationLabel}
                )
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FamilyMemberSwitcher variant="banner" />

            <div className="flex items-center gap-2 rounded-2xl border border-[#D9E5DE] bg-[#F4F8F5] px-4 py-2.5 text-xs font-semibold text-[#527A68]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A8CDB8] opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#78A890]" />
              </span>
              {t('patient.opdActiveToday', 'OPD Active Today')}
            </div>
          </div>
        </div>
      </section>


      {/* ================================================== */}
      {/* HEALTH SNAPSHOT */}
      {/* ================================================== */}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* TOKEN - MAIN FOCUS */}

        <Card className="group relative overflow-hidden rounded-[2rem] border-[#E5DED2] bg-[#FFFDF8] shadow-[0_15px_35px_rgba(82,122,104,0.07)] lg:col-span-3">
          <CardContent className="p-0">

            <div className="relative overflow-hidden bg-[#EAF3ED] px-6 pb-7 pt-6 sm:px-7">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#DDEDF2] opacity-70 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6C8A7B]">
                    Your queue
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-[#29332F]">
                    {t('patient.myToken', 'My Token')}
                  </h2>
                </div>

                <StatusBadge
                  status="WAITING"
                  className="border-[#C5DACC] bg-[#FFFDF8] text-[10px] text-[#527A68]"
                />
              </div>

              <div className="relative mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#71807A]">
                    {t('patient.yourToken', 'Your Token')}
                  </p>

                  <p className="mt-1 text-5xl font-black tracking-[-0.05em] text-[#527A68] sm:text-6xl">
                    {activeToken.tokenNumber}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#71807A]">
                    <Building2 className="h-3.5 w-3.5 text-[#78A890]" />
                    {activeToken.facilityName}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-[#FFFDF8]/80 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-medium text-[#8A948F]">
                    {t('patient.turnCloser', 'Your turn is getting closer')}
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#527A68]">
                    45%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-[#ECE7DE] px-5 py-5 sm:px-7">
              <div className="pr-3">
                <p className="text-[10px] font-medium text-[#929B96]">
                  {t('patient.nowServing', 'Now Serving')}
                </p>
                <p className="mt-1 text-lg font-bold text-[#29332F]">
                  {INITIAL_LIVE_QUEUE.currentTokenNumber}
                </p>
              </div>

              <div className="px-3">
                <p className="text-[10px] font-medium text-[#929B96]">
                  {t('patient.beforeYou', 'Before You')}
                </p>
                <p className="mt-1 text-lg font-bold text-[#29332F]">
                  7
                </p>
              </div>

              <div className="pl-3">
                <p className="text-[10px] font-medium text-[#929B96]">
                  {t('patient.waitTime', 'Wait Time')}
                </p>
                <p className="mt-1 text-lg font-bold text-[#A86F55]">
                  {activeToken.estimatedWaitMinutes} min
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 sm:px-7">
              <div className="h-2 overflow-hidden rounded-full bg-[#E9EEE9]">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-[#8BB69F] to-[#527A68]" />
              </div>

              <Link to="/patient/tokens" className="mt-4 block">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full gap-1.5 rounded-xl border-[#BCD1C4] text-xs font-bold text-[#527A68] hover:bg-[#F1F7F3] cursor-pointer"
                >
                  {t(
                    'patient.viewQueueHistory',
                    'View Live Queue & History'
                  )}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>


        {/* REFERRAL */}

        <Card className="rounded-[2rem] border-[#E5DED2] bg-[#FFFDF8] shadow-[0_15px_35px_rgba(82,122,104,0.07)] lg:col-span-2">
          <CardContent className="flex h-full flex-col p-6">

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6DED2]">
                  <GitBranch className="h-5 w-5 text-[#A86F55]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A88A7A]">
                    Care journey
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-[#29332F]">
                    {t('patient.myReferral', 'My Referral')}
                  </h2>
                </div>
              </div>

              <PriorityBadge priority={activeReferral.priority} />
            </div>

            <div className="mt-6 flex-1 rounded-[1.5rem] bg-[#FBF3ED] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A88A7A]">
                {t('patient.hospital', 'Hospital')}
              </p>

              <p className="mt-1 text-lg font-bold text-[#29332F]">
                {activeReferral.toFacilityName}
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBDDD4] pb-3">
                  <div>
                    <p className="text-[10px] text-[#929B96]">
                      {t('patient.doctorFor', 'Doctor For')}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#45534C]">
                      {activeReferral.toSpecialty}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFDF8]">
                    <HeartPulse className="h-4 w-4 text-[#A86F55]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#929B96]">
                      {t('patient.visitTime', 'Visit Time')}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#527A68]">
                      {activeReferral.appointmentSlot || 'Not fixed yet'}
                    </p>
                  </div>

                  <Clock3 className="h-5 w-5 text-[#78A890]" />
                </div>
              </div>
            </div>

            <Link to="/patient/referrals" className="mt-4 block">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full gap-1.5 rounded-xl border-[#D9B7A5] text-xs font-bold text-[#9A684F] hover:bg-[#FCF1EB] cursor-pointer"
              >
                {t('patient.viewReferral', 'View Referral')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>


      {/* ================================================== */}
      {/* AI ASSISTANT - FEATURE CARD */}
      {/* ================================================== */}

      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#BFD7CA] bg-[#E7F1EA] p-6 shadow-[0_18px_45px_rgba(82,122,104,0.08)] sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#DDEDF2] opacity-80 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-[#F6DED2] opacity-80 blur-3xl" />

        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">

          <div className="flex items-start gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-[#FFFDF8] text-[#527A68] shadow-md">
              <Mic className="h-7 w-7" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full border-2 border-[#E7F1EA] bg-[#78A890]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#527A68] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                  <Sparkles className="h-3 w-3" />
                  AI Voice Triage
                </span>

                <span className="rounded-full bg-[#FFFDF8]/80 px-3 py-1 text-[10px] font-bold text-[#527A68]">
                  Gujarati • Hindi • English
                </span>
              </div>

              <h2 className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-[#29332F] sm:text-3xl">
                Tell Sanjeevani what you need.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736D]">
                “Tamare kem hospital javu che?” — Speak or tap your symptom
                and find the right hospital, doctor and available beds.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#527A68]">
                <span className="rounded-full bg-[#D6E9DD] px-3 py-1.5">
                  ✓ Doctor match
                </span>
                <span className="rounded-full bg-[#DDEDF2] px-3 py-1.5 text-[#5E8794]">
                  ✓ Bed availability
                </span>
                <span className="rounded-full bg-[#F6DED2] px-3 py-1.5 text-[#A86F55]">
                  ✓ Nearby hospitals
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button
              onClick={() => {
                setActiveModalTab('ASSISTANT');
                setIsFacilityModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="h-11 min-w-[190px] gap-2 rounded-2xl bg-[#527A68] px-5 text-xs font-extrabold text-white shadow-md shadow-[#527A68]/15 hover:bg-[#456957] cursor-pointer"
            >
              <Mic className="h-4 w-4" />
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
              className="h-11 min-w-[190px] gap-2 rounded-2xl border-[#B9D0C1] bg-[#FFFDF8]/70 px-5 text-xs font-bold text-[#527A68] hover:bg-[#F7FBF8] cursor-pointer"
            >
              <Pill className="h-3.5 w-3.5" />
              <span>
                {t('patient.findMedicalStores', 'Medical Stores')}
              </span>
            </Button>
          </div>
        </div>
      </section>


      {/* ================================================== */}
      {/* NEARBY HOSPITALS */}
      {/* ================================================== */}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-8 rounded-full bg-[#78A890]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#789084]">
                Healthcare around you
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#29332F]">
              {t('patient.hospitalsNearYou', 'Hospitals Near You')}
            </h2>

            <p className="mt-1 text-sm text-[#71807A]">
              {t(
                'patient.checkAvailability',
                'Check hospital location and availability'
              )}
            </p>
          </div>

          <Link to="/patient/facilities">
            <Button
              variant="primary"
              size="sm"
              className="w-full gap-1.5 rounded-2xl bg-[#527A68] px-4 text-xs font-bold text-white hover:bg-[#456957] sm:w-auto cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5" />
              {t('patient.findHospital', 'Find Hospital')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>


        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">

          {/* MAP */}

          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-[#E5DED2] bg-[#FFFDF8] p-2 shadow-[0_15px_35px_rgba(82,122,104,0.07)]">
            <div className="h-full min-h-[404px] overflow-hidden rounded-[1.5rem]">
              <MapView facilities={INITIAL_FACILITIES} />
            </div>
          </div>


          {/* HOSPITAL LIST */}

          <div className="space-y-3">
            {nearbyFacilities.map((facility, index) => (
              <Card
                key={facility.id}
                className="group rounded-[1.5rem] border-[#E5DED2] bg-[#FFFDF8] p-5 shadow-[0_10px_25px_rgba(82,122,104,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(82,122,104,0.10)]"
              >
                <div className="flex items-start gap-3">

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      index === 0
                        ? 'bg-[#E2F0E8] text-[#527A68]'
                        : index === 1
                        ? 'bg-[#DDEDF2] text-[#5E8794]'
                        : 'bg-[#F6DED2] text-[#A86F55]'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#29332F]">
                          {facility.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#71807A]">
                          <MapPin className="h-3 w-3 text-[#78A890]" />
                          {facility.distanceKm} km away
                        </div>
                      </div>

                      {facility.isOpen ? (
                        <span className="shrink-0 rounded-full bg-[#E2F0E8] px-2.5 py-1 text-[10px] font-bold text-[#5F9077]">
                          {t('status.open', 'Open')}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-[#F0ECE6] px-2.5 py-1 text-[10px] font-bold text-[#7A847F]">
                          {t('status.closed', 'Closed')}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-[#F3F6F1] px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-[#929B96]">
                          {t('patient.beds', 'Beds')}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#29332F]">
                          {facility.availableBeds}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FCF0EE] px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-[#A98B87]">
                          {t('patient.icu', 'ICU')}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#AD625C]">
                          {facility.icuBedsAvailable}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/patient/facilities/${facility.id}`}
                      className="mt-3 block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full rounded-xl border-[#C8D8CE] text-xs font-bold text-[#527A68] hover:bg-[#F1F7F3] cursor-pointer"
                      >
                        {t(
                          'patient.viewHospital',
                          'View Hospital'
                        )}
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* ================================================== */}
      {/* MODAL */}
      {/* ================================================== */}

      <SmartHospitalAssistantModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        defaultTab={activeModalTab}
      />
    </div>
  );
};
