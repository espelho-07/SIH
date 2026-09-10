import type {
  FollowUpCareItem,
  FollowUpFilterOptions,
  FollowUpSummaryStats,
} from '@/types/followUp'
import { appointmentService } from './appointmentService'
import { queueService } from './queueService'

const FOLLOW_UP_STORAGE_KEY = 'healthconnect_patient_followups_v1'

const SEED_FOLLOW_UPS: FollowUpCareItem[] = [
  {
    id: 'FOL-2026-01',
    title: 'Hypertension Metabolic Review & Statin Compliance',
    condition: 'Essential Primary Hypertension & Dyslipidemia',
    specialty: 'General Medicine',
    originType: 'CONSULTATION',
    originReferenceId: 'evt-005',
    originSummary: 'Recommended by Dr. Anand Verma following OPD consultation on 07 Sep 2026',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    departmentName: 'Internal Medicine OPD-102',
    doctorName: 'Dr. Anand Verma',
    doctorRole: 'Senior Consultant Physician',
    doctorRegistrationNumber: 'UP-MC-41982',
    recommendedDateIso: '2026-09-18',
    windowStartIso: '2026-09-15',
    windowEndIso: '2026-09-22',
    status: 'DUE',
    urgency: 'PRIORITY',
    clinicalReason:
      'Evaluate therapeutic response to Telmisartan 40mg and Atorvastatin 20mg. Verify blood pressure stability and review fasting lipid assay.',
    patientInstructions: [
      'Maintain 10-12 hour overnight fasting prior to morning visit for follow-up blood panel.',
      'Carry empty medication strips to verify treatment adherence.',
      'Report any muscle aches, tenderness, or unusual fatigue.',
    ],
    prerequisiteDiagnostics: [
      {
        testId: 'diag-lipid-001',
        testName: 'Fasting Lipid Profile & Metabolic Blood Panel',
        category: 'BIOCHEMISTRY',
        status: 'REPORT_READY',
        reportId: 'rep-metabolic-001',
        reportReleasedAtIso: '2026-08-31T14:15:00.000Z',
        instructions: 'Test completed on 31 Aug 2026. Certified report is digitally linked.',
      },
    ],
    linkedMedications: [
      {
        medicineId: 'med-001',
        name: 'Tab. Atorvastatin 20mg',
        dosage: '0-0-1 (Bedtime)',
        status: 'CURRENT',
      },
      {
        medicineId: 'med-003',
        name: 'Tab. Telmisartan 40mg',
        dosage: '1-0-0 (Morning)',
        status: 'CURRENT',
      },
    ],
    linkedEpisodeId: 'episode-hypertension-2026',
    frontlineContinuity: {
      workerName: 'Sunita Devi',
      workerRole: 'ASHA',
      assignedArea: 'Ward 12, Shivpur Sector',
      lastContactIso: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      notes: 'Conducted field vitals check. Patient taking morning BP medicine regularly. Resting BP 142/90 mmHg.',
      homeVisitStatus: 'COMPLETED',
      homeVisitDate: '2026-09-08',
      vitalsObserved: {
        bp: '142/90 mmHg',
        pulse: '80 bpm',
      },
    },
    createdAtIso: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAtIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'FOL-2026-02',
    title: 'Post-Coronary Cath Lab Review & Tertiary Cardiology Workup',
    condition: 'Suspected Acute Coronary Syndrome',
    specialty: 'Cardiology',
    originType: 'REFERRAL',
    originReferenceId: 'REF-2026-9041',
    originSummary: 'Recommended following accepted tertiary referral from CHC Shivpur',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU',
    facilityTier: 'TERTIARY_AIIMS',
    facilityAddress: 'Banaras Hindu University Campus, Varanasi, Uttar Pradesh 221005',
    departmentName: 'Cardiology OPD & Cath Lab Reception',
    doctorName: 'Prof. R. C. Shukla',
    doctorRole: 'Senior Consultant Interventional Cardiologist',
    doctorRegistrationNumber: 'MCI-UP-184920',
    recommendedDateIso: '2026-09-20',
    windowStartIso: '2026-09-18',
    windowEndIso: '2026-09-25',
    status: 'SCHEDULED',
    urgency: 'PRIORITY',
    clinicalReason:
      'Review post-emergency stabilization, repeat 12-lead ECG changes, and plan elective coronary angiography under Ayushman Bharat PM-JAY.',
    patientInstructions: [
      'Report directly to Room SS-302 at Sir Sunderlal Hospital by 10:00 AM.',
      'Carry physical 12-lead ECG tracing printout from CHC Shivpur.',
      'Continue Ecosprin 75mg as prescribed; do not withhold unless instructed.',
    ],
    prerequisiteDiagnostics: [
      {
        testId: 'diag-ecg-001',
        testName: '12-Lead Electrocardiogram (ECG)',
        category: 'CARDIOLOGY',
        status: 'REPORT_READY',
        reportId: 'rep-ecg-001',
        reportReleasedAtIso: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        instructions: 'Emergency ECG tracing recorded at CHC triage.',
      },
    ],
    linkedMedications: [
      {
        medicineId: 'med-002',
        name: 'Tab. Aspirin (Ecosprin) 75mg',
        dosage: '0-1-0 (After lunch)',
        status: 'CURRENT',
      },
    ],
    linkedReferralCode: 'REF-2026-9041',
    linkedEpisodeId: 'episode-cardiac-2026',
    linkedAppointmentId: 'apt-bhu-cardio-01',
    linkedAppointmentDate: '2026-09-20',
    linkedAppointmentSlot: '10:30 AM - 11:00 AM',
    linkedRoomNumber: 'SS-302',
    frontlineContinuity: {
      workerName: 'Sunita Devi',
      workerRole: 'ASHA',
      assignedArea: 'Ward 12, Shivpur Sector',
      lastContactIso: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      notes: 'Confirmed patient has hospital transfer slip. Advised family to utilize 108 ambulance if chest discomfort recurs.',
      homeVisitStatus: 'NONE',
    },
    createdAtIso: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAtIso: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'FOL-2026-03',
    title: 'Orthopedic Contusion Recovery & Weight-Bearing Assessment',
    condition: 'Right Tibia Contusion without Cortical Break',
    specialty: 'Orthopedics',
    originType: 'CONSULTATION',
    originReferenceId: 'evt-007',
    originSummary: 'Recommended by Dr. Alok Srivastava on 16 Aug 2026',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    departmentName: 'Department of Orthopedics & Trauma',
    doctorName: 'Dr. Alok Srivastava',
    doctorRole: 'Consultant Orthopedic Surgeon',
    doctorRegistrationNumber: 'UP-MC-55912',
    recommendedDateIso: '2026-08-30',
    windowStartIso: '2026-08-28',
    windowEndIso: '2026-09-05',
    status: 'MISSED',
    urgency: 'ROUTINE',
    clinicalReason:
      'Re-examine localized soft-tissue edema and verify pain-free full weight-bearing after 14 days of immobilization bandage.',
    patientInstructions: [
      'If swelling has completely resolved and walking is pain-free, no active intervention is needed.',
      'If pain persists upon weight-bearing, re-book follow-up for repeat clinical check.',
    ],
    prerequisiteDiagnostics: [
      {
        testId: 'diag-xray-001',
        testName: 'Digital X-Ray Right Tibia-Fibula (AP & Lateral)',
        category: 'IMAGING',
        status: 'REPORT_READY',
        reportReleasedAtIso: '2026-08-16T11:30:00.000Z',
        instructions: 'Baseline radiograph verified intact bony cortex on 16 Aug 2026.',
      },
    ],
    missedNotice:
      'Your scheduled 2-week follow-up window (30 Aug) has passed. Life happens, and your healthcare team is here to support you. You can easily schedule an appointment whenever convenient.',
    createdAtIso: new Date(Date.now() - 25 * 86400 * 1000).toISOString(),
    updatedAtIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
  },
  {
    id: 'FOL-2026-04',
    title: 'Diabetic Retinopathy Follow-up & Ophthalmic Fundus Review',
    condition: 'Non-Proliferative Diabetic Retinopathy (NPDR)',
    specialty: 'Ophthalmology',
    originType: 'REFERRAL',
    originReferenceId: 'REF-2026-3819',
    originSummary: 'Completed follow-up review closing referral loop REF-2026-3819',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    departmentName: 'Department of Ophthalmology OPD-204',
    doctorName: 'Dr. Anand Verma',
    doctorRole: 'Senior Consultant Physician & Diabetologist',
    doctorRegistrationNumber: 'UP-MC-41982',
    recommendedDateIso: '2026-09-02',
    windowStartIso: '2026-09-01',
    windowEndIso: '2026-09-05',
    status: 'COMPLETED',
    urgency: 'MONITORED',
    clinicalReason:
      'Dilated funduscopic surveillance following diabetic retinopathy screening to rule out progressive macular edema.',
    patientInstructions: [
      'Maintain HbA1c target below 7.0% through diet and medication.',
      'Continue antioxidant eye drops as prescribed.',
    ],
    linkedReferralCode: 'REF-2026-3819',
    completedAtIso: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
    outcomeSummary:
      'Ophthalmoscopy reveals stable retinal vasculature with absence of macular edema. Glycemic control optimal. Next routine ophthalmic surveillance scheduled in 6 months.',
    nextFollowUpRecommended: true,
    createdAtIso: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    updatedAtIso: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
  },
]

