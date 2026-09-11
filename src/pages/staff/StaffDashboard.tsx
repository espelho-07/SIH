import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { StaffSubType } from '@/types/auth';
import {
  INITIAL_DIAGNOSTIC_ORDERS,
  INITIAL_BED_SUMMARY,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_AMBULANCES,
  INITIAL_MEDICINES,
  INITIAL_EQUIPMENT,
  INITIAL_LIVE_QUEUE,
} from '@/mock/mockData';
import { clinicalApi } from '@/api/clinicalApi';
import { resourceApi } from '@/api/resourceApi';
import { PharmacistDashboard } from '@/pages/pharmacist/PharmacistDashboard';
import {
  Building2,
  Ticket,
  Pill,
  FlaskConical,
  Bed,
  Droplet,
  Ambulance,
  Wrench,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user, staffSubType, quickSwitchRole } = useAuth();
  const activeSubType: StaffSubType = staffSubType || 'PHARMACIST';

  // State for Lab Technician
  const [labOrders, setLabOrders] = useState(INITIAL_DIAGNOSTIC_ORDERS);

  // State for Bed Operations
  const [bedSummary, setBedSummary] = useState(INITIAL_BED_SUMMARY);

  const handleCollectSample = async (orderId: string) => {
    await clinicalApi.collectSample(orderId);
    setLabOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'PROCESSING' } : o))
    );
  };

  const handleUpdateBeds = async (catType: string, delta: number) => {
    const cat = bedSummary.categories.find((c) => c.type === catType);
    if (!cat) return;
    const newAvail = Math.max(0, cat.available + delta);
    const updated = await resourceApi.updateBedStatus('fac_civil_01', catType, newAvail);
    setBedSummary({ ...updated.data });
  };

  return (
    <div className="space-y-6">
      {/* Staff Header & Dynamic Subtype Switcher */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Hospital Facility Staff Station • {user?.facilityName || 'Gandhinagar Civil Hospital'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
          <p className="text-xs text-slate-300">
            Department:{' '}
            <strong className="text-white">{activeSubType.replace(/_/g, ' ')}</strong> • Sector 12 Base
          </p>
        </div>

        {/* Subtype quick toggle */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-800 p-1.5 border border-slate-700">
          {(['REGISTRATION_CLERK', 'PHARMACIST', 'LAB_TECHNICIAN', 'FACILITY_OPERATIONS'] as StaffSubType[]).map((sub) => (
            <button
              key={sub}
              onClick={() => quickSwitchRole('FACILITY_STAFF', sub)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                activeSubType === sub
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {sub === 'REGISTRATION_CLERK' && 'Registration'}
              {sub === 'PHARMACIST' && 'Pharmacy'}
              {sub === 'LAB_TECHNICIAN' && 'Laboratory'}
              {sub === 'FACILITY_OPERATIONS' && 'Operations'}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REGISTRATION CLERK EXPERIENCE */}
      {/* ========================================================================= */}
      {activeSubType === 'REGISTRATION_CLERK' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Today's Registrations</span>
              <p className="text-3xl font-black text-slate-900 mt-1">214</p>
              <span className="text-[11px] text-teal-800 font-medium">New OPD cards</span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tokens Issued</span>
              <p className="text-3xl font-black text-teal-700 mt-1">182</p>
              <span className="text-[11px] text-slate-500">Across 6 clinics</span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Counters</span>
              <p className="text-3xl font-black text-slate-900 mt-1">4</p>
              <span className="text-[11px] text-emerald-700 font-semibold">Operational</span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Avg Token Issue Time</span>
              <p className="text-3xl font-black text-slate-900 mt-1">45s</p>
              <span className="text-[11px] text-slate-400">Barcode / ABHA fast track</span>
            </Card>
          </div>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Live Counter Queue Tokens</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Real-time OPD token distribution</p>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="divide-y divide-slate-100 text-xs">
                {INITIAL_LIVE_QUEUE.tokens.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-teal-800 bg-teal-50 px-2 py-1 rounded">
                        {t.tokenNumber}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{t.patientName}</span>
                        <span className="text-slate-500">
                          {t.patientAge}Y • Phone: +91 {t.patientPhone} • {t.departmentName}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PHARMACIST EXPERIENCE */}
      {/* ========================================================================= */}
      {activeSubType === 'PHARMACIST' && (
        <PharmacistDashboard />
      )}

      {/* ========================================================================= */}
      {/* 3. LAB TECHNICIAN EXPERIENCE */}
      {/* ========================================================================= */}
      {activeSubType === 'LAB_TECHNICIAN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pending Samples</span>
              <p className="text-3xl font-black text-amber-600 mt-1">1</p>
              <span className="text-[11px] text-amber-700">Phlebotomy due</span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Processing</span>
              <p className="text-3xl font-black text-sky-600 mt-1">1</p>
              <span className="text-[11px] text-slate-500">On automated analyzer</span>
            </Card>

            <Card className="p-4 border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Completed Today</span>
              <p className="text-3xl font-black text-emerald-700 mt-1">42</p>
              <span className="text-[11px] text-emerald-800 font-medium">Uploaded to EHR</span>
            </Card>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold">Diagnostic Lab Orders Workflow</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {labOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{ord.testName}</span>
                      <StatusBadge status={ord.status} />
                    </div>
                    <p className="text-slate-500">
                      Patient: <strong>{ord.patientName}</strong> ({ord.patientAge}Y / {ord.patientGender}) • Ordered by {ord.orderedBy}
                    </p>
                    {ord.resultSummary && (
                      <p className="font-mono text-slate-800 bg-slate-50 p-1.5 rounded border mt-1">
                        {ord.resultSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status === 'SAMPLE_COLLECTED' && (
                      <Button
                        onClick={() => handleCollectSample(ord.id)}
                        variant="primary"
                        size="sm"
                        className="text-xs bg-teal-700 hover:bg-teal-800"
                      >
                        Process on Analyzer
                      </Button>
                    )}
                    {ord.status === 'COMPLETED' && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified & Pushed to EHR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FACILITY OPERATIONS (Beds, Equipment, Blood, Ambulances) */}
      {/* ========================================================================= */}
      {activeSubType === 'FACILITY_OPERATIONS' && (
        <div className="space-y-6">
          {/* Bed Inventory Editor */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Hospital Bed Capacity Management</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update vacant bed counters in real time to inform referral algorithms
                </p>
              </div>
              <span className="text-xs text-slate-400">Total: {bedSummary.totalBeds} Beds</span>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {bedSummary.categories.map((cat) => (
                  <div key={cat.type} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-500">{cat.type}</span>
                    <p className="text-2xl font-black text-slate-900">{cat.available} Free</p>
                    <span className="text-[10px] text-slate-400 block">Total: {cat.total} beds</span>
                    <div className="flex justify-center gap-2 pt-2">
                      <Button
                        onClick={() => handleUpdateBeds(cat.type, -1)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 font-black"
                      >
                        -
                      </Button>
                      <Button
                        onClick={() => handleUpdateBeds(cat.type, 1)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 font-black"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blood & Ambulance Fleet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Bank */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-red-600" />
                  <span>Blood Units Inventory</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {INITIAL_BLOOD_INVENTORY.stock.map((b) => (
                    <div key={b.bloodGroup} className="p-2.5 rounded-xl border bg-slate-50">
                      <span className="font-extrabold text-red-700 block">{b.bloodGroup}</span>
                      <span className="text-lg font-bold text-slate-900">{b.unitsAvailable}</span>
                      <span className="text-[10px] text-slate-400 block">{b.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ambulance Fleet */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Ambulance className="h-5 w-5 text-teal-700" />
                  <span>Ambulance Fleet Telemetry</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {INITIAL_AMBULANCES.map((amb) => (
                  <div
                    key={amb.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">{amb.vehicleNumber}</span>
                      <span className="text-slate-500">
                        {amb.type.replace(/_/g, ' ')} • Driver: {amb.driverName}
                      </span>
                    </div>
                    <StatusBadge status={amb.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
