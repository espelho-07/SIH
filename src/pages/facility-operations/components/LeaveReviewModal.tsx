import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { DoctorLeave } from '@/types/admin';
import { StaffLeaveOperationalImpact } from '@/types/operations';
import { operationsApi } from '@/api/operationsApi';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle,
  Phone,
  ShieldAlert,
  Users,
  ArrowRight,
  FileEdit,
  Loader2,
  CalendarX,
  Stethoscope,
  Building2,
} from 'lucide-react';

interface LeaveReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: DoctorLeave | null;
  onActionComplete: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  open,
  onOpenChange,
  leave,
  onActionComplete,
}) => {
  const [impact, setImpact] = useState<StaffLeaveOperationalImpact | null>(null);
  const [loadingImpact, setLoadingImpact] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'NONE' | 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'>('NONE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesNote, setChangesNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time operational impact whenever a leave is opened
  useEffect(() => {
    if (!open || !leave) {
      setImpact(null);
      setActionType('NONE');
      setRejectionReason('');
      setChangesNote('');
      setError(null);
      return;
    }

    let isMounted = true;
    setLoadingImpact(true);
    setError(null);

    operationsApi
      .getLeaveImpact(leave.doctorId, leave.startDate, leave.endDate, leave.facilityId || 'fac_civil_01')
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setImpact(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch leave operational impact', err);
      })
      .finally(() => {
        if (isMounted) setLoadingImpact(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, leave]);

  if (!leave) return null;

  // Formatting helpers
  const formatDate = (dStr: string) => {
    try {
      const dt = new Date(dStr);
      return dt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  const getDayCount = (start: string, end: string) => {
    try {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      const diff = Math.round((e - s) / (1000 * 3600 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const daysCount = getDayCount(leave.startDate, leave.endDate);

  // Submit Approval
  const handleApprove = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await operationsApi.approveLeave(leave.id, 'Facility Operations Coordinator');
      if (res.success) {
        onActionComplete();
        onOpenChange(false);
      } else {
        setError(res.message || 'Failed to approve leave request.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while approving leave.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Rejection
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a mandatory justification for rejecting this leave request.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await operationsApi.rejectLeave(
        leave.id,
        rejectionReason.trim(),
        'Facility Operations Coordinator'
      );
      if (res.success) {
        onActionComplete();
        onOpenChange(false);
      } else {
        setError(res.message || 'Failed to reject leave request.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while rejecting leave.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Request Changes
  const handleRequestChanges = async () => {
    if (!changesNote.trim() || changesNote.trim().length < 8) {
      setError('Please provide specific instructions/clarification for the doctor (at least 8 characters).');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await operationsApi.requestChanges(
        leave.id,
        changesNote.trim(),
        'Facility Operations Coordinator'
      );
      if (res.success) {
        onActionComplete();
        onOpenChange(false);
      } else {
        setError(res.message || 'Failed to request changes.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while requesting changes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-slate-200 shadow-2xl rounded-2xl bg-white">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                  {leave.category} LEAVE
                </span>
                {leave.status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3" />
                    Pending Operations Review
                  </span>
                )}
                {leave.status === 'CHANGES_REQUIRED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    <FileEdit className="w-3 h-3" />
                    Changes Requested
                  </span>
                )}
                {leave.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved & Active
                  </span>
                )}
                {leave.status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3 h-3" />
                    Rejected
                  </span>
                )}
                {leave.status === 'CANCELLED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <CalendarX className="w-3 h-3" />
                    Cancelled / Withdrawn
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Leave Request & Service Impact Review
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Reference ID: <span className="font-mono font-medium text-slate-700">{leave.id}</span> • Applied on {formatDate(leave.createdAt)}
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-800">
                {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {daysCount} {daysCount === 1 ? 'Day' : 'Days'} Duration
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Staff Cadre & Handover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                Staff Member Details
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{leave.doctorName}</div>
                <div className="text-xs text-slate-600 font-medium">
                  {leave.department || 'Cardiology'} • {leave.facilityName || 'Civil Hospital Gandhinagar'}
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Emergency Phone:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {leave.emergencyContact || '9876505678'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Handover Doctor:</span>
                  <span className="font-semibold text-emerald-800">
                    {leave.handoverDoctorName || 'Dr. Meena Parmar'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-blue-600" />
                Reason & Context
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Stated Reason:</div>
                <div className="text-sm font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/70">
                  {leave.reason || 'Annual medical conference and CME credits'}
                </div>
              </div>
              {leave.notes && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Doctor's Handover Notes:</div>
                  <div className="text-xs text-slate-600 italic">"{leave.notes}"</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Real Operational Impact Analysis */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  Real-Time Operational Impact & Service Coverage
                </h4>
              </div>
              {loadingImpact ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  Simulating facility coverage...
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live Telemetry
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Coverage Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-medium">Dept Specialists</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {impact ? impact.totalDoctorsInDepartment : 1}
                  </div>
                  <div className="text-[10px] text-slate-400">Total in {leave.department || 'Cardiology'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-medium">Remaining on Duty</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      (impact?.availableDoctorsDuringPeriod ?? 0) === 0
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {impact ? impact.availableDoctorsDuringPeriod : 0}
                  </div>
                  <div className="text-[10px] text-slate-400">After approval</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-medium">Affected Appts</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      ((impact?.affectedAppointments?.length ?? 0) > 0 || (leave.affectedAppointmentsCount || 0) > 0)
                        ? 'text-amber-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {impact ? impact.affectedAppointments.length : leave.affectedAppointmentsCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Require rescheduling</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-medium">Active Queue Load</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {impact ? impact.affectedQueuesCount : 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Current tokens</div>
                </div>
              </div>

              {/* Service Impact Alert Banner */}
              {impact?.coverageStatus === 'CRITICAL_GAP' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                      Critical Service Coverage Risk (Zero Specialists Remaining)
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      {leave.department || 'Cardiology'} will have <strong>0 active doctors</strong> at {leave.facilityName || 'Civil Hospital Gandhinagar'}. Approving this leave will automatically degrade the department's operational service status to <strong>DEGRADED</strong> and notify the District Operations Dashboard.
                    </p>
                  </div>
                </div>
              )}

              {impact?.coverageStatus === 'LIMITED' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-amber-900">
                      Limited Departmental Coverage (1 Doctor Remaining)
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Department capacity will operate at reduced throughput. OPD wait times may increase.
                    </p>
                  </div>
                </div>
              )}

              {/* Alternate Coverage Specialists */}
              {impact && impact.alternateDoctors && impact.alternateDoctors.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                  <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Available Alternate Specialists on Duty During Period:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {impact.alternateDoctors.map((altDoc, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded font-medium shadow-xs"
                      >
                        {altDoc.name} ({altDoc.specialty})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Affected Patient Appointments */}
          {impact && impact.affectedAppointments && impact.affectedAppointments.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Impacted Patient Appointments ({impact.affectedAppointments.length})
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  Priority Rescheduling Handshake Activated
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {impact.affectedAppointments.map((apt: any) => (
                  <div key={apt.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <div className="text-slate-500 text-[11px]">
                        Appointment: {formatDate(apt.date)} • {apt.timeSlot} • {apt.type || 'OPD Consult'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Needs Reschedule
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{apt.patientPhone || 'Registered Mobile'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History / Previous Review Logs */}
          {(leave.changesRequestedNote || leave.rejectionReason || leave.reviewedBy) && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
              <div className="font-semibold text-slate-700">Audit & Review Record:</div>
              {leave.reviewedBy && (
                <div className="text-slate-600">
                  Reviewed by: <span className="font-medium text-slate-800">{leave.reviewedBy}</span>
                  {leave.reviewedAt && <span> on {formatDate(leave.reviewedAt)}</span>}
                </div>
              )}
              {leave.changesRequestedNote && (
                <div className="text-purple-800 bg-purple-50 p-2 rounded border border-purple-200">
                  <strong>Clarification Requested:</strong> {leave.changesRequestedNote}
                </div>
              )}
              {leave.rejectionReason && (
                <div className="text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                  <strong>Rejection Justification:</strong> {leave.rejectionReason}
                </div>
              )}
            </div>
          )}

          {/* Decision Workflow Form (Interactive Controls) */}
          {(leave.status === 'PENDING' || leave.status === 'CHANGES_REQUIRED') && (
            <div className="pt-2 border-t border-slate-200 space-y-4">
              {actionType === 'NONE' && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    Choose Facility Operations action for this leave request:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs h-9 px-3"
                      onClick={() => setActionType('REJECT')}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs h-9 px-3"
                      onClick={() => setActionType('REQUEST_CHANGES')}
                    >
                      <FileEdit className="w-3.5 h-3.5 mr-1" />
                      Request Changes
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 font-semibold shadow-sm"
                      onClick={() => setActionType('APPROVE')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve Leave
                    </Button>
                  </div>
                </div>
              )}

              {/* Approve Form Confirmation */}
              {actionType === 'APPROVE' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Confirm Approval & Service Handshake
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    By approving, <strong>{leave.doctorName}</strong>'s duty roster will switch to <strong>ON LEAVE</strong> between {formatDate(leave.startDate)} and {formatDate(leave.endDate)}.
                    {impact && impact.affectedAppointments && impact.affectedAppointments.length > 0 && (
                      <span> <strong>{impact.affectedAppointments.length} patient appointment(s)</strong> will be marked for priority rescheduling with patient SMS alerts.</span>
                    )}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionType('NONE')}
                      disabled={submitting}
                      className="text-xs h-8"
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                      onClick={handleApprove}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          Updating Operations Grid...
                        </>
                      ) : (
                        'Confirm & Update Facility Grid'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Request Changes Form */}
              {actionType === 'REQUEST_CHANGES' && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                    <FileEdit className="w-4 h-4 text-purple-700" />
                    Request Adjustments or Clarification
                  </div>
                  <p className="text-xs text-purple-800">
                    Provide instructions to {leave.doctorName} (e.g. shift dates, arrange alternate specialist coverage, or reduce leave duration):
                  </p>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 text-xs rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="e.g. Cardiology OPD requires at least one specialist on duty on Monday. Please adjust start date to Tuesday or confirm peer handover with Dr. Meena Parmar."
                    value={changesNote}
                    onChange={(e) => setChangesNote(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionType('NONE')}
                      disabled={submitting}
                      className="text-xs h-8"
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 font-semibold"
                      onClick={handleRequestChanges}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          Sending Request...
                        </>
                      ) : (
                        'Send Clarification Request'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {actionType === 'REJECT' && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-900">
                    <XCircle className="w-4 h-4 text-rose-700" />
                    Reject Leave Application
                  </div>
                  <p className="text-xs text-rose-800">
                    State the mandatory operational or clinical justification for rejecting this request:
                  </p>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 text-xs rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    placeholder="e.g. Critical hospital bed occupancy and sole specialist status prevents leave authorization during emergency surge week."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionType('NONE')}
                      disabled={submitting}
                      className="text-xs h-8"
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 font-semibold"
                      onClick={handleReject}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          Rejecting...
                        </>
                      ) : (
                        'Confirm Rejection'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 px-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
