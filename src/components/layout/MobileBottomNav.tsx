import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Ticket,
  FileText,
  Users,
  Activity,
  ClipboardList,
  RefreshCw,
  GitBranch,
  Shield,
  Calendar,
  Package,
  Clock,
  Pill,
  UserPlus,
  CalendarCheck2,
  FlaskConical,
  QrCode,
  FileCheck,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { role, staffSubType } = useAuth();
  const { t } = useTranslation();

  const getMobileNavItems = () => {
    switch (role) {
      case 'PATIENT':
        return [
          { to: '/patient', label: 'Home', icon: LayoutDashboard },
          { to: '/patient/facilities', label: 'Hospitals', icon: Building2 },
          { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
          { to: '/patient/tokens', label: 'Token', icon: Ticket },
          { to: '/patient/records', label: 'Records', icon: FileText },
        ];

      case 'ASHA':
        return [
          { to: '/asha', label: 'Today', icon: LayoutDashboard },
          { to: '/asha/visits', label: 'Visits', icon: Calendar },
          { to: '/asha/patients', label: 'Citizens', icon: Users },
          { to: '/asha/vitals', label: 'Vitals', icon: Activity },
          { to: '/asha/sync', label: 'Sync', icon: RefreshCw },
        ];

      case 'DOCTOR':
        return [
          { to: '/doctor', label: 'Home', icon: LayoutDashboard },
          { to: '/doctor/queue', label: 'Queue', icon: Ticket },
          { to: '/doctor/patients', label: 'Workspace', icon: Activity },
          { to: '/doctor/referrals', label: 'Referrals', icon: GitBranch },
        ];

      case 'FACILITY_STAFF':
        if (staffSubType === 'PHARMACIST') {
          return [
            { to: '/pharmacist', label: 'Hub', icon: LayoutDashboard },
            { to: '/pharmacist/prescriptions', label: 'Queue', icon: Clock },
            { to: '/pharmacist/stock', label: 'Stock', icon: Package },
            { to: '/pharmacist/expiry', label: 'Expiry', icon: Calendar },
            { to: '/pharmacist/history', label: 'History', icon: FileText },
          ];
        }
        if (staffSubType === 'REGISTRATION_CLERK') {
          return [
            { to: '/registration-clerk', label: 'Desk', icon: LayoutDashboard },
            { to: '/registration-clerk/register', label: 'Register', icon: UserPlus },
            { to: '/registration-clerk/patients', label: 'Directory', icon: Users },
            { to: '/registration-clerk/appointments', label: 'Check-In', icon: CalendarCheck2 },
            { to: '/registration-clerk/queue', label: 'Counter', icon: Ticket },
          ];
        }
        if (staffSubType === 'LAB_TECHNICIAN') {
          return [
            { to: '/lab-technician', label: 'Desk', icon: LayoutDashboard },
            { to: '/lab-technician/tests', label: 'Orders', icon: FlaskConical },
            { to: '/lab-technician/samples', label: 'Samples', icon: QrCode },
            { to: '/lab-technician/history', label: 'Archive', icon: FileCheck },
          ];
        }
        if (staffSubType === 'FACILITY_OPERATIONS') {
          return [
            { to: '/facility-operations', label: 'Hub', icon: LayoutDashboard },
            { to: '/facility-operations/services', label: 'Services', icon: Activity },
            { to: '/facility-operations/queues', label: 'Queues', icon: Clock },
            { to: '/facility-operations/referrals', label: 'Transfers', icon: GitBranch },
            { to: '/facility-operations/resources', label: 'Capacity', icon: Building2 },
          ];
        }
        return [
          { to: '/staff', label: 'Home', icon: LayoutDashboard },
          { to: '/staff/registration', label: 'Register', icon: Users },
          { to: '/staff/queue', label: 'Queue', icon: Ticket },
          { to: '/pharmacist', label: 'Pharmacy', icon: Pill },
          { to: '/staff/beds', label: 'Beds', icon: Building2 },
        ];

      case 'DISTRICT_ADMIN':
        return [
          { to: '/district', label: 'Command', icon: LayoutDashboard },
          { to: '/district/map', label: 'Map', icon: Building2 },
          { to: '/district/referrals', label: 'Referrals', icon: GitBranch },
          { to: '/district/ai', label: 'AI Demand', icon: Shield },
        ];

      case 'SUPER_ADMIN':
        return [
          { to: '/super-admin', label: 'Health', icon: LayoutDashboard },
          { to: '/super-admin/users', label: 'Users', icon: Users },
          { to: '/super-admin/roles', label: 'Roles', icon: Shield },
          { to: '/super-admin/audit', label: 'Audit', icon: FileText },
        ];

      default:
        return [
          { to: '/patient', label: 'Home', icon: LayoutDashboard },
          { to: '/patient/facilities', label: 'Facilities', icon: Building2 },
          { to: '/patient/tokens', label: 'Token', icon: Ticket },
        ];
    }
  };

  const navItems = getMobileNavItems();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none safe-area-bottom"
      aria-label="Mobile Navigation"
    >
      <div className="flex h-16 items-center justify-around px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all relative group cursor-pointer',
                  isActive ? 'text-teal-700' : 'text-slate-400 hover:text-slate-700'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-12 rounded-full transition-all duration-200',
                      isActive ? 'bg-teal-50 text-teal-700 shadow-2xs scale-105' : 'text-slate-500'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] mt-0.5 tracking-tight leading-none',
                      isActive ? 'font-bold text-teal-900' : 'font-medium text-slate-500'
                    )}
                  >
                    {t(`navMap.${item.label}`, item.label)}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
