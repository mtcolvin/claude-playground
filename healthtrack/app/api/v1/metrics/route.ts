import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getSortParams,
  logAuditTrail,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

// Validation schemas
const createMetricSchema = z.object({
  type: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// GET /api/v1/metrics - List health metrics
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: any = {
      userId: request.user.id,
    }

    // Filter by type
    const type = searchParams.get("type")
    if (type) {
      where.type = type
    }

    // Filter by date range
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Filter by value range
    const minValue = searchParams.get("minValue")
    const maxValue = searchParams.get("maxValue")
    if (minValue || maxValue) {
      where.value = {}
      if (minValue) where.value.gte = parseFloat(minValue)
      if (maxValue) where.value.lte = parseFloat(maxValue)
    }

    // Execute query
    const [metrics, total] = await Promise.all([
      prisma.healthMetric.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.healthMetric.count({ where }),
    ])

    return paginatedResponse(metrics, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/metrics - Create health metric
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createMetricSchema.parse(body)

    const metric = await prisma.healthMetric.create({
      data: {
        userId: request.user.id,
        type: data.type,
        value: data.value,
        unit: data.unit,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
        source: data.source,
        metadata: data.metadata as any,
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "HealthMetric",
      metric.id,
      { type: data.type, value: data.value },
      request
    )

    return successResponse(metric, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
