import type { ActiveToken, QueueHistoryItem, QueuePatientState } from '@/types/queue'

const QUEUE_STORAGE_KEY = 'healthconnect_active_queues_v1'
const HISTORY_STORAGE_KEY = 'healthconnect_queue_history_v1'

const INITIAL_ACTIVE_QUEUES: ActiveToken[] = [
  {
    id: 'tkn-001',
    appointmentId: 'apt-001',
    referenceNumber: 'APT-2026-8492',
    tokenNumber: 'B-042',
    facilityId: 'fac-001',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    departmentName: 'General Medicine',
    doctorName: 'Dr. Anand Verma',
    doctorSpecialty: 'Senior Consultant Physician',
    roomNumber: 'Room OPD-102',
    state: 'WAITING',
    status: 'ISSUED',
    priority: 'GENERAL',
    visitType: 'OPD_CONSULTATION',
    currentServingToken: 'B-031',
    positionInQueue: 11,
    totalWaiting: 18,
    estimatedWaitMinutes: 28,
    estimatedWaitRange: '25–35 min',
    isDelayed: false,
    isPaused: false,
    nextActionInstruction:
      'Please remain in the OPD Block A waiting hall. You have ample time before your consultation.',
    checkedInAtIso: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastUpdatedIso: new Date().toISOString(),
  },
  {
    id: 'tkn-002',
    tokenNumber: 'D-018',
    facilityId: 'fac-001',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    departmentName: 'Central Diagnostics & Pathology',
    doctorName: 'Dr. Manisha Rao',
    doctorSpecialty: 'Chief Pathologist',
    roomNumber: 'Lab Counter 03',
    state: 'APPROACHING',
    status: 'ISSUED',
    priority: 'GENERAL',
    visitType: 'DIAGNOSTICS_LAB',
    currentServingToken: 'D-016',
    positionInQueue: 2,
    totalWaiting: 6,
    estimatedWaitMinutes: 6,
    estimatedWaitRange: '5–10 min',
    isDelayed: false,
    isPaused: false,
    nextActionInstruction:
      'You are almost up. Please proceed to the Lab Counter 03 doorway with your sample collection slip.',
    checkedInAtIso: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastUpdatedIso: new Date().toISOString(),
  },
]

const INITIAL_QUEUE_HISTORY: QueueHistoryItem[] = [
  {
    id: 'hist-001',
    date: '2026-09-05',
    tokenNumber: 'C-018',
    facilityName: 'Sir Sunderlal Hospital (BHU)',
    departmentName: 'Cardiology & Critical Care',
    doctorName: 'Dr. Rajeshwar Singh',
    roomNumber: 'Cardio OPD-04',
    outcome: 'COMPLETED',
    completedAtIso: '2026-09-05T10:15:00.000Z',
    prescriptionAvailable: true,
  },
  {
    id: 'hist-002',
    date: '2026-08-28',
    tokenNumber: 'L-084',
    facilityName: 'Community Health Centre (CHC) Shivpur',
    departmentName: 'Blood & Biochemistry Lab',
    doctorName: 'Dr. Sunita Pandey',
    roomNumber: 'Sample Lab B',
    outcome: 'COMPLETED',
    completedAtIso: '2026-08-28T11:40:00.000Z',
    prescriptionAvailable: true,
  },
]

