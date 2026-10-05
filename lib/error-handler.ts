import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Custom API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Common API error codes
 */
export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
  
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  
  // Resource errors (404, 409)
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Payment errors (402, 400)
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  INVALID_PAYMENT: 'INVALID_PAYMENT',
  
  // Server errors (500, 503)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
} as const

/**
 * Generate a correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Log error with correlation ID and context
 */
function logError(error: unknown, correlationId: string, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const errorInfo: Record<string, unknown> = {
    correlationId,
    timestamp,
    ...context,
  }

  if (error instanceof APIError) {
    errorInfo.code = error.code
    errorInfo.statusCode = error.statusCode
    errorInfo.message = error.message
    if (error.details) errorInfo.details = error.details
  } else if (error instanceof ZodError) {
    errorInfo.code = 'VALIDATION_ERROR'
    errorInfo.statusCode = 400
    errorInfo.validationErrors = error.issues
  } else if (error instanceof Error) {
    errorInfo.message = error.message
    errorInfo.stack = error.stack
  } else {
    errorInfo.error = String(error)
  }

  // In production, you might want to send this to a logging service
  // like Sentry, LogRocket, or Datadog
  if (process.env.NODE_ENV === 'production') {
    console.error('[API Error]', JSON.stringify(errorInfo))
  } else {
    console.error('[API Error]', errorInfo)
  }
}

/**
 * Check if error is a Next.js redirect error (should be re-thrown)
 */
function isNextRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === 'NEXT_REDIRECT' || 
     (error as any).digest?.startsWith?.('NEXT_REDIRECT'))
  )
}

/**
 * Main error handler that returns sanitized error responses
 */
export function handleAPIError(
  error: unknown,
  correlationId?: string,
  context?: Record<string, unknown>
): NextResponse {
  const id = correlationId || generateCorrelationId()
  
  // Re-throw Next.js redirect errors (they should not be caught)
  if (isNextRedirectError(error)) {
    throw error
  }
  
  // Log the full error internally
  logError(error, id, context)

  // Handle specific error types
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        correlationId: id,
        ...(process.env.NODE_ENV === 'development' && error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: ErrorCodes.VALIDATION_ERROR,
        correlationId: id,
        details: error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Handle database errors (don't expose details)
  if (error instanceof Error) {
    if (error.message.includes('CONNECT_TIMEOUT') || error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable. Please try again later.',
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          correlationId: id,
        },
        { status: 503 }
      )
    }

    // Check for common database errors
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          error: 'A resource with this identifier already exists',
          code: ErrorCodes.ALREADY_EXISTS,
          correlationId: id,
        },
        { status: 409 }
      )
    }

    if (error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        {
          error: 'Cannot perform this operation due to related data',
          code: ErrorCodes.CONFLICT,
          correlationId: id,
        },
        { status: 409 }
      )
    }
  }

  // Default internal server error (don't expose details)
  return NextResponse.json(
    {
      error: 'An unexpected error occurred. Please try again later.',
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      correlationId: id,
    },
    { status: 500 }
  )
}

/**
 * Wrap an API route handler with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    const correlationId = generateCorrelationId()
    try {
      return await handler(...args)
    } catch (error) {
      return handleAPIError(error, correlationId, context)
    }
  }) as T
}
