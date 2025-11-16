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

// Validation schemas
const createMedicalFileSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["DICOM", "PDF", "IMAGE", "LAB_REPORT", "PRESCRIPTION", "SCAN", "OTHER"]),
  category: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url(),
  size: z.number().positive(),
  mimeType: z.string(),
  uploadDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  encryptionKey: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const updateMedicalFileSchema = createMedicalFileSchema.partial()

// GET /api/v1/medical-files - List medical files
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "uploadDate")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: any = {
      userId: request.user.id,
    }

    // Filter by type
    const type = searchParams.get("type")
    if (type) {
      where.type = type
    }

    // Filter by category
    const category = searchParams.get("category")
    if (category) {
      where.category = category
    }

    // Search by name or description
    const search = searchParams.get("search")
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by tags
    const tags = searchParams.get("tags")
    if (tags) {
      where.tags = {
        hasSome: tags.split(","),
      }
    }

    // Execute query
    const [files, total] = await Promise.all([
      prisma.medicalFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.medicalFile.count({ where }),
    ])

    return paginatedResponse(files, page, limit, total)
  },
  { requireAuth: true }
)

// POST /api/v1/medical-files - Create medical file record
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = createMedicalFileSchema.parse(body)

    const file = await prisma.medicalFile.create({
      data: {
        userId: request.user.id,
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        url: data.url,
        size: data.size,
        mimeType: data.mimeType,
        uploadDate: data.uploadDate ? new Date(data.uploadDate) : new Date(),
        tags: data.tags || [],
        encryptionKey: data.encryptionKey,
        metadata: data.metadata,
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "MedicalFile",
      file.id,
      { name: data.name, type: data.type, size: data.size },
      request
    )

    return successResponse(file, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
