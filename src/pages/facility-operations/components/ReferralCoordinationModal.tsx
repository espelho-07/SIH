import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Referral } from '@/types/referral';
import { referralApi } from '@/api/referralApi';
import { BedDouble, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ReferralCoordinationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referral: Referral | null;
  onReferralUpdated: (updated: Referral) => void;
}

export const ReferralCoordinationModal: React.FC<ReferralCoordinationModalProps> = ({
  open,
  onOpenChange,
  referral,
  onReferralUpdated,
}) => {
  const [mode, setMode] = useState<'VIEW' | 'ACCEPT' | 'DIVERT'>('VIEW');
  const [assignedWard, setAssignedWard] = useState('Acute Emergency Bay 3');
  const [etaWindow, setEtaWindow] = useState('Immediate / In Transit');
  const [diversionReason, setDiversionReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (referral) {
      setMode('VIEW');
      setAssignedWard('Acute Emergency Bay 3');
      setEtaWindow('Immediate / In Transit');
      setDiversionReason('');
      setError(null);
    }
  }, [referral]);

  if (!referral) return null;

  const handleAccept = async () => {
    try {
      setSaving(true);
      setError(null);
      const slot = `${assignedWard} (${etaWindow})`;
      const res = await referralApi.accept(referral.id, slot);
      if (res.data) {
        onReferralUpdated(res.data);
      }
      onOpenChange(false);
      setMode('VIEW');
    } catch (err: any) {
      console.error('Failed to accept transfer:', err);
      setError(err?.message || 'Failed to accept transfer referral.');
    } finally {
      setSaving(false);
    }
  };

  const handleDivert = async () => {
    if (!diversionReason.trim()) {
      setError('Please provide a specific clinical or bed capacity reason for diverting this transfer.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await referralApi.reject(referral.id, diversionReason.trim());
      if (res.data) {
        onReferralUpdated(res.data);
      }
      onOpenChange(false);
      setMode('VIEW');
    } catch (err: any) {
      console.error('Failed to divert transfer:', err);
      setError(err?.message || 'Failed to divert transfer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="xl">
      <div>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                referral.priority === 'EMERGENCY'
                  ? 'bg-rose-100 text-rose-800'
                  : referral.priority === 'URGENT'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}>
                {referral.priority} TRANSFER
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">{referral.referralCode}</span>
            </div>
          </div>
          <DialogTitle className="mt-1">Inbound Referral Coordination</DialogTitle>
          <DialogDescription>
            Triage transfer request originating from {referral.fromFacilityName}.
          </DialogDescription>
        </DialogHeader>

        <DialogContent className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient & Clinical Summary Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{referral.patientName}</h4>
                <p className="text-xs text-slate-500">
                  {referral.patientAge}y • {referral.patientGender} • Phone: {referral.patientPhone}
                </p>
                {referral.abhaId && (
                  <p className="text-[11px] text-teal-700 font-mono mt-0.5">ABHA: {referral.abhaId}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">{referral.toSpecialty}</span>
                <span className="text-[11px] text-slate-400">Target Specialty</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Clinical Reason for Referral
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {referral.reasonForReferral}
              </p>
              {referral.clinicalSummary && (
                <p className="text-xs text-slate-600 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                  {referral.clinicalSummary}
                </p>
              )}
            </div>

            {/* Constraints */}
            <div className="flex flex-wrap gap-2 pt-1">
              {referral.requiredIcu && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  <BedDouble className="h-3 w-3" /> ICU Bed Required
                </span>
              )}
              {referral.requiredEquipment?.map((eq, i) => (
                <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {eq}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 ml-auto">
                <Clock className="h-3 w-3" /> SLA: {new Date(referral.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Action Modes */}
          {mode === 'VIEW' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('ACCEPT')}
                className="p-3.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100/70 text-teal-900 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                Accept & Reserve Bed
              </button>
              <button
                type="button"
                onClick={() => setMode('DIVERT')}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100/70 text-rose-900 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer shadow-xs"
              >
                <XCircle className="h-4 w-4 text-rose-700" />
                Divert / Reroute
              </button>
            </div>
          )}

          {mode === 'ACCEPT' && (
            <div className="space-y-3 p-3.5 rounded-xl border border-teal-200 bg-teal-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" /> Accept Inbound Patient
                </span>
                <button
                  type="button"
                  onClick={() => setMode('VIEW')}
                  className="text-[11px] text-teal-700 hover:underline font-semibold"
                >
                  Change Option
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Assigned Bed / Ward</label>
                  <input
                    type="text"
                    value={assignedWard}
                    onChange={(e) => setAssignedWard(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Expected Inbound Window</label>
                  <input
                    type="text"
                    value={etaWindow}
                    onChange={(e) => setEtaWindow(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              <p className="text-[11px] text-teal-800">
                Authorizing acceptance will confirm intake reservation with {referral.fromFacilityName} and update ambulance telemetry.
              </p>
            </div>
          )}

          {mode === 'DIVERT' && (
            <div className="space-y-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-rose-700" /> Divert Patient to Alternate Facility
                </span>
                <button
                  type="button"
                  onClick={() => setMode('VIEW')}
                  className="text-[11px] text-rose-700 hover:underline font-semibold"
                >
                  Change Option
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Clinical / Capacity Diversion Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={diversionReason}
                  onChange={(e) => setDiversionReason(e.target.value)}
                  placeholder="e.g., ICU beds at 100% capacity; redirect to GMERS Medical College Dharpur-Patan."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {['ICU beds at 100% capacity', 'CT Scanner under emergency calibration', 'Ventilator inventory depleted'].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDiversionReason(chip)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800 font-medium cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>

          {mode === 'ACCEPT' && (
            <Button
              type="button"
              onClick={handleAccept}
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-2 min-h-[40px] px-4 cursor-pointer"
            >
              {saving ? 'Confirming...' : 'Confirm Acceptance & Bed Hold'}
            </Button>
          )}

          {mode === 'DIVERT' && (
            <Button
              type="button"
              onClick={handleDivert}
              disabled={saving || !diversionReason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2 min-h-[40px] px-4 cursor-pointer"
            >
              {saving ? 'Transmitting...' : 'Issue Diversion Order'}
            </Button>
          )}
        </DialogFooter>
      </div>
    </Dialog>
  );
};