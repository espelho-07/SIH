/**
 * HealthConnect Domain: Unified Notifications & Patient Action Center Types
 * Aligned with ABDM, FHIR R4 Communication/Task, and National Health Mission (NHM) standards.
 */

export type NotificationCategory =
  | 'APPOINTMENT'
  | 'QUEUE'
  | 'REFERRAL'
  | 'DIAGNOSTIC'
  | 'PRESCRIPTION'
  | 'FOLLOW_UP'
  | 'EMERGENCY'
  | 'CARE_UPDATE'
  | 'SYSTEM'

export type NotificationPriority =
  | 'CRITICAL'        // Life-critical or time-urgent clinical events (e.g. Queue token called, Trauma re-routing)
  | 'IMPORTANT'       // High-priority care continuity updates (e.g. Follow-up due, Referral accepted)
  | 'ACTION_REQUIRED' // Action required from patient (e.g. Sample collection pending, OPD Check-in)
  | 'INFORMATIONAL'   // Standard notifications (e.g. Lab report ready, Prescription on record)

export interface NotificationItem {
  id: string                      // Stable deterministic composite ID (e.g. "notif-ref-001-ACCEPTED")
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  timestampIso: string
  relativeTime: string
  isRead: boolean
  readAtIso?: string
  actionLabel?: string            // e.g. "View Referral", "Check-in to Queue", "Book Follow-up"
  actionUrl: string               // Safe internal deep-link route (e.g. "/patient/referrals/ref-001")
  sourceModule: string            // e.g. "Module 04: Referrals"
  entityId: string                // e.g. "ref-001", "apt-001", "dx-001"
  facilityName?: string
  doctorName?: string
}

export type ActionCenterTaskType =
  | 'APPROACH_CONSULTATION_ROOM'
  | 'BOOK_REFERRAL_APPOINTMENT'
  | 'SCHEDULE_FOLLOW_UP'
  | 'RESCHEDULE_MISSED_VISIT'
  | 'COLLECT_DIAGNOSTIC_SAMPLE'
  | 'REVIEW_LAB_REPORT'
  | 'CHECK_IN_OPD_QUEUE'

export interface ActionCenterItem {
  id: string                      // e.g. "action-ref-001"
  taskType: ActionCenterTaskType
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  title: string                   // "Book Specialist Consultation at Receiving Hospital"
  reason: string                  // "Referral accepted by Sir Sunderlal Hospital. Please confirm specialist slot."
  deadlineContext?: string        // "Recommended within 48 hours"
  ctaText: string                 // "Book Appointment Slot"
  targetUrl: string               // "/patient/appointments/book?referralCode=REF-2026-9041"
  sourceModule: string            // "Referral & Care Continuity"
  entityId: string
  facilityName?: string
  doctorName?: string
  actionCompleted?: boolean
}

export interface NotificationPreferences {
  inAppEnabled: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  pushEnabled: boolean
  browserPermissionStatus: 'default' | 'granted' | 'denied' | 'unsupported'

  // Category Subscriptions
  appointments: boolean
  queueTokens: boolean
  referrals: boolean
  diagnostics: boolean
  prescriptions: boolean
  followUps: boolean
  emergencyAlerts: boolean        // Always true, non-disableable for clinical safety
}
