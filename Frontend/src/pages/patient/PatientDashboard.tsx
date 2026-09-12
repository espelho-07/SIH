import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/map/MapView';
import {
  INITIAL_FACILITIES,
  INITIAL_LIVE_QUEUE,
  INITIAL_REFERRALS,
  INITIAL_APPOINTMENTS,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_AMBULANCES,
} from '@/mock/mockData';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Building2,
  GitBranch,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Pill,
  Sparkles,
  Search,
  Phone,
  MessageCircle,
  Navigation,
  X,
  ExternalLink,
  Bed,
  Mic,
  Calendar,
  CalendarCheck,
  Stethoscope,
  Droplet,
  Ambulance as AmbulanceIcon,
  FileText,
  ChevronRight,
  HeartPulse,
  Activity,
  UserCheck,
  Bot,
  AlertCircle,
  PhoneCall,
} from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { FamilyMemberSwitcher } from '@/components/patient/FamilyMemberSwitcher';
import { SmartHospitalAssistantModal } from '@/components/patient/SmartHospitalAssistantModal';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeMember } = useFamily();
  const navigate = useNavigate();

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'ASSISTANT' | 'STORES' | 'TRIAGE'>('ASSISTANT');
  const [isBloodBankModalOpen, setIsBloodBankModalOpen] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);

  // Active User Token & Referral & Upcoming Appointment
  const activeToken =
    INITIAL_LIVE_QUEUE.tokens.find(
      (t) => t.patientId === 'usr_pat_01'
    ) || INITIAL_LIVE_QUEUE.tokens[3];

  const activeReferral = INITIAL_REFERRALS[0];

  const upcomingAppointment =
    INITIAL_APPOINTMENTS.find((a) => a.patientId === 'usr_pat_01') ||
    INITIAL_APPOINTMENTS[0];

  // Nearby Facilities filtered by search query
  const filteredFacilities = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_FACILITIES.slice(0, 3);
    const q = searchQuery.toLowerCase();
    return INITIAL_FACILITIES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.departments.some((d) => d.name.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [searchQuery]);

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const filteredBloodStock = useMemo(() => {
    if (selectedBloodGroup === 'ALL') return INITIAL_BLOOD_INVENTORY.stock;
    return INITIAL_BLOOD_INVENTORY.stock.filter((b) => b.bloodGroup === selectedBloodGroup);
  }, [selectedBloodGroup]);

  return (
    <div className="space-y-5 font-sans max-w-7xl mx-auto">

      {/* ================================================================= */}
      {/* 1. NATIVE MOBILE APP HEADER (Matches Photo 2 Wireframe) */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              Hello, {activeMember.name || user?.name || 'Rohan Sharma'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your health matters. We are here for you.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> ABHA Verified
          </span>
          <FamilyMemberSwitcher variant="banner" />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. SEARCH BAR (Matches Photo 2 Wireframe) */}
      {/* ================================================================= */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, doctors, services, OPD queues..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. AI HEALTH ASSISTANT COMPACT BANNER (Matches Photo 2 Wireframe) */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-blue-50/50 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Friendly Bot Avatar Icon */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-700 border border-sky-200 shadow-2xs">
              <Bot className="h-6 w-6 text-sky-600" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  AI Health Assistant
                </h2>
                <span className="text-[10px] font-semibold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                  ગુજરાતી • हिंदी • English
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Describe your symptoms and get AI-assisted guidance, nearby care options and live wait times.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              onClick={() => {
                setActiveModalTab('ASSISTANT');
                setIsFacilityModalOpen(true);
              }}
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-700 hover:from-sky-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Start Chat</span>
            </Button>

            <Button
              onClick={() => {
                setActiveModalTab('ASSISTANT');
                setIsFacilityModalOpen(true);
              }}
              variant="outline"
              className="flex-1 sm:flex-initial h-10 px-3.5 rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 font-semibold text-xs gap-1.5 cursor-pointer"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Speak (બોલો)</span>
            </Button>
          </div>
        </div>

        {/* Quick Symptom Chips */}
        <div className="mt-3.5 pt-3 border-t border-sky-100 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Common:
          </span>
          {[
            { label: 'Fever & Cold', emoji: '🌡️' },
            { label: 'Chest Pain', emoji: '🫀' },
            { label: 'Bone Injury', emoji: '🦴' },
            { label: 'Maternity', emoji: '🤰' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveModalTab('TRIAGE');
                setIsFacilityModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 border border-slate-200/90 text-[11px] font-medium text-slate-700 hover:text-sky-800 shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setActiveModalTab('STORES');
              setIsFacilityModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 border border-slate-200/90 text-[11px] font-medium text-slate-700 hover:text-sky-800 shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            <Pill className="h-3 w-3 text-sky-600" />
            <span>Medical Stores</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. QUICK ACTIONS (8-Icon Grid - Matches Photo 2 Wireframe) */}
      {/* ================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h2>
          <span className="text-[11px] font-semibold text-teal-700">
            All Services Available
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {/* 1. Find Doctor */}
          <Link
            to="/patient/appointments"
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-sky-50/60 border border-slate-200/80 transition-all hover:border-sky-300 text-center shadow-2xs"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform border border-sky-100">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-sky-700">
              Find Doctor
            </span>
          </Link>

          {/* 2. Book Appointment */}
          <Link
            to="/patient/appointments"
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 transition-all hover:border-indigo-300 text-center shadow-2xs"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform border border-indigo-100">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-indigo-700">
              Book Appt
            </span>
          </Link>

          {/* 3. Get Token */}
          <Link
            to="/patient/tokens"
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-amber-50/60 border border-slate-200/80 transition-all hover:border-amber-300 text-center shadow-2xs"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform border border-amber-100">
              <Ticket className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-amber-700">
              OPD Token
            </span>
          </Link>

          {/* 4. Find Hospital */}
          <Link
            to="/patient/facilities"
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-teal-50/60 border border-slate-200/80 transition-all hover:border-teal-300 text-center shadow-2xs"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform border border-teal-100">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-teal-700">
              Hospitals
            </span>
          </Link>

          {/* 5. Blood Bank (Interactive Modal matching wireframe) */}
          <button
            onClick={() => setIsBloodBankModalOpen(true)}
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-rose-50/60 border border-slate-200/80 transition-all hover:border-rose-300 text-center shadow-2xs cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform border border-rose-100">
              <Droplet className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-rose-700">
              Blood Bank
            </span>
          </button>

          {/* 6. Ambulance (Interactive Emergency Modal matching wireframe) */}
          <button
            onClick={() => setIsAmbulanceModalOpen(true)}
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-red-50/60 border border-slate-200/80 transition-all hover:border-red-300 text-center shadow-2xs cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:scale-105 transition-transform border border-red-100">
              <AmbulanceIcon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-red-700">
              Ambulance
            </span>
          </button>

          {/* 7. My Records */}
          <Link
            to="/patient/records"
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200/80 transition-all hover:border-emerald-300 text-center shadow-2xs"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform border border-emerald-100">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-emerald-700">
              My Records
            </span>
          </Link>

          {/* 8. Referrals / More */}
          <Link
            to="/patient/referrals"
            className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-purple-50/60 border border-slate-200/80 transition-all hover:border-purple-300 text-center shadow-2xs"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform border border-purple-100">
              <GitBranch className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-2 line-clamp-1 group-hover:text-purple-700">
              Referrals
            </span>
          </Link>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. UPCOMING APPOINTMENTS & ACTIVE TOKEN (Matches Photo 2 Wireframe) */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 5A. Upcoming Appointment Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Upcoming Appointments
                </h2>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
              >
                See All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingAppointment ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200/60">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {upcomingAppointment.doctorName}
                      </p>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                        {upcomingAppointment.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {upcomingAppointment.specialty} • {upcomingAppointment.facilityName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 mt-1.5">
                      <Clock className="h-3 w-3" />
                      <span>{upcomingAppointment.date} at {upcomingAppointment.timeSlot}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/patient/appointments`}
                  className="sm:self-center"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-8 text-xs font-semibold border-slate-200 hover:bg-white text-slate-700"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">No upcoming appointments scheduled.</p>
            )}
          </div>

          {/* Active Referral Notice if present */}
          {activeReferral && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <GitBranch className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-slate-600 truncate">
                  Referral: <strong className="font-semibold text-slate-900">{activeReferral.toSpecialty}</strong> at {activeReferral.toFacilityName}
                </span>
              </div>
              <Link
                to="/patient/referrals"
                className="text-xs font-semibold text-amber-700 hover:underline shrink-0 ml-2"
              >
                Track
              </Link>
            </div>
          )}
        </div>

        {/* 5B. Active Live OPD Token (Wireframe "Your Token" G-024 / A-042) */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Ticket className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Your OPD Token
                </h2>
              </div>
              <StatusBadge status="WAITING" />
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/40 border border-sky-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Token Number
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
                    {activeToken.tokenNumber}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    General Medicine • {activeToken.facilityName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Estimated Wait
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-amber-600">
                    {activeToken.estimatedWaitMinutes} min
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Serving: <span className="font-bold text-slate-800">{INITIAL_LIVE_QUEUE.currentTokenNumber}</span>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Current Position: <strong className="text-slate-800">7 ahead of you</strong></span>
                  <span className="font-bold text-sky-700">45% Progress</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                  <div className="h-full w-[45%] rounded-full bg-sky-600 transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              Counter #4 (OPD Ground Floor)
            </span>
            <Link to="/patient/tokens">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold rounded-xl text-sky-700 border-sky-200 hover:bg-sky-50 gap-1"
              >
                Live Queue & Details
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* ================================================================= */}
      {/* 6. NEARBY HOSPITALS (Matches Photo 2 Wireframe) */}
      {/* ================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Nearby Hospitals
            </h2>
            <p className="text-xs text-slate-500">
              Live bed availability, emergency status & wait times
            </p>
          </div>

          <Link
            to="/patient/facilities"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
          >
            View All ({INITIAL_FACILITIES.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Responsive Grid / Map Combo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hospital Cards List (Mobile & Desktop) */}
          <div className="lg:col-span-2 space-y-3">
            {filteredFacilities.map((facility) => (
              <div
                key={facility.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {facility.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        facility.isOpen
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {facility.isOpen ? 'Open 24x7' : 'Closed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {facility.distanceKm} km away • {facility.type}
                    </span>
                  </div>

                  {/* Bed Stats Pills */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/50">
                      <Bed className="h-3 w-3 text-teal-600" />
                      {facility.availableBeds} beds available
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800 border border-rose-200/50">
                      <HeartPulse className="h-3 w-3 text-rose-600" />
                      {facility.icuBedsAvailable} ICU beds
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link to={`/patient/facilities/${facility.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs rounded-xl border-slate-200 hover:bg-slate-50 font-semibold"
                    >
                      View Details
                    </Button>
                  </Link>

                  <Link to="/patient/tokens">
                    <Button
                      size="sm"
                      className="h-9 text-xs rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1 shadow-2xs"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      Get Token
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Map View (Visible on tablet & desktop, clean preview) */}
          <div className="hidden lg:block rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs h-full min-h-[300px]">
            <MapView facilities={INITIAL_FACILITIES} />
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. BLOOD BANK MODAL (Matches Photo 2 Wireframe: "Patient: Blood Bank") */}
      {/* ================================================================= */}
      {isBloodBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Droplet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Blood Bank Availability</h3>
                  <p className="text-[11px] text-slate-500">Live district stock verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsBloodBankModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Blood Group Chips */}
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Select Blood Group:</p>
                <div className="flex flex-wrap gap-1.5">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setSelectedBloodGroup(bg)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedBloodGroup === bg
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Units List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Available Units ({INITIAL_BLOOD_INVENTORY.facilityName})
                </p>
                {filteredBloodStock.map((stock) => (
                  <div
                    key={stock.bloodGroup}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-rose-700">
                          {stock.bloodGroup}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {stock.unitsAvailable} units ready
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Status: <strong className="text-emerald-700 font-semibold">{stock.status}</strong> • Expiring in 7d: {stock.expiringIn7Days} units
                      </p>
                    </div>

                    <a
                      href="tel:108"
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                    >
                      Request
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500">
                Need urgent whole blood or platelets? Call Central Blood Helpline: <strong className="text-rose-700 font-bold">104 / 108</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 8. AMBULANCE EMERGENCY MODAL (Matches Photo 2 Wireframe: "Patient: Ambulance") */}
      {/* ================================================================= */}
      {isAmbulanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-red-50/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AmbulanceIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Emergency 108 Ambulance</h3>
                  <p className="text-[11px] text-slate-500">GPS dispatch & emergency response</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAmbulanceModalOpen(false);
                  setAmbulanceRequested(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {ambulanceRequested ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">Ambulance Request Dispatched!</h4>
                  <p className="text-xs text-emerald-700">
                    Ambulance <strong>GJ-18-GA-1081</strong> has been assigned to your GPS location. ETA is <strong>8 minutes</strong>.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    The control room has notified Gandhinagar Civil Hospital Emergency trauma center.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-700">Available Ambulances Nearby:</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong className="text-emerald-700">2 units</strong> on standby near your current location
                    </p>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                        <span className="font-semibold text-slate-800">GJ-18-GA-1081 (ALS)</span>
                        <span className="text-emerald-700 font-bold">1.2 km away</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                        <span className="font-semibold text-slate-800">GJ-18-GA-1082 (BLS)</span>
                        <span className="text-slate-500 font-medium">2.8 km away</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Select Emergency Reason:</label>
                    <select className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white">
                      <option>Severe Chest Pain / Heart Emergency</option>
                      <option>Road Accident / Trauma</option>
                      <option>Maternity & Labor Emergency</option>
                      <option>Respiratory Distress / Unconscious</option>
                      <option>Other Acute Condition</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setAmbulanceRequested(true)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 rounded-xl"
                    >
                      <AmbulanceIcon className="h-4 w-4 mr-1" />
                      Request Ambulance
                    </Button>
                    <a
                      href="tel:108"
                      className="flex items-center justify-center px-4 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs h-10 rounded-xl transition-colors"
                    >
                      <PhoneCall className="h-4 w-4 mr-1" />
                      Direct Call 108
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 9. SANJEEVANI VOICE & HOSPITAL ASSISTANT MODAL */}
      {/* ================================================================= */}
      <SmartHospitalAssistantModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        defaultTab={activeModalTab}
      />

    </div>
  );
};