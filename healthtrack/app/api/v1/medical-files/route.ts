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
  fileName: z.string().min(1),
  fileType: z.string(),
  category: z.string().min(1), // Required field
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  uploadDate: z.string().datetime().optional(),
  date: z.string().datetime().optional(),
  provider: z.string().optional(),
  tags: z.array(z.string()).optional(),
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
    const fileType = searchParams.get("fileType")
    if (fileType) {
      where.fileType = fileType
    }

    // Filter by category
    const category = searchParams.get("category")
    if (category) {
      where.category = category
    }

    // Search by fileName or description
    const search = searchParams.get("search")
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
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
        fileName: data.fileName,
        fileType: data.fileType,
        category: data.category,
        description: data.description,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        uploadDate: data.uploadDate ? new Date(data.uploadDate) : new Date(),
        date: data.date ? new Date(data.date) : undefined,
        provider: data.provider,
        tags: data.tags || [],
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "MedicalFile",
      file.id,
      { fileName: data.fileName, fileType: data.fileType, fileSize: data.fileSize },
      request
    )

    return successResponse(file, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
