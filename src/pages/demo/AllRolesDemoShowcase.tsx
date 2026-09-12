import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  HeartPulse,
  Search,
  Building2,
  Ticket,
  Pill,
  Video,
  Users,
  Calendar,
  Activity,
  RefreshCw,
  Stethoscope,
  FileText,
  GitBranch,
  Shield,
  Server,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Bell,
  Sliders,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  Mic,
  Bed,
  Check,
  Zap,
} from 'lucide-react';
import { UserRole, StaffSubType } from '@/types/auth';

export const AllRolesDemoShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { quickSwitchRole } = useAuth();
  const [selectedRolePreview, setSelectedRolePreview] = useState<string>('PATIENT');
  const [filterView, setFilterView] = useState<'ALL' | 'CITIZEN' | 'CLINICAL' | 'ADMIN'>('ALL');

  const handleLaunchRole = (role: UserRole, subType?: StaffSubType, path: string = '/') => {
    quickSwitchRole(role, subType);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* Top Header / Poster Title */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm hover:bg-teal-800 transition-colors">
              <HeartPulse className="h-6 w-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  HEALTHCONNECT
                </span>
                <span className="rounded-full bg-teal-100 border border-teal-300 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-900 uppercase">
                  SIH 2026 Wireframes
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Mobile App — Home Page Wireframes (All Roles) • One Platform • Multiple Roles • Seamless Experience
              </p>
            </div>
          </div>

          {/* Quick Filter & Return Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setFilterView('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterView === 'ALL' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Roles (6)
              </button>
              <button
                onClick={() => setFilterView('CITIZEN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterView === 'CITIZEN' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Citizen & ASHA
              </button>
              <button
                onClick={() => setFilterView('CLINICAL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterView === 'CLINICAL' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor & Staff
              </button>
              <button
                onClick={() => setFilterView('ADMIN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterView === 'ADMIN' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Command
              </button>
            </div>

            <Link
              to="/patient"
              className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <span>Launch Live Patient App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Wireframes Showcase Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">

        {/* SECTION 1: ROLE HOME WIREFRAMES (6 COLUMNS) */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                Primary Role Home Screens
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each healthcare stakeholder receives an optimized, role-specific home experience with zero clutter.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Interactive • Click any phone to launch live portal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

            {/* -------------------------------------------------- */}
            {/* 1. CITIZEN / PATIENT HOME */}
            {/* -------------------------------------------------- */}
            {(filterView === 'ALL' || filterView === 'CITIZEN') && (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-900">1. Citizen (Patient) Home</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Learner/Citizen</span>
                </div>

                <div className="relative rounded-[36px] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col h-[680px]">
                  {/* Status Bar */}
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      <span className="text-[10px]">5G</span>
                      <span className="h-2.5 w-4 rounded-sm border border-slate-900"></span>
                    </div>
                  </div>

                  {/* Scrollable Screen Content */}
                  <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Hello, Rameshwar 👋</h4>
                        <p className="text-[10px] text-slate-400">ABHA: 14-8921-3409-7721</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">
                        RS
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-2.5 py-2 text-slate-400 text-xs">
                      <Search className="h-3.5 w-3.5" />
                      <span className="truncate text-[11px]">Search doctors, medicines...</span>
                    </div>

                    {/* Hero Banner: Sanjeevani AI */}
                    <div className="rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-800 p-3 text-white shadow-xs">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-teal-200">
                        <Sparkles className="h-3 w-3 text-amber-300" /> AI Voice Triage
                      </div>
                      <h5 className="text-xs font-extrabold mt-1">"Tamare kem hospital javu che?"</h5>
                      <p className="text-[9px] text-teal-100/90 mt-0.5 line-clamp-2">Speak symptoms in Gujarati/Hindi for instant bed match.</p>
                      <button
                        onClick={() => handleLaunchRole('PATIENT', undefined, '/patient')}
                        className="mt-2.5 w-full rounded-lg bg-emerald-500 py-1.5 text-[10px] font-bold text-white shadow-xs text-center"
                      >
                        🎙️ Speak with Assistant
                      </button>
                    </div>

                    {/* Quick Icons (4) */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Quick Services</span>
                      <div className="grid grid-cols-4 gap-1.5 mt-1 text-center">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center">
                          <Building2 className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Hospitals</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 flex flex-col items-center">
                          <Pill className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Pharmacy</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 flex flex-col items-center">
                          <Ticket className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Token</span>
                        </div>
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600 flex flex-col items-center">
                          <Video className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Doctor</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Token Card */}
                    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-2.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-teal-900">Active Token</span>
                        <span className="rounded bg-teal-700 px-1.5 py-0.2 text-[9px] font-bold text-white">A-042</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600">
                        <span>Now Serving: <strong>A-035</strong></span>
                        <span className="text-amber-600 font-bold">~38 min wait</span>
                      </div>
                    </div>

                    {/* Recommended Hospital */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Recommended For You</span>
                      <div className="mt-1 rounded-xl border border-slate-200 p-2 text-xs">
                        <p className="font-bold text-slate-900 truncate">Gandhinagar Civil Hospital</p>
                        <p className="text-[10px] text-slate-500">2.4 km • 14 Beds Avail • ICU Open</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 shrink-0">
                    <span className="text-teal-700">● Home</span>
                    <span>Hospitals</span>
                    <span>Token</span>
                    <span>Records</span>
                    <span>Profile</span>
                  </div>

                  {/* Launch Live Button */}
                  <button
                    onClick={() => handleLaunchRole('PATIENT', undefined, '/patient')}
                    className="w-full bg-slate-900 hover:bg-teal-700 text-white py-2 text-xs font-extrabold text-center transition-colors cursor-pointer"
                  >
                    Open Live Citizen Portal →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* 2. ASHA WORKER HOME */}
            {/* -------------------------------------------------- */}
            {(filterView === 'ALL' || filterView === 'CITIZEN') && (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-900">2. ASHA Worker Home</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Mentor/Frontline</span>
                </div>

                <div className="relative rounded-[36px] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col h-[680px]">
                  {/* Status Bar */}
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      <span className="text-[10px]">5G</span>
                      <span className="h-2.5 w-4 rounded-sm border border-slate-900"></span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Good Morning, Sunita ☀️</h4>
                        <p className="text-[10px] text-slate-400">Sector 4 PHC • Ward 7</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                        SW
                      </div>
                    </div>

                    {/* Stats Row (3 Columns matching reference) */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-sm font-black text-slate-900">42</span>
                        <p className="text-[9px] text-slate-500 font-medium">Assigned</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                        <span className="text-sm font-black text-emerald-700">8</span>
                        <p className="text-[9px] text-emerald-600 font-medium">Visits Today</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-2 border border-amber-100">
                        <span className="text-sm font-black text-amber-700">3</span>
                        <p className="text-[9px] text-amber-600 font-medium">High Risk</p>
                      </div>
                    </div>

                    {/* Upcoming Sessions Card */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-slate-900">Next Priority Visit</span>
                        <span className="text-emerald-700 font-bold">10:30 AM</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">Meena Devi (ANC 3rd Tri)</p>
                      <p className="text-[10px] text-slate-500">BP Check & Iron Folic Acid Dispensing</p>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Quick Actions</span>
                      <div className="grid grid-cols-4 gap-1.5 mt-1 text-center">
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-700 flex flex-col items-center">
                          <Users className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Citizens</span>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 flex flex-col items-center">
                          <Activity className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Vitals</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 flex flex-col items-center">
                          <FileText className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Screening</span>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center">
                          <RefreshCw className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Sync (PWA)</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Recent Activity</span>
                      <div className="mt-1 space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                          <span>Kanti Bhai (Sugar Screened)</span>
                          <span className="text-emerald-600 font-bold">Synced</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                          <span>Radha Ben (Infant Polio)</span>
                          <span className="text-slate-400">1h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 shrink-0">
                    <span className="text-emerald-700">● Today</span>
                    <span>Visits</span>
                    <span>Citizens</span>
                    <span>Vitals</span>
                    <span>Sync</span>
                  </div>

                  <button
                    onClick={() => handleLaunchRole('ASHA', undefined, '/asha')}
                    className="w-full bg-slate-900 hover:bg-emerald-700 text-white py-2 text-xs font-extrabold text-center transition-colors cursor-pointer"
                  >
                    Open Live ASHA Portal →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* 3. DOCTOR / SPECIALIST HOME */}
            {/* -------------------------------------------------- */}
            {(filterView === 'ALL' || filterView === 'CLINICAL') && (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-900">3. Doctor / Specialist</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">Recruiter/Specialist</span>
                </div>

                <div className="relative rounded-[36px] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col h-[680px]">
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      <span className="text-[10px]">5G</span>
                      <span className="h-2.5 w-4 rounded-sm border border-slate-900"></span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Hi, Dr. Rajesh Patel 👨‍⚕️</h4>
                        <p className="text-[10px] text-slate-400">Cardiology OPD • Room 6</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                        RP
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-sm font-black text-slate-900">18</span>
                        <p className="text-[9px] text-slate-500 font-medium">In Queue</p>
                      </div>
                      <div className="rounded-xl bg-sky-50 p-2 border border-sky-100">
                        <span className="text-sm font-black text-sky-700">6</span>
                        <p className="text-[9px] text-sky-600 font-medium">Referrals</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-2 border border-amber-100">
                        <span className="text-sm font-black text-amber-700">4</span>
                        <p className="text-[9px] text-amber-600 font-medium">Tele-Rooms</p>
                      </div>
                    </div>

                    {/* Next In Line Patient */}
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-sky-950">Next Patient: A-036</span>
                        <span className="rounded bg-sky-700 px-1.5 py-0.5 text-[8px] font-bold text-white">CALLED</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">Gopal Sharma (68y, Male)</p>
                      <p className="text-[10px] text-slate-500">History: Post-CABG • BP: 142/88</p>
                      <button
                        onClick={() => handleLaunchRole('DOCTOR', undefined, '/doctor/patients')}
                        className="mt-2.5 w-full rounded-lg bg-sky-600 py-1.5 text-[10px] font-bold text-white shadow-xs text-center"
                      >
                        Open Clinical Workspace →
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Quick Actions</span>
                      <div className="grid grid-cols-4 gap-1.5 mt-1 text-center">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-700 flex flex-col items-center">
                          <Ticket className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Queue</span>
                        </div>
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-700 flex flex-col items-center">
                          <Activity className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">EHR</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 flex flex-col items-center">
                          <GitBranch className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Refer</span>
                        </div>
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600 flex flex-col items-center">
                          <Video className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-1 text-slate-700">Teleconsult</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 shrink-0">
                    <span className="text-sky-700">● Home</span>
                    <span>Queue</span>
                    <span>Patients</span>
                    <span>Referrals</span>
                    <span>Room</span>
                  </div>

                  <button
                    onClick={() => handleLaunchRole('DOCTOR', undefined, '/doctor')}
                    className="w-full bg-slate-900 hover:bg-sky-700 text-white py-2 text-xs font-extrabold text-center transition-colors cursor-pointer"
                  >
                    Open Live Doctor Portal →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* 4. HOSPITAL STAFF (PHARMACY/LAB/OPD) */}
            {/* -------------------------------------------------- */}
            {(filterView === 'ALL' || filterView === 'CLINICAL') && (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-900">4. Hospital Staff</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Admin/Staff</span>
                </div>

                <div className="relative rounded-[36px] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col h-[680px]">
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      <span className="text-[10px]">5G</span>
                      <span className="h-2.5 w-4 rounded-sm border border-slate-900"></span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Hello, Staff 🏥</h4>
                        <p className="text-[10px] text-slate-400">Civil Hospital • Hub</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                        HS
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-sm font-black text-slate-900">120</span>
                        <p className="text-[9px] text-slate-500 font-medium">Total Beds</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                        <span className="text-sm font-black text-emerald-700">14</span>
                        <p className="text-[9px] text-emerald-600 font-medium">ICU Avail</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-2 border border-amber-100">
                        <span className="text-sm font-black text-amber-700">98%</span>
                        <p className="text-[9px] text-amber-600 font-medium">Uptime</p>
                      </div>
                    </div>

                    {/* Facility Bed Status */}
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3">
                      <span className="text-[9px] font-bold text-amber-800 uppercase">Emergency Desk</span>
                      <h5 className="text-xs font-bold text-slate-900 mt-1">Oxygen & Trauma Operational</h5>
                      <p className="text-[10px] text-slate-500">Live bed synchronizer connected with 108 ambulance grid.</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Sub-Role Desks</span>
                      <div className="grid grid-cols-2 gap-1.5 mt-1 text-center">
                        <button
                          onClick={() => handleLaunchRole('FACILITY_STAFF', 'PHARMACIST', '/pharmacist')}
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5 justify-center"
                        >
                          <Pill className="h-3.5 w-3.5" /> Pharmacy
                        </button>
                        <button
                          onClick={() => handleLaunchRole('FACILITY_STAFF', 'REGISTRATION_CLERK', '/registration-clerk')}
                          className="p-2 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center gap-1.5 justify-center"
                        >
                          <Users className="h-3.5 w-3.5" /> Desk Clerk
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 shrink-0">
                    <span className="text-amber-700">● Hub</span>
                    <span>Queue</span>
                    <span>Stock</span>
                    <span>Beds</span>
                    <span>Alerts</span>
                  </div>

                  <button
                    onClick={() => handleLaunchRole('FACILITY_STAFF', 'PHARMACIST', '/pharmacist')}
                    className="w-full bg-slate-900 hover:bg-amber-700 text-white py-2 text-xs font-extrabold text-center transition-colors cursor-pointer"
                  >
                    Open Live Staff Portal →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* 5. DISTRICT HEALTH ADMIN */}
            {/* -------------------------------------------------- */}
            {(filterView === 'ALL' || filterView === 'ADMIN') && (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-900">5. District Admin</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Partner/Command</span>
                </div>

                <div className="relative rounded-[36px] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col h-[680px]">
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      <span className="text-[10px]">5G</span>
                      <span className="h-2.5 w-4 rounded-sm border border-slate-900"></span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">District Command 📊</h4>
                        <p className="text-[10px] text-slate-400">Gandhinagar • 28 Facilities</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold">
                        DA
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-sm font-black text-slate-900">28</span>
                        <p className="text-[9px] text-slate-500 font-medium">PHC/CHC</p>
                      </div>
                      <div className="rounded-xl bg-indigo-50 p-2 border border-indigo-100">
                        <span className="text-sm font-black text-indigo-700">89%</span>
                        <p className="text-[9px] text-indigo-600 font-medium">Bed Occ.</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                        <span className="text-sm font-black text-emerald-700">94%</span>
                        <p className="text-[9px] text-emerald-600 font-medium">Referral Cl.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3">
                      <span className="text-[9px] font-bold text-indigo-800 uppercase">AI Surge Forecast</span>
                      <h5 className="text-xs font-bold text-slate-900 mt-1">+24% Dengue Trend Predicted</h5>
                      <p className="text-[10px] text-slate-500">Platelet inventory auto-allocated to Kalol Sub-District.</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Command Modules</span>
                      <div className="grid grid-cols-2 gap-1.5 mt-1 text-center">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center gap-1.5 justify-center">
                          <MapPin className="h-3.5 w-3.5" /> Live Map
                        </div>
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-bold flex items-center gap-1.5 justify-center">
                          <GitBranch className="h-3.5 w-3.5" /> Referrals
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 shrink-0">
                    <span className="text-indigo-700">● Command</span>
                    <span>Map</span>
                    <span>Referrals</span>
                    <span>AI</span>
                    <span>Reports</span>
                  </div>

                  <button
                    onClick={() => handleLaunchRole('DISTRICT_ADMIN', undefined, '/district')}
                    className="w-full bg-slate-900 hover:bg-indigo-700 text-white py-2 text-xs font-extrabold text-center transition-colors cursor-pointer"
                  >
                    Open Live District Portal →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* 6. SUPER ADMIN */}
            {/* -------------------------------------------------- */}
            {(filterView === 'ALL' || filterView === 'ADMIN') && (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-900">6. Super Admin</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Org/Tech</span>
                </div>

                <div className="relative rounded-[36px] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col h-[680px]">
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      <span className="text-[10px]">5G</span>
                      <span className="h-2.5 w-4 rounded-sm border border-slate-900"></span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">National Mesh 🛡️</h4>
                        <p className="text-[10px] text-slate-400">HealthConnect Core API</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">
                        SA
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-sm font-black text-slate-900">1.4K</span>
                        <p className="text-[9px] text-slate-500 font-medium">Nodes</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                        <span className="text-sm font-black text-emerald-700">99.9%</span>
                        <p className="text-[9px] text-emerald-600 font-medium">Uptime</p>
                      </div>
                      <div className="rounded-xl bg-rose-50 p-2 border border-rose-100">
                        <span className="text-sm font-black text-rose-700">2.4M</span>
                        <p className="text-[9px] text-rose-600 font-medium">ABHA IDs</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3">
                      <span className="text-[9px] font-bold text-rose-800 uppercase">System Telemetry</span>
                      <h5 className="text-xs font-bold text-slate-900 mt-1">All Microservices Healthy</h5>
                      <p className="text-[10px] text-slate-500">ABDM Gateway, Token Engine & Voice Triage Latency &lt; 42ms.</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Governance</span>
                      <div className="grid grid-cols-2 gap-1.5 mt-1 text-center">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-bold flex items-center gap-1.5 justify-center">
                          <Server className="h-3.5 w-3.5" /> Health
                        </div>
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center gap-1.5 justify-center">
                          <KeyRound className="h-3.5 w-3.5" /> RBAC
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 shrink-0">
                    <span className="text-rose-700">● Health</span>
                    <span>Users</span>
                    <span>Roles</span>
                    <span>Audit</span>
                    <span>Config</span>
                  </div>

                  <button
                    onClick={() => handleLaunchRole('SUPER_ADMIN', undefined, '/super-admin')}
                    className="w-full bg-slate-900 hover:bg-rose-700 text-white py-2 text-xs font-extrabold text-center transition-colors cursor-pointer"
                  >
                    Open Live Admin Portal →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 2: AUXILIARY SCREENS (Drawer, Discover, Notifications, Profile, Key Features) */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              System Modules & Shared Views
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supporting wireframes matching the bottom row of your architecture reference.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

            {/* A. Navigation Drawer */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between h-[420px]">
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Navigation Menu</span>
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="h-9 w-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                    RS
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Rameshwar Sharma</h5>
                    <p className="text-[10px] text-slate-400">Citizen • ABHA Verified</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs font-semibold text-slate-700">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-900 font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Home Dashboard
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" /> Discover Facilities
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" /> Health Records
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Video className="h-4 w-4 text-slate-400" /> Teleconsultations
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-400" /> Family & Settings
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs font-bold text-rose-600 flex items-center gap-1.5 cursor-pointer">
                <LogOut className="h-4 w-4" /> Log Out
              </div>
            </div>

            {/* B. Discover / Search */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm space-y-3 h-[420px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Discover / Search</span>
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-400">
                <Search className="h-3.5 w-3.5" />
                <span>Search anything...</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Categories</span>
                <div className="grid grid-cols-2 gap-2 mt-2 text-center text-xs font-bold">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">Hospital</div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">Medicines</div>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">Doctors</div>
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">Labs</div>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Emergency Hotlines</span>
                <div className="mt-1.5 space-y-1 text-xs">
                  <div className="p-2 rounded-lg bg-red-50 text-red-700 font-bold flex justify-between">
                    <span>108 Ambulance</span>
                    <span>Call Now</span>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-700 font-bold flex justify-between">
                    <span>104 Health Help</span>
                    <span>Toll Free</span>
                  </div>
                </div>
              </div>
            </div>

            {/* C. Notifications */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm space-y-3 h-[420px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Notifications</span>
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold text-center">
                <span className="flex-1 py-1 bg-white rounded shadow-xs text-slate-900">All</span>
                <span className="flex-1 py-1 text-slate-500">Alerts</span>
                <span className="flex-1 py-1 text-slate-500">Updates</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50">
                  <p className="font-bold text-teal-900 text-[11px]">Token Turn Approaching</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Token A-042 is 7 numbers away at OPD Room 6.</p>
                </div>
                <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50">
                  <p className="font-bold text-amber-900 text-[11px]">Referral Confirmed</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Civil Hospital Cardiology slot confirmed for 10:00 AM.</p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-900 text-[11px]">Vaccine Due Reminder</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Aarav Sharma's DPT Booster due next Tuesday.</p>
                </div>
              </div>
            </div>

            {/* D. Profile */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm space-y-3 h-[420px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Profile & Identity</span>
              <div className="text-center pb-2 border-b border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-base mx-auto shadow-sm">
                  RS
                </div>
                <h5 className="text-xs font-bold text-slate-900 mt-1.5">Rameshwar Sharma</h5>
                <p className="text-[10px] text-teal-700 font-semibold">ABHA ID: 14-8921-3409-7721</p>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-1.5 rounded-lg bg-slate-50 text-[10px]">
                  <strong className="block text-slate-900 font-bold">4</strong>
                  <span className="text-slate-500 text-[9px]">Family</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-[10px]">
                  <strong className="block text-slate-900 font-bold">6</strong>
                  <span className="text-slate-500 text-[9px]">Records</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-[10px]">
                  <strong className="block text-slate-900 font-bold">1</strong>
                  <span className="text-slate-500 text-[9px]">Active</span>
                </div>
              </div>
              <div className="space-y-1 text-[11px] font-semibold text-slate-700">
                <div className="p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between">
                  <span>My Health Locker</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
                <div className="p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between">
                  <span>Linked PM-JAY Policy</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
                <div className="p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between">
                  <span>Family Permissions</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* E. Key Features */}
            <div className="rounded-3xl border-2 border-slate-900 bg-slate-950 text-white p-4 shadow-sm space-y-3 h-[420px] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">Why HealthConnect?</span>
                <h4 className="text-sm font-black mt-1">SIH26133 Core Value</h4>
                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>AI Voice Triage</strong> in Gujarati & Hindi for citizens</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Closed-Loop Referrals</strong> prevent lost follow-ups</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Real-Time Bed & ICU</strong> matching with ambulances</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Offline PWA</strong> for ASHA workers in remote villages</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-center">
                <span className="text-[11px] font-bold text-teal-200">National Health Mesh</span>
                <p className="text-[9px] text-slate-400 mt-0.5">Compliant with ABDM M1, M2 & M3</p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: BOTTOM FOOTER BADGES (Matching reference image) */}
        <div className="border-t border-slate-200 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <Sparkles className="h-5 w-5 text-teal-600 mx-auto mb-1.5" />
              <h6 className="text-xs font-bold text-slate-900">Clean & Modern UI</h6>
              <p className="text-[10px] text-slate-500 mt-0.5">Simple. Intuitive. Beautiful.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <Sliders className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
              <h6 className="text-xs font-bold text-slate-900">Seamless Navigation</h6>
              <p className="text-[10px] text-slate-500 mt-0.5">Get where you need, fast.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <Users className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
              <h6 className="text-xs font-bold text-slate-900">Personalized Experience</h6>
              <p className="text-[10px] text-slate-500 mt-0.5">Tailored for every role.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <Bell className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
              <h6 className="text-xs font-bold text-slate-900">Real-time Alerts</h6>
              <p className="text-[10px] text-slate-500 mt-0.5">Stay connected always.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs col-span-2 md:col-span-1">
              <Shield className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
              <h6 className="text-xs font-bold text-slate-900">Secure & Scalable</h6>
              <p className="text-[10px] text-slate-500 mt-0.5">Built for 1.4B citizens.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
