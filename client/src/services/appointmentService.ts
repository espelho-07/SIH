import type {
  AppointmentDetail,
  AppointmentBookingRequest,
  AppointmentFilterParams,
  AvailableDate,
  TimeSlot,
  PreVisitChecklistItem,
} from '@/types/appointment'

const STORAGE_KEY = 'healthconnect_appointments_v1'

const DEFAULT_PRE_VISIT_CHECKLIST: PreVisitChecklistItem[] = [
  {
    id: 'chk-1',
    label: 'Valid Photo ID (Aadhaar, Voter ID, or ABHA Card)',
    required: true,
    description: 'Mandatory for public hospital OPD registry verification.',
  },
  {
    id: 'chk-2',
    label: 'Previous Medical Reports & Prescriptions',
    required: false,
    description: 'Carry any diagnostic test results, discharge summaries, or medicine strips.',
  },
  {
    id: 'chk-3',
    label: 'Arrive 20 Minutes Early',
    required: true,
    description: 'Allows sufficient time for digital token generation at the registration kiosk.',
  },
  {
    id: 'chk-4',
    label: 'Ayushman Bharat PM-JAY Card (If eligible)',
    required: false,
    description: 'Ensures immediate cashless registration for diagnostics and investigations.',
  },
]

// Seed Appointments for authentic public healthcare demonstration
const INITIAL_SEED_APPOINTMENTS: AppointmentDetail[] = [
  {
    id: 'apt-001',
    referenceNumber: 'APT-2026-8492',
    status: 'CONFIRMED',
    type: 'OPD_IN_PERSON',
    facilityId: 'fac-001',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    facilityPhone: '+91 542 250 4122',
    roomNumber: 'OPD-102',
    departmentId: 'dept-gen-med',
    departmentName: 'General Medicine',
    doctorId: 'doc-001',
    doctorName: 'Dr. Anand Verma',
    doctorSpecialty: 'Senior Consultant Physician',
    doctorQualification: 'MD (Internal Medicine), KGMU',
    date: getFutureDate(1), // Tomorrow
    timeSlot: '10:00 AM - 10:30 AM',
    slotId: 'slot-m-4',
    patientName: 'Rajesh Sharma',
    patientPhone: '+91 98765 43210',
    patientAge: 48,
    patientGender: 'MALE',
    abhaId: '14-8842-1920-5531',
    chiefComplaint: 'Persistent evening fever and mild chest congestion for 4 days.',
    isFirstVisit: false,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    instructions: [
      'Report directly to OPD Block A, First Floor, Room OPD-102.',
      'Show your Appointment Reference ID or SMS at the reception kiosk to receive your physical room queue token.',
      'Routine OPD consultation, basic blood tests, and government formulary medicines are 100% free of charge.',
      'Please wear a mask if you have respiratory symptoms.',
    ],
    preVisitChecklist: DEFAULT_PRE_VISIT_CHECKLIST,
    tokenNumber: 'B-042',
  },
  {
    id: 'apt-002',
    referenceNumber: 'APT-2026-7120',
    status: 'COMPLETED',
    type: 'OPD_IN_PERSON',
    facilityId: 'fac-002',
    facilityName: 'Sir Sunderlal Hospital, Institute of Medical Sciences (BHU)',
    facilityTier: 'TERTIARY_AIIMS',
    facilityAddress: 'Banaras Hindu University Campus, Varanasi, UP 221005',
    facilityPhone: '+91 542 236 7568',
    roomNumber: 'Cardio OPD-04',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology & Critical Care',
    doctorId: 'doc-003',
    doctorName: 'Dr. Rajeshwar Singh',
    doctorSpecialty: 'Chief Interventional Cardiologist',
    doctorQualification: 'DM (Cardiology), AIIMS New Delhi',
    date: getFutureDate(-5), // 5 days ago
    timeSlot: '09:30 AM - 10:00 AM',
    slotId: 'slot-m-3',
    patientName: 'Rajesh Sharma',
    patientPhone: '+91 98765 43210',
    patientAge: 48,
    patientGender: 'MALE',
    abhaId: '14-8842-1920-5531',
    chiefComplaint: 'Post-hypertension ECG review and stress test follow-up.',
    isFirstVisit: false,
    createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    instructions: [
      'Consultation completed. Prescription updated in ABHA health locker.',
      'Continue prescribed ACE inhibitors and lifestyle management.',
    ],
    preVisitChecklist: DEFAULT_PRE_VISIT_CHECKLIST,
    tokenNumber: 'C-018',
  },
  {
    id: 'apt-003',
    referenceNumber: 'APT-2026-6014',
    status: 'CANCELLED',
    type: 'OPD_IN_PERSON',
    facilityId: 'fac-003',
    facilityName: 'Community Health Centre (CHC) Shivpur',
    facilityTier: 'CHC',
    facilityAddress: 'Airport Road, Shivpur, Varanasi, UP 221003',
    facilityPhone: '+91 542 228 1145',
    roomNumber: 'Room 06',
    departmentId: 'dept-pediatrics',
    departmentName: 'Pediatrics & Child Immunization',
    doctorId: 'doc-005',
    doctorName: 'Dr. Sunita Pandey',
    doctorSpecialty: 'Pediatric Specialist',
    doctorQualification: 'DNB (Pediatrics)',
    date: getFutureDate(-12),
    timeSlot: '11:00 AM - 11:30 AM',
    slotId: 'slot-m-6',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98765 43210',
    patientAge: 6,
    patientGender: 'MALE',
    abhaId: '14-8842-1920-5532',
    chiefComplaint: 'Routine booster immunization query.',
    isFirstVisit: true,
    createdAt: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
    cancellationReason: 'Patient scheduled visit at nearest sub-centre instead.',
    cancelledAt: new Date(Date.now() - 13 * 86400 * 1000).toISOString(),
    instructions: ['Appointment was cancelled upon patient request.'],
    preVisitChecklist: DEFAULT_PRE_VISIT_CHECKLIST,
  },
]

