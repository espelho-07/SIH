import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default freshness
      gcTime: 10 * 60 * 1000, // 10 minutes cache retention
      retry: (failureCount, error: any) => {
        // Do not retry 4xx errors (client errors)
        if (error?.error?.code?.startsWith('HTTP_4')) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false, // Prevent distracting refetches in high-stress OPD environments
    },
    mutations: {
      retry: false, // Do not auto-retry state mutations to prevent double submissions
    },
  },
})
