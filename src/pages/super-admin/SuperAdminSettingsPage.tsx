import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Settings,
  Shield,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Database,
  Lock,
  MessageSquare,
} from 'lucide-react';

export const SuperAdminSettingsPage: React.FC = () => {
  // Session Security
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState('3');
  const [abhaCacheHours, setAbhaCacheHours] = useState('24');

  // Gateways & Notifications
  const [smsGatewayActive, setSmsGatewayActive] = useState(true);
  const [whatsAppGatewayActive, setWhatsAppGatewayActive] = useState(true);
  const [teleconsultationHeartbeat, setTeleconsultationHeartbeat] = useState('15');
  const [emergencyAlertsActive, setEmergencyAlertsActive] = useState(true);

  // Telemetry & Logs
  const [logLevel, setLogLevel] = useState('INFO');
  const [auditRetentionDays, setAuditRetentionDays] = useState('365');

  // Operational State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [readOnlyDrill, setReadOnlyDrill] = useState(false);

  // Feedback State
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Patient-Standard Page Header */}
      <PageHeader
        title="Platform Configuration & Settings"
        subtitle="Operational parameters, session security, communications gateways, and system maintenance controls."
        breadcrumbs={[
          { label: 'HealthConnect', to: '/' },
          { label: 'Technical Center', to: '/super-admin' },
          { label: 'Settings' },
        ]}
        actions={
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="text-xs gap-1.5 cursor-pointer font-semibold"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        }
      />

      {/* Save Success Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Platform configuration changes successfully saved and propagated across all district cluster nodes.</span>
        </div>
      )}

      {/* Maintenance Mode Alert Banner if active */}
      {maintenanceMode && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Platform Maintenance Mode is Active</span>
            <span className="text-rose-700 font-normal">
              Non-emergency citizen booking and scheduled operations are locked with a maintenance notice. Emergency triage remains functional.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Security & Staff Session Governance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Security & Sessions</CardTitle>
                <p className="text-xs text-slate-500">Access control timeouts for hospital terminals and ABHA identity</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Hospital Terminal Inactivity Timeout</span>
                <span className="text-teal-700 font-mono font-bold">{sessionTimeoutMinutes} min</span>
              </label>
              <Input
                type="number"
                min="5"
                max="240"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                className="bg-slate-50 text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Automatically logs out unattended OPD counter and consultation room computers.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Max Concurrent Logins Per Healthcare Worker</span>
                <span className="text-teal-700 font-mono font-bold">{maxConcurrentSessions} sessions</span>
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={maxConcurrentSessions}
                onChange={(e) => setMaxConcurrentSessions(e.target.value)}
                className="bg-slate-50 text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Prevents account sharing while allowing mobile tablet + OPD desk workstation access.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>ABHA Identity Verification Cache Lifetime</span>
                <span className="text-teal-700 font-mono font-bold">{abhaCacheHours} hours</span>
              </label>
              <Input
                type="number"
                min="1"
                max="72"
                value={abhaCacheHours}
                onChange={(e) => setAbhaCacheHours(e.target.value)}
                className="bg-slate-50 text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Reduces round-trips to national ABDM gateway for verified citizens within the same day.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Communication Gateways & Patient Alerts */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Gateways & Patient Alerts</CardTitle>
                <p className="text-xs text-slate-500">SMS, WhatsApp token tracking, and teleconsultation heartbeat</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={smsGatewayActive}
                onChange={(e) => setSmsGatewayActive(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-teal-700 focus:ring-teal-700"
              />
              <div>
                <span className="font-bold text-slate-900 block">Citizen SMS Gateway</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Sends automated SMS with live token link when booking is confirmed.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={whatsAppGatewayActive}
                onChange={(e) => setWhatsAppGatewayActive(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-teal-700 focus:ring-teal-700"
              />
              <div>
                <span className="font-bold text-slate-900 block">WhatsApp Queue Alerts</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Sends proactive notification when patient is within 5 numbers of being called at OPD.
                </span>
              </div>
            </label>

            <div className="space-y-1.5 pt-1">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Teleconsultation Signaling Ping (Seconds)</span>
                <span className="text-teal-700 font-mono font-bold">{teleconsultationHeartbeat}s</span>
              </label>
              <Input
                type="number"
                min="5"
                max="60"
                value={teleconsultationHeartbeat}
                onChange={(e) => setTeleconsultationHeartbeat(e.target.value)}
                className="bg-slate-50 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. System Telemetry & Regulatory Retention */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Telemetry & Retention</CardTitle>
                <p className="text-xs text-slate-500">Log level thresholds and statutory audit ledger archival</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">System Log Verbosity</label>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="w-full flex min-h-[44px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <option value="DEBUG">Debug — Verbose diagnostic logs for staging</option>
                <option value="INFO">Info — Standard production operational telemetry</option>
                <option value="WARN">Warning — Clinical pipeline bottlenecks and anomalies</option>
                <option value="ERROR">Error — Unhandled exceptions and network dropouts</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Audit Ledger Statutory Retention</label>
              <select
                value={auditRetentionDays}
                onChange={(e) => setAuditRetentionDays(e.target.value)}
                className="w-full flex min-h-[44px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <option value="90">90 Days (Development environment)</option>
                <option value="365">1 Year (Standard healthcare governance)</option>
                <option value="1825">5 Years (Clinical EHR statutory requirement)</option>
                <option value="2555">7 Years (ABDM national compliance standard)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 4. Emergency Governance & Platform Overrides */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Emergency Governance</CardTitle>
                <p className="text-xs text-slate-500">Platform maintenance locks and disaster recovery drill triggers</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-rose-600 focus:ring-rose-600"
              />
              <div>
                <span className="font-bold text-rose-950 block">Platform Maintenance Mode</span>
                <span className="text-rose-800 text-[11px] block mt-0.5">
                  Temporarily suspends non-emergency online registrations and displays friendly maintenance screen.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={readOnlyDrill}
                onChange={(e) => setReadOnlyDrill(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-teal-700 focus:ring-teal-700"
              />
              <div>
                <span className="font-bold text-slate-900 block">Disaster Recovery Read-Only Lock</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Forces read-only database replicas for database failover verification drills.
                </span>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};
