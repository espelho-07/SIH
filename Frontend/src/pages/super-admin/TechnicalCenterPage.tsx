import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import {
  INITIAL_SYSTEM_HEALTH,
  INITIAL_FACILITIES,
  INITIAL_AUDIT_LOGS,
  DEMO_USERS,
  INITIAL_AI_MODELS,
} from '@/mock/mockData';
import {
  Server,
  Building2,
  Users,
  KeyRound,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Radio,
  Clock,
  RefreshCw,
  Sliders,
  Bell,
  ShieldAlert,
} from 'lucide-react';

export const TechnicalCenterPage: React.FC = () => {
  const [health, setHealth] = useState(INITIAL_SYSTEM_HEALTH);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const facilities = INITIAL_FACILITIES;
  const users = Object.values(DEMO_USERS);
  const models = INITIAL_AI_MODELS;
  const recentLogs = INITIAL_AUDIT_LOGS;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setHealth((prev) => ({
      ...prev,
      services: prev.services.map((s) => ({
        ...s,
        latencyMs: Math.floor(Math.random() * 15) + 14,
      })),
    }));
    setIsRefreshing(false);
  };

  const offlineOrDegradedServices = health.services.filter(
    (s) => s.status === 'DEGRADED' || s.status === 'DOWN'
  );

  return (
    <div className="space-y-6">
      {/* Page Header matching Patient UI standard */}
      <PageHeader
        title="Technical Center"
        subtitle="Platform status, core services, and operational health across the district healthcare grid."
        breadcrumbs={[
          { label: 'HealthConnect', to: '/' },
          { label: 'Technical Center' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-teal-700" />
              Refresh Status
            </Button>
            <Link to="/super-admin/settings">
              <Button variant="secondary" size="sm" className="text-xs gap-1.5 cursor-pointer">
                <Sliders className="h-3.5 w-3.5 text-slate-600" />
                Settings
              </Button>
            </Link>
          </div>
        }
      />

      {/* Clean Status Strip - Healthcare Surface */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
            <Server className="h-3.5 w-3.5 text-teal-700" />
            <span>Infrastructure Status</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">All Core Systems Operational</h2>
          <p className="text-xs text-slate-500 font-medium max-w-xl">
            6 microservices active • Real-time socket queues synced with Gandhinagar district hospitals.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center shrink-0">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block tracking-wider">Overall Uptime</span>
          <span className="text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            99.98% Healthy
          </span>
        </div>
      </div>

      {/* 4 Core Scannable Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Staff</span>
            <Users className="h-4 w-4 text-teal-700" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {health.activeUsersCount}
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Online healthcare workers</span>
        </Card>

        <Card className="p-4 sm:p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Channels</span>
            <Radio className="h-4 w-4 text-teal-700" />
          </div>
          <p className="text-3xl font-black text-teal-700 tracking-tight">
            {health.openSocketConnections}
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Live queue & bed channels</span>
        </Card>

        <Card className="p-4 sm:p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Connected Units</span>
            <Building2 className="h-4 w-4 text-sky-700" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {facilities.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Hospitals & health centres</span>
        </Card>

        <Card className="p-4 sm:p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Error Rate (24h)</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {health.totalErrorsLast24h}
          </p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 inline-block">99.99% error-free</span>
        </Card>
      </div>

      {/* Attention Needed Section */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-teal-700" />
              <CardTitle className="text-base font-bold text-slate-900">Attention Needed</CardTitle>
            </div>
            <span className="text-xs text-slate-500">
              {offlineOrDegradedServices.length === 0 ? '0 active incidents' : `${offlineOrDegradedServices.length} alerts`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {offlineOrDegradedServices.length > 0 ? (
            offlineOrDegradedServices.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>
                    Service <strong>{svc.name}</strong> is currently {svc.status.toLowerCase()}.
                  </span>
                </div>
                <Link to="/super-admin/system-health">
                  <Button variant="outline" size="sm" className="text-xs">
                    Investigate
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold block">No active service disruptions</span>
                <span className="text-emerald-700 text-[11px]">
                  All database nodes, authentication gateways, and realtime sockets are responding within target SLAs.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Clock className="h-4 w-4 text-slate-500 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold block">Scheduled Maintenance Window</span>
              <span className="text-slate-500 text-[11px]">
                Routine database vacuuming and index optimization scheduled for Sunday at 02:00 IST. No user downtime expected.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access to Operational Workspaces (Matching Patient Module card interactions) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Administrative Workspaces</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/super-admin/system-health" className="group">
            <Card className="p-5 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
                    <Server className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Healthy
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">System Health</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time latency metrics, uptime SLAs, and heartbeat probes across 6 core microservices.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                Open Telemetry <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/super-admin/facilities" className="group">
            <Card className="p-5 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 group-hover:scale-105 transition-transform">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {facilities.length} Facilities
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">Facility Governance</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Public hospital registry, bed availability status, and clinical department capacities.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                Manage Facilities <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/super-admin/users" className="group">
            <Card className="p-5 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 group-hover:scale-105 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {users.length} Accounts
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">User Management</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Healthcare staff credentials, facility assignments, role verification, and access controls.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                Manage Users <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/super-admin/roles" className="group">
            <Card className="p-5 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    6 Roles
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">Roles & Permissions</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Inspect and audit read, write, and create permissions across clinical and frontline roles.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                Review Permissions <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/super-admin/ai-models" className="group">
            <Card className="p-5 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {models.filter((m) => m.status === 'ACTIVE').length} Active
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">AI Model Registry</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Verified clinical assistance models for bed forecasting, outbreak detection, and referral routing.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                Inspect Models <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/super-admin/audit" className="group">
            <Card className="p-5 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {recentLogs.length} Events
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">Audit Logs</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Immutable security audit trail tracking staff logins, resource updates, and configuration changes.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                View Audit Trail <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};
