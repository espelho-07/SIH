import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StaffSubType } from '@/types/auth';
import { PharmacistDashboard } from '@/pages/pharmacist/PharmacistDashboard';
import { RegistrationClerkDashboard } from '@/pages/registration-clerk/RegistrationClerkDashboard';
import { LabTechnicianDashboard } from '@/pages/lab-technician/LabTechnicianDashboard';
import { FacilityOperationsDashboard } from '@/pages/facility-operations/FacilityOperationsDashboard';

export const StaffDashboard: React.FC = () => {
  const { user, staffSubType, quickSwitchRole } = useAuth();
  const activeSubType: StaffSubType = staffSubType || 'PHARMACIST';

  return (
    <div className="space-y-6">
      {/* Staff Header & Dynamic Subtype Switcher - Clean Healthcare Surface */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200/80 text-teal-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Hospital Facility Staff Station • {user?.facilityName || 'Gandhinagar Civil Hospital'}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{user?.name}</h1>
          <p className="text-xs text-slate-500 font-medium">
            Department:{' '}
            <strong className="text-slate-800 font-semibold">{activeSubType.replace(/_/g, ' ')}</strong> • Sector 12 Base
          </p>
        </div>

        {/* Subtype quick toggle */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
          {(['REGISTRATION_CLERK', 'PHARMACIST', 'LAB_TECHNICIAN', 'FACILITY_OPERATIONS'] as StaffSubType[]).map((sub) => (
            <button
              key={sub}
              onClick={() => quickSwitchRole('FACILITY_STAFF', sub)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeSubType === sub
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {sub === 'REGISTRATION_CLERK' && 'Registration'}
              {sub === 'PHARMACIST' && 'Pharmacy'}
              {sub === 'LAB_TECHNICIAN' && 'Laboratory'}
              {sub === 'FACILITY_OPERATIONS' && 'Operations'}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REGISTRATION CLERK EXPERIENCE */}
      {/* ========================================================================= */}
      {activeSubType === 'REGISTRATION_CLERK' && (
        <RegistrationClerkDashboard />
      )}

      {/* ========================================================================= */}
      {/* 2. PHARMACIST EXPERIENCE */}
      {/* ========================================================================= */}
      {activeSubType === 'PHARMACIST' && (
        <PharmacistDashboard />
      )}

      {/* ========================================================================= */}
      {/* 3. LAB TECHNICIAN EXPERIENCE */}
      {/* ========================================================================= */}
      {activeSubType === 'LAB_TECHNICIAN' && (
        <LabTechnicianDashboard />
      )}

      {/* ========================================================================= */}
      {/* 4. FACILITY OPERATIONS (Live Control Center) */}
      {/* ========================================================================= */}
      {activeSubType === 'FACILITY_OPERATIONS' && (
        <FacilityOperationsDashboard />
      )}
    </div>
  );
};
