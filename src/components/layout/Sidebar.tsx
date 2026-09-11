import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnection } from '@/contexts/ConnectionContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Ticket,
  Calendar,
  CalendarCheck2,
  FileText,
  GitBranch,
  Video,
  UserCheck,
  UserPlus,
  Activity,
  ClipboardList,
  AlertOctagon,
  AlertTriangle,
  RefreshCw,
  Users,
  Pill,
  Package,
  Clock,
  History,
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
  Stethoscope,
  Home,
  ListTodo,
  LogOut,
  QrCode,
  FileCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  section?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, staffSubType, logout } = useAuth();
  const { pendingSyncCount, networkState } = useConnection();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Navigation Items per Role
  const getNavItems = (): NavItem[] => {
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
          // 1. Field Operations
          { to: '/asha', label: "Today's Work Hub", icon: LayoutDashboard, section: 'Field Operations' },
          { to: '/asha/visits', label: 'Home Visits', icon: Home, section: 'Field Operations' },
          { to: '/asha/follow-ups', label: 'Action Tasks', icon: ListTodo, section: 'Field Operations' },

          // 2. Care & Community
          { to: '/asha/patients', label: 'Village Citizens', icon: Users, section: 'Care & Community' },
          { to: '/asha/patients/new', label: 'New Registration', icon: UserPlus, section: 'Care & Community' },
          { to: '/asha/vitals', label: 'Record Vitals', icon: Activity, section: 'Care & Community' },
          { to: '/asha/screening', label: 'Health Screening', icon: ClipboardList, section: 'Care & Community' },
          { to: '/asha/high-risk', label: 'Priority Register', icon: AlertOctagon, section: 'Care & Community' },

          // 3. Facilities & Sync
          { to: '/asha/referrals', label: 'Facility Referrals', icon: GitBranch, section: 'Facilities & Sync' },
          { to: '/asha/facilities', label: 'Facilities & 108', icon: Building2, section: 'Facilities & Sync' },
          {
            to: '/asha/sync',
            label: 'Offline & Sync',
            icon: RefreshCw,
            section: 'Facilities & Sync',
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
        if (staffSubType === 'PHARMACIST') {
          return [
            { to: '/pharmacist', label: 'Today / Hub', icon: LayoutDashboard, section: 'Pharmacy Station' },
            { to: '/pharmacist/prescriptions', label: 'Prescriptions Queue', icon: Clock, section: 'Pharmacy Station' },
            { to: '/pharmacist/stock', label: 'Stock & Inventory', icon: Package, section: 'Pharmacy Station' },
            { to: '/pharmacist/expiry', label: 'Expiry & Quarantine', icon: Calendar, section: 'Quality & Safety' },
            { to: '/pharmacist/history', label: 'Dispense History', icon: History, section: 'Quality & Safety' },
          ];
        }

        if (staffSubType === 'REGISTRATION_CLERK') {
          return [
            { to: '/registration-clerk', label: 'Front Desk Hub', icon: LayoutDashboard, section: 'Registration Desk' },
            { to: '/registration-clerk/register', label: 'Patient Registration', icon: UserPlus, section: 'Registration Desk' },
            { to: '/registration-clerk/patients', label: 'Citizen Directory', icon: Users, section: 'Registration Desk' },
            { to: '/registration-clerk/appointments', label: 'Appointment Desk', icon: CalendarCheck2, section: 'OPD Services' },
            { to: '/registration-clerk/queue', label: 'OPD Token Counter', icon: Ticket, section: 'OPD Services' },
          ];
        }

        if (staffSubType === 'LAB_TECHNICIAN') {
          return [
            { to: '/lab-technician', label: 'Lab Work Desk', icon: LayoutDashboard, section: 'Laboratory Station' },
            { to: '/lab-technician/tests', label: 'Test Queue', icon: FlaskConical, section: 'Laboratory Station' },
            { to: '/lab-technician/samples', label: 'Sample Desk', icon: QrCode, section: 'Laboratory Station' },
            { to: '/lab-technician/history', label: 'Verified Reports', icon: FileCheck, section: 'Quality & Archive' },
          ];
        }

        if (staffSubType === 'FACILITY_OPERATIONS') {
          return [
            { to: '/facility-operations', label: 'Operations Control', icon: LayoutDashboard, section: 'Facility Operations' },
            { to: '/facility-operations/services', label: 'Services & OPD Matrix', icon: Activity, section: 'Facility Operations' },
            { to: '/facility-operations/queues', label: 'Queue Velocity Monitor', icon: Clock, section: 'Facility Operations' },
            { to: '/facility-operations/referrals', label: 'Transfer Coordination', icon: GitBranch, section: 'Facility Operations' },
            { to: '/facility-operations/resources', label: 'Capacity & Fleet', icon: Bed, section: 'Resources & Fleet' },
            { to: '/facility-operations/alerts', label: 'Alerts & Triage Center', icon: AlertTriangle, section: 'Resources & Fleet' },
          ];
        }

        const staffItems = [{ to: '/staff', label: t('nav.dashboard'), icon: LayoutDashboard }];
        if (!staffSubType) {
          staffItems.push(
            { to: '/registration-clerk/register', label: 'Patient Registration', icon: UserPlus },
            { to: '/registration-clerk/queue', label: 'OPD Token Counter', icon: Ticket }
          );
        }
        if (!staffSubType) {
          staffItems.push({ to: '/pharmacist', label: 'Pharmacy & Stock', icon: Pill });
        }
        if (!staffSubType) {
          staffItems.push({ to: '/lab-technician', label: 'Diagnostics & Labs', icon: FlaskConical });
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
          // 1. Overview
          { to: '/district', label: 'Overview', icon: LayoutDashboard, section: 'Overview' },
          { to: '/district/alerts', label: 'Action Center', icon: AlertOctagon, section: 'Overview' },

          // 2. Facilities & Care
          { to: '/district/facilities', label: 'Facilities', icon: Building2, section: 'Facilities & Care' },
          { to: '/district/doctors', label: 'Doctors', icon: Stethoscope, section: 'Facilities & Care' },
          { to: '/district/referrals', label: 'Referrals', icon: GitBranch, section: 'Facilities & Care' },
          { to: '/district/operations', label: 'Queues & OPD', icon: Ticket, section: 'Facilities & Care' },

          // 3. District Resources
          { to: '/district/resources', label: 'Resource Planning', icon: Activity, section: 'District Resources' },
          { to: '/district/medicines', label: 'Medicines', icon: Pill, section: 'District Resources' },
          { to: '/district/blood', label: 'Blood Bank', icon: Droplet, section: 'District Resources' },
          { to: '/district/ambulances', label: 'Ambulances', icon: Ambulance, section: 'District Resources' },
          { to: '/district/diagnostics', label: 'Diagnostics', icon: FlaskConical, section: 'District Resources' },

          // 4. Public Health & Insights
          { to: '/district/map', label: 'District Map', icon: Map, section: 'Public Health & Insights' },
          { to: '/district/disease-trends', label: 'Disease Trends', icon: TrendingUp, section: 'Public Health & Insights' },
          { to: '/district/ai', label: 'Demand Forecast', icon: BrainCircuit, section: 'Public Health & Insights' },
          { to: '/district/reports', label: 'Reports & Exports', icon: FileText, section: 'Public Health & Insights' },
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
          {!navItems[0]?.section && (
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
          )}

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const showSection = item.section && (index === 0 || navItems[index - 1].section !== item.section);
            return (
              <React.Fragment key={item.to}>
                {showSection && (
                  <div className={cn('px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400', index > 0 ? 'pt-4 pb-1.5' : 'pb-1.5')}>
                    {item.section}
                  </div>
                )}
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  end={item.to.split('/').length <= 2}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all min-h-[38px]',
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom User / Patient Profile & Identity */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-white font-bold text-xs uppercase shadow-xs">
                {user?.name ? user.name.slice(0, 2) : 'HC'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate" title={user?.name}>
                  {user?.name || 'Patient'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 uppercase leading-none">
                    {role?.replace('_', ' ')}
                  </span>
                  {user?.phone && (
                    <span className="text-[10px] text-slate-400 truncate hidden xl:inline">
                      • {user.phone.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                if (onClose) onClose();
                navigate('/login');
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span className="font-semibold text-slate-600">HEALTHCONNECT v2.4</span>
            <span className="rounded bg-teal-100 px-1.5 py-0.5 font-bold text-teal-800">SIH26133</span>
          </div>
        </div>
      </aside>
    </>
  );
};
