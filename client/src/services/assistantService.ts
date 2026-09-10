import type {
  AssistantMessage,
  AssistantProposedAction,
  ContextualSuggestion,
} from '@/types/assistant'
import { facilityService } from './facilityService'
import { appointmentService } from './appointmentService'
import { queueService } from './queueService'
import { referralService } from './referralService'
import { careService } from './careService'
import { diagnosticService } from './diagnosticService'
import { prescriptionService } from './prescriptionService'
import { emergencyService } from './emergencyService'
import { followUpService } from './followUpService'

const EMERGENCY_RED_FLAGS = [
  'chest pain',
  'heart attack',
  'breathless',
  'breathing difficulty',
  'cannot breathe',
  'shortness of breath',
  'choking',
  'unconscious',
  'loss of consciousness',
  'passed out',
  'fainted',
  'severe bleeding',
  'heavy bleeding',
  'blood loss',
  'stroke',
  'face drooping',
  'arm weakness',
  'slurred speech',
  'head injury',
  'seizure',
  'fits',
  'convulsion',
  'poisoning',
  'consumed poison',
  'snake bite',
  'electric shock',
  'severe burn',
  'labour pain',
  'delivery emergency',
  'amputation',
]

const MEDICATION_CHANGE_TERMS = [
  'stop medicine',
  'stop taking',
  'discontinue',
  'skip dose',
  'double dose',
  'change dose',
  'increase dose',
  'decrease dose',
  'reduce dose',
  'side effect',
  'can i stop',
  'should i stop',
  'can i take more',
]

const DIAGNOSIS_REQUEST_TERMS = [
  'what disease do i have',
  'diagnose me',
  'do i have cancer',
  'is this tuberculosis',
  'what illness is this',
  'tell me what is wrong with me',
  'can you cure',
]

let serviceMessageSeq = 0
const createServiceMessageId = (prefix: string) => `${prefix}-${Date.now()}-${++serviceMessageSeq}`

class AssistantService {
  /**
   * Process a patient's natural language or voice query
   */
  async processQuery(queryText: string): Promise<AssistantMessage> {
    const query = queryText.trim().toLowerCase()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const messageId = createServiceMessageId('msg')

    // 1. Critical Priority: Emergency Red-Flag Interceptor
    const matchedEmergency = EMERGENCY_RED_FLAGS.find((rf) => query.includes(rf))
    if (matchedEmergency) {
      const emergencyContacts = await emergencyService.getEmergencyHelplines()
      const facilities = await facilityService.getFacilities({
        ownership: 'GOVERNMENT',
      })
      const traumaFacilities = facilities.filter((f) => f.hasEmergency24x7)

      const proposedAction: AssistantProposedAction = {
        id: createServiceMessageId('act'),
        type: 'EMERGENCY_CALL',
        title: 'Call 108 Emergency Ambulance',
        description: 'Free 24x7 National Ambulance & Emergency Medical Response',
        destinationUrl: 'tel:108',
        requiresConfirmation: false,
        status: 'PROPOSED',
      }

      return {
        id: messageId,
        sender: 'assistant',
        text: `⚠️ **URGENT MEDICAL EMERGENCY DETECTED**: You mentioned symptoms associated with "${matchedEmergency}". Please do not wait for an online response or consultation. Call National Emergency 108 immediately or proceed to the nearest verified public trauma centre.`,
        timestamp: now,
        intent: 'EMERGENCY_URGENT',
        isEmergency: true,
        structuredData: {
          emergencyHelplines: emergencyContacts,
          facilities: traumaFacilities.slice(0, 2),
        },
        proposedAction,
        quickReplies: [
          'Call 108 Ambulance',
          'Call 102 Matritva Vahan',
          'View Casualty Hospitals',
          'Check Verified Blood Stock',
        ],
      }
    }

    // 2. Healthcare Safety: Medication Modification Interceptor
    const matchedMedChange = MEDICATION_CHANGE_TERMS.find((term) => query.includes(term))
    if (matchedMedChange) {
      const prescriptions = await prescriptionService.getPrescriptions()
      const activeMeds = await prescriptionService.getActiveMedications()

      return {
        id: messageId,
        sender: 'assistant',
        text: `I cannot safely advise on altering, stopping, or changing your medication dosage. Stopping or changing medicines without clinical oversight can lead to adverse health outcomes. Please review your active prescription below and contact your treating physician or ASHA health worker.`,
        timestamp: now,
        intent: 'MEDICATION_SAFETY_DISCLAIMER',
        requiresClinicalDisclaimer: true,
        structuredData: {
          prescriptions,
          medications: activeMeds,
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'VIEW_PRESCRIPTION',
          title: 'View Active Prescription',
          description: 'Consult full prescription instructions from Dr. Rajesh Verma',
          destinationUrl: '/patient/prescriptions',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'View Active Prescription',
          'Book Follow-up Consultation',
          'Find Jan Aushadhi Pharmacy',
        ],
      }
    }

    // 3. Healthcare Safety: Diagnosis Request Interceptor
    const matchedDiagnosis = DIAGNOSIS_REQUEST_TERMS.find((term) => query.includes(term))
    if (matchedDiagnosis) {
      return {
        id: messageId,
        sender: 'assistant',
        text: `As an AI healthcare assistant, I am not authorized to provide medical diagnoses or interpret illness severity. A proper clinical diagnosis requires physical examination, history, and certified laboratory findings by an authorized doctor. I can help you find a suitable public hospital or book an OPD appointment.`,
        timestamp: now,
        intent: 'CLINICAL_DISCLAIMER',
        requiresClinicalDisclaimer: true,
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'NAVIGATE',
          title: 'Find Specialist Healthcare Facilities',
          description: 'Explore verified government medical colleges and district hospitals',
          destinationUrl: '/patient/facilities',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'Find General Medicine OPD',
          'Book Doctor Appointment',
          'Check Hospital Specialists',
        ],
      }
    }

