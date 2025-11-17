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

// Validation schemas
const createMedicationSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().optional(),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  route: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  prescribedBy: z.string().optional(),
  pharmacy: z.string().optional(),
  purpose: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  refillsRemaining: z.number().int().optional(),
  rxNumber: z.string().optional(),
  ndc: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET /api/v1/medications - List medications
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "startDate")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: Record<string, unknown> = {
      userId: request.user.id,
    }

    // Filter by active status
    const isActive = searchParams.get("isActive")
    if (isActive !== null) {
      where.isActive = isActive === "true"
    }

    // Search by name
    const search = searchParams.get("search")
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
      ]
    }

    // Execute query
    const [medications, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          adherence: {
            orderBy: { scheduledTime: "desc" },
            take: 10,
          },
        },
      }),
      prisma.medication.count({ where }),
    ])

    return paginatedResponse(medications, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/medications - Create medication
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createMedicationSchema.parse(body)

    const medication = await prisma.medication.create({
      data: {
        userId: request.user.id,
        name: data.name,
        genericName: data.genericName,
        dosage: data.dosage,
        frequency: data.frequency,
        route: data.route,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        prescribedBy: data.prescribedBy,
        pharmacy: data.pharmacy,
        purpose: data.purpose,
        sideEffects: data.sideEffects || [],
        instructions: data.instructions,
        refillsRemaining: data.refillsRemaining,
        rxNumber: data.rxNumber,
        ndc: data.ndc,
        isActive: data.isActive,
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "Medication",
      medication.id,
      { name: data.name, dosage: data.dosage },
      request
    )

    return successResponse(medication, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
