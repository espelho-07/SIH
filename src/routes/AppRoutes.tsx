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
import { HomeVisitsPage } from '@/pages/asha/HomeVisitsPage';
import { FollowUpsPage } from '@/pages/asha/FollowUpsPage';
import { FrontlineReferralsPage } from '@/pages/asha/FrontlineReferralsPage';
import { FrontlineFacilitiesPage } from '@/pages/asha/FrontlineFacilitiesPage';

// Doctor Pages
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard';
import { DoctorQueue } from '@/pages/doctor/DoctorQueue';
import { PatientClinicalWorkspace } from '@/pages/doctor/PatientClinicalWorkspace';
import { ReferralCreationWizard } from '@/pages/doctor/ReferralCreationWizard';
import { TeleconsultationRoom } from '@/pages/doctor/TeleconsultationRoom';

// Facility Staff Pages
import { StaffDashboard } from '@/pages/staff/StaffDashboard';

// Pharmacist Pages
import { PharmacistDashboard } from '@/pages/pharmacist/PharmacistDashboard';
import { PrescriptionQueuePage } from '@/pages/pharmacist/PrescriptionQueuePage';
import { PrescriptionDetailPage } from '@/pages/pharmacist/PrescriptionDetailPage';
import { PharmacyStockPage } from '@/pages/pharmacist/PharmacyStockPage';
import { ExpiryManagementPage } from '@/pages/pharmacist/ExpiryManagementPage';
import { DispensingHistoryPage } from '@/pages/pharmacist/DispensingHistoryPage';

// District Admin Pages
import { DistrictCommandDashboard } from '@/pages/district/DistrictCommandDashboard';
import { DistrictFacilitiesPage } from '@/pages/district/DistrictFacilitiesPage';
import { DistrictFacilityDetailPage } from '@/pages/district/DistrictFacilityDetailPage';
import { DistrictDoctorsPage } from '@/pages/district/DistrictDoctorsPage';
import { DistrictOperationsPage } from '@/pages/district/DistrictOperationsPage';
import { DistrictResourcesPage } from '@/pages/district/DistrictResourcesPage';
import { DistrictMedicinesPage } from '@/pages/district/DistrictMedicinesPage';
import { DistrictBloodPage } from '@/pages/district/DistrictBloodPage';
import { DistrictAmbulancesPage } from '@/pages/district/DistrictAmbulancesPage';
import { DistrictDiagnosticsPage } from '@/pages/district/DistrictDiagnosticsPage';
import { DistrictMapView } from '@/pages/district/DistrictMapView';
import { ReferralMonitor } from '@/pages/district/ReferralMonitor';
import { DiseaseTrends } from '@/pages/district/DiseaseTrends';
import { AiDemandIntelligence } from '@/pages/district/AiDemandIntelligence';
import { DistrictAlertsPage } from '@/pages/district/DistrictAlertsPage';
import { DistrictReportsPage } from '@/pages/district/DistrictReportsPage';

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
      <Route
        path="/asha/visits"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <HomeVisitsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/follow-ups"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <FollowUpsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/referrals"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <FrontlineReferralsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/facilities"
        element={
          <ProtectedRoute allowedRoles={['ASHA']}>
            <AppShell>
              <FrontlineFacilitiesPage />
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

      {/* 4. FACILITY STAFF & PHARMACIST ROUTES */}
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
        path="/staff/pharmacy"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <PharmacistDashboard />
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

      {/* DEDICATED PHARMACIST ROUTES */}
      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <PharmacistDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <PrescriptionQueuePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/prescriptions/:id"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <PrescriptionDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/stock"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <PharmacyStockPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/expiry"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <ExpiryManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/history"
        element={
          <ProtectedRoute allowedRoles={['FACILITY_STAFF']}>
            <AppShell>
              <DispensingHistoryPage />
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
        path="/district/facilities"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictFacilitiesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/facilities/:id"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictFacilityDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/doctors"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictDoctorsPage />
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
        path="/district/operations"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictOperationsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/resources"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictResourcesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/medicines"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictMedicinesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/blood"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictBloodPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/ambulances"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictAmbulancesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/diagnostics"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictDiagnosticsPage />
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
      <Route
        path="/district/alerts"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictAlertsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/district/reports"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_ADMIN']}>
            <AppShell>
              <DistrictReportsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* District Admin Aliases (/district-admin/* -> /district/*) */}
      <Route path="/district-admin" element={<Navigate to="/district" replace />} />
      <Route path="/district-admin/facilities" element={<Navigate to="/district/facilities" replace />} />
      <Route path="/district-admin/facilities/:id" element={<Navigate to="/district/facilities/:id" replace />} />
      <Route path="/district-admin/doctors" element={<Navigate to="/district/doctors" replace />} />
      <Route path="/district-admin/referrals" element={<Navigate to="/district/referrals" replace />} />
      <Route path="/district-admin/operations" element={<Navigate to="/district/operations" replace />} />
      <Route path="/district-admin/resources" element={<Navigate to="/district/resources" replace />} />
      <Route path="/district-admin/medicines" element={<Navigate to="/district/medicines" replace />} />
      <Route path="/district-admin/blood" element={<Navigate to="/district/blood" replace />} />
      <Route path="/district-admin/ambulances" element={<Navigate to="/district/ambulances" replace />} />
      <Route path="/district-admin/diagnostics" element={<Navigate to="/district/diagnostics" replace />} />
      <Route path="/district-admin/map" element={<Navigate to="/district/map" replace />} />
      <Route path="/district-admin/disease-trends" element={<Navigate to="/district/disease-trends" replace />} />
      <Route path="/district-admin/ai" element={<Navigate to="/district/ai" replace />} />
      <Route path="/district-admin/alerts" element={<Navigate to="/district/alerts" replace />} />
      <Route path="/district-admin/reports" element={<Navigate to="/district/reports" replace />} />
      <Route path="/district-admin/*" element={<Navigate to="/district" replace />} />

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
