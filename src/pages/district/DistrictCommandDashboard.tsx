import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationContext } from '@/contexts/LocationContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { EmergencyButton } from '@/components/emergency/EmergencyButton';
import {
  INITIAL_FACILITIES,
  INITIAL_AI_SUMMARY,
  INITIAL_REFERRALS,
  INITIAL_MEDICINES,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_AMBULANCES,
} from '@/mock/mockData';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  GitBranch,
  Bed,
  Droplet,
  Ambulance,
  AlertTriangle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Pill,
  Stethoscope,
  Ticket,
  AlertOctagon,
  Activity,
  Calendar,
} from 'lucide-react';

export const DistrictCommandDashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedDistrict } = useLocationContext();

  const facilities = INITIAL_FACILITIES;
  const referrals = INITIAL_REFERRALS;
  const outbreakAlert = INITIAL_AI_SUMMARY.outbreakAlerts[0];

  // Real operational counts
  const totalBedsAvailable = facilities.reduce((acc, f) => acc + f.availableBeds, 0);
  const totalBeds = facilities.reduce((acc, f) => acc + f.totalBeds, 0);
  const totalIcuAvailable = facilities.reduce((acc, f) => acc + f.icuBedsAvailable, 0);
  const activeAmbulances = INITIAL_AMBULANCES.filter((a) => a.status === 'AVAILABLE').length;
  const lowStockMedicines = INITIAL_MEDICINES.filter((m) => m.status === 'OUT_OF_STOCK' || m.status === 'LOW_STOCK').length;
  const pendingReferrals = referrals.filter((r) => r.status === 'CREATED' || r.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="District Overview"
        subtitle={`Real-time facilities, patient queues, referrals, and medical resources across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'HealthConnect', to: '/' },
          { label: 'District Admin', to: '/district' },
          { label: 'Overview' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/district/alerts">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <AlertOctagon className="h-4 w-4 text-amber-600" />
                <span>Alerts</span>
                <span className="ml-1 rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-bold">
                  3
                </span>
              </Button>
            </Link>
            <Link to="/district/map">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <MapPin className="h-4 w-4 text-teal-700" />
                <span>District Map</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Welcome & Operational Status Banner (Patient Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-teal-800 text-white p-6 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-200">
              District Health Operations
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-800/80 border border-teal-600 px-2 py-0.5 text-[10px] font-medium text-teal-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live Telemetry Connected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {selectedDistrict} District Operations
          </h1>
          <p className="text-xs text-teal-100/90">
            Administrator: <strong>{user?.name || 'Dr. Meenakshi Sundaram'}</strong> (Chief District Health Officer)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <EmergencyButton />
        </div>
      </div>

      {/* Primary District KPI Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Active Facilities"
          value={facilities.length.toString()}
          subtitle="Hospital & CHC network"
          icon={Building2}
          colorScheme="teal"
        />
        <StatCard
          title="Available Beds"
          value={`${totalBedsAvailable} / ${totalBeds}`}
          subtitle={`${totalIcuAvailable} ICU beds free`}
          icon={Bed}
          colorScheme="blue"
        />
        <StatCard
          title="Active Referrals"
          value={pendingReferrals.toString()}
          subtitle="In transfer window"
          icon={GitBranch}
          colorScheme="amber"
        />
        <StatCard
          title="Medicines Alert"
          value={lowStockMedicines.toString()}
          subtitle="Needs reorder"
          icon={Pill}
          colorScheme="rose"
        />
        <StatCard
          title="Blood Units"
          value={INITIAL_BLOOD_INVENTORY.totalUnits.toString()}
          subtitle="Across 8 blood banks"
          icon={Droplet}
          colorScheme="rose"
        />
        <StatCard
          title="Ambulances Ready"
          value={`${activeAmbulances} / ${INITIAL_AMBULANCES.length}`}
          subtitle="On call & available"
          icon={Ambulance}
          colorScheme="teal"
        />
      </div>

      {/* Quick Action Buttons (Patient Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/district/facilities">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-xs transition-all text-left group">
            <Building2 className="h-5 w-5 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Facilities</span>
            <span className="text-[10px] text-slate-500">Beds & Services</span>
          </Card>
        </Link>

        <Link to="/district/doctors">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-xs transition-all text-left group">
            <Stethoscope className="h-5 w-5 text-sky-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Doctors</span>
            <span className="text-[10px] text-slate-500">Specialist Duty</span>
          </Card>
        </Link>

        <Link to="/district/referrals">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-xs transition-all text-left group">
            <GitBranch className="h-5 w-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Referrals</span>
            <span className="text-[10px] text-slate-500">Track Transfers</span>
          </Card>
        </Link>

        <Link to="/district/operations">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-xs transition-all text-left group">
            <Ticket className="h-5 w-5 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Queues</span>
            <span className="text-[10px] text-slate-500">OPD Bottlenecks</span>
          </Card>
        </Link>

        <Link to="/district/resources">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-xs transition-all text-left group">
            <Activity className="h-5 w-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Resources</span>
            <span className="text-[10px] text-slate-500">Stock & Supplies</span>
          </Card>
        </Link>

        <Link to="/district/alerts">
          <Card className="p-3.5 hover:border-amber-400 hover:shadow-xs transition-all text-left group bg-amber-50/40">
            <AlertOctagon className="h-5 w-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Action Center</span>
            <span className="text-[10px] text-amber-700">3 Priority Alerts</span>
          </Card>
        </Link>
      </div>

      {/* Needs Attention Today Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Needs Attention Today
            </h2>
          </div>
          <Link to="/district/alerts" className="text-xs text-teal-700 font-semibold hover:underline">
            View All Alerts ({lowStockMedicines + 2}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1: Referral Bottleneck */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-amber-700" />
                Referral Awaiting Bed
              </span>
              <PriorityBadge priority="HIGH" />
            </div>
            <p className="text-slate-700 font-medium">
              Pethapur PHC → Gandhinagar Civil (Cardiology)
            </p>
            <p className="text-[11px] text-slate-500">
              Patient referral dispatched 1.5h ago. Inpatient bed allocation pending at destination.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-amber-800 font-semibold">SLA Window: 2.5h remaining</span>
              <Link to="/district/referrals" className="text-xs font-bold text-teal-800 hover:underline">
                Review →
              </Link>
            </div>
          </div>

          {/* Item 2: Low Stock Warning */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-rose-700" />
                Critical Medicine Stock
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                Low Supply
              </span>
            </div>
            <p className="text-slate-700 font-medium">
              Paracetamol Infusion 100ml (Mansa CHC)
            </p>
            <p className="text-[11px] text-slate-500">
              Current stock: 25 bottles (Threshold: 50). Supply expected to deplete in 48 hours.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-rose-800 font-semibold">Warehouse reorder needed</span>
              <Link to="/district/medicines" className="text-xs font-bold text-teal-800 hover:underline">
                Reorder →
              </Link>
            </div>
          </div>

          {/* Item 3: Public Health Watch */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-teal-700" />
                Public Health Surveillance
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                Watch Active
              </span>
            </div>
            <p className="text-slate-700 font-medium">
              Vector-Borne Case Clustering (Sector 24)
            </p>
            <p className="text-[11px] text-slate-500">
              Unusual case increase detected: 42 cases vs baseline 15. Field fogging verification underway.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Statistically flagged 18h ago</span>
              <Link to="/district/disease-trends" className="text-xs font-bold text-teal-800 hover:underline">
                View Trends →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operational Split: Facilities Grid & Active Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Facilities Table (2 cols) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                District Healthcare Facilities
              </CardTitle>
              <p className="text-xs text-slate-500">Operational readiness and bed capacity</p>
            </div>
            <Link to="/district/facilities" className="text-xs text-teal-700 font-semibold hover:underline">
              View All ({facilities.length}) →
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {facilities.slice(0, 4).map((facility) => {
                const occupancyRate = Math.round(
                  ((facility.totalBeds - facility.availableBeds) / facility.totalBeds) * 100
                );
                return (
                  <div
                    key={facility.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/district/facilities/${facility.id}`}
                          className="font-bold text-slate-900 hover:text-teal-700 transition-colors"
                        >
                          {facility.name}
                        </Link>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {facility.type.replace(/_/g, ' ')}
                        </span>
                        {facility.emergencyAvailable && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            24x7 Casualty
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{facility.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right shrink-0">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {facility.availableBeds} Free
                        </span>
                        <span className="text-[10px] text-slate-500">{occupancyRate}% occupied</span>
                      </div>

                      <div>
                        <span className="font-bold text-teal-800 block">
                          ~{facility.currentWaitTimeMinutes}m
                        </span>
                        <span className="text-[10px] text-slate-500">OPD Wait</span>
                      </div>

                      <Link to={`/district/facilities/${facility.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 px-2.5">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Referral Transfers (1 col) */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Active Referrals
              </CardTitle>
              <p className="text-xs text-slate-500">Live inter-facility transfers</p>
            </div>
            <Link to="/district/referrals" className="text-xs text-teal-700 font-semibold hover:underline">
              All ({referrals.length}) →
            </Link>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {referrals.slice(0, 3).map((ref) => (
              <div key={ref.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{ref.referralCode}</span>
                  <PriorityBadge priority={ref.priority} />
                </div>
                <p className="font-semibold text-slate-800 line-clamp-1">{ref.reasonForReferral}</p>
                <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                  <span className="truncate max-w-[150px]">{ref.fromFacilityName.split(' ')[0]} → {ref.toFacilityName.split(' ')[0]}</span>
                  <StatusBadge status={ref.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
