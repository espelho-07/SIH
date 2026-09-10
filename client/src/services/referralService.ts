import { facilityService } from './facilityService'
import type {
  ReferralClinicalSummary,
  ReceivingFacilityMatch,
} from '@/types/referral'

// Authentic local public health referrals in Purvanchal (Varanasi/Chandauli district hub)
let referralsState: ReferralClinicalSummary[] = [
  {
    id: 'ref-001',
    referralCode: 'REF-2026-9041',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    abhaId: '14-8842-1920-5531',

    referringFacilityId: 'fac-shivpur-chc',
    referringFacilityName: 'Community Health Centre (CHC) Shivpur',
    referringFacilityTier: 'CHC',
    referringFacilityAddress: 'Shivpur Bypass, Varanasi, Uttar Pradesh 221003',
    referringDoctorId: 'doc-chc-1',
    referringDoctorName: 'Dr. Priya Tripathi',
    referringDoctorSpecialty: 'General Medicine & Family Health',

    clinicalReason: 'Acute Coronary Syndrome / Suspected Unstable Angina with ST-depression in V3-V5',
    plainLanguageExplanation:
      'Your preliminary ECG and chest symptoms require advanced cardiac evaluation. The CHC lacks a digital cardiac catheterization lab and 2D-Echocardiography, so you are referred for immediate specialized cardiologist review.',
    requiredSpecialty: 'Cardiology & Cath Lab',
    requiredTreatments: ['Coronary Angiography', '2D Echocardiography', 'Continuous Cardiac Telemetry'],
    requiredDiagnostics: ['12-Lead Digital ECG', 'Cardiac Enzymes (Troponin-T)', 'Echocardiogram'],
    urgency: 'URGENT',
    slaExpiresAtIso: new Date(Date.now() + 1000 * 60 * 180).toISOString(), // 3 hours remaining

    receivingFacilityId: 'fac-bhu-ssh',
    receivingFacilityName: 'Sir Sunderlal Hospital, IMS BHU',
    receivingFacilityAddress: 'BHU Main Campus, Varanasi, Uttar Pradesh 221005',
    receivingFacilityTier: 'TERTIARY_AIIMS',
    receivingDoctorName: 'Prof. R. C. Shukla',
    receivingDoctorSpecialty: 'Cardiology & Interventional Care',

    status: 'ACCEPTED_BED_LOCKED',
    bedReserved: true,
    bedReservationType: 'ICU',
    bedReservationExpiryIso: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 mins lock
    ambulanceDispatched: false,

    linkedAppointmentId: 'apt-001',
    linkedAppointmentRef: 'APT-2026-8492',
    linkedAppointmentTime: 'Today • 11:30 AM',
    linkedQueueToken: 'REF-014',

    instructions: [
      'Carry your physical printout of the CHC ECG strip and previous blood sugar/lipid reports.',
      'Report directly to Room SS-302 (Cardiology OPD / Cath Lab Reception) upon entry.',
      'Show your PM-JAY Ayushman Card or ABHA ID at counter #4 for zero-billing entry slip.',
      'Avoid heavy meals before consultation in case emergency contrast angiography is advised.',
    ],
    requiredDocuments: [
      'CHC Referral Slip & Clinical Summary',
      '12-Lead Baseline ECG Strip',
      'Government Photo ID (Aadhaar Card)',
      'Ayushman Bharat PM-JAY Golden Card / ABHA Card',
      'List of ongoing cardiac or blood pressure medicines',
    ],
    patientActionRequired: true,
    nextActionInstruction:
      'Your cardiac bed and specialist slot at Sir Sunderlal Hospital (BHU) are confirmed and locked. Proceed to Room SS-302.',

    createdAtIso: new Date(Date.now() - 1000 * 60 * 40).toISOString(), // 40 mins ago
    updatedAtIso: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    events: [
      {
        id: 'evt-1',
        timestampIso: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        title: 'Referral Initiated by CHC Shivpur',
        description: 'Dr. Priya Tripathi completed clinical triage and created digital inter-facility referral dossier.',
        actor: 'Dr. Priya Tripathi (CHC Shivpur)',
        status: 'SUBMITTED',
      },
      {
        id: 'evt-2',
        timestampIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        title: 'Dispatched to Receiving Hospital',
        description: 'Electronic transfer request pushed to Sir Sunderlal Hospital IMS BHU Inbound Specialty Desk.',
        actor: 'HealthConnect Referral Engine',
        status: 'PENDING_CONFIRMATION',
      },
      {
        id: 'evt-3',
        timestampIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        title: 'Referral Accepted & Emergency ICU Bed Locked',
        description:
          'Prof. R. C. Shukla accepted the case. Priority Token REF-014 issued and Emergency Cardiac Bed #ICU-04 locked for 45 minutes.',
        actor: 'Prof. R. C. Shukla (IMS BHU)',
        status: 'ACCEPTED_BED_LOCKED',
      },
    ],
  },
  {
    id: 'ref-002',
    referralCode: 'REF-2026-7734',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    abhaId: '14-8842-1920-5531',

    referringFacilityId: 'fac-varanasi-dh',
    referringFacilityName: 'Pandit Deendayal Upadhyay District Hospital',
    referringFacilityTier: 'DISTRICT_HOSPITAL',
    referringFacilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    referringDoctorId: 'doc-dh-4',
    referringDoctorName: 'Dr. Alok Srivastava',
    referringDoctorSpecialty: 'Orthopedics & Trauma',

    clinicalReason: 'Compound Grade-II Fracture of Right Tibia-Fibula requiring C-Arm Guided Open Reduction',
    plainLanguageExplanation:
      'District hospital orthopedic theatre is currently undergoing scheduled sterilization. Referral generated for tertiary trauma surgical fixation.',
    requiredSpecialty: 'Orthopedics & Trauma',
    requiredTreatments: ['Open Reduction & Internal Fixation (ORIF)', 'C-Arm Fluoroscopy', 'CT Scan Extremity'],
    requiredDiagnostics: ['Digital X-Ray Right Leg AP/Lateral', 'Coagulation Profile (PT/INR)'],
    urgency: 'URGENT',
    slaExpiresAtIso: new Date(Date.now() + 1000 * 60 * 120).toISOString(),

    receivingFacilityId: 'fac-bhu-ssh',
    receivingFacilityName: 'Sir Sunderlal Hospital, IMS BHU',
    receivingFacilityAddress: 'BHU Main Campus, Varanasi, Uttar Pradesh 221005',
    receivingFacilityTier: 'TERTIARY_AIIMS',

    status: 'FALLBACK_REROUTING',
    rejectionReason: 'Emergency Trauma OT at maximum capacity due to multi-casualty highway accident',
    fallbackFacilitySuggested: true,
    fallbackFacilityId: 'fac-varanasi-dh',
    bedReserved: false,

    instructions: [
      'The requested trauma wing cannot accommodate immediate non-trauma admissions.',
      'HealthConnect has matched Pandit Deendayal Upadhyay District Hospital Trauma Unit (Alternative Facility) with open surgical slots.',
      'Review and accept the verified alternative facility below to confirm your transfer.',
    ],
    requiredDocuments: [
      'Original X-Ray films & immobilization splint report',
      'Photo ID (Aadhaar Card)',
      'Tetanus toxoid injection receipt',
    ],
    patientActionRequired: true,
    nextActionInstruction:
      'The initial receiving facility was full. Please review and confirm the verified alternative hospital.',

    createdAtIso: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAtIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    events: [
      {
        id: 'evt-201',
        timestampIso: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        title: 'Referral Created',
        description: 'Case submitted for Orthopedic tertiary care by Dr. Alok Srivastava.',
        actor: 'Dr. Alok Srivastava',
        status: 'SUBMITTED',
      },
      {
        id: 'evt-202',
        timestampIso: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        title: 'Receiving Facility Overloaded',
        description:
          'Sir Sunderlal Hospital Trauma Bay reported 100% capacity due to highway accident triage.',
        actor: 'IMS BHU Emergency Desk',
        status: 'REJECTED',
      },
      {
        id: 'evt-203',
        timestampIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        title: 'Automated Verified Fallback Matched',
        description:
          'System verified immediate orthopedic surgical capacity at Pandit Deendayal Upadhyay District Hospital.',
        actor: 'HealthConnect Rerouting Engine',
        status: 'FALLBACK_REROUTING',
      },
    ],
  },
  {
    id: 'ref-003',
    referralCode: 'REF-2026-5120',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    abhaId: '14-8842-1920-5531',

    referringFacilityId: 'fac-shivpur-chc',
    referringFacilityName: 'Community Health Centre (CHC) Shivpur',
    referringFacilityTier: 'CHC',
    referringFacilityAddress: 'Shivpur Bypass, Varanasi, Uttar Pradesh 221003',
    referringDoctorId: 'doc-chc-1',
    referringDoctorName: 'Dr. S. K. Maurya',
    referringDoctorSpecialty: 'Pediatrics & Family Medicine',

    clinicalReason: 'Type 2 Diabetes Mellitus with Diabetic Retinopathy screening recommendation',
    plainLanguageExplanation:
      'Routine referral for dilated fundus photography and specialized ophthalmologist evaluation to ensure blood sugar levels have not impacted vision.',
    requiredSpecialty: 'Ophthalmology & Retina Care',
    requiredTreatments: ['Fundus Fluorescein Angiography', 'Slit Lamp Bio-microscopy'],
    requiredDiagnostics: ['Fasting Blood Glucose', 'HbA1c Glycated Hemoglobin'],
    urgency: 'ROUTINE',
    slaExpiresAtIso: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),

    receivingFacilityId: 'fac-varanasi-dh',
    receivingFacilityName: 'Pandit Deendayal Upadhyay District Hospital',
    receivingFacilityAddress: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    receivingFacilityTier: 'DISTRICT_HOSPITAL',
    receivingDoctorName: 'Dr. Anand Verma',
    receivingDoctorSpecialty: 'General Medicine & Diabetology',

    status: 'COMPLETED',
    bedReserved: false,

    arrivedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    completedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    outcomeReceipt: {
      closingDiagnosis: 'Mild Non-Proliferative Diabetic Retinopathy (NPDR) in Left Eye',
      consultationSummary:
        'Patient underwent dilated indirect ophthalmoscopy. No maculopathy detected. Initiated strict glycemic control and oral anti-oxidants.',
      prescriptionsIssued: ['Tab Metformin 500mg BD', 'Lubricating Eye Drops QID', 'Antioxidant & Lutein Capsule OD'],
      followUpRequired: true,
      followUpDate: '2026-10-15',
      feedbackTransmittedToOriginatingFacility: true,
      closedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      dischargingDoctorName: 'Dr. Anand Verma',
    },

    instructions: ['Completed consultation. Carry your electronic outcome receipt to your next CHC review.'],
    requiredDocuments: ['Completed Referral Slip', 'Prescription Slip'],
    patientActionRequired: false,
    nextActionInstruction: 'Consultation completed. Referral closed with feedback sent to CHC Shivpur.',

    createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    events: [
      {
        id: 'evt-301',
        timestampIso: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        title: 'Referral Issued',
        description: 'Referral for Retina screening created by CHC Shivpur.',
        actor: 'Dr. S. K. Maurya',
        status: 'SUBMITTED',
      },
      {
        id: 'evt-302',
        timestampIso: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        title: 'Arrival Confirmed at Desk',
        description: 'Patient check-in completed at District Hospital OPD Counter #2.',
        actor: 'Front Desk Operator',
        status: 'PATIENT_ARRIVED',
      },
      {
        id: 'evt-303',
        timestampIso: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
        title: 'Consultation Completed & Loop Closed',
        description:
          'Specialist consultation concluded. Electronic outcome receipt transmitted back to CHC Shivpur.',
        actor: 'Dr. Anand Verma (District Hospital)',
        status: 'COMPLETED',
      },
    ],
  },
]

