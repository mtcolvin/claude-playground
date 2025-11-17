import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { Permission, roleHasPermission, canAccessResource, UserRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string | null
    role: UserRole
  }
}

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API error responses
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function errorResponse(error: Error | ApiError, statusCode?: number): NextResponse {
  const status = error instanceof ApiError ? error.statusCode : (statusCode || 500)
  const details = error instanceof ApiError ? error.details : undefined

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      details,
    },
    { status }
  )
}

export function successResponse<T>(data: T, statusCode: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  )
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// Middleware: Require authentication
export async function requireAuth(request: NextRequest): Promise<AuthenticatedRequest["user"]> {
  const session = await getSession()

  if (!session?.user || !session.user.email) {
    throw new ApiError("Authentication required", 401)
  }

  return session.user as AuthenticatedRequest["user"]
}

// Middleware: Require specific permission
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<AuthenticatedRequest["user"]> {
  const user = await requireAuth(request)

  if (!roleHasPermission(user.role, permission)) {
    throw new ApiError(`Permission denied: ${permission} required`, 403)
  }

  return user
}

// Middleware: Require any of the specified permissions
export async function requireAnyPermission(
  request: NextRequest,
  permissions: Permission[]
): Promise<AuthenticatedRequest["user"]> {
  const user = await requireAuth(request)

  const hasAnyPermission = permissions.some(permission =>
    roleHasPermission(user.role, permission)
  )

  if (!hasAnyPermission) {
    throw new ApiError(
      `Permission denied: One of ${permissions.join(", ")} required`,
      403
    )
  }

  return user
}

// Middleware: Require resource ownership or permission
export async function requireResourceAccess(
  request: NextRequest,
  resourceUserId: string,
  permission: Permission
): Promise<AuthenticatedRequest["user"]> {
  const user = await requireAuth(request)

  const canAccess = canAccessResource(
    {
      resourceUserId,
      currentUserId: user.id,
      currentUserRole: user.role,
    },
    permission
  )

  if (!canAccess) {
    throw new ApiError(
      "Access denied: You do not have permission to access this resource",
      403
    )
  }

  return user
}

// Pagination helper
export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

// Sorting helper
export interface SortParams {
  sortBy: string
  sortOrder: "asc" | "desc"
}

export function getSortParams(request: NextRequest, defaultSortBy: string = "createdAt"): SortParams {
  const searchParams = request.nextUrl.searchParams
  const sortBy = searchParams.get("sortBy") || defaultSortBy
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

  return { sortBy, sortOrder }
}

// Filter helper
export function getFilterParams(request: NextRequest, allowedFilters: string[]): Record<string, any> {
  const searchParams = request.nextUrl.searchParams
  const filters: Record<string, any> = {}

  allowedFilters.forEach(filter => {
    const value = searchParams.get(filter)
    if (value !== null) {
      filters[filter] = value
    }
  })

  return filters
}

// Audit logging helper
export async function logAuditTrail(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: any,
  request?: NextRequest
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || undefined,
      userAgent: request?.headers.get("user-agent") || undefined,
      details,
    },
  })
}

// Rate limiting helper (basic in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export function requireRateLimit(
  request: NextRequest,
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): void {
  const allowed = checkRateLimit(identifier, limit, windowMs)

  if (!allowed) {
    throw new ApiError("Rate limit exceeded. Please try again later.", 429)
  }
}

// Request validation helper
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: { parse: (data: any) => T }
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError("Validation failed", 400, error.message)
    }
    throw new ApiError("Invalid request body", 400)
  }
}

// Wrapper for API routes with error handling
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error("API Error:", error)

      if (error instanceof ApiError) {
        return errorResponse(error)
      }

      if (error instanceof Error) {
        return errorResponse(error, 500)
      }

      return errorResponse(new Error("Internal server error"), 500)
    }
  }
}

// Combined middleware wrapper
export interface ApiHandlerOptions {
  requireAuth?: boolean
  requirePermission?: Permission
  requireAnyPermission?: Permission[]
  rateLimit?: { limit: number; windowMs: number }
}

export function apiHandler(
  handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    let user: AuthenticatedRequest["user"] | undefined

    // Check rate limit
    if (options.rateLimit) {
      const identifier = request.headers.get("x-forwarded-for") || "anonymous"
      requireRateLimit(request, identifier, options.rateLimit.limit, options.rateLimit.windowMs)
    }

    // Check authentication
    if (options.requireAuth || options.requirePermission || options.requireAnyPermission) {
      user = await requireAuth(request)
    }

    // Check permission
    if (options.requirePermission && user) {
      await requirePermission(request, options.requirePermission)
    }

    // Check any permission
    if (options.requireAnyPermission && user) {
      await requireAnyPermission(request, options.requireAnyPermission)
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    if (user) {
      authenticatedRequest.user = user
    }

    return handler(authenticatedRequest, context)
  })
}
