import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { INITIAL_ASHA_PATIENTS } from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import { Link } from 'react-router-dom';
import { AlertOctagon, Phone, User, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

export const HighRiskPatients: React.FC = () => {
  const highRiskPatients = INITIAL_ASHA_PATIENTS.filter((p) => p.isHighRisk);

  return (
    <div className="space-y-6">
      <PageHeader
        title="High-Risk Patient Register"
        subtitle="Priority triage register for severe maternal hypertension, gestational diabetes, severe anemia, and acute NCD cases."
        breadcrumbs={[{ label: 'ASHA Dashboard', to: '/asha' }, { label: 'High-Risk Register' }]}
      />

      <div className="space-y-4">
        {highRiskPatients.map((patient) => (
          <Card key={patient.id} className="border-rose-300 bg-white shadow-sm overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-rose-600 animate-pulse" />
                <h3 className="font-bold text-base text-rose-950">{patient.name}</h3>
                <span className="rounded-full bg-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-900">
                  {patient.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-rose-800 font-medium">
                Village: {patient.village} • Age: {patient.age} Yrs
              </span>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Risk Reasons Callout */}
              <div className="rounded-xl bg-rose-50/60 p-3.5 border border-rose-200 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 block">
                  Clinical Red Flags Raised
                </span>
                <ul className="list-disc pl-4 text-xs text-rose-950 font-semibold space-y-0.5">
                  {patient.highRiskReasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Contact & Next Follow-up info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block">Emergency Contact:</span>
                  <span className="font-semibold text-slate-800">{patient.emergencyContactName}</span> (+91 {patient.emergencyContactPhone})
                </div>
                <div>
                  <span className="text-slate-400 block">Next Follow-up Due:</span>
                  <span className="font-bold text-teal-800">{formatDate(patient.nextFollowUpDate)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <a
                  href={`tel:${patient.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  <Phone className="h-4 w-4 text-slate-500" />
                  Call Citizen
                </a>

                <div className="flex gap-2">
                  <Link to="/asha/vitals">
                    <Button variant="outline" size="sm" className="text-xs min-h-[44px]">
                      Update Vitals
                    </Button>
                  </Link>
                  <Link to="/asha/screening">
                    <Button variant="primary" size="sm" className="text-xs min-h-[44px] bg-emerald-700 hover:bg-emerald-800">
                      Re-Screen Citizen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
