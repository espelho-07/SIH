import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveOfflineVitals } from '@/lib/db';
import { useConnection } from '@/contexts/ConnectionContext';
import { INITIAL_ASHA_PATIENTS } from '@/mock/mockData';
import { Vitals, RiskLevel } from '@/types/clinical';
import { Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Thermometer,
  Droplet,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Plus,
  Minus,
  User,
  MapPin,
  Calendar,
  Share2,
} from 'lucide-react';

export const VitalsRecording: React.FC = () => {
  const { refreshPendingCount } = useConnection();

  const [selectedPatientId, setSelectedPatientId] = useState(INITIAL_ASHA_PATIENTS[0].id);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [pulse, setPulse] = useState(72);
  const [temp, setTemp] = useState(98.4);
  const [sugar, setSugar] = useState(110);
  const [sugarType, setSugarType] = useState<'RANDOM' | 'FASTING' | 'POST_PRANDIAL'>('RANDOM');
  const [spO2, setSpO2] = useState(98);
  const [respiratoryRate, setRespiratoryRate] = useState(18);
  const [weight, setWeight] = useState(62);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPatient = useMemo(
    () => INITIAL_ASHA_PATIENTS.find((p) => p.id === selectedPatientId) || INITIAL_ASHA_PATIENTS[0],
    [selectedPatientId]
  );

  // Instant physiological range indicators
  const bpStatus = useMemo(() => {
    if (systolic >= 160 || diastolic >= 100) return { label: 'High (Stage 2)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'Elevated (Stage 1)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (systolic >= 120 || diastolic >= 80) return { label: 'Pre-hypertensive', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    return { label: 'Normal Baseline', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  }, [systolic, diastolic]);

  const pulseStatus = useMemo(() => {
    if (pulse > 100) return { label: 'Tachycardia (>100)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (pulse < 60) return { label: 'Bradycardia (<60)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Normal (60–100)', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  }, [pulse]);

  const spO2Status = useMemo(() => {
    if (spO2 < 92) return { label: 'Critical Hypoxia (<92%)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (spO2 < 95) return { label: 'Mild Desaturation (92-94%)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Optimal (≥95%)', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  }, [spO2]);

  const sugarStatus = useMemo(() => {
    const threshold = sugarType === 'FASTING' ? 126 : 200;
    if (sugar >= threshold + 50) return { label: 'Marked Hyperglycemia', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (sugar >= threshold) return { label: 'Elevated Sugar', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (sugar < 70) return { label: 'Hypoglycemia (<70)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    return { label: 'Target Range', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  }, [sugar, sugarType]);

  const tempStatus = useMemo(() => {
    if (temp >= 101.5) return { label: 'High Fever (>101.5°F)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (temp >= 99.5) return { label: 'Low Grade Fever', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Normal (97–99°F)', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  }, [temp]);

  // Overall clinical risk triage calculation
  const evaluatedRisk = useMemo((): { level: RiskLevel; flags: string[] } => {
    const flags: string[] = [];

    if (systolic >= 160 || diastolic >= 100) flags.push('Stage 2 High Blood Pressure (≥160/100 mmHg)');
    else if (systolic >= 140 || diastolic >= 90) flags.push('Elevated Blood Pressure (Stage 1)');

    if (pulse > 110 || pulse < 50) flags.push('Abnormal Heart Rate detected');
    if (temp >= 101.5) flags.push('High Fever (>101.5°F)');
    if (sugar >= 250) flags.push('Severe Hyperglycemia (>250 mg/dL)');
    if (spO2 < 93) flags.push('Hypoxia / Low Oxygen Saturation (<93%)');

    if (systolic >= 160 || diastolic >= 100 || sugar >= 250 || spO2 < 93) {
      return { level: 'HIGH_RISK', flags };
    }
    if (flags.length > 0) {
      return { level: 'NEEDS_ATTENTION', flags };
    }
    return { level: 'NORMAL', flags: ['All physiological vitals within healthy baseline ranges'] };
  }, [systolic, diastolic, pulse, temp, sugar, spO2]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const vitalEntry: Vitals = {
        patientId: selectedPatientId,
        recordedBy: 'Sunita Devi (Frontline Worker)',
        recordedByRole: 'ASHA',
        recordedAt: new Date().toISOString(),
        systolicBp: systolic,
        diastolicBp: diastolic,
        pulseRate: pulse,
        temperatureF: temp,
        bloodSugarMgDl: sugar,
        sugarType,
        spO2: spO2,
        respiratoryRate: respiratoryRate,
        weightKg: weight,
        riskLevel: evaluatedRisk.level,
        riskFlags: evaluatedRisk.flags,
      };

      await saveOfflineVitals(vitalEntry);
      await refreshPendingCount();
      setIsSaved(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="Field Vitals Capture"
        subtitle="Tactile vitals recording with instant clinical boundary detection and local IndexedDB offline storage."
        breadcrumbs={[{ label: 'Frontline Dashboard', to: '/asha' }, { label: 'Record Vitals' }]}
      />

      {isSaved ? (
        <Card className="border-teal-200 bg-white p-8 text-center space-y-5 shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Vitals Successfully Logged!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Telemetry for <strong className="text-slate-900">{selectedPatient.name}</strong> has been saved to your local offline database with risk tier:
            </p>
            <div className="inline-block mt-2">
              <span
                className={`rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wide ${
                  evaluatedRisk.level === 'HIGH_RISK'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : evaluatedRisk.level === 'NEEDS_ATTENTION'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-teal-100 text-teal-800 border border-teal-200'
                }`}
              >
                {evaluatedRisk.level.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => setIsSaved(false)}
              variant="outline"
              className="w-full sm:w-auto min-h-[44px]"
            >
              Record Another Reading
            </Button>
            {evaluatedRisk.level !== 'NORMAL' && (
              <Link to="/asha/referrals" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full bg-rose-700 hover:bg-rose-800 min-h-[44px]">
                  Create Facility Referral
                </Button>
              </Link>
            )}
            <Link to="/asha/visits" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full bg-teal-700 hover:bg-teal-800 min-h-[44px]">
                Back to Home Visits
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Citizen Selector & Quick Context */}
          <Card className="p-4 sm:p-5 border-slate-200/90 bg-white shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Citizen from Village Cohort
                </label>
                <span className="text-[11px] text-teal-700 font-semibold">
                  {INITIAL_ASHA_PATIENTS.length} assigned in sector
                </span>
              </div>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="flex min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 font-bold focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                {INITIAL_ASHA_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}Y, {p.village}) • {p.category?.replace(/_/g, ' ')} {p.isHighRisk ? '⚠️ Priority Case' : ''}
                  </option>
                ))}
              </select>

              {/* Patient mini summary strip */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <strong>{selectedPatient.gender === 'F' ? 'Female' : 'Male'}</strong>, {selectedPatient.age} yrs
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {selectedPatient.village}
                  </span>
                  {selectedPatient.bloodGroup && (
                    <span className="rounded bg-teal-100/80 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                      Blood: {selectedPatient.bloodGroup}
                    </span>
                  )}
                </div>
                {selectedPatient.isHighRisk && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                    High-Risk Active
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Vitals Form Cards */}
          <div className="space-y-4">
            {/* 1. Blood Pressure Card with +/- steppers */}
            <Card className="p-4 sm:p-5 border-slate-200/90 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Blood Pressure (mmHg)</h3>
                    <p className="text-[11px] text-slate-500">Systolic (top) / Diastolic (bottom)</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${bpStatus.color}`}>
                  {bpStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Systolic */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Systolic (High)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSystolic((prev) => Math.max(70, prev - 5))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(parseInt(e.target.value) || 0)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setSystolic((prev) => Math.min(240, prev + 5))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Diastolic */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Diastolic (Low)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDiastolic((prev) => Math.max(40, prev - 5))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(parseInt(e.target.value) || 0)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setDiastolic((prev) => Math.min(160, prev + 5))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Pulse Rate & Oxygen Saturation */}
            <Card className="p-4 sm:p-5 border-slate-200/90 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pulse & Oxygen (SpO2)</h3>
                    <p className="text-[11px] text-slate-500">Cardiovascular & Respiratory Telemetry</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Pulse */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Pulse (beats/min)</span>
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${pulseStatus.color}`}>
                      {pulseStatus.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPulse((prev) => Math.max(35, prev - 2))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(parseInt(e.target.value) || 0)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setPulse((prev) => Math.min(200, prev + 2))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">SpO2 (%)</span>
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${spO2Status.color}`}>
                      {spO2Status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSpO2((prev) => Math.max(70, prev - 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(parseInt(e.target.value) || 0)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setSpO2((prev) => Math.min(100, prev + 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Blood Sugar & Measurement State */}
            <Card className="p-4 sm:p-5 border-slate-200/90 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Droplet className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Blood Glucose (mg/dL)</h3>
                    <p className="text-[11px] text-slate-500">Capillary blood glucose glucometer check</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${sugarStatus.color}`}>
                  {sugarStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Glucose Value */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Reading (mg/dL)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSugar((prev) => Math.max(40, prev - 5))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={sugar}
                      onChange={(e) => setSugar(parseInt(e.target.value) || 0)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setSugar((prev) => Math.min(500, prev + 5))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Timing Context */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Timing of Test</span>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['RANDOM', 'FASTING', 'POST_PRANDIAL'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSugarType(t)}
                        className={`min-h-[44px] rounded-lg border text-xs font-bold transition-colors ${
                          sugarType === t
                            ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {t === 'RANDOM' ? 'Random' : t === 'FASTING' ? 'Fasting' : 'Post Meal'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Temperature & Body Metrics */}
            <Card className="p-4 sm:p-5 border-slate-200/90 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Thermometer className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Temperature & Weight</h3>
                    <p className="text-[11px] text-slate-500">General somatic baseline measurements</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${tempStatus.color}`}>
                  {tempStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Temp */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Body Temp (°F)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTemp((prev) => parseFloat(Math.max(94.0, prev - 0.2).toFixed(1)))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(parseFloat(e.target.value) || 98.4)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setTemp((prev) => parseFloat(Math.min(106.0, prev + 0.2).toFixed(1)))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Weight */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Weight (kg)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWeight((prev) => Math.max(5, prev - 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setWeight((prev) => Math.min(200, prev + 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Evaluated Clinical Risk Bar */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
              evaluatedRisk.level === 'HIGH_RISK'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : evaluatedRisk.level === 'NEEDS_ATTENTION'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-teal-50 border-teal-300 text-teal-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-current" />
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm uppercase tracking-wide">
                    Live Telemetry Triage: {evaluatedRisk.level.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/70">
                    Rule-Based Boundary Check
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {evaluatedRisk.flags.map((flag, idx) => (
                    <li key={idx} className="font-medium">
                      {flag}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 pt-1">
                  * Note: High-risk telemetry advises immediate consultation with the Subcentre / PHC Medical Officer. Decision support does not substitute clinical diagnosis.
                </p>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-teal-700 hover:bg-teal-800 font-bold min-h-[48px] shadow-sm text-sm"
            isLoading={isLoading}
          >
            Save Vitals to Offline Record
          </Button>
        </form>
      )}
    </div>
  );
};
