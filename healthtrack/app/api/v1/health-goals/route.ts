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

const createHealthGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  unit: z.string().optional(),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime().optional(),
  status: z.enum(["active", "completed", "abandoned"]).default("active"),
  progress: z.number().min(0).max(100).default(0),
})

// GET /api/v1/health-goals - List health goals
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "targetDate")
    const searchParams = request.nextUrl.searchParams

    const where: Record<string, unknown> = { userId: request.user.id }

    const status = searchParams.get("status")
    if (status) {
      where.status = status
    }

    const category = searchParams.get("category")
    if (category) {
      where.category = category
    }

    const [goals, total] = await Promise.all([
      prisma.healthGoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.healthGoal.count({ where }),
    ])

    return paginatedResponse(goals, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/health-goals - Create health goal
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createHealthGoalSchema.parse(body)

    const goal = await prisma.healthGoal.create({
      data: {
        userId: request.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit,
        startDate: new Date(data.startDate),
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        status: data.status,
        progress: data.progress,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "HealthGoal", goal.id, { title: data.title }, request)
    return successResponse(goal, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
