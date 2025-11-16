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

const createMenstrualCycleSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  cycleLength: z.number().positive().optional(),
  periodLength: z.number().positive().optional(),
  flow: z.enum(["LIGHT", "MEDIUM", "HEAVY"]).optional(),
  symptoms: z.array(z.string()).optional(),
  mood: z.string().optional(),
  notes: z.string().optional(),
  ovulationDate: z.string().datetime().optional(),
})

// GET /api/v1/menstrual-cycles - List menstrual cycles
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "startDate")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) where.startDate.gte = new Date(startDate)
      if (endDate) where.startDate.lte = new Date(endDate)
    }

    const [cycles, total] = await Promise.all([
      prisma.menstrualCycle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.menstrualCycle.count({ where }),
    ])

    return paginatedResponse(cycles, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/menstrual-cycles - Create menstrual cycle
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createMenstrualCycleSchema.parse(body)

    const cycle = await prisma.menstrualCycle.create({
      data: {
        userId: request.user.id,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        cycleLength: data.cycleLength,
        periodLength: data.periodLength,
        flow: data.flow,
        symptoms: data.symptoms || [],
        mood: data.mood,
        notes: data.notes,
        ovulationDate: data.ovulationDate ? new Date(data.ovulationDate) : undefined,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "MenstrualCycle", cycle.id, { startDate: data.startDate }, request)
    return successResponse(cycle, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
