import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnection } from '@/contexts/ConnectionContext';
import { FrontlineRoleBar } from '@/components/asha/FrontlineRoleBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/Badge';
import {
  INITIAL_ASHA_PATIENTS,
  INITIAL_ASHA_VISITS,
  INITIAL_ASHA_TASKS,
  INITIAL_FRONTLINE_REFERRALS,
} from '@/mock/mockData';
import { FrontlineRoleMode, AshaVisit, FollowUpTask } from '@/types/asha';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Activity,
  ClipboardList,
  AlertOctagon,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Phone,
  GitBranch,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Baby,
  Heart,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

export const AshaDashboard: React.FC = () => {
  const { user } = useAuth();
  const { pendingSyncCount, isOnline } = useConnection();
  const [roleMode, setRoleMode] = useState<FrontlineRoleMode>('ALL');
  const [activeTab, setActiveTab] = useState<'VISITS' | 'TASKS' | 'HIGH_RISK'>('VISITS');

  const todayStr = '2026-03-11';
  const todayVisits = useMemo(
    () => INITIAL_ASHA_VISITS.filter((v) => v.visitDate === todayStr || v.status === 'IN_PROGRESS'),
    []
  );
  const dueTasks = useMemo(
    () => INITIAL_ASHA_TASKS.filter((t) => t.urgency === 'OVERDUE' || t.urgency === 'DUE_TODAY'),
    []
  );
  const highRiskPatients = useMemo(
    () => INITIAL_ASHA_PATIENTS.filter((p) => p.isHighRisk),
    []
  );

  return (
    <div className="space-y-6">
      {/* Frontline Role & Jurisdiction Header */}
      <FrontlineRoleBar
        activeMode={roleMode}
        onModeChange={setRoleMode}
        title={`Namaste, ${user?.name || 'Sunita Devi'}`}
        subtitle="Pethapur Subcentre Cluster • Primary PHC: Pethapur PHC • Dist: Gandhinagar"
      />

      {/* Primary KPI Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Link to="/asha/visits">
          <Card className="p-4 border-slate-200/90 bg-white hover:border-teal-400 hover:shadow-xs transition-all text-left group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Today's Visits
              </span>
              <Calendar className="h-4 w-4 text-teal-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-teal-800 mt-1">{todayVisits.length}</p>
            <span className="text-[11px] text-teal-700 font-medium">Home visits due today</span>
          </Card>
        </Link>

        <Link to="/asha/follow-ups">
          <Card className="p-4 border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-xs transition-all text-left group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Action Tasks
              </span>
              <Clock className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-800 mt-1">{dueTasks.length}</p>
            <span className="text-[11px] text-amber-700 font-medium">Overdue & due today</span>
          </Card>
        </Link>

        <Link to="/asha/high-risk">
          <Card className="p-4 border-rose-200 bg-rose-50/40 hover:border-rose-300 hover:shadow-xs transition-all text-left group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                Priority Cases
              </span>
              <AlertOctagon className="h-4 w-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">{highRiskPatients.length}</p>
            <span className="text-[11px] text-rose-600 font-semibold">Priority monitoring</span>
          </Card>
        </Link>

        <Link to="/asha/patients">
          <Card className="p-4 border-slate-200/90 bg-white hover:border-teal-400 hover:shadow-xs transition-all text-left group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Assigned Cohort
              </span>
              <Users className="h-4 w-4 text-teal-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {INITIAL_ASHA_PATIENTS.length * 52}
            </p>
            <span className="text-[11px] text-slate-500">Pethapur Ward 1–4</span>
          </Card>
        </Link>
      </div>

      {/* Quick Action Hub (6 Core Frontline Flows Aligned to Patient Style) */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 block">
          Frontline Field Operations
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link to="/asha/visits">
            <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group bg-white">
              <Calendar className="h-5 w-5 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-900 block">Home Visits</span>
              <span className="text-[10px] text-slate-500">Daily plan & logging</span>
            </Card>
          </Link>

          <Link to="/asha/patients">
            <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group bg-white">
              <Users className="h-5 w-5 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-900 block">Citizen Roster</span>
              <span className="text-[10px] text-slate-500">Households & Cohort</span>
            </Card>
          </Link>

          <Link to="/asha/patients/new">
            <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group bg-white">
              <UserPlus className="h-5 w-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-900 block">Register Citizen</span>
              <span className="text-[10px] text-slate-500">3-Step offline intake</span>
            </Card>
          </Link>

          <Link to="/asha/vitals">
            <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group bg-white">
              <Activity className="h-5 w-5 text-sky-700 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-900 block">Record Vitals</span>
              <span className="text-[10px] text-slate-500">BP, Glucose, SpO2</span>
            </Card>
          </Link>

          <Link to="/asha/screening">
            <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group bg-white">
              <ClipboardList className="h-5 w-5 text-purple-700 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-900 block">Health Screening</span>
              <span className="text-[10px] text-slate-500">CBAC & Danger Signs</span>
            </Card>
          </Link>

          <Link to="/asha/referrals">
            <Card className="p-3.5 hover:border-amber-500 hover:shadow-md transition-all text-left group bg-amber-50/30">
              <GitBranch className="h-5 w-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-amber-950 block">Referrals & 108</span>
              <span className="text-[10px] text-amber-700">Escalate to PHC / CHC</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* TODAY'S WORK HUB — Task -> Action -> Confirmation Engine */}
      <Card className="border-slate-200/90 bg-white shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-700" />
              Today's Field Operational Hub
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized tasks and field encounters requiring your immediate action in the community.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('VISITS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'VISITS' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visits Due ({todayVisits.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TASKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'TASKS' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Follow-ups ({dueTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HIGH_RISK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HIGH_RISK' ? 'bg-white text-rose-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Priority ({highRiskPatients.length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3">
          {/* TAB 1: VISITS */}
          {activeTab === 'VISITS' && (
            <div className="space-y-3">
              {todayVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-2xs transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{visit.patientName}</span>
                      <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        {visit.visitType?.replace(/_/g, ' ') || 'ANC'}
                      </span>
                      {visit.status === 'IN_PROGRESS' ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          In Progress
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {visit.timeSlot || 'Today'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">{visit.purpose}</p>
                    <p className="text-xs text-slate-500 italic">Address: {visit.address}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {visit.patientPhone && (
                      <a
                        href={`tel:${visit.patientPhone}`}
                        className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        title="Call Citizen"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    <Link to="/asha/vitals">
                      <Button variant="outline" size="sm" className="text-xs min-h-[40px]">
                        Vitals
                      </Button>
                    </Link>
                    <Link to="/asha/visits">
                      <Button variant="primary" size="sm" className="text-xs min-h-[40px] bg-teal-700 hover:bg-teal-800 font-bold">
                        Open Visit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <Link to="/asha/visits" className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1">
                  <span>View All Field Visits</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'TASKS' && (
            <div className="space-y-3">
              {dueTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{task.patientName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          task.urgency === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.urgency === 'OVERDUE' ? 'OVERDUE' : 'DUE TODAY'}
                      </span>
                      <span className="text-xs text-slate-500">({task.village})</span>
                    </div>
                    <p className="text-xs text-slate-800 font-bold">{task.title}</p>
                    <p className="text-xs text-slate-600">{task.actionRequired}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {task.patientPhone && (
                      <a
                        href={`tel:${task.patientPhone}`}
                        className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        title="Call Beneficiary"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    <Link to="/asha/follow-ups">
                      <Button variant="primary" size="sm" className="text-xs min-h-[40px] bg-teal-700 hover:bg-teal-800 font-bold">
                        Review Task
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <Link to="/asha/follow-ups" className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1">
                  <span>Open Follow-ups Register</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: HIGH RISK */}
          {activeTab === 'HIGH_RISK' && (
            <div className="space-y-3">
              {highRiskPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-rose-200 bg-rose-50/30 hover:border-rose-300 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-rose-950">{patient.name}</span>
                      <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                        {patient.category?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">
                        {patient.age}Y, {patient.village}
                      </span>
                    </div>
                    <ul className="text-xs text-rose-900 font-semibold list-disc pl-4 space-y-0.5">
                      {patient.highRiskReasons?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <a
                      href={`tel:${patient.phone}`}
                      className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Call Citizen"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <Link to="/asha/referrals">
                      <Button variant="outline" size="sm" className="text-xs min-h-[40px] border-rose-300 text-rose-900 hover:bg-rose-50">
                        Refer to PHC
                      </Button>
                    </Link>
                    <Link to="/asha/vitals">
                      <Button variant="primary" size="sm" className="text-xs min-h-[40px] bg-rose-700 hover:bg-rose-800 font-bold">
                        Update Vitals
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <Link to="/asha/high-risk" className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1">
                  <span>Open High-Risk Register</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Adaptive Context Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Maternal & Child Focus */}
        <Card className="p-4 border-slate-200/90 bg-white space-y-2">
          <div className="flex items-center gap-2 text-teal-900">
            <Baby className="h-4 w-4 text-teal-700" />
            <span className="font-bold text-xs uppercase tracking-wider">Maternal & Child Cohort</span>
          </div>
          <p className="text-xs text-slate-600">
            <strong>3 ANC Mothers</strong> due for IFA tablets and Td booster. <strong>2 Infants</strong> due for Measles-Rubella (MR) UIP vaccine.
          </p>
          <Link to="/asha/patients" className="text-[11px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1">
            <span>Filter Maternal Cohort</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Card>

        {/* Card 2: NCD & Chronic Telemetry */}
        <Card className="p-4 border-slate-200/90 bg-white space-y-2">
          <div className="flex items-center gap-2 text-indigo-900">
            <Heart className="h-4 w-4 text-indigo-700" />
            <span className="font-bold text-xs uppercase tracking-wider">NCD Screening & BP Clinic</span>
          </div>
          <p className="text-xs text-slate-600">
            <strong>8 Hypertensive Patients</strong> monitored in Pethapur Sector 2. Routine field digital cuff checks due.
          </p>
          <Link to="/asha/vitals" className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1">
            <span>Record NCD Vitals</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Card>

        {/* Card 3: Facilities & Ambulance Link */}
        <Card className="p-4 border-slate-200/90 bg-white space-y-2">
          <div className="flex items-center gap-2 text-amber-900">
            <Building2 className="h-4 w-4 text-amber-700" />
            <span className="font-bold text-xs uppercase tracking-wider">Primary Care Linkage</span>
          </div>
          <p className="text-xs text-slate-600">
            Nearest 24x7 Delivery Point: <strong>Pethapur PHC (3.2 km)</strong>. 108 Emergency Ambulance active on cluster line.
          </p>
          <Link to="/asha/facilities" className="text-[11px] font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1">
            <span>Open Facility Directory</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>
    </div>
  );
};

