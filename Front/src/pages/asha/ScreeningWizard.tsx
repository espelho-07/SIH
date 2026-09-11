import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { saveOfflineScreening } from '@/lib/db';
import { useConnection } from '@/contexts/ConnectionContext';
import { ScreeningCategory, ScreeningSession } from '@/types/asha';
import { INITIAL_ASHA_PATIENTS } from '@/mock/mockData';
import { ClipboardList, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  riskIfYes: boolean;
}

const SCREENING_QUESTIONS: Record<ScreeningCategory, Question[]> = {
  MATERNAL: [
    { id: 'm1', text: 'Is the pregnant mother experiencing severe swelling in feet, hands or face?', riskIfYes: true },
    { id: 'm2', text: 'Does she complain of persistent severe headache or blurred vision?', riskIfYes: true },
    { id: 'm3', text: 'Has there been any vaginal bleeding or fluid leakage?', riskIfYes: true },
    { id: 'm4', text: 'Are daily fetal kicks / movements regular (more than 10 per 12 hours)?', riskIfYes: false },
  ],
  CHILD: [
    { id: 'c1', text: 'Has the child missed any routine UIP immunization vaccines?', riskIfYes: true },
    { id: 'c2', text: 'Is the child showing signs of chest indrawing or rapid breathing?', riskIfYes: true },
    { id: 'c3', text: 'Does the MUAC (Mid-Upper Arm Circumference) tape indicate Yellow or Red?', riskIfYes: true },
    { id: 'c4', text: 'Is the child feeding and drinking fluids actively?', riskIfYes: false },
  ],
  NCD: [
    { id: 'n1', text: 'Does the citizen experience chronic chest discomfort, tightness or shortness of breath?', riskIfYes: true },
    { id: 'n2', text: 'Is there excessive thirst, frequent nighttime urination, or unexplained weight loss?', riskIfYes: true },
    { id: 'n3', text: 'Does the citizen have any non-healing foot sores, ulcers or numbness?', riskIfYes: true },
    { id: 'n4', text: 'Does the citizen have a family history of early stroke or heart attack?', riskIfYes: true },
  ],
  GENERAL: [
    { id: 'g1', text: 'Has there been persistent cough for more than 2 weeks with evening fever?', riskIfYes: true },
    { id: 'g2', text: 'Is there sudden onset high fever with chills or retro-orbital eye pain?', riskIfYes: true },
    { id: 'g3', text: 'Are there any unexplained lumps or patches on skin with sensory loss?', riskIfYes: true },
  ],
};

export const ScreeningWizard: React.FC = () => {
  const { refreshPendingCount } = useConnection();

  const [category, setCategory] = useState<ScreeningCategory>('NCD');
  const [selectedPatientId, setSelectedPatientId] = useState(INITIAL_ASHA_PATIENTS[0].id);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const questions = SCREENING_QUESTIONS[category];

  const handleToggleAnswer = (questionId: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const calculateRiskSummary = () => {
    const flags: string[] = [];
    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns !== undefined && userAns === q.riskIfYes) {
        flags.push(q.text);
      }
    });

    const score = flags.length >= 2 ? 'HIGH' : flags.length === 1 ? 'MODERATE' : 'LOW';
    const action =
      score === 'HIGH'
        ? 'Priority Medical Officer Referral to PHC within 24–48 hours for diagnostic evaluation.'
        : score === 'MODERATE'
        ? 'Schedule repeat field visit in 7 days & encourage dietary lifestyle modification.'
        : 'Routine community monitoring. No immediate referral indicated.';

    return { flags, score, action };
  };

  const handleFinishScreening = async () => {
    setIsLoading(true);
    try {
      const { flags, score, action } = calculateRiskSummary();
      const session: ScreeningSession = {
        id: `scr_${Date.now()}`,
        patientId: selectedPatientId,
        patientName: INITIAL_ASHA_PATIENTS.find((p) => p.id === selectedPatientId)?.name || 'Citizen',
        category,
        conductedBy: 'Sunita Devi (ASHA)',
        conductedAt: new Date().toISOString(),
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: qId,
          questionText: questions.find((q) => q.id === qId)?.text || qId,
          answer: ans,
        })),
        riskFlags: flags,
        riskScore: score as 'LOW' | 'MODERATE' | 'HIGH',
        recommendedNextAction: action,
        clinicianVerificationRequired: true,
        synced: false,
      };

      await saveOfflineScreening(session);
      await refreshPendingCount();
      setIsCompleted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = calculateRiskSummary();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Community Health Screening"
        subtitle="Questionnaire tool for early NCD detection, maternal danger signs, and child health tracking."
        breadcrumbs={[{ label: 'ASHA Dashboard', to: '/asha' }, { label: 'Screening' }]}
      />

      {isCompleted ? (
        <Card className="border-emerald-200 bg-white p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Screening Summary Generated</h2>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Evaluated Risk Score</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  summary.score === 'HIGH'
                    ? 'bg-rose-100 text-rose-800'
                    : summary.score === 'MODERATE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {summary.score} RISK
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-800 pt-1">Recommended Action:</p>
            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              {summary.action}
            </p>

            <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Requires clinician verification. Not an autonomous medical diagnosis.</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              onClick={() => {
                setAnswers({});
                setIsCompleted(false);
              }}
              variant="primary"
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              Start New Screening
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Patient Selection */}
          <Card className="p-4 border-slate-200 bg-white">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Select Citizen
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-semibold"
            >
              {INITIAL_ASHA_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}Y, {p.village})
                </option>
              ))}
            </select>
          </Card>

          {/* Category Tabs */}
          <Tabs value={category} onValueChange={(val) => setCategory(val as ScreeningCategory)}>
            <TabsList className="grid grid-cols-4 max-w-full">
              <TabsTrigger value="MATERNAL">Maternal</TabsTrigger>
              <TabsTrigger value="CHILD">Child UIP</TabsTrigger>
              <TabsTrigger value="NCD">NCDs</TabsTrigger>
              <TabsTrigger value="GENERAL">General</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Questions with large Yes/No controls */}
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const currentAns = answers[q.id];
              return (
                <Card key={q.id} className="p-4 sm:p-5 border-slate-200 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{q.text}</p>
                  </div>

                  {/* Large Touch-friendly Yes / No Buttons (Min 44px) */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer(q.id, true)}
                      className={`py-3 rounded-xl border font-bold text-sm min-h-[48px] transition-all flex items-center justify-center ${
                        currentAns === true
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      YES
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAnswer(q.id, false)}
                      className={`py-3 rounded-xl border font-bold text-sm min-h-[48px] transition-all flex items-center justify-center ${
                        currentAns === false
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            onClick={handleFinishScreening}
            variant="primary"
            size="lg"
            className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold min-h-[48px]"
            isLoading={isLoading}
          >
            Generate Screening Assessment
          </Button>
        </div>
      )}
    </div>
  );
};
