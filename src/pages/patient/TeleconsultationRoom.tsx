import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { INITIAL_HEALTH_RECORD } from '@/mock/mockData';

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Wifi,
  FileText,
  Clock,
  CheckCircle2,
  History,
  Stethoscope,
  Hospital,
  User,
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Phone,
  RefreshCw,
  Calendar,
  Pill,
  ChevronRight,
  Heart,
  Activity,
  Award,
  X,
  Check,
  Paperclip,
} from 'lucide-react';

interface VisitedDoctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  department: string;
  hospital: string;
  roomNumber: string;
  experience: string;
  lastVisitedDate: string;
  lastDiagnosis: string;
  lastPrescription: string;
  previousAdvice: string;
  status: 'ONLINE' | 'IN_OPD' | 'BUSY';
  statusText: string;
  queueLength: number;
  rating: string;
  avatarColor: string;
  initials: string;
}

interface FamilyPatient {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  abhaId: string;
  bloodGroup: string;
  visitedDoctorIds: string[];
}

interface ConsultationRequestToken {
  tokenNumber: string;
  doctor: VisitedDoctor;
  patient: FamilyPatient;
  requestType: 'INSTANT' | 'SCHEDULED';
  scheduledDate: string;
  scheduledTimeSlot: string;
  reason: string;
  urgency: 'ROUTINE' | 'PRIORITY' | 'URGENT';
  symptomDetails: string;
  attachedReports: boolean;
  registeredAt: string;
}

const FAMILY_PATIENTS: FamilyPatient[] = [
  {
    id: 'pat_01',
    name: 'Rameshwar Sharma',
    relation: 'Self (Primary)',
    age: 48,
    gender: 'Male',
    abhaId: '14-8921-3409-7721',
    bloodGroup: 'B+',
    visitedDoctorIds: ['doc_patel', 'doc_vaghela', 'doc_sharma', 'doc_mehta'],
  },
  {
    id: 'pat_02',
    name: 'Saraswati Sharma',
    relation: 'Spouse',
    age: 44,
    gender: 'Female',
    abhaId: '14-8921-3409-7722',
    bloodGroup: 'A+',
    visitedDoctorIds: ['doc_vaghela', 'doc_sharma'],
  },
  {
    id: 'pat_03',
    name: 'Aarav Sharma',
    relation: 'Son',
    age: 12,
    gender: 'Male',
    abhaId: '14-8921-3409-7723',
    bloodGroup: 'B+',
    visitedDoctorIds: ['doc_sharma', 'doc_mehta'],
  },
];

