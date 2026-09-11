import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { referralApi } from '@/api/referralApi';
import { Referral } from '@/types/referral';
import { ReferralCoordinationModal } from './components/ReferralCoordinationModal';
import {
  ArrowRight,
  ArrowLeftRight,
  Clock,
  BedDouble,
  CheckCircle2,
  Hospital,
  UserCheck,
  Search,
  RefreshCw,
} from 'lucide-react';

export const ReferralOperationsPage: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const res = await referralApi.getAll();
      if (res.data) setReferrals(res.data);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleConfirmArrival = async (refId: string, patientName: string) => {
    try {
      await referralApi.confirmArrival(refId);
      setReferrals((prev) =>
        prev.map((r) => (r.id === refId ? { ...r, status: 'PATIENT_ARRIVED' } : r))
      );
      setToastMsg(`Arrival confirmed for ${patientName}. Handed over to Casualty Triage.`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Failed to confirm arrival:', err);
    }
  };

  // Filter based on Inbound vs Outbound relative to 'fac_civil_01'
  const filteredReferrals = referrals.filter((r) => {
    const isCivilHospital = r.toFacilityId === 'fac_civil_01' || r.toFacilityName.toLowerCase().includes('civil hospital');
    const matchesDirection = direction === 'INBOUND' ? isCivilHospital : !isCivilHospital;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fromFacilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.toSpecialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDirection && matchesStatus && matchesSearch;
  });

  const inboundPendingCount = referrals.filter(
    (r) => (r.toFacilityId === 'fac_civil_01' || r.toFacilityName.toLowerCase().includes('civil')) && r.status === 'CREATED'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notice */}
      {toastMsg && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs font-semibold text-teal-900 flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-teal-700 font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Inter-Facility Transfers
            </span>
            <span className="text-xs text-slate-400">Gandhinagar District Hospital Network</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Referral & Transfer Coordination</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate inbound high-acuity patient arrivals, allocate ICU/HDU bed holds, and track outbound super-specialty transfers.
          </p>
        </div>

        <Button
          onClick={loadReferrals}
          variant="outline"
          className="self-start sm:self-center border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-2 min-h-[40px] cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          Refresh Transfers
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Inbound Pending Intake</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{inboundPendingCount}</p>
          <span className="text-xs text-slate-400">Awaiting admission authorization</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active En-Route Transits</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {referrals.filter((r) => r.status === 'ACCEPTED').length}
          </p>
          <span className="text-xs text-teal-700 font-semibold">Ambulances assigned with GPS hold</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">SLA Compliance Rate</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">96.4%</p>
          <span className="text-xs text-slate-400">Transfers accepted within 15 min target</span>
        </Card>
      </div>

      {/* Transfer Direction Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setDirection('INBOUND')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              direction === 'INBOUND'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Inbound to Civil Hospital ({referrals.filter((r) => r.toFacilityId === 'fac_civil_01' || r.toFacilityName.toLowerCase().includes('civil')).length})
          </button>
          <button
            onClick={() => setDirection('OUTBOUND')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              direction === 'OUTBOUND'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Outbound Transfers ({referrals.filter((r) => r.toFacilityId !== 'fac_civil_01' && !r.toFacilityName.toLowerCase().includes('civil')).length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1">
            {[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending Intake', value: 'CREATED' },
              { label: 'En Route', value: 'ACCEPTED' },
              { label: 'Arrived', value: 'PATIENT_ARRIVED' },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => setStatusFilter(st.value)}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === st.value
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, referral #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading transfer manifests...</div>
      ) : filteredReferrals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <Hospital className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No transfers found in this view</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All patient referrals are cleared or accounted for.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReferrals.map((ref) => {
            const isEmergency = ref.priority === 'EMERGENCY';
            const isUrgent = ref.priority === 'URGENT';
            const isPending = ref.status === 'CREATED';
            const isAccepted = ref.status === 'ACCEPTED';
            const isArrived = ref.status === 'PATIENT_ARRIVED';

            return (
              <Card
                key={ref.id}
                className={`p-4 border transition-all hover:shadow-xs ${
                  isPending
                    ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/20'
                    : isEmergency
                    ? 'border-rose-200'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Patient Details & Origin/Dest */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {ref.referralCode}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isEmergency
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ref.priority} PRIORITY
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-indigo-100 text-indigo-800'
                            : isAccepted
                            ? 'bg-teal-100 text-teal-800'
                            : isArrived
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ref.status.replace(/_/g, ' ')}
                      </span>
                      {ref.requiredIcu && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <BedDouble className="h-3 w-3" /> ICU Bed Required
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {ref.patientName}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({ref.patientAge}y • {ref.patientGender})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        Target Specialty: <span className="font-bold text-slate-900">{ref.toSpecialty}</span> • Origin: <span className="text-teal-700 font-semibold">{ref.fromFacilityName}</span> (Ref by {ref.fromDoctorName})
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        Reason: {ref.reasonForReferral}
                      </p>
                    </div>

                    {ref.appointmentSlot && (
                      <div className="text-xs text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 inline-block font-semibold">
                        Assigned Ward / Bed: {ref.appointmentSlot}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions and Timeline */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      SLA Target: {new Date(ref.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Button
                          onClick={() => setSelectedReferral(ref)}
                          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 h-9 px-3.5 cursor-pointer shadow-xs"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Coordinate Intake
                        </Button>
                      )}

                      {isAccepted && (
                        <Button
                          onClick={() => handleConfirmArrival(ref.id, ref.patientName)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 h-9 px-3.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirm Arrival
                        </Button>
                      )}

                      <Button
                        onClick={() => setSelectedReferral(ref)}
                        variant="outline"
                        className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 h-9 px-3 cursor-pointer"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Coordination Modal */}
      <ReferralCoordinationModal
        open={!!selectedReferral}
        onOpenChange={(open) => !open && setSelectedReferral(null)}
        referral={selectedReferral}
        onReferralUpdated={(updated) => {
          setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setToastMsg(`Transfer ${updated.referralCode} updated to ${updated.status}.`);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />
    </div>
  );
};