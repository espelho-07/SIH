import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/Badge';
import { INITIAL_LIVE_QUEUE } from '@/mock/mockData';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Ticket,
  Users,
  GitBranch,
  Video,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  const queue = INITIAL_LIVE_QUEUE;

  const waitingTokens = queue.tokens.filter(
    (t) => t.status === 'WAITING'
  );

  return (
    <div className="space-y-5">

      {/* Welcome Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                <Stethoscope className="h-3.5 w-3.5 text-sky-700" />
                OPD Clinical Specialist
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                Room 4
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome, {user?.name || 'Dr. Arvind Patel'}
            </h1>

            <p className="text-xs text-slate-500">
              Department of General Medicine • Gandhinagar Civil Hospital
            </p>
          </div>

          <Link to="/doctor/queue">
            <Button
              size="md"
              className="bg-sky-700 hover:bg-sky-800 text-white font-semibold gap-2 shadow-xs w-full sm:w-auto"
            >
              <Ticket className="h-4 w-4" />
              View Patient Queue
            </Button>
          </Link>

        </div>
      </div>


      {/* Today's Summary */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-2.5">
          Today’s Summary
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Waiting */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-sky-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Patients
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2.5">
                {queue.totalWaiting}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Waiting
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                About 8 min. each
              </p>
            </CardContent>
          </Card>


          {/* Current Patient */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-sky-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Token
                </span>
              </div>
              <p className="text-2xl font-bold text-sky-800 mt-2.5">
                {queue.currentTokenNumber}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Now Seeing
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Room 4
              </p>
            </CardContent>
          </Card>


          {/* Urgent */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-rose-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Attention
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-700 mt-2.5">
                1
              </p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                Urgent Patient
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Needs quick attention
              </p>
            </CardContent>
          </Card>


          {/* Referrals */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <GitBranch className="h-4 w-4 text-indigo-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Action
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2.5">
                2
              </p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                Referrals
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Patients to refer
              </p>
            </CardContent>
          </Card>

        </div>
      </div>


      {/* Patients + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Waiting Patients */}
        <Card className="lg:col-span-2 border-slate-200">

          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">

            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Patients Waiting
              </CardTitle>

              <p className="text-xs text-slate-500 mt-0.5">
                Patients ready to see the doctor
              </p>
            </div>

            <Link to="/doctor/queue">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>

          </CardHeader>


          <CardContent className="p-4 pt-1.5 space-y-2.5">

            {waitingTokens.length === 0 ? (

              <div className="py-8 text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-teal-700" />
                </div>

                <p className="font-semibold text-sm text-slate-800 mt-2.5">
                  No patients waiting
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  The queue is currently clear.
                </p>
              </div>

            ) : (

              waitingTokens.map((t) => (

                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >

                  {/* Patient Information */}
                  <div className="flex items-center gap-2.5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-bold text-xs">
                      {t.tokenNumber}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {t.patientName}
                      </h3>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.patientAge} years • {t.patientGender}
                      </p>

                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />

                        <p className="text-[11px] text-slate-500">
                          Waiting {t.estimatedWaitMinutes} min
                        </p>
                      </div>
                    </div>

                  </div>


                  {/* Patient Action */}
                  <div className="flex items-center gap-2">

                    <PriorityBadge priority={t.priority} />

                    <Link to={`/doctor/patients/${t.patientId}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs bg-sky-700 hover:bg-sky-800 font-semibold text-white"
                      >
                        Open Patient
                      </Button>
                    </Link>

                  </div>

                </div>

              ))

            )}

          </CardContent>
        </Card>


        {/* Quick Actions */}
        <Card className="border-slate-200 h-fit">

          <CardHeader className="pb-2 px-4 pt-4">

            <CardTitle className="text-base font-bold text-slate-900">
              Quick Actions
            </CardTitle>

            <p className="text-xs text-slate-500 mt-0.5">
              Common things you can do
            </p>

          </CardHeader>


          <CardContent className="p-4 pt-1.5 space-y-2">

            {/* Refer Patient */}
            <Link to="/doctor/referrals" className="block">

              <Button
                variant="outline"
                size="md"
                className="w-full justify-start gap-2.5 text-xs text-left h-11"
              >
                <div className="h-7 w-7 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <GitBranch className="h-3.5 w-3.5 text-teal-700" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    Refer Patient
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Find another hospital
                  </p>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

            </Link>


            {/* Video Consultation */}
            <Link to="/doctor/teleconsultations" className="block">

              <Button
                variant="outline"
                size="md"
                className="w-full justify-start gap-2.5 text-xs text-left h-11"
              >
                <div className="h-7 w-7 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                  <Video className="h-3.5 w-3.5 text-sky-700" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    Video Consultation
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Talk to a specialist
                  </p>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

            </Link>


            {/* Open Patient */}
            <Link
              to="/doctor/patients/usr_pat_01"
              className="block"
            >

              <Button
                variant="outline"
                size="md"
                className="w-full justify-start gap-2.5 text-xs text-left h-11"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-3.5 w-3.5 text-indigo-700" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    Open Patient
                  </p>

                  <p className="text-[10px] text-slate-500">
                    View patient details
                  </p>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

            </Link>

          </CardContent>
        </Card>

      </div>

    </div>
  );
};