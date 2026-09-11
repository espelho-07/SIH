import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnection } from '@/contexts/ConnectionContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { INITIAL_ASHA_PATIENTS, INITIAL_ASHA_VISITS } from '@/mock/mockData';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Activity,
  ClipboardList,
  AlertOctagon,
  RefreshCw,
  WifiOff,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AshaDashboard: React.FC = () => {
  const { user } = useAuth();
  const { networkState, pendingSyncCount, syncOfflineQueue, isOnline } = useConnection();

  const highRiskCount = INITIAL_ASHA_PATIENTS.filter((p) => p.isHighRisk).length;
  const todayVisits = INITIAL_ASHA_VISITS;

  return (
    <div className="space-y-6">
      {/* Top Frontline Worker Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Frontline Healthcare Console • ASHA / ANM / CHO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Sunita Devi'}
          </h1>
          <p className="text-xs text-emerald-100/90">
            Sector: <strong>Pethapur Subcentre Cluster</strong> • Primary PHC: Pethapur PHC
          </p>
        </div>

        {/* Sync Status Tile */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 flex items-center gap-3 border border-white/20">
          <div className="rounded-xl bg-white p-2.5 text-emerald-800">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-emerald-100">Sync Pipeline</p>
            <p className="text-sm font-extrabold">
              {pendingSyncCount > 0 ? `${pendingSyncCount} Changes Queued` : 'Fully Synchronized'}
            </p>
            {pendingSyncCount > 0 && isOnline && (
              <button
                onClick={syncOfflineQueue}
                className="text-[11px] underline text-emerald-200 hover:text-white font-bold"
              >
                Sync Now to Server
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-4 border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Cohort</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">428</p>
          <span className="text-[11px] text-slate-400">Pethapur Ward 1–4</span>
        </Card>

        <Card className="p-4 border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Today's Visits</span>
          <p className="text-2xl sm:text-3xl font-black text-teal-700 mt-1">{todayVisits.length}</p>
          <span className="text-[11px] text-teal-800 font-medium">Home visits due</span>
        </Card>

        <Card className="p-4 border-rose-200 bg-rose-50/40 shadow-xs">
          <span className="text-xs font-bold text-rose-800 uppercase">High-Risk Register</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">{highRiskCount}</p>
          <span className="text-[11px] text-rose-600 font-semibold">Priority monitoring</span>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase">Offline Buffer</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{pendingSyncCount}</p>
          <span className="text-[11px] text-amber-700">IndexedDB stored</span>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link to="/asha/patients/new">
          <Card className="p-3.5 hover:border-emerald-500 hover:shadow-md transition-all group text-left">
            <UserPlus className="h-5 w-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Register Citizen</span>
            <span className="text-[10px] text-slate-500">Multi-step form</span>
          </Card>
        </Link>

        <Link to="/asha/vitals">
          <Card className="p-3.5 hover:border-emerald-500 hover:shadow-md transition-all group text-left">
            <Activity className="h-5 w-5 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Record Vitals</span>
            <span className="text-[10px] text-slate-500">BP, Sugar, SpO2</span>
          </Card>
        </Link>

        <Link to="/asha/screening">
          <Card className="p-3.5 hover:border-emerald-500 hover:shadow-md transition-all group text-left">
            <ClipboardList className="h-5 w-5 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Health Screening</span>
            <span className="text-[10px] text-slate-500">Maternal, NCD</span>
          </Card>
        </Link>

        <Link to="/asha/high-risk">
          <Card className="p-3.5 hover:border-rose-400 hover:shadow-md transition-all group text-left bg-rose-50/30">
            <AlertOctagon className="h-5 w-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-rose-950 block">High-Risk Register</span>
            <span className="text-[10px] text-rose-700">Triage red flags</span>
          </Card>
        </Link>

        <Link to="/asha/sync" className="col-span-2 sm:col-span-1">
          <Card className="p-3.5 hover:border-amber-500 hover:shadow-md transition-all group text-left">
            <RefreshCw className="h-5 w-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Sync Center</span>
            <span className="text-[10px] text-slate-500">View queued data</span>
          </Card>
        </Link>
      </div>

      {/* Today's Scheduled Home Visits */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Today's Field Encounters & Visits</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Community outreach, ANC maternal follow-ups & NCD visits</p>
          </div>
          <Link to="/asha/patients">
            <Button variant="outline" size="sm" className="text-xs">
              View Citizen Roster
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {todayVisits.map((visit) => (
            <div
              key={visit.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{visit.patientName}</span>
                  {visit.requiresReferral && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      Referral Indicated
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium">{visit.purpose}</p>
                <p className="text-xs text-slate-500 italic">{visit.notes}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link to="/asha/vitals">
                  <Button variant="outline" size="sm" className="text-xs min-h-[40px]">
                    Check Vitals
                  </Button>
                </Link>
                <Link to="/asha/screening">
                  <Button variant="primary" size="sm" className="text-xs min-h-[40px] bg-emerald-700 hover:bg-emerald-800">
                    Conduct Screening
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
