import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { operationsApi } from '@/api/operationsApi';
import { DoctorLeave } from '@/types/admin';
import { LeaveReviewModal } from './components/LeaveReviewModal';
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  ShieldAlert,
  Users,
  FileEdit,
  Building2,
  Stethoscope,
  Filter,
  Eye,
  CalendarX,
  Phone,
} from 'lucide-react';

export const StaffLeaveOperationsPage: React.FC = () => {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedLeave, setSelectedLeave] = useState<DoctorLeave | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeFacility] = useState<{ id: string; name: string }>({
    id: 'fac_civil_01',
    name: 'Civil Hospital Gandhinagar',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await operationsApi.getLeaves(activeFacility.id);
      if (res.success && res.data) {
        setLeaves(res.data);
      }
    } catch (err) {
      console.error('Failed to load facility leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [activeFacility.id]);

  // Today string for active leave checks
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute operational KPIs
  const kpis = useMemo(() => {
    const pending = leaves.filter((l) => l.status === 'PENDING').length;
    const changes = leaves.filter((l) => l.status === 'CHANGES_REQUIRED').length;
    const activeToday = leaves.filter(
      (l) => l.status === 'APPROVED' && l.startDate <= todayStr && l.endDate >= todayStr
    ).length;
    const criticalGaps = leaves.filter(
      (l) => (l.status === 'PENDING' || l.status === 'APPROVED') && l.serviceCoverageImpact === 'CRITICAL_GAP'
    ).length;
    const totalAffectedAppts = leaves.reduce((acc, curr) => {
      if (curr.status === 'PENDING' || curr.status === 'APPROVED') {
        return acc + (curr.affectedAppointmentsCount || 0);
      }
      return acc;
    }, 0);

    return {
      pending,
      changes,
      activeToday,
      criticalGaps,
      totalAffectedAppts,
    };
  }, [leaves, todayStr]);

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    leaves.forEach((l) => {
      if (l.department) set.add(l.department);
    });
    return Array.from(set);
  }, [leaves]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      // Status tab filter
      if (statusFilter === 'PENDING' && l.status !== 'PENDING') return false;
      if (statusFilter === 'CHANGES_REQUIRED' && l.status !== 'CHANGES_REQUIRED') return false;
      if (statusFilter === 'APPROVED' && l.status !== 'APPROVED') return false;
      if (statusFilter === 'CRITICAL_GAPS' && l.serviceCoverageImpact !== 'CRITICAL_GAP') return false;

      // Department filter
      if (departmentFilter !== 'ALL' && l.department !== departmentFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = l.doctorName.toLowerCase().includes(query);
        const matchesDept = (l.department || '').toLowerCase().includes(query);
        const matchesReason = (l.reason || '').toLowerCase().includes(query);
        const matchesId = l.id.toLowerCase().includes(query);
        return matchesName || matchesDept || matchesReason || matchesId;
      }

      return true;
    });
  }, [leaves, statusFilter, departmentFilter, searchQuery]);

  const handleOpenReview = (leave: DoctorLeave) => {
    setSelectedLeave(leave);
    setReviewModalOpen(true);
  };

  const handleReviewComplete = () => {
    loadLeaves();
    showToast('Facility leave & service coverage roster updated successfully.');
  };

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

  const getDurationDays = (s: string, e: string) => {
    try {
      const start = new Date(s).getTime();
      const end = new Date(e).getTime();
      const diff = Math.round((end - start) / (1000 * 3600 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header & Facility Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Facility Operations
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {activeFacility.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Staff Leave, Availability & Service Coverage
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Review incoming doctor & clinical cadre leave applications, analyze real-time departmental specialist coverage, and prevent service disruption across outpatient queues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLeaves}
            disabled={loading}
            className="text-xs h-9 px-3 gap-1.5 border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-600'}`} />
            Refresh Roster
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 cursor-pointer transition-all border ${
            statusFilter === 'PENDING'
              ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/40'
              : 'border-slate-200 bg-white hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {kpis.pending}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Require operational review
          </div>
        </Card>

        <Card
          onClick={() => setStatusFilter('CHANGES_REQUIRED')}
          className={`p-4 cursor-pointer transition-all border ${
            statusFilter === 'CHANGES_REQUIRED'
              ? 'border-purple-400 ring-2 ring-purple-100 bg-purple-50/40'
              : 'border-slate-200 bg-white hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Changes Requested</span>
            <FileEdit className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">
            {kpis.changes}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Awaiting doctor clarification
          </div>
        </Card>

        <Card
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 cursor-pointer transition-all border ${
            statusFilter === 'APPROVED'
              ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/40'
              : 'border-slate-200 bg-white hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Today</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {kpis.activeToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Staff off duty right now
          </div>
        </Card>

        <Card
          onClick={() => setStatusFilter('CRITICAL_GAPS')}
          className={`p-4 cursor-pointer transition-all border ${
            statusFilter === 'CRITICAL_GAPS'
              ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/40'
              : 'border-slate-200 bg-white hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Critical Coverage Gaps</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            {kpis.criticalGaps}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            0 specialists remaining
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Affected Appointments</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {kpis.totalAffectedAppts}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Patients needing reschedule
          </div>
        </Card>
      </div>

      {/* Critical Gap Warning Banner if any */}
      {kpis.criticalGaps > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-rose-900">
              Departmental Service Disruption Risk Detected ({kpis.criticalGaps} request(s))
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              At least one active or pending leave request leaves a critical department (e.g. Cardiology) with <strong>zero remaining doctors</strong> on duty. The system has automatically flagged this to the District Capacity Grid and will degrade departmental OPD booking slots upon confirmation unless alternate specialist handover is arranged.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Requests', count: leaves.length },
            { id: 'PENDING', label: 'Pending Review', count: kpis.pending },
            { id: 'CHANGES_REQUIRED', label: 'Changes Requested', count: kpis.changes },
            { id: 'APPROVED', label: 'Approved', count: leaves.filter((l) => l.status === 'APPROVED').length },
            { id: 'CRITICAL_GAPS', label: 'Coverage Gaps', count: kpis.criticalGaps },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Department Dropdown */}
        <div className="flex items-center gap-2">
          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor, specialty, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Leave Requests Table / Cards */}
      <Card className="border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">Doctor / Staff Cadre</th>
                <th className="p-3.5">Leave Interval</th>
                <th className="p-3.5">Category & Reason</th>
                <th className="p-3.5">Handover Doctor</th>
                <th className="p-3.5">Service Impact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading staff leave rosters and service impact telemetry...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <CalendarX className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-700">No leave requests found</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Try clearing search filters or selecting another status tab.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const duration = getDurationDays(leave.startDate, leave.endDate);
                  const isCriticalGap = leave.serviceCoverageImpact === 'CRITICAL_GAP';
                  const isLimited = leave.serviceCoverageImpact === 'LIMITED';

                  return (
                    <tr
                      key={leave.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Doctor Info */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {leave.doctorName
                              .replace('Dr. ', '')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              {leave.doctorName}
                              {leave.doctorId === 'usr_doc_01' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  HOD
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {leave.department || 'Cardiology'} • {leave.facilityName || activeFacility.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Interval */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">
                          {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {duration} {duration === 1 ? 'Day' : 'Days'}
                        </div>
                      </td>

                      {/* Category & Reason */}
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wide">
                            {leave.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 truncate" title={leave.reason}>
                          {leave.reason}
                        </div>
                      </td>

                      {/* Handover Doctor */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">
                          {leave.handoverDoctorName || 'Dr. Meena Parmar'}
                        </div>
                        {leave.emergencyContact && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            {leave.emergencyContact}
                          </div>
                        )}
                      </td>

                      {/* Operational Impact */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {isCriticalGap ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Critical Gap (0 Remaining)
                            </span>
                          ) : isLimited ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Limited (1 Remaining)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Sufficient Coverage
                            </span>
                          )}

                          {leave.affectedAppointmentsCount !== undefined && leave.affectedAppointmentsCount > 0 && (
                            <div className="text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit">
                              {leave.affectedAppointmentsCount} appts affected
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {leave.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {leave.status === 'CHANGES_REQUIRED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            <FileEdit className="w-3 h-3" />
                            Changes Needed
                          </span>
                        )}
                        {leave.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {leave.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {leave.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <CalendarX className="w-3 h-3" />
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 pr-5 text-right">
                        <Button
                          size="sm"
                          variant={leave.status === 'PENDING' ? 'primary' : 'outline'}
                          className={`text-xs h-8 px-3 gap-1 ${
                            leave.status === 'PENDING'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                          onClick={() => handleOpenReview(leave)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {leave.status === 'PENDING' ? 'Review & Decide' : 'View Details'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Leave Review & Operational Decision Modal */}
      <LeaveReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        leave={selectedLeave}
        onActionComplete={handleReviewComplete}
      />
    </div>
  );
};
