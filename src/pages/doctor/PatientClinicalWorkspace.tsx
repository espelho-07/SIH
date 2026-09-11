import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import {
  INITIAL_HEALTH_RECORD,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSTIC_ORDERS,
  INITIAL_LIVE_QUEUE,
} from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  GitBranch,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Home,
  ShieldAlert,
  AlertCircle,
  Activity,
  Check,
  UserCheck,
  Users,
  Heart,
  Droplets,
  Thermometer,
  Printer,
  Sparkles,
  ArrowRight,
  FileText,
  HelpCircle,
  Pill,
  X,
  QrCode,
  Building2,
  Phone,
} from 'lucide-react';
import { createDoctorPrescribedVisit, calculateTargetDate } from '@/lib/ashaVisitStore';

// Common Quick Presets for Fast OPD Workflow (0 Typing Fatigue)
const SYMPTOM_PRESETS = [
  'Intermittent chest heaviness for 3 days',
  'High fever with chills & rigors',
  'Dry persistent cough & throat soreness',
  'Severe retro-orbital headache & fatigue',
  'Epigastric burning sensation & acidity',
  'Bilateral knee joint pain & stiffness',
  'Routine Blood Pressure checkup',
  'Routine Diabetes blood sugar review',
];

const DIAGNOSIS_PRESETS = [
  'Angina Pectoris - Rule out Ischemia',
  'Acute Viral Upper Respiratory Infection (URTI)',
  'Acute Acid Peptic Disease (GERD / Gastritis)',
  'Essential Stage 1 Hypertension',
  'Type 2 Diabetes Mellitus - Uncontrolled',
  'Acute Gastroenteritis with Mild Dehydration',
  'Osteoarthritis Knee (Bilateral)',
];

interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
}

const COMMON_RX_PRESETS: Omit<MedicineItem, 'id'>[] = [
  {
    name: 'Tab. Paracetamol 650mg',
    dosage: '650 mg',
    frequency: '1-0-1',
    duration: '3 Days',
    timing: 'After Food',
  },
  {
    name: 'Tab. Pantoprazole 40mg',
    dosage: '40 mg',
    frequency: '1-0-0',
    duration: '7 Days',
    timing: 'Before Breakfast',
  },
  {
    name: 'Tab. Amoxicillin + Clav 625mg',
    dosage: '625 mg',
    frequency: '1-0-1',
    duration: '5 Days',
    timing: 'After Food',
  },
  {
    name: 'Tab. Cetirizine 10mg',
    dosage: '10 mg',
    frequency: '0-0-1',
    duration: '5 Days',
    timing: 'Night at Bedtime',
  },
  {
    name: 'Tab. Amlodipine 5mg',
    dosage: '5 mg',
    frequency: '1-0-0',
    duration: '30 Days',
    timing: 'Morning After Food',
  },
  {
    name: 'Tab. Metformin 500mg SR',
    dosage: '500 mg',
    frequency: '1-0-1',
    duration: '30 Days',
    timing: 'With / After Meals',
  },
  {
    name: 'Tab. Sorbitrate 5mg (Sublingual)',
    dosage: '5 mg',
    frequency: 'SOS',
    duration: '15 Days',
    timing: 'Keep under tongue if chest pain occurs',
  },
  {
    name: 'Electrolyte ORS Sachet',
    dosage: '1 Sachet',
    frequency: 'SOS',
    duration: '2 Days',
    timing: 'Mix in 1L clean water',
  },
];

const LAB_TEST_PRESETS = [
  'Complete Blood Count (CBC)',
  'Fasting Blood Sugar (FBS)',
  'HbA1c (Glycated Hb)',
  '12-Lead ECG',
  'Lipid Profile Full',
  'Serum Creatinine & Urea',
  'Urine Routine & Micro',
  'Chest X-Ray (PA View)',
];

const ADVICE_PRESETS = [
  'Drink 2.5 to 3 Litres of warm boiled water daily.',
  'Strict low-salt (< 5g/day) and low-oil diet.',
  'Avoid fried, oily, and outside spicy street foods.',
  'Ensure 7-8 hours of uninterrupted sleep.',
  'Brisk walk 30 minutes every morning or evening.',
  'Return immediately if chest pain or shortness of breath occurs.',
];

