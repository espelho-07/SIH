import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  INITIAL_HEALTH_RECORD,
  INITIAL_LIVE_QUEUE,
} from '@/mock/mockData';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { referralApi } from '@/api/referralApi';
import { queueApi } from '@/api/queueApi';
import { Referral } from '@/types/referral';
import { Token } from '@/types/queue';
import {
  Stethoscope,
  CheckCircle2,
  Plus,
  Trash2,
  Heart,
  Droplets,
  Activity,
  ShieldAlert,
  Printer,
  ArrowRight,
  Pill,
  X,
  QrCode,
  Phone,
  Users,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Check,
  AlertTriangle,
  RotateCcw,
  History,
} from 'lucide-react';
import { createDoctorPrescribedVisit } from '@/lib/ashaVisitStore';

interface MedicineItem {
  id: string;
  name: string;
  frequency: string;
  duration: string;
  timing: string;
}

// 1-Click Fast OPD Presets (Doctor taps 1 button = complete prescription ready)
const QUICK_CLINICAL_PRESETS = [
  {
    id: 'fever',
    label: '🤒 Viral Fever / Cold',
    diagnosis: 'Acute Viral Upper Respiratory Infection (URTI)',
    meds: [
      { name: 'Tab. Paracetamol 650mg', frequency: '1-0-1', duration: '3 Days', timing: 'After Food (Morning & Night)' },
      { name: 'Tab. Cetirizine 10mg', frequency: '0-0-1', duration: '5 Days', timing: 'At Bedtime' },
    ],
    tests: ['Complete Blood Count (CBC)'],
    advice: 'Drink warm boiled water. Take adequate rest. Return if high fever persists after 3 days.',
  },
  {
    id: 'acidity',
    label: '🔥 Acidity / Gas (GERD)',
    diagnosis: 'Acute Acid Peptic Disease (GERD / Gastritis)',
    meds: [
      { name: 'Tab. Pantoprazole 40mg', frequency: '1-0-0', duration: '7 Days', timing: 'Before Breakfast' },
    ],
    tests: [],
    advice: 'Avoid spicy, oily, and outside deep-fried foods. Do not lie down immediately after dinner.',
  },
  {
    id: 'bp',
    label: '🫀 High BP Check',
    diagnosis: 'Essential Stage 1 Hypertension',
    meds: [
      { name: 'Tab. Amlodipine 5mg', frequency: '1-0-0', duration: '30 Days', timing: 'Morning After Food' },
    ],
    tests: ['12-Lead ECG', 'Lipid Profile Full'],
    advice: 'Strict low salt diet (< 5g/day). 30 mins morning walking daily. Avoid pickles and salty snacks.',
  },
  {
    id: 'diabetes',
    label: '🩸 Sugar / Diabetes',
    diagnosis: 'Type 2 Diabetes Mellitus - Routine Review',
    meds: [
      { name: 'Tab. Metformin 500mg SR', frequency: '1-0-1', duration: '30 Days', timing: 'With Meals' },
    ],
    tests: ['Blood Sugar (FBS)', 'HbA1c (3-Month Sugar)'],
    advice: 'Strict diabetic diet. Avoid sugar, sweets, potatoes, white bread. Small frequent meals.',
  },
  {
    id: 'joint',
    label: '🦴 Knee / Body Pain',
    diagnosis: 'Bilateral Knee Joint Pain / Osteoarthritis',
    meds: [
      { name: 'Tab. Paracetamol 650mg', frequency: '1-0-1', duration: '5 Days', timing: 'After Food (SOS on pain)' },
      { name: 'Tab. Calcium + Vitamin D3', frequency: '0-1-0', duration: '30 Days', timing: 'After Lunch' },
    ],
    tests: ['X-Ray Knee (Standing)'],
    advice: 'Avoid sitting on the floor or squatting. Gentle quadriceps knee exercises daily.',
  },
  {
    id: 'vomit',
    label: '🤢 Vomiting / ORS',
    diagnosis: 'Acute Gastroenteritis with Mild Dehydration',
    meds: [
      { name: 'Electrolyte ORS Sachet', frequency: 'SOS', duration: '2 Days', timing: 'Mix in 1L clean water' },
      { name: 'Tab. Pantoprazole 40mg', frequency: '1-0-0', duration: '5 Days', timing: 'Before Breakfast' },
    ],
    tests: [],
    advice: 'Drink ORS fluid frequently. Eat light khichdi/curd rice. Avoid outside food.',
  },
];

