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
      {/* Staff Header & Dynamic Subtype Switcher */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Hospital Facility Staff Station • {user?.facilityName || 'Gandhinagar Civil Hospital'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
          <p className="text-xs text-slate-300">
            Department:{' '}
            <strong className="text-white">{activeSubType.replace(/_/g, ' ')}</strong> • Sector 12 Base
          </p>
        </div>

        {/* Subtype quick toggle */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-800 p-1.5 border border-slate-700">
          {(['REGISTRATION_CLERK', 'PHARMACIST', 'LAB_TECHNICIAN', 'FACILITY_OPERATIONS'] as StaffSubType[]).map((sub) => (
            <button
              key={sub}
              onClick={() => quickSwitchRole('FACILITY_STAFF', sub)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                activeSubType === sub
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
