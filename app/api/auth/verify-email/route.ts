import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  
  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=invalid-token", request.url))
  }

  try {
    // Verify the email using the token
    await auth.api.verifyEmail({
      query: { token },
    })

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL("/dashboard?verified=true", request.url))
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/auth/sign-in?error=verification-failed", request.url))
  }
}
