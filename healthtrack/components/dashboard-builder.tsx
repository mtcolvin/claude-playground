'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LayoutGrid, Plus, Save, Download, Upload, Settings, Trash2,
  GripVertical, Heart, Activity, Moon, Apple, Brain, TrendingUp,
  Calendar, Pill, FileText, AlertCircle, Target, BarChart3
} from 'lucide-react'

// Types
type WidgetType =
  | 'health-metrics'
  | 'medications'
  | 'appointments'
  | 'sleep-summary'
  | 'nutrition-summary'
  | 'mood-tracker'
  | 'exercise-log'
  | 'goals-progress'
  | 'anomaly-alerts'
  | 'correlations'
  | 'trends-chart'
  | 'quick-stats'

interface Widget {
  id: string
  type: WidgetType
  title: string
  icon: React.ReactNode
  size: 'small' | 'medium' | 'large' | 'full'
  position: { row: number; col: number }
  visible: boolean
}

interface DashboardLayout {
  id: string
  name: string
  description: string
  widgets: Widget[]
  isDefault: boolean
  createdAt: Date
}

// Widget metadata
const WIDGET_LIBRARY: Record<WidgetType, {
  title: string
  description: string
  icon: React.ReactNode
  defaultSize: Widget['size']
  category: string
}> = {
  'health-metrics': {
    title: 'Health Metrics',
    description: 'Blood pressure, heart rate, glucose, etc.',
    icon: <Heart className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Vitals'
  },
  'medications': {
    title: 'Medications',
    description: 'Active medications and adherence',
    icon: <Pill className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Health'
  },
  'appointments': {
    title: 'Appointments',
    description: 'Upcoming appointments calendar',
    icon: <Calendar className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Health'
  },
  'sleep-summary': {
    title: 'Sleep Analysis',
    description: 'Sleep duration and quality trends',
    icon: <Moon className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Wellness'
  },
  'nutrition-summary': {
    title: 'Nutrition',
    description: 'Calorie and macro tracking',
    icon: <Apple className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Wellness'
  },
  'mood-tracker': {
    title: 'Mental Health',
    description: 'Mood, anxiety, and stress',
    icon: <Brain className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Wellness'
  },
  'exercise-log': {
    title: 'Exercise',
    description: 'Workout sessions and activity',
    icon: <Activity className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Fitness'
  },
  'goals-progress': {
    title: 'Goals',
    description: 'Health goal tracking',
    icon: <Target className="h-5 w-5" />,
    defaultSize: 'large',
    category: 'Analytics'
  },
  'anomaly-alerts': {
    title: 'Anomaly Alerts',
    description: 'Outlier detection and warnings',
    icon: <AlertCircle className="h-5 w-5" />,
    defaultSize: 'medium',
    category: 'Analytics'
  },
  'correlations': {
    title: 'Correlations',
    description: 'Health metric relationships',
    icon: <TrendingUp className="h-5 w-5" />,
    defaultSize: 'large',
    category: 'Analytics'
  },
  'trends-chart': {
    title: 'Trends',
    description: 'Historical trends and predictions',
    icon: <BarChart3 className="h-5 w-5" />,
    defaultSize: 'large',
    category: 'Analytics'
  },
  'quick-stats': {
    title: 'Quick Stats',
    description: 'Key metrics at a glance',
    icon: <LayoutGrid className="h-5 w-5" />,
    defaultSize: 'full',
    category: 'Overview'
  },
}

