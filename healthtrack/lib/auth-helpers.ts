import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { UserRole } from "@/lib/rbac"

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Register new user
export async function registerUser(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.parse(data)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  })

  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Hash password
  const passwordHash = await hashPassword(validated.password)

  // Create user with patient profile
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      passwordHash,
      name: validated.name,
      role: UserRole.PATIENT,
      profile: {
        create: {}, // Create empty profile
      },
    },
    include: {
      profile: true,
    },
  })

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_REGISTERED",
      resourceType: "USER",
      resourceId: user.id,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

// Update password
export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const validated = updatePasswordSchema.parse({ currentPassword, newPassword })

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.passwordHash) {
    throw new Error("User not found")
  }

  // Verify current password
  const isValid = await verifyPassword(validated.currentPassword, user.passwordHash)
  if (!isValid) {
    throw new Error("Current password is incorrect")
  }

  // Hash new password
  const newPasswordHash = await hashPassword(validated.newPassword)

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    },
  })

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId,
      action: "PASSWORD_CHANGED",
      resourceType: "USER",
      resourceId: userId,
    },
  })

  return { success: true }
}

// Generate password reset token
export async function generatePasswordResetToken(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Don't reveal if user exists for security
    throw new Error("If a user with this email exists, a reset link will be sent")
  }

  // Generate random token
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 3600000) // 1 hour

  // Store token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      resourceType: "USER",
      resourceId: user.id,
    },
  })

  return token
}

// Reset password with token
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error("Invalid or expired token")
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword)

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      updatedAt: new Date(),
    },
  })

  // Delete used token
  await prisma.verificationToken.delete({
    where: { token },
  })

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      resourceType: "USER",
      resourceId: user.id,
    },
  })

  return true
}

// Check if user has permission
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return false

  // Role-based permissions
  const rolePermissions: Record<UserRole, string[]> = {
    ADMIN: ["*"], // All permissions
    PROVIDER: [
      "read:patient:data",
      "write:patient:data",
      "read:own:data",
      "write:own:data",
      "manage:care_team",
    ],
    CAREGIVER: [
      "read:patient:data",
      "read:own:data",
      "write:own:data",
    ],
    PATIENT: [
      "read:own:data",
      "write:own:data",
      "manage:own:goals",
      "share:own:data",
    ],
  }

  const permissions = rolePermissions[user.role] || []
  return permissions.includes("*") || permissions.includes(permission)
}

// Get user with profile
export async function getUserWithProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      emergencyContacts: true,
      careTeam: true,
    },
  })
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string
    dateOfBirth?: Date
    gender?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      updatedAt: new Date(),
    },
  })

  const profile = await prisma.patientProfile.upsert({
    where: { userId },
    update: {
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      updatedAt: new Date(),
    },
    create: {
      userId,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
    },
  })

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId,
      action: "PROFILE_UPDATED",
      resourceType: "USER",
      resourceId: userId,
      details: { fields: Object.keys(data) },
    },
  })

  return { user, profile }
}

// Deactivate user account
export async function deactivateUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  })

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId,
      action: "USER_DEACTIVATED",
      resourceType: "USER",
      resourceId: userId,
    },
  })

  return { success: true }
}

// Delete user account and all data (GDPR right to be forgotten)
export async function deleteUserAccount(userId: string) {
  // This will cascade delete all related data due to Prisma schema settings
  await prisma.user.delete({
    where: { id: userId },
  })

  // Log audit trail (without userId since user is deleted)
  await prisma.auditLog.create({
    data: {
      action: "USER_DELETED",
      resourceType: "USER",
      resourceId: userId,
      details: { gdpr: true },
    },
  })

  return { success: true }
}
