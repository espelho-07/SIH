import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnection } from '@/contexts/ConnectionContext';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Ticket,
  Calendar,
  FileText,
  GitBranch,
  Video,
  UserCheck,
  UserPlus,
  Activity,
  ClipboardList,
  AlertOctagon,
  RefreshCw,
  Users,
  Pill,
  FlaskConical,
  Bed,
  Ambulance,
  Droplet,
  Wrench,
  Map,
  TrendingUp,
  BrainCircuit,
  ShieldAlert,
  Server,
  KeyRound,
  ShieldCheck,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, staffSubType } = useAuth();
  const { pendingSyncCount, networkState } = useConnection();
  const { t } = useTranslation();

  // Navigation Items per Role
  const getNavItems = () => {
    switch (role) {
      case 'PATIENT':
        return [
          { to: '/patient', label: t('nav.dashboard'), icon: LayoutDashboard },
          { to: '/patient/facilities', label: t('nav.facilities'), icon: Building2 },
          { to: '/patient/tokens', label: t('nav.tokens'), icon: Ticket },
          { to: '/patient/appointments', label: t('nav.appointments'), icon: Calendar },
          { to: '/patient/records', label: t('nav.records'), icon: FileText },
          { to: '/patient/referrals', label: t('nav.referrals'), icon: GitBranch },
          { to: '/patient/consultations', label: t('nav.teleconsult'), icon: Video },
        ];

      case 'ASHA':
        return [
          { to: '/asha', label: t('nav.dashboard'), icon: LayoutDashboard },
          { to: '/asha/patients', label: 'Assigned Citizens', icon: Users },
          { to: '/asha/patients/new', label: 'Register Citizen', icon: UserPlus },
          { to: '/asha/vitals', label: t('nav.vitals'), icon: Activity },
          { to: '/asha/screening', label: t('nav.screening'), icon: ClipboardList },
          { to: '/asha/high-risk', label: t('nav.highRisk'), icon: AlertOctagon },
          {
            to: '/asha/sync',
            label: t('nav.sync'),
            icon: RefreshCw,
            badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
          },
        ];

      case 'DOCTOR':
        return [
          { to: '/doctor', label: t('nav.dashboard'), icon: LayoutDashboard },
          { to: '/doctor/queue', label: t('nav.doctorQueue'), icon: Ticket },
          { to: '/doctor/patients', label: t('nav.clinicalWorkspace'), icon: Activity },
          { to: '/doctor/referrals', label: t('nav.referrals'), icon: GitBranch },
          { to: '/doctor/teleconsultations', label: t('nav.teleconsult'), icon: Video },
        ];

      case 'FACILITY_STAFF':
        const staffItems = [{ to: '/staff', label: t('nav.dashboard'), icon: LayoutDashboard }];
        if (staffSubType === 'REGISTRATION_CLERK' || !staffSubType) {
          staffItems.push(
            { to: '/staff/registration', label: 'Patient Registration', icon: UserPlus },
            { to: '/staff/queue', label: 'OPD Token Counter', icon: Ticket }
          );
        }
        if (staffSubType === 'PHARMACIST' || !staffSubType) {
          staffItems.push({ to: '/staff/pharmacy', label: 'Pharmacy & Stock', icon: Pill });
        }
        if (staffSubType === 'LAB_TECHNICIAN' || !staffSubType) {
          staffItems.push({ to: '/staff/lab', label: 'Diagnostics & Labs', icon: FlaskConical });
        }
        if (staffSubType === 'FACILITY_OPERATIONS' || !staffSubType) {
          staffItems.push(
            { to: '/staff/beds', label: 'Bed Tracking', icon: Bed },
            { to: '/staff/blood', label: 'Blood Bank', icon: Droplet },
            { to: '/staff/ambulance', label: 'Ambulance Fleet', icon: Ambulance },
            { to: '/staff/equipment', label: 'Equipment Board', icon: Wrench }
          );
        }
        return staffItems;

      case 'DISTRICT_ADMIN':
        return [
          { to: '/district', label: t('nav.commandCenter'), icon: LayoutDashboard },
          { to: '/district/map', label: t('nav.districtMap'), icon: Map },
          { to: '/district/referrals', label: 'Referral SLA Monitor', icon: GitBranch },
          { to: '/district/resources', label: 'Resource Intelligence', icon: Activity },
          { to: '/district/disease-trends', label: t('nav.diseaseTrends'), icon: TrendingUp },
          { to: '/district/ai', label: t('nav.aiDemand'), icon: BrainCircuit },
        ];

      case 'SUPER_ADMIN':
        return [
          { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/super-admin/system-health', label: 'System Health', icon: Server },
          { to: '/super-admin/facilities', label: 'Facilities', icon: Building2 },
          { to: '/super-admin/users', label: 'Users', icon: Users },
          { to: '/super-admin/roles', label: 'Permissions', icon: KeyRound },
          { to: '/super-admin/ai-models', label: 'AI Models', icon: BrainCircuit },
          { to: '/super-admin/audit', label: 'Audit Logs', icon: ShieldCheck },
          { to: '/super-admin/settings', label: 'Settings', icon: Settings },
        ];

      default:
        return [{ to: '/patient', label: t('nav.dashboard'), icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-30 w-64 h-[calc(100vh-4rem)] border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:sticky md:top-16 md:shrink-0 md:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Offline Alert Strip for ASHA / Frontline */}
        {networkState === 'OFFLINE' && (
          <div className="bg-amber-500 text-white text-[11px] font-bold px-4 py-2 flex items-center justify-between shadow-xs">
            <span>OFFLINE LOCAL MODE</span>
            {pendingSyncCount > 0 && <span>{pendingSyncCount} queued</span>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to.split('/').length <= 2}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all min-h-[44px]',
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom System Identity */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">HEALTHCONNECT v2.4</span>
            <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">SIH26133</span>
          </div>
          <p className="text-[10px] text-slate-400">MoHFW / NHM Gujarat Public Health Grid</p>
        </div>
      </aside>
    </>
  );
};
