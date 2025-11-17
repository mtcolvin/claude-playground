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

// POST /api/v1/medical-files - Create medical file record (handles both JSON and FormData)
export const POST = apiHandler(
  async (request) => {
    const contentType = request.headers.get("content-type") || ""

    let fileData: any

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File
      const category = formData.get("category") as string
      const description = formData.get("description") as string | null

      if (!file) {
        throw new ApiError(400, "No file provided")
      }

      // In a production environment, you would:
      // 1. Upload the file to a storage service (S3, Azure Blob, etc.)
      // 2. Encrypt the file
      // 3. Get back the storage URL
      // For now, we'll create a placeholder URL
      const mockFileUrl = `/uploads/${request.user.id}/${Date.now()}_${file.name}`

      fileData = {
        fileName: file.name,
        fileType: file.type,
        category: category || 'other',
        description: description || undefined,
        fileUrl: mockFileUrl,
        fileSize: file.size,
        uploadDate: new Date(),
        tags: [],
      }
    } else {
      // Handle JSON request (existing behavior)
      const body = await request.json()
      fileData = createMedicalFileSchema.parse(body)
    }

    const medicalFile = await prisma.medicalFile.create({
      data: {
        userId: request.user.id,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        category: fileData.category,
        description: fileData.description,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        uploadDate: fileData.uploadDate ? new Date(fileData.uploadDate) : new Date(),
        date: fileData.date ? new Date(fileData.date) : undefined,
        provider: fileData.provider,
        tags: fileData.tags || [],
      },
    })

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "MedicalFile",
      medicalFile.id,
      { fileName: fileData.fileName, fileType: fileData.fileType, fileSize: fileData.fileSize },
      request
    )

    return successResponse(medicalFile, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
