import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getSortParams,
  logAuditTrail,
  ApiError,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

// Define AppointmentStatus enum locally
const AppointmentStatus = z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
type AppointmentStatusType = z.infer<typeof AppointmentStatus>

// Validation schemas
const createAppointmentSchema = z.object({
  title: z.string().min(1),
  date: z.string().datetime(),
  duration: z.number().positive(),
  provider: z.string().min(1),
  specialty: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["IN_PERSON", "TELEMEDICINE", "PHONE"]).default("IN_PERSON"),
  status: AppointmentStatus.default("SCHEDULED"),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

const updateAppointmentSchema = createAppointmentSchema.partial()

// GET /api/v1/appointments - List appointments
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "date")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: any = {
      userId: request.user.id,
    }

    // Filter by status
    const status = searchParams.get("status")
    if (status) {
      where.status = status as AppointmentStatusType
    }

    // Filter by type
    const type = searchParams.get("type")
    if (type) {
      where.type = type
    }

    // Filter by date range
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Search by provider or title
    const search = searchParams.get("search")
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { provider: { contains: search, mode: "insensitive" } },
      ]
    }

    // Execute query
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.appointment.count({ where }),
    ])

    return paginatedResponse(appointments, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/appointments - Create appointment
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createAppointmentSchema.parse(body)

    const appointment = await prisma.appointment.create({
      data: {
        userId: request.user.id,
        title: data.title,
        date: new Date(data.date),
        duration: data.duration,
        provider: data.provider,
        specialty: data.specialty,
        location: data.location,
        type: data.type,
        status: data.status,
        reason: data.reason,
        notes: data.notes,
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "Appointment",
      appointment.id,
      { title: data.title, date: data.date },
      request
    )

    return successResponse(appointment, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
