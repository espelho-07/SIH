import React from 'react';
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
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  const activeToken =
    INITIAL_LIVE_QUEUE.tokens.find(
      (t) => t.patientId === 'usr_pat_01'
    ) || INITIAL_LIVE_QUEUE.tokens[3];

  const activeReferral = INITIAL_REFERRALS[0];

  const nearbyFacilities = INITIAL_FACILITIES.slice(0, 3);

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
                ABHA ID: 91-4820-1940-2819 • Primary Center: Pethapur PHC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
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


            {/* Hospital */}

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">

              <Building2 className="h-3.5 w-3.5 text-teal-700" />

              <span className="text-xs font-medium text-slate-600">
                {activeToken.facilityName}
              </span>

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

    </div>
  );
};