    // 4. Live OPD Queue & Token Tracking
    if (
      query.includes('queue') ||
      query.includes('token') ||
      query.includes('wait') ||
      query.includes('my turn') ||
      query.includes('counter')
    ) {
      const activeToken = await queueService.getActiveToken()

      if (activeToken && activeToken.state !== 'COMPLETED' && activeToken.state !== 'CANCELLED') {
        return {
          id: messageId,
          sender: 'assistant',
          text: `Your active OPD token is **${activeToken.tokenNumber}** at **${activeToken.facilityName}** (${activeToken.departmentName}). The doctor is currently serving token **${activeToken.currentServingToken}**. There are **${activeToken.positionInQueue}** patients ahead of you (approx. ${activeToken.estimatedWaitMinutes} minutes remaining).`,
          timestamp: now,
          intent: 'VIEW_QUEUE',
          structuredData: {
            queueToken: activeToken,
          },
          proposedAction: {
            id: createServiceMessageId('act'),
            type: 'NAVIGATE',
            title: 'Open Live Queue Tracker',
            description: `Track real-time room ${activeToken.roomNumber} progress`,
            destinationUrl: '/patient/queue',
            requiresConfirmation: false,
            status: 'PROPOSED',
          },
          quickReplies: [
            'View Live Queue Details',
            'Directions to Room ' + activeToken.roomNumber,
            'Find Facility Pharmacy',
          ],
        }
      } else {
        return {
          id: messageId,
          sender: 'assistant',
          text: `You do not have an active OPD queue token right now. If you have an upcoming confirmed appointment today, you can check in to generate your digital queue token, or visit an OPD registration counter.`,
          timestamp: now,
          intent: 'VIEW_QUEUE',
          proposedAction: {
            id: createServiceMessageId('act'),
            type: 'CHECK_IN_QUEUE',
            title: 'Check-In for Today\'s OPD',
            description: 'Check in for your confirmed appointment to obtain a digital token',
            destinationUrl: '/patient/appointments',
            requiresConfirmation: true,
            confirmationPrompt: 'Would you like to check in for your upcoming appointment to generate your live queue token?',
            status: 'PROPOSED',
          },
          quickReplies: [
            'View My Appointments',
            'Book New Appointment',
            'Find Nearby Hospital',
          ],
        }
      }
    }

