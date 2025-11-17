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

interface FileData {
  fileName: string;
  fileType: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  uploadDate?: Date | string;
  date?: string;
  provider?: string;
  tags?: string[];
}

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

// GET /api/v1/medical-files - List medical files
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "uploadDate")
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const where: Record<string, unknown> = {
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
    console.log("=== MEDICAL FILE UPLOAD REQUEST ===")
    console.log("User ID:", request.user?.id)
    console.log("User Email:", request.user?.email)
    console.log("User Role:", request.user?.role)

    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)

    let fileData: FileData

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      console.log("Processing as multipart/form-data")

      try {
        const formData = await request.formData()
        console.log("FormData received, entries:", Array.from(formData.keys()))

        const file = formData.get("file") as File
        const category = formData.get("category") as string
        const description = formData.get("description") as string | null

        console.log("File:", file ? `${file.name} (${file.size} bytes, ${file.type})` : "null")
        console.log("Category:", category)
        console.log("Description:", description)

        if (!file) {
          console.error("No file provided in FormData")
          throw new ApiError("No file provided", 400)
        }

        // In a production environment, you would:
        // 1. Upload the file to a storage service (S3, Azure Blob, etc.)
        // 2. Encrypt the file
        // 3. Get back the storage URL
        // For now, we'll create a placeholder URL
        const mockFileUrl = `/uploads/${request.user.id}/${Date.now()}_${file.name}`
        console.log("Generated mock URL:", mockFileUrl)

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

        console.log("File data prepared:", fileData)
      } catch (error) {
        console.error("Error processing FormData:", error)
        throw error
      }
    } else {
      // Handle JSON request (existing behavior)
      console.log("Processing as JSON")
      const body = await request.json()
      fileData = createMedicalFileSchema.parse(body)
      console.log("JSON data parsed:", fileData)
    }

    console.log("Creating database record...")
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
    console.log("Database record created successfully:", medicalFile.id)

    // Log audit trail
    await logAuditTrail(
      request.user.id,
      "CREATE",
      "MedicalFile",
      medicalFile.id,
      { fileName: fileData.fileName, fileType: fileData.fileType, fileSize: fileData.fileSize },
      request
    )
    console.log("Audit trail logged")

    console.log("=== UPLOAD SUCCESSFUL ===")
    return successResponse(medicalFile, 201)
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
