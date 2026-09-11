import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/Tabs';
import {
  INITIAL_HEALTH_RECORD,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSTIC_ORDERS,
} from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  GitBranch,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';

export const PatientClinicalWorkspace: React.FC = () => {
  const patient = INITIAL_HEALTH_RECORD;

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'VITALS' | 'PAST_PRESCRIPTIONS' | 'LABS'
  >('OVERVIEW');

  // Today's Visit
  const [chiefComplaint, setChiefComplaint] = useState(
    'Patient reports intermittent retrosternal chest heaviness over past 3 days'
  );

  const [examNotes, setExamNotes] = useState(
    'Pulse: 76 bpm regular. S1 S2 heard. No pedal edema. Chest clear bilateral.'
  );

  const [diagnosis, setDiagnosis] = useState(
    'Angina Pectoris - Rule out Ischemia / CAD'
  );

  // Medicines
  const [meds, setMeds] = useState([
    {
      name: 'Tab. Sorbitrate 5mg (Sublingual SOS)',
      dosage: '5 mg',
      frequency: 'As needed for chest tightness',
    },
    {
      name: 'Tab. Aspirin 75mg Gastro-resistant',
      dosage: '75 mg',
      frequency: '1-0-0 (Morning after breakfast)',
    },
  ]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  const [isCompleted, setIsCompleted] = useState(false);

  const handleAddMed = () => {
    if (!newMedName.trim()) return;

    setMeds([
      ...meds,
      {
        name: newMedName,
        dosage: newMedDosage || '1 tablet',
        frequency: '1-0-1',
      },
    ]);

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
    <div className="space-y-4">

      {/* ================================================== */}
      {/* PATIENT */}
      {/* ================================================== */}

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {patient.name}
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                {patient.age} Years • {patient.gender} • Blood:{' '}
                {patient.bloodGroup} • +91 {patient.phone}
              </p>
            </div>

            <Link to="/doctor/referrals">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
              >
                <GitBranch className="h-3.5 w-3.5" />
                Send to Hospital
              </Button>
            </Link>

          </div>

        </CardContent>
      </Card>


      {/* ================================================== */}
      {/* MAIN AREA */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ================================================== */}
        {/* LEFT SIDE */}
        {/* ================================================== */}

        <div className="lg:col-span-7">

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as typeof activeTab)
            }
          >

            {/* TABS */}

            <TabsList className="grid grid-cols-4 w-full bg-slate-100">

              <TabsTrigger value="OVERVIEW">
                Old Records
              </TabsTrigger>

              <TabsTrigger value="VITALS">
                Health Check
              </TabsTrigger>

              <TabsTrigger value="PAST_PRESCRIPTIONS">
                Medicines
              </TabsTrigger>

              <TabsTrigger value="LABS">
                Tests
              </TabsTrigger>

            </TabsList>


            {/* ================================================== */}
            {/* OLD RECORDS */}
            {/* ================================================== */}

            <TabsContent
              value="OVERVIEW"
              className="space-y-3 pt-3"
            >

              {/* Health Info */}

              <Card className="border-slate-200">

                <CardContent className="p-4">

                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Health Info
                  </h3>

                  <div className="space-y-3">

                    <div className="rounded-lg bg-slate-50 p-3">

                      <p className="text-[11px] text-slate-500">
                        Health Problems
                      </p>

                      <p className="text-sm text-slate-800 mt-1">
                        {patient.chronicConditions?.join(', ')}
                      </p>

                    </div>


                    <div className="rounded-lg bg-rose-50 p-3">

                      <p className="text-[11px] text-rose-600">
                        Allergies
                      </p>

                      <p className="text-sm text-rose-700 mt-1">
                        {patient.allergies?.join(', ')}
                      </p>

                    </div>

                  </div>

                </CardContent>

              </Card>


              {/* Old Records */}

              <div className="space-y-2">

                {patient.timeline.map((event) => (
                  <Card
                    key={event.id}
                    className="border-slate-200"
                  >

                    <CardContent className="p-3.5">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="text-sm font-semibold text-slate-900">
                            {event.title}
                          </h3>

                          <p className="text-xs text-slate-600 mt-1">
                            {event.summary}
                          </p>

                        </div>

                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatDate(event.date)}
                        </span>

                      </div>

                    </CardContent>

                  </Card>
                ))}

              </div>

            </TabsContent>


            {/* ================================================== */}
            {/* HEALTH CHECK */}
            {/* ================================================== */}

            <TabsContent
              value="VITALS"
              className="pt-3"
            >

              <Card className="border-slate-200">

                <CardContent className="p-4">

                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Health Check
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                    {/* BP */}

                    <div className="rounded-lg bg-slate-50 p-3">

                      <p className="text-[11px] text-slate-500">
                        BP
                      </p>

                      <p className="text-base font-bold text-slate-900 mt-1">
                        128 / 82
                      </p>

                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        Good
                      </p>

                    </div>


                    {/* Pulse */}

                    <div className="rounded-lg bg-slate-50 p-3">

                      <p className="text-[11px] text-slate-500">
                        Pulse
                      </p>

                      <p className="text-base font-bold text-slate-900 mt-1">
                        74 bpm
                      </p>

                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Normal
                      </p>

                    </div>


                    {/* Sugar */}

                    <div className="rounded-lg bg-amber-50 p-3">

                      <p className="text-[11px] text-amber-700">
                        Sugar
                      </p>

                      <p className="text-base font-bold text-amber-700 mt-1">
                        148 mg/dL
                      </p>

                      <p className="text-[10px] text-amber-700 mt-0.5">
                        High
                      </p>

                    </div>

                  </div>

                </CardContent>

              </Card>

            </TabsContent>


            {/* ================================================== */}
            {/* MEDICINES */}
            {/* ================================================== */}

            <TabsContent
              value="PAST_PRESCRIPTIONS"
              className="space-y-2 pt-3"
            >

              {INITIAL_PRESCRIPTIONS.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="border-slate-200"
                >

                  <CardContent className="p-3.5">

                    <div className="flex items-center justify-between gap-2 mb-2">

                      <p className="text-sm font-semibold text-slate-900">
                        {prescription.diagnosisSummary}
                      </p>

                      <StatusBadge status={prescription.status} />

                    </div>

                    <div className="space-y-1">

                      {prescription.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-3 text-xs py-1"
                        >

                          <span className="text-slate-700">
                            {item.medicineName}
                          </span>

                          <span className="text-slate-500 whitespace-nowrap">
                            {item.frequency}
                          </span>

                        </div>
                      ))}

                    </div>

                  </CardContent>

                </Card>
              ))}

            </TabsContent>


            {/* ================================================== */}
            {/* TESTS */}
            {/* ================================================== */}

            <TabsContent
              value="LABS"
              className="space-y-2 pt-3"
            >

              {INITIAL_DIAGNOSTIC_ORDERS.map((lab) => (
                <Card
                  key={lab.id}
                  className="border-slate-200"
                >

                  <CardContent className="p-3.5">

                    <div className="flex items-center justify-between gap-2">

                      <p className="text-sm font-semibold text-slate-900">
                        {lab.testName}
                      </p>

                      <StatusBadge status={lab.status} />

                    </div>

                    {lab.resultSummary && (
                      <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                        {lab.resultSummary}
                      </p>
                    )}

                  </CardContent>

                </Card>
              ))}

            </TabsContent>

          </Tabs>

        </div>


        {/* ================================================== */}
        {/* RIGHT SIDE - TODAY */}
        {/* ================================================== */}

        <div className="lg:col-span-5">

          <Card className="border-slate-200">

            {/* Header */}

            <CardHeader className="border-b border-slate-200 bg-slate-50 px-4 py-3">

              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">

                <Stethoscope className="h-4 w-4 text-teal-700" />

                Today

              </CardTitle>

            </CardHeader>


            <CardContent className="p-4 space-y-4">

              {/* ================================================== */}
              {/* PROBLEM */}
              {/* ================================================== */}

              <div className="space-y-1.5">

                <label className="block text-xs font-semibold text-slate-700">
                  Problem
                </label>

                <textarea
                  rows={3}
                  value={chiefComplaint}
                  onChange={(event) =>
                    setChiefComplaint(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />

              </div>


              {/* ================================================== */}
              {/* CHECKUP NOTES */}
              {/* ================================================== */}

              <div className="space-y-1.5">

                <label className="block text-xs font-semibold text-slate-700">
                  Checkup Notes
                </label>

                <textarea
                  rows={3}
                  value={examNotes}
                  onChange={(event) =>
                    setExamNotes(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />

              </div>


              {/* ================================================== */}
              {/* PROBLEM FOUND */}
              {/* ================================================== */}

              <Input
                label="Problem Found"
                value={diagnosis}
                onChange={(event) =>
                  setDiagnosis(event.target.value)
                }
                required
              />


              {/* ================================================== */}
              {/* MEDICINES */}
              {/* ================================================== */}

              <div className="border-t border-slate-200 pt-4">

                <div className="flex items-center justify-between mb-2">

                  <h3 className="text-xs font-semibold text-slate-700">
                    Medicines
                  </h3>

                  <span className="text-[11px] text-slate-400">
                    {meds.length} added
                  </span>

                </div>


                {/* Current Medicines */}

                <div className="space-y-2">

                  {meds.map((medicine, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2.5"
                    >

                      <div className="min-w-0">

                        <p className="text-xs font-semibold text-slate-900">
                          {medicine.name}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {medicine.frequency}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveMed(index)
                        }
                        className="shrink-0 p-1 text-slate-400 hover:text-rose-600"
                        aria-label="Remove medicine"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                    </div>
                  ))}

                </div>


                {/* Add Medicine */}

                <div className="flex gap-2 mt-2">

                  <input
                    type="text"
                    placeholder="Medicine"
                    value={newMedName}
                    onChange={(event) =>
                      setNewMedName(event.target.value)
                    }
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />

                  <input
                    type="text"
                    placeholder="Dose"
                    value={newMedDosage}
                    onChange={(event) =>
                      setNewMedDosage(event.target.value)
                    }
                    className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />

                  <Button
                    type="button"
                    onClick={handleAddMed}
                    variant="secondary"
                    size="sm"
                    className="px-2.5"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                </div>

              </div>


              {/* ================================================== */}
              {/* BUTTONS */}
              {/* ================================================== */}

              <div className="border-t border-slate-200 pt-4">

                {isCompleted ? (

                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">

                    <CheckCircle2 className="h-4 w-4 shrink-0" />

                    Visit Done

                  </div>

                ) : (

                  <div className="flex gap-2">

                    <Button
                      onClick={handleCompleteEncounter}
                      variant="primary"
                      size="md"
                      className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Finish Visit
                    </Button>

                    <Link
                      to="/doctor/referrals"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full text-xs gap-1.5"
                      >
                        <GitBranch className="h-4 w-4" />
                        Send
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