// Health Score Dashboard Component
// Displays comprehensive health score with category breakdowns
'use client';

import { HealthScore } from '@/lib/analytics';

interface HealthScoreDashboardProps {
  healthScore: HealthScore;
}

export default function HealthScoreDashboard({ healthScore }: HealthScoreDashboardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-green-400';
    if (score >= 60) return 'from-yellow-500 to-yellow-400';
    if (score >= 40) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining'): JSX.Element => {
    if (trend === 'improving') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (trend === 'declining') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const categoryIcons = {
    cardiovascular: '❤️',
    metabolic: '🩸',
    body_composition: '⚖️',
    respiratory: '🫁',
    mental: '🧠',
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${getScoreGradient(healthScore.overallScore)} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Overall Health Score</h2>
              <p className="text-white/90 text-sm">Based on your recent health metrics</p>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(healthScore.trend)}
              <span className="text-sm font-medium capitalize">{healthScore.trend}</span>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-6xl font-bold">{healthScore.overallScore}</span>
            <span className="text-3xl font-semibold">/100</span>
          </div>

          <div className="mt-2">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
              {getScoreLabel(healthScore.overallScore)}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown</h3>

          {Object.entries(healthScore.categoryScores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {category.replace('_', ' ')}
                  </span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements Section */}
      {healthScore.improvements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {healthScore.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns Section */}
      {healthScore.concerns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Health Concerns
          </h3>
          <ul className="space-y-2">
            {healthScore.concerns.map((concern, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">⚠️</span>
                <span className="text-red-900">{concern}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
            <p className="text-sm text-red-900">
              <strong>Important:</strong> Please consult with your healthcare provider about these
              concerns. This dashboard is for informational purposes only and should not replace
              professional medical advice.
            </p>
          </div>
        </div>
      )}

      {/* Score Explanation */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How is this calculated?</h3>
        <p className="text-sm text-blue-800 mb-3">
          Your health score is calculated based on your recent health metrics across multiple
          categories:
        </p>
        <ul className="space-y-1 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <span>•</span>
            <span>
              <strong>Cardiovascular:</strong> Heart rate, blood pressure, and cholesterol levels
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span>•</span>
            <span>
              <strong>Metabolic:</strong> Blood glucose, HbA1c, and metabolic markers
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span>•</span>
            <span>
              <strong>Body Composition:</strong> Weight, BMI, body fat percentage, and waist
              circumference
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span>•</span>
            <span>
              <strong>Respiratory:</strong> Oxygen saturation and respiratory rate
            </span>
          </li>
        </ul>
        <p className="text-xs text-blue-700 mt-4">
          Scores are weighted based on medical importance. Track metrics regularly for the most
          accurate score.
        </p>
      </div>
    </div>
  );
}

// Compact Health Score Widget
interface HealthScoreWidgetProps {
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'small' | 'medium' | 'large';
}

export function HealthScoreWidget({ score, trend, size = 'medium' }: HealthScoreWidgetProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-green-400';
    if (score >= 60) return 'from-yellow-500 to-yellow-400';
    if (score >= 40) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  const sizeClasses = {
    small: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    medium: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    large: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-base' },
  };

  const classes = sizeClasses[size];

  // Calculate circle progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className={classes.container} viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          className="transition-all duration-500"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={`transition-all duration-500 bg-gradient-to-r ${getScoreColor(score)}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            stroke: 'url(#gradient)',
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : '#f97316'} />
            <stop offset="100%" stopColor={score >= 80 ? '#059669' : score >= 60 ? '#ca8a04' : '#ea580c'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${classes.text} text-gray-900`}>{score}</span>
        <span className={`${classes.label} text-gray-600`}>Health</span>
      </div>
    </div>
  );
}
