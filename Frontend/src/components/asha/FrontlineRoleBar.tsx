import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnection } from '@/contexts/ConnectionContext';
import { FrontlineRoleMode } from '@/types/asha';
import {
  HeartPulse,
  UserCheck,
  Stethoscope,
  Building2,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface FrontlineRoleBarProps {
  activeMode: FrontlineRoleMode;
  onModeChange: (mode: FrontlineRoleMode) => void;
  title?: string;
  subtitle?: string;
}

export const FrontlineRoleBar: React.FC<FrontlineRoleBarProps> = ({
  activeMode,
  onModeChange,
  title,
  subtitle,
}) => {
  const { user } = useAuth();
  const { networkState, isOnline, pendingSyncCount, syncOfflineQueue } = useConnection();

  const roleProfiles: Record<
    FrontlineRoleMode,
    { label: string; badge: string; focus: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    ALL: {
      label: 'Combined View',
      badge: 'All Workflows',
      focus: 'Complete frontline operational scope across community, subcentre & HWC.',
      icon: Layers,
    },
    ASHA: {
      label: 'ASHA Mode',
      badge: 'Community Outreach',
      focus: 'Home visits, ANC maternal tracking, infant immunization mobilization, offline registrations.',
      icon: UserCheck,
    },
    ANM: {
      label: 'ANM Mode',
      badge: 'Subcentre Clinical',
      focus: 'Subcentre clinic sessions, vaccine administration, maternal danger sign triage, VHSND days.',
      icon: Stethoscope,
    },
    CHO: {
      label: 'CHO Mode',
      badge: 'HWC / Ayushman Mandir',
      focus: 'HWC outpatient triage, teleconsultation coordination, NCD clinic & dispensing, referral management.',
      icon: Building2,
    },
  };

  return (
    <div className="space-y-3">
      {/* Top Banner Aligned with Calm Healthcare Design Language */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 text-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-sky-800 border border-sky-200/80">
              <HeartPulse className="h-3.5 w-3.5 text-sky-700" />
              Frontline Healthcare Console
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
              {roleProfiles[activeMode].badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {title || `Namaste, ${user?.name || 'Sunita Devi'}`}
          </h1>

          <p className="text-xs text-slate-500 max-w-xl">
            {subtitle || (
              <>
                Sector: <strong className="text-slate-700">Pethapur Subcentre Cluster</strong> • Primary PHC: Pethapur PHC • Dist: Gandhinagar
              </>
            )}
          </p>
        </div>

        {/* Sync & Connectivity Widget */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80 self-start md:self-auto shrink-0 shadow-2xs">
          <div
            className={`rounded-lg p-2 ${
              pendingSyncCount > 0
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {pendingSyncCount > 0 ? (
              <WifiOff className="h-5 w-5" />
            ) : isOnline ? (
              <Wifi className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Network Pipeline
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  pendingSyncCount > 0
                    ? 'bg-amber-500 animate-pulse'
                    : isOnline
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
              />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              {pendingSyncCount > 0
                ? `${pendingSyncCount} ${pendingSyncCount === 1 ? 'Record' : 'Records'} Queued`
                : 'Synced to Grid'}
            </p>
            {pendingSyncCount > 0 && isOnline ? (
              <button
                type="button"
                onClick={syncOfflineQueue}
                className="text-[11px] underline text-sky-700 hover:text-sky-900 font-semibold cursor-pointer transition-colors"
              >
                Sync Now to Server
              </button>
            ) : (
              <span className="text-[10px] text-slate-500">
                {isOnline ? 'Real-time Connected' : 'Local IndexedDB Active'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Role Perspective Adaptor Tabs */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-2 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-2 shrink-0 self-start sm:self-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Operational Role:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto">
          {(['ALL', 'ASHA', 'ANM', 'CHO'] as FrontlineRoleMode[]).map((mode) => {
            const profile = roleProfiles[mode];
            const Icon = profile.icon;
            const isSelected = activeMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => onModeChange(mode)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
                  isSelected
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                }`}
                title={profile.focus}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{profile.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Mode Focus Hint */}
      <div className="text-[11px] text-slate-500 px-2 flex items-center gap-1.5">
        <span className="font-semibold text-sky-800">
          {roleProfiles[activeMode].label} Focus:
        </span>
        <span className="truncate">{roleProfiles[activeMode].focus}</span>
      </div>
    </div>
  );
};
