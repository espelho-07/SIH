/**
 * Standard API Response Envelope
 * In strict compliance with 03_API_INTEGRATION_PRD.md
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    requestId: string
    timestamp: string
    processingTimeMs?: number
    page?: number
    limit?: number
    total?: number
  }
}

/**
 * Standard RFC 7807 Problem Details Error Envelope
 */
export interface ApiProblemDetails {
  success: false
  error: {
    code: string
    message: string
    target?: string
    validationErrors?: Array<{
      field: string
      message: string
      rule: string
    }>
    correlationId: string
    timestamp: string
    docUrl?: string
  }
}
