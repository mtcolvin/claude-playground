// Define UserRole enum locally
export enum UserRole {
  PATIENT = "PATIENT",
  CAREGIVER = "CAREGIVER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

// Define all possible permissions in the system
export enum Permission {
  // User management
  READ_OWN_DATA = "read:own:data",
  WRITE_OWN_DATA = "write:own:data",
  DELETE_OWN_DATA = "delete:own:data",
  READ_USER_DATA = "read:user:data",
  WRITE_USER_DATA = "write:user:data",
  DELETE_USER = "delete:user",

  // Patient data
  READ_PATIENT_DATA = "read:patient:data",
  WRITE_PATIENT_DATA = "write:patient:data",
  DELETE_PATIENT_DATA = "delete:patient:data",

  // Health metrics
  READ_OWN_METRICS = "read:own:metrics",
  WRITE_OWN_METRICS = "write:own:metrics",
  READ_PATIENT_METRICS = "read:patient:metrics",
  WRITE_PATIENT_METRICS = "write:patient:metrics",

  // Medications
  READ_OWN_MEDICATIONS = "read:own:medications",
  WRITE_OWN_MEDICATIONS = "write:own:medications",
  READ_PATIENT_MEDICATIONS = "read:patient:medications",
  WRITE_PATIENT_MEDICATIONS = "write:patient:medications",
  PRESCRIBE_MEDICATIONS = "prescribe:medications",

  // Lab results
  READ_OWN_LABS = "read:own:labs",
  WRITE_OWN_LABS = "write:own:labs",
  READ_PATIENT_LABS = "read:patient:labs",
  WRITE_PATIENT_LABS = "write:patient:labs",

  // Medical files
  READ_OWN_FILES = "read:own:files",
  WRITE_OWN_FILES = "write:own:files",
  DELETE_OWN_FILES = "delete:own:files",
  READ_PATIENT_FILES = "read:patient:files",
  WRITE_PATIENT_FILES = "write:patient:files",
  DELETE_PATIENT_FILES = "delete:patient:files",

  // Appointments
  READ_OWN_APPOINTMENTS = "read:own:appointments",
  WRITE_OWN_APPOINTMENTS = "write:own:appointments",
  READ_PATIENT_APPOINTMENTS = "read:patient:appointments",
  WRITE_PATIENT_APPOINTMENTS = "write:patient:appointments",
  MANAGE_APPOINTMENTS = "manage:appointments",

  // Goals
  READ_OWN_GOALS = "read:own:goals",
  WRITE_OWN_GOALS = "write:own:goals",
  READ_PATIENT_GOALS = "read:patient:goals",
  WRITE_PATIENT_GOALS = "write:patient:goals",

  // Care team
  READ_OWN_CARE_TEAM = "read:own:care_team",
  WRITE_OWN_CARE_TEAM = "write:own:care_team",
  MANAGE_CARE_TEAM = "manage:care_team",

  // Sharing
  SHARE_OWN_DATA = "share:own:data",
  MANAGE_SHARING = "manage:sharing",

  // Reports
  GENERATE_OWN_REPORTS = "generate:own:reports",
  GENERATE_PATIENT_REPORTS = "generate:patient:reports",

  // Analytics
  VIEW_OWN_ANALYTICS = "view:own:analytics",
  VIEW_PATIENT_ANALYTICS = "view:patient:analytics",
  VIEW_POPULATION_ANALYTICS = "view:population:analytics",