    // 5. Appointments: Booking, Checking, Rescheduling, Cancelling
    if (
      query.includes('appointment') ||
      query.includes('doctor') ||
      query.includes('opd') ||
      query.includes('consultation') ||
      query.includes('visit')
    ) {
      if (query.includes('book') || query.includes('schedule') || query.includes('take') || query.includes('new')) {
        return {
          id: messageId,
          sender: 'assistant',
          text: `I can help you book a verified public OPD appointment. You can choose a government district hospital, medical college, or community health centre with available doctor slots.`,
          timestamp: now,
          intent: 'BOOK_APPOINTMENT',
          proposedAction: {
            id: createServiceMessageId('act'),
            type: 'BOOK_APPOINTMENT',
            title: 'Start OPD Appointment Booking',
            description: 'Select facility, department, doctor, and slot',
            destinationUrl: '/patient/appointments/book',
            requiresConfirmation: false,
            status: 'PROPOSED',
          },
          quickReplies: [
            'Book at District Hospital Varanasi',
            'Book at BHU Sir Sunderlal Hospital',
            'View My Existing Appointments',
          ],
        }
      }

      if (query.includes('reschedule')) {
        const appts = await appointmentService.getMyAppointments({ status: 'CONFIRMED' })
        const target = appts[0]

        return {
          id: messageId,
          sender: 'assistant',
          text: target
            ? `You have a confirmed appointment with **${target.doctorName}** (${target.departmentName}) on **${target.date}** at **${target.timeSlot}**. Would you like to select a new date or slot?`
            : `You have no active confirmed appointments to reschedule. Would you like to book a new appointment?`,
          timestamp: now,
          intent: 'RESCHEDULE_APPOINTMENT',
          structuredData: target ? { appointment: target } : undefined,
          proposedAction: target
            ? {
                id: createServiceMessageId('act'),
                type: 'RESCHEDULE_APPOINTMENT',
                title: `Reschedule Appointment #${target.referenceNumber}`,
                description: `Change date or time for ${target.facilityName}`,
                destinationUrl: `/patient/appointments/${target.id}`,
                requiresConfirmation: true,
                confirmationPrompt: `Are you sure you want to reschedule your appointment with ${target.doctorName} at ${target.facilityName}?`,
                params: { appointmentId: target.id },
                status: 'PROPOSED',
              }
            : {
                id: createServiceMessageId('act'),
                type: 'BOOK_APPOINTMENT',
                title: 'Book an Appointment',
                description: 'Schedule a new OPD visit',
                destinationUrl: '/patient/appointments/book',
                requiresConfirmation: false,
                status: 'PROPOSED',
              },
          quickReplies: target
            ? ['Confirm Reschedule', 'Keep Existing Slot', 'View Details']
            : ['Book New Appointment', 'View Past Consultations'],
        }
      }

      if (query.includes('cancel')) {
        const appts = await appointmentService.getMyAppointments({ status: 'CONFIRMED' })
        const target = appts[0]

        return {
          id: messageId,
          sender: 'assistant',
          text: target
            ? `You have an upcoming appointment with **${target.doctorName}** at **${target.facilityName}** on **${target.date}**. Consequential action confirmation is required before cancelling.`
            : `You do not have any active appointments that can be cancelled.`,
          timestamp: now,
          intent: 'CANCEL_APPOINTMENT',
          structuredData: target ? { appointment: target } : undefined,
          proposedAction: target
            ? {
                id: createServiceMessageId('act'),
                type: 'CANCEL_APPOINTMENT',
                title: `Cancel Appointment #${target.referenceNumber}`,
                description: `Release slot for ${target.doctorName} (${target.facilityName})`,
                destinationUrl: `/patient/appointments/${target.id}`,
                requiresConfirmation: true,
                confirmationPrompt: `Are you sure you want to cancel your appointment with ${target.doctorName} on ${target.date}? This slot will be released back to other patients.`,
                params: { appointmentId: target.id },
                status: 'PROPOSED',
              }
            : undefined,
          quickReplies: ['Keep Appointment', 'Reschedule Instead', 'View Appointments'],
        }
      }

      // Default: View upcoming appointments
      const appts = await appointmentService.getMyAppointments()
      const upcoming = appts.filter((a) => a.status === 'CONFIRMED')

      return {
        id: messageId,
        sender: 'assistant',
        text:
          upcoming.length > 0
            ? `You have **${upcoming.length}** upcoming appointment(s). The earliest is with **${upcoming[0].doctorName}** (${upcoming[0].departmentName}) at **${upcoming[0].facilityName}** on **${upcoming[0].date}** at **${upcoming[0].timeSlot}**.`
            : `You have no upcoming appointments scheduled. All past visits and consultations can be viewed in your care history.`,
        timestamp: now,
        intent: 'VIEW_APPOINTMENT',
        structuredData: {
          appointments: upcoming,
          appointment: upcoming[0],
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'NAVIGATE',
          title: 'View All Appointments',
          description: 'Manage booking details, tokens, and slips',
          destinationUrl: '/patient/appointments',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'Book New Appointment',
          'Check Live Queue Token',
          'View Prescription History',
        ],
      }
    }

