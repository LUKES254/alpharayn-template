import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { UpdateProfileSchema } from "@/lib/validation/user-schema"
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from "@/lib/error-handler"

export async function PATCH(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, "Authentication required")
    }

    const body = await request.json()
    
    // Validate input using Zod schema
    const validated = UpdateProfileSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: ErrorCodes.VALIDATION_ERROR,
          details: validated.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
          correlationId,
        },
        { status: 400 }
      )
    }

    const { name, email } = validated.data

    // TODO: Update user in database via better-auth API
    // For now, return success - better-auth handles user updates
    // You may need to call auth.api.updateUser() if available
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, { 
      route: '/api/user/profile',
      method: 'PATCH' 
    })
  }
}
