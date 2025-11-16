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

const createSleepSessionSchema = z.object({
  date: z.string().datetime(),
  bedtime: z.string().datetime(),
  wakeTime: z.string().datetime(),
  totalMinutes: z.number().positive(),
  quality: z.string().optional(),
  deepSleep: z.number().optional(),
  lightSleep: z.number().optional(),
  remSleep: z.number().optional(),
  awake: z.number().optional(),
  efficiency: z.number().optional(),
  notes: z.string().optional(),
})

// GET /api/v1/sleep - List sleep sessions
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

    const [sessions, total] = await Promise.all([
      prisma.sleepSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.sleepSession.count({ where }),
    ])

    return paginatedResponse(sessions, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/sleep - Create sleep session
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createSleepSessionSchema.parse(body)

    const session = await prisma.sleepSession.create({
      data: {
        userId: request.user.id,
        date: new Date(data.date),
        bedtime: new Date(data.bedtime),
        wakeTime: new Date(data.wakeTime),
        totalMinutes: data.totalMinutes,
        quality: data.quality,
        deepSleep: data.deepSleep,
        lightSleep: data.lightSleep,
        remSleep: data.remSleep,
        awake: data.awake,
        efficiency: data.efficiency,
        notes: data.notes,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "SleepSession", session.id, { totalMinutes: data.totalMinutes, quality: data.quality }, request)
    return successResponse(session, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
