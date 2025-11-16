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

const updateMedicationSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  prescribedBy: z.string().optional(),
  purpose: z.string().optional(),
  sideEffects: z.string().optional(),
  instructions: z.string().optional(),
  refillDate: z.string().datetime().optional(),
  reminderTimes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/v1/medications/:id - Get specific medication
export const GET = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    const medication = await prisma.medication.findUnique({
      where: { id },
      include: {
        adherence: {
          orderBy: { scheduledTime: "desc" },
          take: 30,
        },
      },
    })

    if (!medication) {
      throw new ApiError("Medication not found", 404)
    }

    if (medication.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    return successResponse(medication)
  },
  { requireAuth: true }
)

// PUT /api/v1/medications/:id - Update medication
export const PUT = apiHandler(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()
    const data = updateMedicationSchema.parse(body)

    // Check ownership
    const existing = await prisma.medication.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Medication not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Update medication
    const medication = await prisma.medication.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.dosage && { dosage: data.dosage }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.prescribedBy !== undefined && { prescribedBy: data.prescribedBy }),
        ...(data.purpose !== undefined && { purpose: data.purpose }),
        ...(data.sideEffects !== undefined && { sideEffects: data.sideEffects }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.refillDate !== undefined && { refillDate: data.refillDate ? new Date(data.refillDate) : null }),
        ...(data.reminderTimes && { reminderTimes: data.reminderTimes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "UPDATE",
      "Medication",
      medication.id,
      data,
      request
    )

    return successResponse(medication)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)

// DELETE /api/v1/medications/:id - Delete medication
export const DELETE = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    // Check ownership
    const existing = await prisma.medication.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Medication not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Delete medication
    await prisma.medication.delete({
      where: { id },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "DELETE",
      "Medication",
      id,
      { name: existing.name },
      request
    )

    return successResponse({ message: "Medication deleted successfully" })
  },
  { requirePermission: Permission.DELETE_OWN_DATA }
)
