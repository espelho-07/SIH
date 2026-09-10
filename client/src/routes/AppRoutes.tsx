import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { RoleGuard } from '@/layouts/RoleGuard'

// Feature Pages
import { PatientHomePage } from '@/features/patient/PatientHomePage'
import { FindCarePage } from '@/features/patient/FindCarePage'
import { FacilityDetailPage } from '@/features/patient/FacilityDetailPage'
import { TreatmentMatcherPage } from '@/features/patient/TreatmentMatcherPage'
import { LiveQueuePage } from '@/features/patient/LiveQueuePage'
import { MyAppointmentsPage } from '@/features/patient/MyAppointmentsPage'
import { AppointmentBookingPage } from '@/features/patient/AppointmentBookingPage'
import { AppointmentDetailPage } from '@/features/patient/AppointmentDetailPage'
import { PatientReferralsPage } from '@/features/patient/PatientReferralsPage'
import { ReferralDetailPage } from '@/features/patient/ReferralDetailPage'
import { MyCarePage } from '@/features/patient/MyCarePage'
import { DiagnosticsCenterPage } from '@/features/patient/DiagnosticsCenterPage'
import { PrescriptionsMedicinesPage } from '@/features/patient/PrescriptionsMedicinesPage'
import { EmergencyHelpPage } from '@/features/patient/EmergencyHelpPage'
import { FollowUpsPage } from '@/features/patient/FollowUpsPage'
import { AshaDashboardPage } from '@/features/asha/AshaDashboardPage'
import { DoctorDeskPage } from '@/features/doctor/DoctorDeskPage'
import { FacilityBedsPage } from '@/features/facility/FacilityBedsPage'
import { AdminCommandCenterPage } from '@/features/admin/AdminCommandCenterPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Default Landing: Redirect to Patient Home */}
        <Route path="/" element={<Navigate to="/patient/home" replace />} />

        {/* Patient / Citizen Routes (Public / Citizen Access) */}
        <Route path="/patient/home" element={<PatientHomePage />} />
        <Route path="/patient/emergency" element={<EmergencyHelpPage />} />
        <Route path="/patient/urgent-help" element={<EmergencyHelpPage />} />
        <Route path="/patient/follow-ups" element={<FollowUpsPage />} />
        <Route path="/patient/follow-ups/:id" element={<FollowUpsPage />} />
        <Route path="/patient/find-care" element={<FindCarePage />} />
        <Route path="/patient/facilities" element={<FindCarePage />} />
        <Route path="/patient/facility/:id" element={<FacilityDetailPage />} />
        <Route path="/patient/treatment-matcher" element={<TreatmentMatcherPage />} />
        <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
        <Route path="/patient/appointments/book" element={<AppointmentBookingPage />} />
        <Route path="/patient/appointments/:id" element={<AppointmentDetailPage />} />
        <Route path="/patient/queue" element={<LiveQueuePage />} />
        <Route path="/patient/blood" element={<EmergencyHelpPage />} />
        <Route path="/patient/diagnostics" element={<DiagnosticsCenterPage />} />
        <Route path="/patient/diagnostics/:id" element={<DiagnosticsCenterPage />} />
        <Route path="/patient/medicines" element={<PrescriptionsMedicinesPage />} />
        <Route path="/patient/prescriptions" element={<PrescriptionsMedicinesPage />} />
        <Route path="/patient/referrals" element={<PatientReferralsPage />} />
        <Route path="/patient/referrals/:id" element={<ReferralDetailPage />} />
        <Route path="/patient/my-care" element={<MyCarePage />} />
        <Route path="/patient/records" element={<MyCarePage />} />

        {/* ASHA / ANM Frontline Worker Routes (Guarded: ROLE_ASHA, ROLE_ANM) */}
        <Route element={<RoleGuard allowedRoles={['ROLE_ASHA', 'ROLE_ANM', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/asha/dashboard" element={<AshaDashboardPage />} />
          <Route path="/asha/vitals" element={<AshaDashboardPage />} />
          <Route path="/asha/households" element={<AshaDashboardPage />} />
          <Route path="/asha/high-risk" element={<AshaDashboardPage />} />
          <Route path="/asha/sync" element={<AshaDashboardPage />} />
        </Route>

        {/* Doctor & Specialist Clinician Routes (Guarded: ROLE_DOCTOR, ROLE_SPECIALIST) */}
        <Route element={<RoleGuard allowedRoles={['ROLE_DOCTOR', 'ROLE_SPECIALIST', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/doctor/desk" element={<DoctorDeskPage />} />
          <Route path="/doctor/consultation" element={<DoctorDeskPage />} />
          <Route path="/doctor/referral/new" element={<DoctorDeskPage />} />
          <Route path="/doctor/patients" element={<DoctorDeskPage />} />
        </Route>

        {/* Facility Staff Routes (Guarded: ROLE_FACILITY_STAFF) */}
        <Route element={<RoleGuard allowedRoles={['ROLE_FACILITY_STAFF', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/facility/beds" element={<FacilityBedsPage />} />
          <Route path="/facility/tokens" element={<FacilityBedsPage />} />
          <Route path="/facility/pharmacy" element={<FacilityBedsPage />} />
          <Route path="/facility/blood-bank" element={<FacilityBedsPage />} />
        </Route>

        {/* District & State Administrator Routes (Guarded: ROLE_DISTRICT_ADMIN) */}
        <Route element={<RoleGuard allowedRoles={['ROLE_DISTRICT_ADMIN', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/admin/command" element={<AdminCommandCenterPage />} />
          <Route path="/admin/surveillance" element={<AdminCommandCenterPage />} />
          <Route path="/admin/referral-flow" element={<AdminCommandCenterPage />} />
          <Route path="/admin/inventory" element={<AdminCommandCenterPage />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route
          path="*"
          element={
            <div className="p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
              <p className="text-sm text-slate-500 mb-4">
                The healthcare portal page you requested does not exist.
              </p>
              <Navigate to="/patient/home" replace />
            </div>
          }
        />
      </Route>
    </Routes>
  )
}
