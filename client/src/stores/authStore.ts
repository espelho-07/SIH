import { create } from 'zustand'
import type { UserProfile, UserRole } from '@/types/auth'

interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  setSession: (user: UserProfile, token: string) => void
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

export const DEFAULT_PATIENT_USER: UserProfile = {
  id: 'USR-patient',
  phoneNumber: '+91 98765 43210',
  fullName: 'Rajesh Sharma',
  role: 'ROLE_PATIENT',
  abhaAddress: 'rajesh.sharma@abdm',
  abhaNumber: '14-8842-1920-5531',
  facilityName: 'District Hospital, Varanasi',
}

const getInitialToken = (): string | null => {
  return (
    localStorage.getItem('healthconnect_access_token') ||
    localStorage.getItem('sanjeevani_access_token') ||
    'mock-patient-session-token'
  )
}

const getInitialUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem('healthconnect_user_profile')
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // Ignore JSON parse error
  }
  return DEFAULT_PATIENT_USER
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  accessToken: getInitialToken(),
  isAuthenticated: !!getInitialToken(),

  setSession: (user: UserProfile, token: string) => {
    localStorage.setItem('healthconnect_access_token', token)
    localStorage.setItem('healthconnect_user_role', user.role)
    localStorage.setItem('healthconnect_user_profile', JSON.stringify(user))
    localStorage.setItem('sanjeevani_access_token', token)
    localStorage.setItem('sanjeevani_user_role', user.role)
    set({ user, accessToken: token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('healthconnect_access_token')
    localStorage.removeItem('healthconnect_user_role')
    localStorage.removeItem('healthconnect_user_profile')
    localStorage.removeItem('sanjeevani_access_token')
    localStorage.removeItem('sanjeevani_user_role')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const currentUser = get().user
    if (!currentUser) return false
    const roleList = Array.isArray(roles) ? roles : [roles]
    return roleList.includes(currentUser.role)
  },
}))
