import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { INITIAL_LIVE_QUEUE, INITIAL_REFERRALS } from '@/mock/mockData';
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
  CheckCircle2,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const queue = INITIAL_LIVE_QUEUE;
  const waitingTokens = queue.tokens.filter((t) => t.status === 'WAITING');

  return (
    <div className="space-y-6">
      {/* Clinician Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-300">
            Clinical Practitioner Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || 'Dr. Arvind Patel'}
          </h1>
          <p className="text-xs text-teal-100/80">
            Senior Consultant Physician • Gandhinagar Civil Hospital • Room 4 (General Medicine OPD)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/doctor/queue">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-500 font-bold text-white gap-2 shadow-md">
              <Ticket className="h-5 w-5" />
              <span>Open Live OPD Queue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Waiting Patients</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{queue.totalWaiting}</p>
          <span className="text-[11px] text-teal-800 font-medium">~8 mins / consult</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Calling</span>
          <p className="text-3xl font-black text-teal-700 mt-1">{queue.currentTokenNumber}</p>
          <span className="text-[11px] text-slate-500">In Room 4</span>
        </Card>

        <Card className="p-4 border-rose-200 bg-rose-50/40">
          <span className="text-xs font-bold text-rose-800 uppercase">Urgent Triage Cases</span>
          <p className="text-3xl font-black text-rose-700 mt-1">1</p>
          <span className="text-[11px] text-rose-600 font-semibold">Pre-eclampsia triage</span>
        </Card>

        <Card className="p-4 border-indigo-200 bg-indigo-50/40">
          <span className="text-xs font-bold text-indigo-800 uppercase">Pending Referrals</span>
          <p className="text-3xl font-black text-indigo-700 mt-1">2</p>
          <span className="text-[11px] text-indigo-600 font-semibold">Incoming tertiary cases</span>
        </Card>
      </div>

      {/* Live Waiting Patients Snapshot & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Next Waiting OPD Patients</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Triage prioritized queue order</p>
            </div>
            <Link to="/doctor/queue">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>Manage Full Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            {waitingTokens.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-black text-sm">
                    {t.tokenNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{t.patientName}</h3>
                    <p className="text-xs text-slate-500">
                      {t.patientAge}Y, {t.patientGender} • Wait: {t.estimatedWaitMinutes}m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <Link to={`/doctor/patients/${t.patientId}`}>
                    <Button variant="primary" size="sm" className="text-xs bg-teal-700 hover:bg-teal-800">
                      Open Chart
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Launch Clinical Tools */}
        <div className="space-y-4">
          <Card className="p-5 border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
              Clinical Workspace Actions
            </h3>

            <div className="space-y-2">
              <Link to="/doctor/referrals" className="block">
                <Button variant="outline" size="md" className="w-full justify-start gap-2.5 text-xs text-left">
                  <GitBranch className="h-4 w-4 text-teal-700" />
                  <span>Refer Patient & Match Facilities</span>
                </Button>
              </Link>

              <Link to="/doctor/teleconsultations" className="block">
                <Button variant="outline" size="md" className="w-full justify-start gap-2.5 text-xs text-left">
                  <Video className="h-4 w-4 text-sky-700" />
                  <span>Start Teleconsultation Call</span>
                </Button>
              </Link>

              <Link to="/doctor/patients/usr_pat_01" className="block">
                <Button variant="outline" size="md" className="w-full justify-start gap-2.5 text-xs text-left">
                  <Stethoscope className="h-4 w-4 text-indigo-700" />
                  <span>Open Active Patient Encounter</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