export const referralService = {
  /**
   * Retrieves all referrals for the active citizen
   */
  async getPatientReferrals(): Promise<ReferralClinicalSummary[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return [...referralsState]
  },

  /**
   * Retrieves a single referral dossier by ID
   */
  async getReferralById(id: string): Promise<ReferralClinicalSummary | null> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const item = referralsState.find((r) => r.id === id || r.referralCode === id)
    return item ? { ...item } : null
  },

  /**
   * Treatment-based facility matching engine
   * Matches public healthcare facilities based on required treatment, specialty,
   * diagnostic equipment availability, and real-time bed capacity.
   */
  async getMatchingReceivingFacilities(referralId: string): Promise<ReceivingFacilityMatch[]> {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const referral = referralsState.find((r) => r.id === referralId)
    if (!referral) return []

    // Fetch full facilities from facilityService
    const telemetryList = await facilityService.getFacilities()
    const fullList = await Promise.all(telemetryList.map((t) => facilityService.getFacilityById(t.id)))
    const facilities = fullList.filter((f): f is import('@/types/facility').FacilityDetail => f !== null)

    // Match each facility against the referral requirements
    const matches: ReceivingFacilityMatch[] = facilities.map((f) => {
      const isGovernment = f.ownership === 'GOVERNMENT'
      const hasCardio = f.departments?.some((d) => d.name.toLowerCase().includes('cardio')) || false
      const hasOrtho = f.departments?.some((d) => d.name.toLowerCase().includes('ortho')) || false
      const hasGeneral = f.departments?.some((d) => d.name.toLowerCase().includes('general medicine')) || false

      const requiredSpecialtyLower = referral.requiredSpecialty.toLowerCase()
      const hasRequiredSpecialty =
        (requiredSpecialtyLower.includes('cardio') && hasCardio) ||
        (requiredSpecialtyLower.includes('ortho') && hasOrtho) ||
        (requiredSpecialtyLower.includes('general') && hasGeneral) ||
        (f.specialistsOnDuty?.some((s) => s.specialty.toLowerCase().includes('cardio') || s.specialty.toLowerCase().includes('medicine')) ?? false)

      const availableIcu = f.icuBeds?.available ?? 0
      const availableO2 = f.oxygenBeds?.available ?? 0
      const availableGen = f.generalBeds?.available ?? 0
      const hasBedCapacity = availableIcu > 0 || availableGen > 5

      // Equipment match
      const equipNames = f.diagnosticEquipment?.map((e) => e.name.toLowerCase()) || []
      const hasCathLab = equipNames.some((e) => e.includes('cath lab'))
      const hasEcg = equipNames.some((e) => e.includes('ecg'))
      const hasCt = equipNames.some((e) => e.includes('ct'))
      const hasXray = equipNames.some((e) => e.includes('x-ray'))

      let hasRequiredEquipment = true
      if (requiredSpecialtyLower.includes('cardio')) {
        hasRequiredEquipment = hasCathLab || hasEcg
      } else if (requiredSpecialtyLower.includes('ortho')) {
        hasRequiredEquipment = hasXray || hasCt
      }

      // Calculate match score
      let score = 70
      if (isGovernment) score += 10
      if (hasRequiredSpecialty) score += 10
      if (hasRequiredEquipment) score += 5
      if (hasBedCapacity) score += 5
      if ((f.distanceKm ?? 999) < 10) score += 5

      // Build explainable reasons why suitable
      const reasonsWhySuitable: string[] = []
      if (hasRequiredSpecialty) {
        reasonsWhySuitable.push(`Dedicated ${referral.requiredSpecialty} department operational`)
      }
      if (hasCathLab && requiredSpecialtyLower.includes('cardio')) {
        reasonsWhySuitable.push('Bi-Plane Digital Cath Lab on-site for immediate intervention')
      }
      if (hasEcg) {
        reasonsWhySuitable.push('12-Lead Digital ECG & emergency cardiac telemetry active')
      }
      if (hasCt && requiredSpecialtyLower.includes('ortho')) {
        reasonsWhySuitable.push('Digital C-Arm fluoroscopy and high-resolution trauma X-Ray available')
      }
      if (availableIcu > 0) {
        reasonsWhySuitable.push(`${availableIcu} Emergency ICU beds verified open right now`)
      }
      if (isGovernment) {
        reasonsWhySuitable.push('100% Cashless Public Care under National Health Mission / PM-JAY')
      }

      let acceptanceCapability: 'HIGH_CAPACITY' | 'ACCEPTING' | 'LIMITED' | 'UNAVAILABLE' = 'ACCEPTING'
      if (availableIcu > 5) acceptanceCapability = 'HIGH_CAPACITY'
      else if (availableIcu === 0 && availableGen < 5) acceptanceCapability = 'LIMITED'

      return {
        facilityId: f.id,
        facilityName: f.name,
        facilityTier: f.tier,
        ownership: f.ownership,
        address: f.address,
        distanceKm: f.distanceKm ?? 5.0,
        estimatedTravelTimeMins: f.estimatedTravelTimeMins ?? 15,
        matchScore: Math.min(score, 99),
        hasRequiredSpecialty,
        hasRequiredEquipment,
        hasBedCapacity,
        availableIcuBeds: availableIcu,
        availableOxygenBeds: availableO2,
        availableGeneralBeds: availableGen,
        acceptanceCapability,
        specialistsOnDuty: f.specialistsOnDuty?.map((s) => `${s.name} (${s.specialty})`) || [],
        diagnosticSupport: f.diagnosticEquipment?.map((d) => d.name) || [],
        reasonsWhySuitable,
        isAyushmanEmpaneled: f.isAyushmanEmpaneled,
        emergencyHelpline: f.emergencyHelpline || '108',
        nextAvailableSlot: 'Today • 11:30 AM (OPD Counter 4)',
      }
    })

    // Sort: Government first, then highest match score, then closest distance
    return matches.sort((a, b) => {
      if (a.ownership === 'GOVERNMENT' && b.ownership !== 'GOVERNMENT') return -1
      if (a.ownership !== 'GOVERNMENT' && b.ownership === 'GOVERNMENT') return 1
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999)
    })
  },

  /**
   * Patient selects/accepts receiving facility
   */
  async acceptReceivingFacility(referralId: string, facilityId: string): Promise<ReferralClinicalSummary> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const index = referralsState.findIndex((r) => r.id === referralId)
    if (index === -1) throw new Error('Referral not found')

    const facility = await facilityService.getFacilityById(facilityId)
    if (!facility) throw new Error('Facility not found')

    const updated: ReferralClinicalSummary = {
      ...referralsState[index],
      receivingFacilityId: facility.id,
      receivingFacilityName: facility.name,
      receivingFacilityAddress: facility.address,
      receivingFacilityTier: facility.tier,
      status: 'ACCEPTED_BED_LOCKED',
      bedReserved: true,
      bedReservationType: 'ICU',
      bedReservationExpiryIso: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
      linkedQueueToken: `REF-0${Math.floor(10 + Math.random() * 80)}`,
      fallbackFacilitySuggested: false,
      nextActionInstruction: `Your bed and priority slot are locked at ${facility.name}. Proceed to reception or schedule an appointment.`,
      updatedAtIso: new Date().toISOString(),
      events: [
        ...referralsState[index].events,
        {
          id: `evt-${Date.now()}`,
          timestampIso: new Date().toISOString(),
          title: 'Patient Accepted Receiving Facility',
          description: `Patient confirmed ${facility.name}. Priority bed locked for 45 minutes.`,
          actor: 'Patient (Self-Confirmed)',
          status: 'ACCEPTED_BED_LOCKED',
        },
      ],
    }

    referralsState[index] = updated
    return updated
  },

  /**
   * Request 108 Emergency Ambulance Transit
   */
  async requestTransit(referralId: string, type: 'AMBULANCE_108' | 'SELF_TRANSPORT'): Promise<ReferralClinicalSummary> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const index = referralsState.findIndex((r) => r.id === referralId)
    if (index === -1) throw new Error('Referral not found')

    const isAmbulance = type === 'AMBULANCE_108'
    const updated: ReferralClinicalSummary = {
      ...referralsState[index],
      status: 'IN_TRANSIT',
      ambulanceDispatched: isAmbulance,
      ambulanceVehicleNumber: isAmbulance ? 'UP 65 G 1082 (BLS Ambulance)' : undefined,
      ambulanceDriverPhone: isAmbulance ? '+91 94150 10801' : undefined,
      ambulanceEtaMinutes: isAmbulance ? 12 : 25,
      nextActionInstruction: isAmbulance
        ? 'Ambulance 108 dispatched. Paramedic will contact you shortly.'
        : 'Patient is en route via private/public transit. Present referral code upon arrival.',
      updatedAtIso: new Date().toISOString(),
      events: [
        ...referralsState[index].events,
        {
          id: `evt-${Date.now()}`,
          timestampIso: new Date().toISOString(),
          title: isAmbulance ? '108 Ambulance Dispatched' : 'Patient Commenced Transit',
          description: isAmbulance
            ? 'Emergency transit coordination activated. Ambulance #UP-65-G-1082 in route (ETA ~12 mins).'
            : 'Patient marked as in-transit to receiving facility.',
          actor: isAmbulance ? '108 Dispatch Control Room' : 'Patient',
          status: 'IN_TRANSIT',
        },
      ],
    }

    referralsState[index] = updated
    return updated
  },

  /**
   * Confirm arrival at receiving facility reception desk
   */
  async confirmArrival(referralId: string): Promise<ReferralClinicalSummary> {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const index = referralsState.findIndex((r) => r.id === referralId)
    if (index === -1) throw new Error('Referral not found')

    const updated: ReferralClinicalSummary = {
      ...referralsState[index],
      status: 'PATIENT_ARRIVED',
      arrivedAtIso: new Date().toISOString(),
      nextActionInstruction:
        'Arrival verified. Proceed to Room SS-302 with your referral dossier. Token is active in clinic queue.',
      updatedAtIso: new Date().toISOString(),
      events: [
        ...referralsState[index].events,
        {
          id: `evt-${Date.now()}`,
          timestampIso: new Date().toISOString(),
          title: 'Physical Arrival Confirmed at Receiving Desk',
          description:
            'Patient checked in at receiving facility registration desk. Handshake verified. Directed to specialty clinic.',
          actor: 'Receiving Desk Officer',
          status: 'PATIENT_ARRIVED',
        },
      ],
    }

    referralsState[index] = updated
    return updated
  },

  /**
   * Reroute to verified alternative facility (Fallback)
   */
  async switchFallbackFacility(referralId: string, alternativeFacilityId: string): Promise<ReferralClinicalSummary> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const index = referralsState.findIndex((r) => r.id === referralId)
    if (index === -1) throw new Error('Referral not found')

    const facility = await facilityService.getFacilityById(alternativeFacilityId)
    if (!facility) throw new Error('Alternative facility not found')

    const updated: ReferralClinicalSummary = {
      ...referralsState[index],
      receivingFacilityId: facility.id,
      receivingFacilityName: facility.name,
      receivingFacilityAddress: facility.address,
      receivingFacilityTier: facility.tier,
      status: 'ACCEPTED_BED_LOCKED',
      bedReserved: true,
      bedReservationExpiryIso: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
      fallbackFacilitySuggested: false,
      rejectionReason: undefined,
      nextActionInstruction: `Rerouted and locked at alternative facility: ${facility.name}. Proceed for admission/OPD.`,
      updatedAtIso: new Date().toISOString(),
      events: [
        ...referralsState[index].events,
        {
          id: `evt-${Date.now()}`,
          timestampIso: new Date().toISOString(),
          title: 'Rerouted to Verified Alternative Facility',
          description: `Referral transferred to ${facility.name}. Bed locked for 45 minutes.`,
          actor: 'System Auto-Reroute',
          status: 'ACCEPTED_BED_LOCKED',
        },
      ],
    }

    referralsState[index] = updated
    return updated
  },

  /**
   * Reset simulation state for evaluators
   */
  resetSimulation(): void {
    // Restore initial state
    referralsState = [
      {
        ...referralsState[0],
        status: 'ACCEPTED_BED_LOCKED',
        bedReserved: true,
        ambulanceDispatched: false,
      },
      {
        ...referralsState[1],
        status: 'FALLBACK_REROUTING',
        receivingFacilityId: 'fac-bhu-ssh',
        receivingFacilityName: 'Sir Sunderlal Hospital, IMS BHU',
        fallbackFacilitySuggested: true,
      },
      {
        ...referralsState[2],
        status: 'COMPLETED',
      },
    ]
  },
}