  // System
  MANAGE_USERS = "manage:users",
  MANAGE_ROLES = "manage:roles",
  VIEW_AUDIT_LOGS = "view:audit_logs",
  MANAGE_SETTINGS = "manage:settings",
  ADMIN_ACCESS = "admin:access",
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PATIENT]: [
    // Own data - full access
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.DELETE_OWN_DATA,

    // Health metrics
    Permission.READ_OWN_METRICS,
    Permission.WRITE_OWN_METRICS,

    // Medications
    Permission.READ_OWN_MEDICATIONS,
    Permission.WRITE_OWN_MEDICATIONS,

    // Lab results
    Permission.READ_OWN_LABS,
    Permission.WRITE_OWN_LABS,

    // Medical files
    Permission.READ_OWN_FILES,
    Permission.WRITE_OWN_FILES,
    Permission.DELETE_OWN_FILES,

    // Appointments
    Permission.READ_OWN_APPOINTMENTS,
    Permission.WRITE_OWN_APPOINTMENTS,

    // Goals
    Permission.READ_OWN_GOALS,
    Permission.WRITE_OWN_GOALS,

    // Care team
    Permission.READ_OWN_CARE_TEAM,
    Permission.WRITE_OWN_CARE_TEAM,

    // Sharing
    Permission.SHARE_OWN_DATA,

    // Reports
    Permission.GENERATE_OWN_REPORTS,

    // Analytics
    Permission.VIEW_OWN_ANALYTICS,
  ],

  [UserRole.CAREGIVER]: [
    // Own data
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.DELETE_OWN_DATA,

    // Patient data - read only
    Permission.READ_PATIENT_DATA,
    Permission.READ_PATIENT_METRICS,
    Permission.READ_PATIENT_MEDICATIONS,
    Permission.READ_PATIENT_LABS,
    Permission.READ_PATIENT_FILES,
    Permission.READ_PATIENT_APPOINTMENTS,
    Permission.READ_PATIENT_GOALS,

    // Limited write access
    Permission.WRITE_PATIENT_METRICS, // Can log metrics for patient
    Permission.WRITE_PATIENT_APPOINTMENTS, // Can schedule appointments

    // Reports
    Permission.GENERATE_PATIENT_REPORTS,

    // Analytics
    Permission.VIEW_PATIENT_ANALYTICS,

    // Own metrics
    Permission.READ_OWN_METRICS,
    Permission.WRITE_OWN_METRICS,
    Permission.READ_OWN_MEDICATIONS,
    Permission.WRITE_OWN_MEDICATIONS,
    Permission.READ_OWN_LABS,
    Permission.READ_OWN_FILES,
    Permission.READ_OWN_APPOINTMENTS,
    Permission.WRITE_OWN_APPOINTMENTS,
    Permission.READ_OWN_GOALS,
    Permission.WRITE_OWN_GOALS,
    Permission.GENERATE_OWN_REPORTS,
    Permission.VIEW_OWN_ANALYTICS,
  ],

  [UserRole.PROVIDER]: [
    // Own data
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.DELETE_OWN_DATA,

    // Patient data - full access
    Permission.READ_PATIENT_DATA,
    Permission.WRITE_PATIENT_DATA,
    Permission.READ_PATIENT_METRICS,
    Permission.WRITE_PATIENT_METRICS,
    Permission.READ_PATIENT_MEDICATIONS,
    Permission.WRITE_PATIENT_MEDICATIONS,
    Permission.PRESCRIBE_MEDICATIONS,
    Permission.READ_PATIENT_LABS,
    Permission.WRITE_PATIENT_LABS,
    Permission.READ_PATIENT_FILES,
    Permission.WRITE_PATIENT_FILES,
    Permission.READ_PATIENT_APPOINTMENTS,
    Permission.WRITE_PATIENT_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.READ_PATIENT_GOALS,
    Permission.WRITE_PATIENT_GOALS,

    // Care team
    Permission.MANAGE_CARE_TEAM,

    // Reports and analytics
    Permission.GENERATE_PATIENT_REPORTS,
    Permission.VIEW_PATIENT_ANALYTICS,
    Permission.VIEW_POPULATION_ANALYTICS,

    // Own data
    Permission.READ_OWN_METRICS,
    Permission.WRITE_OWN_METRICS,
    Permission.READ_OWN_MEDICATIONS,
    Permission.WRITE_OWN_MEDICATIONS,
    Permission.READ_OWN_LABS,
    Permission.WRITE_OWN_LABS,
    Permission.READ_OWN_FILES,
    Permission.WRITE_OWN_FILES,
    Permission.DELETE_OWN_FILES,
    Permission.READ_OWN_APPOINTMENTS,
    Permission.WRITE_OWN_APPOINTMENTS,
    Permission.READ_OWN_GOALS,
    Permission.WRITE_OWN_GOALS,
    Permission.READ_OWN_CARE_TEAM,
    Permission.GENERATE_OWN_REPORTS,
    Permission.VIEW_OWN_ANALYTICS,
  ],

