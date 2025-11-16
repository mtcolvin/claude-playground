/**
 * Advanced Search Filters Component
 */

'use client'

import { useState } from 'react'

export interface FilterState {
  dateRange?: {
    start: string
    end: string
  }
  types?: string[]
  categories?: string[]
  status?: string[]
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
  availableTypes?: string[]
  availableCategories?: string[]
  availableStatuses?: string[]
}

export function SearchFilters({
  onFilterChange,
  availableTypes = [],
  availableCategories = [],
  availableStatuses = [],
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const hasActiveFilters =
    filters.dateRange ||
    (filters.types && filters.types.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.status && filters.status.length > 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-gray-700 font-medium hover:text-gray-900"
        >
          <svg
            className={`w-5 h-5 mr-2 transform transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value,
                      end: filters.dateRange?.end || '',
                    },
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      start: filters.dateRange?.start || '',
                      end: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          {availableTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="space-y-2">
                {availableTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.types?.includes(type) || false}
                      onChange={(e) => {
                        const types = filters.types || []
                        updateFilters({
                          types: e.target.checked
                            ? [...types, type]
                            : types.filter((t) => t !== type),
                        })
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                multiple
                value={filters.categories || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(
                    (option) => option.value
                  )
                  updateFilters({ categories: selected })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={Math.min(5, availableCategories.length)}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          {availableStatuses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      const statuses = filters.status || []
                      updateFilters({
                        status: statuses.includes(status)
                          ? statuses.filter((s) => s !== status)
                          : [...statuses, status],
                      })
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filters.status?.includes(status)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
