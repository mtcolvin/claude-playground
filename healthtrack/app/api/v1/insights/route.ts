import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler, successResponse } from "@/lib/api-middleware"

// GET /api/v1/insights - Get AI-powered health insights
export const GET = apiHandler(
  async (request) => {
    const userId = request.user.id
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") // e.g., "sleep", "exercise", "mood", "nutrition"

    // Fetch recent data for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      sleepData,
      exerciseData,
      moodData,
      nutritionData,
      healthMetrics,
    ] = await Promise.all([
      prisma.sleepSession.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.exerciseSession.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.moodEntry.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.nutritionEntry.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.healthMetric.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
    ])

    // Generate insights (placeholder for AI integration)
    const insights = []

    // Sleep insights
    if (!category || category === "sleep") {
      // Convert quality strings to numeric values for analysis
      const qualityToNumber = (quality: string | null): number => {
        if (!quality) return 0
        const qualityMap: Record<string, number> = {
          excellent: 10,
          good: 7,
          fair: 5,
          poor: 3,
        }
        return qualityMap[quality.toLowerCase()] || 0
      }

      const avgSleepQuality = sleepData.length > 0
        ? sleepData.reduce((acc, s) => acc + qualityToNumber(s.quality), 0) / sleepData.length
        : 0

      if (avgSleepQuality < 6) {
        insights.push({
          category: "sleep",
          type: "warning",
          title: "Sleep Quality Below Average",
          message: `Your average sleep quality over the past 30 days is ${avgSleepQuality.toFixed(1)}/10. Consider establishing a consistent bedtime routine.`,
          recommendations: [
            "Maintain a consistent sleep schedule",
            "Limit screen time before bed",
            "Create a relaxing bedtime routine",
          ],
          priority: "high",
        })
      }
    }

    // Exercise insights
    if (!category || category === "exercise") {
      const weeklyExercise = exerciseData.filter(
        e => new Date(e.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      if (weeklyExercise < 3) {
        insights.push({
          category: "exercise",
          type: "recommendation",
          title: "Increase Physical Activity",
          message: `You've logged ${weeklyExercise} exercise sessions this week. Aim for at least 150 minutes of moderate activity per week.`,
          recommendations: [
            "Schedule 30-minute walks 5 days a week",
            "Try different types of exercise to stay motivated",
            "Start with low-intensity activities if you're just beginning",
          ],
          priority: "medium",
        })
      }
    }

    // Mood insights
    if (!category || category === "mood") {
      const recentMoods = moodData.slice(0, 7)
      const lowMoodCount = recentMoods.filter(m =>
        m.mood === "BAD" || m.mood === "VERY_BAD"
      ).length

      if (lowMoodCount >= 4) {
        insights.push({
          category: "mood",
          type: "alert",
          title: "Mood Pattern Detected",
          message: "You've reported low mood several times this week. Consider reaching out to a healthcare provider.",
          recommendations: [
            "Practice mindfulness or meditation",
            "Engage in activities you enjoy",
            "Talk to a mental health professional",
            "Ensure adequate sleep and exercise",
          ],
          priority: "high",
        })
      }
    }

    // Nutrition insights
    if (!category || category === "nutrition") {
      const dailyCalories = nutritionData
        .filter(n => n.totalCalories)
        .reduce((acc, n) => acc + (n.totalCalories || 0), 0) / Math.max(1, new Set(nutritionData.map(n => n.date.toDateString())).size)

      if (nutritionData.length < 7) {
        insights.push({
          category: "nutrition",
          type: "tip",
          title: "Track Your Nutrition",
          message: "You've logged fewer meals recently. Consistent tracking helps identify patterns and areas for improvement.",
          recommendations: [
            "Log all meals and snacks",
            "Focus on whole, unprocessed foods",
            "Stay hydrated throughout the day",
          ],
          priority: "low",
        })
      }
    }

    // Correlation insights (example: sleep vs mood)
    if (sleepData.length > 0 && moodData.length > 0) {
      // Simple correlation detection
      const correlationInsight = {
        category: "correlation",
        type: "insight",
        title: "Sleep and Mood Connection",
        message: "We've noticed a potential connection between your sleep quality and mood. Better sleep often correlates with improved mood.",
        recommendations: [
          "Prioritize getting 7-9 hours of quality sleep",
          "Track how sleep affects your next-day mood",
        ],
        priority: "medium",
      }
      insights.push(correlationInsight)
    }

    return successResponse({
      insights,
      generatedAt: new Date(),
      dataRange: {
        from: thirtyDaysAgo,
        to: new Date(),
      },
    })
  },
  { requireAuth: true }
)
