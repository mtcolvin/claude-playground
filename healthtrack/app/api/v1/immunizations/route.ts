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
  vaccineName: z.string().min(1),
  cvxCode: z.string().optional(),
  date: z.string().datetime(),
  provider: z.string().optional(),
  site: z.string().optional(),
  route: z.string().optional(),
  lotNumber: z.string().optional(),
  doseNumber: z.number().int().optional(),
  seriesStatus: z.string().optional(),
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
        vaccineName: data.vaccineName,
        cvxCode: data.cvxCode,
        date: new Date(data.date),
        provider: data.provider,
        site: data.site,
        route: data.route,
        lotNumber: data.lotNumber,
        doseNumber: data.doseNumber,
        seriesStatus: data.seriesStatus,
        notes: data.notes,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "Immunization", immunization.id, { vaccineName: data.vaccineName }, request)
    return successResponse(immunization, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
