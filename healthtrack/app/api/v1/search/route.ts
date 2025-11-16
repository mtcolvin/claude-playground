import { NextRequest } from "next/server"
import { apiHandler, successResponse } from "@/lib/api-middleware"
import {
  globalSearch,
  searchHealthMetrics,
  searchMedications,
  getSearchSuggestions,
} from "@/lib/search-engine"
import type { SearchConfig } from "@/lib/search-engine"

// GET /api/v1/search - Global search across all resources
export const GET = apiHandler(
  async (request) => {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const resource = searchParams.get("resource") // Optional: search specific resource
    const limit = parseInt(searchParams.get("limit") || "10")

    // If no specific resource, do global search
    if (!resource) {
      const results = await globalSearch(request.user.id, query, { limit })
      return successResponse(results)
    }

    // Build search config
    const config: SearchConfig = {
      query,
      pagination: {
        page: parseInt(searchParams.get("page") || "1"),
        limit,
      },
      sort: {
        field: searchParams.get("sortBy") || "date",
        order: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      },
    }

    // Parse filters
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      config.filters = {
        dateRange: {
          field: "date",
          start: startDate ? new Date(startDate) : undefined,
          end: endDate ? new Date(endDate) : undefined,
        },
      }
    }

    // Parse facets
    const facets = searchParams.get("facets")
    if (facets) {
      config.facets = facets.split(",")
    }

    // Search specific resource
    let results
    switch (resource) {
      case "metrics":
        results = await searchHealthMetrics(request.user.id, config)
        break
      case "medications":
        results = await searchMedications(request.user.id, config)
        break
      default:
        results = await globalSearch(request.user.id, query, { limit })
    }

    return successResponse(results)
  },
  { requireAuth: true }
)
