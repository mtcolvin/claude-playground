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

const updateLabResultSchema = z.object({
  testName: z.string().min(1).optional(),
  testDate: z.string().datetime().optional(),
  category: z.string().optional(),
  orderedBy: z.string().optional(),
  facility: z.string().optional(),
  results: z.array(z.object({
    name: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    status: z.enum(["NORMAL", "ABNORMAL", "CRITICAL"]).optional(),
  })).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

// GET /api/v1/lab-results/:id - Get specific lab result
export const GET = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    const labResult = await prisma.labResult.findUnique({
      where: { id },
    })

    if (!labResult) {
      throw new ApiError("Lab result not found", 404)
    }

    if (labResult.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    return successResponse(labResult)
  },
  { requireAuth: true }
)

// PUT /api/v1/lab-results/:id - Update lab result
export const PUT = apiHandler(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()
    const data = updateLabResultSchema.parse(body)

    // Check ownership
    const existing = await prisma.labResult.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Lab result not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Update lab result
    const labResult = await prisma.labResult.update({
      where: { id },
      data: {
        ...(data.testName && { testName: data.testName }),
        ...(data.testDate && { testDate: new Date(data.testDate) }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.orderedBy !== undefined && { orderedBy: data.orderedBy }),
        ...(data.facility !== undefined && { facility: data.facility }),
        ...(data.results && { results: data.results }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.attachments && { attachments: data.attachments }),
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "UPDATE",
      "LabResult",
      labResult.id,
      data,
      request
    )

    return successResponse(labResult)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)

// DELETE /api/v1/lab-results/:id - Delete lab result
export const DELETE = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    // Check ownership
    const existing = await prisma.labResult.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Lab result not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Delete lab result
    await prisma.labResult.delete({
      where: { id },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "DELETE",
      "LabResult",
      id,
      { testName: existing.testName },
      request
    )

    return successResponse({ message: "Lab result deleted successfully" })
  },
  { requirePermission: Permission.DELETE_OWN_DATA }
)
