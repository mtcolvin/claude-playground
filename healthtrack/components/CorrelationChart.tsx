// Correlation Analysis Chart Component
// Visualizes correlations between different health metrics
'use client';

import { CorrelationResult } from '@/lib/analytics';
import { METRIC_CONFIGS } from '@/lib/types';

interface CorrelationChartProps {
  correlations: CorrelationResult[];
  onSelectCorrelation?: (correlation: CorrelationResult) => void;
}

export default function CorrelationChart({ correlations, onSelectCorrelation }: CorrelationChartProps) {
  const getCorrelationColor = (correlation: number): string => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return correlation > 0 ? 'bg-green-600' : 'bg-red-600';
    if (absCorr >= 0.5) return correlation > 0 ? 'bg-green-500' : 'bg-red-500';
    if (absCorr >= 0.3) return correlation > 0 ? 'bg-green-400' : 'bg-red-400';
    return 'bg-gray-400';
  };

  const getCorrelationStrength = (correlation: number): string => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return 'Very Strong';
    if (absCorr >= 0.5) return 'Strong';
    if (absCorr >= 0.3) return 'Moderate';
    return 'Weak';
  };

  const getSignificanceLabel = (pValue: number): string => {
    if (pValue < 0.001) return 'Highly Significant (p < 0.001)';
    if (pValue < 0.01) return 'Very Significant (p < 0.01)';
    if (pValue < 0.05) return 'Significant (p < 0.05)';
    return 'Not Significant';
  };

  const sortedCorrelations = [...correlations].sort(
    (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Metric Correlations</h3>
        <p className="text-sm text-gray-800 mb-6">
          Discover relationships between your health metrics. Positive correlations (green) mean
          metrics increase together. Negative correlations (red) mean one increases as the other
          decreases.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-xs text-gray-700">Strong Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-xs text-gray-700">Moderate Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-700">Weak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-xs text-gray-700">Moderate Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs text-gray-700">Strong Negative</span>
          </div>
        </div>

        {/* Correlation List */}
        <div className="space-y-3">
          {sortedCorrelations.map((corr, index) => {
            const metric1Label = METRIC_CONFIGS[corr.metric1]?.label || corr.metric1;
            const metric2Label = METRIC_CONFIGS[corr.metric2]?.label || corr.metric2;
            const isSignificant = corr.pValue < 0.05;

            return (
              <div
                key={`${corr.metric1}-${corr.metric2}`}
                className={`p-4 border rounded-lg transition-all ${
                  onSelectCorrelation
                    ? 'cursor-pointer hover:shadow-md hover:border-blue-400'
                    : ''
                } ${isSignificant ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                onClick={() => onSelectCorrelation?.(corr)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {metric1Label} ↔ {metric2Label}
                    </h4>
                    <p className="text-xs text-gray-800 mt-1">{corr.interpretation}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {corr.correlation > 0 ? '+' : ''}
                        {corr.correlation.toFixed(2)}
                      </span>
                      {isSignificant && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-800 mt-1">
                      {getCorrelationStrength(corr.correlation)}
                    </p>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-400"></div>
                  <div
                    className={`absolute inset-y-0 ${getCorrelationColor(
                      corr.correlation
                    )} transition-all duration-500 ${
                      corr.correlation > 0 ? 'left-1/2' : 'right-1/2'
                    }`}
                    style={{
                      width: `${(Math.abs(corr.correlation) / 2) * 100}%`,
                    }}
                  ></div>
                </div>

                {/* Statistical Significance */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={isSignificant ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                    {getSignificanceLabel(corr.pValue)}
                  </span>
                  {corr.sampleSize && (
                    <span className="text-gray-700">n = {corr.sampleSize} data points</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sortedCorrelations.length === 0 && (
          <div className="text-center py-12 text-gray-700">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-medium">No correlations found</p>
            <p className="text-sm mt-2">
              Track at least two different metrics over time to see correlations.
            </p>
          </div>
        )}
      </div>

      {/* Understanding Correlations */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Understanding Correlations</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Correlation coefficient:</strong> Ranges from -1 to +1. Values closer to -1 or
            +1 indicate stronger relationships.
          </p>
          <p>
            <strong>Positive correlation (+):</strong> Both metrics tend to increase or decrease
            together. Example: Exercise and improved cardiovascular health.
          </p>
          <p>
            <strong>Negative correlation (-):</strong> As one metric increases, the other tends to
            decrease. Example: Weight and mobility.
          </p>
          <p>
            <strong>Statistical significance:</strong> p-value &lt; 0.05 means the correlation is
            unlikely due to random chance.
          </p>
          <p className="mt-3 text-xs text-blue-700">
            ⚠️ <strong>Important:</strong> Correlation does not imply causation. These
            relationships should be discussed with your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}

// Correlation Heatmap (simplified grid view)
interface CorrelationHeatmapProps {
  correlations: CorrelationResult[];
  metrics: string[];
}

export function CorrelationHeatmap({ correlations, metrics }: CorrelationHeatmapProps) {
  const getCorrelationValue = (metric1: string, metric2: string): number | null => {
    const corr = correlations.find(
      (c) =>
        (c.metric1 === metric1 && c.metric2 === metric2) ||
        (c.metric1 === metric2 && c.metric2 === metric1)
    );
    return corr ? corr.correlation : null;
  };

  const getCellColor = (correlation: number | null): string => {
    if (correlation === null) return 'bg-gray-100';
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7)
      return correlation > 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
    if (absCorr >= 0.5)
      return correlation > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
    if (absCorr >= 0.3)
      return correlation > 0 ? 'bg-green-300 text-gray-900' : 'bg-red-300 text-gray-900';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Correlation Heatmap</h3>
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300 bg-gray-50 sticky left-0 z-10"></th>
              {metrics.map((metric) => (
                <th
                  key={metric}
                  className="p-2 border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-700 min-w-[80px]"
                >
                  <div className="transform -rotate-45 origin-left whitespace-nowrap">
                    {METRIC_CONFIGS[metric as keyof typeof METRIC_CONFIGS]?.label || metric}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric1) => (
              <tr key={metric1}>
                <th className="p-2 border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-700 text-left sticky left-0 z-10">
                  {METRIC_CONFIGS[metric1 as keyof typeof METRIC_CONFIGS]?.label || metric1}
                </th>
                {metrics.map((metric2) => {
                  if (metric1 === metric2) {
                    return (
                      <td
                        key={metric2}
                        className="p-2 border border-gray-300 bg-gray-800 text-white text-center font-bold"
                      >
                        1.00
                      </td>
                    );
                  }
                  const correlation = getCorrelationValue(metric1, metric2);
                  return (
                    <td
                      key={metric2}
                      className={`p-2 border border-gray-300 text-center font-semibold text-sm ${getCellColor(
                        correlation
                      )}`}
                    >
                      {correlation !== null ? correlation.toFixed(2) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
