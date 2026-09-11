import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { tokenApi } from '@/api/queueApi';
import { INITIAL_LIVE_QUEUE } from '@/mock/mockData';
import { Token } from '@/types/queue';

import {
  Ticket,
  Clock,
  Building2,
  BellRing,
  Navigation,
  CheckCircle2,
  PlusCircle,
  Users,
  MapPin,
} from 'lucide-react';

export const TokenExperience: React.FC = () => {
  const { user } = useAuth();
  const { simulateCallToken } = useSocket();

  const [token, setToken] = useState<Token>(
    INITIAL_LIVE_QUEUE.tokens.find(
      (t) => t.patientId === 'usr_pat_01'
    ) || INITIAL_LIVE_QUEUE.tokens[3]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewTokenForm, setShowNewTokenForm] = useState(false);

  const [dept, setDept] = useState('dep_med');
  const [facilityId, setFacilityId] = useState('fac_civil_01');

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsGenerating(true);

    try {
      const res = await tokenApi.generateToken({
        patientName: user?.name || 'Rameshwar Sharma',
        patientPhone: user?.phone || '9876543210',
        facilityId,
        departmentId: dept,
      });

      setToken(res.data);
      setShowNewTokenForm(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="My Token"
        subtitle="Check your token number and see when it is your turn."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'My Token' },
        ]}
        actions={
          <Button
            onClick={() => setShowNewTokenForm(!showNewTokenForm)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            New Token
          </Button>
        }
      />


      {/* =====================================================
          NEW TOKEN
      ====================================================== */}

      {showNewTokenForm && (
        <Card className="border-teal-200 bg-teal-50/50 shadow-sm">

          <CardContent className="p-4">

            <h2 className="text-sm font-bold text-slate-900">
              Get a New Token
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Select the hospital and department you want to visit.
            </p>


            <form
              onSubmit={handleGenerateToken}
              className="mt-4 space-y-3"
            >

              {/* Hospital */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Hospital
                </label>

                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-teal-500"
                >

                  <option value="fac_civil_01">
                    Gandhinagar Civil Hospital
                  </option>

                  <option value="fac_mansa_02">
                    Mansa Community Health Centre
                  </option>

                  <option value="fac_kalol_03">
                    Kalol Sub-District Hospital
                  </option>

                  <option value="fac_pet_04">
                    Pethapur Primary Health Centre
                  </option>

                </select>

              </div>


              {/* Department */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Department
                </label>

                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-teal-500"
                >

                  <option value="dep_med">
                    General Medicine
                  </option>

                  <option value="dep_card">
                    Heart / Cardiology
                  </option>

                  <option value="dep_ortho">
                    Bone & Joint
                  </option>

                  <option value="dep_ped">
                    Children
                  </option>

                </select>

              </div>


              {/* Buttons */}

              <div className="flex justify-end gap-2 pt-1">

                <Button
                  type="button"
                  onClick={() => setShowNewTokenForm(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isGenerating}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  Get Token
                </Button>

              </div>

            </form>

          </CardContent>

        </Card>
      )}


      {/* =====================================================
          TOKEN CARD
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">

        {/* Token Number */}

        <div className="bg-teal-700 px-5 py-6 text-center text-white">

          <p className="text-xs font-medium text-teal-100">
            Your Token Number
          </p>

          <h1 className="mt-1 text-6xl font-black tracking-tight">
            {token.tokenNumber}
          </h1>

          <p className="mt-2 text-xs text-teal-100">
            {token.patientName}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">

            <CheckCircle2 className="h-3.5 w-3.5" />

            {token.status}

          </div>

        </div>


        <CardContent className="p-4 sm:p-5">


          {/* =================================================
              SIMPLE QUEUE INFORMATION
          ================================================== */}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

            {/* People Ahead */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">

              <Users className="mx-auto h-4 w-4 text-teal-600" />

              <p className="mt-1 text-[10px] text-slate-500">
                People Ahead
              </p>

              <p className="mt-0.5 text-xl font-bold text-slate-900">
                {token.positionInQueue}
              </p>

            </div>


            {/* Waiting Time */}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">

              <Clock className="mx-auto h-4 w-4 text-amber-600" />

              <p className="mt-1 text-[10px] text-amber-700">
                Waiting Time
              </p>

              <p className="mt-0.5 text-xl font-bold text-slate-900">
                {token.estimatedWaitMinutes}
                <span className="ml-1 text-xs font-medium">
                  min
                </span>
              </p>

            </div>


            {/* Current Token */}

            <div className="col-span-2 rounded-xl border border-teal-100 bg-teal-50 p-3 text-center sm:col-span-1">

              <Ticket className="mx-auto h-4 w-4 text-teal-700" />

              <p className="mt-1 text-[10px] text-teal-700">
                Current Token
              </p>

              <p className="mt-0.5 text-xl font-bold text-teal-800">
                {INITIAL_LIVE_QUEUE.currentTokenNumber}
              </p>

            </div>

          </div>


          {/* =================================================
              SIMPLE PROGRESS
          ================================================== */}

          <div className="mt-5">

            <div className="flex items-center justify-between">

              <p className="text-xs font-semibold text-slate-700">
                Your Turn
              </p>

              <p className="text-[10px] text-teal-700">
                Please wait
              </p>

            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

              <div className="h-full w-[65%] rounded-full bg-teal-600" />

            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              You will be called when it is your turn.
            </p>

          </div>


          {/* =================================================
              HOSPITAL INFORMATION
          ================================================== */}

          <div className="mt-5 rounded-xl border border-slate-200 bg-white">

            <div className="flex items-start gap-3 p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">

                <Building2 className="h-4 w-4 text-teal-700" />

              </div>


              <div className="min-w-0 flex-1">

                <p className="text-xs font-bold text-slate-900">
                  {token.facilityName}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {token.departmentName}
                </p>

                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">

                  <MapPin className="h-3 w-3" />

                  Room 4

                </div>

              </div>

            </div>


            {/* Buttons */}

            <div className="flex gap-2 border-t border-slate-100 p-3">

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full gap-1.5 text-[11px]"
                >
                  <Navigation className="h-3.5 w-3.5" />

                  Directions

                </Button>

              </a>


              <Button
                onClick={() => simulateCallToken(token)}
                variant="primary"
                size="sm"
                className="h-8 flex-1 gap-1.5 bg-teal-700 text-[11px] hover:bg-teal-800"
              >

                <BellRing className="h-3.5 w-3.5" />

                Test Alert

              </Button>

            </div>

          </div>


          {/* =================================================
              SIMPLE MESSAGE
          ================================================== */}

          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5">

            <p className="text-xs font-semibold text-slate-700">
              Please stay near the hospital.
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Keep checking your token number. You will be called when your turn comes.
            </p>

          </div>

        </CardContent>

      </Card>

    </div>
  );
};