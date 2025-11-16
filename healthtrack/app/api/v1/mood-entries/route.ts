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

const createMoodEntrySchema = z.object({
  date: z.string().datetime(),
  mood: z.enum(["VERY_BAD", "BAD", "NEUTRAL", "GOOD", "VERY_GOOD"]),
  anxietyLevel: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  activities: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
})

// GET /api/v1/mood-entries - List mood entries
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
      prisma.moodEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.moodEntry.count({ where }),
    ])

    return paginatedResponse(entries, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/mood-entries - Create mood entry
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createMoodEntrySchema.parse(body)

    const entry = await prisma.moodEntry.create({
      data: {
        userId: request.user.id,
        date: new Date(data.date),
        mood: data.mood,
        anxietyLevel: data.anxietyLevel,
        stressLevel: data.stressLevel,
        energyLevel: data.energyLevel,
        sleepQuality: data.sleepQuality,
        notes: data.notes,
        activities: data.activities || [],
        triggers: data.triggers || [],
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "MoodEntry", entry.id, { mood: data.mood, date: data.date }, request)
    return successResponse(entry, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
