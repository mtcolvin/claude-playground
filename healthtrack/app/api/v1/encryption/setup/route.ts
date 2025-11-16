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

    // Note: Encryption key backup storage disabled - field not in User schema
    // This would require adding encryptionKeyBackup field to User model in Prisma schema

    await logAuditTrail(
      request.user.id,
      "SETUP_ENCRYPTION",
      "User",
      request.user.id,
      { timestamp: new Date() },
      request
    )

    return successResponse({
      message: "Encryption setup acknowledged (backup storage not available)",
    })
  },
  { requireAuth: true }
)

// GET /api/v1/encryption/setup - Get encrypted key backup
export const GET = apiHandler(
  async (request) => {
    // Note: Encryption key backup retrieval disabled - field not in User schema
    throw new ApiError("Encryption key backup not available - feature requires schema update", 404)
  },
  { requireAuth: true }
)
