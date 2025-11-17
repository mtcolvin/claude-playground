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
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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

// POST /api/v1/medical-files - Upload and create medical file record
export const POST = apiHandler(
  async (request) => {
    try {
      // Parse FormData
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const category = formData.get('category') as string || 'other'
      const description = formData.get('description') as string | undefined
      const provider = formData.get('provider') as string | undefined
      const date = formData.get('date') as string | undefined
      const tags = formData.get('tags') as string | undefined

      if (!file) {
        throw new ApiError('No file provided', 400)
      }

      // Validate file
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        throw new ApiError('File size exceeds 50MB limit', 400)
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'medical-files')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const uniqueFileName = `${timestamp}-${originalName}`
      const filePath = join(uploadsDir, uniqueFileName)

      // Save file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Generate public URL
      const fileUrl = `/uploads/medical-files/${uniqueFileName}`

      // Determine file type
      const fileType = file.type || 'application/octet-stream'

      // Create database record
      const medicalFile = await prisma.medicalFile.create({
        data: {
          userId: request.user.id,
          fileName: file.name,
          fileType: fileType,
          category: category,
          description: description,
          fileUrl: fileUrl,
          fileSize: file.size,
          uploadDate: new Date(),
          date: date ? new Date(date) : undefined,
          provider: provider,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          encrypted: false,
        },
      })

      // Log audit trail
      await logAuditTrail(
        request.user.id,
        "CREATE",
        "MedicalFile",
        medicalFile.id,
        { fileName: file.name, fileType: fileType, fileSize: file.size },
        request
      )

      return successResponse(medicalFile, 201)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      console.error('File upload error:', error)
      throw new ApiError('Failed to upload file', 500)
    }
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
