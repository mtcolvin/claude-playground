import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-middleware"
import { exportToCSV, exportToJSON, exportToPDF, exportToExcel } from "@/lib/export"

// GET /api/v1/export - Export health data
export const GET = apiHandler(
  async (request) => {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "json"
    const resource = searchParams.get("resource") || "all"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build date range filter
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const userId = request.user.id

    // Fetch data based on resource
    let data: any

    if (resource === "all") {
      // Export all health data
      const [
        metrics,
        medications,
        labResults,
        appointments,
        conditions,
        allergies,
        immunizations,
        moodEntries,
        nutritionEntries,
        exerciseSessions,
        sleepSessions,
      ] = await Promise.all([
        prisma.healthMetric.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
        prisma.medication.findMany({ where: { userId } }),
        prisma.labResult.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
        prisma.appointment.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
        prisma.condition.findMany({ where: { userId } }),
        prisma.allergy.findMany({ where: { userId } }),
        prisma.immunization.findMany({ where: { userId } }),
        prisma.moodEntry.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
        prisma.nutritionEntry.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
        prisma.exerciseSession.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
        prisma.sleepSession.findMany({
          where: {
            userId,
            ...(startDate || endDate ? { date: dateFilter } : {}),
          },
        }),
      ])

      data = {
        metadata: {
          exportDate: new Date().toISOString(),
          userId,
          version: "1.0",
        },
        healthMetrics: metrics,
        medications,
        labResults,
        appointments,
        conditions,
        allergies,
        immunizations,
        moodEntries,
        nutritionEntries,
        exerciseSessions,
        sleepSessions,
      }
    } else {
      // Export specific resource
      const resourceMap: Record<string, any> = {
        metrics: () =>
          prisma.healthMetric.findMany({
            where: {
              userId,
              ...(startDate || endDate ? { date: dateFilter } : {}),
            },
          }),
        medications: () => prisma.medication.findMany({ where: { userId } }),
        "lab-results": () =>
          prisma.labResult.findMany({
            where: {
              userId,
              ...(startDate || endDate ? { date: dateFilter } : {}),
            },
          }),
        appointments: () =>
          prisma.appointment.findMany({
            where: {
              userId,
              ...(startDate || endDate ? { date: dateFilter } : {}),
            },
          }),
      }

      const fetcher = resourceMap[resource]
      if (!fetcher) {
        return NextResponse.json({ error: "Invalid resource" }, { status: 400 })
      }

      data = await fetcher()
    }

    // Generate export based on format
    let blob: Blob
    let contentType: string
    let extension: string

    switch (format) {
      case "csv":
        blob = exportToCSV(Array.isArray(data) ? data : [data])
        contentType = "text/csv"
        extension = "csv"
        break
      case "json":
        blob = exportToJSON(data, true)
        contentType = "application/json"
        extension = "json"
        break
      case "pdf":
        blob = await exportToPDF(data, { title: `Health Data - ${resource}` })
        contentType = "application/pdf"
        extension = "pdf"
        break
      case "excel":
        blob = exportToExcel(data)
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        extension = "xlsx"
        break
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    const filename = `healthtrack_${resource}_${timestamp}.${extension}`

    // Return file as NextResponse
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  },
  { requireAuth: true }
)
