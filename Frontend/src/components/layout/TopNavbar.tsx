import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationContext } from '@/contexts/LocationContext';
import { supportedLanguages, changeAppLanguage } from '@/locales/i18n';
import { useTranslation } from 'react-i18next';
import { UserRole, StaffSubType } from '@/types/auth';
import {
  HeartPulse,
  Globe,
  MapPin,
  ChevronDown,
  UserCheck,
  Shield,
  Stethoscope,
  Users,
  Building2,
  Sliders,
  Menu,
  X,
  Search,
  LogOut,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FamilyMemberSwitcher } from '@/components/patient/FamilyMemberSwitcher';

export const TopNavbar: React.FC<{ onToggleSidebar?: () => void; isSidebarOpen?: boolean }> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, role, staffSubType, logout, quickSwitchRole } = useAuth();
  const { selectedDistrict, selectedFacility, openLocationModal } = useLocationContext();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleRoleSwitch = (newRole: UserRole, subType?: StaffSubType) => {
    quickSwitchRole(newRole, subType);
    setRoleMenuOpen(false);
    if (newRole === 'PATIENT') navigate('/patient');
    else if (newRole === 'ASHA') navigate('/asha');
    else if (newRole === 'DOCTOR') navigate('/doctor');
    else if (newRole === 'FACILITY_STAFF') {
      if (subType === 'PHARMACIST') navigate('/pharmacist');
      else if (subType === 'REGISTRATION_CLERK') navigate('/registration-clerk');
      else if (subType === 'LAB_TECHNICIAN') navigate('/lab-technician');
      else if (subType === 'FACILITY_OPERATIONS') navigate('/facility-operations');
      else navigate('/staff');
    }
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
                HEALTHCONNECT
              </span>
              <span className="block text-[11px] font-medium text-teal-800 leading-none">
                Public Healthcare Access & Care Continuity
              </span>
            </div>
            <span className="font-bold text-sm sm:text-base text-slate-900 sm:hidden truncate max-w-[110px]">
              HealthConnect
            </span>
          </Link>
        </div>

        {/* Center: District & Hospital Geo Tag with Interactive Location Switcher */}
        <button
          type="button"
          onClick={openLocationModal}
          className="hidden md:flex items-center gap-2 rounded-full bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 text-xs text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer group"
          title="Click to change your hospital or district location"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 group-hover:bg-teal-100 text-teal-700 transition-colors">
            <MapPin className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="font-bold text-slate-900">{selectedDistrict}</span>
            <span className="text-slate-400 hidden xl:inline">|</span>
            <span className="text-slate-600 truncate max-w-[170px] hidden xl:inline">
              {selectedFacility.split('&')[0].trim()}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 ml-0.5 group-hover:bg-teal-700 group-hover:text-white transition-colors">
            Change
          </span>
        </button>

        {/* Right Controls: Status, Mobile Location, Language, Role Switcher, Emergency SOS, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Patient Direct Family Member Switcher (Hidden on narrow mobile to prevent header blowout, visible sm+) */}
          {role === 'PATIENT' && (
            <div className="hidden sm:block">
              <FamilyMemberSwitcher variant="navbar" />
            </div>
          )}

          {/* Mobile Location Switcher Button */}
          <button
            type="button"
            onClick={openLocationModal}
            className="md:hidden flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[38px] cursor-pointer"
            title={`Current Location: ${selectedDistrict}`}
            aria-label="Change Location"
          >
            <MapPin className="h-3.5 w-3.5 text-teal-700 shrink-0" />
            <span className="truncate max-w-[45px] sm:max-w-[65px] text-[11px] sm:text-xs">{selectedDistrict}</span>
          </button>

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
              <span className="hidden md:inline">
                Role: {role === 'FACILITY_STAFF' && staffSubType ? staffSubType : role}
              </span>
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

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-white font-bold text-xs uppercase shadow-2xs">
                {user?.name ? user.name.slice(0, 2) : 'HC'}
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]" title={user?.name}>
                  {user?.name || 'Authorized User'}
                </p>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1 py-0.5 rounded border border-teal-200/60 uppercase leading-none inline-block mt-0.5">
                  {role === 'FACILITY_STAFF' && staffSubType ? staffSubType.replace('_', ' ') : role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
