import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  logAuditTrail,
  ApiError,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

const updateMedicalFileSchema = z.object({
  fileName: z.string().min(1).optional(),
  fileType: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/v1/medical-files/:id - Get specific medical file
export const GET = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    const file = await prisma.medicalFile.findUnique({
      where: { id },
    })

    if (!file) {
      throw new ApiError("Medical file not found", 404)
    }

    if (file.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    return successResponse(file)
  },
  { requireAuth: true }
)

// PUT /api/v1/medical-files/:id - Update medical file
export const PUT = apiHandler(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()
    const data = updateMedicalFileSchema.parse(body)

    // Check ownership
    const existing = await prisma.medicalFile.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Medical file not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Update medical file
    const file = await prisma.medicalFile.update({
      where: { id },
      data: {
        ...(data.fileName && { fileName: data.fileName }),
        ...(data.fileType && { fileType: data.fileType }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.tags && { tags: data.tags }),
        ...(data.metadata && { metadata: data.metadata }),
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "UPDATE",
      "MedicalFile",
      file.id,
      data,
      request
    )

    return successResponse(file)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)

// DELETE /api/v1/medical-files/:id - Delete medical file
export const DELETE = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    // Check ownership
    const existing = await prisma.medicalFile.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Medical file not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Delete medical file
    await prisma.medicalFile.delete({
      where: { id },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "DELETE",
      "MedicalFile",
      id,
      { fileName: existing.fileName },
      request
    )

    return successResponse({ message: "Medical file deleted successfully" })
  },
  { requirePermission: Permission.DELETE_OWN_DATA }
)
