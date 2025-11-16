import { NextRequest } from "next/server"
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

const createConditionSchema = z.object({
  name: z.string().min(1),
  diagnosedDate: z.string().datetime(),
  status: z.enum(["ACTIVE", "RESOLVED", "CHRONIC", "MANAGED"]).default("ACTIVE"),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]).optional(),
  diagnosedBy: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  icdCode: z.string().optional(),
})

// GET /api/v1/conditions - List conditions
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "diagnosedDate")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const status = searchParams.get("status")
    if (status) {
      where.status = status
    }

    const search = searchParams.get("search")
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }

    const [conditions, total] = await Promise.all([
      prisma.condition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.condition.count({ where }),
    ])

    return paginatedResponse(conditions, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/conditions - Create condition
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createConditionSchema.parse(body)

    const condition = await prisma.condition.create({
      data: {
        userId: request.user.id,
        name: data.name,
        diagnosedDate: new Date(data.diagnosedDate),
        status: data.status,
        severity: data.severity,
        diagnosedBy: data.diagnosedBy,
        treatment: data.treatment,
        notes: data.notes,
        icdCode: data.icdCode,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "Condition", condition.id, { name: data.name }, request)
    return successResponse(condition, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
