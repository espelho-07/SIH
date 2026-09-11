import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { tokenApi } from '@/api/queueApi';
import { INITIAL_LIVE_QUEUE } from '@/mock/mockData';
import { Token } from '@/types/queue';
import { Link } from 'react-router-dom';
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
  QrCode,
  RefreshCw,
  AlertCircle,
  History,
  Sparkles,
  X,
  ArrowRight,
  Stethoscope,
  FileText,
  Volume2,
  Calendar,
  PhoneCall,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface PastToken {
  id: string;
  tokenNumber: string;
  patientName: string;
  relation: string;
  facilityName: string;
  departmentName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'COMPLETED' | 'SERVED' | 'CLOSED';
  notes: string;
  recordUrl?: string;
}

const MOCK_PAST_TOKENS: PastToken[] = [
  {
    id: 'past_tok_01',
    tokenNumber: 'A-028',
    patientName: 'Rameshwar Sharma',
    relation: 'Self',
    facilityName: 'Pethapur Primary Health Centre',
    departmentName: 'General Medicine OPD (Room 2)',
    doctorName: 'Dr. Ananya Patel (MO)',
    date: '02 Sep 2026',
    time: '10:15 AM',
    status: 'COMPLETED',
    notes: 'Seasonal Bronchitis consultation. Prescriptions dispensed at hospital pharmacy.',
    recordUrl: '/patient/records',
  },
  {
    id: 'past_tok_02',
    tokenNumber: 'L-014',
    patientName: 'Savitri Sharma',
    relation: 'Spouse',
    facilityName: 'Gandhinagar Civil Hospital',
    departmentName: 'Pathology Sample Collection Desk (Room 12)',
    doctorName: 'Dr. Priya Desai / Rakesh Lab Tech',
    date: '28 Aug 2026',
    time: '09:30 AM',
    status: 'SERVED',
    notes: 'Fasting Blood Glucose & Thyroid panel collected. Reports verified.',
    recordUrl: '/patient/records',
  },
  {
    id: 'past_tok_03',
    tokenNumber: 'V-007',
    patientName: 'Pooja Sharma',
    relation: 'Daughter',
    facilityName: 'Urban Health Centre - Sector 21',
    departmentName: 'Immunization Room 2',
    doctorName: 'Sister Meena Solanki (ANM)',
    date: '14 Jul 2026',
    time: '11:00 AM',
    status: 'COMPLETED',
    notes: 'Td Booster vaccine administered. Certificate issued.',
    recordUrl: '/patient/records',
  },
  {
    id: 'past_tok_04',
    tokenNumber: 'C-019',
    patientName: 'Gopal Sharma',
    relation: 'Father',
    facilityName: 'Gandhinagar Civil Hospital',
    departmentName: 'Cardiology Super-Specialty OPD (Room 8)',
    doctorName: 'Dr. Vikramaditya Mehta (MD Card)',
    date: '10 Jun 2026',
    time: '02:20 PM',
    status: 'COMPLETED',
    notes: 'Routine hypertension follow-up & 12-lead ECG review.',
    recordUrl: '/patient/records',
  },
];

