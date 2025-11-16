'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getHealthMetrics,
  addHealthMetric,
  getPatientProfile,
  savePatientProfile,
  generateDemoData,
  getAIInsights,
  addAIInsight,
  getMedicalFiles,
  getLabResults,
} from '@/lib/storage';
import type { HealthMetric, PatientProfile, MetricType, AIInsight, MedicalFile, LabResult } from '@/lib/types';
import { METRIC_CONFIGS } from '@/lib/types';
import { formatDateShort, calculateAge, getValueStatus, getStatusColor } from '@/lib/utils';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'files' | 'insights' | 'profile'>('overview');
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  // New metric form
  const [newMetric, setNewMetric] = useState<{
    type: MetricType | '';
    value: string;
    date: string;
    notes: string;
  }>({
    type: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedProfile = getPatientProfile();
    if (!savedProfile) {
      generateDemoData();
    }
    setProfile(getPatientProfile());
    setMetrics(getHealthMetrics());
    setInsights(getAIInsights());
    setFiles(getMedicalFiles());
    setLabResults(getLabResults());
    setLoading(false);
  };

  const handleAddMetric = () => {
    if (!newMetric.type || !newMetric.value) return;

    const config = METRIC_CONFIGS[newMetric.type as MetricType];
    addHealthMetric({
      type: newMetric.type as MetricType,
      value: parseFloat(newMetric.value),
      unit: config.unit,
      date: newMetric.date,
      notes: newMetric.notes,
    });

    setNewMetric({
      type: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    loadData();
  };

  const handleGenerateInsight = async () => {
    // Simulate AI insight generation
    const recentMetrics = metrics.slice(-10);
    const metricTypes = Array.from(new Set(recentMetrics.map((m) => m.type)));

    const demoInsights = [
      {
        type: 'trend_analysis' as const,
        title: 'Blood Pressure Trending Downward',
        description: 'Your blood pressure readings have improved by 8% over the past month. Continue your current medication and lifestyle modifications.',
        severity: 'info' as const,
        relatedMetrics: ['blood_pressure_systolic', 'blood_pressure_diastolic'],
      },
      {
        type: 'recommendation' as const,
        title: 'Consider Vitamin D Supplementation',
        description: 'Based on your recent lab results, your Vitamin D levels are below optimal. Consider discussing supplementation with your healthcare provider.',
        severity: 'warning' as const,
        relatedMetrics: ['vitamin_d'],
      },
      {
        type: 'risk_assessment' as const,
        title: 'Excellent Glucose Control',
        description: 'Your HbA1c and fasting glucose levels are within the normal range, indicating good diabetes management.',
        severity: 'info' as const,
        relatedMetrics: ['glucose', 'hba1c'],
      },
    ];

    const randomInsight = demoInsights[Math.floor(Math.random() * demoInsights.length)];
    addAIInsight({
      ...randomInsight,
      date: new Date().toISOString(),
    });
    loadData();
  };

  const getMetricTrend = (type: MetricType) => {
    const typeMetrics = metrics.filter((m) => m.type === type).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (typeMetrics.length < 2) return null;

    const recent = typeMetrics[typeMetrics.length - 1];
    const previous = typeMetrics[typeMetrics.length - 2];
    const change = ((recent.value - previous.value) / previous.value) * 100;

    return {
      change: change.toFixed(1),
      isImproving: change < 0, // For most metrics, lower is better
      recent: recent.value,
      previous: previous.value,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">HealthTrack AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {profile?.name || 'User'}</span>
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
              { id: 'metrics', label: 'Health Metrics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'files', label: 'Medical Files', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
              { id: 'insights', label: 'AI Insights', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
              { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Health Overview</h1>
              <Button variant="primary" onClick={handleGenerateInsight}>
                Generate AI Insight
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardDescription>Total Metrics</CardDescription>
                  <CardTitle className="text-3xl">{metrics.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Medical Files</CardDescription>
                  <CardTitle className="text-3xl">{files.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Lab Results</CardDescription>
                  <CardTitle className="text-3xl">{labResults.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>AI Insights</CardDescription>
                  <CardTitle className="text-3xl">{insights.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Recent AI Insights */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent AI Insights</h2>
              <div className="space-y-4">
                {insights.slice(-3).reverse().map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {insight.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{formatDateShort(insight.date)}</span>
                          </div>
                          <CardTitle className="text-xl">{insight.title}</CardTitle>
                          <CardDescription className="mt-2">{insight.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {insights.length === 0 && (
                  <Card>
                    <CardHeader>
                      <CardDescription>
                        No insights yet. Click "Generate AI Insight" to analyze your health data.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Metrics */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Health Metrics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {metrics.slice(-6).reverse().map((metric) => {
                  const config = METRIC_CONFIGS[metric.type];
                  const status = getValueStatus(metric.value, config.normalRange);
                  return (
                    <Card key={metric.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardDescription>{config.label}</CardDescription>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <CardTitle className="text-2xl">{metric.value}</CardTitle>
                              <span className="text-gray-600">{metric.unit}</span>
                            </div>
                            <span className="text-sm text-gray-500">{formatDateShort(metric.date)}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Health Metrics</h1>
              <p className="text-gray-600">Track and monitor your vital health metrics over time</p>
            </div>

            {/* Add New Metric */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Metric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Metric Type</label>
                    <select
                      value={newMetric.type}
                      onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value as MetricType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a metric...</option>
                      {Object.entries(METRIC_CONFIGS).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Value</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={newMetric.date}
                      onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="primary" onClick={handleAddMetric} className="w-full">
                      Add Metric
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <Input
                    type="text"
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                    placeholder="e.g., Fasting, After meal, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metrics by Category */}
            {['vital', 'blood_test', 'body_composition'].map((category) => {
              const categoryMetrics = Object.entries(METRIC_CONFIGS).filter(([_, config]) => config.category === category);
              if (categoryMetrics.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-2xl font-bold mb-4 capitalize">{category.replace('_', ' ')} Metrics</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {categoryMetrics.map(([type, config]) => {
                      const typeMetrics = metrics.filter((m) => m.type === type);
                      const latest = typeMetrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                      return (
                        <Card key={type}>
                          <CardHeader>
                            <CardDescription>{config.label}</CardDescription>
                            {latest ? (
                              <>
                                <div className="flex items-baseline space-x-2">
                                  <CardTitle className="text-3xl">{latest.value}</CardTitle>
                                  <span className="text-gray-600">{config.unit}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-gray-500">{formatDateShort(latest.date)}</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    getStatusColor(getValueStatus(latest.value, config.normalRange))
                                  }`}>
                                    {getValueStatus(latest.value, config.normalRange)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Normal range: {config.normalRange.min} - {config.normalRange.max} {config.unit}
                                </div>
                              </>
                            ) : (
                              <CardDescription>No data yet</CardDescription>
                            )}
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Medical Files</h1>
                <p className="text-gray-600">Upload and manage your medical documents, scans, and lab reports</p>
              </div>
              <Button variant="primary">Upload File</Button>
            </div>

            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Medical Files</CardTitle>
                <CardDescription>
                  Supports DICOM scans, PDF lab reports, images, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Drag and drop files here</p>
                  <p className="text-gray-600 mb-4">or click to browse</p>
                  <Button variant="outline">Select Files</Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  This is a demo interface. In production, files would be uploaded to secure cloud storage.
                </p>
              </CardContent>
            </Card>

            {/* Recent Lab Results */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Lab Results</h2>
              <div className="space-y-4">
                {labResults.map((result) => (
                  <Card key={result.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{result.testName}</CardTitle>
                          <CardDescription>
                            {formatDateShort(result.date)} • {result.labName || 'Lab'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.results.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="font-medium">{item.biomarker}</span>
                            <div className="flex items-center space-x-4">
                              <span>{item.value} {item.unit}</span>
                              <span className="text-sm text-gray-500">{item.normalRange}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">AI-Powered Health Insights</h1>
                <p className="text-gray-600">Personalized analysis and recommendations based on your health data</p>
              </div>
              <Button variant="primary" onClick={handleGenerateInsight}>
                Generate New Insight
              </Button>
            </div>

            {/* Insights */}
            <div className="space-y-4">
              {insights.reverse().map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{formatDateShort(insight.date)}</span>
                        </div>
                        <CardTitle className="text-2xl mb-2">{insight.title}</CardTitle>
                        <CardDescription className="text-base">{insight.description}</CardDescription>
                        {insight.relatedMetrics.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Related Metrics:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.relatedMetrics.map((metricType) => (
                                <span key={metricType} className="px-2 py-1 bg-gray-100 rounded text-sm">
                                  {METRIC_CONFIGS[metricType as MetricType]?.label || metricType}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {insights.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No insights yet</CardTitle>
                    <CardDescription>
                      Click "Generate New Insight" to analyze your health data and receive personalized recommendations.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && profile && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Patient Profile</h1>
              <p className="text-gray-600">View and manage your personal health information</p>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <p className="text-lg">{profile.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <p className="text-lg">{formatDateShort(profile.dateOfBirth)} ({calculateAge(profile.dateOfBirth)} years old)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <p className="text-lg capitalize">{profile.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Type</label>
                    <p className="text-lg">{profile.bloodType || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies.map((allergy, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Medical Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.conditions.map((condition, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Medications</label>
                    <div className="space-y-3">
                      {profile.medications.map((med) => (
                        <div key={med.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{med.name}</h3>
                            <span className="text-sm text-gray-600">Since {formatDateShort(med.startDate)}</span>
                          </div>
                          <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                          {med.notes && <p className="text-sm text-gray-500 mt-1">{med.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {profile.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <p className="text-lg">{profile.emergencyContact.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Relationship</label>
                      <p className="text-lg">{profile.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <p className="text-lg">{profile.emergencyContact.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
