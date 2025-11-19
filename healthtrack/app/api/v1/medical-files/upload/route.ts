import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string || "other"
    const description = formData.get("description") as string | undefined
    const userIdFromClient = formData.get("userId") as string | null

    // Get user session (with fallback for demo mode)
    const session = await getServerSession(authOptions)

    // Determine userId: prefer session, then client-provided, then demo user
    let userId = session?.user?.id || userIdFromClient

    if (!userId) {
      // Try to find demo user as last resort
      const demoUser = await prisma.user.findFirst({
        where: { email: 'demo@healthtrack.com' }
      })
      if (demoUser) {
        userId = demoUser.id
      } else {
        return NextResponse.json(
          { success: false, error: "No user found. Please sign in." },
          { status: 401 }
        )
      }
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 401 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      )
    }

    // Read file as buffer and convert to base64
    // In production, you would upload to S3/Cloud Storage instead
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Create medical file record
    const medicalFile = await prisma.medicalFile.create({
      data: {
        userId: userId,
        fileName: file.name,
        fileType: file.type,
        category: category,
        description: description,
        fileUrl: dataUrl, // In production, this would be an S3 URL
        fileSize: file.size,
        uploadDate: new Date(),
        tags: [],
      },
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "FILE_UPLOADED",
        resourceType: "MedicalFile",
        resourceId: medicalFile.id,
        details: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: category,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: medicalFile.id,
        fileName: medicalFile.fileName,
        fileType: medicalFile.fileType,
        fileSize: medicalFile.fileSize,
        category: medicalFile.category,
        uploadedAt: medicalFile.uploadDate,
        description: medicalFile.description,
        tags: medicalFile.tags,
      },
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    )
  }
}
