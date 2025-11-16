import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler, successResponse } from "@/lib/api-middleware"

// GET /api/v1/dashboard/stats - Get dashboard statistics
export const GET = apiHandler(
  async (request) => {
    const userId = request.user.id
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Parallel queries for statistics
    const [
      totalMetrics,
      recentMetrics,
      activeMedications,
      upcomingAppointments,
      recentLabResults,
      activeHealthGoals,
      unreadNotifications,
      recentMoodEntries,
      weeklyExerciseSessions,
      weeklyNutritionEntries,
    ] = await Promise.all([
      prisma.healthMetric.count({ where: { userId } }),
      prisma.healthMetric.count({
        where: { userId, date: { gte: sevenDaysAgo } },
      }),
      prisma.medication.count({
        where: { userId, isActive: true },
      }),
      prisma.appointment.findMany({
        where: {
          userId,
          dateTime: { gte: now },
          status: "SCHEDULED",
        },
        take: 5,
        orderBy: { dateTime: "asc" },
      }),
      prisma.labResult.count({
        where: { userId, testDate: { gte: thirtyDaysAgo } },
      }),
      prisma.healthGoal.count({
        where: {
          userId,
          status: { in: ["IN_PROGRESS", "NOT_STARTED"] },
        },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.moodEntry.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: "desc" },
        take: 7,
      }),
      prisma.exerciseSession.count({
        where: { userId, date: { gte: sevenDaysAgo } },
      }),
      prisma.nutritionEntry.count({
        where: { userId, date: { gte: sevenDaysAgo } },
      }),
    ])

    // Calculate average mood for the week
    const avgMood = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((acc, entry) => {
          const moodValues = {
            VERY_BAD: 1,
            BAD: 2,
            NEUTRAL: 3,
            GOOD: 4,
            VERY_GOOD: 5,
          }
          return acc + (moodValues[entry.mood] || 3)
        }, 0) / recentMoodEntries.length
      : null

    const stats = {
      overview: {
        totalMetrics,
        recentMetrics,
        activeMedications,
        recentLabResults,
        activeHealthGoals,
        unreadNotifications,
      },
      appointments: {
        upcoming: upcomingAppointments,
      },
      weeklyActivity: {
        exerciseSessions: weeklyExerciseSessions,
        nutritionEntries: weeklyNutritionEntries,
        averageMood: avgMood,
      },
      lastUpdated: now,
    }

    return successResponse(stats)
  },
  { requireAuth: true }
)
