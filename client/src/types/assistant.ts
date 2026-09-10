import type { FacilityTelemetry } from './facility'
import type { AppointmentDetail } from './appointment'
import type { ActiveToken } from './queue'
import type { ReferralClinicalSummary } from './referral'
import type { DiagnosticOrder } from './diagnostic'
import type { DigitalPrescription, MedicineItem } from './prescription'
import type { BloodStockItem, AmbulanceFleetInfo, EmergencyContact } from './emergency'
import type { FollowUpCareItem } from './followUp'
import type { MyCareOverview } from './record'

export type AssistantIntent =
  | 'FIND_FACILITY'
  | 'FIND_TREATMENT'
  | 'BOOK_APPOINTMENT'
  | 'VIEW_APPOINTMENT'
  | 'RESCHEDULE_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'VIEW_QUEUE'
  | 'CHECK_IN_QUEUE'
  | 'VIEW_REFERRAL'
  | 'TRACK_REFERRAL'
  | 'FIND_DIAGNOSTIC'
  | 'VIEW_REPORT'
  | 'VIEW_PRESCRIPTION'
  | 'FIND_MEDICINE'
  | 'EMERGENCY_URGENT'
  | 'FIND_BLOOD'
  | 'FIND_AMBULANCE'
  | 'VIEW_FOLLOWUP'
  | 'VIEW_MY_CARE'
  | 'MEDICATION_SAFETY_DISCLAIMER'
  | 'CLINICAL_DISCLAIMER'
  | 'UNKNOWN'

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING' | 'ERROR'

export type VoiceErrorType =
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'NO_SPEECH'
  | 'AUDIO_CAPTURE'
  | 'NETWORK'
  | 'UNKNOWN'

export interface VoiceSessionState {
  status: VoiceState
  transcript: string
  interimTranscript: string
  errorType?: VoiceErrorType
  errorMessage?: string
  ttsEnabled: boolean
}

export type ActionType =
  | 'NAVIGATE'
  | 'BOOK_APPOINTMENT'
  | 'RESCHEDULE_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'CHECK_IN_QUEUE'
  | 'EMERGENCY_CALL'
  | 'VIEW_PRESCRIPTION'
  | 'VIEW_DIAGNOSTIC'
  | 'VIEW_REFERRAL'

export interface AssistantProposedAction {
  id: string
  type: ActionType
  title: string
  description: string
  destinationUrl?: string
  requiresConfirmation: boolean
  confirmationPrompt?: string
  params?: Record<string, string | number | boolean>
  status: 'PROPOSED' | 'CONFIRMED' | 'EXECUTED' | 'DISMISSED'
}

export interface AssistantStructuredData {
  facilities?: FacilityTelemetry[]
  appointment?: AppointmentDetail
  appointments?: AppointmentDetail[]
  queueToken?: ActiveToken
  referral?: ReferralClinicalSummary
  diagnosticOrders?: DiagnosticOrder[]
  prescriptions?: DigitalPrescription[]
  medications?: MedicineItem[]
  bloodStock?: BloodStockItem[]
  ambulanceFleet?: AmbulanceFleetInfo[]
  emergencyHelplines?: EmergencyContact[]
  followUps?: FollowUpCareItem[]
  myCareOverview?: MyCareOverview
}

export interface AssistantMessage {
  id: string
  sender: 'user' | 'assistant' | 'system'
  text: string
  timestamp: string
  intent?: AssistantIntent
  structuredData?: AssistantStructuredData
  proposedAction?: AssistantProposedAction
  quickReplies?: string[]
  isEmergency?: boolean
  requiresClinicalDisclaimer?: boolean
}

export interface ContextualSuggestion {
  id: string
  label: string
  query: string
  badge?: string
  intent: AssistantIntent
  urgency?: 'URGENT' | 'HIGH' | 'NORMAL'
}
