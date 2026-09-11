import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChartCard } from '@/components/common/ChartCard';
import { INITIAL_AI_SUMMARY } from '@/mock/mockData';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const DiseaseTrends: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState('Dengue & Vector-Borne Fever');
  const trends = INITIAL_AI_SUMMARY.diseaseForecasts;
  const currentTrend = trends.find((t) => t.diseaseName === selectedDisease) || trends[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Epidemiological Surveillance & Trends"
        subtitle="Time-series anomaly detection and surveillance monitoring across Gandhinagar district public healthcare grid."
        breadcrumbs={[{ label: 'District Admin', to: '/district' }, { label: 'Disease Trends' }]}
      />

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
        <p>
          <strong>Surveillance Principle: </strong>
          Time-series anomaly projections indicate <em>"Unusual Increase Detected"</em>. They provide statistical early warnings for preventive sanitation and vector-fogging mobilization, and are <strong>not confirmed outbreaks</strong> until laboratory serological validation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {trends.map((t) => (
          <button
            key={t.diseaseName}
            onClick={() => setSelectedDisease(t.diseaseName)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              selectedDisease === t.diseaseName
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.diseaseName}
          </button>
        ))}
      </div>

      <ChartCard
        title={`${currentTrend.diseaseName} (Observed vs Baseline vs 30-Day Projection)`}
        subtitle="Confidence intervals computed via historical seasonal decomposition"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentTrend.forecastPoints} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="expectedCases" stroke="#94a3b8" strokeDasharray="4 4" name="Baseline Expected" />
              <Line type="monotone" dataKey="observedCases" stroke="#0f766e" strokeWidth={3} name="Observed Hospital Cases" />
              <Line type="monotone" dataKey="forecastCases" stroke="#f59e0b" strokeWidth={2} name="Forecast Projection" />
              <Line type="monotone" dataKey="upperConfidence" stroke="#fca5a5" strokeDasharray="2 2" name="Upper 95% Bound" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};
