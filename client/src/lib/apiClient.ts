import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiProblemDetails, ApiResponse } from '@/types/api'

// Centralized Base URL (configurable via VITE_API_URL)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Injects X-Request-Id, X-Idempotency-Key, and Bearer Auth
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate correlation ID
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    config.headers.set('X-Request-Id', requestId)

    // For state-mutating requests, inject idempotency key if not already provided
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      if (!config.headers.has('X-Idempotency-Key')) {
        const idempotencyKey = `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        config.headers.set('X-Idempotency-Key', idempotencyKey)
      }
    }

    // Retrieve token from localStorage/session
    const token = localStorage.getItem('sanjeevani_access_token')
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Parses RFC 7807 Problem Details
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiProblemDetails>) => {
    if (!error.response) {
      // Network failure / Offline
      const networkProblem: ApiProblemDetails = {
        success: false,
        error: {
          code: 'ERR_NETWORK_DISCONNECTED',
          message: 'Unable to connect to healthcare server. Please verify your internet connection.',
          correlationId: 'CLIENT_NETWORK_ERR',
          timestamp: new Date().toISOString(),
        },
      }
      return Promise.reject(networkProblem)
    }

    // Server responded with standard RFC 7807 problem details
    if (error.response.data && error.response.data.error) {
      return Promise.reject(error.response.data)
    }

    // Fallback for non-standard error structures
    const fallbackProblem: ApiProblemDetails = {
      success: false,
      error: {
        code: `HTTP_${error.response.status}`,
        message: error.message || 'An unexpected server error occurred.',
        correlationId: (error.config?.headers?.['X-Request-Id'] as string) || 'UNKNOWN',
        timestamp: new Date().toISOString(),
      },
    }
    return Promise.reject(fallbackProblem)
  }
)

/**
 * Generic typed GET request wrapper
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

/**
 * Generic typed POST request wrapper
 */
export async function apiPost<T, B = unknown>(url: string, body: B): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body)
  return res.data.data
}
