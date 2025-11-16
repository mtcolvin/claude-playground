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

const createExerciseSessionSchema = z.object({
  date: z.string().datetime(),
  type: z.string().min(1),
  duration: z.number().positive(),
  intensity: z.enum(["LOW", "MODERATE", "HIGH"]),
  caloriesBurned: z.number().optional(),
  distance: z.number().optional(),
  distanceUnit: z.string().optional(),
  heartRateAvg: z.number().optional(),
  heartRateMax: z.number().optional(),
  steps: z.number().optional(),
  notes: z.string().optional(),
  route: z.string().optional(),
})

// GET /api/v1/exercise - List exercise sessions
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const type = searchParams.get("type")
    if (type) {
      where.type = { contains: type, mode: "insensitive" }
    }

    const intensity = searchParams.get("intensity")
    if (intensity) {
      where.intensity = intensity
    }

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [sessions, total] = await Promise.all([
      prisma.exerciseSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.exerciseSession.count({ where }),
    ])

    return paginatedResponse(sessions, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/exercise - Create exercise session
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createExerciseSessionSchema.parse(body)

    const session = await prisma.exerciseSession.create({
      data: {
        userId: request.user.id,
        date: new Date(data.date),
        type: data.type,
        duration: data.duration,
        intensity: data.intensity,
        caloriesBurned: data.caloriesBurned,
        distance: data.distance,
        distanceUnit: data.distanceUnit,
        heartRateAvg: data.heartRateAvg,
        heartRateMax: data.heartRateMax,
        steps: data.steps,
        notes: data.notes,
        route: data.route,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "ExerciseSession", session.id, { type: data.type, duration: data.duration }, request)
    return successResponse(session, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