// Default layouts
const DEFAULT_LAYOUTS: DashboardLayout[] = [
  {
    id: 'default-overview',
    name: 'Overview Dashboard',
    description: 'Balanced view of all health metrics',
    isDefault: true,
    createdAt: new Date(),
    widgets: [
      {
        id: 'w1',
        type: 'quick-stats',
        title: 'Quick Stats',
        icon: <LayoutGrid className="h-4 w-4" />,
        size: 'full',
        position: { row: 0, col: 0 },
        visible: true
      },
      {
        id: 'w2',
        type: 'health-metrics',
        title: 'Health Metrics',
        icon: <Heart className="h-4 w-4" />,
        size: 'medium',
        position: { row: 1, col: 0 },
        visible: true
      },
      {
        id: 'w3',
        type: 'medications',
        title: 'Medications',
        icon: <Pill className="h-4 w-4" />,
        size: 'medium',
        position: { row: 1, col: 1 },
        visible: true
      },
      {
        id: 'w4',
        type: 'anomaly-alerts',
        title: 'Anomaly Alerts',
        icon: <AlertCircle className="h-4 w-4" />,
        size: 'medium',
        position: { row: 2, col: 0 },
        visible: true
      },
      {
        id: 'w5',
        type: 'appointments',
        title: 'Appointments',
        icon: <Calendar className="h-4 w-4" />,
        size: 'medium',
        position: { row: 2, col: 1 },
        visible: true
      }
    ]
  },
  {
    id: 'wellness-focused',
    name: 'Wellness Dashboard',
    description: 'Mental health, sleep, and nutrition focus',
    isDefault: false,
    createdAt: new Date(),
    widgets: [
      {
        id: 'w6',
        type: 'mood-tracker',
        title: 'Mental Health',
        icon: <Brain className="h-4 w-4" />,
        size: 'large',
        position: { row: 0, col: 0 },
        visible: true
      },
      {
        id: 'w7',
        type: 'sleep-summary',
        title: 'Sleep',
        icon: <Moon className="h-4 w-4" />,
        size: 'medium',
        position: { row: 1, col: 0 },
        visible: true
      },
      {
        id: 'w8',
        type: 'nutrition-summary',
        title: 'Nutrition',
        icon: <Apple className="h-4 w-4" />,
        size: 'medium',
        position: { row: 1, col: 1 },
        visible: true
      },
      {
        id: 'w9',
        type: 'exercise-log',
        title: 'Exercise',
        icon: <Activity className="h-4 w-4" />,
        size: 'medium',
        position: { row: 2, col: 0 },
        visible: true
      }
    ]
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Advanced insights and correlations',
    isDefault: false,
    createdAt: new Date(),
    widgets: [
      {
        id: 'w10',
        type: 'trends-chart',
        title: 'Trends',
        icon: <BarChart3 className="h-4 w-4" />,
        size: 'large',
        position: { row: 0, col: 0 },
        visible: true
      },
      {
        id: 'w11',
        type: 'correlations',
        title: 'Correlations',
        icon: <TrendingUp className="h-4 w-4" />,
        size: 'large',
        position: { row: 1, col: 0 },
        visible: true
      },
      {
        id: 'w12',
        type: 'goals-progress',
        title: 'Goals',
        icon: <Target className="h-4 w-4" />,
        size: 'large',
        position: { row: 2, col: 0 },
        visible: true
      },
      {
        id: 'w13',
        type: 'anomaly-alerts',
        title: 'Anomalies',
        icon: <AlertCircle className="h-4 w-4" />,
        size: 'medium',
        position: { row: 3, col: 0 },
        visible: true
      }
    ]
  }
]

// Widget size to grid span mapping
const SIZE_TO_COLS: Record<Widget['size'], string> = {
  small: 'md:col-span-1',
  medium: 'md:col-span-1',
  large: 'md:col-span-2',
  full: 'md:col-span-2'
}

// Mock widget content components
const WidgetContent: React.FC<{ widget: Widget }> = ({ widget }) => {
  const meta = WIDGET_LIBRARY[widget.type]

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-muted-foreground mb-3">{meta.icon}</div>
      <h3 className="font-semibold mb-1">{meta.title}</h3>
      <p className="text-xs text-muted-foreground">{meta.description}</p>
      <Badge variant="outline" className="mt-3">
        {widget.size}
      </Badge>
    </div>
  )
}

