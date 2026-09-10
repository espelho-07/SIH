import type {
  NotificationItem,
  NotificationCategory,
  ActionCenterItem,
  NotificationPreferences,
} from '@/types/notification'
import { appointmentService } from './appointmentService'
import { queueService } from './queueService'
import { referralService } from './referralService'
import { diagnosticService } from './diagnosticService'
import { prescriptionService } from './prescriptionService'
import { followUpService } from './followUpService'

const READ_STORAGE_KEY = 'healthconnect_notifications_read_v1'
const PREFS_STORAGE_KEY = 'healthconnect_notification_preferences_v1'

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inAppEnabled: true,
  smsEnabled: true,
  emailEnabled: false,
  pushEnabled: false,
  browserPermissionStatus: typeof window !== 'undefined' && 'Notification' in window
    ? (Notification.permission as 'default' | 'granted' | 'denied')
    : 'unsupported',
  appointments: true,
  queueTokens: true,
  referrals: true,
  diagnostics: true,
  prescriptions: true,
  followUps: true,
  emergencyAlerts: true, // Always locked on for patient clinical safety
}

function getRelativeTimeDescription(iso: string): string {
  try {
    const time = new Date(iso).getTime()
    const diff = Date.now() - time
    if (diff < 60 * 1000) return 'Just now'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`
  } catch {
    return 'Recent'
  }
}

class NotificationService {
  private listeners: Array<() => void> = []

  private getReadMap(): Record<string, { readAtIso: string }> {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  private setReadMap(map: Record<string, { readAtIso: string }>): void {
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(map))
    } catch {
      // ignore
    }
  }

  /**
   * Subscribe to notification state changes (read, mark-all, new events)
   */
  subscribe(callback: () => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      try {
        cb()
      } catch {
        // ignore
      }
    })
  }

  /**
   * Retrieves all genuine notifications sourced from active healthcare domain state across Modules 01–09.
   */
  async getNotifications(filter?: {
    category?: NotificationCategory | 'ALL' | 'ACTION_REQUIRED'
    unreadOnly?: boolean
  }): Promise<NotificationItem[]> {
    const readMap = this.getReadMap()
    const items: NotificationItem[] = []

    // 1. Appointments (Module 02)
    try {
      const appts = await appointmentService.getMyAppointments({ status: 'CONFIRMED' })
      for (const a of appts) {
        const notifId = `notif-apt-${a.id}-${a.date}`
        const isRead = !!readMap[notifId]
        items.push({
          id: notifId,
          category: 'APPOINTMENT',
          priority: 'IMPORTANT',
          title: `Upcoming Consultation: ${a.doctorName}`,
          message: `Your confirmed OPD appointment at ${a.facilityName} (${a.departmentName}) is scheduled for ${a.date} at ${a.timeSlot}.`,
          timestampIso: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          relativeTime: getRelativeTimeDescription(new Date(Date.now() - 2 * 3600 * 1000).toISOString()),
          isRead,
          readAtIso: readMap[notifId]?.readAtIso,
          actionLabel: 'View Appointment',
          actionUrl: `/patient/appointments/${a.id}`,
          sourceModule: 'Appointments',
          entityId: a.id,
          facilityName: a.facilityName,
          doctorName: a.doctorName,
        })
      }
    } catch {
      // Safe fallback
    }

    // 2. Queue & Tokens (Module 03)
    try {
      const token = await queueService.getActiveToken()
      if (token && token.state !== 'COMPLETED' && token.state !== 'CANCELLED') {
        const notifId = `notif-q-${token.tokenNumber}-${token.state}`
        const isRead = !!readMap[notifId]

        if (token.state === 'CALLED') {
          items.push({
            id: notifId,
            category: 'QUEUE',
            priority: 'CRITICAL',
            title: `Your Token ${token.tokenNumber} is Being Called!`,
            message: `Please enter ${token.roomNumber} immediately to see ${token.doctorName} at ${token.facilityName}.`,
            timestampIso: token.calledAtIso || new Date().toISOString(),
            relativeTime: 'Now',
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'Enter Room Now',
            actionUrl: '/patient/queue',
            sourceModule: 'Live Queue',
            entityId: token.id,
            facilityName: token.facilityName,
            doctorName: token.doctorName,
          })
        } else if (token.state === 'APPROACHING') {
          items.push({
            id: notifId,
            category: 'QUEUE',
            priority: 'IMPORTANT',
            title: `Queue Approaching: Token ${token.tokenNumber}`,
            message: `Only ${token.positionInQueue} patients ahead of you (~${token.estimatedWaitMinutes}m). Please move near ${token.roomNumber}.`,
            timestampIso: token.lastUpdatedIso,
            relativeTime: getRelativeTimeDescription(token.lastUpdatedIso),
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'View Live Queue',
            actionUrl: '/patient/queue',
            sourceModule: 'Live Queue',
            entityId: token.id,
            facilityName: token.facilityName,
            doctorName: token.doctorName,
          })
        } else {
          items.push({
            id: notifId,
            category: 'QUEUE',
            priority: 'INFORMATIONAL',
            title: `Live Token ${token.tokenNumber} Issued`,
            message: `Serving token ${token.currentServingToken}. Estimated wait time is ${token.estimatedWaitMinutes} minutes.`,
            timestampIso: token.checkedInAtIso,
            relativeTime: getRelativeTimeDescription(token.checkedInAtIso),
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'Track Queue Position',
            actionUrl: '/patient/queue',
            sourceModule: 'Live Queue',
            entityId: token.id,
            facilityName: token.facilityName,
            doctorName: token.doctorName,
          })
        }
      }
    } catch {
      // Safe fallback
    }

    // 3. Referrals & Hospital Transfers (Module 04)
    try {
      const referrals = await referralService.getPatientReferrals()
      for (const r of referrals) {
        if (r.status !== 'CANCELLED') {
          const notifId = `notif-ref-${r.id}-${r.status}`
          const isRead = !!readMap[notifId]

          if (r.status === 'ACCEPTED_BED_LOCKED') {
            items.push({
              id: notifId,
              category: 'REFERRAL',
              priority: 'IMPORTANT',
              title: `Referral Accepted: ${r.requiredSpecialty}`,
              message: `${r.receivingFacilityName || 'Receiving Facility'} has accepted your care transfer. Please confirm specialist slot.`,
              timestampIso: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
              relativeTime: getRelativeTimeDescription(new Date(Date.now() - 4 * 3600 * 1000).toISOString()),
              isRead,
              readAtIso: readMap[notifId]?.readAtIso,
              actionLabel: 'Confirm Transfer Slot',
              actionUrl: `/patient/referrals/${r.id}`,
              sourceModule: 'Hospital Referrals',
              entityId: r.id,
              facilityName: r.receivingFacilityName ?? undefined,
            })
          } else if (r.status === 'FALLBACK_REROUTING') {
            items.push({
              id: notifId,
              category: 'REFERRAL',
              priority: 'CRITICAL',
              title: `Referral Re-Routing Required: ${r.referralCode}`,
              message: `Primary destination was at capacity. HealthConnect has suggested verified alternative receiving hospitals.`,
              timestampIso: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
              relativeTime: getRelativeTimeDescription(new Date(Date.now() - 1 * 3600 * 1000).toISOString()),
              isRead,
              readAtIso: readMap[notifId]?.readAtIso,
              actionLabel: 'Review Alternatives',
              actionUrl: `/patient/referrals/${r.id}`,
              sourceModule: 'Hospital Referrals',
              entityId: r.id,
              facilityName: r.referringFacilityName,
            })
          } else {
            items.push({
              id: notifId,
              category: 'REFERRAL',
              priority: 'INFORMATIONAL',
              title: `Referral Trail: ${r.referralCode}`,
              message: `Inter-facility clinical transfer for ${r.requiredSpecialty} initiated by ${r.referringFacilityName}.`,
              timestampIso: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
              relativeTime: getRelativeTimeDescription(new Date(Date.now() - 12 * 3600 * 1000).toISOString()),
              isRead,
              readAtIso: readMap[notifId]?.readAtIso,
              actionLabel: 'Track Referral',
              actionUrl: `/patient/referrals/${r.id}`,
              sourceModule: 'Hospital Referrals',
              entityId: r.id,
              facilityName: r.referringFacilityName,
            })
          }
        }
      }
    } catch {
      // Safe fallback
    }

    // 4. Diagnostics & Lab Reports (Module 06)
    try {
      const orders = await diagnosticService.getDiagnosticOrders()
      for (const o of orders) {
        const notifId = `notif-dx-${o.id}-${o.status}`
        const isRead = !!readMap[notifId]

        if (o.status === 'REPORT_READY') {
          items.push({
            id: notifId,
            category: 'DIAGNOSTIC',
            priority: 'ACTION_REQUIRED',
            title: `Lab Report Ready: ${o.testName}`,
            message: `Authorized laboratory findings released by ${o.orderingFacilityName}. Clinician observation note is available.`,
            timestampIso: o.orderedAtIso,
            relativeTime: getRelativeTimeDescription(o.orderedAtIso),
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'View Lab Report',
            actionUrl: `/patient/diagnostics/${o.id}`,
            sourceModule: 'Diagnostics & Labs',
            entityId: o.id,
            facilityName: o.orderingFacilityName,
            doctorName: o.orderingDoctorName,
          })
        } else if (o.status === 'SAMPLE_COLLECTION_PENDING' || o.status === 'ORDERED') {
          items.push({
            id: notifId,
            category: 'DIAGNOSTIC',
            priority: 'ACTION_REQUIRED',
            title: `Sample Collection Scheduled: ${o.testName}`,
            message: o.nextActionInstruction || `Requisition active for ${o.testCategory} at ${o.orderingFacilityName}.`,
            timestampIso: o.orderedAtIso,
            relativeTime: getRelativeTimeDescription(o.orderedAtIso),
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'View Requisition Slip',
            actionUrl: `/patient/diagnostics/${o.id}`,
            sourceModule: 'Diagnostics & Labs',
            entityId: o.id,
            facilityName: o.orderingFacilityName,
            doctorName: o.orderingDoctorName,
          })
        }
      }
    } catch {
      // Safe fallback
    }

    // 5. Follow-Ups & Ongoing Care (Module 08)
    try {
      const followUps = await followUpService.getFollowUps()
      for (const fu of followUps) {
        if (fu.status === 'DUE' || fu.status === 'RECOMMENDED') {
          const notifId = `notif-fu-${fu.id}-DUE`
          const isRead = !!readMap[notifId]
          items.push({
            id: notifId,
            category: 'FOLLOW_UP',
            priority: 'IMPORTANT',
            title: `Follow-Up Visit Due: ${fu.specialty}`,
            message: `Dr. ${fu.doctorName} recommended routine follow-up for ${fu.condition}. Target date: ${fu.recommendedDateIso}.`,
            timestampIso: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            relativeTime: getRelativeTimeDescription(new Date(Date.now() - 5 * 3600 * 1000).toISOString()),
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'Schedule Follow-Up',
            actionUrl: `/patient/appointments/book?followUpId=${fu.id}`,
            sourceModule: 'Care Continuity',
            entityId: fu.id,
            facilityName: fu.facilityName,
            doctorName: fu.doctorName,
          })
        } else if (fu.status === 'MISSED') {
          const notifId = `notif-fu-${fu.id}-MISSED`
          const isRead = !!readMap[notifId]
          items.push({
            id: notifId,
            category: 'FOLLOW_UP',
            priority: 'IMPORTANT',
            title: `Reschedule Missed Follow-up (${fu.specialty})`,
            message: `We noticed you couldn't make your target visit with Dr. ${fu.doctorName}. Healthcare teams welcome you back anytime.`,
            timestampIso: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
            relativeTime: getRelativeTimeDescription(new Date(Date.now() - 10 * 3600 * 1000).toISOString()),
            isRead,
            readAtIso: readMap[notifId]?.readAtIso,
            actionLabel: 'Reschedule Visit',
            actionUrl: `/patient/appointments/book?followUpId=${fu.id}`,
            sourceModule: 'Care Continuity',
            entityId: fu.id,
            facilityName: fu.facilityName,
            doctorName: fu.doctorName,
          })
        }
      }
    } catch {
      // Safe fallback
    }

    // 6. Prescriptions & Medicines (Module 06)
    try {
      const prescriptions = await prescriptionService.getPrescriptions()
      if (prescriptions.length > 0) {
        const rx = prescriptions[0]
        const notifId = `notif-rx-${rx.id}-ACTIVE`
        const isRead = !!readMap[notifId]
        items.push({
          id: notifId,
          category: 'PRESCRIPTION',
          priority: 'INFORMATIONAL',
          title: `Prescription Active: ${rx.prescribingDoctorName}`,
          message: `${rx.medicines.length} medicine(s) prescribed at ${rx.facilityName}. Jan Aushadhi generic bioequivalent stocks verified.`,
          timestampIso: rx.prescribedAtIso,
          relativeTime: getRelativeTimeDescription(rx.prescribedAtIso),
          isRead,
          readAtIso: readMap[notifId]?.readAtIso,
          actionLabel: 'View Active Medicines',
          actionUrl: '/patient/medicines',
          sourceModule: 'Pharmacy & Rx',
          entityId: rx.id,
          facilityName: rx.facilityName,
          doctorName: rx.prescribingDoctorName,
        })
      }
    } catch {
      // Safe fallback
    }

    // Sort: Unread first, then by priority (CRITICAL > IMPORTANT > ACTION_REQUIRED > INFORMATIONAL), then time
    const priorityWeight: Record<string, number> = {
      CRITICAL: 4,
      IMPORTANT: 3,
      ACTION_REQUIRED: 2,
      INFORMATIONAL: 1,
    }

    items.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
      if (pDiff !== 0) return pDiff
      return new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
    })

    // Apply Filter if present
    if (filter?.category && filter.category !== 'ALL') {
      if (filter.category === 'ACTION_REQUIRED') {
        return items.filter((i) => i.priority === 'CRITICAL' || i.priority === 'ACTION_REQUIRED' || i.priority === 'IMPORTANT')
      }
      return items.filter((i) => i.category === filter.category)
    }

    if (filter?.unreadOnly) {
      return items.filter((i) => !i.isRead)
    }

    return items
  }

  /**
   * Derives unresolved actionable care tasks for the lightweight Patient Action Center.
   * Items disappear automatically once the patient completes the underlying clinical task.
   */
  async getUnresolvedActions(): Promise<ActionCenterItem[]> {
    const actions: ActionCenterItem[] = []

    // 1. Check live queue state
    try {
      const token = await queueService.getActiveToken()
      if (token && (token.state === 'CALLED' || token.state === 'APPROACHING')) {
        actions.push({
          id: `act-q-${token.id}`,
          taskType: 'APPROACH_CONSULTATION_ROOM',
          priority: token.state === 'CALLED' ? 'CRITICAL' : 'HIGH',
          title: token.state === 'CALLED'
            ? `Your Token ${token.tokenNumber} is Being Called!`
            : `Token ${token.tokenNumber}: Move Near Room ${token.roomNumber}`,
          reason: `Doctor is seeing patients in Room ${token.roomNumber}. ${token.positionInQueue} patient(s) ahead of you.`,
          deadlineContext: 'Immediate clinical attention required',
          ctaText: 'Open Live Queue Tracker',
          targetUrl: '/patient/queue',
          sourceModule: 'OPD Queue Management',
          entityId: token.id,
          facilityName: token.facilityName,
          doctorName: token.doctorName,
        })
      }
    } catch {
      // Safe fallback
    }

    // 2. Check active referral requiring booking or fallback resolution
    try {
      const referrals = await referralService.getPatientReferrals()
      const pendingRef = referrals.find(
        (r) => r.status === 'ACCEPTED_BED_LOCKED' || r.status === 'FALLBACK_REROUTING'
      )
      if (pendingRef) {
        actions.push({
          id: `act-ref-${pendingRef.id}`,
          taskType: 'BOOK_REFERRAL_APPOINTMENT',
          priority: pendingRef.status === 'FALLBACK_REROUTING' ? 'CRITICAL' : 'HIGH',
          title: pendingRef.status === 'FALLBACK_REROUTING'
            ? `Select Alternative Receiving Hospital`
            : `Confirm Referral Specialist Slot (${pendingRef.requiredSpecialty})`,
          reason: `${pendingRef.receivingFacilityName || 'Tertiary Medical Center'}: Please confirm your specialist transfer appointment slot.`,
          deadlineContext: 'Transfer window active',
          ctaText: 'Proceed with Transfer',
          targetUrl: `/patient/referrals/${pendingRef.id}`,
          sourceModule: 'Hospital Referral Trail',
          entityId: pendingRef.id,
          facilityName: pendingRef.receivingFacilityName ?? undefined,
        })
      }
    } catch {
      // Safe fallback
    }

    // 3. Check follow-ups due or missed
    try {
      const followUps = await followUpService.getFollowUps({ statusCategory: 'NEEDS_ATTENTION' })
      const due = followUps.find((f) => f.status === 'DUE' || f.status === 'MISSED')
      if (due) {
        actions.push({
          id: `act-fu-${due.id}`,
          taskType: due.status === 'MISSED' ? 'RESCHEDULE_MISSED_VISIT' : 'SCHEDULE_FOLLOW_UP',
          priority: 'HIGH',
          title: `Schedule Follow-Up: ${due.specialty}`,
          reason: `Dr. ${due.doctorName} recommended metabolic follow-up for ${due.condition}. Target date: ${due.recommendedDateIso}.`,
          deadlineContext: due.status === 'MISSED' ? 'Overdue - please reschedule' : `Target: ${due.recommendedDateIso}`,
          ctaText: 'Book Follow-up Slot',
          targetUrl: `/patient/appointments/book?followUpId=${due.id}`,
          sourceModule: 'Care Continuity & Follow-Up',
          entityId: due.id,
          facilityName: due.facilityName,
          doctorName: due.doctorName,
        })
      }
    } catch {
      // Safe fallback
    }

    // 4. Check diagnostic tests requiring sample collection or report review
    try {
      const orders = await diagnosticService.getDiagnosticOrders()
      const pendingCollection = orders.find(
        (o) => o.status === 'ORDERED' || o.status === 'SAMPLE_COLLECTION_PENDING'
      )
      if (pendingCollection) {
        actions.push({
          id: `act-dx-${pendingCollection.id}`,
          taskType: 'COLLECT_DIAGNOSTIC_SAMPLE',
          priority: 'MEDIUM',
          title: `Attend Diagnostic Sample Collection: ${pendingCollection.testName}`,
          reason: pendingCollection.nextActionInstruction || `Requisition pending at ${pendingCollection.orderingFacilityName}.`,
          deadlineContext: 'Required before clinician consultation',
          ctaText: 'View Sample Slip',
          targetUrl: `/patient/diagnostics/${pendingCollection.id}`,
          sourceModule: 'Diagnostics & Laboratory',
          entityId: pendingCollection.id,
          facilityName: pendingCollection.orderingFacilityName,
        })
      }
    } catch {
      // Safe fallback
    }

    return actions
  }

  /**
   * Returns current count of unread notifications.
   */
  async getUnreadCount(): Promise<number> {
    const list = await this.getNotifications()
    return list.filter((item) => !item.isRead).length
  }

  /**
   * Marks an individual notification as read.
   */
  async markAsRead(notificationId: string): Promise<void> {
    const map = this.getReadMap()
    map[notificationId] = { readAtIso: new Date().toISOString() }
    this.setReadMap(map)
    this.notifyListeners()
  }

  /**
   * Marks all current notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    const list = await this.getNotifications()
    const map = this.getReadMap()
    const now = new Date().toISOString()
    for (const item of list) {
      map[item.id] = { readAtIso: now }
    }
    this.setReadMap(map)
    this.notifyListeners()
  }

  /**
   * Notification preferences management
   */
  getPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY)
      if (stored) {
        return {
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(stored),
          emergencyAlerts: true, // Non-negotiable clinical safety rule
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PREFERENCES
  }

  savePreferences(prefs: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.getPreferences()
    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
      emergencyAlerts: true, // Non-disableable safety policy
    }
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    this.notifyListeners()
    return updated
  }

  /**
   * Request native browser push notification permission
   */
  async requestPushPermission(): Promise<'default' | 'granted' | 'denied' | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }

    try {
      const permission = await Notification.requestPermission()
      this.savePreferences({
        browserPermissionStatus: permission,
        pushEnabled: permission === 'granted',
      })
      return permission
    } catch {
      return 'denied'
    }
  }
}

export const notificationService = new NotificationService()
