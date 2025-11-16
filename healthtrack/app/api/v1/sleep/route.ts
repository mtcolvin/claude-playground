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
  bedTime: z.string().datetime(),
  wakeTime: z.string().datetime(),
  duration: z.number().positive(),
  quality: z.number().min(1).max(10),
  deepSleep: z.number().optional(),
  lightSleep: z.number().optional(),
  remSleep: z.number().optional(),
  awakeTime: z.number().optional(),
  interruptions: z.number().optional(),
  notes: z.string().optional(),
  environment: z.object({
    temperature: z.number().optional(),
    noise: z.string().optional(),
    light: z.string().optional(),
  }).optional(),
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

    const minQuality = searchParams.get("minQuality")
    if (minQuality) {
      where.quality = { gte: parseInt(minQuality) }
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
        bedTime: new Date(data.bedTime),
        wakeTime: new Date(data.wakeTime),
        duration: data.duration,
        quality: data.quality,
        deepSleep: data.deepSleep,
        lightSleep: data.lightSleep,
        remSleep: data.remSleep,
        awakeTime: data.awakeTime,
        interruptions: data.interruptions,
        notes: data.notes,
        environment: data.environment,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "SleepSession", session.id, { duration: data.duration, quality: data.quality }, request)
    return successResponse(session, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
