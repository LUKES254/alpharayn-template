import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
      "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}

export async function GET(request: NextRequest) {
  return auth.handler(request)
}

export async function POST(request: NextRequest) {
  try {
    return await auth.handler(request)
  } catch (err) {
    // Log the server-side error for debugging
    console.error("Auth handler error:", err)

    const payload: any = {
      error: err instanceof Error ? err.message : "Internal Server Error",
    }

    // Include stack trace in development to aid debugging
    if (process.env.NODE_ENV === "development" && err instanceof Error) {
      payload.stack = err.stack
    }

    return new NextResponse(JSON.stringify(payload), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

export async function PUT(request: NextRequest) {
  return auth.handler(request)
}

export async function DELETE(request: NextRequest) {
  return auth.handler(request)
}

export async function PATCH(request: NextRequest) {
  return auth.handler(request)
}