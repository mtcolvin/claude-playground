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

const updateMetricSchema = z.object({
  type: z.string().min(1).optional(),
  value: z.number().optional(),
  unit: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/v1/metrics/:id - Get specific metric
export const GET = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    const metric = await prisma.healthMetric.findUnique({
      where: { id },
    })

    if (!metric) {
      throw new ApiError("Metric not found", 404)
    }

    if (metric.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    return successResponse(metric)
  },
  { requireAuth: true }
)

// PUT /api/v1/metrics/:id - Update metric
export const PUT = apiHandler(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()
    const data = updateMetricSchema.parse(body)

    // Check ownership
    const existing = await prisma.healthMetric.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Metric not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Update metric
    const metric = await prisma.healthMetric.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.unit && { unit: data.unit }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "UPDATE",
      "HealthMetric",
      metric.id,
      data,
      request
    )

    return successResponse(metric)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)

// DELETE /api/v1/metrics/:id - Delete metric
export const DELETE = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    // Check ownership
    const existing = await prisma.healthMetric.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Metric not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Delete metric
    await prisma.healthMetric.delete({
      where: { id },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "DELETE",
      "HealthMetric",
      id,
      { type: existing.type },
      request
    )

    return successResponse({ message: "Metric deleted successfully" })
  },
  { requirePermission: Permission.DELETE_OWN_DATA }
)
