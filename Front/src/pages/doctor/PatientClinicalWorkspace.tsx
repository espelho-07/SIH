import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { INITIAL_HEALTH_RECORD, INITIAL_PRESCRIPTIONS, INITIAL_DIAGNOSTIC_ORDERS } from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Activity,
  FileText,
  Pill,
  FlaskConical,
  GitBranch,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';

export const PatientClinicalWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const patient = INITIAL_HEALTH_RECORD;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VITALS' | 'PAST_PRESCRIPTIONS' | 'LABS'>('OVERVIEW');

  // Today's Encounter Form State
  const [chiefComplaint, setChiefComplaint] = useState('Patient reports intermittent retrosternal chest heaviness over past 3 days');
  const [examNotes, setExamNotes] = useState('Pulse: 76 bpm regular. S1 S2 heard. No pedal edema. Chest clear bilateral.');
  const [diagnosis, setDiagnosis] = useState('Angina Pectoris - Rule out Ischemia / CAD');

  // Digital Prescriptions builder
  const [meds, setMeds] = useState([
    { name: 'Tab. Sorbitrate 5mg (Sublingual SOS)', dosage: '5 mg', frequency: 'As needed for chest tightness' },
    { name: 'Tab. Aspirin 75mg Gastro-resistant', dosage: '75 mg', frequency: '1-0-0 (Morning after breakfast)' },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  const [isCompleted, setIsCompleted] = useState(false);

  const handleAddMed = () => {
    if (!newMedName) return;
    setMeds([...meds, { name: newMedName, dosage: newMedDosage || '1 tablet', frequency: '1-0-1' }]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  const handleCompleteEncounter = () => {
    setIsCompleted(true);
  };

  return (
    <div className="space-y-6">
      {/* Patient Header Strip */}
      <Card className="p-5 border-teal-200 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{patient.name}</h1>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                ABHA: {patient.abhaId}
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                Needs Attention
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Age: <strong>{patient.age} Yrs</strong> • Gender: <strong>{patient.gender}</strong> • Blood: <strong>{patient.bloodGroup}</strong> • Contact: +91 {patient.phone}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/doctor/referrals">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <GitBranch className="h-4 w-4 text-teal-700" />
                <span>Create Hospital Referral</span>
              </Button>
            </Link>
            <Link to="/doctor/teleconsultations">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-sky-700 border-sky-200 hover:bg-sky-50">
                <span>Start Teleconsult</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Split Layout: Left Historical EHR, Right Current Encounter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Longitudinal Medical History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid grid-cols-4 max-w-full">
              <TabsTrigger value="OVERVIEW">History</TabsTrigger>
              <TabsTrigger value="VITALS">Vitals Trend</TabsTrigger>
              <TabsTrigger value="PAST_PRESCRIPTIONS">Past Rx</TabsTrigger>
              <TabsTrigger value="LABS">Lab Reports</TabsTrigger>
            </TabsList>

            {/* Overview History Feed */}
            <TabsContent value="OVERVIEW" className="space-y-3 pt-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 uppercase text-xs tracking-wider">
                  Chronic Conditions & Allergies
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Conditions:</span>
                    <span className="font-bold text-slate-800">{patient.chronicConditions?.join(', ')}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-900">
                    <span className="text-rose-500 block font-semibold">Allergies:</span>
                    <span className="font-bold">{patient.allergies?.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Past Timeline entries */}
              <div className="space-y-2">
                {patient.timeline.map((ev) => (
                  <Card key={ev.id} className="p-4 border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <span className="text-slate-400">{formatDate(ev.date)}</span>
                    </div>
                    <p className="text-slate-500">{ev.facilityName} {ev.doctorName ? `• ${ev.doctorName}` : ''}</p>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded-md mt-1">{ev.summary}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Vitals Trend Tab */}
            <TabsContent value="VITALS" className="space-y-3 pt-2">
              <Card className="p-5 border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Latest Recorded Vitals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border">
                    <span className="text-slate-500 uppercase font-bold text-[10px]">Blood Pressure</span>
                    <p className="text-lg font-black text-slate-900 mt-1">128 / 82</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Controlled</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border">
                    <span className="text-slate-500 uppercase font-bold text-[10px]">Pulse Rate</span>
                    <p className="text-lg font-black text-slate-900 mt-1">74 bpm</p>
                    <span className="text-[10px] text-slate-500">Normal sinus</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-amber-800 uppercase font-bold text-[10px]">Fasting Sugar</span>
                    <p className="text-lg font-black text-amber-700 mt-1">148 mg/dL</p>
                    <span className="text-[10px] text-amber-800 font-medium">Borderline high</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Past Rx Tab */}
            <TabsContent value="PAST_PRESCRIPTIONS" className="space-y-3 pt-2">
              {INITIAL_PRESCRIPTIONS.map((rx) => (
                <Card key={rx.id} className="p-4 border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{rx.diagnosisSummary}</span>
                    <StatusBadge status={rx.status} />
                  </div>
                  <div className="divide-y divide-slate-100">
                    {rx.items.map((item) => (
                      <div key={item.id} className="py-1.5 flex justify-between">
                        <span>{item.medicineName}</span>
                        <span className="text-slate-500">{item.frequency}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Labs Tab */}
            <TabsContent value="LABS" className="space-y-3 pt-2">
              {INITIAL_DIAGNOSTIC_ORDERS.map((lab) => (
                <Card key={lab.id} className="p-4 border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{lab.testName}</span>
                    <StatusBadge status={lab.status} />
                  </div>
                  {lab.resultSummary && (
                    <p className="p-2 rounded bg-slate-50 font-mono text-slate-800 border">
                      {lab.resultSummary}
                    </p>
                  )}
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: Active Encounter Documentation Workspace (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-teal-300 bg-white shadow-md">
            <CardHeader className="bg-teal-50/70 border-b border-teal-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-teal-950 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-700" />
                  <span>Today's Clinical Encounter</span>
                </CardTitle>
                <span className="text-[10px] font-bold text-teal-800 uppercase bg-teal-100 px-2 py-0.5 rounded-full">
                  OPD Visit
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Chief Complaint */}
              <div className="space-y-1 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Chief Complaint
                </label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                />
              </div>

              {/* Physical Exam & Notes */}
              <div className="space-y-1 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Physical Examination & Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                />
              </div>

              {/* Provisional Diagnosis */}
              <Input
                label="Provisional / Final Diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />

              {/* Digital Prescriptions Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Prescribe Medications
                  </label>
                  <span className="text-[11px] text-slate-400">{meds.length} items prescribed</span>
                </div>

                <div className="space-y-1.5">
                  {meds.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-slate-500 text-[11px]">{m.frequency}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMed(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        aria-label="Remove medicine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Mini-Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Medicine name..."
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dosage..."
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <Button type="button" onClick={handleAddMed} variant="secondary" size="sm" className="px-2.5 text-xs">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {isCompleted ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    <span>Encounter Completed & Digital Prescription Dispatched to Pharmacy Desk!</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleCompleteEncounter}
                      variant="primary"
                      size="md"
                      className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Complete Encounter</span>
                    </Button>
                    <Link to="/doctor/referrals" className="flex-1">
                      <Button variant="outline" size="md" className="w-full text-xs gap-1.5">
                        <GitBranch className="h-4 w-4" />
                        <span>Refer Patient</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
