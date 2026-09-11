import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { tokenApi } from '@/api/queueApi';
import { INITIAL_LIVE_QUEUE } from '@/mock/mockData';
import { Token } from '@/types/queue';
import {
  Ticket,
  Clock,
  Building2,
  RefreshCw,
  XCircle,
  BellRing,
  Navigation,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export const TokenExperience: React.FC = () => {
  const { user } = useAuth();
  const { simulateCallToken } = useSocket();

  const [token, setToken] = useState<Token>(
    INITIAL_LIVE_QUEUE.tokens.find((t) => t.patientId === 'usr_pat_01') || INITIAL_LIVE_QUEUE.tokens[3]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewTokenForm, setShowNewTokenForm] = useState(false);

  const [dept, setDept] = useState('dep_med');
  const [facilityId, setFacilityId] = useState('fac_civil_01');

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await tokenApi.generateToken({
        patientName: user?.name || 'Rameshwar Sharma',
        patientPhone: user?.phone || '9876543210',
        facilityId,
        departmentId: dept,
      });
      setToken(res.data);
      setShowNewTokenForm(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Live OPD Token Tracker"
        subtitle="Real-time public queue position, room assignment, and estimated waiting telemetry."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Token Experience' }]}
        actions={
          <Button
            onClick={() => setShowNewTokenForm(!showNewTokenForm)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Generate New Token</span>
          </Button>
        }
      />

      {/* Generate New Token Form Drawer / Card */}
      {showNewTokenForm && (
        <Card className="border-teal-300 bg-teal-50/40 p-5 animate-in fade-in-50 duration-200">
          <form onSubmit={handleGenerateToken} className="space-y-4">
            <h3 className="font-bold text-base text-teal-950">Book New OPD Token Counter</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Health Facility</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
                >
                  <option value="fac_civil_01">Gandhinagar Civil Hospital & Medical College</option>
                  <option value="fac_mansa_02">Mansa Community Health Centre (CHC)</option>
                  <option value="fac_kalol_03">Kalol Sub-District Hospital</option>
                  <option value="fac_pet_04">Pethapur Primary Health Centre (PHC)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Department Clinic</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
                >
                  <option value="dep_med">General Medicine OPD</option>
                  <option value="dep_card">Cardiology Special Clinic</option>
                  <option value="dep_ortho">Orthopedics & Trauma</option>
                  <option value="dep_ped">Pediatrics OPD</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" onClick={() => setShowNewTokenForm(false)} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isGenerating}>
                Confirm & Issue Token
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Token Visual Board */}
      <Card className="border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Token Header Banner */}
        <div className="bg-teal-800 text-white p-6 sm:p-8 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-200">
            Government of Gujarat • Electronic Token Grid
          </span>
          <h2 className="text-6xl sm:text-7xl font-black tracking-tight">{token.tokenNumber}</h2>
          <p className="text-sm font-medium text-teal-100">
            {token.patientName} • ABHA Linked
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <StatusBadge status={token.status} className="bg-teal-900/80 text-white border-teal-700 px-3 py-1" />
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Key Queue Telemetry Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Position</span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{token.positionInQueue}</p>
              <span className="text-[11px] text-slate-400">citizens waiting ahead</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Estimated Wait</span>
              <p className="text-3xl sm:text-4xl font-black text-amber-600 mt-1">
                {token.estimatedWaitMinutes} <span className="text-sm font-medium">min</span>
              </p>
              <span className="text-[11px] text-amber-700 font-medium">~6 min per consultation</span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Now Inside OPD</span>
              <p className="text-3xl sm:text-4xl font-black text-teal-700 mt-1">
                {INITIAL_LIVE_QUEUE.currentTokenNumber}
              </p>
              <span className="text-[11px] text-teal-800 font-medium">Room 4 (Dr. Arvind Patel)</span>
            </div>
          </div>

          {/* Real-time Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Token Generated</span>
              <span className="text-teal-700 font-bold">Consultation Pending</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full w-[65%]" />
            </div>
          </div>

          {/* Facility & Location Info */}
          <div className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Building2 className="h-4 w-4 text-teal-700" />
                <span>{token.facilityName}</span>
              </div>
              <p className="text-slate-500">{token.departmentName} • Room 4 Counter Desk</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Navigation className="h-4 w-4" />
                Directions
              </a>
              <Button
                onClick={() => simulateCallToken(token)}
                variant="primary"
                size="sm"
                className="gap-1.5 bg-teal-700 hover:bg-teal-800"
              >
                <BellRing className="h-4 w-4" />
                Simulate Call Alert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
