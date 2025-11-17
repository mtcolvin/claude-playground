/**
 * Phase 17: Nutrition Logging Interface
 */

'use client'

import { useState, useEffect } from 'react'
import { MacroPieChart } from './charts/macro-pie-chart'

interface NutritionEntry {
  id: string
  date: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  foodItems: Array<{
    name: string
    quantity: number
    unit: string
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  }>
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes?: string
  photoUrl?: string
}

interface DailyGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export function NutritionTracker() {
  const [entries, setEntries] = useState<NutritionEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEntry, setNewEntry] = useState<{
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    foodItems: Array<{ name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number }>
    notes: string
  }>({
    mealType: 'BREAKFAST',
    foodItems: [{ name: '', quantity: 1, unit: 'serving', calories: 0, protein: 0, carbs: 0, fat: 0 }],
    notes: '',
  })

  const [dailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 30,
  })

  useEffect(() => {
    loadEntries()
  }, [selectedDate])

  const loadEntries = async () => {
    try {
      const response = await fetch(`/api/v1/nutrition-entries?date=${selectedDate}&sortBy=date&sortOrder=asc`)
      const data = await response.json()
      if (data.success) {
        setEntries(data.data)
      }
    } catch (error) {
      console.error('Failed to load nutrition entries:', error)
    }
  }

  const addEntry = async () => {
    const totalCalories = newEntry.foodItems.reduce((sum, item) => sum + (item.calories || 0), 0)
    const totalProtein = newEntry.foodItems.reduce((sum, item) => sum + (item.protein || 0), 0)
    const totalCarbs = newEntry.foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0)
    const totalFat = newEntry.foodItems.reduce((sum, item) => sum + (item.fat || 0), 0)

    try {
      const response = await fetch('/api/v1/nutrition-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(selectedDate).toISOString(),
          mealType: newEntry.mealType,
          foodItems: newEntry.foodItems,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          notes: newEntry.notes,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setEntries([...entries, data.data])
        setShowAddModal(false)
        setNewEntry({
          mealType: 'BREAKFAST',
          foodItems: [{ name: '', quantity: 1, unit: 'serving', calories: 0, protein: 0, carbs: 0, fat: 0 }],
          notes: '',
        })
      }
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const getMealIcon = (mealType: string): string => {
    switch (mealType) {
      case 'BREAKFAST': return '🌅'
      case 'LUNCH': return '🌞'
      case 'DINNER': return '🌙'
      case 'SNACK': return '🍎'
      default: return '🍽️'
    }
  }

  const getMealColor = (mealType: string): string => {
    switch (mealType) {
      case 'BREAKFAST': return 'bg-yellow-100 text-yellow-800'
      case 'LUNCH': return 'bg-orange-100 text-orange-800'
      case 'DINNER': return 'bg-purple-100 text-purple-800'
      case 'SNACK': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate daily totals
  const dailyTotals = entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.totalCalories,
      protein: totals.protein + entry.totalProtein,
      carbs: totals.carbs + entry.totalCarbs,
      fat: totals.fat + entry.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const getProgressColor = (current: number, goal: number): string => {
    const percentage = (current / goal) * 100
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage <= 110) return 'bg-green-500'
    return 'bg-red-500'
  }

  const addFoodItem = () => {
    setNewEntry({
      ...newEntry,
      foodItems: [
        ...newEntry.foodItems,
        { name: '', quantity: 1, unit: 'serving', calories: 0, protein: 0, carbs: 0, fat: 0 }
      ]
    })
  }

  const removeFoodItem = (index: number) => {
    setNewEntry({
      ...newEntry,
      foodItems: newEntry.foodItems.filter((_, i) => i !== index)
    })
  }

  const updateFoodItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newEntry.foodItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewEntry({ ...newEntry, foodItems: updatedItems })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracker</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Meal
        </button>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Today
        </button>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Calories</div>
            <div className="text-2xl">🔥</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{dailyTotals.calories}</div>
          <div className="text-sm text-gray-500 mt-1">of {dailyGoals.calories} kcal</div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(dailyTotals.calories, dailyGoals.calories)}`}
              style={{ width: `${Math.min((dailyTotals.calories / dailyGoals.calories) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Protein */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Protein</div>
            <div className="text-2xl">🥩</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{dailyTotals.protein.toFixed(1)}g</div>
          <div className="text-sm text-gray-500 mt-1">of {dailyGoals.protein}g</div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(dailyTotals.protein, dailyGoals.protein)}`}
              style={{ width: `${Math.min((dailyTotals.protein / dailyGoals.protein) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Carbs</div>
            <div className="text-2xl">🍞</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{dailyTotals.carbs.toFixed(1)}g</div>
          <div className="text-sm text-gray-500 mt-1">of {dailyGoals.carbs}g</div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(dailyTotals.carbs, dailyGoals.carbs)}`}
              style={{ width: `${Math.min((dailyTotals.carbs / dailyGoals.carbs) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Fat */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Fat</div>
            <div className="text-2xl">🥑</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{dailyTotals.fat.toFixed(1)}g</div>
          <div className="text-sm text-gray-500 mt-1">of {dailyGoals.fat}g</div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(dailyTotals.fat, dailyGoals.fat)}`}
              style={{ width: `${Math.min((dailyTotals.fat / dailyGoals.fat) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Macros Breakdown Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Macro Distribution</h2>
        {dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat > 0 ? (
          <MacroPieChart
            protein={dailyTotals.protein}
            carbs={dailyTotals.carbs}
            fat={dailyTotals.fat}
            height={350}
          />
        ) : (
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            No nutrition data for today. Log your first meal to see macro distribution!
          </div>
        )}
      </div>

      {/* Meals Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Today's Meals</h2>

        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const).map((mealType) => {
          const mealEntries = entries.filter(e => e.mealType === mealType)
          const mealTotal = mealEntries.reduce((sum, e) => sum + e.totalCalories, 0)

          return (
            <div key={mealType} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMealIcon(mealType)}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{mealType}</div>
                    {mealTotal > 0 && (
                      <div className="text-sm text-gray-500">{mealTotal} calories</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewEntry({ ...newEntry, mealType })
                    setShowAddModal(true)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="divide-y">
                {mealEntries.map((entry) => (
                  <div key={entry.id} className="p-4">
                    <div className="space-y-2">
                      {entry.foodItems.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity} {item.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{item.calories} cal</div>
                            <div className="text-xs text-gray-500">
                              P: {item.protein}g C: {item.carbs}g F: {item.fat}g
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {entry.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        {entry.notes}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                      <div className="font-semibold text-gray-900">Total</div>
                      <div className="flex gap-4 text-gray-700">
                        <span>{entry.totalCalories} cal</span>
                        <span>P: {entry.totalProtein.toFixed(1)}g</span>
                        <span>C: {entry.totalCarbs.toFixed(1)}g</span>
                        <span>F: {entry.totalFat.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>
                ))}

                {mealEntries.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No {mealType.toLowerCase()} logged yet
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Meal</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewEntry({ ...newEntry, mealType: type })}
                      className={`px-4 py-2 rounded-lg ${
                        newEntry.mealType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getMealIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Food Items</label>
                  <button
                    onClick={addFoodItem}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {newEntry.foodItems.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                          placeholder="Food name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {newEntry.foodItems.length > 1 && (
                          <button
                            onClick={() => removeFoodItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateFoodItem(index, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">Unit</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateFoodItem(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Calories</label>
                          <input
                            type="number"
                            value={item.calories}
                            onChange={(e) => updateFoodItem(index, 'calories', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Protein (g)</label>
                          <input
                            type="number"
                            value={item.protein}
                            onChange={(e) => updateFoodItem(index, 'protein', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Carbs (g)</label>
                          <input
                            type="number"
                            value={item.carbs}
                            onChange={(e) => updateFoodItem(index, 'carbs', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Fat (g)</label>
                          <input
                            type="number"
                            value={item.fat}
                            onChange={(e) => updateFoodItem(index, 'fat', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes about this meal..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
