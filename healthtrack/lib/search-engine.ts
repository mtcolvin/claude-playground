/**
 * Advanced Search & Filtering Engine
 *
 * Provides comprehensive search capabilities across all health data:
 * - Full-text search
 * - Multi-field filtering
 * - Date range queries
 * - Faceted search
 * - Search suggestions
 * - Saved searches
 */

import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

// Search configuration
export interface SearchConfig {
  query?: string
  filters?: SearchFilters
  sort?: SortConfig
  pagination?: PaginationConfig
  facets?: string[]
}

export interface SearchFilters {
  dateRange?: {
    field: string
    start?: Date
    end?: Date
  }
  categories?: string[]
  types?: string[]
  status?: string[]
  tags?: string[]
  customFilters?: Record<string, any>
}

export interface SortConfig {
  field: string
  order: 'asc' | 'desc'
}

export interface PaginationConfig {
  page: number
  limit: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  facets?: Record<string, FacetValue[]>
  suggestions?: string[]
}

export interface FacetValue {
  value: string
  count: number
}

/**
 * Search across all health metrics
 */
export async function searchHealthMetrics(
  userId: string,
  config: SearchConfig
): Promise<SearchResult<any>> {
  const where: Prisma.HealthMetricWhereInput = {
    userId,
  }

  // Full-text search
  if (config.query) {
    where.OR = [
      { type: { contains: config.query, mode: 'insensitive' } },
      { notes: { contains: config.query, mode: 'insensitive' } },
      { source: { contains: config.query, mode: 'insensitive' } },
    ]
  }

  // Apply filters
  applyFilters(where, config.filters)

  // Pagination
  const page = config.pagination?.page || 1
  const limit = config.pagination?.limit || 10
  const skip = (page - 1) * limit

  // Sort
  const orderBy: Prisma.HealthMetricOrderByWithRelationInput = config.sort
    ? { [config.sort.field]: config.sort.order }
    : { date: 'desc' }

  // Execute queries
  const [items, total] = await Promise.all([
    prisma.healthMetric.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.healthMetric.count({ where }),
  ])

  // Get facets if requested
  let facets: Record<string, FacetValue[]> | undefined
  if (config.facets) {
    facets = await getFacets('healthMetric', userId, config.facets)
  }

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    facets,
  }
}

/**
 * Search across medications
 */
export async function searchMedications(
  userId: string,
  config: SearchConfig
): Promise<SearchResult<any>> {
  const where: Prisma.MedicationWhereInput = {
    userId,
  }

  if (config.query) {
    where.OR = [
      { name: { contains: config.query, mode: 'insensitive' } },
      { purpose: { contains: config.query, mode: 'insensitive' } },
      { prescribedBy: { contains: config.query, mode: 'insensitive' } },
    ]
  }

  applyFilters(where, config.filters)

  const page = config.pagination?.page || 1
  const limit = config.pagination?.limit || 10
  const skip = (page - 1) * limit

  const orderBy: Prisma.MedicationOrderByWithRelationInput = config.sort
    ? { [config.sort.field]: config.sort.order }
    : { startDate: 'desc' }

  const [items, total] = await Promise.all([
    prisma.medication.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.medication.count({ where }),
  ])

  let facets: Record<string, FacetValue[]> | undefined
  if (config.facets) {
    facets = await getFacets('medication', userId, config.facets)
  }

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    facets,
  }
}

/**
 * Global search across all resources
 */
export async function globalSearch(
  userId: string,
  query: string,
  options: { limit?: number } = {}
): Promise<{
  metrics: any[]
  medications: any[]
  labResults: any[]
  appointments: any[]
  conditions: any[]
  allergies: any[]
}> {
  const limit = options.limit || 5

  const [metrics, medications, labResults, appointments, conditions, allergies] =
    await Promise.all([
      prisma.healthMetric.findMany({
        where: {
          userId,
          OR: [
            { type: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.medication.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { purpose: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.labResult.findMany({
        where: {
          userId,
          OR: [
            { testName: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { testDate: 'desc' },
      }),
      prisma.appointment.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { provider: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { dateTime: 'desc' },
      }),
      prisma.condition.findMany({
        where: {
          userId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: limit,
        orderBy: { diagnosedDate: 'desc' },
      }),
      prisma.allergy.findMany({
        where: {
          userId,
          allergen: { contains: query, mode: 'insensitive' },
        },
        take: limit,
      }),
    ])

  return {
    metrics,
    medications,
    labResults,
    appointments,
    conditions,
    allergies,
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  userId: string,
  query: string,
  limit: number = 10
): Promise<string[]> {
  if (!query || query.length < 2) return []

  const suggestions = new Set<string>()

  // Get medication names
  const medications = await prisma.medication.findMany({
    where: {
      userId,
      name: { contains: query, mode: 'insensitive' },
    },
    select: { name: true },
    take: limit,
  })
  medications.forEach((m) => suggestions.add(m.name))

  // Get metric types
  const metrics = await prisma.healthMetric.findMany({
    where: {
      userId,
      type: { contains: query, mode: 'insensitive' },
    },
    select: { type: true },
    distinct: ['type'],
    take: limit,
  })
  metrics.forEach((m) => suggestions.add(m.type))

  // Get condition names
  const conditions = await prisma.condition.findMany({
    where: {
      userId,
      name: { contains: query, mode: 'insensitive' },
    },
    select: { name: true },
    take: limit,
  })
  conditions.forEach((c) => suggestions.add(c.name))

  return Array.from(suggestions).slice(0, limit)
}

/**
 * Get facets for filtering
 */
async function getFacets(
  model: string,
  userId: string,
  facetFields: string[]
): Promise<Record<string, FacetValue[]>> {
  const facets: Record<string, FacetValue[]> = {}

  // This is a simplified implementation
  // In production, you'd use aggregation queries
  for (const field of facetFields) {
    if (model === 'healthMetric' && field === 'type') {
      const types = await prisma.healthMetric.groupBy({
        by: ['type'],
        where: { userId },
        _count: true,
      })
      facets.type = types.map((t) => ({
        value: t.type,
        count: t._count,
      }))
    }
  }

  return facets
}

/**
 * Apply filters to where clause
 */
function applyFilters(where: any, filters?: SearchFilters) {
  if (!filters) return

  // Date range filter
  if (filters.dateRange) {
    const field = filters.dateRange.field
    if (!where[field]) {
      where[field] = {}
    }
    if (filters.dateRange.start) {
      where[field].gte = filters.dateRange.start
    }
    if (filters.dateRange.end) {
      where[field].lte = filters.dateRange.end
    }
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    where.category = { in: filters.categories }
  }

  // Type filter
  if (filters.types && filters.types.length > 0) {
    where.type = { in: filters.types }
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status }
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags,
    }
  }

  // Custom filters
  if (filters.customFilters) {
    Object.assign(where, filters.customFilters)
  }
}

/**
 * Save search for later use
 */
export async function saveSearch(
  userId: string,
  name: string,
  config: SearchConfig
): Promise<any> {
  return await prisma.savedSearch.create({
    data: {
      userId,
      name,
      query: config.query || '',
      filters: config.filters as any,
      sortBy: config.sort?.field,
      sortOrder: config.sort?.order,
    },
  })
}

/**
 * Get user's saved searches
 */
export async function getSavedSearches(userId: string): Promise<any[]> {
  return await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { lastUsed: 'desc' },
  })
}

/**
 * Update saved search last used timestamp
 */
export async function updateSearchUsage(searchId: string): Promise<void> {
  await prisma.savedSearch.update({
    where: { id: searchId },
    data: { lastUsed: new Date() },
  })
}
