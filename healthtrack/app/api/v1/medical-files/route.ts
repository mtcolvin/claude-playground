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
import { parseHealthData } from "@/lib/health-data-parser"

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

// POST /api/v1/medical-files - Upload and parse medical file
export const POST = apiHandler(
  async (request) => {
    try {
      // Parse FormData from request
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const category = formData.get('category') as string | null

      if (!file) {
        throw new ApiError('No file provided', 400)
      }

      if (!category) {
        throw new ApiError('Category is required', 400)
      }

      // Validate file size (50MB limit)
      const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
      if (file.size > MAX_FILE_SIZE) {
        throw new ApiError('File size exceeds 50MB limit', 400)
      }

      // Get file buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'uploads', 'medical-files', request.user.id)
      await mkdir(uploadsDir, { recursive: true })

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const uniqueFileName = `${timestamp}-${sanitizedFileName}`
      const filePath = join(uploadsDir, uniqueFileName)

      // Save file to disk
      await writeFile(filePath, buffer)

      // Parse health data from file
      let extractedMetrics: any[] = []
      let parseErrors: string[] = []

      try {
        const parseResult = await parseHealthData(buffer, file.name, file.type)

        // Save extracted metrics to database
        for (const metric of parseResult.metrics) {
          try {
            const savedMetric = await prisma.healthMetric.create({
              data: {
                userId: request.user.id,
                type: metric.type,
                value: metric.value,
                unit: metric.unit,
                date: metric.date || new Date(),
                notes: metric.notes,
                source: `Uploaded file: ${file.name}`,
              },
            })
            extractedMetrics.push(savedMetric)
          } catch (metricError) {
            console.error('Error saving metric:', metricError)
            parseErrors.push(`Failed to save ${metric.type}: ${metricError instanceof Error ? metricError.message : 'Unknown error'}`)
          }
        }

        parseErrors.push(...parseResult.errors)
      } catch (parseError) {
        console.error('Error parsing health data:', parseError)
        parseErrors.push(`Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      // Create medical file record
      const medicalFile = await prisma.medicalFile.create({
        data: {
          userId: request.user.id,
          fileName: file.name,
          fileType: file.type,
          category: category,
          description: extractedMetrics.length > 0
            ? `Extracted ${extractedMetrics.length} health metric(s)`
            : 'No health metrics extracted',
          fileUrl: `/uploads/medical-files/${request.user.id}/${uniqueFileName}`,
          fileSize: file.size,
          uploadDate: new Date(),
          tags: [],
        },
      })

      // Log audit trail
      await logAuditTrail(
        request.user.id,
        "CREATE",
        "MedicalFile",
        medicalFile.id,
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          extractedMetricsCount: extractedMetrics.length,
        },
        request
      )

      return successResponse({
        file: medicalFile,
        extractedMetrics: extractedMetrics.length,
        metrics: extractedMetrics,
        parseErrors: parseErrors.length > 0 ? parseErrors : undefined,
      }, 201)
    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error
      }

      // Handle other errors
      console.error('Upload error:', error)
      throw new ApiError(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      )
    }
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
