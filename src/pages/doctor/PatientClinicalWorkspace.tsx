import React, { useState, useEffect } from 'react';
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
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { referralApi } from '@/api/referralApi';
import { Referral } from '@/types/referral';
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
  Video,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Download,
  Info,
  ChevronRight,
  Zap,
  FlaskConical,
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
  'Angina Pectoris - Rule out CAD / Ischemia',
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

// Categorized Diagnostic Tests for Copilot
interface TestCategory {
  category: string;
  iconName: string;
  tests: string[];
}

const CATEGORIZED_TESTS: TestCategory[] = [
  {
    category: 'Biochemistry & Sugar',
    iconName: 'Droplets',
    tests: [
      'Fasting Blood Sugar (FBS)',
      'Postprandial Blood Sugar (PPBS)',
      'HbA1c (Glycated Hb)',
      'Lipid Profile Full',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT / Creatinine)',
      'Serum Electrolytes (Na+, K+)',
      'Serum Uric Acid',
    ],
  },
  {
    category: 'Hematology & Blood',
    iconName: 'Activity',
    tests: [
      'Complete Blood Count (CBC)',
      'ESR (Sedimentation Rate)',
      'Blood Group & Rh Typing',
      'Peripheral Smear for MP',
      'Serum Ferritin',
    ],
  },
  {
    category: 'Cardiology & Vitals',
    iconName: 'Heart',
    tests: [
      '12-Lead ECG',
      '2D Echocardiography',
      'Troponin-I (Cardiac Biomarker)',
      'Serum CPK-MB',
    ],
  },
  {
    category: 'Radiology & Imaging',
    iconName: 'Sparkles',
    tests: [
      'Chest X-Ray (PA View)',
      'Ultrasound Abdomen (USG)',
      'X-Ray Both Knees (Standing AP/Lat)',
      'CT Head / Brain Plain',
    ],
  },
  {
    category: 'Urine & Renal',
    iconName: 'FlaskConical',
    tests: [
      'Urine Routine & Micro',
      'Urine Microalbumin',
      'Urine Culture & Sensitivity',
    ],
  },
];

// 1-Click Fast Disease & Prescription Bundles
interface DiseaseBundle {
  id: string;
  name: string;
  badge: string;
  complaint: string;
  diagnosis: string;
  meds: Omit<MedicineItem, 'id'>[];
  tests: string[];
  advice: string;
  followUpDays: number;
  followUpMode: 'OPD' | 'TELECONSULT' | 'ASHA';
  followUpPurpose: string;
}

