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

const createAllergySchema = z.object({
  allergen: z.string().min(1),
  type: z.enum(["FOOD", "MEDICATION", "ENVIRONMENTAL", "OTHER"]),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
  reaction: z.union([z.string().min(1), z.array(z.string().min(1))]),
  diagnosedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET /api/v1/allergies - List allergies
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "severity")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const isActive = searchParams.get("isActive")
    if (isActive !== null) {
      where.isActive = isActive === "true"
    }

    const type = searchParams.get("type")
    if (type) {
      where.type = type
    }

    const [allergies, total] = await Promise.all([
      prisma.allergy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.allergy.count({ where }),
    ])

    return paginatedResponse(allergies, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/allergies - Create allergy
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createAllergySchema.parse(body)

    const allergy = await prisma.allergy.create({
      data: {
        userId: request.user.id,
        allergen: data.allergen,
        type: data.type,
        severity: data.severity,
        reaction: Array.isArray(data.reaction) ? data.reaction : [data.reaction],
        diagnosedDate: data.diagnosedDate ? new Date(data.diagnosedDate) : undefined,
        notes: data.notes,
        isActive: data.isActive,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "Allergy", allergy.id, { allergen: data.allergen, severity: data.severity }, request)
    return successResponse(allergy, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