class QueueService {
  private getStorage(): ActiveToken[] {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Fallback to seed on parse error
    }
    this.setStorage(INITIAL_ACTIVE_QUEUES)
    return INITIAL_ACTIVE_QUEUES
  }

  private setStorage(items: ActiveToken[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('LocalStorage error while saving queues:', err)
    }
  }

  private getHistoryStorage(): QueueHistoryItem[] {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Fallback
    }
    this.setHistoryStorage(INITIAL_QUEUE_HISTORY)
    return INITIAL_QUEUE_HISTORY
  }

  private setHistoryStorage(items: QueueHistoryItem[]): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('LocalStorage error while saving queue history:', err)
    }
  }

  /**
   * Retrieves all active queue items for the patient.
   */
  async getActiveQueues(): Promise<ActiveToken[]> {
    const list = this.getStorage()
    // Return items that are not completed or cancelled
    return list.filter((item) => item.state !== 'COMPLETED' && item.state !== 'CANCELLED')
  }

  /**
   * Retrieves a specific active token or defaults to the primary queue.
   */
  async getActiveToken(tokenIdOrTokenNumber?: string): Promise<ActiveToken | null> {
    const list = this.getStorage()
    if (!tokenIdOrTokenNumber) {
      const active = list.find((item) => item.state !== 'COMPLETED' && item.state !== 'CANCELLED')
      return active || list[0] || null
    }

    const found = list.find(
      (item) => item.id === tokenIdOrTokenNumber || item.tokenNumber === tokenIdOrTokenNumber
    )
    return found || null
  }

  /**
   * Check in to an appointment on the day of visit, assigning a live token.
   */
  async checkInAppointment(appointmentId: string): Promise<ActiveToken> {
    const list = this.getStorage()
    const existing = list.find((item) => item.appointmentId === appointmentId)
    if (existing) {
      return existing
    }

    const randomSuffix = Math.floor(20 + Math.random() * 50)
    const tokenNumber = `B-0${randomSuffix}`
    const servingNumber = `B-0${Math.max(1, randomSuffix - 8)}`
    const position = 8
    const waitMins = position * 3

    const newToken: ActiveToken = {
      id: `tkn-${Date.now()}`,
      appointmentId,
      referenceNumber: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber,
      facilityId: 'fac-001',
      facilityName: 'Pandit Deendayal Upadhyay District Hospital',
      facilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
      departmentName: 'General Medicine',
      doctorName: 'Dr. Anand Verma',
      doctorSpecialty: 'Senior Consultant Physician',
      roomNumber: 'Room OPD-102',
      state: 'WAITING',
      status: 'ISSUED',
      priority: 'GENERAL',
      visitType: 'OPD_CONSULTATION',
      currentServingToken: servingNumber,
      positionInQueue: position,
      totalWaiting: position + 5,
      estimatedWaitMinutes: waitMins,
      estimatedWaitRange: `${waitMins - 5}–${waitMins + 5} min`,
      isDelayed: false,
      isPaused: false,
      nextActionInstruction:
        'You are checked in. Please proceed to the OPD Block A waiting area and watch the queue display.',
      checkedInAtIso: new Date().toISOString(),
      lastUpdatedIso: new Date().toISOString(),
    }

    this.setStorage([newToken, ...list])
    return newToken
  }

  /**
   * Patient leaves / cancels their spot in the queue.
   */
  async leaveQueue(tokenId: string, reason: string): Promise<void> {
    const list = this.getStorage()
    const index = list.findIndex((item) => item.id === tokenId || item.tokenNumber === tokenId)
    if (index === -1) return

    const target = list[index]
    target.state = 'CANCELLED'
    target.status = 'CANCELLED'
    target.lastUpdatedIso = new Date().toISOString()
    target.nextActionInstruction = `You left this queue (${reason}). Your place has been released.`

    this.setStorage(list)

    // Append to history
    const history = this.getHistoryStorage()
    const historyItem: QueueHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      tokenNumber: target.tokenNumber,
      facilityName: target.facilityName,
      departmentName: target.departmentName,
      doctorName: target.doctorName,
      roomNumber: target.roomNumber,
      outcome: 'CANCELLED',
      completedAtIso: new Date().toISOString(),
    }
    this.setHistoryStorage([historyItem, ...history])
  }

  /**
   * Rejoin queue after a missed turn or cancellation.
   */
  async rejoinQueue(tokenId: string): Promise<ActiveToken> {
    const list = this.getStorage()
    const index = list.findIndex((item) => item.id === tokenId || item.tokenNumber === tokenId)
    if (index === -1) throw new Error('Queue token not found')

    const target = list[index]
    target.state = 'WAITING'
    target.status = 'ISSUED'
    target.positionInQueue = 4
    target.estimatedWaitMinutes = 12
    target.estimatedWaitRange = '10–15 min'
    target.lastUpdatedIso = new Date().toISOString()
    target.nextActionInstruction =
      'You have rejoined the queue at priority position #4. Please be seated near the room entrance.'

    this.setStorage(list)
    return target
  }

  /**
   * Advance queue simulation step (advances current serving token, decrements position).
   */
  async advanceQueue(tokenId: string): Promise<ActiveToken> {
    const list = this.getStorage()
    const index = list.findIndex((item) => item.id === tokenId || item.tokenNumber === tokenId)
    if (index === -1) throw new Error('Queue token not found')

    const target = list[index]

    if (target.positionInQueue > 1) {
      target.positionInQueue -= 1
      target.estimatedWaitMinutes = Math.max(2, target.positionInQueue * 2.5)
      target.estimatedWaitRange = `${Math.round(target.estimatedWaitMinutes - 2)}–${Math.round(
        target.estimatedWaitMinutes + 4
      )} min`

      // Extract numeric suffix from currentServingToken e.g. "B-031" -> 31
      const match = target.currentServingToken.match(/([A-Z]+)-0?(\d+)/)
      if (match) {
        const prefix = match[1]
        const num = parseInt(match[2], 10) + 1
        target.currentServingToken = `${prefix}-0${num}`
      }

      if (target.positionInQueue <= 3) {
        target.state = 'APPROACHING'
        target.nextActionInstruction =
          'You are almost up. Please move toward the room door and have your papers ready.'
      } else {
        target.state = 'WAITING'
        target.nextActionInstruction =
          'Please remain in the waiting hall. Your turn is moving forward steadily.'
      }
    } else if (target.positionInQueue === 1) {
      target.positionInQueue = 0
      target.currentServingToken = target.tokenNumber
      target.state = 'CALLED'
      target.status = 'CALLED'
      target.calledAtIso = new Date().toISOString()
      target.estimatedWaitMinutes = 0
      target.estimatedWaitRange = 'Now'
      target.nextActionInstruction = `Your token is being called right now. Please enter ${target.roomNumber} immediately.`
    }

    target.lastUpdatedIso = new Date().toISOString()
    this.setStorage(list)
    return target
  }

  /**
   * Explicitly set queue state to test/evaluate any of the 14 operational scenarios.
   */
  async setQueueState(
    tokenId: string,
    state: QueuePatientState,
    options?: {
      isDelayed?: boolean
      delayReason?: string
      delayMinutes?: number
      isPaused?: boolean
      pauseReason?: string
    }
  ): Promise<ActiveToken> {
    const list = this.getStorage()
    const index = list.findIndex((item) => item.id === tokenId || item.tokenNumber === tokenId)
    if (index === -1) throw new Error('Queue token not found')

    const target = list[index]
    target.state = state
    target.lastUpdatedIso = new Date().toISOString()

    if (state === 'WAITING') {
      target.positionInQueue = 11
      target.estimatedWaitMinutes = 28
      target.estimatedWaitRange = '25–35 min'
      target.nextActionInstruction = 'Please remain seated in the main OPD waiting hall.'
    } else if (state === 'APPROACHING') {
      target.positionInQueue = 3
      target.estimatedWaitMinutes = 8
      target.estimatedWaitRange = '5–10 min'
      target.nextActionInstruction = `You're almost up. Please move to the corridor outside ${target.roomNumber}.`
    } else if (state === 'CALLED') {
      target.positionInQueue = 0
      target.currentServingToken = target.tokenNumber
      target.estimatedWaitMinutes = 0
      target.estimatedWaitRange = 'Now'
      target.calledAtIso = new Date().toISOString()
      target.nextActionInstruction = `It's your turn. Please enter ${target.roomNumber} to see ${target.doctorName}.`
    } else if (state === 'IN_CONSULTATION') {
      target.positionInQueue = 0
      target.nextActionInstruction = `Consultation in progress inside ${target.roomNumber}.`
    } else if (state === 'COMPLETED') {
      target.positionInQueue = 0
      target.completedAtIso = new Date().toISOString()
      target.nextActionInstruction =
        'Your consultation is complete. Prescription has been recorded in your HealthConnect ABHA records.'

      // Append to history
      const history = this.getHistoryStorage()
      const historyItem: QueueHistoryItem = {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        tokenNumber: target.tokenNumber,
        facilityName: target.facilityName,
        departmentName: target.departmentName,
        doctorName: target.doctorName,
        roomNumber: target.roomNumber,
        outcome: 'COMPLETED',
        completedAtIso: new Date().toISOString(),
        prescriptionAvailable: true,
      }
      this.setHistoryStorage([historyItem, ...history])
    } else if (state === 'MISSED') {
      target.nextActionInstruction =
        'Your token was called while you were away. Please check in with the OPD nursing desk or rejoin the queue below.'
    }

    if (options) {
      if (typeof options.isDelayed === 'boolean') {
        target.isDelayed = options.isDelayed
        target.delayReason = options.delayReason
        target.delayMinutes = options.delayMinutes || 15
        if (options.isDelayed) {
          target.estimatedWaitMinutes += target.delayMinutes
          target.estimatedWaitRange = `~${target.estimatedWaitMinutes} min (Delayed)`
        }
      }
      if (typeof options.isPaused === 'boolean') {
        target.isPaused = options.isPaused
        target.pauseReason = options.pauseReason
      }
    }

    this.setStorage(list)
    return target
  }

  /**
   * Retrieves past queue history.
   */
  async getQueueHistory(): Promise<QueueHistoryItem[]> {
    return this.getHistoryStorage()
  }
}

export const queueService = new QueueService()