export const PatientClinicalWorkspace: React.FC = () => {
  const { id: routePatientId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Queue Tokens
  const queueTokens = INITIAL_LIVE_QUEUE.tokens;
  
  // Find currently selected token or fallback to first
  const activeToken =
    queueTokens.find((t) => t.patientId === routePatientId) ||
    queueTokens[0] || {
      id: 'tok_035',
      tokenNumber: 'A-035',
      patientId: 'usr_pat_99',
      patientName: 'Govindbhai Prajapati',
      patientAge: 52,
      patientGender: 'M',
      patientPhone: '9825011122',
      status: 'CALLED',
    };

  // Base Health Record
  const basePatient = INITIAL_HEALTH_RECORD;

  // Active Patient Demographics
  const patient = {
    ...basePatient,
    patientId: activeToken.patientId,
    name: activeToken.patientName,
    age: activeToken.patientAge,
    gender: activeToken.patientGender === 'M' ? 'Male' : 'Female',
    phone: activeToken.patientPhone,
    tokenNumber: activeToken.tokenNumber,
  };

  // Left Sidebar Tab for Patient History
  const [historyTab, setHistoryTab] = useState<'VISITS' | 'MEDS' | 'LABS'>('VISITS');

  // Today's Clinical Consultation States
  const [chiefComplaint, setChiefComplaint] = useState(
    'Patient reports retrosternal chest heaviness on exertion over the past 3 days.'
  );
  const [examNotes, setExamNotes] = useState(
    'Pulse 74/min regular, BP 128/82 mmHg. Chest: Clear bilateral, no added sounds. S1 S2 heard normal.'
  );
  const [diagnosis, setDiagnosis] = useState(
    'Angina Pectoris - Rule out CAD / Ischemia'
  );

  // Today's Prescribed Medicines
  const [meds, setMeds] = useState<MedicineItem[]>([
    {
      id: 'med_01',
      name: 'Tab. Sorbitrate 5mg (Sublingual)',
      dosage: '5 mg',
      frequency: 'SOS',
      duration: '15 Days',
      timing: 'Under tongue on chest pain',
    },
    {
      id: 'med_02',
      name: 'Tab. Aspirin 75mg Gastro-resistant',
      dosage: '75 mg',
      frequency: '1-0-0',
      duration: '30 Days',
      timing: 'Morning after breakfast',
    },
    {
      id: 'med_03',
      name: 'Tab. Pantoprazole 40mg',
      dosage: '40 mg',
      frequency: '1-0-0',
      duration: '10 Days',
      timing: 'Before breakfast',
    },
  ]);

  // New Medicine Custom Form
  const [customMedName, setCustomMedName] = useState('');
  const [customMedDosage, setCustomMedDosage] = useState('');
  const [customMedFreq, setCustomMedFreq] = useState('1-0-1');
  const [customMedDuration, setCustomMedDuration] = useState('5 Days');
  const [customMedTiming, setCustomMedTiming] = useState('After Food');

  // Selected Lab Tests
  const [selectedTests, setSelectedTests] = useState<string[]>([
    '12-Lead ECG',
    'Lipid Profile Full',
    'Fasting Blood Sugar (FBS)',
  ]);

  // Clinical Advice
  const [adviceText, setAdviceText] = useState(
    'Strictly avoid strenuous physical exertion for 1 week. Low-salt, low-oil diet. Keep Sorbitrate accessible at all times. Return immediately if pain radiates to left arm or jaw.'
  );

  // ASHA Community Follow-Up Order State
  const [prescribeAshaVisit, setPrescribeAshaVisit] = useState(true);
  const [ashaPrescribedDays, setAshaPrescribedDays] = useState(3);
  const [ashaInstructions, setAshaInstructions] = useState(
    'Check resting BP and pulse. Verify morning Aspirin 75mg and Sorbitrate adherence. Alert PHC if chest tightness recurs or systolic > 145.'
  );
  const [ashaSelectedChecks, setAshaSelectedChecks] = useState<string[]>([
    'Blood Pressure',
    'Pulse Rate',
    'Medication Compliance',
  ]);
  const [ashaPriority, setAshaPriority] = useState<'ROUTINE' | 'PRIORITY' | 'URGENT'>('PRIORITY');

  // Completion States
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxNumber] = useState(`RX-2026-0311-${Math.floor(1000 + Math.random() * 9000)}`);

  // Quick symptom adder
  const handleAddSymptomPreset = (text: string) => {
    if (!chiefComplaint.trim()) {
      setChiefComplaint(text);
    } else if (!chiefComplaint.includes(text)) {
      setChiefComplaint(`${chiefComplaint}; ${text}`);
    }
  };

  // Quick medicine adder from presets
  const handleAddRxPreset = (item: Omit<MedicineItem, 'id'>) => {
    if (meds.some((m) => m.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 10)))) {
      return; // Already added
    }
    const newMed: MedicineItem = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...item,
    };
    setMeds([...meds, newMed]);
  };

  // Add custom medicine
  const handleAddCustomMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedName.trim()) return;

    setMeds([
      ...meds,
      {
        id: `med_${Date.now()}`,
        name: customMedName.trim(),
        dosage: customMedDosage.trim() || '1 Tab',
        frequency: customMedFreq,
        duration: customMedDuration,
        timing: customMedTiming,
      },
    ]);

    setCustomMedName('');
    setCustomMedDosage('');
  };

  const handleRemoveMed = (id: string) => {
    setMeds(meds.filter((m) => m.id !== id));
  };

  const toggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const toggleAshaCheck = (check: string) => {
    if (ashaSelectedChecks.includes(check)) {
      setAshaSelectedChecks(ashaSelectedChecks.filter((c) => c !== check));
    } else {
      setAshaSelectedChecks([...ashaSelectedChecks, check]);
    }
  };

  const handleCompleteConsultation = () => {
    if (prescribeAshaVisit) {
      createDoctorPrescribedVisit({
        patientId: patient.patientId || 'usr_pat_01',
        patientName: patient.name,
        patientPhone: patient.phone,
        village: 'Pethapur Ward 2',
        address: 'Plot 14, Gayatri Society',
        prescribedDays: ashaPrescribedDays,
        doctorName: 'Dr. Arvind Patel',
        doctorSpecialty: 'MD (Internal Medicine & Cardiology)',
        doctorFacility: 'Gandhinagar Civil Hospital',
        doctorInstructions: ashaInstructions,
        prescribedChecks: ashaSelectedChecks,
        priority: ashaPriority,
        purpose: `Doctor Prescribed: Follow-up for ${diagnosis || 'Angina Pectoris'}`,
      });
    }
    setIsCompleted(true);
    setShowRxModal(true);
  };

  // Next Patient in Queue
  const currentIndex = queueTokens.findIndex((t) => t.patientId === activeToken.patientId);
  const nextToken = queueTokens[currentIndex + 1] || queueTokens[0];

  const handleCallNextPatient = () => {
    setIsCompleted(false);
    setShowRxModal(false);
    if (nextToken && nextToken.patientId !== activeToken.patientId) {
      navigate(`/doctor/patients/${nextToken.patientId}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* ================================================== */}
      {/* TOP BAR: QUEUE STRIP & CALL NEXT SHORTCUT */}
      {/* ================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900">
                OPD Clinical Desk & Prescription
              </h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-300">
                ● LIVE OPD
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Gandhinagar Civil Hospital • Room 4 (Dr. Arvind Patel)
            </p>
          </div>
        </div>

        {/* Live OPD Queue Quick Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-teal-700" />
            Queue ({queueTokens.length}):
          </span>

          <div className="flex items-center gap-1.5">
            {queueTokens.map((t) => {
              const isCurrent = t.patientId === activeToken.patientId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setIsCompleted(false);
                    navigate(`/doctor/patients/${t.patientId}`);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-900 border border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isCurrent ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-700'}`}>
                    {t.tokenNumber}
                  </span>
                  <span className="max-w-[110px] truncate">{t.patientName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <Link to="/doctor/queue" className="shrink-0 ml-1">
            <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 text-slate-600 gap-1">
              <span>All Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* ACTIVE PATIENT HERO CARD: DEMOGRAPHICS + VITALS BAR */}
      {/* ================================================== */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-white shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Top Row: Patient Info & Fast Referral Action */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-teal-100 pb-3.5">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-xs">
                <span className="text-sm font-black font-mono">{patient.tokenNumber}</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {patient.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ABHA: {patient.abhaId}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    Blood: {patient.bloodGroup}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                  <span><strong>{patient.age}</strong> Yrs • <strong>{patient.gender}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-slate-400" />
                    +91 {patient.phone}
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">Gandhinagar District</span>
                </p>
              </div>
            </div>

            {/* Top Right Action Shortcuts */}
            <div className="flex items-center gap-2 self-end lg:self-center">
              <Link to="/doctor/referrals">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs bg-white text-teal-900 border-teal-300 hover:bg-teal-50 font-bold min-h-[38px] shadow-2xs"
                >
                  <GitBranch className="h-3.5 w-3.5 text-teal-700" />
                  <span>Refer to Specialist</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom Row: KEY VITALS STRIP (Always Visible - No Tabs Required) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Blood Pressure */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Heart className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BP (Resting)</p>
                <p className="text-sm font-black text-slate-900">128 / 82 <span className="text-[10px] font-normal text-slate-500">mmHg</span></p>
                <span className="text-[10px] font-bold text-emerald-700">● Normal</span>
              </div>
            </div>

            {/* Pulse */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pulse Rate</p>
                <p className="text-sm font-black text-slate-900">74 <span className="text-[10px] font-normal text-slate-500">bpm</span></p>
                <span className="text-[10px] font-bold text-emerald-700">● Regular</span>
              </div>
            </div>

            {/* Blood Sugar */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Droplets className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Blood Sugar (F)</p>
                <p className="text-sm font-black text-amber-900">148 <span className="text-[10px] font-normal text-amber-700">mg/dL</span></p>
                <span className="text-[10px] font-bold text-amber-800">▲ Mild High</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SpO2 (Room Air)</p>
                <p className="text-sm font-black text-slate-900">98%</p>
                <span className="text-[10px] font-bold text-emerald-700">● Optimal</span>
              </div>
            </div>

            {/* Temperature & Allergies */}
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-rose-200 bg-rose-50/40 p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Allergies Alert</p>
                <p className="text-xs font-black text-rose-900 truncate">Penicillin, Sulfa</p>
                <span className="text-[10px] font-bold text-rose-700">⚠ Do Not Prescribe</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* 2-COLUMN MAIN WORKSPACE: HISTORY (4) + TREATMENT (8) */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================== */}
        {/* LEFT COLUMN: PATIENT MEDICAL RECORD & HISTORY (4 COLS) */}
        {/* ========================================== */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="p-3.5 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-teal-700" />
                <span>Patient Health History</span>
              </CardTitle>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setHistoryTab('VISITS')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    historyTab === 'VISITS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Visits
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab('MEDS')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    historyTab === 'MEDS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Past Rx
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab('LABS')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    historyTab === 'LABS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Labs
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 space-y-3 max-h-[560px] overflow-y-auto">
              {/* Chronic Conditions Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Known Chronic Conditions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {patient.chronicConditions?.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* TAB 1: PAST VISITS TIMELINE */}
              {historyTab === 'VISITS' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Previous Doctor Encounters:
                  </span>
                  {patient.timeline.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-2.5 bg-white space-y-1 hover:border-teal-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <span className="text-[10px] font-medium text-slate-400">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.summary}</p>
                      {item.doctorName && (
                        <span className="text-[10px] font-semibold text-teal-700 block">
                          Dr. {item.doctorName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: PAST PRESCRIPTIONS */}
              {historyTab === 'MEDS' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Past Prescribed Medicines:
                  </span>
                  {INITIAL_PRESCRIPTIONS.map((rx) => (
                    <div
                      key={rx.id}
                      className="rounded-xl border border-slate-200 p-2.5 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{rx.diagnosisSummary}</span>
                        <StatusBadge status={rx.status} />
                      </div>
                      <div className="space-y-1 border-t border-slate-100 pt-1.5">
                        {rx.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{it.medicineName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{it.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: PAST LAB TESTS */}
              {historyTab === 'LABS' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Diagnostic Test Reports:
                  </span>
                  {INITIAL_DIAGNOSTIC_ORDERS.map((lab) => (
                    <div
                      key={lab.id}
                      className="rounded-xl border border-slate-200 p-2.5 bg-white space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{lab.testName}</span>
                        <StatusBadge status={lab.status} />
                      </div>
                      {lab.resultSummary && (
                        <p className="text-[11px] font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {lab.resultSummary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: TODAY'S CLINICAL TREATMENT & Rx (8 COLS) */}
        {/* ========================================== */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-teal-200 bg-white shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-teal-50/40 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-700 text-white shadow-xs">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-black text-slate-900">
                    Today's Treatment & Clinical Plan
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Fill complaints, diagnosis, medications, and community follow-up in one simple view.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-teal-100 text-teal-900 text-[11px] font-bold px-2.5 py-0.5 border border-teal-300">
                Step-by-Step Flow
              </span>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* ================================================== */}
              {/* STEP 1: CHIEF COMPLAINTS (WITH 1-CLICK CHIPS) */}
              {/* ================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">1</span>
                    <span>Chief Complaints & Symptoms:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Click chips to quickly append:</span>
                </div>

                {/* 1-Click Symptom Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOM_PRESETS.map((sym, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSymptomPreset(sym)}
                      className="text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 border border-slate-200 px-2.5 py-1 transition-colors cursor-pointer"
                    >
                      + {sym}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Chest tightness on exertion, mild shortness of breath..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              {/* ================================================== */}
              {/* STEP 2: CLINICAL DIAGNOSIS */}
              {/* ================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">2</span>
                    <span>Provisional / Confirmed Diagnosis:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Popular diagnoses:</span>
                </div>

                {/* 1-Click Diagnosis Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {DIAGNOSIS_PRESETS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDiagnosis(d)}
                      className={`text-[11px] font-semibold rounded-lg border px-2.5 py-1 transition-all cursor-pointer ${
                        diagnosis === d
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                          : 'bg-slate-100 hover:bg-teal-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter medical diagnosis..."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold text-slate-900"
                />
              </div>

              {/* ================================================== */}
              {/* STEP 3: PRESCRIBED MEDICATIONS (Rx) */}
              {/* ================================================== */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">3</span>
                    <span>Prescription Medicines (Rx - {meds.length} Added):</span>
                  </label>
                  <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    1-Click Popular Rx Shortcuts:
                  </span>
                </div>

                {/* 1-Click Common Rx Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_RX_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddRxPreset(preset)}
                      className="text-[11px] font-semibold rounded-lg bg-teal-50/70 hover:bg-teal-100 text-teal-900 border border-teal-200 px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3 text-teal-700" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Medicines List Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  {meds.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No medicines prescribed yet. Click any preset chip above or use the form below to add.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="p-2.5 pl-3">Medicine & Strength</th>
                          <th className="p-2.5">Timing (M-A-N)</th>
                          <th className="p-2.5">Duration</th>
                          <th className="p-2.5">Instructions</th>
                          <th className="p-2.5 pr-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {meds.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-2.5 pl-3 font-bold text-slate-900">
                              <span className="text-teal-700 mr-1.5 font-mono">{idx + 1}.</span>
                              {m.name}
                            </td>
                            <td className="p-2.5">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-teal-100 font-mono text-teal-900 font-bold text-[11px]">
                                {m.frequency}
                              </span>
                            </td>
                            <td className="p-2.5 font-semibold text-slate-700">{m.duration}</td>
                            <td className="p-2.5 text-slate-600 text-[11px]">{m.timing}</td>
                            <td className="p-2.5 pr-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMed(m.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove medicine"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Custom Medicine Adder Form */}
                <form onSubmit={handleAddCustomMed} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Tab. Azithromycin)"
                      value={customMedName}
                      onChange={(e) => setCustomMedName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dose (500mg)"
                      value={customMedDosage}
                      onChange={(e) => setCustomMedDosage(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={customMedFreq}
                      onChange={(e) => setCustomMedFreq(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                    >
                      <option value="1-0-1">1-0-1 (BD)</option>
                      <option value="1-0-0">1-0-0 (OD Morn)</option>
                      <option value="0-0-1">0-0-1 (OD Night)</option>
                      <option value="1-1-1">1-1-1 (TDS)</option>
                      <option value="SOS">SOS (As needed)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={customMedDuration}
                      onChange={(e) => setCustomMedDuration(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    >
                      <option value="3 Days">3 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="7 Days">7 Days</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold h-full min-h-[34px]"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Rx
                    </Button>
                  </div>
                </form>
              </div>

              {/* ================================================== */}
              {/* STEP 4: DIAGNOSTIC TESTS & CLINICAL ADVICE */}
              {/* ================================================== */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">4</span>
                    <span>Diagnostic Lab Tests & Investigation:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Select tests to order:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {LAB_TEST_PRESETS.map((test, i) => {
                    const isSel = selectedTests.includes(test);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleTest(test)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-teal-100 text-teal-900 border-teal-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSel ? '✓ ' : '+ '}
                        {test}
                      </button>
                    );
                  })}
                </div>

                {/* Doctor Clinical Advice & Diet */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Dietary & Lifestyle Advice:
                    </label>
                    <span className="text-[11px] text-slate-400">Quick suggestions:</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ADVICE_PRESETS.map((adv, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!adviceText.includes(adv.slice(0, 15))) {
                            setAdviceText(`${adviceText} ${adv}`);
                          }
                        }}
                        className="text-[10px] font-semibold rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 border border-slate-200 px-2 py-0.5 cursor-pointer"
                      >
                        + {adv.slice(0, 30)}...
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={adviceText}
                    onChange={(e) => setAdviceText(e.target.value)}
                    placeholder="Diet, sleep, exercise, and precautions..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* ================================================== */}
              {/* STEP 5: PRESCRIBE ASHA HOME VISIT (STREAMLINED) */}
              {/* ================================================== */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Prescribe Village ASHA Worker Follow-up Visit
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Frontline home monitoring for vitals & medication compliance.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prescribeAshaVisit}
                      onChange={(e) => setPrescribeAshaVisit(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
                  </label>
                </div>

                {prescribeAshaVisit && (
                  <div className="space-y-3 pt-1 border-t border-teal-100 text-xs">
                    {/* Interval */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-slate-700">
                        Schedule Visit In:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3, 5, 7, 14].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setAshaPrescribedDays(days)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              ashaPrescribedDays === days
                                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                            }`}
                          >
                            In {days} {days === 1 ? 'Day' : 'Days'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prescribed Checks */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1.5">
                        Checks to Perform at Citizen's Home:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Blood Pressure',
                          'Pulse Rate',
                          'Blood Sugar',
                          'SpO2 Check',
                          'Medication Compliance',
                          'Diet Advice',
                        ].map((chk) => {
                          const isSel = ashaSelectedChecks.includes(chk);
                          return (
                            <button
                              key={chk}
                              type="button"
                              onClick={() => toggleAshaCheck(chk)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-teal-700 text-white border-teal-700 font-bold'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {isSel ? '✓ ' : '+ '}
                              {chk}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        Doctor Instructions for ASHA:
                      </span>
                      <input
                        type="text"
                        value={ashaInstructions}
                        onChange={(e) => setAshaInstructions(e.target.value)}
                        placeholder="e.g. Check resting BP, verify morning Aspirin 75mg adherence..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* PRIMARY ACTION BUTTONS */}
              {/* ================================================== */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                {isCompleted ? (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                      <div>
                        <strong className="text-sm font-black">Consultation Finished & Rx Issued!</strong>
                        <p className="text-xs text-emerald-800">
                          Prescription #{rxNumber} synced to ABHA Vault and Hospital Pharmacy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => setShowRxModal(true)}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold gap-1 min-h-[38px]"
                      >
                        <Printer className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Print Rx Slip</span>
                      </Button>

                      <Button
                        onClick={handleCallNextPatient}
                        variant="primary"
                        size="sm"
                        className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1 min-h-[38px] shadow-xs"
                      >
                        <span>Call Next Patient</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleCompleteConsultation}
                      variant="primary"
                      size="lg"
                      className="w-full sm:flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-black min-h-[46px] rounded-xl shadow-xs gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Complete Consultation & Issue Prescription</span>
                    </Button>

                    <Link to="/doctor/referrals" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-xs font-bold border-slate-300 hover:bg-slate-50 min-h-[46px] rounded-xl gap-1.5"
                      >
                        <GitBranch className="h-4 w-4 text-slate-600" />
                        <span>Refer to Hospital</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================================================== */}
      {/* OFFICIAL PRINTABLE PRESCRIPTION SLIP MODAL */}
      {/* ================================================== */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-teal-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Prescription Slip Preview • {rxNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Formal Rx Document Layout (Printable) */}
            <div className="rounded-xl border border-slate-300 p-5 space-y-4 bg-white text-slate-900 font-sans">
              {/* Rx Header */}
              <div className="text-center border-b border-slate-200 pb-3 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800">
                  Government of Gujarat • Health & Family Welfare
                </p>
                <h2 className="text-base font-black text-slate-900">
                  GANDHINAGAR DISTRICT CIVIL HOSPITAL
                </h2>
                <p className="text-[11px] text-slate-500">
                  Outpatient Department • Sector 12 Base Hospital • Emergency Ph: 108
                </p>
              </div>

              {/* Doctor & Patient Two-Column Summary */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-3">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Dr. Arvind Patel</p>
                  <p className="text-[11px] text-slate-500">MD (Internal Medicine & Cardiology)</p>
                  <p className="text-[11px] text-slate-500">GMC Reg: G-41920 • Room 4</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-black text-teal-800">Token #{patient.tokenNumber} • {rxNumber}</p>
                  <p className="font-semibold text-slate-900">{patient.name} ({patient.age}Y / {patient.gender})</p>
                  <p className="text-[11px] text-slate-500">ABHA ID: {patient.abhaId}</p>
                  <p className="text-[11px] text-slate-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-teal-50/60 p-2.5 rounded-lg border border-teal-200 text-xs">
                <span className="font-bold text-teal-950">Diagnosis: </span>
                <span className="font-black text-teal-900">{diagnosis}</span>
              </div>

              {/* Rx Table */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 block flex items-center gap-1">
                  <Pill className="h-3.5 w-3.5 text-teal-700" />
                  <span>Rx (Prescribed Medications):</span>
                </span>
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="border border-slate-200 p-2">#</th>
                      <th className="border border-slate-200 p-2">Medicine</th>
                      <th className="border border-slate-200 p-2">Frequency</th>
                      <th className="border border-slate-200 p-2">Duration</th>
                      <th className="border border-slate-200 p-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meds.map((m, idx) => (
                      <tr key={m.id} className="border-b border-slate-200">
                        <td className="border border-slate-200 p-2 font-mono">{idx + 1}</td>
                        <td className="border border-slate-200 p-2 font-bold">{m.name}</td>
                        <td className="border border-slate-200 p-2 font-mono font-bold">{m.frequency}</td>
                        <td className="border border-slate-200 p-2">{m.duration}</td>
                        <td className="border border-slate-200 p-2 text-[11px] text-slate-600">{m.timing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Investigations & Advice */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-200 pt-3">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Investigations Ordered:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                    {selectedTests.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block mb-1">Advice & Follow-up:</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{adviceText}</p>
                  {prescribeAshaVisit && (
                    <p className="text-[11px] font-bold text-teal-800 mt-1">
                      • ASHA Home Visit scheduled in {ashaPrescribedDays} days ({calculateTargetDate('2026-03-11', ashaPrescribedDays)}).
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Sign & QR Code */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded border border-slate-300">
                    <QrCode className="h-8 w-8 text-slate-800" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 block">ABHA PHR Verified QR</span>
                    <span className="text-[9px] text-slate-400">Scan via Sanjeevani App</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="h-8 w-24 border-b border-dashed border-slate-400 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs">Dr. Arvind Patel</span>
                  <span className="text-[10px] text-slate-400 block">Civil Hospital Gandhinagar</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                onClick={() => setShowRxModal(false)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                variant="primary"
                size="sm"
                className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Prescription</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};