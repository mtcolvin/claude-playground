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
const createLabResultSchema = z.object({
  testName: z.string().min(1),
  loincCode: z.string().optional(),
  date: z.string().datetime(),
  value: z.number().optional(),
  textValue: z.string().optional(),
  unit: z.string().optional(),
  referenceRangeLow: z.number().optional(),
  referenceRangeHigh: z.number().optional(),
  status: z.string().optional(),
  orderedBy: z.string().optional(),
  performedBy: z.string().optional(),
  notes: z.string().optional(),
  fileId: z.string().optional(),
})

// GET /api/v1/lab-results - List lab results
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: any = {
      userId: request.user.id,
    }

    // Filter by date range
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Search by test name
    const search = searchParams.get("search")
    if (search) {
      where.testName = { contains: search, mode: "insensitive" }
    }

    // Execute query
    const [labResults, total] = await Promise.all([
      prisma.labResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.labResult.count({ where }),
    ])

    return paginatedResponse(labResults, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/lab-results - Create lab result
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createLabResultSchema.parse(body)

    const labResult = await prisma.labResult.create({
      data: {
        userId: request.user.id,
        testName: data.testName,
        loincCode: data.loincCode,
        date: new Date(data.date),
        value: data.value,
        textValue: data.textValue,
        unit: data.unit,
        referenceRangeLow: data.referenceRangeLow,
        referenceRangeHigh: data.referenceRangeHigh,
        status: data.status,
        orderedBy: data.orderedBy,
        performedBy: data.performedBy,
        notes: data.notes,
        fileId: data.fileId,
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "LabResult",
      labResult.id,
      { testName: data.testName, date: data.date },
      request
    )

    return successResponse(labResult, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
