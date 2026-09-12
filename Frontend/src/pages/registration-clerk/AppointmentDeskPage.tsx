import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { registrationApi } from '@/api/registrationApi';
import { Appointment, Token } from '@/types/queue';
import { OpdTokenSlipModal } from './components/OpdTokenSlipModal';
import {
  CalendarCheck2,
  Search,
  Ticket,
  CheckCircle2,
  Clock,
  User,
  Filter,
  Printer,
  ChevronRight,
  Phone,
  Building2,
  X,
} from 'lucide-react';

export const AppointmentDeskPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED'>('ALL');

  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [activeSlipToken, setActiveSlipToken] = useState<Token | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await registrationApi.getAppointments({ date: '2026-03-14' });
      if (res.data) setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCheckIn = async (aptId: string) => {
    try {
      setCheckingInId(aptId);
      const res = await registrationApi.checkInAppointment(aptId);
      if (res.data) {
        // Update local appointment state
        setAppointments((prev) =>
          prev.map((a) => (a.id === aptId ? res.data!.appointment : a))
        );
        setActiveSlipToken(res.data.token);
        setSlipModalOpen(true);
        setActionNotice(
          `Checked in ${res.data.appointment.patientName}. Token ${res.data.token.tokenNumber} issued.`
        );
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch (err) {
      console.error('Check-in failed:', err);
      alert('Failed to check in appointment.');
    } finally {
      setCheckingInId(null);
    }
  };

  // Filter & Search Logic
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = a.patientName.toLowerCase().includes(q);
      const matchPhone = a.patientPhone.includes(q.replace(/\D/g, ''));
      const matchDoctor = a.doctorName.toLowerCase().includes(q);
      const matchSpecialty = a.specialty.toLowerCase().includes(q);
      return matchName || matchPhone || matchDoctor || matchSpecialty;
    }
    return true;
  });

  const pendingCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const checkedInCount = appointments.filter((a) => a.status === 'CHECKED_IN').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Notice Banner */}
      {actionNotice && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-xs font-semibold text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-teal-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/registration-clerk"
              className="text-xs font-semibold text-slate-500 hover:text-teal-700"
            >
              ? Front Desk
            </Link>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">Today's Appointment Desk</h1>
          <p className="text-xs text-slate-500">
            Check-in scheduled patients upon hospital arrival and issue OPD consultation tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            {pendingCount} Pending Check-Ins
          </span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by patient name, mobile, consulting doctor, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 h-12 text-xs bg-white border-slate-200 rounded-xl shadow-2xs font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {[
            { id: 'ALL', label: `All Appointments (${appointments.length})` },
            { id: 'CONFIRMED', label: `Pending Arrival (${pendingCount})` },
            { id: 'CHECKED_IN', label: `Checked In (${checkedInCount})` },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shrink-0 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Schedule List */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3.5 px-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Hospital OPD Schedule (Today, March 14, 2026)
            </span>
            <span className="text-slate-500 font-mono">
              Showing {filteredAppointments.length} of {appointments.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading today's appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No appointments found matching current filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Left: Time & Patient Identity */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Time Slot Badge */}
                    <div className="rounded-xl bg-teal-50 border border-teal-200 p-2 text-center min-w-[80px] shrink-0">
                      <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">Time</span>
                      <span className="font-mono font-black text-sm text-teal-950 block mt-0.5">
                        {apt.timeSlot}
                      </span>
                    </div>

                    {/* Patient & Clinic Info */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/registration-clerk/patients/${apt.patientId}`}
                          className="font-bold text-slate-900 text-sm hover:text-teal-800 transition-colors"
                        >
                          {apt.patientName}
                        </Link>
                        {apt.patientAge && (
                          <span className="text-slate-500 font-medium">
                            ({apt.patientAge}Y, {apt.patientGender === 'M' ? 'M' : 'F'})
                          </span>
                        )}
                        <StatusBadge status={apt.status} />
                      </div>

                      <p className="text-slate-600 font-medium text-xs">
                        Doctor: <span className="font-bold text-slate-800">{apt.doctorName}</span> �{' '}
                        <span className="text-teal-800 font-semibold">{apt.specialty}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="font-mono flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" /> +91 {apt.patientPhone}
                        </span>
                        <span>Reason: <span className="text-slate-700">{apt.reasonForVisit}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Check-In or Token Status */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {apt.status === 'CONFIRMED' ? (
                      <Button
                        onClick={() => handleCheckIn(apt.id)}
                        disabled={checkingInId === apt.id}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-1.5 h-9 px-4 cursor-pointer shadow-xs"
                      >
                        <Ticket className="h-4 w-4" />
                        {checkingInId === apt.id ? 'Checking In...' : 'Check In & Issue Token'}
                      </Button>
                    ) : apt.status === 'CHECKED_IN' ? (
                      <div className="flex items-center gap-2">
                        {apt.tokenNumber && (
                          <span className="font-mono font-black text-sm bg-teal-100/80 text-teal-900 px-2.5 py-1 rounded-lg border border-teal-200">
                            {apt.tokenNumber}
                          </span>
                        )}
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">Consultation Done</span>
                    )}

                    <Link to={`/registration-clerk/patients/${apt.patientId}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-teal-800 h-9">
                        Details <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* OPD Token Slip Modal */}
      <OpdTokenSlipModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        token={activeSlipToken}
      />
    </div>
  );
};
