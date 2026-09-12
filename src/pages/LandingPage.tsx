import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { EmergencyButton } from '@/components/emergency/EmergencyButton';
import { StatusIndicator } from '@/components/common/StatusIndicator';

import {
  HeartPulse,
  Building2,
  Ticket,
  GitBranch,
  FileText,
  WifiOff,
  BrainCircuit,
  ShieldCheck,
  Stethoscope,
  Users,
  Activity,
  Search,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle2,
  Video,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Calendar,
  MapPin,
  Sparkles,
  Shield,
  Pill,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patient/facilities?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/patient/facilities');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FA] text-[#1E293B] flex flex-col antialiased selection:bg-[#00838F] selection:text-white">

      {/* ================================================== */}
      {/* 1. NEXTCARE STYLE UTILITY TOP BAR (DEEP NAVY) */}
      {/* ================================================== */}
      <div className="bg-[#162D4A] text-slate-200 text-xs py-2 px-4 sm:px-6 border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Emergency & Toll-Free helpline numbers */}
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Emergency Services: <strong className="text-white font-mono font-bold">108 / 102</strong>
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Phone className="h-3 w-3 text-[#00838F]" />
              Customer Service: <strong className="text-white font-mono">1800-11-4477</strong>
            </span>
          </div>

          {/* Right: Quick Portal Links */}
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <Link
              to="/patient/tokens"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Ticket className="h-3 w-3 text-[#DE5A49]" />
              <span>Track Live Token</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              to="/patient/teleconsultations"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Video className="h-3 w-3 text-[#00838F]" />
              <span>Virtual Teleconsult</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              to="/login"
              className="font-bold text-white hover:text-teal-300 transition-colors flex items-center gap-1"
            >
              <UserCheck className="h-3 w-3 text-teal-400" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. MAIN HEADER (CRISP WHITE + NEXTCARE CYAN-TEAL) */}
      {/* ================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex h-18 items-center justify-between px-4 sm:px-6">

          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00838F] text-white shadow-md shadow-[#00838F]/25">
              <HeartPulse className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#00838F]">
                  Next<span className="text-[#1B365D]">Care</span>
                </span>
                <span className="rounded-full bg-teal-50 px-2 py-0.2 text-[10px] font-black text-[#00838F] border border-teal-200">
                  SANJEEVANI
                </span>
              </div>

              <span className="block text-[11px] font-medium text-slate-500 leading-none">
                National Public Health Access & Care Continuity Grid
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#1B365D]">
            <Link to="/patient/facilities" className="hover:text-[#00838F] transition-colors">
              Find Your Location
            </Link>
            <Link to="/patient/tokens" className="hover:text-[#00838F] transition-colors">
              Plan Your Visit
            </Link>
            <Link to="/patient/teleconsultations" className="hover:text-[#00838F] transition-colors">
              Virtual Care
            </Link>
            <Link to="/patient/health-records" className="hover:text-[#00838F] transition-colors">
              Health Resources (EHR)
            </Link>
            <Link to="/district" className="hover:text-[#00838F] transition-colors">
              District Health Grid
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusIndicator />

            <EmergencyButton compact />

            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white font-bold transition-colors cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* 3. HERO SECTION (FAITHFUL TO NEXTCARE REFERENCE) */}
      {/* ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E8F4F8] via-[#F0F8FA] to-white border-b border-slate-200">
        {/* Soft Background Radial Decor */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-teal-100/40 via-cyan-50/50 to-transparent pointer-events-none transform -skew-x-12 origin-top-right"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column: Typography & 3 NextCare Coral Action Buttons */}
            <div className="lg:col-span-6 text-left space-y-6">

              {/* SIH / National Grid Label */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-xs px-3.5 py-1 text-xs font-bold text-[#00838F] border border-teal-200 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-[#00838F]" />
                <span>Smart India Hackathon 2024–2026 • SIH26133</span>
              </div>

              {/* Exact NextCare Hero Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1B365D] leading-[1.12]">
                Your Healthcare,
                <br />
                <span className="text-[#00838F]">Answered</span>
              </h1>

              {/* Descriptive Subtext */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect directly to verified government civil hospitals, primary health centres,
                live OPD queues with real-time ETA tokens, and 24/7 teleconsultation doctors.
              </p>

              {/* === THE 3 SIGNATURE NEXTCARE CORAL PILL BUTTONS === */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Choose Your Care Option:
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* 1. Urgent Care Button */}
                  <Link to="/patient/tokens">
                    <button
                      type="button"
                      className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-[#DE5A49] hover:bg-[#C84A3B] text-white font-black text-sm shadow-md shadow-[#DE5A49]/25 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 min-h-[46px]"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Urgent Care</span>
                    </button>
                  </Link>

                  {/* 2. Primary Care Button */}
                  <Link to="/patient/facilities">
                    <button
                      type="button"
                      className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-[#DE5A49] hover:bg-[#C84A3B] text-white font-black text-sm shadow-md shadow-[#DE5A49]/25 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 min-h-[46px]"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Primary Care</span>
                    </button>
                  </Link>

                  {/* 3. Virtual Care Button */}
                  <Link to="/patient/teleconsultations">
                    <button
                      type="button"
                      className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-[#DE5A49] hover:bg-[#C84A3B] text-white font-black text-sm shadow-md shadow-[#DE5A49]/25 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 min-h-[46px]"
                    >
                      <Video className="h-4 w-4" />
                      <span>Virtual Care</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Fast Search Input Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg">
                <div className="relative flex items-center">
                  <Search className="h-5 w-5 absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals, doctors, or specialties (e.g. Cardiology, Gandhinagar)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-11 pr-24 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00838F] shadow-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1.5 bg-[#00838F] hover:bg-[#006E78] text-white font-bold text-xs h-8 px-3 rounded-lg"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Key Trust Highlights */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00838F]" />
                  ABHA Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00838F]" />
                  Zero Waiting Queue Alerts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00838F]" />
                  100% Free Public Access
                </span>
              </div>
            </div>

            {/* Right Column: NextCare Illustration / Interactive Clinical Scene */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/80 overflow-hidden">
                {/* Decorative Window Scene */}
                <div className="rounded-2xl bg-gradient-to-b from-[#162D4A] to-[#1B365D] p-5 text-white relative overflow-hidden mb-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-bold tracking-wide uppercase text-[10px] text-teal-300">
                        OPD Consultation Desk
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-300">Room 4 • Civil Hospital</span>
                  </div>

                  {/* SVG Illustration of Doctor & Patient Consult (Inspired by NextCare Scene) */}
                  <div className="py-4 flex items-center justify-center">
                    <svg viewBox="0 0 400 180" className="w-full h-auto max-h-[160px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Clinic Background Window */}
                      <rect x="120" y="10" width="160" height="90" rx="6" fill="#1E3A5F" stroke="#2A4D7A" strokeWidth="2" />
                      <line x1="200" y1="10" x2="200" y2="100" stroke="#2A4D7A" strokeWidth="2" />
                      <line x1="120" y1="55" x2="280" y2="55" stroke="#2A4D7A" strokeWidth="2" />
                      {/* Window Skyline Lights */}
                      <circle cx="150" cy="35" r="1.5" fill="#6EE7B7" />
                      <circle cx="170" cy="45" r="1.5" fill="#93C5FD" />
                      <circle cx="230" cy="30" r="1.5" fill="#FDE047" />
                      <circle cx="250" cy="42" r="1.5" fill="#6EE7B7" />

                      {/* Doctor Desk */}
                      <rect x="140" y="100" width="120" height="60" rx="4" fill="#334E68" />
                      <rect x="145" y="96" width="110" height="6" rx="2" fill="#486581" />
                      {/* Stethoscope / Chart on Desk */}
                      <rect x="180" y="90" width="22" height="12" rx="2" fill="#E2E8F0" />
                      <path d="M195 90 C195 85 205 85 205 95" stroke="#00838F" strokeWidth="2" />

                      {/* Left: Female Doctor Standing (Lab Coat) */}
                      <circle cx="65" cy="45" r="12" fill="#FBCFE8" /> {/* Head */}
                      <path d="M57 40 C57 32 73 32 73 40 Z" fill="#991B1B" /> {/* Hair */}
                      <path d="M50 65 C50 58 80 58 80 65 L82 140 L48 140 Z" fill="#FFFFFF" /> {/* Coat */}
                      <path d="M54 75 L62 100 L76 75" stroke="#00838F" strokeWidth="2" fill="none" /> {/* Stethoscope */}
                      <rect x="58" y="138" width="8" height="28" fill="#1E293B" />
                      <rect x="70" y="138" width="8" height="28" fill="#1E293B" />

                      {/* Center: Doctor Seated */}
                      <circle cx="170" cy="50" r="13" fill="#FED7AA" /> {/* Head */}
                      <path d="M160 44 C160 36 180 36 180 44 Z" fill="#1F2937" /> {/* Hair */}
                      <path d="M152 70 C152 64 188 64 188 70 L190 120 L150 120 Z" fill="#FFFFFF" /> {/* Lab Coat */}
                      <path d="M160 78 L170 95 L180 78" stroke="#00838F" strokeWidth="2" fill="none" />
                      {/* Clipboard in hand */}
                      <rect x="190" y="70" width="20" height="26" rx="2" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
                      <line x1="194" y1="78" x2="206" y2="78" stroke="#00838F" strokeWidth="1.5" />
                      <line x1="194" y1="83" x2="204" y2="83" stroke="#64748B" strokeWidth="1" />
                      <line x1="194" y1="88" x2="202" y2="88" stroke="#64748B" strokeWidth="1" />

                      {/* Right: Patient Seated */}
                      <circle cx="330" cy="55" r="12" fill="#FBCFE8" /> {/* Head */}
                      <path d="M320 50 C320 40 342 40 342 50 Z" fill="#1E293B" /> {/* Hair */}
                      <path d="M315 75 C315 68 345 68 345 75 L345 118 L315 118 Z" fill="#DE5A49" /> {/* Coral Shirt */}
                      <rect x="318" y="118" width="10" height="42" fill="#1E3A5F" /> {/* Pants */}
                      <rect x="332" y="118" width="10" height="42" fill="#1E3A5F" />
                      <path d="M325 158 L332 158" stroke="#DE5A49" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
                    <span className="text-teal-200">Patient: Govindbhai Prajapati (52Y)</span>
                    <span className="font-bold text-amber-300">ABHA Verified</span>
                  </div>
                </div>

                {/* Floating Real-Time Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00838F] text-white">
                        <Ticket className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#1B365D] block">Token #A-035 Called</span>
                        <span className="text-[11px] text-slate-500">Dr. Arvind Patel (Cardiology)</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-xs text-[#00838F] bg-white px-2 py-1 rounded border border-teal-200">
                      NOW SERVING
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DE5A49] text-white">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#1B365D] block">Teleconsultation Lobby</span>
                        <span className="text-[11px] text-slate-500">4 Specialists Available Live</span>
                      </div>
                    </div>
                    <Link to="/patient/teleconsultations">
                      <span className="text-[11px] font-bold text-[#DE5A49] hover:underline cursor-pointer">
                        Connect →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================== */}
        {/* 4. PARTNER LOGO / NETWORK STRIP (LIKE NEXTCARE HERO) */}
        {/* ================================================== */}
        <div className="border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Integrated National Public Health Ecosystem & Network Partners
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                <Building2 className="h-5 w-5 text-[#00838F]" />
                <span>Civil Hospital Gandhinagar</span>
              </div>
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                <Shield className="h-5 w-5 text-[#1B365D]" />
                <span>Ayushman Bharat (ABDM)</span>
              </div>
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                <Activity className="h-5 w-5 text-[#DE5A49]" />
                <span>National Health Authority</span>
              </div>
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                <Stethoscope className="h-5 w-5 text-[#00838F]" />
                <span>e-Sanjeevani Grid</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. HOW IT WORKS: CLOSED-LOOP PATIENT JOURNEY */}
      {/* ================================================== */}
      <section className="py-16 sm:py-20 bg-[#F0F8FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00838F]">
              Continuity of Care
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1B365D] mt-1">
              Complete Closed-Loop Patient Journey
            </h2>

            <p className="text-sm text-slate-600 mt-2">
              Ensuring zero drop-offs between frontline health workers, primary health centres,
              and tertiary civil hospitals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Discover',
                desc: 'Find nearby hospitals with live bed & specialist availability.',
              },
              {
                step: '02',
                title: 'Assess',
                desc: 'Frontline ASHA screening & vitals recording in the field.',
              },
              {
                step: '03',
                title: 'Queue',
                desc: 'Real-time digital token tracker with live ETA & calling alerts.',
              },
              {
                step: '04',
                title: 'Consult',
                desc: 'Integrated clinical encounter with digital prescriptions.',
              },
              {
                step: '05',
                title: 'Refer',
                desc: 'Algorithmic clinical suitability matching with SLA timers.',
              },
              {
                step: '06',
                title: 'Follow-up',
                desc: 'Closed-loop post-discharge monitoring & home visits.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs hover:border-[#00838F] hover:shadow-md transition-all group"
              >
                <span className="text-2xl font-black text-[#00838F] group-hover:text-[#DE5A49] transition-colors">
                  {s.step}
                </span>

                <h3 className="font-bold text-base text-[#1B365D] mt-1">
                  {s.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. SIX INTEGRATED ECOSYSTEM ROLES */}
      {/* ================================================== */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00838F]">
              Platform Architecture
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1B365D] mt-1">
              Six Integrated Healthcare Roles
            </h2>

            <p className="text-sm text-slate-600 mt-2">
              Role-tailored dashboards supporting the entire public health continuum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Citizen / Patient */}
            <Link to="/patient">
              <Card className="rounded-2xl border-slate-200 bg-[#F0F8FA]/60 hover:bg-white hover:border-[#00838F] hover:shadow-xl hover:-translate-y-1 transition-all h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-[#00838F] mb-2 group-hover:bg-[#00838F] group-hover:text-white transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-[#1B365D]">
                    1. Citizen & Patient
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Live OPD tokens, nearby hospital finder, ABHA longitudinal health locker, and teleconsultations.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* 2. ASHA / ANM */}
            <Link to="/asha">
              <Card className="rounded-2xl border-slate-200 bg-[#F0F8FA]/60 hover:bg-white hover:border-[#00838F] hover:shadow-xl hover:-translate-y-1 transition-all h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-[#00838F] mb-2 group-hover:bg-[#00838F] group-hover:text-white transition-colors">
                    <Activity className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-[#1B365D]">
                    2. ASHA & Frontline Workers
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Offline-first mobile visits, household survey sync via IndexedDB, and doctor-prescribed home checks.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* 3. Doctor */}
            <Link to="/doctor">
              <Card className="rounded-2xl border-slate-200 bg-[#F0F8FA]/60 hover:bg-white hover:border-[#00838F] hover:shadow-xl hover:-translate-y-1 transition-all h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-[#00838F] mb-2 group-hover:bg-[#00838F] group-hover:text-white transition-colors">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-[#1B365D]">
                    3. Doctor Specialist
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Live queue caller, fast OPD clinical desk, full patient EHR history, and 1-click clinical copilot.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* 4. Facility Staff */}
            <Link to="/staff">
              <Card className="rounded-2xl border-slate-200 bg-[#F0F8FA]/60 hover:bg-white hover:border-[#00838F] hover:shadow-xl hover:-translate-y-1 transition-all h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-[#00838F] mb-2 group-hover:bg-[#00838F] group-hover:text-white transition-colors">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-[#1B365D]">
                    4. Hospital Staff & Operations
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Real-time bed occupancy, pharmacy dispensing, diagnostic lab reports, and registration counters.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* 5. District Admin */}
            <Link to="/district">
              <Card className="rounded-2xl border-slate-200 bg-[#F0F8FA]/60 hover:bg-white hover:border-[#00838F] hover:shadow-xl hover:-translate-y-1 transition-all h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-[#00838F] mb-2 group-hover:bg-[#00838F] group-hover:text-white transition-colors">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-[#1B365D]">
                    5. District Health Admin
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Command center GIS mapping, disease outbreak early warning, and inter-facility resource balancing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* 6. Super Admin */}
            <Link to="/super-admin">
              <Card className="rounded-2xl border-slate-200 bg-[#F0F8FA]/60 hover:bg-white hover:border-[#00838F] hover:shadow-xl hover:-translate-y-1 transition-all h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-[#00838F] mb-2 group-hover:bg-[#00838F] group-hover:text-white transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-[#1B365D]">
                    6. Super Administrator
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    AI model registry, security audit logs, cross-state governance, and system uptime monitoring.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. PREDICTIVE HEALTHCARE INTELLIGENCE (NAVY THEME) */}
      {/* ================================================== */}
      <section className="py-16 sm:py-20 bg-[#162D4A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1B365D] px-3.5 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30">
                <BrainCircuit className="h-4 w-4 text-teal-300" />
                <span>Predictive Public Health Decision Support</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3">
                Healthcare Demand Intelligence
              </h2>

              <p className="text-slate-300 text-sm mt-2 max-w-xl">
                Advanced time-series forecasting and anomaly surveillance designed to prevent healthcare
                system bottlenecks before they occur.
              </p>
            </div>

            <div className="rounded-2xl border border-teal-500/30 bg-[#1B365D] p-4 text-xs text-slate-200 max-w-md shadow-lg">
              <span className="font-bold text-[#DE5A49] block mb-1">
                Clinical Safety & Governance Principle:
              </span>
              AI insights provide demand forecasts and early anomaly warnings. All individual clinical diagnoses
              and resource allocations require human clinician confirmation.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-[#1B365D] p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Disease Surge Alert
              </span>
              <p className="text-2xl font-black text-white">+24.5% Vector Deviation</p>
              <p className="text-xs text-slate-300">
                LSTM models detect suspected Dengue clusters 3 weeks in advance in rural blocks.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-[#1B365D] p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Specialist Gap
              </span>
              <p className="text-2xl font-black text-white">+42 Consult Deficit</p>
              <p className="text-xs text-slate-300">
                Cardiology deficit flagged in Sub-District Hospital; automated teleconsult routing triggered.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/40 bg-[#1B365D] p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DE5A49]">
                Bed Occupancy Peak
              </span>
              <p className="text-2xl font-black text-white">92% ICU Load</p>
              <p className="text-xs text-slate-300">
                Prophet model projects critical care capacity exhaustion within 72 hours.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/40 bg-[#1B365D] p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DE5A49]">
                Blood Bank Alert
              </span>
              <p className="text-2xl font-black text-white">AB- & O- Critical</p>
              <p className="text-xs text-slate-300">
                Automated replenishment dispatched to neighboring district blood banks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. PUBLIC FOOTER (CLEAN WHITE + NAVY) */}
      {/* ================================================== */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00838F] text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="font-black text-[#1B365D]">
              NEXTCARE / SANJEEVANI-CONNECT
            </span>
            <span>
              • SIH26133 Integrated Health Grid
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-slate-600">
            <span>Emergency: 108 / 102</span>
            <span>National Health Authority</span>
            <span>Ministry of Health & Family Welfare</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
