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

const createWaterIntakeSchema = z.object({
  date: z.string().datetime(),
  amount: z.number().positive(),
  time: z.string(),
})

// GET /api/v1/water-intake - List water intake entries
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [entries, total] = await Promise.all([
      prisma.waterIntake.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.waterIntake.count({ where }),
    ])

    return paginatedResponse(entries, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/water-intake - Create water intake entry
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createWaterIntakeSchema.parse(body)

    const entry = await prisma.waterIntake.create({
      data: {
        userId: request.user.id,
        date: new Date(data.date),
        amount: data.amount,
        time: data.time,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "WaterIntake", entry.id, { amount: data.amount }, request)
    return successResponse(entry, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
