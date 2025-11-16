import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  logAuditTrail,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"
import { z } from "zod"

const createEmergencyContactSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
})

// GET /api/v1/emergency-contacts - List emergency contacts
export const GET = apiHandler(
  async (request) => {
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: request.user.id },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    })

    return successResponse(contacts)
  },
  { requireAuth: true }
)

// POST /api/v1/emergency-contacts - Create emergency contact
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createEmergencyContactSchema.parse(body)

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: request.user.id,
        name: data.name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email,
        address: data.address,
        isPrimary: data.isPrimary,
        notes: data.notes,
      },
    })

    await logAuditTrail(request.user.id, "CREATE", "EmergencyContact", contact.id, { name: data.name }, request)
    return successResponse(contact, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
