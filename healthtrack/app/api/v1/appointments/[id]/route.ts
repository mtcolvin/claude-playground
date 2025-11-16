import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  logAuditTrail,
  ApiError,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

// Define AppointmentStatus enum locally
const AppointmentStatus = z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])

const updateAppointmentSchema = z.object({
  title: z.string().min(1).optional(),
  dateTime: z.string().datetime().optional(),
  duration: z.number().positive().optional(),
  provider: z.string().min(1).optional(),
  specialty: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["IN_PERSON", "TELEMEDICINE", "PHONE"]).optional(),
  status: AppointmentStatus.optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  reminderMinutes: z.array(z.number()).optional(),
})

// GET /api/v1/appointments/:id - Get specific appointment
export const GET = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      throw new ApiError("Appointment not found", 404)
    }

    if (appointment.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    return successResponse(appointment)
  },
  { requireAuth: true }
)

// PUT /api/v1/appointments/:id - Update appointment
export const PUT = apiHandler(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()
    const data = updateAppointmentSchema.parse(body)

    // Check ownership
    const existing = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Appointment not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.dateTime && { dateTime: new Date(data.dateTime) }),
        ...(data.duration && { duration: data.duration }),
        ...(data.provider && { provider: data.provider }),
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.reason !== undefined && { reason: data.reason }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.reminderMinutes && { reminderMinutes: data.reminderMinutes }),
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "UPDATE",
      "Appointment",
      appointment.id,
      data,
      request
    )

    return successResponse(appointment)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)

// DELETE /api/v1/appointments/:id - Delete appointment
export const DELETE = apiHandler(
  async (request, { params }) => {
    const { id } = await params

    // Check ownership
    const existing = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new ApiError("Appointment not found", 404)
    }

    if (existing.userId !== request.user.id) {
      throw new ApiError("Access denied", 403)
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "DELETE",
      "Appointment",
      id,
      { title: existing.title },
      request
    )

    return successResponse({ message: "Appointment deleted successfully" })
  },
  { requirePermission: Permission.DELETE_OWN_DATA }
)
