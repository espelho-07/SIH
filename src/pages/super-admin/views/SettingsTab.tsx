import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Settings,
  Shield,
  Bell,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smsGatewayActive, setSmsGatewayActive] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [logLevel, setLogLevel] = useState('INFO');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Platform Settings & Governance</h3>
            <p className="text-xs text-slate-500">
              Configure session security, communication gateways, and system maintenance
            </p>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Platform configuration changes successfully saved and propagated across active nodes.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Session Governance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-700" />
              <CardTitle className="text-base font-bold text-slate-900">Security & Sessions</CardTitle>
            </div>
            <p className="text-xs text-slate-500">ABHA tokens and healthcare staff idle timeout</p>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Staff Session Inactivity Timeout (Minutes)</label>
              <Input
                type="number"
                min="15"
                max="480"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Enforces automatic logout for hospital terminal sessions left unattended.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">System Log Level</label>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <option value="DEBUG">Debug (Verbose Diagnostics)</option>
                <option value="INFO">Info (Standard Production)</option>
                <option value="WARN">Warning (Anomalies Only)</option>
                <option value="ERROR">Error (Failures Only)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Messaging & Communication Gateways */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-teal-700" />
              <CardTitle className="text-base font-bold text-slate-900">Gateways & Notifications</CardTitle>
            </div>
            <p className="text-xs text-slate-500">SMS, WhatsApp, and OPD token calling broadcasts</p>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={smsGatewayActive}
                onChange={(e) => setSmsGatewayActive(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-teal-700 focus:ring-teal-700"
              />
              <div>
                <span className="font-bold text-slate-900 block">Citizen SMS / WhatsApp Notifications</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Sends live token position alerts when a patient is within 5 numbers of being called.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-rose-600 focus:ring-rose-600"
              />
              <div>
                <span className="font-bold text-rose-950 block">Platform Maintenance Mode</span>
                <span className="text-rose-800 text-[11px] block mt-0.5">
                  Locks write operations and displays maintenance banner to non-emergency users.
                </span>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};
