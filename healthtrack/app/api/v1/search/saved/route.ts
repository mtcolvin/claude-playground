import { NextRequest } from "next/server"
import { apiHandler, successResponse, logAuditTrail } from "@/lib/api-middleware"
import { saveSearch, getSavedSearches } from "@/lib/search-engine"
import { z } from "zod"

const saveSearchSchema = z.object({
  name: z.string().min(1),
  query: z.string().optional(),
  filters: z.any().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

// GET /api/v1/search/saved - Get user's saved searches
export const GET = apiHandler(
  async (request) => {
    const searches = await getSavedSearches(request.user.id)
    return successResponse(searches)
  },
  { requireAuth: true }
)

// POST /api/v1/search/saved - Save a new search
export const POST = apiHandler(
  async (request) => {
    const body = await request.json()
    const data = saveSearchSchema.parse(body)

    const search = await saveSearch(request.user.id, data.name, {
      query: data.query,
      filters: data.filters,
      sort: data.sortBy
        ? { field: data.sortBy, order: data.sortOrder || "desc" }
        : undefined,
    })

    await logAuditTrail(
      request.user.id,
      "CREATE",
      "SavedSearch",
      search.id,
      { name: data.name },
      request
    )

    return successResponse(search, 201)
  },
  { requireAuth: true }
)
