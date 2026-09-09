import React from 'react'
import { Users, Clock, Share2, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export const AdminCommandCenterPage: React.FC = () => {
  const kpis = [
    {
      title: 'Total District Patient Footfall Today',
      value: '4,892',
      trend: '+12.4% vs 30d baseline',
      icon: Users,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Average OPD Waiting Time',
      value: '26 mins',
      trend: '-18 mins since dynamic tokens',
      icon: Clock,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Closed-Loop Referral Handshake SLA',
      value: '91.8%',
      trend: 'Target: > 90% achieved',
      icon: Share2,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Ambulances on Duty',
      value: '28 / 34',
      trend: '82% fleet operational readiness',
      icon: ShieldCheck,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
  ]

  const bottleneckAlerts = [
    {
      facility: 'Harahua Community Health Centre',
      issue: 'Ultrasound diagnostics machine offline for 48h; diverting obstetric cases to District Hospital',
      severity: 'WARNING',
    },
    {
      facility: 'Kashi Sub-District Hospital',
      issue: 'O-Negative whole blood inventory below minimum safety threshold (only 2 units remain)',
      severity: 'CRITICAL',
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
          Varanasi District Health Intelligence Command Center
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Executive Public Health Dashboard & Early Warning Alerts
        </h1>
        <p className="text-xs text-slate-500">
          Monitoring 28 PHCs, 8 CHCs, and 2 District Hospitals in real time.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <Card key={idx} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 line-clamp-1">{kpi.title}</span>
                  <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} ${kpi.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 mt-3 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {kpi.trend}
              </span>
            </Card>
          )
        })}
      </div>

      {/* Resource Deficit & Bottleneck Alerts */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Real-Time Resource Shortage & Bottleneck Alerts
        </h2>

        {bottleneckAlerts.map((alert, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              alert.severity === 'CRITICAL'
                ? 'bg-red-50 border-red-200 text-red-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                alert.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
              }`}
              aria-hidden="true"
            />
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2">
                <strong className="font-bold">{alert.facility}</strong>
                <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'warning'} className="text-[10px]">
                  {alert.severity}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-700 leading-relaxed">{alert.issue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