// Helper for dynamic dates relative to today
function getFutureDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function formatDateDisplay(dateStr: string): { formattedDate: string; dayName: string; isToday: boolean } {
  const d = new Date(dateStr + 'T00:00:00')
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = dateStr === todayStr

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const dayName = dayNames[d.getDay()]
  const monthName = monthNames[d.getMonth()]
  const dayNum = d.getDate()

  const formattedDate = `${dayName.slice(0, 3)}, ${dayNum} ${monthName}`
  return { formattedDate, dayName, isToday }
}

class AppointmentService {
  private getStorage(): AppointmentDetail[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignore parse errors, fallback to seed
    }
    this.setStorage(INITIAL_SEED_APPOINTMENTS)
    return INITIAL_SEED_APPOINTMENTS
  }

  private setStorage(items: AppointmentDetail[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('LocalStorage error while persisting appointments:', err)
    }
  }

  /**
   * Generates next 7 calendar dates for OPD scheduling.
   * Public health OPDs operate Mon-Sat; Sunday is emergency-only.
   */
  async getAvailableDates(_facilityId?: string, _doctorId?: string): Promise<AvailableDate[]> {
    const dates: AvailableDate[] = []
    const today = new Date()

    for (let i = 0; i < 8; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const isSunday = d.getDay() === 0
      const { formattedDate, dayName, isToday } = formatDateDisplay(dateStr)

      dates.push({
        date: dateStr,
        formattedDate,
        dayName,
        isToday,
        isAvailable: !isSunday,
        slotsCount: isSunday ? 0 : 12,
      })
    }

    return dates
  }

  /**
   * Generates realistic OPD time slots for a specific date and doctor.
   * Morning: 08:30 AM to 01:00 PM
   * Afternoon: 02:00 PM to 04:30 PM
   */
  async getSlotsForDate(_facilityId: string, doctorId: string, dateStr: string): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [
      // Morning Session
      { id: 'slot-m-1', startTime: '08:30 AM', endTime: '09:00 AM', period: 'MORNING', capacity: 15, bookedCount: 9, available: true },
      { id: 'slot-m-2', startTime: '09:00 AM', endTime: '09:30 AM', period: 'MORNING', capacity: 15, bookedCount: 14, available: true },
      { id: 'slot-m-3', startTime: '09:30 AM', endTime: '10:00 AM', period: 'MORNING', capacity: 15, bookedCount: 15, available: false }, // Full
      { id: 'slot-m-4', startTime: '10:00 AM', endTime: '10:30 AM', period: 'MORNING', capacity: 15, bookedCount: 11, available: true },
      { id: 'slot-m-5', startTime: '10:30 AM', endTime: '11:00 AM', period: 'MORNING', capacity: 15, bookedCount: 8, available: true },
      { id: 'slot-m-6', startTime: '11:00 AM', endTime: '11:30 AM', period: 'MORNING', capacity: 15, bookedCount: 6, available: true },
      { id: 'slot-m-7', startTime: '11:30 AM', endTime: '12:00 PM', period: 'MORNING', capacity: 15, bookedCount: 12, available: true },
      { id: 'slot-m-8', startTime: '12:00 PM', endTime: '12:30 PM', period: 'MORNING', capacity: 15, bookedCount: 15, available: false }, // Full
      { id: 'slot-m-9', startTime: '12:30 PM', endTime: '01:00 PM', period: 'MORNING', capacity: 15, bookedCount: 5, available: true },

      // Afternoon Session
      { id: 'slot-a-1', startTime: '02:00 PM', endTime: '02:30 PM', period: 'AFTERNOON', capacity: 12, bookedCount: 4, available: true },
      { id: 'slot-a-2', startTime: '02:30 PM', endTime: '03:00 PM', period: 'AFTERNOON', capacity: 12, bookedCount: 7, available: true },
      { id: 'slot-a-3', startTime: '03:00 PM', endTime: '03:30 PM', period: 'AFTERNOON', capacity: 12, bookedCount: 9, available: true },
      { id: 'slot-a-4', startTime: '03:30 PM', endTime: '04:00 PM', period: 'AFTERNOON', capacity: 12, bookedCount: 12, available: false }, // Full
    ]

    // Determine availability dynamically based on pseudo-random hash
    const dateNum = parseInt(dateStr.replace(/-/g, ''), 10)
    const docNum = doctorId ? doctorId.charCodeAt(doctorId.length - 1) : 42

    return slots.map((slot, index) => {
      const hash = (dateNum + docNum + index * 7) % 10
      // ~20% of slots randomly marked booked to feel authentic
      const isBookedOut = hash === 3 || hash === 8
      return {
        ...slot,
        available: !isBookedOut,
        bookedCount: isBookedOut ? slot.capacity : Math.min(slot.bookedCount, slot.capacity - 1),
      }
    })
  }

  /**
   * Retrieves all appointments with optional status filtering.
   */
  async getMyAppointments(params?: AppointmentFilterParams): Promise<AppointmentDetail[]> {
    const list = this.getStorage()

    let filtered = [...list]

    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter((a) => a.status === params.status)
    }

    if (params?.facilityId) {
      filtered = filtered.filter((a) => a.facilityId === params.facilityId)
    }

    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.referenceNumber.toLowerCase().includes(q) ||
          a.facilityName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.departmentName.toLowerCase().includes(q)
      )
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return filtered
  }

  /**
   * Retrieves a single appointment by its internal ID or reference number.
   */
  async getAppointmentById(idOrRef: string): Promise<AppointmentDetail | null> {
    const list = this.getStorage()
    const found = list.find((a) => a.id === idOrRef || a.referenceNumber === idOrRef)
    return found || null
  }

  /**
   * Books a new appointment with official reference number generation.
   */
  async bookAppointment(request: AppointmentBookingRequest): Promise<AppointmentDetail> {
    // Generate official public appointment reference number (e.g. APT-2026-9284)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const referenceNumber = `APT-2026-${randomSuffix}`
    const id = `apt-${Date.now()}`

    const newAppointment: AppointmentDetail = {
      id,
      referenceNumber,
      status: 'CONFIRMED',
      type: request.type,
      facilityId: request.facilityId,
      facilityName: request.facilityName,
      facilityTier: request.facilityTier,
      facilityAddress: request.facilityAddress,
      facilityPhone: '+91 542 250 4122',
      roomNumber: 'OPD Desk',
      departmentId: request.departmentId,
      departmentName: request.departmentName,
      doctorId: request.doctorId,
      doctorName: request.doctorName,
      doctorSpecialty: request.doctorSpecialty,
      doctorQualification: 'Senior Medical Officer',
      date: request.date,
      timeSlot: request.timeSlot,
      slotId: request.slotId,
      patientName: request.patientName,
      patientPhone: request.patientPhone,
      patientAge: request.patientAge,
      patientGender: request.patientGender,
      abhaId: request.abhaId,
      chiefComplaint: request.chiefComplaint,
      isFirstVisit: request.isFirstVisit,
      createdAt: new Date().toISOString(),
      instructions: [
        'Report directly to the registration counter or designated OPD room.',
        'Show this reference number (or SMS alert) to receive your room entry token.',
        'Government hospital OPD consultations and essential medicines are free of charge under NHM.',
        'Carry your ABHA / Aadhaar card and any previous diagnostic records.',
      ],
      preVisitChecklist: DEFAULT_PRE_VISIT_CHECKLIST,
    }

    const currentList = this.getStorage()
    this.setStorage([newAppointment, ...currentList])

    return newAppointment
  }

  /**
   * Reschedules an existing appointment to a new date and time slot.
   */
  async rescheduleAppointment(
    id: string,
    newDate: string,
    newSlotId: string,
    newTimeSlot: string,
    reason?: string
  ): Promise<AppointmentDetail> {
    const list = this.getStorage()
    const index = list.findIndex((a) => a.id === id)

    if (index === -1) {
      throw new Error('Appointment not found.')
    }

    const existing = list[index]
    const updated: AppointmentDetail = {
      ...existing,
      rescheduledFrom: `${existing.date} (${existing.timeSlot})`,
      date: newDate,
      slotId: newSlotId,
      timeSlot: newTimeSlot,
      status: 'CONFIRMED',
      instructions: [
        `Rescheduled from ${existing.date}. Please arrive during your new scheduled window.`,
        ...existing.instructions.filter((i) => !i.startsWith('Rescheduled')),
      ],
    }

    if (reason) {
      updated.instructions.push(`Reschedule reason: ${reason}`)
    }

    list[index] = updated
    this.setStorage(list)
    return updated
  }

  /**
   * Cancels an appointment with patient-provided reason.
   */
  async cancelAppointment(id: string, reason: string): Promise<AppointmentDetail> {
    const list = this.getStorage()
    const index = list.findIndex((a) => a.id === id)

    if (index === -1) {
      throw new Error('Appointment not found.')
    }

    const existing = list[index]
    const updated: AppointmentDetail = {
      ...existing,
      status: 'CANCELLED',
      cancellationReason: reason || 'Cancelled by patient',
      cancelledAt: new Date().toISOString(),
      instructions: [`Appointment cancelled on ${new Date().toLocaleDateString()}. You can rebook at any time.`],
    }

    list[index] = updated
    this.setStorage(list)
    return updated
  }

  /**
   * Check in on appointment day to receive a real-time room token.
   */
  async checkInForToken(id: string): Promise<{ tokenNumber: string; estimatedWaitMins: number }> {
    const list = this.getStorage()
    const index = list.findIndex((a) => a.id === id)

    if (index === -1) {
      throw new Error('Appointment not found.')
    }

    const tokenNumber = `B-0${Math.floor(20 + Math.random() * 50)}`
    const estimatedWaitMins = Math.floor(15 + Math.random() * 25)

    list[index].tokenNumber = tokenNumber
    this.setStorage(list)

    return { tokenNumber, estimatedWaitMins }
  }
}

export const appointmentService = new AppointmentService()
