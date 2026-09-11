import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { EmergencyButton } from '@/components/emergency/EmergencyButton';
import { RoleBadge } from '@/components/ui/Badge';
import { supportedLanguages, changeAppLanguage } from '@/locales/i18n';
import { useTranslation } from 'react-i18next';
import { UserRole, StaffSubType } from '@/types/auth';
import {
  HeartPulse,
  Globe,
  MapPin,
  ChevronDown,
  LogOut,
  UserCheck,
  Shield,
  Stethoscope,
  Users,
  Building2,
  Sliders,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const TopNavbar: React.FC<{ onToggleSidebar?: () => void; isSidebarOpen?: boolean }> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, role, staffSubType, logout, quickSwitchRole } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleRoleSwitch = (newRole: UserRole, subType?: StaffSubType) => {
    quickSwitchRole(newRole, subType);
    setRoleMenuOpen(false);
    if (newRole === 'PATIENT') navigate('/patient');
    else if (newRole === 'ASHA') navigate('/asha');
    else if (newRole === 'DOCTOR') navigate('/doctor');
    else if (newRole === 'FACILITY_STAFF') navigate('/staff');
    else if (newRole === 'DISTRICT_ADMIN') navigate('/district');
    else if (newRole === 'SUPER_ADMIN') navigate('/super-admin');
  };

  const currentLang = supportedLanguages.find((l) => l.code === i18n.language) || supportedLanguages[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Menu Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm group-hover:bg-teal-800 transition-colors">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                SANJEEVANI-CONNECT
              </span>
              <span className="block text-[11px] font-medium text-teal-800 leading-none">
                Public Healthcare Access & Care Continuity
              </span>
            </div>
            <span className="font-bold text-base text-slate-900 sm:hidden">Sanjeevani</span>
          </Link>
        </div>

        {/* Center: District Geo Tag */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 border border-slate-200">
          <MapPin className="h-3.5 w-3.5 text-teal-700" />
          <span className="font-semibold text-slate-800">Gandhinagar District</span>
          <span className="text-slate-400">|</span>
          <span>Gujarat Public Health Grid</span>
        </div>

        {/* Right Controls: Status, Language, Role Switcher, Emergency SOS, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline Status Indicator */}
          <StatusIndicator />

          {/* Emergency SOS Button */}
          <EmergencyButton compact />

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[38px]"
              aria-label="Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">{currentLang.nativeName}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-50 animate-in fade-in-50 duration-100">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeAppLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 min-h-[38px]"
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-slate-400 text-[10px] uppercase">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Quick-Switcher Dropdown for SIH Judges / Demonstrators */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100 min-h-[38px] transition-colors"
              title="Quick switch role for live demonstration"
            >
              <Sliders className="h-3.5 w-3.5 text-teal-700" />
              <span className="hidden md:inline">Role: {role}</span>
              <ChevronDown className="h-3 w-3 text-teal-700" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in-50 duration-100 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Role to Demonstrate
                </div>
                <button
                  onClick={() => handleRoleSwitch('PATIENT')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-950 min-h-[40px]"
                >
                  <Users className="h-4 w-4 text-teal-600" />
                  <span>1. Patient / Citizen</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('ASHA')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-950 min-h-[40px]"
                >
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>2. ASHA / ANM / CHO</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('DOCTOR')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-950 min-h-[40px]"
                >
                  <Stethoscope className="h-4 w-4 text-sky-600" />
                  <span>3. Doctor / Specialist</span>
                </button>
                <div className="px-3 pt-2 text-[10px] font-bold uppercase text-slate-400">Facility Staff Subtypes</div>
                <button
                  onClick={() => handleRoleSwitch('FACILITY_STAFF', 'REGISTRATION_CLERK')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>4a. Registration Clerk</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('FACILITY_STAFF', 'PHARMACIST')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>4b. Pharmacist</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('FACILITY_STAFF', 'LAB_TECHNICIAN')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>4c. Lab Technician</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('FACILITY_STAFF', 'FACILITY_OPERATIONS')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>4d. Facility Operations</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => handleRoleSwitch('DISTRICT_ADMIN')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-950 min-h-[40px]"
                >
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span>5. District Health Admin</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('SUPER_ADMIN')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-950 min-h-[40px]"
                >
                  <Shield className="h-4 w-4 text-red-600" />
                  <span>6. Super Admin (Tech)</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile & Session */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 rounded-xl p-1 text-left hover:bg-slate-100 min-h-[44px]"
              aria-label="User profile menu"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800 text-white font-bold text-xs uppercase shadow-xs">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{role?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in-50 duration-100 space-y-2">
                <div className="border-b border-slate-100 pb-2">
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.phone}</p>
                  <div className="mt-2">
                    <RoleBadge role={user?.role || 'PATIENT'} subType={user?.staffSubType} />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    setProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
