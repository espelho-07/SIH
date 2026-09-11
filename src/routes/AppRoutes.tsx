import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

// Public & Auth Pages
import { LandingPage } from '@/pages/LandingPage';
import { Login } from '@/pages/auth/Login';
import { Unauthorized, NotFound } from '@/pages/errors/Unauthorized';

// Patient Pages
import { PatientDashboard } from '@/pages/patient/PatientDashboard';
import { FacilityDiscovery } from '@/pages/patient/FacilityDiscovery';
import { FacilityDetail } from '@/pages/patient/FacilityDetail';
import { TokenExperience } from '@/pages/patient/TokenExperience';
import { AppointmentBooking } from '@/pages/patient/AppointmentBooking';
import { HealthRecordView } from '@/pages/patient/HealthRecordView';
import { ReferralTracking } from '@/pages/patient/ReferralTracking';

// ASHA Pages
import { AshaDashboard } from '@/pages/asha/AshaDashboard';
import { CitizenList } from '@/pages/asha/CitizenList';
import { PatientRegistration } from '@/pages/asha/PatientRegistration';
import { VitalsRecording } from '@/pages/asha/VitalsRecording';
import { ScreeningWizard } from '@/pages/asha/ScreeningWizard';
import { HighRiskPatients } from '@/pages/asha/HighRiskPatients';
import { SyncCenter } from '@/pages/asha/SyncCenter';

// Doctor Pages
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard';
import { DoctorQueue } from '@/pages/doctor/DoctorQueue';
import { PatientClinicalWorkspace } from '@/pages/doctor/PatientClinicalWorkspace';
import { ReferralCreationWizard } from '@/pages/doctor/ReferralCreationWizard';
import { TeleconsultationRoom } from '@/pages/doctor/TeleconsultationRoom';

// Facility Staff Pages
import { StaffDashboard } from '@/pages/staff/StaffDashboard';

// District Admin Pages
import { DistrictCommandDashboard } from '@/pages/district/DistrictCommandDashboard';
import { DistrictMapView } from '@/pages/district/DistrictMapView';
import { ReferralMonitor } from '@/pages/district/ReferralMonitor';
import { DiseaseTrends } from '@/pages/district/DiseaseTrends';
import { AiDemandIntelligence } from '@/pages/district/AiDemandIntelligence';

// Super Admin Pages
import { SuperAdminDashboard } from '@/pages/super-admin/SuperAdminDashboard';
import { TechnicalCenterPage } from '@/pages/super-admin/TechnicalCenterPage';
import { SystemHealthPage } from '@/pages/super-admin/SystemHealthPage';
import { FacilityGovernancePage } from '@/pages/super-admin/FacilityGovernancePage';
import { UserManagementPage } from '@/pages/super-admin/UserManagementPage';
import { RolesPermissionsPage } from '@/pages/super-admin/RolesPermissionsPage';
import { AiModelRegistryPage } from '@/pages/super-admin/AiModelRegistryPage';
import { AuditLogsPage } from '@/pages/super-admin/AuditLogsPage';
import { SuperAdminSettingsPage } from '@/pages/super-admin/SuperAdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/patient/login" element={<Login />} />
      <Route path="/403" element={<Unauthorized />} />

      {/* 1. PATIENT / CITIZEN ROUTES */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <PatientDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/facilities"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <FacilityDiscovery />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/facilities/:id"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <FacilityDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/tokens"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <TokenExperience />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <AppointmentBooking />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/records"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <HealthRecordView />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/referrals"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <ReferralTracking />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/consultations"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppShell>
              <TeleconsultationRoom />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* 2. ASHA / ANM / CHO ROUTES */}
      <Route
        path="/asha"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <AshaDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/patients"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <CitizenList />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/patients/new"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <PatientRegistration />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/vitals"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <VitalsRecording />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/screening"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <ScreeningWizard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/high-risk"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <HighRiskPatients />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/sync"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <SyncCenter />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* 3. DOCTOR / MEDICAL OFFICER ROUTES */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <AppShell>
              <DoctorDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/queue"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <AppShell>
              <DoctorQueue />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <AppShell>
              <PatientClinicalWorkspace />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:id"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <AppShell>
              <PatientClinicalWorkspace />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/referrals"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <AppShell>
              <ReferralCreationWizard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/teleconsultations"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <AppShell>
              <TeleconsultationRoom />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* 4. FACILITY STAFF ROUTES (Adaptive for Registration, Pharmacy, Lab, Operations) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <StaffDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:subview"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <StaffDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* 5. DISTRICT HEALTH ADMIN ROUTES */}
      <Route
        path="/district"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictCommandDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/map"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictMapView />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/referrals"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <ReferralMonitor />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/disease-trends"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DiseaseTrends />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/ai"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN', 'SUPER_ADMIN']}>
            <AppShell>
              <AiDemandIntelligence />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* 6. SUPER ADMIN ROUTES (Technical Center & Platform Governance) */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <TechnicalCenterPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/system-health"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <SystemHealthPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/facilities"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <FacilityGovernancePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/users"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <UserManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/roles"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <RolesPermissionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/ai-models"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <AiModelRegistryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/audit"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <AuditLogsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/settings"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <SuperAdminSettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      {/* Legacy / Tabbed fallback */}
      <Route
        path="/super-admin/:tab"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppShell>
              <SuperAdminDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* 404 Wildcard Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
