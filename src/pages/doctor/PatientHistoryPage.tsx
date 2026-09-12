import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import {
  INITIAL_HEALTH_RECORD,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSTIC_ORDERS,
  INITIAL_LIVE_QUEUE,
} from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import {
  Stethoscope,
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Heart,
  Droplets,
  Printer,
  Pill,
  Hospital,
  Search,
  Filter,
  Users,
  ChevronRight,
  Phone,
  Plus,
  ExternalLink,
  Download,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';

// Rich Mock Data for Patient History Page
const HISTORICAL_LAB_REPORTS = [
  {
    id: 'lab_h_01',
    date: '2026-02-14',
    testName: 'HbA1c (Glycated Hemoglobin)',
    value: '7.4 %',
    normalRange: '< 5.7 % (Normal), 5.7 - 6.4 % (Pre-diabetic)',
    status: 'ELEVATED',
    facility: 'Gandhinagar Civil Hospital Central Lab',
    summary: 'Sub-optimally controlled glycemic control over past 90 days. Metformin titration recommended.',
  },
  {
    id: 'lab_h_02',
    date: '2026-02-14',
    testName: 'Fasting Blood Sugar (FBS)',
    value: '148 mg/dL',
    normalRange: '70 - 99 mg/dL',
    status: 'ELEVATED',
    facility: 'Gandhinagar Civil Hospital Central Lab',
    summary: 'Elevated fasting blood glucose. Advise dietary compliance.',
  },
  {
    id: 'lab_h_03',
    date: '2026-02-14',
    testName: 'Lipid Profile - Total Cholesterol',
    value: '198 mg/dL',
    normalRange: '< 200 mg/dL (Desirable)',
    status: 'BORDERLINE',
    facility: 'Gandhinagar Civil Hospital Central Lab',
    summary: 'Borderline elevation. LDL: 124 mg/dL, HDL: 42 mg/dL, Triglycerides: 165 mg/dL.',
  },
  {
    id: 'lab_h_04',
    date: '2026-02-14',
    testName: 'Serum Creatinine & Blood Urea',
    value: '0.92 mg/dL',
    normalRange: '0.7 - 1.2 mg/dL',
    status: 'NORMAL',
    facility: 'Gandhinagar Civil Hospital Central Lab',
    summary: 'Renal function intact. eGFR > 90 mL/min/1.73m2.',
  },
  {
    id: 'lab_h_05',
    date: '2026-01-10',
    testName: '12-Lead Electrocardiogram (ECG)',
    value: 'Normal Sinus Rhythm',
    normalRange: 'Rate 60-100 bpm, No acute ST-T changes',
    status: 'NORMAL',
    facility: 'Gandhinagar Civil Cardiology Wing',
    summary: 'Rate: 72 bpm, Normal axis, no pathological Q waves, no acute ischemia seen at rest.',
  },
  {
    id: 'lab_h_06',
    date: '2025-12-18',
    testName: 'Chest X-Ray (PA View)',
    value: 'Clear Lung Fields',
    normalRange: 'Normal cardiothoracic ratio, clear CPA',
    status: 'NORMAL',
    facility: 'Pethapur CHC Radiology',
    summary: 'Bilateral lung fields clear. Costophrenic angles sharp. CTR normal.',
  },
];

const HISTORICAL_ENCOUNTERS = [
  {
    id: 'enc_h_01',
    date: '2026-03-01T10:30:00Z',
    doctorName: 'Dr. Arvind Patel',
    specialty: 'MD (Internal Medicine & Cardiology)',
    facility: 'Gandhinagar Civil Hospital • OPD Room 4',
    diagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension',
    complaint: 'Routine follow-up for blood pressure and diabetes management.',
    vitals: 'BP: 128/82 mmHg • Pulse: 74 bpm • SpO2: 98% • Weight: 68 kg',
    notes: 'Patient compliant with Telmisartan. Blood sugar slightly elevated. Advised morning brisk walk and diet control.',
    prescriptions: ['Tab. Metformin 1000mg SR (1-0-1)', 'Tab. Telmisartan 40mg (1-0-0)', 'Tab. Atorvastatin 10mg (0-0-1)'],
  },
  {
    id: 'enc_h_02',
    date: '2026-01-20T14:20:00Z',
    doctorName: 'Dr. Neha Vaghela',
    specialty: 'MS (Ophthalmology)',
    facility: 'Gandhinagar Civil Hospital • Eye OPD',
    diagnosis: 'Diabetic Retinopathy Screening',
    complaint: 'Annual diabetic eye examination on referral from PHC.',
    vitals: 'Vision: 6/6 bilateral with corrective glasses',
    notes: 'Dilated fundus examination completed. Clear media. No evidence of diabetic microaneurysms or macular edema.',
    prescriptions: ['Carboxymethylcellulose 0.5% Eye Drops (1 drop TDS)'],
  },
  {
    id: 'enc_h_03',
    date: '2025-12-15T09:45:00Z',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'General Physician',
    facility: 'Pethapur Primary Health Centre (PHC)',
    diagnosis: 'Acute Bacterial Bronchitis & Mild Dehydration',
    complaint: 'Persistent productive cough, fever 101F, and weakness for 4 days.',
    vitals: 'BP: 122/80 mmHg • Pulse: 88 bpm • SpO2: 96% • Temp: 100.8°F',
    notes: 'Scattered rhonchi heard in right lower zone. Sputum clear. Started on oral antibiotics and bronchodilator.',
    prescriptions: ['Tab. Azithromycin 500mg (1-0-0)', 'Tab. Paracetamol 650mg (1-0-1)', 'Syrup Ambroxol + Levosalbutamol (2 tsp TDS)'],
  },
];

const HISTORICAL_ADMISSIONS = [
  {
    id: 'adm_h_01',
    admitDate: '2025-11-04',
    dischargeDate: '2025-11-07',
    facility: 'Gandhinagar Civil Hospital',
    ward: 'Male Medical Ward - Bed 14',
    doctor: 'Dr. Arvind Patel',
    diagnosis: 'Acute Asthmatic Bronchitis with Mild Hypoxia',
    summary: 'Admitted with dyspnea (SpO2 93% on room air). Treated with nebulization, IV hydrocortisone, and supplemental O2. Discharged hemodynamically stable.',
  },
];

export const PatientHistoryPage: React.FC = () => {
  const { id: routePatientId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Find currently selected token or fallback to first
  const queueTokens = INITIAL_LIVE_QUEUE.tokens;
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

  const basePatient = INITIAL_HEALTH_RECORD;
  const patient = {
    ...basePatient,
    patientId: activeToken.patientId,
    name: activeToken.patientName,
    age: activeToken.patientAge,
    gender: activeToken.patientGender === 'M' ? 'Male' : 'Female',
    phone: activeToken.patientPhone,
    tokenNumber: activeToken.tokenNumber,
  };

  const [activeTab, setActiveTab] = useState<'ALL' | 'VISITS' | 'LABS' | 'MEDS' | 'ADMISSIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filterQuery = searchQuery.toLowerCase().trim();

  const filteredEncounters = HISTORICAL_ENCOUNTERS.filter(
    (e) =>
      !filterQuery ||
      e.diagnosis.toLowerCase().includes(filterQuery) ||
      e.doctorName.toLowerCase().includes(filterQuery) ||
      e.notes.toLowerCase().includes(filterQuery) ||
      e.facility.toLowerCase().includes(filterQuery)
  );

  const filteredLabs = HISTORICAL_LAB_REPORTS.filter(
    (l) =>
      !filterQuery ||
      l.testName.toLowerCase().includes(filterQuery) ||
      l.summary.toLowerCase().includes(filterQuery) ||
      l.value.toLowerCase().includes(filterQuery)
  );

  const filteredAdmissions = HISTORICAL_ADMISSIONS.filter(
    (a) =>
      !filterQuery ||
      a.diagnosis.toLowerCase().includes(filterQuery) ||
      a.facility.toLowerCase().includes(filterQuery) ||
      a.summary.toLowerCase().includes(filterQuery)
  );

  const returnUrl = `/doctor/patients/${patient.patientId || 'usr_pat_01'}`;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ================================================== */}
      {/* PAGE HEADER WITH RETURN BUTTON */}
      {/* ================================================== */}
      <PageHeader
        title="Longitudinal Patient Health History (EHR)"
        subtitle={`Complete ABHA verified clinical records, past doctor visits, lab reports and medications for ${patient.name}.`}
        breadcrumbs={[
          { label: 'Doctor Desk', to: '/doctor' },
          { label: 'Patients & Treatment', to: '/doctor/patients' },
          { label: 'Patient Clinical Desk', to: returnUrl },
          { label: 'Patient History' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs gap-1.5 bg-white text-slate-700"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Print Record</span>
            </Button>

            {/* RETURN TO PRESCRIPTION DESK BUTTON */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(returnUrl)}
              className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-black gap-2 min-h-[38px] shadow-xs cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Prescription Desk</span>
            </Button>
          </div>
        }
      />

      {/* ================================================== */}
      {/* PATIENT DEMOGRAPHICS & CRITICAL ALERTS HERO CARD */}
      {/* ================================================== */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-white shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-teal-100 pb-3.5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-xs font-mono font-black text-base">
                {patient.tokenNumber}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ABHA: {patient.abhaId}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
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
                  <span className="text-slate-500">Gandhinagar District Base Record</span>
                </p>
              </div>
            </div>

            {/* Fast Return Shortcut */}
            <Button
              onClick={() => navigate(returnUrl)}
              variant="outline"
              size="sm"
              className="text-xs bg-white text-teal-900 border-teal-300 hover:bg-teal-50 font-bold gap-1.5 self-end lg:self-center cursor-pointer shadow-2xs"
            >
              <Stethoscope className="h-3.5 w-3.5 text-teal-700" />
              <span>Resume Treatment & Rx</span>
            </Button>
          </div>

          {/* Critical Allergies & Chronic Conditions Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-800 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold uppercase tracking-wider text-rose-700 text-[10px] block">
                  Critical Drug Allergies:
                </span>
                <span className="font-black text-rose-900 text-sm">
                  {patient.allergies?.join(', ') || 'No known allergies'}
                </span>
                <p className="text-[10px] text-rose-600">Contraindicated: Penicillins, Amoxicillin, Sulfa</p>
              </div>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold uppercase tracking-wider text-teal-800 text-[10px] block">
                  Known Chronic Conditions:
                </span>
                <span className="font-black text-teal-950 text-sm">
                  {patient.chronicConditions?.join(' • ') || 'None recorded'}
                </span>
                <p className="text-[10px] text-teal-700">Active management under Dr. Arvind Patel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* SEARCH BAR & CATEGORY TABS */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search past diagnoses, lab tests, doctor notes, drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white shadow-2xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Records (Timeline)' },
            { id: 'VISITS', label: `Doctor Visits (${filteredEncounters.length})` },
            { id: 'LABS', label: `Lab & Diagnostics (${filteredLabs.length})` },
            { id: 'MEDS', label: 'Past Prescriptions (3)' },
            { id: 'ADMISSIONS', label: `Hospital Admissions (${filteredAdmissions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-2xs font-black'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* TAB CONTENTS */}
      {/* ================================================== */}

      {/* 1. DOCTOR ENCOUNTERS & VISITS */}
      {(activeTab === 'ALL' || activeTab === 'VISITS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-700" />
              <span>Doctor Encounters & Outpatient Visits ({filteredEncounters.length}):</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Sorted by most recent</span>
          </div>

          <div className="space-y-3">
            {filteredEncounters.map((enc) => (
              <Card
                key={enc.id}
                className="border-slate-200 bg-white hover:border-teal-300 transition-all shadow-2xs overflow-hidden"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 shrink-0">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{enc.diagnosis}</h4>
                          <span className="rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 border border-teal-200">
                            Outpatient Visit
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{enc.facility}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <strong className="text-xs font-bold text-teal-900 block">{enc.doctorName}</strong>
                      <span className="text-[11px] text-slate-500">{enc.specialty}</span>
                      <p className="text-[10px] text-slate-400">{formatDate(enc.date)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-bold">Doctor's Clinical Notes:</strong> {enc.notes}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Vitals Recorded:</span>
                      <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {enc.vitals}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Prescribed:</span>
                      {enc.prescriptions.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-teal-50 text-teal-900 px-2 py-0.5 rounded border border-teal-200"
                        >
                          💊 {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. DIAGNOSTIC LAB & RADIOLOGY REPORTS */}
      {(activeTab === 'ALL' || activeTab === 'LABS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-teal-700" />
              <span>Diagnostic Lab & Radiology Reports ({filteredLabs.length}):</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Central Pathology & Imaging</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredLabs.map((lab) => (
              <Card
                key={lab.id}
                className="border-slate-200 bg-white hover:border-teal-300 transition-all shadow-2xs"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{lab.testName}</h4>
                      <p className="text-[10px] text-slate-400">{lab.date} • {lab.facility}</p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        lab.status === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : lab.status === 'ELEVATED'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {lab.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Report Value</span>
                      <span className="text-base font-black text-slate-900">{lab.value}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Normal Reference</span>
                      <span className="text-xs font-medium text-slate-700">{lab.normalRange}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-normal">{lab.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. PAST PRESCRIPTIONS */}
      {(activeTab === 'ALL' || activeTab === 'MEDS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Pill className="h-4 w-4 text-teal-700" />
              <span>Past Prescriptions & Medication Regimens:</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Digital Rx Records</span>
          </div>

          <div className="space-y-3">
            {INITIAL_PRESCRIPTIONS.map((rx) => (
              <Card key={rx.id} className="border-slate-200 bg-white shadow-2xs overflow-hidden">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-sm font-black text-slate-900">{rx.diagnosisSummary}</span>
                      <p className="text-xs text-slate-500">
                        Prescribed by {rx.doctorName} ({rx.facilityName}) • {formatDate(rx.issuedAt)}
                      </p>
                    </div>

                    <StatusBadge status={rx.status} />
                  </div>

                  <div className="space-y-2">
                    {rx.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <strong className="text-slate-900 font-bold">{it.medicineName}</strong>
                          <span className="text-slate-500 ml-2 font-mono">[{it.frequency}]</span>
                          <span className="text-slate-500 ml-2">Duration: {it.duration}</span>
                          <p className="text-[11px] text-slate-600 mt-0.5">{it.instructions}</p>
                        </div>

                        <Button
                          onClick={() => navigate(returnUrl)}
                          size="sm"
                          variant="outline"
                          className="text-[10px] font-bold text-teal-800 border-teal-300 hover:bg-teal-50 gap-1 shrink-0"
                        >
                          <Plus className="h-3 w-3 text-teal-700" />
                          <span>Re-prescribe</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. INPATIENT HOSPITAL ADMISSIONS */}
      {(activeTab === 'ALL' || activeTab === 'ADMISSIONS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Hospital className="h-4 w-4 text-teal-700" />
              <span>Inpatient Admissions & Discharge Summaries ({filteredAdmissions.length}):</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Base Hospital Records</span>
          </div>

          <div className="space-y-3">
            {filteredAdmissions.map((adm) => (
              <Card key={adm.id} className="border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{adm.diagnosis}</h4>
                      <p className="text-xs text-slate-500">
                        {adm.facility} • {adm.ward} • Attending: {adm.doctor}
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {adm.admitDate} to {adm.dischargeDate} (3 Days)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Discharge Summary:</strong> {adm.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* BOTTOM ACTION BAR */}
      {/* ================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <span className="text-xs text-slate-500">
          Viewing longitudinal ABHA Health Record for Token #{patient.tokenNumber}.
        </span>

        <Button
          onClick={() => navigate(returnUrl)}
          variant="primary"
          className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-black text-xs gap-2 px-6 min-h-[42px] shadow-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Prescription & Treatment Desk</span>
        </Button>
      </div>
    </div>
  );
};

export default PatientHistoryPage;
