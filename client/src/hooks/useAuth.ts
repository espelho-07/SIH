import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/auth'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setSession = useAuthStore((state) => state.setSession)
  const logout = useAuthStore((state) => state.logout)
  const hasRole = useAuthStore((state) => state.hasRole)

  return {
    user,
    isAuthenticated,
    accessToken,
    setSession,
    logout,
    hasRole: (roles: UserRole | UserRole[]) => hasRole(roles),
  }
}
