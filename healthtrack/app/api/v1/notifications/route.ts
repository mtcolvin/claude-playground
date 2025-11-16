import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getSortParams,
} from "@/lib/api-middleware"
import { NotificationType } from "@prisma/client"

// GET /api/v1/notifications - List notifications
export const GET = apiHandler(
  async (request) => {
    const { page, limit, skip } = getPaginationParams(request)
    const { sortBy, sortOrder } = getSortParams(request, "createdAt")
    const searchParams = request.nextUrl.searchParams

    const where: any = { userId: request.user.id }

    const isRead = searchParams.get("isRead")
    if (isRead !== null) {
      where.isRead = isRead === "true"
    }

    const type = searchParams.get("type")
    if (type) {
      where.type = type as NotificationType
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.notification.count({ where }),
    ])

    return paginatedResponse(notifications, page, limit, total)
  },
  { requireAuth: true }
)

// PUT /api/v1/notifications/mark-read - Mark notifications as read
export const PUT = apiHandler(
  async (request) => {
    const body = await request.json()
    const { notificationIds } = body

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: request.user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return successResponse({ message: "Notifications marked as read" })
  },
  { requireAuth: true }
)
