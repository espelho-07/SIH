export type UserRole =
  | 'ROLE_PATIENT'
  | 'ROLE_ASHA'
  | 'ROLE_ANM'
  | 'ROLE_DOCTOR'
  | 'ROLE_SPECIALIST'
  | 'ROLE_FACILITY_STAFF'
  | 'ROLE_DISTRICT_ADMIN'
  | 'ROLE_SUPER_ADMIN'

export interface UserProfile {
  id: string
  phoneNumber: string
  fullName: string
  role: UserRole
  facilityId?: string
  facilityName?: string
  abhaAddress?: string
  abhaNumber?: string
  assignedVillage?: string
  specialization?: string
}

export interface AuthSession {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  expiresAt: number | null
}