const VISITED_DOCTORS: VisitedDoctor[] = [
  {
    id: 'doc_patel',
    name: 'Dr. Arvind Patel',
    degree: 'MD (Internal Medicine & Cardiology)',
    specialty: 'Cardiologist & Physician',
    department: 'General Medicine & Cardiac OPD',
    hospital: 'Gandhinagar Civil Hospital',
    roomNumber: 'Room 4',
    experience: '18 Years Exp',
    lastVisitedDate: '01 Mar 2026 (11 days ago)',
    lastDiagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension',
    lastPrescription: 'Tab. Metformin 1000mg SR (1-0-1), Tab. Telmisartan 40mg (1-0-0)',
    previousAdvice: 'Follow-up in 2 weeks with daily morning BP & blood sugar chart.',
    status: 'ONLINE',
    statusText: 'Available for Video Call • 0 Ahead in Queue',
    queueLength: 0,
    rating: '4.9 ★ (2,450+ teleconsults)',
    avatarColor: 'from-teal-600 to-teal-800',
    initials: 'AP',
  },
  {
    id: 'doc_vaghela',
    name: 'Dr. Neha Vaghela',
    degree: 'MS (Ophthalmology & Retina)',
    specialty: 'Eye Specialist & Retina Surgeon',
    department: 'Ophthalmology & Diabetic Eye Wing',
    hospital: 'Gandhinagar Civil Hospital',
    roomNumber: 'Room 12',
    experience: '14 Years Exp',
    lastVisitedDate: '20 Jan 2026',
    lastDiagnosis: 'Diabetic Retinopathy Screening & Fundus Check',
    lastPrescription: 'Carboxymethylcellulose 0.5% Eye Drops (1 drop TDS)',
    previousAdvice: 'Annual fundus examination clear. Contact immediately if floaters or blurriness occur.',
    status: 'ONLINE',
    statusText: 'Available for Video Call • Instant Connect',
    queueLength: 0,
    rating: '4.8 ★ (1,820+ teleconsults)',
    avatarColor: 'from-indigo-600 to-indigo-800',
    initials: 'NV',
  },
  {
    id: 'doc_sharma',
    name: 'Dr. Priya Sharma',
    degree: 'MBBS, DNB (Family Medicine)',
    specialty: 'Family & General Physician',
    department: 'Primary Health Care & Community Medicine',
    hospital: 'Pethapur Primary Health Centre (PHC)',
    roomNumber: 'OPD 1',
    experience: '9 Years Exp',
    lastVisitedDate: '15 Dec 2025',
    lastDiagnosis: 'Acute Bacterial Bronchitis & Mild Dehydration',
    lastPrescription: 'Tab. Azithromycin 500mg, Syrup Levosalbutamol',
    previousAdvice: 'Steam inhalation twice daily. Return if wheezing or fever recurs.',
    status: 'IN_OPD',
    statusText: 'In Hospital OPD • Online Tele-Queue: 1 patient ahead',
    queueLength: 1,
    rating: '4.7 ★ (980+ teleconsults)',
    avatarColor: 'from-emerald-600 to-emerald-800',
    initials: 'PS',
  },
  {
    id: 'doc_mehta',
    name: 'Dr. Rajesh Mehta',
    degree: 'MD (Emergency Medicine & Critical Care)',
    specialty: 'Emergency Medicine & Triage Specialist',
    department: '24x7 Government Tele-Emergency Desk',
    hospital: 'Gandhinagar Civil Hospital',
    roomNumber: 'Emergency Desk 1',
    experience: '12 Years Exp',
    lastVisitedDate: '04 Nov 2025 (Inpatient Care)',
    lastDiagnosis: 'Acute Asthmatic Bronchitis with Mild Hypoxia',
    lastPrescription: 'Nebulization & Inhaler maintenance',
    previousAdvice: 'Keep Salbutamol inhaler in hand. Emergency hotline 108.',
    status: 'ONLINE',
    statusText: '24x7 Duty Doctor • Instant Connect (0 Wait)',
    queueLength: 0,
    rating: '4.9 ★ (3,120+ teleconsults)',
    avatarColor: 'from-amber-600 to-amber-800',
    initials: 'RM',
  },
];

const TIME_SLOTS = [
  '10:00 AM - 10:30 AM',
  '11:30 AM - 12:00 PM',
  '02:30 PM - 03:00 PM',
  '04:00 PM - 04:30 PM',
  '05:30 PM - 06:00 PM',
  '07:00 PM - 07:30 PM',
];

const REASON_PRESETS = [
  'Follow-up on Previous Prescription',
  'Review Recent Lab / ECG Reports',
  'Chest Discomfort & Blood Pressure Check',
  'Fever, Cough or Throat Soreness',
  'Medication Refill & Dose Adjustment',
  'Routine Chronic Condition Review',
];

