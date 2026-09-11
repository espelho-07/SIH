import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PriorityBadge } from '@/components/ui/Badge';
import { facilityApi } from '@/api/facilityApi';
import { referralApi } from '@/api/referralApi';
import { FacilityMatchResult } from '@/types/facility';
import { ReferralPriority } from '@/types/referral';
import { GitBranch, CheckCircle2, ArrowRight, ArrowLeft, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export const ReferralCreationWizard: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState('Uncontrolled nocturnal chest tightness and exercise-induced palpitations');
  const [summary, setClinicalSummary] = useState('ECG reveals non-specific T-wave inversions in leads V4-V6. Requires 2D Echo.');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [urgency, setUrgency] = useState<ReferralPriority>('URGENT');
  const [requiresIcu, setRequiresIcu] = useState(false);

  const [matchedFacilities, setMatchedFacilities] = useState<FacilityMatchResult[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityMatchResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdRefCode, setCreatedRefCode] = useState('');

  const handleMatchFacilities = async () => {
    setIsMatching(true);
    try {
      const res = await facilityApi.matchFacilities({
        patientId: 'usr_pat_01',
        clinicalReason: reason,
        specialty,
        urgency,
        requiresIcu,
      });
      setMatchedFacilities(res.data);
      if (res.data.length > 0) {
        setSelectedFacility(res.data[0]);
      }
      setStep(2);
    } finally {
      setIsMatching(false);
    }
  };

  const handleSubmitReferral = async () => {
    if (!selectedFacility) return;
    try {
      const res = await referralApi.create({
        patientId: 'usr_pat_01',
        toFacilityId: selectedFacility.facility.id,
        toSpecialty: specialty,
        reasonForReferral: reason,
        clinicalSummary: summary,
        priority: urgency,
        requiredIcu: requiresIcu,
      });
      setCreatedRefCode(res.data.referralCode);
      setIsSubmitted(true);
    } catch (e) {
      console.error('Failed to create referral', e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Smart Clinical Referral Wizard"
        subtitle="Algorithmic multi-criteria facility matching powered by real-time specialist availability, vacant beds, and equipment."
        breadcrumbs={[{ label: 'Doctor Dashboard', to: '/doctor' }, { label: 'Create Referral' }]}
      />

      {isSubmitted ? (
        <Card className="border-emerald-200 bg-white p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Clinical Referral Dispatched!</h2>
          <p className="text-sm text-slate-600">
            Referral Code: <strong className="text-teal-800 text-base">{createdRefCode}</strong> has been transmitted
            to the receiving tertiary hospital triage desk.
          </p>

          <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 max-w-md mx-auto text-left text-xs space-y-1.5">
            <p className="font-bold text-teal-950">Destination: {selectedFacility?.facility.name}</p>
            <p className="text-teal-800">Specialty Department: {specialty}</p>
            <p className="text-teal-800">Suitability Match Score: {selectedFacility?.suitabilityScore}%</p>
            <p className="text-teal-700">48-Hour SLA Tracking target initiated.</p>
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={() => {
                setStep(1);
                setIsSubmitted(false);
              }}
              variant="primary"
              className="bg-teal-700 hover:bg-teal-800"
            >
              Create Another Referral
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white shadow-md">
          {/* Step Progress */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70 text-xs">
            <span className={`font-bold ${step === 1 ? 'text-teal-800' : 'text-slate-400'}`}>
              1. Clinical Requirements
            </span>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <span className={`font-bold ${step === 2 ? 'text-teal-800' : 'text-slate-400'}`}>
              2. Algorithmic Matching
            </span>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <span className={`font-bold ${step === 3 ? 'text-teal-800' : 'text-slate-400'}`}>
              3. Review & Dispatch
            </span>
          </div>

          <CardContent className="p-6 sm:p-8">
            {/* STEP 1: Clinical Requirements */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Required Specialty
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics & Trauma</option>
                      <option value="Pediatrics">Pediatrics & Neonatology</option>
                      <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Clinical Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as ReferralPriority)}
                      className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="ROUTINE">Routine (Elective review)</option>
                      <option value="URGENT">Urgent (48-hour window)</option>
                      <option value="EMERGENCY">Emergency (Immediate transfer)</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Primary Clinical Reason for Referral"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />

                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Clinical Summary & Diagnostic Findings
                  </label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setClinicalSummary(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900"
                    required
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="icuCheck"
                    checked={requiresIcu}
                    onChange={(e) => setRequiresIcu(e.target.checked)}
                    className="h-4 w-4 rounded text-teal-700"
                  />
                  <label htmlFor="icuCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Requires Immediate ICU / High-Dependency Unit Bed Allocation
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleMatchFacilities}
                    variant="primary"
                    size="lg"
                    className="bg-teal-700 hover:bg-teal-800 gap-1.5 min-h-[44px]"
                    isLoading={isMatching}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Match & Rank Facilities</span>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Algorithmic Multi-Criteria Facility Match Results */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">
                    Ranked Facilities ({matchedFacilities.length} Matches Found)
                  </h3>
                  <span className="text-xs text-slate-500">Ranked by Clinical Suitability Algorithm</span>
                </div>

                <div className="space-y-3">
                  {matchedFacilities.map((result) => {
                    const isSelected = selectedFacility?.facility.id === result.facility.id;
                    return (
                      <div
                        key={result.facility.id}
                        onClick={() => setSelectedFacility(result)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{result.facility.name}</h4>
                              <span className="text-xs text-slate-500">
                                ({result.distanceKm} km • ~{result.estimatedTransitTimeMins} mins transit)
                              </span>
                            </div>
                          </div>

                          {/* Suitability Score Pill */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-teal-800">Suitability Match:</span>
                            <span className="rounded-full bg-teal-700 px-3 py-0.5 text-xs font-black text-white">
                              {result.suitabilityScore}%
                            </span>
                          </div>
                        </div>

                        {/* Match Criteria Points */}
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="space-y-1">
                            <span className="text-slate-500">Specialist Availability:</span>
                            <span className="font-bold text-emerald-700 ml-1">
                              ● {result.specialistAvailability.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500">Bed Status:</span>
                            <span className="font-bold text-slate-800 ml-1">
                              {result.facility.availableBeds} General / {result.facility.icuBedsAvailable} ICU Free
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] text-teal-900 bg-teal-100/60 p-2 rounded-lg">
                          <strong>Match Rationale: </strong>
                          {result.matchReasons.join('; ')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={() => setStep(1)} variant="secondary">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    variant="primary"
                    disabled={!selectedFacility}
                    className="bg-teal-700 hover:bg-teal-800 gap-1.5"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Dispatch */}
            {step === 3 && selectedFacility && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">Review Referral Dispatch</h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Destination Facility:</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedFacility.facility.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block font-semibold">Specialty:</span>
                      <span className="font-bold text-slate-800">{specialty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Urgency / Priority:</span>
                      <PriorityBadge priority={urgency} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold">Clinical Reason:</span>
                    <p className="text-slate-700">{reason}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={() => setStep(2)} variant="secondary">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmitReferral}
                    variant="primary"
                    size="lg"
                    className="bg-teal-700 hover:bg-teal-800 font-bold"
                  >
                    Dispatch Clinical Referral
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
