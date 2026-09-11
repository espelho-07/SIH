import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChartCard } from '@/components/common/ChartCard';
import { INITIAL_AI_SUMMARY } from '@/mock/mockData';
import {
  BrainCircuit,
  AlertTriangle,
  Stethoscope,
  Bed,
  Ambulance,
  Droplet,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AiDemandIntelligence: React.FC = () => {
  const ai = INITIAL_AI_SUMMARY;

  const specialistChartData = ai.specialistGaps.map((s) => ({
    name: s.specialty,
    Predicted: s.predictedDemandConsultations,
    Capacity: s.availableCapacityConsultations,
    Gap: s.gapConsultations,
  }));

  const patientHourlyData = ai.patientLoad.hourlyBreakdown || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Healthcare Demand Intelligence"
        subtitle="Predictive resource allocation, clinical specialist shortage forecasting, and early bottleneck mitigation."
        breadcrumbs={[{ label: 'District Admin', to: '/district' }, { label: 'AI Demand' }]}
        actions={
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-900 font-bold flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-indigo-700" />
            <span>LSTM & Prophet Demand Models Active</span>
          </div>
        }
      />

      {/* Safety Principle Banner */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-950 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" />
        <p>
          <strong>Governance Standard: </strong>
          {ai.disclaimer}
        </p>
      </div>

      {/* Specialist Demand Capacity Gap Visualization (Section 15) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Specialist Clinical Capacity Gaps</h2>
            <p className="text-xs text-slate-500">Predicted consultation demand vs available physician hours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ai.specialistGaps.map((gap) => (
            <Card
              key={gap.specialty}
              className={`p-5 space-y-3 ${
                gap.shortageSeverity === 'CRITICAL'
                  ? 'border-rose-300 bg-rose-50/30'
                  : gap.shortageSeverity === 'MODERATE'
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">{gap.specialty}</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {gap.gapConsultations > 0 ? `+${gap.gapConsultations}` : gap.gapConsultations}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    gap.shortageSeverity === 'CRITICAL'
                      ? 'bg-rose-200 text-rose-900'
                      : gap.shortageSeverity === 'MODERATE'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {gap.shortageSeverity} GAP
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Predicted Demand:</span>
                  <strong>{gap.predictedDemandConsultations}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Available Capacity:</span>
                  <strong>{gap.availableCapacityConsultations}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/60 italic">
                {gap.suggestedAction}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialist Comparison Chart */}
      <ChartCard
        title="Specialty Consultation Demand vs Available Doctor Capacity"
        subtitle="Comparing predicted patient inflow against operational hospital roster capacity."
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={specialistChartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Predicted" fill="#f59e0b" name="Predicted Inflow" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Capacity" fill="#0f766e" name="Doctor Capacity" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Blood Bank Demand Matrix Across All 8 Blood Groups (Section 15) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">District Blood Group Deficit Intelligence</h2>
          <p className="text-xs text-slate-500">Current units inventory vs 7-day projected emergency demand</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {ai.bloodDemands.map((b) => (
            <div
              key={b.bloodGroup}
              className={`p-3 rounded-2xl border text-center space-y-1 ${
                b.risk === 'CRITICAL_DEFICIT'
                  ? 'border-rose-400 bg-rose-50 text-rose-950'
                  : b.risk === 'LOW_STOCK'
                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <span className="text-sm font-black block">{b.bloodGroup}</span>
              <p className="text-xl font-bold">{b.currentUnits}</p>
              <span className="text-[10px] text-slate-500 block">Dem: {b.predictedDemandUnits}u</span>
              <span
                className={`inline-block rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                  b.risk === 'CRITICAL_DEFICIT'
                    ? 'bg-rose-600 text-white'
                    : b.risk === 'LOW_STOCK'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {b.risk.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bed & Ambulance Demand Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-5 border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-teal-700" />
            <h3 className="font-bold text-sm text-slate-900">Critical Care Bed Demand Projections</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {ai.bedDemands.map((bed) => (
              <div key={bed.category} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{bed.category} BEDS</span>
                  <span className="text-slate-500">
                    Req: {bed.requiredBeds} | Avail: {bed.availableBeds}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    bed.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {bed.capacityGap > 0 ? `+${bed.capacityGap} Shortage` : 'Surplus Capacity'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Ambulance className="h-5 w-5 text-teal-700" />
            <h3 className="font-bold text-sm text-slate-900">Emergency Ambulance Fleet Forecast</h3>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between p-2 rounded bg-slate-50 border">
              <span>Predicted Emergency Calls:</span>
              <strong>{ai.ambulanceDemand.predictedEmergencyCalls} calls / 24h</strong>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 border">
              <span>Active Ambulance Fleet:</span>
              <strong>{ai.ambulanceDemand.activeFleetCount} deployed</strong>
            </div>
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
              <span className="font-bold block">Hotspot Corridor Watch:</span>
              <span>{ai.ambulanceDemand.hotspotBlocks.join(' & ')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
