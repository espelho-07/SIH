import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/BottomSheet';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_REFERRALS } from '@/mock/mockData';
import { Referral } from '@/types/referral';
import {
  GitBranch,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
} from 'lucide-react';

export const ReferralMonitor: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fromFacilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.toFacilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.toSpecialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalReferrals = referrals.length;
  const emergencyCount = referrals.filter((r) => r.priority === 'EMERGENCY').length;
  const pendingCount = referrals.filter((r) => r.status === 'CREATED').length;
  const breachedCount = referrals.filter((r) => r.slaBreached).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Referrals"
        subtitle={`Track patient transfers, acceptance status, and SLA compliance across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Referrals' },
        ]}
      />

      {/* 3 Decision-Driving KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Referrals</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <GitBranch className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalReferrals}</p>
          <span className="text-[11px] text-teal-700 font-medium">Active in {selectedDistrict} network</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Emergency Transfers</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{emergencyCount}</p>
          <span className="text-[11px] text-rose-700 font-medium">Critical bed allocation required</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Acceptance</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">{breachedCount} transfer near SLA window limit</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, patient name, hospital, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="EMERGENCY">Emergency (Red)</option>
              <option value="URGENT">Urgent (Amber)</option>
              <option value="ROUTINE">Routine (Normal)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {['ALL', 'CREATED', 'ACCEPTED', 'PATIENT_ARRIVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Transfers' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Referrals List Table */}
      <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
        {filteredReferrals.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GitBranch className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No referrals found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Referral Code</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Transfer Route</th>
                  <th className="py-2.5 px-3">Specialty</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.referralCode}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{r.patientName}</span>
                      <span className="text-[11px] text-slate-400">
                        {r.patientAge}Y • {r.patientGender}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-600 block">{r.fromFacilityName}</span>
                      <span className="font-bold text-teal-800 flex items-center gap-1">
                        → {r.toFacilityName}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{r.toSpecialty}</td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReferral(r)}
                        className="text-xs font-semibold"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Referral Detail Drawer */}
      <Drawer
        open={!!selectedReferral}
        onOpenChange={(open) => !open && setSelectedReferral(null)}
        title={selectedReferral ? `Referral: ${selectedReferral.referralCode}` : ''}
      >
        {selectedReferral && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedReferral.patientName}</span>
                <PriorityBadge priority={selectedReferral.priority} />
              </div>
              <p className="text-slate-500">
                Age: {selectedReferral.patientAge} | Phone: {selectedReferral.patientPhone}
              </p>
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                <span className="font-semibold block">Transfer Reason:</span>
                <p className="mt-0.5">{selectedReferral.reasonForReferral}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Originating Facility</span>
                <span className="font-bold text-slate-900 mt-1 block">{selectedReferral.fromFacilityName}</span>
                <span className="text-slate-500 text-[11px]">Referred by: {selectedReferral.fromDoctorName}</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-teal-800 block text-[10px] font-bold uppercase">Destination Facility</span>
                <span className="font-bold text-teal-950 mt-1 block">{selectedReferral.toFacilityName}</span>
                <span className="text-teal-700 text-[11px]">Specialty: {selectedReferral.toSpecialty}</span>
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="p-3 rounded-xl bg-slate-50 border space-y-1">
              <span className="font-bold text-slate-700 block">Clinical Summary & Vitals:</span>
              <p className="text-slate-600 leading-relaxed">{selectedReferral.clinicalSummary}</p>
            </div>

            {/* Events Timeline */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block">Transfer Audit History:</span>
              <div className="space-y-2">
                {selectedReferral.events.map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-slate-50 border text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{ev.status.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400 font-normal">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-500">{ev.actorName} ({ev.facilityName})</p>
                    {ev.notes && <p className="text-slate-600 italic">"{ev.notes}"</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReferral(null)}
                className="flex-1 text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert('Priority escalation dispatched to receiving CMO.');
                  setSelectedReferral(null);
                }}
                className="flex-1 text-xs bg-teal-700 hover:bg-teal-800 text-white font-semibold"
              >
                Escalate / Nudge Facility
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