const FAST_DISEASE_BUNDLES: DiseaseBundle[] = [
  {
    id: 'bundle_angina',
    name: 'Angina / Chest Pain Workup',
    badge: 'Cardiac Triage',
    complaint: 'Retrosternal chest heaviness on exertion over 3 days, relieved with rest.',
    diagnosis: 'Angina Pectoris - Rule out CAD / Ischemia',
    meds: [
      {
        name: 'Tab. Sorbitrate 5mg (Sublingual)',
        dosage: '5 mg',
        frequency: 'SOS',
        duration: '15 Days',
        timing: 'Keep under tongue if chest pain occurs',
      },
      {
        name: 'Tab. Aspirin 75mg Gastro-resistant',
        dosage: '75 mg',
        frequency: '1-0-0',
        duration: '30 Days',
        timing: 'Morning after breakfast',
      },
      {
        name: 'Tab. Pantoprazole 40mg',
        dosage: '40 mg',
        frequency: '1-0-0',
        duration: '10 Days',
        timing: 'Before breakfast',
      },
      {
        name: 'Tab. Atorvastatin 20mg',
        dosage: '20 mg',
        frequency: '0-0-1',
        duration: '30 Days',
        timing: 'Night after dinner',
      },
    ],
    tests: ['12-Lead ECG', 'Lipid Profile Full', 'Troponin-I (Cardiac Biomarker)'],
    advice: 'Strictly avoid strenuous physical exertion. Low-salt, low-oil diet. Keep Sorbitrate in pocket at all times. Return immediately if pain radiates to left arm or jaw.',
    followUpDays: 3,
    followUpMode: 'OPD',
    followUpPurpose: 'Review ECG & Lipid Profile; evaluate exertion tolerance',
  },
  {
    id: 'bundle_htn',
    name: 'Stage 1 Hypertension Routine',
    badge: 'Cardiovascular',
    complaint: 'Occasional morning occipital headache and dizziness for 1 week.',
    diagnosis: 'Essential Stage 1 Hypertension',
    meds: [
      {
        name: 'Tab. Telmisartan 40mg',
        dosage: '40 mg',
        frequency: '1-0-0',
        duration: '30 Days',
        timing: 'Morning after breakfast',
      },
      {
        name: 'Tab. Amlodipine 5mg',
        dosage: '5 mg',
        frequency: '0-0-1',
        duration: '30 Days',
        timing: 'Night after food',
      },
    ],
    tests: ['Kidney Function Test (KFT / Creatinine)', 'Urine Routine & Micro', '12-Lead ECG', 'Lipid Profile Full'],
    advice: 'Strict low sodium diet (< 5g salt/day). Avoid pickles, papad, processed salty foods. 30 mins brisk walking daily. Record resting BP morning and evening.',
    followUpDays: 14,
    followUpMode: 'OPD',
    followUpPurpose: 'BP monitoring titration and renal function check',
  },
  {
    id: 'bundle_diabetes',
    name: 'Type 2 Diabetes Mellitus Review',
    badge: 'Endocrinology',
    complaint: 'Increased thirst, nocturia, and persistent generalized fatigue for 2 weeks.',
    diagnosis: 'Type 2 Diabetes Mellitus - Sub-optimally Controlled',
    meds: [
      {
        name: 'Tab. Metformin 500mg SR',
        dosage: '500 mg',
        frequency: '1-0-1',
        duration: '30 Days',
        timing: 'With / After meals',
      },
      {
        name: 'Tab. Glimepiride 1mg',
        dosage: '1 mg',
        frequency: '1-0-0',
        duration: '30 Days',
        timing: '15 mins before breakfast',
      },
      {
        name: 'Tab. Pantoprazole 40mg',
        dosage: '40 mg',
        frequency: '1-0-0',
        duration: '15 Days',
        timing: 'Before breakfast',
      },
    ],
    tests: ['Fasting Blood Sugar (FBS)', 'Postprandial Blood Sugar (PPBS)', 'HbA1c (Glycated Hb)', 'Kidney Function Test (KFT / Creatinine)'],
    advice: 'Strict diabetic diet. Avoid sweets, potatoes, white rice. Small frequent meals every 3-4 hours. Inspect feet daily for cuts or sores.',
    followUpDays: 14,
    followUpMode: 'TELECONSULT',
    followUpPurpose: 'Fasting & PPBS blood sugar review; HbA1c review',
  },
  {
    id: 'bundle_urti',
    name: 'Acute Viral URTI / Bronchitis',
    badge: 'Respiratory',
    complaint: 'Dry persistent cough, sore throat, mild fever, and nasal congestion for 3 days.',
    diagnosis: 'Acute Viral Upper Respiratory Infection (URTI)',
    meds: [
      {
        name: 'Tab. Paracetamol 650mg',
        dosage: '650 mg',
        frequency: '1-0-1',
        duration: '3 Days',
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
        name: 'Tab. Azithromycin 500mg',
        dosage: '500 mg',
        frequency: '1-0-0',
        duration: '3 Days',
        timing: '1 hr before meal',
      },
    ],
    tests: ['Complete Blood Count (CBC)'],
    advice: 'Warm saline gargles 3 times daily. Steam inhalation twice a day. Drink plenty of warm water and soups. Rest adequately.',
    followUpDays: 3,
    followUpMode: 'TELECONSULT',
    followUpPurpose: 'Symptom resolution and fever clearance check',
  },
  {
    id: 'bundle_gerd',
    name: 'Acute Acid Peptic Disease (GERD)',
    badge: 'Gastroenterology',
    complaint: 'Severe retrosternal and epigastric burning sensation, sour belching after meals.',
    diagnosis: 'Acute Acid Peptic Disease (GERD / Gastritis)',
    meds: [
      {
        name: 'Tab. Pantoprazole 40mg',
        dosage: '40 mg',
        frequency: '1-0-0',
        duration: '14 Days',
        timing: '30 mins before breakfast',
      },
      {
        name: 'Tab. Domperidone 10mg',
        dosage: '10 mg',
        frequency: '1-0-1',
        duration: '7 Days',
        timing: 'Before meals',
      },
    ],
    tests: ['Complete Blood Count (CBC)', 'Ultrasound Abdomen (USG)'],
    advice: 'Avoid spicy, deep-fried, acidic, and outside food. Avoid lying down immediately after meals. Elevate head of bed.',
    followUpDays: 7,
    followUpMode: 'OPD',
    followUpPurpose: 'Check relief from epigastric distress',
  },
  {
    id: 'bundle_oa',
    name: 'Bilateral Knee Osteoarthritis',
    badge: 'Orthopedics',
    complaint: 'Bilateral knee joint pain and morning stiffness worsening with climbing stairs.',
    diagnosis: 'Bilateral Knee Osteoarthritis (Grade 2)',
    meds: [
      {
        name: 'Tab. Paracetamol 650mg',
        dosage: '650 mg',
        frequency: '1-0-1',
        duration: '7 Days',
        timing: 'After Food (SOS)',
      },
      {
        name: 'Tab. Calcium Carbonate + Vitamin D3',
        dosage: '500mg + 250IU',
        frequency: '0-1-0',
        duration: '30 Days',
        timing: 'Afternoon with milk',
      },
    ],
    tests: ['X-Ray Both Knees (Standing AP/Lat)', 'Serum Uric Acid'],
    advice: 'Avoid sitting on the floor or squatting. Use western commode. Quadriceps exercises twice daily. Maintain healthy weight.',
    followUpDays: 30,
    followUpMode: 'OPD',
    followUpPurpose: 'Mobility assessment and joint pain relief check',
  },
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

  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const referralIdFromUrl = searchParams.get('referralId');
  const [activeReferral, setActiveReferral] = useState<Referral | null>(null);

  useEffect(() => {
    const fetchPatientReferral = async () => {
      try {
        const res = await referralApi.getAll();
        if (res.data) {
          let found: Referral | undefined;
          if (referralIdFromUrl) {
            found = res.data.find((r) => r.id === referralIdFromUrl);
          }
          if (!found) {
            found = res.data.find(
              (r) =>
                (r.patientId === patient.patientId ||
                  r.patientName.toLowerCase() === patient.name.toLowerCase() ||
                  r.patientPhone === patient.phone) &&
                ['ACCEPTED', 'APPOINTMENT_CONFIRMED', 'CHECKED_IN', 'PATIENT_ARRIVED', 'IN_CONSULTATION', 'CONSULTED', 'OUTCOME_RECORDED'].includes(r.status)
            );
          }
          if (found) {
            setActiveReferral(found);
          }
        }
      } catch (err) {
        console.error('Error finding patient referral:', err);
      }
    };
    fetchPatientReferral();
  }, [patient.patientId, patient.name, patient.phone, referralIdFromUrl]);

  // State: On-Demand Clinical Copilot Drawer (Hidden by default, shown ONLY after clicking button)
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);
  const [activeCopilotTab, setActiveCopilotTab] = useState<'BUNDLES' | 'REPORTS' | 'APPOINTMENT'>('BUNDLES');

  // Applied Bundle Flash Notification
  const [bundleAppliedMsg, setBundleAppliedMsg] = useState<string | null>(null);

  // Today's Clinical Consultation States
  const [chiefComplaint, setChiefComplaint] = useState(
    'Patient reports retrosternal chest heaviness on exertion over the past 3 days.'
  );
  const [diagnosis, setDiagnosis] = useState(
    'Angina Pectoris - Rule out CAD / Ischemia'
  );

  // Today's Prescribed Medicines (Default 3)
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

  // Fast Inline Custom Medicine Adder States
  const [customMedName, setCustomMedName] = useState('');
  const [customMedDosage, setCustomMedDosage] = useState('1 Tab');
  const [customMedFreq, setCustomMedFreq] = useState('1-0-1');
  const [customMedDuration, setCustomMedDuration] = useState('5 Days');
  const [customMedTiming, setCustomMedTiming] = useState('After Food');

  // Selected Diagnostic Reports / Lab Tests
  const [selectedTests, setSelectedTests] = useState<string[]>([
    '12-Lead ECG',
    'Lipid Profile Full',
    'Fasting Blood Sugar (FBS)',
  ]);

  // Scheduled Follow-Up Appointment States
  const [followUpDays, setFollowUpDays] = useState<number>(7);
  const [followUpMode, setFollowUpMode] = useState<'OPD' | 'TELECONSULT' | 'ASHA'>('OPD');
  const [followUpPurpose, setFollowUpPurpose] = useState<string>(
    'Review ECG & Lipid Profile; check resting blood pressure and exertional tolerance.'
  );

  // Clinical Advice
  const [adviceText, setAdviceText] = useState(
    'Avoid strenuous physical exertion for 1 week. Low-salt, low-oil diet. Keep Sorbitrate accessible at all times.'
  );

  // ASHA Community Follow-Up Order State
  const [prescribeAshaVisit, setPrescribeAshaVisit] = useState(false);
  const [ashaPrescribedDays, setAshaPrescribedDays] = useState(3);

  // Completion States
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxNumber] = useState(`RX-2026-0311-${Math.floor(1000 + Math.random() * 9000)}`);

  // Allergy Conflict Detection
  const hasPenicillinAllergy = patient.allergies?.some((a) =>
    a.toLowerCase().includes('penicillin')
  );
  const allergyConflictMeds = meds.filter((m) => {
    const lower = m.name.toLowerCase();
    return (
      (hasPenicillinAllergy &&
        (lower.includes('penicillin') ||
          lower.includes('amoxicillin') ||
          lower.includes('ampicillin') ||
          lower.includes('augmentin'))) ||
      lower.includes('sulfa')
    );
  });

  // Calculate Next Appointment Target Date
  const getFollowUpDateString = () => {
    const date = new Date();
    date.setDate(date.getDate() + followUpDays);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Quick medicine adder from presets
  const handleAddRxPreset = (item: Omit<MedicineItem, 'id'>) => {
    if (meds.some((m) => m.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 10)))) {
      return;
    }
    const newMed: MedicineItem = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...item,
    };
    setMeds([...meds, newMed]);
  };

  // Fast inline medicine adder
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
    setCustomMedDosage('1 Tab');
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

  // Apply 1-Click Fast OPD Disease Bundle from Copilot
  const handleApplyDiseaseBundle = (bundle: DiseaseBundle) => {
    setChiefComplaint(bundle.complaint);
    setDiagnosis(bundle.diagnosis);

    const newMeds: MedicineItem[] = bundle.meds.map((m, idx) => ({
      id: `med_bundle_${Date.now()}_${idx}`,
      ...m,
    }));
    setMeds(newMeds);
    setSelectedTests(bundle.tests);
    setAdviceText(bundle.advice);
    setFollowUpDays(bundle.followUpDays);
    setFollowUpMode(bundle.followUpMode);
    setFollowUpPurpose(bundle.followUpPurpose);

    setBundleAppliedMsg(`Loaded "${bundle.name}"! Diagnosis, medicines, and tests configured.`);
    setShowCopilotDrawer(false); // Auto close drawer after applying
    setTimeout(() => {
      setBundleAppliedMsg(null);
    }, 4000);
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
        doctorName: user?.name || 'Dr. Arvind Patel',
        doctorSpecialty: user?.specialty || 'MD (Internal Medicine & Cardiology)',
        doctorFacility: user?.facilityName || 'Gandhinagar Civil Hospital',
        doctorInstructions: adviceText,
        prescribedChecks: ['Blood Pressure', 'Medication Compliance'],
        priority: 'PRIORITY',
        purpose: `Doctor Prescribed: Follow-up for ${diagnosis || 'Angina Pectoris'}`,
      });
    }

    // Closed-Loop Referral: Transmit specialist consultation outcome back to referring hospital/doctor
    if (activeReferral) {
      const outcomeNotes = `Specialist Diagnosis: ${diagnosis || 'Evaluated'}. Management: ${adviceText || 'Standard medical management'}. Prescriptions issued: ${meds.map((m) => m.name).join(', ')}. Diagnostics: ${selectedTests.join(', ') || 'No immediate imaging ordered'}.`;
      referralApi.recordOutcome(
        activeReferral.id,
        outcomeNotes,
        user?.name || 'Dr. Arvind Patel',
        user?.specialty || 'MD (Internal Medicine & Cardiology)'
      ).catch((err) => console.error('Failed to record referral outcome:', err));
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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ================================================== */}
      {/* TOP BAR: QUEUE STRIP & QUICK ACTIONS */}
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
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isCurrent ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.tokenNumber}
                  </span>
                  <span className="max-w-[110px] truncate">{t.patientName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <Link to="/doctor/patients" className="shrink-0 ml-1">
            <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 text-slate-600 gap-1">
              <span>All Patients</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* ACTIVE PATIENT CARD: DEMOGRAPHICS + BUTTONS */}
      {/* ================================================== */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-white shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Top Row: Patient Info & DEDICATED ACTION BUTTONS */}
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
                  <span>
                    <strong>{patient.age}</strong> Yrs • <strong>{patient.gender}</strong>
                  </span>
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

            {/* BUTTONS: PATIENT HISTORY + ON-DEMAND COPILOT (SHOWS ONLY AFTER CLICKING) */}
            <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
              {/* === DEDICATED FULL-PAGE PATIENT HISTORY NAVIGATION === */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/doctor/patients/${patient.patientId || 'usr_pat_01'}/history`)}
                className="gap-2 text-xs bg-white text-teal-800 border-teal-300 hover:bg-teal-50 font-bold min-h-[38px] shadow-2xs cursor-pointer"
              >
                <FileText className="h-4 w-4 text-teal-700" />
                <span>Patient History</span>
                <span className="rounded-full bg-teal-100 text-teal-900 text-[10px] font-black px-1.5 py-0.5 border border-teal-300">
                  8 Records
                </span>
              </Button>

              {/* === THE REQUESTED COPILOT & PRESETS BUTTON (SHOWN ONLY ON CLICK) === */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCopilotDrawer(true)}
                className="gap-1.5 text-xs bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100 font-black min-h-[38px] shadow-2xs cursor-pointer"
              >
                <Zap className="h-4 w-4 text-teal-700" />
                <span>⚡ Clinical Copilot & Bundles</span>
              </Button>

              <Link to="/doctor/referrals">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 font-bold min-h-[38px] shadow-2xs"
                >
                  <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                  <span>Refer</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom Row: KEY VITALS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Heart className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BP (Resting)</p>
                <p className="text-sm font-black text-slate-900">
                  128 / 82 <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                </p>
                <span className="text-[10px] font-bold text-emerald-700">● Normal</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pulse Rate</p>
                <p className="text-sm font-black text-slate-900">
                  74 <span className="text-[10px] font-normal text-slate-500">bpm</span>
                </p>
                <span className="text-[10px] font-bold text-emerald-700">● Regular</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Droplets className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Blood Sugar (F)</p>
                <p className="text-sm font-black text-amber-900">
                  148 <span className="text-[10px] font-normal text-amber-700">mg/dL</span>
                </p>
                <span className="text-[10px] font-bold text-amber-800">▲ Mild High</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SpO2 (Air)</p>
                <p className="text-sm font-black text-slate-900">98%</p>
                <span className="text-[10px] font-bold text-emerald-700">● Optimal</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-rose-200 bg-rose-50/40 p-2.5 shadow-2xs flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Allergies Alert</p>
                <p className="text-xs font-black text-rose-900 truncate">Penicillin, Sulfa</p>
                <span className="text-[10px] font-bold text-rose-700">⚠ Avoid Penicillins</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Inbound Referral Dossier Banner */}
      {activeReferral && (
        <div className="rounded-2xl border-2 border-teal-300 bg-gradient-to-r from-teal-50 via-teal-50/70 to-emerald-50/50 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-700 text-white shadow-xs shrink-0 mt-0.5">
                <GitBranch className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-teal-800 text-white px-2 py-0.5 rounded">
                    Inbound Inter-Facility Transfer
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                    {activeReferral.referralCode}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                    {activeReferral.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                    {activeReferral.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-teal-950">
                  Transferred from {activeReferral.fromFacilityName} • Ref by Dr. {activeReferral.fromDoctorName}
                </h4>
                <p className="text-xs text-slate-700 font-medium">
                  <strong>Referral Reason:</strong> {activeReferral.reasonForReferral}
                  {activeReferral.clinicalSummary && ` • Summary: ${activeReferral.clinicalSummary}`}
                </p>
                {activeReferral.appointmentSlot && (
                  <p className="text-xs font-semibold text-teal-800">
                    Assigned Bed / Ward Hold: {activeReferral.appointmentSlot}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                Continuity of Care Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Allergy Conflict Warning */}
      {allergyConflictMeds.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 flex items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                Allergy Warning: Patient is Allergic to Penicillin!
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Added: <strong>{allergyConflictMeds.map((m) => m.name).join(', ')}</strong> may trigger severe allergic reaction.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              allergyConflictMeds.forEach((m) => handleRemoveMed(m.id));
            }}
            className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shrink-0"
          >
            Remove Contraindicated Drug
          </Button>
        </div>
      )}

      {/* Bundle Applied Alert */}
      {bundleAppliedMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs transition-all">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{bundleAppliedMsg}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* SIMPLIFIED, HIGH-SPEED TODAY'S TREATMENT & CLINICAL PLAN */}
      {/* ================================================== */}
      <Card className="border-teal-200 bg-white shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-teal-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-700 text-white shadow-xs">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-black text-slate-900">
                Today's Treatment & Clinical Plan
              </CardTitle>
              <p className="text-xs text-slate-500">
                Fast prescription drafting with 1-click popular diagnosis, medicines, and investigations.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopilotDrawer(true)}
            className="text-xs bg-white text-teal-800 border-teal-300 hover:bg-teal-50 font-bold gap-1 self-start sm:self-center cursor-pointer shadow-2xs"
          >
            <Zap className="h-3.5 w-3.5 text-teal-700" />
            <span>Open Clinical Bundles</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* ================================================== */}
          {/* 1. PROVISIONAL / CONFIRMED DIAGNOSIS (SIMPLIFIED) */}
          {/* ================================================== */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                  1
                </span>
                <span>Provisional / Confirmed Diagnosis:</span>
              </label>
              <span className="text-[11px] text-slate-400">1-Tap popular diagnoses:</span>
            </div>

            {/* 1-Tap Diagnosis Chips */}
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

            {/* Diagnosis Input */}
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Type medical diagnosis or click any chip above..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-bold text-slate-900 shadow-2xs"
            />
          </div>

          {/* ================================================== */}
          {/* 2. PRESCRIPTION MEDICINES (Rx - SIMPLIFIED) */}
          {/* ================================================== */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                  2
                </span>
                <span>Prescription Medicines (Rx - {meds.length} Added):</span>
              </label>
              <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                1-Tap to Add Popular Medicine:
              </span>
            </div>

            {/* 1-Click Popular Rx Chips */}
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

            {/* Compact Medicines Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              {meds.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  No medicines prescribed yet. Click any 1-tap chip above or add using the quick bar below.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5 pl-3">#</th>
                      <th className="p-2.5">Medicine & Strength</th>
                      <th className="p-2.5">Timing (M-A-N)</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Instructions</th>
                      <th className="p-2.5 pr-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meds.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 pl-3 font-mono font-bold text-teal-800">{idx + 1}</td>
                        <td className="p-2.5 font-black text-slate-900">{m.name}</td>
                        <td className="p-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-teal-100 font-mono text-teal-900 font-bold text-[11px]">
                            {m.frequency}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-700">{m.duration}</td>
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

            {/* Fast 1-Line Custom Medicine Adder Bar */}
            <form
              onSubmit={handleAddCustomMed}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
            >
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Tab. Azithromycin 500mg)"
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={customMedFreq}
                  onChange={(e) => setCustomMedFreq(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white shadow-2xs cursor-pointer font-mono font-bold"
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
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white shadow-2xs cursor-pointer"
                >
                  <option value="3 Days">3 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center gap-1.5">
                <select
                  value={customMedTiming}
                  onChange={(e) => setCustomMedTiming(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white shadow-2xs cursor-pointer"
                >
                  <option value="After Food">After Food</option>
                  <option value="Before Breakfast">Before Breakfast</option>
                  <option value="At Bedtime">At Bedtime</option>
                </select>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-bold h-full min-h-[34px] px-3 shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </form>
          </div>

          {/* ================================================== */}
          {/* 3. INVESTIGATIONS & CLINICAL ADVICE (COMPACT ROW) */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
            {/* Left: Diagnostic Tests */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                    3
                  </span>
                  <span>Diagnostic Tests ({selectedTests.length} Ordered):</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCopilotTab('REPORTS');
                    setShowCopilotDrawer(true);
                  }}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  + All Tests
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  '12-Lead ECG',
                  'Complete Blood Count (CBC)',
                  'Fasting Blood Sugar (FBS)',
                  'HbA1c (Glycated Hb)',
                  'Lipid Profile Full',
                  'Serum Creatinine & Urea',
                  'Chest X-Ray (PA View)',
                  'Urine Routine & Micro',
                ].map((test) => {
                  const isSel = selectedTests.includes(test);
                  return (
                    <button
                      key={test}
                      type="button"
                      onClick={() => toggleTest(test)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
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

            {/* Right: Advice & Follow-Up */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                    4
                  </span>
                  <span>Follow-Up Appointment & Advice:</span>
                </label>
                <span className="text-[11px] font-bold text-teal-800">
                  {getFollowUpDateString()} ({followUpMode})
                </span>
              </div>

              {/* Follow-up Timeline Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFollowUpDays(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      followUpDays === d
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    In {d < 7 ? `${d} Days` : d === 7 ? '1 Wk' : d === 14 ? '2 Wks' : '1 Mo'}
                  </button>
                ))}

                <select
                  value={followUpMode}
                  onChange={(e) => setFollowUpMode(e.target.value as any)}
                  className="text-[11px] font-bold p-1 rounded-lg border border-slate-300 bg-white shadow-2xs cursor-pointer"
                >
                  <option value="OPD">OPD (Room 4)</option>
                  <option value="TELECONSULT">Teleconsult Video</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={adviceText}
                onChange={(e) => setAdviceText(e.target.value)}
                placeholder="Doctor advice, precautions..."
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          {/* ================================================== */}
          {/* PRIMARY ACTION BAR */}
          {/* ================================================== */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isCompleted ? (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="text-sm font-black">Consultation Finished & Rx Issued!</strong>
                    <p className="text-xs text-emerald-800">
                      Prescription #{rxNumber} synced to ABHA Vault, Hospital Pharmacy & Follow-Up Calendar.
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

      {/* ================================================== */}
      {/* ON-DEMAND CLINICAL COPILOT & DISEASE BUNDLES DRAWER */}
      {/* (SHOWN ONLY AFTER CLICKING THE BUTTON - NOT BEFORE) */}
      {/* ================================================== */}
      {showCopilotDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl border-l border-slate-200 p-5 space-y-4 animate-in slide-in-from-right duration-200 overflow-y-auto flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-700 text-white shadow-xs">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Clinical Copilot & Rx Helper
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    1-Click OPD Disease Bundles & Lab Orderer
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCopilotDrawer(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveCopilotTab('BUNDLES')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCopilotTab === 'BUNDLES'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ 1-Click Bundles
              </button>

              <button
                type="button"
                onClick={() => setActiveCopilotTab('REPORTS')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCopilotTab === 'REPORTS'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧪 All Lab Tests ({selectedTests.length})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* BUNDLES */}
              {activeCopilotTab === 'BUNDLES' && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Choose standard clinical treatment bundle:
                  </span>
                  {FAST_DISEASE_BUNDLES.map((bundle) => (
                    <div
                      key={bundle.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 hover:border-teal-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[9px] font-extrabold text-teal-700 uppercase tracking-wide bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                            {bundle.badge}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 mt-0.5">
                            {bundle.name}
                          </h4>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleApplyDiseaseBundle(bundle)}
                          className="text-[10px] h-7 px-3 bg-teal-700 hover:bg-teal-800 text-white font-bold cursor-pointer shrink-0"
                        >
                          Apply Bundle
                        </Button>
                      </div>

                      <p className="text-[11px] text-slate-600">
                        <strong>Rx:</strong> {bundle.meds.map((m) => m.name).join(', ')}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>{bundle.tests.length} Labs Ordered</span>
                        <span className="text-teal-700 font-bold">In {bundle.followUpDays} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ALL LAB TESTS */}
              {activeCopilotTab === 'REPORTS' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Order diagnostic tests by department:
                  </span>
                  {CATEGORIZED_TESTS.map((cat, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Activity className="h-3.5 w-3.5 text-teal-700" />
                        <span>{cat.category}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {cat.tests.map((test) => {
                          const isSel = selectedTests.includes(test);
                          return (
                            <button
                              key={test}
                              type="button"
                              onClick={() => toggleTest(test)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                              }`}
                            >
                              {isSel ? '✓ ' : '+ '}
                              {test}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-200 pt-3">
              <Button
                onClick={() => setShowCopilotDrawer(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Close Copilot
              </Button>
            </div>
          </div>
        </div>
      )}


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

              {/* Investigations & Follow-Up Appointment */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-200 pt-3">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Investigations Ordered:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                    {selectedTests.length === 0 ? (
                      <li className="text-slate-400">None</li>
                    ) : (
                      selectedTests.map((t, i) => <li key={i}>{t}</li>)
                    )}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block mb-1">
                    Scheduled Follow-Up:
                  </span>
                  <p className="text-[11px] font-black text-teal-900">
                    • Date: {getFollowUpDateString()} ({followUpMode})
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{followUpPurpose}</p>
                </div>
              </div>

              {/* Advice */}
              <div className="border-t border-slate-200 pt-2 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Advice & Precautions:</span>
                <p className="text-[11px] text-slate-700 leading-relaxed">{adviceText}</p>
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

export default PatientClinicalWorkspace;