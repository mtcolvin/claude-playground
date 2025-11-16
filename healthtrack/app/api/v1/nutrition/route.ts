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

const createNutritionEntrySchema = z.object({
  date: z.string().datetime(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  foodName: z.string().min(1),
  servingSize: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
})

// GET /api/v1/nutrition - List nutrition entries
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const mealType = searchParams.get("mealType")
    if (mealType) {
      where.mealType = mealType
    }

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [entries, total] = await Promise.all([
      prisma.nutritionEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.nutritionEntry.count({ where }),
    ])

    return paginatedResponse(entries, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/nutrition - Create nutrition entry
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createNutritionEntrySchema.parse(body)

    const entry = await prisma.nutritionEntry.create({
      data: {
        userId: request.user.id,
        date: new Date(data.date),
        mealType: data.mealType,
        foodName: data.foodName,
        servingSize: data.servingSize,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        sugar: data.sugar,
        sodium: data.sodium,
        notes: data.notes,
        imageUrl: data.imageUrl,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "NutritionEntry", entry.id, { foodName: data.foodName }, request)
    return successResponse(entry, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
