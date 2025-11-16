import { auth } from "@/lib/auth"
import { cache } from "react"

// Cache the session for the request lifecycle
export const getSession = cache(async () => {
  const session = await auth()
  return session
})

// Get current user or throw error
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return session.user
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

// Check if user has specific role
export async function hasRole(role: string | string[]) {
  const session = await getSession()

  if (!session?.user) {
    return false
  }

  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(session.user.role)
}

// Require authentication or throw
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Authentication required")
  }

  return session.user
}

// Require specific role or throw
export async function requireRole(role: string | string[]) {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]

  if (!roles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }

  return user
}
