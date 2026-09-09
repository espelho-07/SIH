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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('sanjeevani_access_token'),
  isAuthenticated: !!localStorage.getItem('sanjeevani_access_token'),

  setSession: (user: UserProfile, token: string) => {
    localStorage.setItem('sanjeevani_access_token', token)
    localStorage.setItem('sanjeevani_user_role', user.role)
    set({ user, accessToken: token, isAuthenticated: true })
  },

  logout: () => {
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
