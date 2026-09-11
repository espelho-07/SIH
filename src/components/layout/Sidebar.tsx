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
  Server,
  KeyRound,
  ShieldCheck,
  Clock,
  Package,
  History,
  QrCode,
  FileCheck,
  LogOut,
  Home,
  ListTodo,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
  section?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, staffSubType, logout } = useAuth();
  const { pendingSyncCount, networkState } = useConnection();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --------------------------------------------------
  // NAVIGATION ITEMS
  // --------------------------------------------------
  const getNavItems = (): NavItem[] => {
    switch (role) {
      // ==================================================
      // CITIZEN / PATIENT
      // ==================================================
      case 'PATIENT':
        return [
          {
            to: '/patient',
            label: 'Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            to: '/patient/facilities',
            label: 'Nearby Hospitals',
            icon: Building2,
            color: 'text-purple-600 bg-purple-50',
          },
          {
            to: '/patient/tokens',
            label: 'My Token',
            icon: Ticket,
            color: 'text-orange-600 bg-orange-50',
          },
          {
            to: '/patient/appointments',
            label: 'My Appointments',
            icon: Calendar,
            color: 'text-pink-600 bg-pink-50',
          },
          {
            to: '/patient/records',
            label: 'My Health Records',
            icon: FileText,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            to: '/patient/referrals',
            label: 'Referral',
            icon: GitBranch,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            to: '/patient/consultations',
            label: 'Talk to Doctor',
            icon: Video,
            color: 'text-cyan-600 bg-cyan-50',
          },
        ];

      // ==================================================
      // ASHA / HEALTH WORKER
      // ==================================================
      case 'ASHA':
        return [
          {
            to: '/asha',
            label: 'Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            to: '/asha/visits',
            label: 'Home Visits',
            icon: Home,
            color: 'text-teal-600 bg-teal-50',
          },
          {
            to: '/asha/follow-ups',
            label: 'Action Tasks',
            icon: ListTodo,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            to: '/asha/patients',
            label: 'My Patients',
            icon: Users,
            color: 'text-violet-600 bg-violet-50',
          },
          {
            to: '/asha/patients/new',
            label: 'Add Patient',
            icon: UserPlus,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            to: '/asha/vitals',
            label: 'Health Check',
            icon: Activity,
            color: 'text-red-600 bg-red-50',
          },
          {
            to: '/asha/screening',
            label: 'Health Screening',
            icon: ClipboardList,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            to: '/asha/high-risk',
            label: 'High-Risk Patients',
            icon: AlertOctagon,
            color: 'text-rose-600 bg-rose-50',
          },
          {
            to: '/asha/referrals',
            label: 'Facility Referrals',
            icon: GitBranch,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            to: '/asha/facilities',
            label: 'Facilities & 108',
            icon: Building2,
            color: 'text-purple-600 bg-purple-50',
          },
          {
            to: '/asha/sync',
            label: 'Sync Data',
            icon: RefreshCw,
            badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
            color: 'text-cyan-600 bg-cyan-50',
          },
        ];

      // ==================================================
      // DOCTOR
      // ==================================================
      case 'DOCTOR':
        return [
          {
            to: '/doctor',
            label: 'Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            to: '/doctor/queue',
            label: 'Patient Queue',
            icon: Ticket,
            color: 'text-orange-600 bg-orange-50',
          },
          {
            to: '/doctor/patients',
            label: 'Patients & Treatment',
            icon: Activity,
            color: 'text-red-600 bg-red-50',
          },
          {
            to: '/doctor/referrals',
            label: 'Referrals',
            icon: GitBranch,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            to: '/doctor/teleconsultations',
            label: 'Online Doctor',
            icon: Video,
            color: 'text-cyan-600 bg-cyan-50',
          },
        ];

      // ==================================================
      // HOSPITAL / FACILITY STAFF
      // ==================================================
      case 'FACILITY_STAFF': {
        // Pharmacist
        if (staffSubType === 'PHARMACIST') {
          return [
            {
              to: '/pharmacist',
              label: 'Today / Hub',
              icon: LayoutDashboard,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              to: '/pharmacist/prescriptions',
              label: 'Prescription Queue',
              icon: Clock,
              color: 'text-orange-600 bg-orange-50',
            },
            {
              to: '/pharmacist/stock',
              label: 'Stock & Inventory',
              icon: Package,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              to: '/pharmacist/expiry',
              label: 'Expiry & Quarantine',
              icon: Calendar,
              color: 'text-rose-600 bg-rose-50',
            },
            {
              to: '/pharmacist/history',
              label: 'Dispense History',
              icon: History,
              color: 'text-purple-600 bg-purple-50',
            },
          ];
        }

        // Registration Clerk
        if (staffSubType === 'REGISTRATION_CLERK') {
          return [
            {
              to: '/registration-clerk',
              label: 'Front Desk Hub',
              icon: LayoutDashboard,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              to: '/registration-clerk/register',
              label: 'Patient Registration',
              icon: UserPlus,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              to: '/registration-clerk/patients',
              label: 'Citizen Directory',
              icon: Users,
              color: 'text-violet-600 bg-violet-50',
            },
            {
              to: '/registration-clerk/appointments',
              label: 'Appointment Desk',
              icon: CalendarCheck2,
              color: 'text-pink-600 bg-pink-50',
            },
            {
              to: '/registration-clerk/queue',
              label: 'OPD Token Counter',
              icon: Ticket,
              color: 'text-orange-600 bg-orange-50',
            },
          ];
        }

        // Lab Technician
        if (staffSubType === 'LAB_TECHNICIAN') {
          return [
            {
              to: '/lab-technician',
              label: 'Lab Work Desk',
              icon: LayoutDashboard,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              to: '/lab-technician/tests',
              label: 'Test Orders Queue',
              icon: Clock,
              color: 'text-orange-600 bg-orange-50',
            },
            {
              to: '/lab-technician/samples',
              label: 'Sample Desk',
              icon: QrCode,
              color: 'text-cyan-600 bg-cyan-50',
            },
            {
              to: '/lab-technician/results',
              label: 'Result Entry',
              icon: FlaskConical,
              color: 'text-purple-600 bg-purple-50',
            },
            {
              to: '/lab-technician/history',
              label: 'Lab History & Reports',
              icon: FileCheck,
              color: 'text-emerald-600 bg-emerald-50',
            },
          ];
        }

        // Facility Operations
        if (staffSubType === 'FACILITY_OPERATIONS') {
          return [
            {
              to: '/facility-operations',
              label: 'Operations Command',
              icon: LayoutDashboard,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              to: '/facility-operations/services',
              label: 'Services & OPD Status',
              icon: Activity,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              to: '/facility-operations/queues',
              label: 'Live Queue Velocity',
              icon: Ticket,
              color: 'text-orange-600 bg-orange-50',
            },
            {
              to: '/facility-operations/referrals',
              label: 'Transfer Coordination',
              icon: GitBranch,
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              to: '/facility-operations/resources',
              label: 'Capacity & Beds',
              icon: Bed,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              to: '/facility-operations/alerts',
              label: 'Operational Alerts',
              icon: AlertOctagon,
              color: 'text-rose-600 bg-rose-50',
            },
          ];
        }

        // Generic Staff Fallback
        return [
          {
            to: '/staff',
            label: 'Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            to: '/staff/registration',
            label: 'Register Patient',
            icon: UserPlus,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            to: '/staff/queue',
            label: 'Patient Tokens',
            icon: Ticket,
            color: 'text-orange-600 bg-orange-50',
          },
          {
            to: '/staff/pharmacy',
            label: 'Medicine & Stock',
            icon: Pill,
            color: 'text-pink-600 bg-pink-50',
          },
          {
            to: '/staff/beds',
            label: 'Hospital Beds',
            icon: Bed,
            color: 'text-blue-600 bg-blue-50',
          },
        ];
      }

      // ==================================================
      // DISTRICT ADMIN
      // ==================================================
      case 'DISTRICT_ADMIN':
        return [
          {
            to: '/district',
            label: 'Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            to: '/district/map',
            label: 'District Map',
            icon: Map,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            to: '/district/referrals',
            label: 'Referral Status',
            icon: GitBranch,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            to: '/district/resources',
            label: 'Hospital Resources',
            icon: Activity,
            color: 'text-cyan-600 bg-cyan-50',
          },
          {
            to: '/district/disease-trends',
            label: 'Disease Reports',
            icon: TrendingUp,
            color: 'text-rose-600 bg-rose-50',
          },
          {
            to: '/district/ai',
            label: 'Health Demand',
            icon: BrainCircuit,
            color: 'text-violet-600 bg-violet-50',
          },
        ];

      // ==================================================
      // SUPER ADMIN
      // ==================================================
      case 'SUPER_ADMIN':
        return [
          {
            to: '/super-admin',
            label: 'System Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            to: '/super-admin/system-health',
            label: 'System Status',
            icon: Server,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            to: '/super-admin/users',
            label: 'Users',
            icon: Users,
            color: 'text-purple-600 bg-purple-50',
          },
          {
            to: '/super-admin/roles',
            label: 'User Roles',
            icon: KeyRound,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            to: '/super-admin/facilities',
            label: 'Hospitals',
            icon: Building2,
            color: 'text-cyan-600 bg-cyan-50',
          },
          {
            to: '/super-admin/ai-models',
            label: 'AI Models',
            icon: BrainCircuit,
            color: 'text-violet-600 bg-violet-50',
          },
          {
            to: '/super-admin/audit',
            label: 'Activity History',
            icon: ShieldCheck,
            color: 'text-rose-600 bg-rose-50',
          },
        ];

      default:
        return [
          {
            to: '/patient',
            label: 'Home',
            icon: LayoutDashboard,
            color: 'text-blue-600 bg-blue-50',
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          `fixed top-16 bottom-0 left-0 z-30
          w-64 h-[calc(100vh-4rem)]
          border-r border-slate-200
          bg-white
          shadow-[4px_0_24px_rgba(15,23,42,0.04)]
          transition-transform duration-200
          ease-in-out
          md:sticky md:top-16
          md:shrink-0 md:translate-x-0
          flex flex-col`,
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* ---------------------------------------------
            OFFLINE MODE BANNER
        --------------------------------------------- */}
        {networkState === 'OFFLINE' && (
          <div className="mx-3 my-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-800">
                  OFFLINE MODE
                </span>
              </div>
              {pendingSyncCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                  {pendingSyncCount} queued
                </span>
              )}
            </div>
            <p className="mt-1 text-[10px] text-amber-700">
              Data will sync when internet is available.
            </p>
          </div>
        )}

        {/* ---------------------------------------------
            NAVIGATION
        --------------------------------------------- */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-2 px-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Menu
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          </div>

          <nav className="space-y-1">
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
                      `group relative flex items-center justify-between rounded-xl px-2.5 py-2 min-h-[44px] text-sm font-medium transition-all duration-200`,
                      isActive
                        ? `bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 font-semibold shadow-xs`
                        : `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Left Indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-gradient-to-b from-teal-500 to-cyan-500" />
                      )}

                      <div className="flex min-w-0 items-center gap-3">
                        {/* ICON */}
                        <div
                          className={cn(
                            `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200`,
                            isActive
                              ? 'bg-white shadow-xs text-teal-600'
                              : item.color || 'bg-slate-50 text-slate-500'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-[18px] w-[18px]',
                              isActive ? 'text-teal-600' : ''
                            )}
                          />
                        </div>

                        {/* LABEL */}
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* BADGE */}
                      {item.badge !== undefined && (
                        <span className="ml-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ---------------------------------------------
            BOTTOM USER PROFILE & SYSTEM STATUS
        --------------------------------------------- */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-3 space-y-2.5 shrink-0">
          {/* USER PROFILE & LOGOUT */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-white font-bold text-xs uppercase shadow-2xs">
                {user?.name ? user.name.slice(0, 2) : 'HC'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate" title={user?.name}>
                  {user?.name || 'Authorized User'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 uppercase leading-none truncate">
                    {role?.replace('_', ' ')}
                  </span>
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

          {/* SYSTEM STATUS */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-50" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">
                  System Online
                </span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400">
                v2.4
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400">
                SANJEEVANI-CONNECT
              </span>
              <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">
                SIH26133
              </span>
            </div>
          </div>

          <p className="text-center text-[9px] text-slate-400">
            MoHFW / NHM Gujarat Public Health Grid
          </p>
        </div>
      </aside>
    </>
  );
};
