import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'PATIENT',
      },
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        resourceType: "User",
        resourceId: user.id,
        details: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register user",
      },
      { status: 500 }
    )
  }
}
