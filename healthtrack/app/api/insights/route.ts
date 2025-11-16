import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { metrics, profile, labResults } = await request.json();

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    // Prepare health data summary for Claude
    const healthSummary = `
Patient Health Data Summary:

Demographics:
- Age: ${profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : 'Unknown'}
- Gender: ${profile?.gender || 'Unknown'}
- Medical Conditions: ${profile?.conditions?.join(', ') || 'None reported'}
- Current Medications: ${profile?.medications?.map((m: any) => `${m.name} (${m.dosage})`).join(', ') || 'None'}

Recent Health Metrics (last 30 days):
${formatMetricsForAI(metrics)}

Recent Lab Results:
${formatLabResultsForAI(labResults)}

Please analyze this health data and provide:
1. Key trends or patterns you notice
2. Any potential health risks or areas of concern
3. Specific, actionable recommendations
4. Positive observations about improving metrics

Format your response as a JSON object with the following structure:
{
  "insights": [
    {
      "type": "trend_analysis" | "risk_assessment" | "recommendation" | "anomaly_detection",
      "title": "Short, clear title",
      "description": "Detailed explanation",
      "severity": "info" | "warning" | "critical",
      "relatedMetrics": ["metric_type1", "metric_type2"]
    }
  ]
}

Provide 2-4 insights based on the available data.
`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: healthSummary,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function formatMetricsForAI(metrics: any[]): string {
  if (!metrics || metrics.length === 0) return 'No metrics recorded';

  // Group by type
  const grouped = metrics.reduce((acc: any, metric: any) => {
    if (!acc[metric.type]) {
      acc[metric.type] = [];
    }
    acc[metric.type].push(metric);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([type, values]: [string, any]) => {
      const sortedValues = values.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 5); // Last 5 readings

      return `${type}:\n${sortedValues.map((v: any) =>
        `  - ${v.date}: ${v.value} ${v.unit}${v.notes ? ` (${v.notes})` : ''}`
      ).join('\n')}`;
    })
    .join('\n\n');
}

function formatLabResultsForAI(labResults: any[]): string {
  if (!labResults || labResults.length === 0) return 'No lab results available';

  return labResults
    .map((result: any) => {
      const items = result.results
        .map((item: any) =>
          `  - ${item.biomarker}: ${item.value} ${item.unit} (Normal: ${item.normalRange}) [${item.status}]`
        )
        .join('\n');

      return `${result.testName} (${result.date}):\n${items}`;
    })
    .join('\n\n');
}
