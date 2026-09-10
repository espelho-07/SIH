export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'MISSED'

export type AppointmentType = 'OPD_IN_PERSON' | 'TELECONSULTATION'

export type DayPeriod = 'MORNING' | 'AFTERNOON'

export interface TimeSlot {
  id: string
  startTime: string // e.g. "09:00 AM"
  endTime: string   // e.g. "09:30 AM"
  period: DayPeriod
  available: boolean
  bookedCount: number
  capacity: number
}

export interface AvailableDate {
  date: string          // "YYYY-MM-DD"
  formattedDate: string // "Thu, 11 Sep"
  dayName: string       // "Thursday"
  isToday: boolean
  isAvailable: boolean
  slotsCount: number
}

export interface AppointmentBookingRequest {
  facilityId: string
  facilityName: string
  facilityTier: string
  facilityAddress: string
  departmentId: string
  departmentName: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  date: string          // "YYYY-MM-DD"
  slotId: string
  timeSlot: string      // "09:00 AM - 09:30 AM"
  type: AppointmentType
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: 'MALE' | 'FEMALE' | 'OTHER'
  abhaId?: string
  chiefComplaint: string
  isFirstVisit: boolean
}

export interface PreVisitChecklistItem {
  id: string
  label: string
  required: boolean
  description: string
}

export interface AppointmentDetail {
  id: string
  referenceNumber: string // e.g. "APT-2026-4821"
  status: AppointmentStatus
  type: AppointmentType
  facilityId: string
  facilityName: string
  facilityTier: string
  facilityAddress: string
  facilityPhone: string
  roomNumber: string
  departmentId: string
  departmentName: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  doctorQualification: string
  date: string // "YYYY-MM-DD"
  timeSlot: string
  slotId: string
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: 'MALE' | 'FEMALE' | 'OTHER'
  abhaId?: string
  chiefComplaint: string
  isFirstVisit: boolean
  createdAt: string
  rescheduledFrom?: string
  cancellationReason?: string
  cancelledAt?: string
  instructions: string[]
  preVisitChecklist: PreVisitChecklistItem[]
  tokenNumber?: string
}

export interface AppointmentFilterParams {
  status?: 'ALL' | AppointmentStatus
  facilityId?: string
  search?: string
}