  [UserRole.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission),
  ],
}

// Check if a role has a specific permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

// Check if a role has any of the specified permissions
export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => roleHasPermission(role, permission))
}

// Check if a role has all of the specified permissions
export function roleHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => roleHasPermission(role, permission))
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

// Resource ownership check
export interface ResourceOwnership {
  resourceUserId: string
  currentUserId: string
  currentUserRole: UserRole
}

export function canAccessResource(
  ownership: ResourceOwnership,
  permission: Permission
): boolean {
  const { resourceUserId, currentUserId, currentUserRole } = ownership

  // Admin can access everything
  if (currentUserRole === UserRole.ADMIN) {
    return true
  }

  // Check if user is accessing their own resource
  const isOwnResource = resourceUserId === currentUserId

  // Map patient permissions to own permissions for ownership check
  const ownPermissionMap: Partial<Record<Permission, Permission>> = {
    [Permission.READ_PATIENT_DATA]: Permission.READ_OWN_DATA,
    [Permission.WRITE_PATIENT_DATA]: Permission.WRITE_OWN_DATA,
    [Permission.READ_PATIENT_METRICS]: Permission.READ_OWN_METRICS,
    [Permission.WRITE_PATIENT_METRICS]: Permission.WRITE_OWN_METRICS,
    [Permission.READ_PATIENT_MEDICATIONS]: Permission.READ_OWN_MEDICATIONS,
    [Permission.WRITE_PATIENT_MEDICATIONS]: Permission.WRITE_OWN_MEDICATIONS,
    [Permission.READ_PATIENT_LABS]: Permission.READ_OWN_LABS,
    [Permission.WRITE_PATIENT_LABS]: Permission.WRITE_OWN_LABS,
    [Permission.READ_PATIENT_FILES]: Permission.READ_OWN_FILES,
    [Permission.WRITE_PATIENT_FILES]: Permission.WRITE_OWN_FILES,
    [Permission.DELETE_PATIENT_FILES]: Permission.DELETE_OWN_FILES,
    [Permission.READ_PATIENT_APPOINTMENTS]: Permission.READ_OWN_APPOINTMENTS,
    [Permission.WRITE_PATIENT_APPOINTMENTS]: Permission.WRITE_OWN_APPOINTMENTS,
    [Permission.READ_PATIENT_GOALS]: Permission.READ_OWN_GOALS,
    [Permission.WRITE_PATIENT_GOALS]: Permission.WRITE_OWN_GOALS,
  }

  if (isOwnResource) {
    // Check if role has permission to access own resource
    const ownPermission = ownPermissionMap[permission] || permission
    return roleHasPermission(currentUserRole, ownPermission)
  } else {
    // Check if role has permission to access other patient's resource
    return roleHasPermission(currentUserRole, permission)
  }
}

// Permission guard for API routes
export class PermissionGuard {
  static require(permission: Permission) {
    return (role: UserRole) => {
      if (!roleHasPermission(role, permission)) {
        throw new Error(`Permission denied: ${permission} required`)
      }
    }
  }

  static requireAny(permissions: Permission[]) {
    return (role: UserRole) => {
      if (!roleHasAnyPermission(role, permissions)) {
        throw new Error(
          `Permission denied: One of ${permissions.join(", ")} required`
        )
      }
    }
  }

  static requireAll(permissions: Permission[]) {
    return (role: UserRole) => {
      if (!roleHasAllPermissions(role, permissions)) {
        throw new Error(
          `Permission denied: All of ${permissions.join(", ")} required`
        )
      }
    }
  }
}

// Helper to check resource access in API routes
export async function requireResourceAccess(
  resourceUserId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  permission: Permission
): Promise<void> {
  const canAccess = canAccessResource(
    { resourceUserId, currentUserId, currentUserRole },
    permission
  )

  if (!canAccess) {
    throw new Error(
      `Access denied: User ${currentUserId} cannot access resource owned by ${resourceUserId}`
    )
  }
}
