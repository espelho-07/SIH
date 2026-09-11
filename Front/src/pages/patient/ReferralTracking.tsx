import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { INITIAL_REFERRALS } from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const ReferralTracking: React.FC = () => {
  const referrals = INITIAL_REFERRALS;

  const lifecycleStages = [
    { key: 'CREATED', label: '1. Referral Created' },
    { key: 'ACCEPTED', label: '2. Accepted by Specialist' },
    { key: 'APPOINTMENT_CONFIRMED', label: '3. Slot Confirmed' },
    { key: 'PATIENT_ARRIVED', label: '4. Patient Arrived' },
    { key: 'CONSULTED', label: '5. Consulted' },
    { key: 'OUTCOME_RECORDED', label: '6. Outcome Recorded' },
    { key: 'CLOSED', label: '7. Closed' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Closed-Loop Clinical Referrals"
        subtitle="End-to-end referral continuity tracking between primary health centres and tertiary hospitals."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Referrals' }]}
      />

      <div className="space-y-6">
        {referrals.map((referral) => (
          <Card key={referral.id} className="border-teal-200 bg-white shadow-md overflow-hidden">
            {/* Referral Header */}
            <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{referral.referralCode}</h2>
                  <PriorityBadge priority={referral.priority} />
                  <StatusBadge status={referral.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Initiated by {referral.fromDoctorName} ({referral.fromFacilityName}) • Created on {formatDate(referral.createdAt)}
                </p>
              </div>

              {/* SLA Countdown Timer */}
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-right">
                <span className="text-[10px] uppercase font-bold text-teal-800 block">SLA Resolution Target</span>
                <span className="text-sm font-bold text-teal-950 font-mono">
                  {referral.slaBreached ? 'SLA Breached' : 'Within 48h SLA Window'}
                </span>
              </div>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Visual 7-Stage Stepper Lifecycle */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Referral Lifecycle Progression
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                  {lifecycleStages.map((stage, idx) => {
                    const isCompleted = referral.events.some((e) => e.status === stage.key) || referral.status === stage.key;
                    return (
                      <div
                        key={stage.key}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCompleted
                            ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400 font-normal'
                        }`}
                      >
                        <span className="text-[10px] block font-bold">{idx + 1}</span>
                        <span className="text-xs leading-tight">{stage.label.split('. ')[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Context & Destination Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Stethoscope className="h-4 w-4 text-teal-700" />
                    <span>Clinical Referral Rationale</span>
                  </div>
                  <p className="font-semibold text-slate-900">{referral.reasonForReferral}</p>
                  <p className="text-slate-600 leading-relaxed">{referral.clinicalSummary}</p>
                  {referral.requiredEquipment && (
                    <div className="pt-2 flex items-center gap-1 text-slate-500">
                      <span>Required Equipment:</span>
                      <strong className="text-slate-700">{referral.requiredEquipment.join(', ')}</strong>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-teal-50/50 p-4 border border-teal-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-teal-900 text-sm">
                    <Building2 className="h-4 w-4 text-teal-700" />
                    <span>Destination Hospital & Specialty</span>
                  </div>
                  <p className="font-bold text-slate-900 text-base">{referral.toFacilityName}</p>
                  <p className="text-teal-800 font-semibold text-sm">Specialty: {referral.toSpecialty}</p>
                  <div className="pt-2 rounded-lg bg-white p-2.5 border border-teal-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmed OPD Slot</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {referral.appointmentSlot || 'Scheduling underway by receiving hospital triage'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Timeline Audit History */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Referral Audit Trail
                </span>
                <div className="divide-y divide-slate-100 text-xs">
                  {referral.events.map((ev) => (
                    <div key={ev.id} className="py-2 flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                        <span className="font-bold text-slate-800">{ev.status}</span>
                        <span>• {ev.facilityName} ({ev.actorName})</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{formatDate(ev.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
