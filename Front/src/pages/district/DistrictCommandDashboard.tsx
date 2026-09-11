import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/common/StatCard';
import { ChartCard } from '@/components/common/ChartCard';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/map/MapView';
import { INITIAL_FACILITIES, INITIAL_AI_SUMMARY, INITIAL_REFERRALS } from '@/mock/mockData';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  GitBranch,
  Bed,
  Droplet,
  Ambulance,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const DistrictCommandDashboard: React.FC = () => {
  const aiData = INITIAL_AI_SUMMARY;
  const outbreakAlert = aiData.outbreakAlerts[0];
  const dengueTrend = aiData.diseaseForecasts[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Public Health Command Center"
        subtitle="Gandhinagar District Integrated Healthcare Governance & Real-time Resource Grid"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/district/map">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <MapPin className="h-4 w-4 text-teal-700" />
                <span>Open GIS Map</span>
              </Button>
            </Link>
            <Link to="/district/ai">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-indigo-700 hover:bg-indigo-800 text-white">
                <BrainCircuit className="h-4 w-4" />
                <span>AI Demand Intelligence</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Outbreak Early Warning Banner (Section 14 & 41 safety language: "Unusual increase detected - Not confirmed outbreak") */}
      {outbreakAlert && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-amber-500 p-2.5 text-white shadow-xs">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider bg-amber-200 px-2.5 py-0.5 rounded-full text-amber-900">
                  Early Warning Surveillance
                </span>
                <span className="text-xs text-amber-800 font-medium">Detected 18h ago</span>
              </div>
              <h3 className="text-base font-bold text-amber-950">
                Unusual Increase Detected: {outbreakAlert.diseaseName} ({outbreakAlert.affectedBlock})
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                Observed cases: <strong>{outbreakAlert.observedCases}</strong> vs baseline threshold{' '}
                <strong>{outbreakAlert.expectedThreshold}</strong> (+2.8 Std Dev). Requires epidemiologic field verification. Not a confirmed outbreak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/district/disease-trends">
              <Button variant="primary" size="sm" className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold">
                Inspect Cluster Trends
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Top District KPI Deck (Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard title="Facilities" value="38" subtitle="Active on grid" icon={Building2} colorScheme="teal" />
        <StatCard title="OPD Today" value="1,420" subtitle="+12% vs avg" icon={Users} colorScheme="blue" />
        <StatCard title="Referrals" value="28" subtitle="Active in SLA" icon={GitBranch} colorScheme="amber" />
        <StatCard title="Avail Beds" value="482" subtitle="Across district" icon={Bed} colorScheme="teal" />
        <StatCard title="ICU Free" value="34" subtitle="78% occupancy" icon={Bed} colorScheme="rose" />
        <StatCard title="Blood Units" value="320" subtitle="8 blood banks" icon={Droplet} colorScheme="rose" />
        <StatCard title="Ambulance" value="22" subtitle="On call & active" icon={Ambulance} colorScheme="teal" />
        <StatCard title="High-Risk" value="14" subtitle="Frontline flags" icon={AlertTriangle} colorScheme="amber" />
      </div>

      {/* Interactive GIS District Map + Active Referral SLA Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* District GIS Map (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">District Health GIS & Facility Telemetry</h2>
            <Link to="/district/map" className="text-xs text-teal-700 font-bold hover:underline">
              Fullscreen GIS →
            </Link>
          </div>
          <MapView facilities={INITIAL_FACILITIES} showHeatmap className="h-[440px]" />
        </div>

        {/* Realtime Referral SLA Monitor (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Referral SLA Monitor</h2>
            <Link to="/district/referrals" className="text-xs text-teal-700 font-bold hover:underline">
              View All 28 →
            </Link>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              {INITIAL_REFERRALS.map((ref) => (
                <div key={ref.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{ref.referralCode}</span>
                    <PriorityBadge priority={ref.priority} />
                  </div>
                  <p className="font-semibold text-slate-800 line-clamp-1">{ref.reasonForReferral}</p>
                  <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>{ref.fromFacilityName} → {ref.toFacilityName}</span>
                    <StatusBadge status={ref.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disease Surge Trend Forecast Chart */}
      <ChartCard
        title="Vector-Borne Disease Surge Surveillance (Observed vs 30-Day Forecast)"
        subtitle="Time-series epidemiological forecasting generated from historical public hospital demand data."
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dengueTrend.forecastPoints} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="expectedCases" stroke="#94a3b8" strokeDasharray="5 5" name="Baseline Expected" />
              <Line type="monotone" dataKey="observedCases" stroke="#0f766e" strokeWidth={3} name="Observed Cases" />
              <Line type="monotone" dataKey="forecastCases" stroke="#f59e0b" strokeWidth={2} name="Forecast Projection" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};
