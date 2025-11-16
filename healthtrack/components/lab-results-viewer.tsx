/**
 * Phase 13: Lab Results Viewer UI
 */

'use client'

import { useState, useEffect } from 'react'
import { ExportButton } from './export-button'

interface LabResult {
  id: string
  testName: string
  testDate: string
  category?: string
  orderedBy?: string
  facility?: string
  results: Array<{
    name: string
    value: string
    unit?: string
    referenceRange?: string
    status?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL'
  }>
}

export function LabResultsViewer() {
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    loadLabResults()
  }, [])

  const loadLabResults = async () => {
    try {
      const response = await fetch('/api/v1/lab-results?sortBy=testDate&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        setLabResults(data.data)
      }
    } catch (error) {
      console.error('Failed to load lab results:', error)
    }
  }

  const categories = ['all', ...new Set(labResults.map(r => r.category).filter(Boolean))]
  const filteredResults = filterCategory === 'all'
    ? labResults
    : labResults.filter(r => r.category === filterCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lab Results</h1>
        <ExportButton resource="lab-results" label="Export Results" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All Tests' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredResults.map((result) => (
            <button
              key={result.id}
              onClick={() => setSelectedResult(result)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedResult?.id === result.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-semibold text-gray-900">{result.testName}</div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(result.testDate).toLocaleDateString()}
              </div>
              {result.facility && (
                <div className="text-sm text-gray-600 mt-1">{result.facility}</div>
              )}
              <div className="flex gap-1 mt-2">
                {result.results.some(r => r.status === 'ABNORMAL') && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Abnormal
                  </span>
                )}
                {result.results.some(r => r.status === 'CRITICAL') && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                    Critical
                  </span>
                )}
              </div>
            </button>
          ))}

          {filteredResults.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No lab results found
            </div>
          )}
        </div>

        {/* Result Detail */}
        <div className="lg:col-span-2">
          {selectedResult ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedResult.testName}</h2>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Test Date:</span>{' '}
                    <span className="font-medium">{new Date(selectedResult.testDate).toLocaleDateString()}</span>
                  </div>
                  {selectedResult.orderedBy && (
                    <div>
                      <span className="text-gray-500">Ordered By:</span>{' '}
                      <span className="font-medium">{selectedResult.orderedBy}</span>
                    </div>
                  )}
                  {selectedResult.facility && (
                    <div>
                      <span className="text-gray-500">Facility:</span>{' '}
                      <span className="font-medium">{selectedResult.facility}</span>
                    </div>
                  )}
                  {selectedResult.category && (
                    <div>
                      <span className="text-gray-500">Category:</span>{' '}
                      <span className="font-medium">{selectedResult.category}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {selectedResult.results.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      item.status === 'CRITICAL'
                        ? 'border-red-200 bg-red-50'
                        : item.status === 'ABNORMAL'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-2xl font-bold mt-1">
                          {item.value} {item.unit && <span className="text-lg text-gray-600">{item.unit}</span>}
                        </div>
                        {item.referenceRange && (
                          <div className="text-sm text-gray-600 mt-1">
                            Reference Range: {item.referenceRange}
                          </div>
                        )}
                      </div>
                      {item.status && item.status !== 'NORMAL' && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              Select a lab result to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
