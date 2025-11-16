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

const createImmunizationSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  provider: z.string().optional(),
  location: z.string().optional(),
  lotNumber: z.string().optional(),
  expirationDate: z.string().datetime().optional(),
  nextDueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
})

// GET /api/v1/immunizations - List immunizations
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")

    const where = { userId: request.user.id }

    const [immunizations, total] = await Promise.all([
      prisma.immunization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.immunization.count({ where }),
    ])

    return paginatedResponse(immunizations, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/immunizations - Create immunization
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createImmunizationSchema.parse(body)

    const immunization = await prisma.immunization.create({
      data: {
        userId: request.user.id,
        name: data.name,
        date: new Date(data.date),
        provider: data.provider,
        location: data.location,
        lotNumber: data.lotNumber,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
        notes: data.notes,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "Immunization", immunization.id, { name: data.name }, request)
    return successResponse(immunization, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