// 1-Tap Quick Medicine Chips
const QUICK_MEDS_LIST = [
  { name: 'Tab. Paracetamol 650mg', frequency: '1-0-1', duration: '3 Days', timing: 'After Food' },
  { name: 'Tab. Pantoprazole 40mg', frequency: '1-0-0', duration: '7 Days', timing: 'Before Breakfast' },
  { name: 'Tab. Cetirizine 10mg', frequency: '0-0-1', duration: '5 Days', timing: 'At Bedtime' },
  { name: 'Tab. Azithromycin 500mg', frequency: '1-0-0', duration: '3 Days', timing: '1 Hr Before Food' },
  { name: 'Tab. Amlodipine 5mg', frequency: '1-0-0', duration: '30 Days', timing: 'Morning' },
  { name: 'Tab. Metformin 500mg SR', frequency: '1-0-1', duration: '30 Days', timing: 'With Meals' },
  { name: 'Electrolyte ORS Sachet', frequency: 'SOS', duration: '2 Days', timing: 'In 1L Water' },
];

export const PatientClinicalWorkspace: React.FC = () => {
  const { id: routePatientId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const referralIdFromUrl = searchParams.get('referralId');

  // Queue Tokens
  const [queueTokens, setQueueTokens] = useState<Token[]>(INITIAL_LIVE_QUEUE.tokens);

  useEffect(() => {
    queueApi.getLiveQueue('fac_civil_01').then((res) => {
      if (res.data?.tokens && res.data.tokens.length > 0) {
        setQueueTokens(res.data.tokens);
      }
    }).catch(console.warn);
  }, []);
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

  const patient = {
    ...INITIAL_HEALTH_RECORD,
    patientId: activeToken.patientId,
    name: activeToken.patientName,
    age: activeToken.patientAge,
    gender: activeToken.patientGender === 'M' ? 'Male' : 'Female',
    phone: activeToken.patientPhone,
    tokenNumber: activeToken.tokenNumber,
  };

  // Referral info
  const [activeReferral, setActiveReferral] = useState<Referral | null>(null);
  useEffect(() => {
    referralApi.getAll().then((res) => {
      if (res.data) {
        const found = referralIdFromUrl
          ? res.data.find((r) => r.id === referralIdFromUrl)
          : res.data.find(
              (r) =>
                (r.patientId === patient.patientId ||
                  r.patientName.toLowerCase() === patient.name.toLowerCase()) &&
                ['ACCEPTED', 'APPOINTMENT_CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(r.status)
            );
        if (found) setActiveReferral(found);
      }
    }).catch(() => {});
  }, [patient.patientId, patient.name, referralIdFromUrl]);

  // Consultation Clinical States
  const [diagnosis, setDiagnosis] = useState('Angina Pectoris - Rule out CAD');
  const [meds, setMeds] = useState<MedicineItem[]>([
    {
      id: 'med_01',
      name: 'Tab. Sorbitrate 5mg (Sublingual)',
      frequency: 'SOS',
      duration: '15 Days',
      timing: 'Under tongue on chest pain',
    },
    {
      id: 'med_02',
      name: 'Tab. Aspirin 75mg Gastro-resistant',
      frequency: '1-0-0',
      duration: '30 Days',
      timing: 'Morning after breakfast',
    },
    {
      id: 'med_03',
      name: 'Tab. Pantoprazole 40mg',
      frequency: '1-0-0',
      duration: '10 Days',
      timing: 'Before breakfast',
    },
  ]);

  const [selectedTests, setSelectedTests] = useState<string[]>(['12-Lead ECG', 'Lipid Profile Full']);
  const [adviceText, setAdviceText] = useState('Avoid heavy lifting. Low salt and low oil diet. Drink warm water.');
  const [followUpDays, setFollowUpDays] = useState<number>(7);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxNumber] = useState(`RX-2026-0311-${Math.floor(1000 + Math.random() * 9000)}`);

  // Quick medicine manual adder input
  const [quickMedInput, setQuickMedInput] = useState('');

  // ==================================================
  // VOICE SPEECH RECOGNITION FEATURE
  // ==================================================
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Works for Indian English and basic Hindi drug names

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Listening... Speak diagnosis or medicines (e.g. "Paracetamol 650 for 3 days and blood test")');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVoiceFeedback(`Heard: "${transcript}"`);
          parseSpokenVoice(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice recognition error:', e);
        setIsListening(false);
        setVoiceFeedback('Mic stopped. Click mic to speak again.');
        setTimeout(() => setVoiceFeedback(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceFeedback(null), 5000);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is supported in Google Chrome, Microsoft Edge, and modern browsers. Please tap the quick buttons below.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition start failed:', err);
      }
    }
  };

  // Smart Voice Parser: converts spoken clinical text into medications & tests
  const parseSpokenVoice = (spokenText: string) => {
    const lower = spokenText.toLowerCase();
    const newlyAddedMeds: MedicineItem[] = [];

    // Check Paracetamol / Fever
    if (lower.includes('paracetamol') || lower.includes('dolo') || lower.includes('crocin') || lower.includes('fever') || lower.includes('bukhar') || lower.includes('tav')) {
      if (!meds.some(m => m.name.toLowerCase().includes('paracetamol'))) {
        newlyAddedMeds.push({
          id: `med_${Date.now()}_pcm`,
          name: 'Tab. Paracetamol 650mg',
          frequency: '1-0-1',
          duration: '3 Days',
          timing: 'After Food (Morning & Night)',
        });
      }
      if (!diagnosis) setDiagnosis('Acute Viral Fever & Cold');
    }

    // Check Pantoprazole / Gas
    if (lower.includes('pantoprazole') || lower.includes('pantocid') || lower.includes('acidity') || lower.includes('gas') || lower.includes('pan 40')) {
      if (!meds.some(m => m.name.toLowerCase().includes('pantoprazole'))) {
        newlyAddedMeds.push({
          id: `med_${Date.now()}_panto`,
          name: 'Tab. Pantoprazole 40mg',
          frequency: '1-0-0',
          duration: '7 Days',
          timing: 'Before Breakfast',
        });
      }
    }

    // Check Cetirizine / Cold
    if (lower.includes('cetirizine') || lower.includes('cold') || lower.includes('cough') || lower.includes('sardi') || lower.includes('khansi')) {
      if (!meds.some(m => m.name.toLowerCase().includes('cetirizine'))) {
        newlyAddedMeds.push({
          id: `med_${Date.now()}_cet`,
          name: 'Tab. Cetirizine 10mg',
          frequency: '0-0-1',
          duration: '5 Days',
          timing: 'At Bedtime',
        });
      }
    }

    // Check Azithromycin / Antibiotic
    if (lower.includes('azithromycin') || lower.includes('azithro') || lower.includes('antibiotic')) {
      if (!meds.some(m => m.name.toLowerCase().includes('azithromycin'))) {
        newlyAddedMeds.push({
          id: `med_${Date.now()}_az`,
          name: 'Tab. Azithromycin 500mg',
          frequency: '1-0-0',
          duration: '3 Days',
          timing: '1 Hr Before Food',
        });
      }
    }

    // Check BP / Amlodipine
    if (lower.includes('amlodipine') || lower.includes('bp') || lower.includes('pressure') || lower.includes('hypertension')) {
      if (!meds.some(m => m.name.toLowerCase().includes('amlodipine'))) {
        newlyAddedMeds.push({
          id: `med_${Date.now()}_amlo`,
          name: 'Tab. Amlodipine 5mg',
          frequency: '1-0-0',
          duration: '30 Days',
          timing: 'Morning After Food',
        });
      }
      setDiagnosis('Essential Stage 1 Hypertension');
    }

    // Check Sugar / Metformin
    if (lower.includes('metformin') || lower.includes('sugar') || lower.includes('diabetes')) {
      if (!meds.some(m => m.name.toLowerCase().includes('metformin'))) {
        newlyAddedMeds.push({
          id: `med_${Date.now()}_met`,
          name: 'Tab. Metformin 500mg SR',
          frequency: '1-0-1',
          duration: '30 Days',
          timing: 'With Meals',
        });
      }
      setDiagnosis('Type 2 Diabetes Mellitus');
    }

    // Check Tests
    if (lower.includes('ecg') || lower.includes('heart')) {
      if (!selectedTests.includes('12-Lead ECG')) setSelectedTests(prev => [...prev, '12-Lead ECG']);
    }
    if (lower.includes('blood test') || lower.includes('cbc') || lower.includes('blood')) {
      if (!selectedTests.includes('Complete Blood Count (CBC)')) setSelectedTests(prev => [...prev, 'Complete Blood Count (CBC)']);
    }
    if (lower.includes('x-ray') || lower.includes('xray')) {
      if (!selectedTests.includes('Chest X-Ray (PA View)')) setSelectedTests(prev => [...prev, 'Chest X-Ray (PA View)']);
    }

    if (newlyAddedMeds.length > 0) {
      setMeds(prev => [...prev, ...newlyAddedMeds]);
      setVoiceFeedback(`✓ Voice added: ${newlyAddedMeds.map(m => m.name).join(', ')}`);
    }
  };

  // Apply 1-Tap Preset Bundle
  const handleApplyPreset = (preset: typeof QUICK_CLINICAL_PRESETS[0]) => {
    setDiagnosis(preset.diagnosis);
    const newItems: MedicineItem[] = preset.meds.map((m, idx) => ({
      id: `med_${preset.id}_${idx}_${Date.now()}`,
      ...m,
    }));
    setMeds(newItems);
    setSelectedTests(preset.tests);
    setAdviceText(preset.advice);
    setVoiceFeedback(`✓ Loaded 1-Tap Preset: ${preset.label}`);
    setTimeout(() => setVoiceFeedback(null), 3500);
  };

  // Add 1-Tap Single Medicine Chip
  const handleAddSingleMed = (med: typeof QUICK_MEDS_LIST[0]) => {
    if (meds.some(m => m.name.toLowerCase() === med.name.toLowerCase())) return;
    setMeds([
      ...meds,
      {
        id: `med_${Date.now()}`,
        ...med,
      },
    ]);
  };

  // Quick manual add
  const handleAddCustomMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMedInput.trim()) return;
    setMeds([
      ...meds,
      {
        id: `med_${Date.now()}`,
        name: quickMedInput.trim(),
        frequency: '1-0-1',
        duration: '5 Days',
        timing: 'After Food',
      },
    ]);
    setQuickMedInput('');
  };

  const handleRemoveMed = (id: string) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const toggleTest = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  // Allergy Check
  const hasPenicillinAllergy = patient.allergies?.some(a => a.toLowerCase().includes('penicillin'));
  const allergyConflictMeds = meds.filter(m => {
    const l = m.name.toLowerCase();
    return hasPenicillinAllergy && (l.includes('penicillin') || l.includes('amoxicillin') || l.includes('ampicillin'));
  });

  // Finish consultation
  const handleComplete = () => {
    if (activeReferral) {
      referralApi.recordOutcome(
        activeReferral.id,
        `Diagnosis: ${diagnosis}. Rx: ${meds.map(m => m.name).join(', ')}`,
        user?.name || 'Dr. Arvind Patel',
        user?.specialty || 'MD Internal Medicine'
      ).catch(() => {});
    }
    setIsCompleted(true);
    setShowRxModal(true);
  };

  // Queue Next
  const currentIndex = queueTokens.findIndex(t => t.patientId === activeToken.patientId);
  const nextToken = queueTokens[currentIndex + 1] || queueTokens[0];

  const handleNext = () => {
    setIsCompleted(false);
    setShowRxModal(false);
    if (nextToken && nextToken.patientId !== activeToken.patientId) {
      navigate(`/doctor/patients/${nextToken.patientId}`);
    }
  };

  const getFollowUpDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + followUpDays);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3.5 pb-16 font-sans">
      {/* ================================================== */}
      {/* 1. TOP ULTRA-COMPACT PATIENT BAR & LIVE QUEUE */}
      {/* ================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Patient Info at a Single Glance */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white font-mono font-black text-sm shadow-xs">
              {patient.tokenNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{patient.name}</h2>
                <span className="text-xs text-slate-600 font-bold">
                  {patient.age}Y • {patient.gender}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  ABHA: {patient.abhaId}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3 text-slate-400" />
                  +91 {patient.phone}
                </span>
                <span>• Blood: <strong>{patient.bloodGroup}</strong></span>
              </p>
            </div>
          </div>

          {/* Key Vitals (Compact inline pills) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <Heart className="h-3.5 w-3.5 text-teal-600" />
              <span className="font-bold text-slate-700">BP: 128/82</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-bold text-slate-700">Pulse: 74</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-xs">
              <Droplets className="h-3.5 w-3.5 text-amber-700" />
              <span className="font-bold text-amber-900">Sugar: 148</span>
            </div>
            {hasPenicillinAllergy && (
              <span className="flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 px-2 py-1 rounded-xl text-xs font-bold">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                Penicillin Allergy!
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/doctor/patients/${patient.patientId || 'usr_pat_01'}/history`)}
              className="text-xs bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100 font-bold gap-1.5 h-7 px-2.5 rounded-xl cursor-pointer"
            >
              <History className="h-3.5 w-3.5 text-purple-700" />
              <span>Old & Recent Records</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. HERO: VOICE PRESCRIPTION & 1-TAP COMMON PRESETS */}
      {/* ================================================== */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-200" />
              <h3 className="text-sm sm:text-base font-black">
                Fast Doctor Voice & 1-Tap Prescription
              </h3>
            </div>
            <p className="text-xs text-teal-100">
              Speak medicines or tap any condition below — prescription is created in 5 seconds!
            </p>
          </div>

          {/* THE HERO VOICE MIC BUTTON */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-300'
                : 'bg-white text-teal-800 hover:bg-teal-50 hover:scale-102 active:scale-98'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 animate-spin" />
                <span>Listening... (Click to Stop)</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 text-teal-600" />
                <span>🎙️ Speak Prescription</span>
              </>
            )}
          </button>
        </div>

        {/* Live Voice Feedback Bar */}
        {voiceFeedback && (
          <div className="bg-black/25 backdrop-blur-xs px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-in fade-in duration-200">
            <Volume2 className="h-4 w-4 text-amber-300 shrink-0" />
            <span className="text-white">{voiceFeedback}</span>
          </div>
        )}

        {/* 1-Tap Condition Buttons (Instant complete prescription) */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-teal-100 block">
            Or tap 1-click popular diagnosis & treatment:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {QUICK_CLINICAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="bg-white/10 hover:bg-white/25 active:scale-95 border border-white/20 rounded-xl p-2 text-left transition-all cursor-pointer backdrop-blur-xs text-white"
              >
                <p className="text-xs font-black truncate">{preset.label}</p>
                <span className="text-[10px] text-teal-100 opacity-90 block mt-0.5 truncate">
                  {preset.meds.length} Meds + Advice
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Allergy Conflict Warning */}
      {allergyConflictMeds.length > 0 && (
        <div className="rounded-xl border-2 border-rose-400 bg-rose-50 p-3 flex items-center justify-between gap-3 text-rose-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-xs font-bold">
              Warning: <strong>{allergyConflictMeds.map(m => m.name).join(', ')}</strong> conflicts with patient's Penicillin allergy!
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => allergyConflictMeds.forEach(m => handleRemoveMed(m.id))}
            className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shrink-0 cursor-pointer h-7 px-2"
          >
            Remove Drug
          </Button>
        </div>
      )}

      {/* ================================================== */}
      {/* 3. ULTRA-SIMPLE PRESCRIPTION DESK (EVERYTHING VISIBLE) */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
        {/* Diagnosis Field */}
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-teal-700" />
            <span>Diagnosis:</span>
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Diagnosis (e.g. Viral Fever, Hypertension, Acidity...)"
            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Medicines List (Clean Pills / Rows with 1-Tap Delete) */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-teal-700" />
              <span>Medicines Prescribed ({meds.length}):</span>
            </label>
            <span className="text-[11px] text-slate-400">1-Tap to add extra:</span>
          </div>

          {/* 1-Tap Medicine Chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_MEDS_LIST.map((m, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSingleMed(m)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50/70 hover:bg-teal-100 text-teal-900 border border-teal-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3 text-teal-600" />
                <span>{m.name.split(' ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Simple Medicine Cards */}
          <div className="space-y-1.5 pt-1">
            {meds.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                No medicines added. Click mic above or tap any quick condition.
              </p>
            ) : (
              meds.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black text-slate-900 truncate">{m.name}</span>
                    <span className="text-[11px] bg-teal-100/80 text-teal-900 font-mono font-bold px-2 py-0.5 rounded shrink-0">
                      {m.frequency}
                    </span>
                    <span className="text-xs text-slate-600 font-medium hidden sm:inline shrink-0">
                      • {m.duration} ({m.timing})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMed(m.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick 1-Line Custom Medicine Adder */}
          <form onSubmit={handleAddCustomMedicine} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Or type medicine name & press Add..."
              value={quickMedInput}
              onChange={(e) => setQuickMedInput(e.target.value)}
              className="flex-1 text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3 rounded-xl cursor-pointer"
            >
              + Add
            </Button>
          </form>
        </div>

        {/* Tests & Care Advice (Compact 2-Column Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
          {/* Lab Tests */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              Tests Needed ({selectedTests.length}):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                '12-Lead ECG',
                'Blood Sugar (FBS)',
                'Complete Blood Count (CBC)',
                'Lipid Profile Full',
                'Chest X-Ray (PA View)',
              ].map((test) => {
                const isSel = selectedTests.includes(test);
                return (
                  <button
                    key={test}
                    type="button"
                    onClick={() => toggleTest(test)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                      isSel
                        ? 'bg-teal-700 text-white border-teal-700 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSel ? '✓ ' : '+ '}
                    {test}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Care Advice & Follow-Up */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                Care Advice:
              </label>
              <div className="flex items-center gap-1 text-xs font-bold text-teal-800">
                <span>Next Visit:</span>
                <select
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  className="bg-slate-100 p-0.5 rounded border border-slate-200 font-bold"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                </select>
              </div>
            </div>
            <input
              type="text"
              value={adviceText}
              onChange={(e) => setAdviceText(e.target.value)}
              placeholder="e.g. Drink warm water, low salt diet, take rest..."
              className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON */}
        <div className="border-t border-slate-100 pt-3">
          {isCompleted ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 border border-emerald-300 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <span className="text-xs font-black">Prescription #{rxNumber} Issued!</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowRxModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white text-emerald-900 border-emerald-300 font-bold gap-1 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Print Slip</span>
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="sm"
                  className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1 cursor-pointer"
                >
                  <span>Next Patient ({nextToken.tokenNumber}) ➔</span>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleComplete}
              variant="primary"
              size="lg"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-black h-12 rounded-xl shadow-xs gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Save & Issue Prescription Slip (1-Click)</span>
            </Button>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. CLEAN OFFICIAL PRINTABLE PRESCRIPTION SLIP */}
      {/* ================================================== */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-teal-700" />
                <h3 className="text-xs font-black text-slate-900">
                  Prescription Slip • {rxNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Rx Sheet */}
            <div className="rounded-xl border border-slate-300 p-4 space-y-3.5 bg-white text-slate-900">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-2.5 space-y-0.5">
                <p className="text-[10px] font-black uppercase text-teal-800">
                  Government of Gujarat • Health & Family Welfare
                </p>
                <h2 className="text-sm font-black text-slate-900">
                  GANDHINAGAR CIVIL HOSPITAL • OPD
                </h2>
              </div>

              {/* Doctor & Patient */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-2.5">
                <div>
                  <p className="font-black text-slate-900">Dr. Arvind Patel</p>
                  <p className="text-[11px] text-slate-500">MD Cardiology • Room 4</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-teal-800">Token #{patient.tokenNumber}</p>
                  <p className="font-bold text-slate-900">{patient.name} ({patient.age}Y/{patient.gender})</p>
                  <p className="text-[11px] text-slate-500">ABHA: {patient.abhaId}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-teal-50 p-2 rounded-lg border border-teal-200 text-xs">
                <span className="font-bold text-teal-950">Diagnosis: </span>
                <span className="font-black text-teal-900">{diagnosis}</span>
              </div>

              {/* Medicines */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-900 block">Rx Prescriptions:</span>
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-1.5 border border-slate-200">#</th>
                      <th className="p-1.5 border border-slate-200">Medicine</th>
                      <th className="p-1.5 border border-slate-200">Timing</th>
                      <th className="p-1.5 border border-slate-200">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meds.map((m, idx) => (
                      <tr key={m.id}>
                        <td className="p-1.5 border border-slate-200 font-mono">{idx + 1}</td>
                        <td className="p-1.5 border border-slate-200 font-bold">{m.name}</td>
                        <td className="p-1.5 border border-slate-200 font-mono font-bold">{m.frequency}</td>
                        <td className="p-1.5 border border-slate-200">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advice & Next Visit */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-2">
                <div>
                  <span className="font-bold block">Advice:</span>
                  <p className="text-[11px] text-slate-600">{adviceText}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold block">Next Visit:</span>
                  <p className="text-[11px] font-black text-teal-900">{getFollowUpDateString()} (Room 4)</p>
                </div>
              </div>

              {/* Footer QR & Signature */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <QrCode className="h-7 w-7 text-slate-800" />
                  <span className="text-[9px] text-slate-500">ABHA Verified QR</span>
                </div>
                <div className="text-right">
                  <div className="h-6 w-20 border-b border-dashed border-slate-400 ml-auto mb-0.5"></div>
                  <span className="font-bold text-[11px]">Dr. Arvind Patel</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                onClick={() => setShowRxModal(false)}
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                variant="primary"
                size="sm"
                className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Slip</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientClinicalWorkspace;