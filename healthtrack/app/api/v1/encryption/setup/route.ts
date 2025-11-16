import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  logAuditTrail,
  ApiError,
} from "@/lib/api-middleware"
import { z } from "zod"

const setupEncryptionSchema = z.object({
  encryptedKey: z.string(),
  iv: z.string(),
  salt: z.string(),
})

// POST /api/v1/encryption/setup - Store encrypted encryption key for backup
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = setupEncryptionSchema.parse(body)

    // Store encrypted key in database for recovery
    await prisma.user.update({
      where: { id: request.user.id },
      data: {
        encryptionKeyBackup: {
          encryptedKey: data.encryptedKey,
          iv: data.iv,
          salt: data.salt,
        },
      },
    })

    await logAuditTrail(
      request.user.id,
      "SETUP_ENCRYPTION",
      "User",
      request.user.id,
      { timestamp: new Date() },
      request
    )

    return successResponse({
      message: "Encryption key backup stored successfully",
    })
  },
  { requireAuth: true }
)

// GET /api/v1/encryption/setup - Get encrypted key backup
export const GET = apiHandler(
  async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { encryptionKeyBackup: true },
    })

    if (!user?.encryptionKeyBackup) {
      throw new ApiError("No encryption key backup found", 404)
    }

    return successResponse(user.encryptionKeyBackup)
  },
  { requireAuth: true }
)