export const TeleconsultationRoom: React.FC = () => {
  const navigate = useNavigate();

  // Selected Family Member / Patient Profile
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat_01');
  const activePatient =
    FAMILY_PATIENTS.find((p) => p.id === selectedPatientId) || FAMILY_PATIENTS[0];

  // Call Stage State Machine:
  // 'SELECT_DOCTOR' -> 'REQUEST_CONFIRMED' -> 'CONNECTING' -> 'IN_CALL' -> 'COMPLETED'
  const [callStage, setCallStage] = useState<
    'SELECT_DOCTOR' | 'REQUEST_CONFIRMED' | 'CONNECTING' | 'IN_CALL' | 'COMPLETED'
  >('SELECT_DOCTOR');

  // Selected Doctor
  const [selectedDoctor, setSelectedDoctor] = useState<VisitedDoctor>(VISITED_DOCTORS[0]);

  // Request Consultation Popup Form States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDoctor, setRequestDoctor] = useState<VisitedDoctor>(VISITED_DOCTORS[0]);
  const [requestType, setRequestType] = useState<'INSTANT' | 'SCHEDULED'>('SCHEDULED');
  const [selectedDateOption, setSelectedDateOption] = useState<string>('Today (12 Sep)');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[4]);
  const [selectedReason, setSelectedReason] = useState<string>(REASON_PRESETS[0]);
  const [symptomDetails, setSymptomDetails] = useState<string>(
    'Requesting follow-up consultation to review fasting blood sugar (148 mg/dL) and daily resting BP.'
  );
  const [urgencyLevel, setUrgencyLevel] = useState<'ROUTINE' | 'PRIORITY' | 'URGENT'>('ROUTINE');
  const [attachPastReports, setAttachPastReports] = useState<boolean>(true);

  // Confirmed Token Details
  const [confirmedToken, setConfirmedToken] = useState<ConsultationRequestToken | null>(null);

  // Doctor Filter Tabs in Selection View
  const [doctorFilter, setDoctorFilter] = useState<
    'ALL' | 'RECENT' | 'ONLINE' | 'SPECIALISTS'
  >('ALL');
  const [searchDoctorQuery, setSearchDoctorQuery] = useState('');

  // Call duration counter
  const [callDuration, setCallDuration] = useState<number>(0);

  // In-Call Media States
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  // Live Consultation Notes
  const [notes, setNotes] = useState(
    'Discussed current blood pressure readings and adherence to Telmisartan 40mg. Doctor advised routine monitoring.'
  );

  // Auto-ticking call duration timer
  useEffect(() => {
    let interval: any = null;
    if (callStage === 'IN_CALL') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (callStage === 'SELECT_DOCTOR' || callStage === 'REQUEST_CONFIRMED') {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStage]);

  // Open the Request Popup Form for a specific doctor
  const handleOpenRequestModal = (doc: VisitedDoctor) => {
    setRequestDoctor(doc);
    setSelectedDoctor(doc);
    setSelectedReason(
      doc.id === 'doc_vaghela'
        ? 'Eye Review & Diabetic Retina Follow-up'
        : doc.id === 'doc_sharma'
        ? 'Bronchitis & Cough Follow-up'
        : 'Follow-up on Previous Prescription'
    );
    setShowRequestModal(true);
  };

  // Submit Consultation Request & Register Time Slot
  const handleSubmitConsultationRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const tokenNum = `TC-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: ConsultationRequestToken = {
      tokenNumber: tokenNum,
      doctor: requestDoctor,
      patient: activePatient,
      requestType,
      scheduledDate: selectedDateOption,
      scheduledTimeSlot: requestType === 'INSTANT' ? 'Immediate Live Queue (~2-5 mins)' : selectedTimeSlot,
      reason: selectedReason,
      urgency: urgencyLevel,
      symptomDetails,
      attachedReports: attachPastReports,
      registeredAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    // Save to localStorage for integration with doctor queue
    const existingRequests = JSON.parse(
      localStorage.getItem('teleconsultation_requests') || '[]'
    );
    localStorage.setItem(
      'teleconsultation_requests',
      JSON.stringify([newRequest, ...existingRequests])
    );

    setConfirmedToken(newRequest);
    setSelectedDoctor(requestDoctor);
    setShowRequestModal(false);
    setCallStage('REQUEST_CONFIRMED');
  };

  // Direct Immediate Call Bypass
  const handleInitiateImmediateCall = (doc: VisitedDoctor) => {
    setSelectedDoctor(doc);
    setCallStage('CONNECTING');
    setNotes(
      `Teleconsultation with ${doc.name} (${doc.specialty}) for ${activePatient.name}. Follow-up regarding ${doc.lastDiagnosis}.`
    );

    setTimeout(() => {
      setCallStage('IN_CALL');
    }, 2400);
  };

  // Start Call from Confirmed Token Voucher
  const handleStartCallFromToken = () => {
    if (confirmedToken) {
      setSelectedDoctor(confirmedToken.doctor);
    }
    setCallStage('CONNECTING');
    setTimeout(() => {
      setCallStage('IN_CALL');
    }, 2400);
  };

  // End consultation and save it into communication history
  const handleEndCall = () => {
    const now = new Date();
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    const durationFormatted = `${mins} mins ${secs} secs`;

    const consultation = {
      id: confirmedToken?.tokenNumber || `CONS-${Date.now()}`,
      patientName: activePatient.name,
      abhaId: activePatient.abhaId,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      hospitalName: selectedDoctor.hospital,
      date: now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: durationFormatted || '10 mins 15 secs',
      status: 'Completed',
      notes: notes || 'No consultation notes added.',
      advice: `Follow-up instructions given by ${selectedDoctor.name}. Maintain prescribed dosage.`,
      followUp: 'Follow-up scheduled as advised by doctor.',
    };

    const existingHistory = JSON.parse(
      localStorage.getItem('teleconsultation_history') || '[]'
    );

    localStorage.setItem(
      'teleconsultation_history',
      JSON.stringify([consultation, ...existingHistory])
    );

    setCallStage('COMPLETED');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered Doctors List for Selected Patient
  const patientDoctors = VISITED_DOCTORS.filter((doc) =>
    activePatient.visitedDoctorIds.includes(doc.id)
  );

  const filteredDoctors = patientDoctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      doc.lastDiagnosis.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchDoctorQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (doctorFilter === 'ONLINE') return doc.status === 'ONLINE';
    if (doctorFilter === 'SPECIALISTS')
      return doc.specialty.includes('Cardiologist') || doc.specialty.includes('Specialist');
    return true;
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* ================================
          PAGE HEADER
      ================================= */}
      <PageHeader
        title="Teleconsultation"
        subtitle="Request a consultation and register your preferred time to talk with your doctor."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Teleconsultation', to: '/patient/teleconsultation' },
          { label: 'Request Doctor Call' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {callStage === 'IN_CALL' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCallStage('SELECT_DOCTOR')}
                className="gap-1.5 text-xs bg-white text-slate-700"
              >
                <Users className="h-3.5 w-3.5" />
                Switch Doctor
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patient/teleconsultation-history')}
              className="gap-1.5 text-xs bg-white text-teal-800 border-teal-300 font-bold"
            >
              <History className="h-4 w-4 text-teal-700" />
              <span>Consultation History</span>
            </Button>
          </div>
        }
      />

      {/* ================================================== */}
      {/* STAGE 1: DOCTOR & PATIENT SELECTION LOBBY */}
      {/* ================================================== */}
      {callStage === 'SELECT_DOCTOR' && (
        <div className="space-y-5">
          {/* Top Patient / Family Member Selector Strip */}
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-white shadow-xs">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-2xs">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block">
                      Consultation Patient Profile
                    </span>
                    <h2 className="text-base font-black text-slate-900">
                      Who is this consultation for?
                    </h2>
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-medium self-start sm:self-center">
                  Select family member to see their visited care team:
                </span>
              </div>

              {/* Family Member Radio Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {FAMILY_PATIENTS.map((p) => {
                  const isSelected = p.id === selectedPatientId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-teal-400 bg-white ring-2 ring-teal-600/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-black text-slate-900 truncate">
                            {p.name}
                          </strong>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.relation} • {p.age}Y / {p.gender}
                        </p>
                        <p className="text-[10px] text-teal-700 font-bold mt-1">
                          ● {p.visitedDoctorIds.length} Visited Doctors on record
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Doctors Who Visited You Heading & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-700" />
                  <span>Doctors Who Already Visited & Treated {activePatient.name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a suitable doctor to request a call and choose your preferred time.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor, hospital, symptom..."
                  value={searchDoctorQuery}
                  onChange={(e) => setSearchDoctorQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'ALL', label: `All Doctors (${patientDoctors.length})` },
                { id: 'ONLINE', label: '🟢 Online Now' },
                { id: 'SPECIALISTS', label: 'Specialists' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDoctorFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    doctorFilter === tab.id
                      ? 'bg-teal-700 text-white shadow-2xs font-black'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Visited Doctors List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <Card
                  key={doc.id}
                  className="border-slate-200/90 bg-white hover:border-teal-300 transition-all shadow-2xs hover:shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <CardContent className="p-4 sm:p-5 space-y-3.5">
                    {/* Top Row: Avatar, Status & Doctor Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${doc.avatarColor} text-white font-black text-base shadow-xs relative`}
                        >
                          {doc.initials}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              doc.status === 'ONLINE'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-amber-500'
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {doc.name}
                          </h4>
                          <p className="text-xs font-bold text-teal-800 truncate">
                            {doc.specialty}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <Hospital className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{doc.hospital}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 border ${
                          doc.status === 'ONLINE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {doc.status === 'ONLINE' ? '● Online' : '● In OPD'}
                      </span>
                    </div>

                    {/* Visited Details Ribbon */}
                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">Last Visited For:</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {doc.lastVisitedDate}
                        </span>
                      </div>
                      <p className="font-bold text-teal-950 text-xs">{doc.lastDiagnosis}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        <strong>Advice:</strong> {doc.previousAdvice}
                      </p>
                    </div>

                    {/* Prescriptions Given */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                      <span className="truncate">
                        <strong>Rx:</strong> {doc.lastPrescription}
                      </span>
                    </div>

                    {/* ACTION BUTTONS: REQUEST CONSULTATION & CHOOSE TIME + QUICK CALL */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 w-full sm:w-auto">
                        <p className="font-semibold text-slate-700">{doc.statusText}</p>
                        <p className="text-[9px] text-slate-400">{doc.rating}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Primary: Request Call & Choose Suitable Time */}
                        <Button
                          onClick={() => handleOpenRequestModal(doc)}
                          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-black gap-1.5 h-9 px-3.5 shadow-xs flex-1 sm:flex-initial cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Request Call & Choose Time</span>
                        </Button>

                        {/* Secondary: Quick Immediate Call */}
                        <Button
                          variant="outline"
                          onClick={() => handleInitiateImmediateCall(doc)}
                          className="text-xs h-9 px-2.5 text-slate-700 hover:bg-teal-50 hover:text-teal-900 border-slate-300 font-bold cursor-pointer"
                          title="Instant Call (Connect Now)"
                        >
                          <Video className="h-3.5 w-3.5 text-teal-700" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* POPUP MODAL FORM: REQUEST CALL & REGISTER TIME SLOT */}
      {/* ================================================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4.5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${requestDoctor.avatarColor} text-white font-bold text-sm shadow-xs`}
                >
                  {requestDoctor.initials}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block">
                    Book Doctor Teleconsultation
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Request Call with {requestDoctor.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {requestDoctor.specialty} • {requestDoctor.hospital}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitConsultationRequest} className="space-y-4">
              {/* Patient Identity Strip */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient</span>
                  <strong className="text-slate-900 font-bold">{activePatient.name}</strong>
                  <span className="text-slate-500 ml-1">({activePatient.relation} • {activePatient.age}Y)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ABHA ID</span>
                  <span className="font-mono text-[11px] font-bold text-teal-800">{activePatient.abhaId}</span>
                </div>
              </div>

              {/* Consultation Timing Type: Instant vs Register Time Slot */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  1. Choose When You Want to Talk with the Doctor:
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType('SCHEDULED')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      requestType === 'SCHEDULED'
                        ? 'bg-teal-50 border-teal-400 text-teal-900 ring-2 ring-teal-500/70 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Calendar className="h-3.5 w-3.5 text-teal-700" />
                      <span>Preferred Time Slot</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Register your suitable date & time window
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('INSTANT')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      requestType === 'INSTANT'
                        ? 'bg-teal-50 border-teal-400 text-teal-900 ring-2 ring-teal-500/70 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                      <span>Instant Call (Queue)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Doctor rings you as soon as available (~2-5 mins)
                    </p>
                  </button>
                </div>
              </div>

              {/* If Scheduled: Select Date & Available Slots */}
              {requestType === 'SCHEDULED' && (
                <div className="space-y-2.5 bg-teal-50/40 p-3 rounded-xl border border-teal-100">
                  {/* Date Chips */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      Select Suitable Date:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Today (12 Sep)', 'Tomorrow (13 Sep)', 'Monday (15 Sep)'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDateOption(d)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedDateOption === d
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      Select Suitable Time Window:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer ${
                            selectedTimeSlot === slot
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                          }`}
                        >
                          <Clock className="h-3 w-3 inline mr-1 text-teal-600" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Reason & Complaints */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  2. Reason for Consultation:
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {REASON_PRESETS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        selectedReason === reason
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={symptomDetails}
                  onChange={(e) => setSymptomDetails(e.target.value)}
                  placeholder="Describe any symptoms, doubts or medications to discuss..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              {/* Urgency Level */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  3. Triage Urgency Level:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'ROUTINE', label: '🟢 Routine Follow-up', desc: 'Non-urgent review' },
                    { id: 'PRIORITY', label: '🟡 Moderate Concern', desc: 'Needs attention' },
                    { id: 'URGENT', label: '🔴 Urgent Request', desc: 'Severe discomfort' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setUrgencyLevel(lvl.id as any)}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        urgencyLevel === lvl.id
                          ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/70 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-[11px] text-slate-900">{lvl.label}</p>
                      <p className="text-[9px] text-slate-400">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attach Past ABHA Reports Checkbox */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="attachReports"
                  checked={attachPastReports}
                  onChange={(e) => setAttachPastReports(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-teal-700 focus:ring-teal-600 border-slate-300 cursor-pointer"
                />
                <label htmlFor="attachReports" className="text-xs cursor-pointer">
                  <span className="font-bold text-slate-800 block">
                    Share Latest ABHA Diagnostic & Prescription Records
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed">
                    Automatically securely attaches recent HbA1c (7.4%), Fasting Glucose (148 mg/dL), and ECG reports for the doctor to review during the call.
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRequestModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-black text-xs gap-1.5 px-5 h-9 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Register & Submit Consultation Request</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STAGE: REQUEST CONFIRMED & QUEUE TOKEN VOUCHER */}
      {/* ================================================== */}
      {callStage === 'REQUEST_CONFIRMED' && confirmedToken && (
        <Card className="border-teal-200 bg-white shadow-lg overflow-hidden max-w-2xl mx-auto animate-in fade-in duration-150">
          <div className="bg-gradient-to-r from-teal-700 to-teal-800 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-2xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
                  Request Confirmed & Registered
                </span>
                <h3 className="text-base font-black">
                  Consultation Token: {confirmedToken.tokenNumber}
                </h3>
              </div>
            </div>

            <span className="rounded-full bg-emerald-400 text-emerald-950 font-black text-[10px] px-2.5 py-0.5">
              ● Registered
            </span>
          </div>

          <CardContent className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-slate-900">
                Your Request has been Sent to {confirmedToken.doctor.name}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The doctor has been notified in their teleconsultation desk. You have registered to talk with the doctor at your selected time.
              </p>
            </div>

            {/* Token Voucher Grid */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Doctor</span>
                  <strong className="text-slate-900 font-black text-sm block">
                    {confirmedToken.doctor.name}
                  </strong>
                  <span className="text-teal-800 text-[11px] font-semibold">
                    {confirmedToken.doctor.specialty}
                  </span>
                  <p className="text-[10px] text-slate-400">{confirmedToken.doctor.hospital}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered Time</span>
                  <strong className="text-teal-900 font-black text-sm block">
                    {confirmedToken.scheduledTimeSlot}
                  </strong>
                  <span className="text-slate-600 text-[11px]">{confirmedToken.scheduledDate}</span>
                  <p className="text-[10px] text-emerald-700 font-bold">● Slot Reserved</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <strong className="text-slate-900 font-bold">{confirmedToken.patient.name}</strong>
                  <p className="text-[10px] text-slate-400 font-mono">ABHA: {confirmedToken.patient.abhaId}</p>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block">Reason for Call:</span>
                  <strong className="text-slate-900 font-bold">{confirmedToken.reason}</strong>
                  <p className="text-[10px] text-teal-700 font-semibold">Urgency: {confirmedToken.urgency}</p>
                </div>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-xs text-teal-950 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">What happens next?</strong>
                <p className="text-[11px] text-teal-900 leading-relaxed mt-0.5">
                  Keep your phone or browser ready. When the doctor accepts your request or rings at the scheduled time, you can enter the waiting room or click below to start immediately.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Button
                onClick={handleStartCallFromToken}
                className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-black text-xs gap-1.5 px-6 min-h-[42px] shadow-xs cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Enter Live Waiting Room / Start Call Now</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setCallStage('SELECT_DOCTOR')}
                className="w-full sm:w-auto text-xs font-bold text-slate-700 min-h-[42px]"
              >
                Book Another Doctor / Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================== */}
      {/* STAGE 2: CONNECTING / CALL RINGING STATE */}
      {/* ================================================== */}
      {callStage === 'CONNECTING' && (
        <Card className="border-teal-200 bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl overflow-hidden py-10">
          <CardContent className="p-6 text-center space-y-6 max-w-md mx-auto">
            {/* Pulsing Avatar */}
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
              <span className="absolute -inset-2 rounded-full bg-teal-500/30 animate-pulse" />
              <div
                className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr ${selectedDoctor.avatarColor} text-3xl font-black text-white border-4 border-teal-400/60 shadow-2xl`}
              >
                {selectedDoctor.initials}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 px-3 py-0.5 text-xs font-bold text-teal-300">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                Connecting via ABDM Telehealth Bridge
              </span>

              <h2 className="text-xl font-black text-white pt-1">
                Calling {selectedDoctor.name}...
              </h2>
              <p className="text-xs text-teal-200">
                {selectedDoctor.specialty} • {selectedDoctor.hospital}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Patient: <strong>{activePatient.name}</strong> (ABHA: {activePatient.abhaId})
              </p>
            </div>

            {/* Encryption & Quality Badge */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-teal-300">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>End-to-End Encrypted Video Handshake</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Government of Gujarat Teleconsultation Server • HD 720p Ready
              </p>
            </div>

            {/* Cancel or Immediate Bypass Button */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={() => setCallStage('SELECT_DOCTOR')}
                className="rounded-full px-6 font-bold text-xs"
              >
                <PhoneOff className="h-4 w-4 mr-1.5" />
                Cancel Call
              </Button>

              <Button
                variant="outline"
                onClick={() => setCallStage('IN_CALL')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs rounded-full"
              >
                Connect Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================== */}
      {/* STAGE 3: ACTIVE VIDEO CALL */}
      {/* ================================================== */}
      {callStage === 'IN_CALL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Video Stream Window */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-lg border border-slate-800">
              {/* Doctor Video Feed (Simulated) */}
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950 p-6 text-center text-white">
                <div className="relative">
                  <div
                    className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr ${selectedDoctor.avatarColor} text-2xl font-black text-white border-4 border-teal-400/60 shadow-xl`}
                  >
                    {selectedDoctor.initials}
                  </div>
                  <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-slate-950 text-white">
                    <Stethoscope className="h-3 w-3" />
                  </span>
                </div>

                <h3 className="mt-3 text-base font-black text-white">
                  {selectedDoctor.name}
                </h3>
                <p className="text-xs text-teal-300">{selectedDoctor.specialty}</p>

                {/* Animated Speech Waveform when Doctor is talking */}
                <div className="mt-3 flex items-center gap-1">
                  <span className="h-2 w-1 bg-teal-400 rounded-full animate-pulse" />
                  <span className="h-4 w-1 bg-teal-400 rounded-full animate-pulse delay-75" />
                  <span className="h-6 w-1 bg-teal-400 rounded-full animate-pulse delay-150" />
                  <span className="h-3 w-1 bg-teal-400 rounded-full animate-pulse delay-100" />
                  <span className="h-5 w-1 bg-teal-400 rounded-full animate-pulse delay-200" />
                  <span className="h-2 w-1 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-teal-300 ml-2 font-mono font-bold">
                    Speaking • Audio Live
                  </span>
                </div>
              </div>

              {/* Patient Self-View PiP */}
              <div className="absolute right-4 top-4 h-24 w-36 rounded-xl border-2 border-white/30 bg-slate-900/90 overflow-hidden text-white shadow-xl flex items-center justify-center">
                {cameraOn ? (
                  <div className="text-center p-2">
                    <div className="h-8 w-8 mx-auto rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold">
                      {activePatient.name.split(' ')[0].slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[10px] font-bold text-white mt-1 truncate max-w-[120px]">
                      {activePatient.name}
                    </p>
                    <p className="text-[8px] text-teal-300">Self View</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <VideoOff className="h-5 w-5 mx-auto" />
                    <p className="text-[9px] mt-1">Camera Off</p>
                  </div>
                )}
              </div>

              {/* Top Left Telemetry Overlay */}
              <div className="absolute left-4 top-4 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-white border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-mono">{formatTimer(callDuration)}</span>
                </div>

                <div className="hidden sm:flex items-center gap-1 rounded-full bg-teal-950/80 px-2.5 py-1 text-[10px] font-bold text-teal-300 border border-teal-500/20">
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span>HD 720p • ABDM Encrypted</span>
                </div>
              </div>

              {/* Bottom Left Doctor Overlay */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-slate-900/80 backdrop-blur-xs px-3 py-2 text-xs text-white border border-white/10 max-w-xs">
                <p className="font-black text-white">{selectedDoctor.name}</p>
                <p className="text-[10px] text-teal-300">{selectedDoctor.hospital}</p>
              </div>
            </div>

            {/* Call Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setMicOn(!micOn)}
                  variant={micOn ? 'secondary' : 'destructive'}
                  size="icon"
                  className="rounded-full h-11 w-11 cursor-pointer"
                  title={micOn ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={() => setCameraOn(!cameraOn)}
                  variant={cameraOn ? 'secondary' : 'destructive'}
                  size="icon"
                  className="rounded-full h-11 w-11 cursor-pointer"
                  title={cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={() => setScreenSharing(!screenSharing)}
                  variant={screenSharing ? 'primary' : 'secondary'}
                  size="icon"
                  className="rounded-full h-11 w-11 cursor-pointer"
                  title="Share Screen"
                >
                  <MonitorUp className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCallStage('SELECT_DOCTOR')}
                  variant="outline"
                  size="sm"
                  className="text-xs text-slate-600 gap-1"
                >
                  <Users className="h-3.5 w-3.5 text-teal-700" />
                  <span>Switch Doctor</span>
                </Button>

                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  className="rounded-full min-h-[42px] px-5 gap-2 font-bold cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>End Call</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Connected Doctor Details & Patient Chart */}
          <div className="lg:col-span-4 space-y-3">
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-teal-50/50 flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                    Active Tele-Encounter
                  </span>
                  <CardTitle className="text-sm font-black text-slate-900">
                    Connected Doctor
                  </CardTitle>
                </div>

                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  ● Live Call
                </span>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5 text-xs">
                {/* Doctor Bio Card */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${selectedDoctor.avatarColor} text-white font-bold text-sm`}
                  >
                    {selectedDoctor.initials}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{selectedDoctor.name}</h4>
                    <p className="text-[11px] text-teal-800 font-bold">{selectedDoctor.specialty}</p>
                    <p className="text-[10px] text-slate-400">{selectedDoctor.hospital}</p>
                  </div>
                </div>

                {/* Patient Context Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">Patient:</span>
                    <span className="font-bold text-slate-900">
                      {activePatient.name} ({activePatient.age}Y)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>ABHA ID:</span>
                    <span className="font-mono">{activePatient.abhaId}</span>
                  </div>
                </div>

                {/* Previous Encounter Summary with this Doctor */}
                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-2.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900 block">
                    Last Visit Record with {selectedDoctor.name}:
                  </span>
                  <p className="font-bold text-slate-900 text-[11px]">
                    {selectedDoctor.lastDiagnosis}
                  </p>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    <strong>Previous Advice:</strong> {selectedDoctor.previousAdvice}
                  </p>
                </div>

                {/* Live Consultation Notes Input */}
                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Live Consultation Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Doctor advice, revised dosages, follow-up instructions..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Notes will be synced automatically to your ABHA health records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STAGE 4: CALL COMPLETED SUMMARY */}
      {/* ================================================== */}
      {callStage === 'COMPLETED' && (
        <Card className="border-emerald-200 bg-white shadow-md">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                Teleconsultation Completed Successfully
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your consultation with <strong>{selectedDoctor.name}</strong> has ended. The
                consultation record and prescription summary have been saved to your ABHA health locker.
              </p>
            </div>

            {/* Encounter Metadata Grid */}
            <div className="mx-auto grid max-w-lg grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Attending Doctor</p>
                <p className="mt-1 text-xs font-black text-slate-900">{selectedDoctor.name}</p>
                <p className="text-[10px] text-teal-700 font-medium">{selectedDoctor.specialty}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Consulted Patient</p>
                <p className="mt-1 text-xs font-black text-slate-900">{activePatient.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">ABHA: {activePatient.abhaId}</p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Duration</p>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {formatTimer(callDuration)}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold">● Recorded</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
              <Button
                onClick={() => setCallStage('SELECT_DOCTOR')}
                variant="primary"
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-1.5 min-h-[40px]"
              >
                <Users className="h-4 w-4" />
                <span>Call Another Doctor / Back to List</span>
              </Button>

              <Button
                onClick={() => navigate('/patient/teleconsultation-history')}
                variant="outline"
                className="text-xs font-bold gap-1.5 min-h-[40px] text-slate-700"
              >
                <History className="h-4 w-4 text-teal-700" />
                <span>View Full Consultation History</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeleconsultationRoom;