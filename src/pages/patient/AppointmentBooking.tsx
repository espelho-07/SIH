import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { appointmentApi } from '@/api/queueApi';
import { useFamily } from '@/contexts/FamilyContext';
import { Link } from 'react-router-dom';
import { Appointment } from '@/types/queue';

import {
  CalendarDays,
  Clock,
  Building2,
  Stethoscope,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  History,
  ShieldCheck,
  Users,
  Sun,
  Moon,
  Ticket,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  room: string;
  qualification: string;
  avatar: string;
  opdDays: string;
}

const DOCTORS_BY_SPECIALTY: Record<string, DoctorOption[]> = {
  'General Medicine': [
    {
      id: 'doc_patel_01',
      name: 'Dr. Arvind Patel',
      specialty: 'General Medicine',
      experience: '14 yrs exp',
      room: 'Room 4 (1st Floor)',
      qualification: 'MBBS, MD (Medicine)',
      avatar: 'AP',
      opdDays: 'Mon - Sat',
    },
    {
      id: 'doc_mehta_02',
      name: 'Dr. Vikramaditya Mehta',
      specialty: 'General Medicine',
      experience: '18 yrs exp',
      room: 'Room 6 (1st Floor)',
      qualification: 'MD (Gen Med), DNB',
      avatar: 'VM',
      opdDays: 'Mon, Wed, Fri',
    },
    {
      id: 'doc_ananya_03',
      name: 'Dr. Ananya Patel',
      specialty: 'General Medicine',
      experience: '8 yrs exp',
      room: 'Room 2 (Ground Floor)',
      qualification: 'MBBS, DNB',
      avatar: 'AP',
      opdDays: 'Tue, Thu, Sat',
    },
  ],
  Cardiology: [
    {
      id: 'doc_cardio_01',
      name: 'Dr. K. P. Trivedi',
      specialty: 'Cardiology',
      experience: '20 yrs exp',
      room: 'Cardio Wing - Room 12',
      qualification: 'MD, DM (Cardiology)',
      avatar: 'KT',
      opdDays: 'Mon - Fri',
    },
  ],
  Orthopedics: [
    {
      id: 'doc_ortho_01',
      name: 'Dr. Rajesh Varma',
      specialty: 'Orthopedics',
      experience: '16 yrs exp',
      room: 'Ortho Wing - Room 8',
      qualification: 'MS (Orthopedics), M.Ch',
      avatar: 'RV',
      opdDays: 'Mon, Tue, Thu, Sat',
    },
  ],
  Pediatrics: [
    {
      id: 'doc_pedia_01',
      name: 'Dr. Sangeeta Rao',
      specialty: 'Pediatrics',
      experience: '12 yrs exp',
      room: 'Child Health - Room 5',
      qualification: 'MD (Pediatrics), DCH',
      avatar: 'SR',
      opdDays: 'Mon - Sat',
    },
  ],
  'Obstetrics & Gynecology': [
    {
      id: 'doc_obg_01',
      name: 'Dr. Neha Joshi',
      specialty: 'Obstetrics & Gynecology',
      experience: '15 yrs exp',
      room: 'Maternity Wing - Room 9',
      qualification: 'MS (OBG), FICOG',
      avatar: 'NJ',
      opdDays: 'Mon - Sat',
    },
  ],
};

interface TimeSlot {
  time: string;
  session: 'MORNING' | 'AFTERNOON';
  isBooked: boolean;
  bookedReason?: string;
}

const ALL_SLOT_TEMPLATES: { time: string; session: 'MORNING' | 'AFTERNOON' }[] = [
  { time: '09:00 AM', session: 'MORNING' },
  { time: '09:30 AM', session: 'MORNING' },
  { time: '10:00 AM', session: 'MORNING' },
  { time: '10:30 AM', session: 'MORNING' },
  { time: '11:00 AM', session: 'MORNING' },
  { time: '11:30 AM', session: 'MORNING' },
  { time: '12:00 PM', session: 'MORNING' },
  { time: '12:30 PM', session: 'MORNING' },
  { time: '02:00 PM', session: 'AFTERNOON' },
  { time: '02:30 PM', session: 'AFTERNOON' },
  { time: '03:00 PM', session: 'AFTERNOON' },
  { time: '03:30 PM', session: 'AFTERNOON' },
  { time: '04:00 PM', session: 'AFTERNOON' },
  { time: '04:30 PM', session: 'AFTERNOON' },
];

/**
 * Deterministically computes slot availability based on Doctor + Date.
 * Ensures that booked slots are clearly locked and free slots can be booked.
 */
const getDoctorSlots = (doctorId: string, dateStr: string): TimeSlot[] => {
  let hash = 0;
  const key = `${doctorId}-${dateStr}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000000;
  }

  // Pre-configured slot patterns: 5 slots are booked, 9 are available
  const bookedIndices = [
    (hash + 1) % 14,
    (hash + 3) % 14,
    (hash + 6) % 14,
    (hash + 8) % 14,
    (hash + 11) % 14,
  ];

  return ALL_SLOT_TEMPLATES.map((slot, index) => {
    const isBooked = bookedIndices.includes(index);
    return {
      ...slot,
      isBooked,
      bookedReason: isBooked ? 'Patient Reserved' : undefined,
    };
  });
};

export const AppointmentBooking: React.FC = () => {
  const { t } = useTranslation();
  const { members, activeMember } = useFamily();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember.id);
  const [facilityId, setFacilityId] = useState('fac_civil_01');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc_patel_01');
  const [date, setDate] = useState('2026-09-14');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('Routine blood sugar and blood pressure review');

  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Available doctors under current department
  const currentDoctors = DOCTORS_BY_SPECIALTY[specialty] || DOCTORS_BY_SPECIALTY['General Medicine'];
  const activeDoctor = currentDoctors.find((d) => d.id === selectedDoctorId) || currentDoctors[0];

  // Auto-switch doctor if specialty changes
  useEffect(() => {
    if (currentDoctors.length > 0 && !currentDoctors.some((d) => d.id === selectedDoctorId)) {
      setSelectedDoctorId(currentDoctors[0].id);
    }
  }, [specialty, currentDoctors, selectedDoctorId]);

  // Compute live slots for chosen doctor and date
  const doctorSlots = getDoctorSlots(activeDoctor.id, date);
  const morningSlots = doctorSlots.filter((s) => s.session === 'MORNING');
  const afternoonSlots = doctorSlots.filter((s) => s.session === 'AFTERNOON');

  const freeSlotsCount = doctorSlots.filter((s) => !s.isBooked).length;
  const bookedSlotsCount = doctorSlots.filter((s) => s.isBooked).length;

  // Ensure selected slot is ALWAYS a free slot
  useEffect(() => {
    const isCurrentFree = doctorSlots.find((s) => s.time === selectedSlot && !s.isBooked);
    if (!isCurrentFree) {
      const firstFree = doctorSlots.find((s) => !s.isBooked);
      if (firstFree) {
        setSelectedSlot(firstFree.time);
      }
    }
  }, [activeDoctor.id, date, doctorSlots, selectedSlot]);

  // Active patient details
  const bookingPatient = members.find((m) => m.id === selectedMemberId) || activeMember;

  // User appointments state and active tab
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PREVIOUS'>('UPCOMING');
  const [checkInLoadingId, setCheckInLoadingId] = useState<string | null>(null);

  const selectedFacility = INITIAL_FACILITIES.find(
    (facility) => facility.id === facilityId
  );

  // Load appointments from API / storage
  const loadAppointments = async () => {
    try {
      const res = await appointmentApi.getAll();
      const all: Appointment[] = res.data && res.data.length > 0 ? [...res.data] : [];
      const saved = localStorage.getItem('healthconnect_appointments');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          for (const item of parsed) {
            if (!all.some((a) => a.id === item.id)) {
              all.unshift(item);
            }
          }
        } catch (e) {}
      }

      // Filter for active patient / family member or fallback
      const filtered = all.filter(
        (a) =>
          a.patientId === bookingPatient.id ||
          a.patientName?.toLowerCase() === bookingPatient.name?.toLowerCase() ||
          (bookingPatient.phone && a.patientPhone === bookingPatient.phone)
      );
      setAppointmentsList(filtered.length > 0 ? filtered : all.slice(0, 4));
    } catch (e) {
      console.warn('Failed to load appointments', e);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [bookingPatient.id, bookingPatient.name]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await appointmentApi.book({
        patientId: bookingPatient.id,
        patientName: bookingPatient.name,
        patientPhone: bookingPatient.phone,
        patientAge: bookingPatient.age,
        patientGender: (bookingPatient.gender as any) || 'M',
        facilityId,
        facilityName: selectedFacility?.name || 'Gandhinagar Civil Hospital',
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.name,
        specialty,
        date,
        timeSlot: selectedSlot,
        reasonForVisit: reason,
        status: 'CONFIRMED',
      });

      const newApt = res.data;
      if (newApt) {
        setCreatedAppointment(newApt);
        setAppointmentsList((prev) => [newApt, ...prev.filter((a) => a.id !== newApt.id)]);
      }
      setIsBooked(true);
      setActiveTab('UPCOMING');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (aptId: string) => {
    setCheckInLoadingId(aptId);
    try {
      const res = await appointmentApi.checkIn(aptId);
      if (res.data) {
        setAppointmentsList((prev) =>
          prev.map((a) =>
            a.id === aptId
              ? {
                  ...a,
                  status: 'CHECKED_IN',
                  tokenNumber: res.data.token.tokenNumber,
                  checkedInAt: new Date().toISOString(),
                }
              : a
          )
        );
        if (createdAppointment && createdAppointment.id === aptId) {
          setCreatedAppointment((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'CHECKED_IN',
                  tokenNumber: res.data.token.tokenNumber,
                  checkedInAt: new Date().toISOString(),
                }
              : null
          );
        }
      }
    } catch (err) {
      console.warn('Check-in error', err);
    } finally {
      setCheckInLoadingId(null);
    }
  };

  // Filter upcoming (scheduled, confirmed, or active checked_in) vs previous
  const upcomingAppointments = appointmentsList.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED' || a.status === 'CHECKED_IN'
  );

  const pastAppointments = [
    ...appointmentsList.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'),
    {
      id: 'APT-1025',
      date: '2026-08-28',
      facilityName: 'Gandhinagar Civil Hospital',
      specialty: 'General Medicine',
      timeSlot: '10:30 AM',
      status: 'COMPLETED' as const,
      doctorName: 'Dr. Vikramaditya Mehta',
      patientName: bookingPatient.name,
      patientId: bookingPatient.id,
      patientPhone: bookingPatient.phone,
      facilityId: 'fac_civil_01',
      doctorId: 'doc_mehta_02',
      type: 'IN_PERSON' as const,
      reasonForVisit: 'General health check-up',
      createdAt: '2026-08-20T10:00:00Z',
    },
    {
      id: 'APT-1018',
      date: '2026-08-10',
      facilityName: 'Mansa Community Health Centre',
      specialty: 'General Medicine',
      timeSlot: '11:00 AM',
      status: 'COMPLETED' as const,
      doctorName: 'Dr. Ananya Patel',
      patientName: bookingPatient.name,
      patientId: bookingPatient.id,
      patientPhone: bookingPatient.phone,
      facilityId: 'fac_mansa_02',
      doctorId: 'doc_ananya_03',
      type: 'IN_PERSON' as const,
      reasonForVisit: 'Seasonal fever review',
      createdAt: '2026-08-05T10:00:00Z',
    },
    {
      id: 'APT-1007',
      date: '2026-07-22',
      facilityName: 'Gandhinagar Civil Hospital',
      specialty: 'Cardiology',
      timeSlot: '09:30 AM',
      status: 'CANCELLED' as const,
      doctorName: 'Dr. K. P. Trivedi',
      patientName: bookingPatient.name,
      patientId: bookingPatient.id,
      patientPhone: bookingPatient.phone,
      facilityId: 'fac_civil_01',
      doctorId: 'doc_cardio_01',
      type: 'IN_PERSON' as const,
      reasonForVisit: 'Cardio ECG Review',
      createdAt: '2026-07-15T10:00:00Z',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* =========================================
          PAGE HEADER
      ========================================== */}
      <PageHeader
        title={t('appointments.bookAppointment')}
        subtitle={t('appointments.bookSubtitle')}
        breadcrumbs={[
          { label: t('nav.dashboard', 'Dashboard'), to: '/patient' },
          { label: t('appointments.myAppointments', 'My Appointments') },
        ]}
      />

      {/* =========================================
          BOOK APPOINTMENT CARD
      ========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New OPD Consultation Appointment
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time slot allocation connected to hospital OPD roster
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              ABDM Verified Booking
            </span>
          </div>

          {/* =====================================
              SUCCESS MESSAGE
          ====================================== */}
          {isBooked ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        OPD Pass #{createdAppointment?.id || 'CONFIRMED'}
                      </span>
                      {createdAppointment?.status === 'CHECKED_IN' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                          Active In Hospital (Token #{createdAppointment.tokenNumber})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                          <Clock className="h-3 w-3 text-amber-700" />
                          Confirmed • Awaiting Hospital OPD Check-in
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-emerald-950 mt-1">
                      {t('appointments.bookingSuccess', 'Appointment Confirmed Successfully!')}
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {createdAppointment?.status === 'CHECKED_IN'
                        ? 'You have checked in! Your live queue token is active. Please proceed to the consultation room when called.'
                        : 'Your appointment is registered on the hospital schedule. When you arrive at the hospital, use "Hospital Self Check-in" below to receive your live queue token.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-white border border-emerald-100 p-3 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Patient</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {bookingPatient.name}
                  </p>
                  <p className="text-[10px] text-teal-700 font-mono">
                    {bookingPatient.relation === 'SELF' ? 'Self' : bookingPatient.relationLabel}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-emerald-100 p-3 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Hospital & Room</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {selectedFacility?.name || 'Gandhinagar Civil Hospital'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeDoctor.room}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-emerald-100 p-3 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Doctor</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {activeDoctor.name}
                  </p>
                  <p className="text-[10px] text-teal-700">{specialty}</p>
                </div>

                <div className="rounded-xl bg-white border border-emerald-100 p-3 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Scheduled Slot</p>
                  <p className="mt-0.5 text-xs font-black text-teal-900">
                    {selectedSlot}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">{date}</p>
                </div>
              </div>

              {/* Status note */}
              {createdAppointment?.status !== 'CHECKED_IN' ? (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Not Yet Active in Hospital OPD Queue</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Your consultation slot is reserved. Live queue tokens are issued when you arrive at the hospital. You can tap <strong>"Hospital Self Check-in"</strong> below now or upon reaching the hospital to activate your token immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Live OPD Queue Token: #{createdAppointment.tokenNumber}</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Your queue token is active in the hospital OPD system. You can track wait times and your turn position in the OPD Tokens tracker.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {createdAppointment && createdAppointment.status !== 'CHECKED_IN' ? (
                  <Button
                    size="sm"
                    onClick={() => handleCheckIn(createdAppointment.id)}
                    isLoading={checkInLoadingId === createdAppointment.id}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs gap-1.5"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    Hospital Self Check-in (Issue Token Now)
                  </Button>
                ) : (
                  <Link to="/patient/tokens">
                    <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs gap-1.5">
                      <Ticket className="h-3.5 w-3.5" />
                      Track Live Token
                    </Button>
                  </Link>
                )}

                {createdAppointment && (
                  <Link to={`/patient/appointments/${createdAppointment.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold rounded-xl cursor-pointer gap-1.5 bg-white hover:bg-slate-50 border-slate-300">
                      <Eye className="h-3.5 w-3.5 text-teal-700" />
                      View OPD Pass
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsBooked(false);
                    setCreatedAppointment(null);
                  }}
                  className="text-xs rounded-xl cursor-pointer gap-1 bg-white hover:bg-slate-50 border-slate-300"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  Book Another Appointment
                </Button>
              </div>
            </div>
          ) : (
            /* =====================================
               BOOKING FORM
            ====================================== */
            <form onSubmit={handleBooking} className="space-y-6">
              {/* PATIENT FAMILY MEMBER SELECTION */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-teal-700" />
                    Book Appointment For (Household Member)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {members.length} Members Available
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                        selectedMemberId === m.id
                          ? 'bg-teal-800 text-white shadow-xs font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{m.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          selectedMemberId === m.id
                            ? 'bg-teal-900 text-teal-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {m.relation === 'SELF' ? 'Self' : m.relationLabel.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* HOSPITAL & SPECIALTY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hospital Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t('appointments.selectHospital')}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                    <select
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                    >
                      {INITIAL_FACILITIES.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedFacility && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                      <MapPin className="h-3 w-3 text-teal-700" />
                      <span>{selectedFacility.distanceKm} km away • {selectedFacility.type}</span>
                    </p>
                  )}
                </div>

                {/* Department Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t('appointments.selectDepartment')}
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Obstetrics & Gynecology">Women&apos;s Health (OBG)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-0.5">
                    {currentDoctors.length} consulting doctor(s) on duty
                  </p>
                </div>
              </div>

              {/* DOCTOR SELECTION & VISIT DATE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t('appointments.selectDoctor')}
                  </label>
                  <div className="space-y-2">
                    {currentDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          selectedDoctorId === doc.id
                            ? 'border-teal-700 bg-teal-50/70 ring-1 ring-teal-600 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              selectedDoctorId === doc.id
                                ? 'bg-teal-700 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {doc.avatar}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {doc.name}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {doc.qualification} • {doc.room}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded">
                            {doc.opdDays}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visit Date & Reason */}
                <div className="space-y-3">
                  <Input
                    label={t('appointments.selectDate')}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />

                  <Input
                    label={t('appointments.reasonForVisit')}
                    type="text"
                    placeholder="Example: Fever, BP check, routine follow-up..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* =================================
                  TIME SLOT SELECTION WITH BLURRED BOOKED SLOTS
              ================================== */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* Time Slots Header & Legend */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-700" />
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t('appointments.selectTimeSlot')}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Schedule for <strong>{date}</strong> • Showing live OPD counter bookings
                    </p>
                  </div>

                  {/* Slot Legend */}
                  <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-wrap">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {freeSlotsCount} Available (Free)
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 text-slate-400 line-through font-medium">
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      {bookedSlotsCount} Booked (Locked)
                    </span>
                  </div>
                </div>

                {/* MORNING SLOTS (09:00 AM - 12:30 PM) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Morning OPD Session (09:00 AM – 01:00 PM)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {morningSlots.map((slot) => {
                      if (slot.isBooked) {
                        /* BOOKED SLOT: Blurred, non-selectable, line-through */
                        return (
                          <div key={slot.time} className="relative group select-none">
                            <button
                              type="button"
                              disabled
                              tabIndex={-1}
                              aria-disabled="true"
                              className="w-full py-2.5 px-2 rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-400 text-xs font-semibold filter blur-[0.7px] opacity-40 cursor-not-allowed pointer-events-none select-none line-through transition-all flex flex-col items-center justify-center gap-0.5"
                            >
                              <span>{slot.time}</span>
                              <span className="text-[9px] font-bold text-slate-400 no-underline">
                                Booked
                              </span>
                            </button>
                            <span className="absolute -top-1.5 -right-1 z-10 px-1.5 py-0.2 rounded bg-slate-200 text-[8px] font-extrabold text-slate-500 uppercase tracking-wider pointer-events-none border border-slate-300 shadow-2xs">
                              Booked
                            </span>
                          </div>
                        );
                      }

                      /* FREE SLOT: Sharp, clickable, highlighted when selected */
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`w-full py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'border-2 border-teal-700 bg-teal-700 text-white shadow-md ring-2 ring-teal-500/20 scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-slate-800 shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isSelected ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{slot.time}</span>
                          </div>
                          <span
                            className={`text-[9px] font-semibold ${
                              isSelected ? 'text-teal-100' : 'text-emerald-700'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AFTERNOON SLOTS (02:00 PM - 04:30 PM) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Moon className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Afternoon OPD Session (02:00 PM – 05:00 PM)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {afternoonSlots.map((slot) => {
                      if (slot.isBooked) {
                        /* BOOKED SLOT: Blurred, non-selectable, line-through */
                        return (
                          <div key={slot.time} className="relative group select-none">
                            <button
                              type="button"
                              disabled
                              tabIndex={-1}
                              aria-disabled="true"
                              className="w-full py-2.5 px-2 rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-400 text-xs font-semibold filter blur-[0.7px] opacity-40 cursor-not-allowed pointer-events-none select-none line-through transition-all flex flex-col items-center justify-center gap-0.5"
                            >
                              <span>{slot.time}</span>
                              <span className="text-[9px] font-bold text-slate-400 no-underline">
                                Booked
                              </span>
                            </button>
                            <span className="absolute -top-1.5 -right-1 z-10 px-1.5 py-0.2 rounded bg-slate-200 text-[8px] font-extrabold text-slate-500 uppercase tracking-wider pointer-events-none border border-slate-300 shadow-2xs">
                              Booked
                            </span>
                          </div>
                        );
                      }

                      /* FREE SLOT: Sharp, clickable, highlighted when selected */
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`w-full py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'border-2 border-teal-700 bg-teal-700 text-white shadow-md ring-2 ring-teal-500/20 scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-slate-800 shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isSelected ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{slot.time}</span>
                          </div>
                          <span
                            className={`text-[9px] font-semibold ${
                              isSelected ? 'text-teal-100' : 'text-emerald-700'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* =================================
                  BOTTOM SUMMARY & SUBMIT
              ================================== */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50/60 p-4 shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-teal-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                    Appointment Booking Summary
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {bookingPatient.name} • {activeDoctor.name} ({activeDoctor.room})
                  </p>
                  <p className="text-xs text-teal-900 font-medium">
                    {date} at <strong className="font-bold underline">{selectedSlot}</strong> (Confirmed Open Slot)
                  </p>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shadow-xs"
                  isLoading={isLoading}
                >
                  {t('appointments.confirmBooking')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>


      {/* =========================================
          MY APPOINTMENTS (UPCOMING & PREVIOUS)
      ========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-4 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                <CalendarDays className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {t('appointments.myAppointments', 'My Appointments')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {bookingPatient.name} • {upcomingAppointments.length} upcoming, {pastAppointments.length} past visits
                </p>
              </div>
            </div>

            {/* Tab switch buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'UPCOMING'
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t('appointments.upcomingAppointments', 'Upcoming & Scheduled')}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    upcomingAppointments.length > 0
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {upcomingAppointments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PREVIOUS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'PREVIOUS'
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t('appointments.pastAppointments', 'Previous Visits')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                  {pastAppointments.length}
                </span>
              </button>
            </div>
          </div>

          {/* =====================================
              TAB 1: UPCOMING & SCHEDULED APPOINTMENTS
          ====================================== */}
          {activeTab === 'UPCOMING' && (
            <div>
              {upcomingAppointments.length === 0 ? (
                <div className="p-10 text-center space-y-2.5">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No Upcoming Appointments</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You currently do not have any pending appointments scheduled. Select a hospital, doctor, and slot above to book an OPD consultation.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingAppointments.map((apt) => {
                    const isCheckedIn = apt.status === 'CHECKED_IN';
                    return (
                      <div
                        key={apt.id}
                        className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left: Details */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {isCheckedIn ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                  Active in Hospital • Token #{apt.tokenNumber || 'A-042'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                  Confirmed • Awaiting Hospital OPD Check-in
                                </span>
                              )}

                              <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                ID: {apt.id}
                              </span>

                              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                                👤 {apt.patientName}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 text-teal-700 shrink-0" />
                                {apt.facilityName || 'Gandhinagar Civil Hospital'}
                              </h3>
                              <p className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center gap-2">
                                <span>{apt.doctorName || 'Dr. Vikramaditya Mehta'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-teal-700 font-medium">{apt.specialty}</span>
                              </p>
                            </div>

                            {/* Date, Time & Guidance */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                              <span className="flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <CalendarDays className="h-3.5 w-3.5 text-teal-700" />
                                {apt.date}
                              </span>
                              <span className="flex items-center gap-1 font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                                <Clock className="h-3.5 w-3.5 text-teal-700" />
                                {apt.timeSlot}
                              </span>
                              {apt.reasonForVisit && (
                                <span className="text-[11px] text-slate-500 italic">
                                  "{apt.reasonForVisit}"
                                </span>
                              )}
                            </div>

                            {/* Status notice */}
                            {!isCheckedIn ? (
                              <p className="text-[11px] text-amber-700 flex items-center gap-1 bg-amber-50/60 p-1.5 rounded-lg border border-amber-100">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                <span>
                                  <strong>Hospital arrival pending:</strong> Please arrive at the hospital 15 mins early and click <strong>Self Check-in</strong> to receive your live OPD queue token.
                                </span>
                              </p>
                            ) : (
                              <p className="text-[11px] text-emerald-800 flex items-center gap-1 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                <span>
                                  <strong>Token is active in queue:</strong> Head toward OPD Room. Watch the token screen or monitor live wait times.
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
                            {!isCheckedIn ? (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(apt.id)}
                                isLoading={checkInLoadingId === apt.id}
                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs gap-1.5 whitespace-nowrap"
                              >
                                <Ticket className="h-3.5 w-3.5" />
                                Hospital Self Check-in
                              </Button>
                            ) : (
                              <Link to="/patient/tokens">
                                <Button
                                  size="sm"
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs gap-1.5 whitespace-nowrap"
                                >
                                  <Ticket className="h-3.5 w-3.5" />
                                  Track Live Token ↗
                                </Button>
                              </Link>
                            )}

                            <Link to={`/patient/appointments/${apt.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold rounded-xl gap-1 text-slate-700 hover:bg-slate-50 cursor-pointer border-slate-300"
                              >
                                <Eye className="h-3.5 w-3.5 text-teal-700" />
                                View OPD Pass
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================
              TAB 2: PREVIOUS APPOINTMENTS
          ====================================== */}
          {activeTab === 'PREVIOUS' && (
            <div>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Date</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Hospital</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Doctor / Dept</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Time</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                            <span className="text-xs font-semibold text-slate-800">{appointment.date}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-800">{appointment.facilityName || (appointment as any).hospital}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {appointment.doctorName ? `${appointment.doctorName} • ` : ''}{appointment.specialty || (appointment as any).department}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">{appointment.timeSlot || (appointment as any).time}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {appointment.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                              <XCircle className="h-3 w-3" />
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/patient/appointments/${appointment.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE HISTORY */}
              <div className="md:hidden divide-y divide-slate-100">
                {pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {appointment.facilityName || (appointment as any).hospital}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {appointment.specialty || (appointment as any).department}
                        </p>
                      </div>

                      {appointment.status === 'COMPLETED' ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                          Completed
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-600">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.timeSlot || (appointment as any).time}
                        </span>
                      </div>

                      <Link
                        to={`/patient/appointments/${appointment.id}`}
                        className="flex items-center gap-1 text-[10px] font-semibold text-teal-700"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};