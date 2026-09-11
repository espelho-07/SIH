import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { saveOfflineVitals } from '@/lib/db';
import { useConnection } from '@/contexts/ConnectionContext';
import { INITIAL_ASHA_PATIENTS } from '@/mock/mockData';
import { Vitals, RiskLevel } from '@/types/clinical';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Heart, Thermometer, Droplet, Wind } from 'lucide-react';

export const VitalsRecording: React.FC = () => {
  const { refreshPendingCount } = useConnection();

  const [selectedPatientId, setSelectedPatientId] = useState(INITIAL_ASHA_PATIENTS[0].id);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.4');
  const [sugar, setSugar] = useState('110');
  const [sugarType, setSugarType] = useState<'RANDOM' | 'FASTING' | 'POST_PRANDIAL'>('RANDOM');
  const [spO2, setSpO2] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [weight, setWeight] = useState('62');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Instant boundary detection for abnormal ranges (Section 10 Vitals)
  const evaluatedRisk = useMemo((): { level: RiskLevel; flags: string[] } => {
    const flags: string[] = [];
    const sys = parseInt(systolic) || 0;
    const dia = parseInt(diastolic) || 0;
    const p = parseInt(pulse) || 0;
    const t = parseFloat(temp) || 0;
    const sug = parseInt(sugar) || 0;
    const o2 = parseInt(spO2) || 100;

    if (sys >= 160 || dia >= 100) flags.push('Critical High Blood Pressure (Stage 2)');
    else if (sys >= 140 || dia >= 90) flags.push('Elevated Blood Pressure (Needs Attention)');

    if (p > 110 || p < 50) flags.push('Abnormal Heart Rate (Tachycardia/Bradycardia)');
    if (t >= 101.5) flags.push('High Fever (>101.5°F)');
    if (sug >= 250) flags.push('Severe Hyperglycemia (>250 mg/dL)');
    if (o2 < 93) flags.push('Hypoxia / Low SpO2 (<93%)');

    if (sys >= 160 || dia >= 100 || sug >= 250 || o2 < 93) {
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
        recordedBy: 'Sunita Devi (ASHA)',
        recordedByRole: 'ASHA',
        recordedAt: new Date().toISOString(),
        systolicBp: parseInt(systolic),
        diastolicBp: parseInt(diastolic),
        pulseRate: parseInt(pulse),
        temperatureF: parseFloat(temp),
        bloodSugarMgDl: parseInt(sugar),
        sugarType,
        spO2: parseInt(spO2),
        respiratoryRate: parseInt(respiratoryRate),
        weightKg: parseFloat(weight),
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Field Vitals Recording"
        subtitle="Touch-friendly field vitals capture with automated abnormal range tagging. Saved offline to IndexedDB."
        breadcrumbs={[{ label: 'ASHA Dashboard', to: '/asha' }, { label: 'Record Vitals' }]}
      />

      {isSaved ? (
        <Card className="border-emerald-200 bg-white p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Vitals Successfully Logged!</h2>
          <p className="text-sm text-slate-600">
            Telemetry saved to local offline database with status:{' '}
            <strong className="text-emerald-800">{evaluatedRisk.level}</strong>.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Button onClick={() => setIsSaved(false)} variant="primary" className="bg-emerald-700 hover:bg-emerald-800">
              Record Another Citizen
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Patient Selector */}
          <Card className="p-4 border-slate-200 bg-white shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Select Citizen from Village Cohort
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-semibold"
            >
              {INITIAL_ASHA_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}Y, {p.village}) {p.isHighRisk ? '⚠️ High-Risk' : ''}
                </option>
              ))}
            </select>
          </Card>

          {/* Vitals Grid with large touch targets */}
          <Card className="p-6 border-slate-200 bg-white shadow-md space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blood Pressure */}
              <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                  <Heart className="h-4 w-4 text-rose-600" />
                  <span>Blood Pressure (mmHg)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Systolic (High)"
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    required
                  />
                  <Input
                    label="Diastolic (Low)"
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Pulse & SpO2 */}
              <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                  <Activity className="h-4 w-4 text-teal-600" />
                  <span>Pulse & Oxygen Saturation</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Pulse (bpm)"
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    required
                  />
                  <Input
                    label="SpO2 (%)"
                    type="number"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Blood Sugar */}
              <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                  <Droplet className="h-4 w-4 text-amber-600" />
                  <span>Blood Sugar (mg/dL)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Reading (mg/dL)"
                    type="number"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    required
                  />
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Type
                    </label>
                    <select
                      value={sugarType}
                      onChange={(e) => setSugarType(e.target.value as 'RANDOM' | 'FASTING' | 'POST_PRANDIAL')}
                      className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"
                    >
                      <option value="RANDOM">Random</option>
                      <option value="FASTING">Fasting</option>
                      <option value="POST_PRANDIAL">Post Meal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Temperature & Weight */}
              <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                  <Thermometer className="h-4 w-4 text-indigo-600" />
                  <span>Temperature & Weight</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Temp (°F)"
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    required
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Evaluated Clinical Risk Bar */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                evaluatedRisk.level === 'HIGH_RISK'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : evaluatedRisk.level === 'NEEDS_ATTENTION'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm uppercase">
                    Risk Assessment: {evaluatedRisk.level.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold">Rule-based Telemetry</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {evaluatedRisk.flags.map((flag, idx) => (
                    <li key={idx} className="font-medium">
                      {flag}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 pt-1 italic">
                  * Note: High-risk indicator recommends Medical Officer referral. AI and automated rules do NOT provide clinical diagnoses.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
              isLoading={isLoading}
            >
              Save Vitals to Offline Record
            </Button>
          </Card>
        </form>
      )}
    </div>
  );
};
