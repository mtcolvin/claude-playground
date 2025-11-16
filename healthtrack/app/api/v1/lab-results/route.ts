import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getSortParams,
  logAuditTrail,
  ApiError,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

// Validation schemas
const createLabResultSchema = z.object({
  testName: z.string().min(1),
  testDate: z.string().datetime(),
  category: z.string().optional(),
  orderedBy: z.string().optional(),
  facility: z.string().optional(),
  results: z.array(z.object({
    name: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    status: z.enum(["NORMAL", "ABNORMAL", "CRITICAL"]).optional(),
  })),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

const updateLabResultSchema = createLabResultSchema.partial()

// GET /api/v1/lab-results - List lab results
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "testDate")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: any = {
      userId: request.user.id,
    }

    // Filter by category
    const category = searchParams.get("category")
    if (category) {
      where.category = category
    }

    // Filter by date range
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.testDate = {}
      if (startDate) where.testDate.gte = new Date(startDate)
      if (endDate) where.testDate.lte = new Date(endDate)
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
        testDate: new Date(data.testDate),
        category: data.category,
        orderedBy: data.orderedBy,
        facility: data.facility,
        results: data.results,
        notes: data.notes,
        attachments: data.attachments || [],
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "LabResult",
      labResult.id,
      { testName: data.testName, testDate: data.testDate },
      request
    )

    return successResponse(labResult, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
