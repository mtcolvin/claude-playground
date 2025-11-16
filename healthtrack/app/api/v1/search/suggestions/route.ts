import { NextRequest } from "next/server"
import { apiHandler, successResponse } from "@/lib/api-middleware"
import { getSearchSuggestions } from "@/lib/search-engine"

// GET /api/v1/search/suggestions - Get search suggestions
export const GET = apiHandler(
  async (request) => {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "10")

    const suggestions = await getSearchSuggestions(request.user.id, query, limit)

    return successResponse({ suggestions })
  },
  { requireAuth: true }
)
