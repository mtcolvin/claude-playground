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

const updateProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bloodType: z.string().optional(),
  ethnicity: z.string().optional(),
  language: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholUse: z.string().optional(),
  exerciseLevel: z.string().optional(),
  organDonor: z.boolean().optional(),
})

// GET /api/v1/profile - Get user profile
export const GET = apiHandler(
  async (request) => {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: request.user.id },
      include: {
        emergencyContacts: true,
        careTeam: true,
      },
    })

    if (!profile) {
      throw new ApiError("Profile not found", 404)
    }

    return successResponse(profile)
  },
  { requireAuth: true }
)

// PUT /api/v1/profile - Update user profile
export const PUT = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    const profile = await prisma.patientProfile.update({
      where: { userId: request.user.id },
      data: {
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.bloodType !== undefined && { bloodType: data.bloodType }),
        ...(data.ethnicity !== undefined && { ethnicity: data.ethnicity }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.maritalStatus !== undefined && { maritalStatus: data.maritalStatus }),
        ...(data.occupation !== undefined && { occupation: data.occupation }),
        ...(data.smokingStatus !== undefined && { smokingStatus: data.smokingStatus }),
        ...(data.alcoholUse !== undefined && { alcoholUse: data.alcoholUse }),
        ...(data.exerciseLevel !== undefined && { exerciseLevel: data.exerciseLevel }),
        ...(data.organDonor !== undefined && { organDonor: data.organDonor }),
      },
    })

    await logAuditTrail(request.user.id, "UPDATE", "PatientProfile", profile.id, data, request)
    return successResponse(profile)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