export function DashboardBuilder() {
  const [layouts, setLayouts] = useState<DashboardLayout[]>(DEFAULT_LAYOUTS)
  const [activeLayoutId, setActiveLayoutId] = useState(DEFAULT_LAYOUTS[0].id)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)

  const activeLayout = layouts.find(l => l.id === activeLayoutId) || layouts[0]

  // Add widget to current layout
  const addWidget = useCallback((widgetType: WidgetType) => {
    const meta = WIDGET_LIBRARY[widgetType]
    const newWidget: Widget = {
      id: `w-${Date.now()}`,
      type: widgetType,
      title: meta.title,
      icon: meta.icon,
      size: meta.defaultSize,
      position: { row: activeLayout.widgets.length, col: 0 },
      visible: true
    }

    setLayouts(prev => prev.map(layout =>
      layout.id === activeLayoutId
        ? { ...layout, widgets: [...layout.widgets, newWidget] }
        : layout
    ))

    setShowWidgetLibrary(false)
  }, [activeLayoutId, activeLayout])

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    setLayouts(prev => prev.map(layout =>
      layout.id === activeLayoutId
        ? { ...layout, widgets: layout.widgets.filter(w => w.id !== widgetId) }
        : layout
    ))
  }, [activeLayoutId])

  // Toggle widget size
  const toggleWidgetSize = useCallback((widgetId: string) => {
    setLayouts(prev => prev.map(layout =>
      layout.id === activeLayoutId
        ? {
            ...layout,
            widgets: layout.widgets.map(w =>
              w.id === widgetId
                ? {
                    ...w,
                    size: w.size === 'small' ? 'medium' :
                          w.size === 'medium' ? 'large' :
                          w.size === 'large' ? 'full' : 'small'
                  }
                : w
            )
          }
        : layout
    ))
  }, [activeLayoutId])

  // Create new layout
  const createNewLayout = useCallback(() => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      name: `Custom Dashboard ${layouts.length + 1}`,
      description: 'Custom dashboard layout',
      widgets: [],
      isDefault: false,
      createdAt: new Date()
    }

    setLayouts(prev => [...prev, newLayout])
    setActiveLayoutId(newLayout.id)
    setIsEditMode(true)
  }, [layouts.length])

  // Delete layout
  const deleteLayout = useCallback((layoutId: string) => {
    if (layouts.length === 1) {
      alert('Cannot delete the last dashboard')
      return
    }

    setLayouts(prev => prev.filter(l => l.id !== layoutId))
    if (activeLayoutId === layoutId) {
      setActiveLayoutId(layouts.find(l => l.id !== layoutId)!.id)
    }
  }, [activeLayoutId, layouts])

  // Export layout
  const exportLayout = useCallback(() => {
    const dataStr = JSON.stringify(activeLayout, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `dashboard-${activeLayout.name.toLowerCase().replace(/\s+/g, '-')}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [activeLayout])

  // Group widgets by category for library
  const widgetsByCategory = Object.entries(WIDGET_LIBRARY).reduce((acc, [type, meta]) => {
    if (!acc[meta.category]) acc[meta.category] = []
    acc[meta.category].push({ type: type as WidgetType, ...meta })
    return acc
  }, {} as Record<string, Array<{ type: WidgetType } & typeof WIDGET_LIBRARY[WidgetType]>>)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-blue-600" />
            Dashboard Builder
          </h1>
          <p className="text-muted-foreground">
            Customize your dashboard with drag-and-drop widgets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </Button>
          <Button variant="outline" onClick={createNewLayout}>
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Layout Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Dashboards</CardTitle>
          <CardDescription>
            Switch between different dashboard layouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {layouts.map(layout => (
              <Card
                key={layout.id}
                className={`cursor-pointer transition-all ${
                  activeLayoutId === layout.id
                    ? 'border-blue-500 shadow-md'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setActiveLayoutId(layout.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{layout.name}</CardTitle>
                      {layout.isDefault && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {!layout.isDefault && isEditMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteLayout(layout.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">
                    {layout.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {layout.widgets.length} widgets
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {activeLayout.name}
                {activeLayout.isDefault && (
                  <Badge variant="outline">Default</Badge>
                )}
              </CardTitle>
              <CardDescription>{activeLayout.description}</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportLayout}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Widget Library */}
          {isEditMode && showWidgetLibrary && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Widget Library
              </h3>

              <Tabs defaultValue={Object.keys(widgetsByCategory)[0]}>
                <TabsList>
                  {Object.keys(widgetsByCategory).map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid gap-3 md:grid-cols-4">
                      {widgets.map(widget => (
                        <Card
                          key={widget.type}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addWidget(widget.type)}
                        >
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="flex justify-center mb-2 text-blue-600">
                                {widget.icon}
                              </div>
                              <h4 className="font-semibold text-sm mb-1">
                                {widget.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {widget.description}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {widget.defaultSize}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Dashboard Grid */}
          {activeLayout.widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Empty Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add widgets from the library to get started
              </p>
              {!showWidgetLibrary && (
                <Button onClick={() => setShowWidgetLibrary(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Widget
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeLayout.widgets
                .filter(w => w.visible)
                .map(widget => (
                  <Card
                    key={widget.id}
                    className={`relative ${SIZE_TO_COLS[widget.size]} ${
                      isEditMode ? 'border-dashed border-2' : ''
                    }`}
                  >
                    {isEditMode && (
                      <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWidgetSize(widget.id)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeWidget(widget.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}

                    {isEditMode && (
                      <div className="absolute top-2 left-2 cursor-move">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    <CardContent className="p-0 min-h-[200px]">
                      <WidgetContent widget={widget} />
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {isEditMode && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Mode Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Click "Add Widget" to browse available widgets</li>
              <li>• Click a widget in the library to add it to your dashboard</li>
              <li>• Use the gear icon to resize widgets (small → medium → large → full)</li>
              <li>• Use the trash icon to remove widgets</li>
              <li>• Click "Exit Edit Mode" when finished</li>
              <li>• Use "Export" to save your dashboard configuration</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Educational Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Dashboard Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Overview Dashboard</h4>
              <p className="text-muted-foreground mb-2">
                Include quick stats, recent metrics, and alerts for a comprehensive daily view.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Quick Stats (full width)</li>
                <li>• Health Metrics + Medications</li>
                <li>• Anomaly Alerts + Appointments</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Analytics Dashboard</h4>
              <p className="text-muted-foreground mb-2">
                Focus on trends, correlations, and predictive insights for deep analysis.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Trends Chart (large)</li>
                <li>• Correlations (large)</li>
                <li>• Goals Progress (large)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Wellness Dashboard</h4>
              <p className="text-muted-foreground mb-2">
                Emphasize mental health, sleep, nutrition, and exercise for lifestyle tracking.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Mood Tracker (large)</li>
                <li>• Sleep + Nutrition</li>
                <li>• Exercise + Goals</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Medical Dashboard</h4>
              <p className="text-muted-foreground mb-2">
                Prioritize medications, appointments, lab results, and medical files.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Medications (medium)</li>
                <li>• Appointments (medium)</li>
                <li>• Lab Results + Anomaly Alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Dashboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{layouts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Active Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeLayout.widgets.filter(w => w.visible).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Available Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.keys(WIDGET_LIBRARY).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Widget Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.keys(widgetsByCategory).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
