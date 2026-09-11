import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/common/DataTable';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { INITIAL_REFERRALS } from '@/mock/mockData';
import { Referral } from '@/types/referral';
import { formatDate } from '@/lib/formatters';
import { GitBranch, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ReferralMonitor: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredReferrals = referrals.filter(
    (r) => statusFilter === 'ALL' || r.status === statusFilter
  );

  const columns: Column<Referral>[] = [
    {
      key: 'referralCode',
      header: 'Code',
      render: (r) => <span className="font-mono font-bold text-xs text-slate-900">{r.referralCode}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.patientName}</span>
          <span className="text-[11px] text-slate-500">
            {r.patientAge}Y • {r.toSpecialty}
          </span>
        </div>
      ),
    },
    {
      key: 'fromFacilityName',
      header: 'Origin & Destination',
      render: (r) => (
        <div className="text-xs">
          <span className="text-slate-600 block">{r.fromFacilityName}</span>
          <span className="font-bold text-teal-800">→ {r.toFacilityName}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (r) => <PriorityBadge priority={r.priority} />,
    },
    {
      key: 'slaBreached',
      header: 'SLA Window',
      render: (r) => (
        <span
          className={`text-xs font-semibold ${
            r.slaBreached ? 'text-rose-600 font-bold' : 'text-emerald-700'
          }`}
        >
          {r.slaBreached ? '⚠️ SLA Breached' : 'Within 48h Target'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Referral Continuity Monitor"
        subtitle="Tracking closed-loop referral transfers, SLA compliance, and cross-facility triage resolution."
        breadcrumbs={[{ label: 'District Admin', to: '/district' }, { label: 'Referrals' }]}
      />

      <div className="flex gap-2 pb-1">
        {['ALL', 'CREATED', 'ACCEPTED', 'PATIENT_ARRIVED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === st
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredReferrals}
        keyExtractor={(r) => r.id}
        renderMobileCard={(r) => (
          <Card className="p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-slate-900">{r.referralCode}</span>
              <PriorityBadge priority={r.priority} />
            </div>
            <p className="font-bold text-slate-800">{r.patientName} ({r.toSpecialty})</p>
            <p className="text-slate-500">{r.fromFacilityName} → {r.toFacilityName}</p>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-emerald-700 font-semibold">48h SLA Target</span>
              <StatusBadge status={r.status} />
            </div>
          </Card>
        )}
      />
    </div>
  );
};