export const TokenExperience: React.FC = () => {
  const { user } = useAuth();
  const { activeMember } = useFamily();
  const { simulateCallToken } = useSocket();

  const [token, setToken] = useState<Token>(
    INITIAL_LIVE_QUEUE.tokens.find(
      (t) => t.patientId === 'usr_pat_01'
    ) || INITIAL_LIVE_QUEUE.tokens[3]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewTokenForm, setShowNewTokenForm] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePastFilter, setActivePastFilter] = useState<'ALL' | 'THIS_MONTH'>('ALL');

  const [dept, setDept] = useState('dep_med');
  const [facilityId, setFacilityId] = useState('fac_civil_01');

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await tokenApi.generateToken({
        patientName: activeMember?.name || user?.name || 'Rameshwar Sharma',
        patientPhone: activeMember?.phone || user?.phone || '9876543210',
        facilityId,
        departmentId: dept,
      });

      setToken(res.data);
      setShowNewTokenForm(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Mock live upcoming queue sequence
  const queueSequence = [
    { number: 'A-033', status: 'SERVED', label: 'Completed' },
    { number: 'A-034', status: 'SERVED', label: 'Completed' },
    { number: INITIAL_LIVE_QUEUE.currentTokenNumber, status: 'NOW_SERVING', label: 'Inside OPD Room 4' },
    { number: 'A-036', status: 'NEXT', label: 'Next Up (Door)' },
    { number: 'A-037', status: 'WAITING', label: 'Corridor Waiting' },
    { number: 'A-038', status: 'WAITING', label: 'Corridor Waiting' },
    { number: 'A-039', status: 'WAITING', label: 'Corridor Waiting' },
    { number: 'A-040', status: 'WAITING', label: 'Waiting' },
    { number: 'A-041', status: 'WAITING', label: 'Waiting' },
    { number: token.tokenNumber, status: 'YOUR_TOKEN', label: 'Your Active Token' },
  ];

  const filteredPastTokens = activePastFilter === 'ALL'
    ? MOCK_PAST_TOKENS
    : MOCK_PAST_TOKENS.filter((t) => t.date.includes('Sep 2026'));

  return (
    <div className="space-y-5 w-full font-sans">
      {/* =====================================================
          HEADER BAR (Full Width, No Restrictive Margins)
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">
              Patient Portal /
            </span>
            <span className="text-xs font-bold text-teal-800">
              OPD Queue & Tokens
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Grid Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            My Token & Live Hospital Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time OPD counter status, patient queue monitor, and your digital token pass.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs h-9 gap-1.5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : 'text-slate-400'}`} />
            Refresh Queue
          </Button>

          <Button
            onClick={() => setShowNewTokenForm(!showNewTokenForm)}
            className="text-xs h-9 gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold cursor-pointer shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            + Get New Token
          </Button>
        </div>
      </div>

      {/* =====================================================
          NEW TOKEN FORM (Conditional Collapsible)
      ====================================================== */}
      {showNewTokenForm && (
        <div className="rounded-2xl border border-teal-300 bg-teal-50/70 p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
                <Ticket className="h-4 w-4 text-teal-700" />
                Generate New OPD Token
              </h3>
              <p className="text-xs text-teal-700 mt-0.5">
                Issue a real-time digital token for active patient: <strong className="text-teal-950">{activeMember?.name || 'Rameshwar Sharma'} ({activeMember?.relation === 'SELF' ? 'Self' : activeMember?.relationLabel})</strong>
              </p>
            </div>
            <button
              onClick={() => setShowNewTokenForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-teal-100/50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleGenerateToken} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Hospital / Health Centre
              </label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
              >
                <option value="fac_civil_01">Gandhinagar Civil Hospital (District Super-specialty)</option>
                <option value="fac_mansa_02">Mansa Community Health Centre (CHC)</option>
                <option value="fac_kalol_03">Kalol Sub-District Hospital</option>
                <option value="fac_pet_04">Pethapur Primary Health Centre (PHC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select OPD Department
              </label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
              >
                <option value="dep_med">General Medicine OPD (Room 4)</option>
                <option value="dep_card">Cardiology Super-Specialty (Room 8)</option>
                <option value="dep_ortho">Orthopedics & Fracture Clinic (Room 11)</option>
                <option value="dep_ped">Pediatrics & Child Health (Room 3)</option>
                <option value="dep_gyn">Obstetrics & Gynecology (Room 6)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewTokenForm(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isGenerating}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl px-5"
              >
                Issue Digital Token
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          MAIN SPLIT LAYOUT:
          - Column 1: LIVE TOKEN / LIVE QUEUE MONITOR (One Side)
          - Column 2: CURRENT ACTIVE TOKEN (Top) & PAST TOKENS (Bottom)
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ===================================================
            SIDE 1: LIVE TOKEN / LIVE QUEUE MONITOR (lg:col-span-5)
        ==================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-teal-700/30 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-950 p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Live Header */}
            <div className="flex items-center justify-between border-b border-teal-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Live OPD Counter Stream
                </span>
              </div>
              <span className="text-[11px] font-mono text-teal-200 bg-teal-800/80 border border-teal-600/40 px-2 py-0.5 rounded-md">
                COUNTER 4
              </span>
            </div>

            {/* Facility & Doctor Info */}
            <div className="mt-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-teal-200 font-medium">
                <Building2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>{token.facilityName || 'Gandhinagar Civil Hospital'}</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-400" />
                General Medicine OPD
              </h2>
              <p className="text-xs text-teal-300/80 font-mono">
                Doctor: Dr. Arvind Patel (MD) • Room 4 (1st Floor)
              </p>
            </div>

            {/* GIANT NOW SERVING DISPLAY */}
            <div className="mt-5 rounded-2xl bg-teal-950/70 border border-teal-700/60 p-5 text-center shadow-inner relative">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
                ● NOW SERVING PATIENT ●
              </div>
              <div className="mt-1 text-5xl sm:text-6xl font-black tracking-tight text-emerald-400 font-mono">
                {INITIAL_LIVE_QUEUE.currentTokenNumber}
              </div>
              <div className="mt-2 text-xs text-teal-100 flex items-center justify-center gap-2">
                <span>Patient: Govindbhai P.</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">Inside Doctor Room</span>
              </div>
              <p className="text-[10px] text-teal-300/70 mt-1 font-mono">
                Called 2 minutes ago • Est. duration ~6 mins
              </p>
            </div>

            {/* Queue Velocity Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-teal-900/60 border border-teal-700/40 p-2.5">
                <span className="text-[10px] text-teal-300 block font-medium">Total Waiting</span>
                <span className="font-bold text-base text-white mt-0.5 block">{INITIAL_LIVE_QUEUE.totalWaiting}</span>
              </div>
              <div className="rounded-xl bg-teal-900/60 border border-teal-700/40 p-2.5">
                <span className="text-[10px] text-teal-300 block font-medium">Avg. Consult</span>
                <span className="font-bold text-base text-amber-300 mt-0.5 block">6-8 min</span>
              </div>
              <div className="rounded-xl bg-teal-900/60 border border-teal-700/40 p-2.5">
                <span className="text-[10px] text-teal-300 block font-medium">Queue Pace</span>
                <span className="font-bold text-base text-emerald-300 mt-0.5 block">On Time</span>
              </div>
            </div>

            {/* Live Queue Sequence Ticker */}
            <div className="mt-4 rounded-xl bg-teal-950/40 border border-teal-800/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  Live Queue Sequence
                </span>
                <span className="text-[10px] text-teal-400 font-mono">
                  Your Token: {token.tokenNumber}
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {queueSequence.map((item, idx) => {
                  const isServing = item.status === 'NOW_SERVING';
                  const isYours = item.status === 'YOUR_TOKEN';
                  const isServed = item.status === 'SERVED';
                  const isNext = item.status === 'NEXT';

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                        isYours
                          ? 'bg-amber-500/20 border border-amber-400/80 text-amber-200 font-bold'
                          : isServing
                          ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 font-bold'
                          : isNext
                          ? 'bg-teal-800/80 border border-teal-600/50 text-white'
                          : isServed
                          ? 'bg-teal-950/50 text-teal-400/60 opacity-60'
                          : 'bg-teal-900/40 text-teal-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold">{item.number}</span>
                        {isYours && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                            YOU
                          </span>
                        )}
                        {isServing && (
                          <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                            NOW
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium opacity-90">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sound & Directions Actions */}
            <div className="mt-4 pt-3 border-t border-teal-800 flex items-center gap-2">
              <Button
                onClick={() => simulateCallToken(token)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8 bg-teal-800/70 hover:bg-teal-700 border-teal-600 text-teal-100 font-bold rounded-xl cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Test Voice Chime
              </Button>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 bg-teal-800/70 hover:bg-teal-700 border-teal-600 text-teal-100 font-bold rounded-xl cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5 mr-1 text-teal-300" />
                  OPD Floor Map
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* ===================================================
            SIDE 2: TOP = CURRENT ACTIVE TOKEN | BOTTOM = PAST TOKENS
            (lg:col-span-7)
        ==================================================== */}
        <div className="lg:col-span-7 space-y-5">

          {/* -------------------------------------------------
              TOP: CURRENT ACTIVE TOKEN
          -------------------------------------------------- */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Active Token Top Ribbon */}
            <div className="bg-teal-700 px-5 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-600 border border-teal-500/50 flex items-center justify-center font-bold text-white shadow-xs">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
                      Your Current Active Token
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-800 border border-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      <Clock className="h-3 w-3 text-amber-400" />
                      {token.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    {activeMember?.name || token.patientName} ({activeMember?.relation === 'SELF' ? 'Self' : activeMember?.relationLabel || 'Self'})
                  </h3>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-teal-200 block">ABHA ID Linked</span>
                <span className="font-mono text-xs font-bold text-white">
                  {activeMember?.abhaId || '14-8921-3409-7721'}
                </span>
              </div>
            </div>

            {/* Token Body Content */}
            <div className="p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Token No.
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-teal-800 tracking-tight font-mono mt-0.5">
                    {token.tokenNumber}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Issued today at 09:40 AM • General Medicine
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    onClick={() => setShowQrModal(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs rounded-xl border-slate-300 hover:bg-white text-slate-700 font-semibold cursor-pointer shadow-xs"
                  >
                    <QrCode className="h-4 w-4 mr-1.5 text-teal-700" />
                    Scan at Counter
                  </Button>
                </div>
              </div>

              {/* 3 Metrics Box */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs">
                  <Users className="h-4 w-4 text-teal-600 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                    People Ahead
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                    {token.positionInQueue || 7}
                  </span>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-center shadow-xs">
                  <Clock className="h-4 w-4 text-amber-600 mx-auto" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mt-1">
                    Estimated Wait
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5 block">
                    {token.estimatedWaitMinutes || 18}
                    <span className="text-xs font-medium ml-1">min</span>
                  </span>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 text-center shadow-xs">
                  <MapPin className="h-4 w-4 text-teal-700 mx-auto" />
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mt-1">
                    Consult Room
                  </span>
                  <span className="text-sm sm:text-base font-black text-teal-950 mt-1 block">
                    Room 4
                  </span>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Queue Progression
                  </span>
                  <span className="font-bold text-teal-700">
                    65% Processed
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full w-[65%]" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Doctor is currently examining Token <strong>{INITIAL_LIVE_QUEUE.currentTokenNumber}</strong>. Please report outside Room 4 when 2 patients remain ahead.
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------
              BOTTOM: PAST TOKENS / VISIT HISTORY
          -------------------------------------------------- */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <History className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Past Tokens & OPD History
                  </h3>
                  <p className="text-xs text-slate-400">
                    Previous consultations and dispensary tokens for your household
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActivePastFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePastFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({MOCK_PAST_TOKENS.length})
                </button>
                <button
                  onClick={() => setActivePastFilter('THIS_MONTH')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePastFilter === 'THIS_MONTH'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Past Tokens List */}
            <div className="space-y-3">
              {filteredPastTokens.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/80 bg-white hover:border-teal-500 hover:shadow-xs transition-all p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                        {item.tokenNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                        <Check className="h-3 w-3" /> {item.status}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.departmentName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {item.notes}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                      <span className="font-medium text-slate-600">
                        👤 {item.patientName} ({item.relation})
                      </span>
                      <span>•</span>
                      <span>{item.facilityName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <Calendar className="h-3 w-3" /> {item.date} at {item.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link to="/patient/records">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1 text-teal-700" />
                        View Record
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          QR CODE MODAL FOR CHECK-IN AT HOSPITAL KIOSK
      ====================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hospital OPD QR Check-in
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-teal-800">
                TOKEN {token.tokenNumber}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                {activeMember?.name || token.patientName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan this QR at the OPD kiosk or counter reader
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl inline-block shadow-inner">
              <QrCode className="h-36 w-36 text-white" />
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              ABHA ID: {activeMember?.abhaId || '14-8921-3409-7721'}
            </p>

            <Button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl h-9 cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
