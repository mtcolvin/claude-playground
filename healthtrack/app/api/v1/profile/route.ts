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
  heightUnit: z.string().optional(),
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
  bloodType: z.string().optional(),
  primaryLanguage: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }).optional(),
  medicalHistory: z.string().optional(),
  preferences: z.record(z.any()).optional(),
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
        ...(data.heightUnit !== undefined && { heightUnit: data.heightUnit }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.weightUnit !== undefined && { weightUnit: data.weightUnit }),
        ...(data.bloodType !== undefined && { bloodType: data.bloodType }),
        ...(data.primaryLanguage !== undefined && { primaryLanguage: data.primaryLanguage }),
        ...(data.medicalHistory !== undefined && { medicalHistory: data.medicalHistory }),
        ...(data.preferences !== undefined && { preferences: data.preferences }),
      },
    })

    await logAuditTrail(request.user.id, "UPDATE", "PatientProfile", profile.id, data, request)
    return successResponse(profile)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
