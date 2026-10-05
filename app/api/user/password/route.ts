import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { sql } from 'drizzle-orm'
import { hashPassword, comparePassword } from '@/lib/auth-password'

export async function PATCH(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new passwords are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // 1. Verify current password (pseudo, replace with your actual logic)
    // const user = ... fetch user by session.user.id
    // if (!(await comparePassword(currentPassword, user.password_hash))) {
    //   return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    // }

    // 2. Check password history (last 4)
    const historyRows = await sql`
      SELECT password_hash FROM password_history WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 4
    `
    for (const row of historyRows) {
      if (await comparePassword(newPassword, row.password_hash)) {
        return NextResponse.json({ error: "You cannot reuse your last 4 passwords." }, { status: 400 })
      }
    }

    // 3. Hash new password
    const newHash = await hashPassword(newPassword)

    // 4. Update password in user/account table (pseudo, replace with your actual logic)
    // await sql`UPDATE account SET password = ${newHash} WHERE user_id = ${session.user.id}`

    // 5. Insert new password hash into history
    await sql`
      INSERT INTO password_history (user_id, password_hash) VALUES (${session.user.id}, ${newHash})
    `

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    })
  } catch (error) {
    const err = error as Error
    console.error("Password update error:", err.message)
    
    // Handle database connection timeout
    if (err.message?.includes('CONNECT_TIMEOUT') || err.message?.includes('timeout')) {
      return NextResponse.json(
        { error: "Database service temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
}