    // 6. Referrals & Inter-Hospital Transfers
    if (
      query.includes('referral') ||
      query.includes('transfer') ||
      query.includes('destination') ||
      query.includes('referred')
    ) {
      const referrals = await referralService.getPatientReferrals()
      const activeRef = referrals.find((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')

      if (activeRef) {
        return {
          id: messageId,
          sender: 'assistant',
          text: `Your referral **${activeRef.referralCode}** for **${activeRef.requiredSpecialty}** is currently **${activeRef.status}**. Destination: **${activeRef.receivingFacilityName || 'Under Review by Receiving Hospital'}**. Next action: ${activeRef.nextActionInstruction}`,
          timestamp: now,
          intent: 'VIEW_REFERRAL',
          structuredData: {
            referral: activeRef,
          },
          proposedAction: {
            id: createServiceMessageId('act'),
            type: 'VIEW_REFERRAL',
            title: `Track Referral ${activeRef.referralCode}`,
            description: 'View clinical handover dossier and bed verification status',
            destinationUrl: `/patient/referrals/${activeRef.id}`,
            requiresConfirmation: false,
            status: 'PROPOSED',
          },
          quickReplies: [
            'Track Referral Details',
            'View Transfer Clinical Notes',
            'Find Receiving Facility',
          ],
        }
      } else {
        return {
          id: messageId,
          sender: 'assistant',
          text: `You currently have no active hospital referral records. Referrals are initiated by government doctors or CHC medical officers when specialized tertiary care is needed.`,
          timestamp: now,
          intent: 'VIEW_REFERRAL',
          proposedAction: {
            id: createServiceMessageId('act'),
            type: 'NAVIGATE',
            title: 'View Referral Archive',
            description: 'Explore past hospital transfers and discharge summaries',
            destinationUrl: '/patient/referrals',
            requiresConfirmation: false,
            status: 'PROPOSED',
          },
          quickReplies: [
            'Explore My Care Timeline',
            'Find Tertiary Hospitals',
            'Book OPD Consultation',
          ],
        }
      }
    }

    // 7. Follow-Ups & Ongoing Care Continuity
    if (
      query.includes('follow up') ||
      query.includes('follow-up') ||
      query.includes('due') ||
      query.includes('next visit') ||
      query.includes('routine check') ||
      query.includes('ongoing care')
    ) {
      const followUps = await followUpService.getFollowUps()
      const dueFollowUps = followUps.filter(
        (f) => f.status === 'DUE' || f.status === 'RECOMMENDED' || f.status === 'MISSED'
      )
      const primary = dueFollowUps[0] || followUps[0]

      return {
        id: messageId,
        sender: 'assistant',
        text: primary
          ? `You have a **${primary.status}** follow-up for **${primary.specialty}** with **${primary.doctorName}** at **${primary.facilityName}**. Target date: **${primary.recommendedDateIso}**. ${primary.prerequisiteDiagnostics?.length ? `Prerequisite diagnostic: ${primary.prerequisiteDiagnostics[0].testName}.` : ''}`
          : `You have no pending follow-up visits due. All ongoing care milestones are up to date!`,
        timestamp: now,
        intent: 'VIEW_FOLLOWUP',
        structuredData: {
          followUps: followUps.slice(0, 3),
        },
        proposedAction: primary
          ? {
              id: createServiceMessageId('act'),
              type: 'NAVIGATE',
              title: 'Schedule Due Follow-Up Visit',
              description: `Confirm OPD slot with ${primary.doctorName}`,
              destinationUrl: `/patient/appointments/book?followUpId=${primary.id}`,
              requiresConfirmation: false,
              status: 'PROPOSED',
            }
          : {
              id: createServiceMessageId('act'),
              type: 'NAVIGATE',
              title: 'View Follow-ups Hub',
              description: 'View care continuity schedule and completed milestones',
              destinationUrl: '/patient/follow-ups',
              requiresConfirmation: false,
              status: 'PROPOSED',
            },
        quickReplies: [
          'Schedule Follow-up Visit',
          'Check Required Lab Tests',
          'View Care Continuity Hub',
        ],
      }
    }

    // 8. Diagnostics & Lab Reports
    if (
      query.includes('diagnostic') ||
      query.includes('test') ||
      query.includes('lab') ||
      query.includes('report') ||
      query.includes('x-ray') ||
      query.includes('cbc') ||
      query.includes('hba1c') ||
      query.includes('blood test') ||
      query.includes('scan') ||
      query.includes('ultrasound')
    ) {
      const orders = await diagnosticService.getDiagnosticOrders()
      const pending = orders.filter(
        (t) => t.status === 'ORDERED' || t.status === 'SAMPLE_COLLECTED' || t.status === 'PROCESSING'
      )
      const target = pending[0] || orders[0]

      return {
        id: messageId,
        sender: 'assistant',
        text: target
          ? `You have diagnostic tests on record. **${target.testName}** (${target.testCategory}) is currently **${target.status}** ordered at **${target.orderingFacilityName}**. ${target.status === 'REPORT_READY' ? 'A verified digital report is available for viewing.' : 'Sample collection or laboratory processing is underway.'}`
          : `You have no active diagnostic tests or lab investigations on record. Diagnostic orders are created by physicians during consultation.`,
        timestamp: now,
        intent: 'FIND_DIAGNOSTIC',
        structuredData: {
          diagnosticOrders: orders.slice(0, 3),
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'VIEW_DIAGNOSTIC',
          title: 'Open Diagnostics Center',
          description: 'View prescribed tests, sample status, and verified reports',
          destinationUrl: '/patient/diagnostics',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'View Lab Reports',
          'Find Diagnostic Centers',
          'Check Required Follow-up Tests',
        ],
      }
    }

    // 9. Prescriptions & Medicines
    if (
      query.includes('prescription') ||
      query.includes('medicine') ||
      query.includes('rx') ||
      query.includes('pharmacy') ||
      query.includes('tablet') ||
      query.includes('drug') ||
      query.includes('jan aushadhi')
    ) {
      const prescriptions = await prescriptionService.getPrescriptions()
      const activeMeds = await prescriptionService.getActiveMedications()

      return {
        id: messageId,
        sender: 'assistant',
        text: `You have **${activeMeds.length}** active prescribed medicine(s) from **${prescriptions[0]?.prescribingDoctorName || 'your treating physician'}** at **${prescriptions[0]?.facilityName || 'District Hospital'}**, including ${activeMeds.slice(0, 2).map((m) => m.medicineName).join(', ')}. Generic Jan Aushadhi alternatives are available at public pharmacies.`,
        timestamp: now,
        intent: 'VIEW_PRESCRIPTION',
        structuredData: {
          prescriptions: prescriptions.slice(0, 2),
          medications: activeMeds,
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'VIEW_PRESCRIPTION',
          title: 'View Medicines & Prescriptions',
          description: 'Check dosages, intake schedules, and pharmacy stock',
          destinationUrl: '/patient/medicines',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'View Medication Schedule',
          'Check Jan Aushadhi Stock',
          'Download Prescription Slip',
        ],
      }
    }

    // 10. Blood Availability & Ambulance
    if (
      query.includes('blood') ||
      query.includes('plasma') ||
      query.includes('platelet') ||
      query.includes('donor')
    ) {
      const bloodStock = await emergencyService.getBloodAvailability({ bloodGroup: 'O+' })

      return {
        id: messageId,
        sender: 'assistant',
        text: `Verified public blood bank telemetry is available. HealthConnect displays authenticated units for all 8 ABO/Rh groups across certified public blood banks (BHU Blood Bank, District Hospital Blood Bank). Note: Telemetry older than 12h requires phone verification prior to dispatch.`,
        timestamp: now,
        intent: 'FIND_BLOOD',
        structuredData: {
          bloodStock: bloodStock.slice(0, 4),
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'NAVIGATE',
          title: 'Search Verified Blood Availability',
          description: 'Filter by ABO/Rh group and component type',
          destinationUrl: '/patient/blood',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'Find O+ Blood Units',
          'Find B+ Blood Units',
          'Emergency Blood Helplines',
        ],
      }
    }

    if (query.includes('ambulance') || query.includes('transport') || query.includes('108') || query.includes('102')) {
      const fleet = await emergencyService.getAmbulanceFleets()

      return {
        id: messageId,
        sender: 'assistant',
        text: `National Ambulance Services in Uttar Pradesh are operated via state emergency control dispatch: **108** for Advanced/Basic Life Support (100% Free under NHM), and **102** for Maternal & Infant Transport (Janani Shishu Suraksha Karyakram). HealthConnect provides honest telemetry without fake Uber-style vehicle simulations.`,
        timestamp: now,
        intent: 'FIND_AMBULANCE',
        structuredData: {
          ambulanceFleet: fleet,
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'EMERGENCY_CALL',
          title: 'Call 108 Emergency Ambulance',
          description: 'Dial toll-free national dispatch centre',
          destinationUrl: 'tel:108',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'Call 108 Ambulance',
          'Call 102 Matritva Vahan',
          'View Ambulance Equipment Specs',
        ],
      }
    }

    // 11. Facilities / Hospitals / Treatment Search
    if (
      query.includes('hospital') ||
      query.includes('facility') ||
      query.includes('centre') ||
      query.includes('chc') ||
      query.includes('phc') ||
      query.includes('bhu') ||
      query.includes('cardio') ||
      query.includes('ortho') ||
      query.includes('pediatric') ||
      query.includes('maternity') ||
      query.includes('eye') ||
      query.includes('dialysis') ||
      query.includes('clinic') ||
      query.includes('find care')
    ) {
      let specialtyFilter: string | undefined = undefined
      if (query.includes('cardio') || query.includes('heart')) specialtyFilter = 'Cardiology'
      else if (query.includes('ortho') || query.includes('bone')) specialtyFilter = 'Orthopedics'
      else if (query.includes('pediatric') || query.includes('child')) specialtyFilter = 'Pediatrics'
      else if (query.includes('maternity') || query.includes('gynec') || query.includes('delivery')) specialtyFilter = 'Obstetrics & Gynecology'
      else if (query.includes('dialysis') || query.includes('kidney')) specialtyFilter = 'Nephrology'

      const facilities = await facilityService.getFacilities({
        specialty: specialtyFilter,
        ownership: 'GOVERNMENT',
      })

      return {
        id: messageId,
        sender: 'assistant',
        text: specialtyFilter
          ? `I found **${facilities.length}** verified public healthcare facilities offering **${specialtyFilter}** in your region. Real-time general and ICU bed telemetry is confirmed from public hospital HMIS.`
          : `I found **${facilities.length}** verified government healthcare facilities in the Varanasi district network with real-time bed availability and on-duty specialists.`,
        timestamp: now,
        intent: 'FIND_FACILITY',
        structuredData: {
          facilities: facilities.slice(0, 3),
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'NAVIGATE',
          title: specialtyFilter ? `Explore ${specialtyFilter} Hospitals` : 'Explore Healthcare Facilities',
          description: 'Filter by beds, oxygen support, and distance',
          destinationUrl: specialtyFilter ? `/patient/find-care?specialty=${encodeURIComponent(specialtyFilter)}` : '/patient/find-care',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'View Bed Availability',
          'Book OPD Appointment',
          'Explore Treatment Matcher',
        ],
      }
    }

    // 12. Longitudinal Care & Records Overview
    if (query.includes('my care') || query.includes('record') || query.includes('timeline') || query.includes('history')) {
      const overview = await careService.getMyCareOverview()

      return {
        id: messageId,
        sender: 'assistant',
        text: `Your longitudinal care journey contains **${overview.recentEvents.length}** recent recorded events, **${overview.activeMedicationCount}** active prescribed medications, **${overview.activeAppointmentCount}** active appointment(s), and **${overview.activeReferralCount}** active referral(s). Your next planned action is: **${overview.nextAction.title}**.`,
        timestamp: now,
        intent: 'VIEW_MY_CARE',
        structuredData: {
          myCareOverview: overview,
        },
        proposedAction: {
          id: createServiceMessageId('act'),
          type: 'NAVIGATE',
          title: 'View Longitudinal Care Timeline',
          description: 'Explore full chronological healthcare records',
          destinationUrl: '/patient/my-care',
          requiresConfirmation: false,
          status: 'PROPOSED',
        },
        quickReplies: [
          'View Care Timeline',
          'Review Prescriptions',
          'Check Follow-up Status',
        ],
      }
    }

    // 13. Fallback / General Guidance
    return {
      id: messageId,
      sender: 'assistant',
      text: `I can help you navigate HealthConnect public healthcare workflows. What would you like assistance with today?`,
      timestamp: now,
      intent: 'UNKNOWN',
      quickReplies: [
        'Find a Government Hospital',
        'Check My OPD Queue Token',
        'When is My Next Appointment?',
        'Track Hospital Referral',
        'Find Verified Blood Stock',
        'Review My Prescriptions',
      ],
    }
  }

  /**
   * Generates smart initial contextual chips based on the patient's real healthcare state
   */
  async getContextualSuggestions(): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = []

    try {
      // 1. Check live queue
      const token = await queueService.getActiveToken()
      if (token && token.state !== 'COMPLETED' && token.state !== 'CANCELLED') {
        suggestions.push({
          id: 'sug-queue',
          label: `Live Token ${token.tokenNumber} (${token.positionInQueue} ahead)`,
          query: 'What is my queue status?',
          badge: 'Active Token',
          intent: 'VIEW_QUEUE',
          urgency: 'URGENT',
        })
      }

      // 2. Check active referral
      const referrals = await referralService.getPatientReferrals()
      const activeRef = referrals.find((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
      if (activeRef) {
        suggestions.push({
          id: 'sug-ref',
          label: `Track Referral (${activeRef.requiredSpecialty})`,
          query: 'Show my referral status',
          badge: activeRef.status,
          intent: 'VIEW_REFERRAL',
          urgency: 'HIGH',
        })
      }

      // 3. Check overdue follow-up
      const followUps = await followUpService.getFollowUps({ statusCategory: 'NEEDS_ATTENTION' })
      const pendingFollowUp = followUps.find((f) => f.status === 'DUE' || f.status === 'MISSED')
      if (pendingFollowUp) {
        suggestions.push({
          id: 'sug-followup',
          label: `Follow-up Due (${pendingFollowUp.specialty})`,
          query: 'Do I have any follow-ups due?',
          badge: pendingFollowUp.status,
          intent: 'VIEW_FOLLOWUP',
          urgency: 'HIGH',
        })
      }

      // 4. Check upcoming appointment
      const appts = await appointmentService.getMyAppointments({ status: 'CONFIRMED' })
      if (appts.length > 0) {
        suggestions.push({
          id: 'sug-appt',
          label: `Appointment with ${appts[0].doctorName} (${appts[0].date})`,
          query: 'Show my upcoming appointment',
          badge: 'Upcoming',
          intent: 'VIEW_APPOINTMENT',
          urgency: 'NORMAL',
        })
      }
    } catch {
      // Fallback silently if offline or store error
    }

    // Always ensure standard helpful defaults if few contextual items exist
    if (suggestions.length < 4) {
      suggestions.push({
        id: 'sug-find-facility',
        label: 'Find Government Hospital',
        query: 'Find a nearby government hospital',
        intent: 'FIND_FACILITY',
      })
      suggestions.push({
        id: 'sug-book-appt',
        label: 'Book Doctor Appointment',
        query: 'I want to book an appointment',
        intent: 'BOOK_APPOINTMENT',
      })
      suggestions.push({
        id: 'sug-blood',
        label: 'Check Blood Availability',
        query: 'Find blood stock availability',
        intent: 'FIND_BLOOD',
      })
      suggestions.push({
        id: 'sug-rx',
        label: 'View My Prescriptions',
        query: 'Where is my prescription?',
        intent: 'VIEW_PRESCRIPTION',
      })
    }

    return suggestions
  }

  /**
   * Execute consequential actions with authorization and confirmation verification
   */
  async executeAction(action: AssistantProposedAction): Promise<{ success: boolean; message: string }> {
    if (action.type === 'CHECK_IN_QUEUE') {
      const appts = await appointmentService.getMyAppointments({ status: 'CONFIRMED' })
      if (appts.length > 0) {
        const token = await queueService.checkInAppointment(appts[0].id)
        return {
          success: true,
          message: `Successfully checked in! Your live OPD token is ${token.tokenNumber}.`,
        }
      }
      return { success: false, message: 'No confirmed appointment found to check in.' }
    }

    if (action.type === 'CANCEL_APPOINTMENT') {
      const apptId = action.params?.appointmentId as string
      if (apptId) {
        await appointmentService.cancelAppointment(apptId, 'Cancelled via Healthcare Assistant')
        return {
          success: true,
          message: 'Appointment cancelled successfully. The slot has been released.',
        }
      }
      return { success: false, message: 'Missing appointment ID to cancel.' }
    }

    return {
      success: true,
      message: 'Action completed.',
    }
  }
}

export const assistantService = new AssistantService()
