import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  logAuditTrail,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

const createCareTeamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  specialty: z.string().optional(),
  organization: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
})

// GET /api/v1/care-team - List care team members
export const GET = apiHandler(
  async (request) => {
    const careTeam = await prisma.careTeamMember.findMany({
      where: { userId: request.user.id },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    })

    return successResponse(careTeam)
  },
  { requireAuth: true }
)

// POST /api/v1/care-team - Create care team member
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createCareTeamMemberSchema.parse(body)

    const member = await prisma.careTeamMember.create({
      data: {
        userId: request.user.id,
        name: data.name,
        role: data.role,
        specialty: data.specialty,
        organization: data.organization,
        phone: data.phone,
        email: data.email,
        address: data.address,
        isPrimary: data.isPrimary,
        notes: data.notes,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "CareTeamMember", member.id, { name: data.name, role: data.role }, request)
    return successResponse(member, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