class FollowUpService {
  private getStorage(): FollowUpCareItem[] {
    try {
      const stored = localStorage.getItem(FOLLOW_UP_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(FOLLOW_UP_STORAGE_KEY, JSON.stringify(SEED_FOLLOW_UPS))
    return SEED_FOLLOW_UPS
  }

  private setStorage(items: FollowUpCareItem[]): void {
    try {
      localStorage.setItem(FOLLOW_UP_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Fallback
    }
  }

  /**
   * Retrieves follow-up records matching filter criteria.
   */
  async getFollowUps(filter: FollowUpFilterOptions = {}): Promise<FollowUpCareItem[]> {
    const items = this.getStorage()

    return items.filter((item) => {
      // Filter by status category tab
      if (filter.statusCategory) {
        if (filter.statusCategory === 'NEEDS_ATTENTION') {
          if (item.status !== 'DUE' && item.status !== 'MISSED' && item.status !== 'RECOMMENDED') {
            return false
          }
        } else if (filter.statusCategory === 'UPCOMING') {
          if (item.status !== 'SCHEDULED' && item.status !== 'UPCOMING' && item.status !== 'RESCHEDULED') {
            return false
          }
        } else if (filter.statusCategory === 'COMPLETED') {
          if (item.status !== 'COMPLETED' && item.status !== 'NO_LONGER_REQUIRED') {
            return false
          }
        }
      }

      // Specialty filter
      if (filter.specialty && filter.specialty !== 'ALL') {
        if (item.specialty.toLowerCase() !== filter.specialty.toLowerCase()) {
          return false
        }
      }

      // Search query
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchDoctor = item.doctorName.toLowerCase().includes(q)
        const matchFacility = item.facilityName.toLowerCase().includes(q)
        const matchCondition = item.condition.toLowerCase().includes(q)
        const matchDept = item.departmentName.toLowerCase().includes(q)
        return matchTitle || matchDoctor || matchFacility || matchCondition || matchDept
      }

      return true
    })
  }

  /**
   * Retrieves single follow-up detail by ID.
   */
  async getFollowUpById(id: string): Promise<FollowUpCareItem | null> {
    const items = this.getStorage()
    return items.find((item) => item.id === id) || null
  }

  /**
   * Computes counts for tab badges.
   */
  async getSummaryStats(): Promise<FollowUpSummaryStats> {
    const items = this.getStorage()
    const needsAttention = items.filter(
      (i) => i.status === 'DUE' || i.status === 'MISSED' || i.status === 'RECOMMENDED'
    ).length
    const upcoming = items.filter(
      (i) => i.status === 'SCHEDULED' || i.status === 'UPCOMING' || i.status === 'RESCHEDULED'
    ).length
    const completed = items.filter(
      (i) => i.status === 'COMPLETED' || i.status === 'NO_LONGER_REQUIRED'
    ).length

    return {
      needsAttentionCount: needsAttention,
      upcomingCount: upcoming,
      completedCount: completed,
      totalCount: items.length,
    }
  }

  /**
   * Links a booked appointment to an active follow-up item and transitions it to SCHEDULED.
   */
  async scheduleFollowUpAppointment(
    followUpId: string,
    appointmentData: {
      appointmentId: string
      date: string
      timeSlot: string
      roomNumber?: string
    }
  ): Promise<FollowUpCareItem> {
    const items = this.getStorage()
    const index = items.findIndex((i) => i.id === followUpId)
    if (index === -1) {
      throw new Error(`Follow-up ${followUpId} not found`)
    }

    const updated: FollowUpCareItem = {
      ...items[index],
      status: 'SCHEDULED',
      linkedAppointmentId: appointmentData.appointmentId,
      linkedAppointmentDate: appointmentData.date,
      linkedAppointmentSlot: appointmentData.timeSlot,
      linkedRoomNumber: appointmentData.roomNumber || 'Room OPD-102',
      updatedAtIso: new Date().toISOString(),
    }

    items[index] = updated
    this.setStorage(items)
    return updated
  }

  /**
   * Reschedules an existing follow-up appointment.
   */
  async rescheduleFollowUp(
    followUpId: string,
    newDateIso: string,
    newSlot: string,
    reason: string
  ): Promise<FollowUpCareItem> {
    const items = this.getStorage()
    const index = items.findIndex((i) => i.id === followUpId)
    if (index === -1) {
      throw new Error(`Follow-up ${followUpId} not found`)
    }

    const current = items[index]
    if (current.linkedAppointmentId) {
      try {
        await appointmentService.rescheduleAppointment(
          current.linkedAppointmentId,
          newDateIso,
          'slot-rescheduled',
          newSlot,
          reason
        )
      } catch {
        // Continue update locally
      }
    }

    const updated: FollowUpCareItem = {
      ...current,
      status: 'SCHEDULED',
      recommendedDateIso: newDateIso,
      linkedAppointmentDate: newDateIso,
      linkedAppointmentSlot: newSlot,
      updatedAtIso: new Date().toISOString(),
    }

    items[index] = updated
    this.setStorage(items)
    return updated
  }

  /**
   * Cancels a follow-up with clear clinical audit reason.
   */
  async cancelFollowUp(followUpId: string, reason: string): Promise<FollowUpCareItem> {
    const items = this.getStorage()
    const index = items.findIndex((i) => i.id === followUpId)
    if (index === -1) {
      throw new Error(`Follow-up ${followUpId} not found`)
    }

    const current = items[index]
    if (current.linkedAppointmentId) {
      try {
        await appointmentService.cancelAppointment(current.linkedAppointmentId, reason)
      } catch {
        // Continue update locally
      }
    }

    const updated: FollowUpCareItem = {
      ...current,
      status: 'CANCELLED',
      cancellationReason: reason,
      updatedAtIso: new Date().toISOString(),
    }

    items[index] = updated
    this.setStorage(items)
    return updated
  }

  /**
   * Checks in the patient for their follow-up appointment OPD queue token (Module 03 integration).
   */
  async checkInFollowUpQueue(
    followUpId: string
  ): Promise<{ tokenNumber: string; roomNumber: string }> {
    const items = this.getStorage()
    const index = items.findIndex((i) => i.id === followUpId)
    if (index === -1) {
      throw new Error(`Follow-up ${followUpId} not found`)
    }

    const item = items[index]
    let tokenNumber = `F-${Math.floor(100 + Math.random() * 900)}`

    if (item.linkedAppointmentId) {
      try {
        const res = await appointmentService.checkInForToken(item.linkedAppointmentId)
        tokenNumber = res.tokenNumber
        await queueService.checkInAppointment(item.linkedAppointmentId)
      } catch {
        // Fallback to generated token
      }
    }

    items[index] = {
      ...item,
      linkedTokenNumber: tokenNumber,
      updatedAtIso: new Date().toISOString(),
    }
    this.setStorage(items)

    return {
      tokenNumber,
      roomNumber: item.linkedRoomNumber || 'OPD-102',
    }
  }
}

export const followUpService = new FollowUpService()
