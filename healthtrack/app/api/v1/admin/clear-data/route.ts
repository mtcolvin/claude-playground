import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  apiHandler,
  successResponse,
  ApiError,
} from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"

// DELETE /api/v1/admin/clear-data - Clear all user data (for testing)
export const DELETE = apiHandler(
  async (request) => {
    const userId = request.user.id

    console.log(`Clearing all data for user: ${userId}`)

    // Delete all health metrics
    const metricsDeleted = await prisma.healthMetric.deleteMany({
      where: { userId }
    })

    // Delete all medical files
    const filesDeleted = await prisma.medicalFile.deleteMany({
      where: { userId }
    })

    // Delete all lab results
    const labsDeleted = await prisma.labResult.deleteMany({
      where: { userId }
    })

    // Delete all medications
    const medsDeleted = await prisma.medication.deleteMany({
      where: { userId }
    })

    // Delete all appointments
    const appointmentsDeleted = await prisma.appointment.deleteMany({
      where: { userId }
    })

    // Delete all health goals
    const goalsDeleted = await prisma.healthGoal.deleteMany({
      where: { userId }
    })

    // Delete all symptom logs
    const symptomsDeleted = await prisma.symptomLog.deleteMany({
      where: { userId }
    })

    // Delete all immunizations
    const immunizationsDeleted = await prisma.immunization.deleteMany({
      where: { userId }
    })

    return successResponse({
      message: 'All user data cleared successfully',
      deleted: {
        healthMetrics: metricsDeleted.count,
        medicalFiles: filesDeleted.count,
        labResults: labsDeleted.count,
        medications: medsDeleted.count,
        appointments: appointmentsDeleted.count,
        healthGoals: goalsDeleted.count,
        symptomLogs: symptomsDeleted.count,
        immunizations: immunizationsDeleted.count,
      }
    })
  },
  { requirePermission: Permission.WRITE_OWN_DATA }
)
