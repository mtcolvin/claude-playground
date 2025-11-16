// Mental Health Tracking Module
// Research: Mood tracking apps reduce depression symptoms by 30-40%
// PHQ-9 has 88% sensitivity for major depression
// GAD-7 has 89% sensitivity for generalized anxiety disorder

export type MoodType = 'excellent' | 'good' | 'okay' | 'low' | 'poor';
export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
export type StressLevel = 'none' | 'mild' | 'moderate' | 'high' | 'severe';

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  sleepQuality: SleepQuality;
  sleepHours: number;
  stressLevel: StressLevel;
  energy: number; // 1-10
  anxiety: number; // 1-10
  notes?: string;
  activities?: string[]; // e.g., 'exercise', 'meditation', 'social'
  triggers?: string[]; // e.g., 'work', 'family', 'health'
}

export interface PHQ9Assessment {
  id: string;
  date: string;
  answers: number[]; // 0-3 for each of 9 questions
  totalScore: number; // 0-27
  severity: 'none' | 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  recommendation: string;
}

export interface GAD7Assessment {
  id: string;
  date: string;
  answers: number[]; // 0-3 for each of 7 questions
  totalScore: number; // 0-21
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  recommendation: string;
}

export interface PSSAssessment {
  id: string;
  date: string;
  answers: number[]; // 0-4 for each of 10 questions
  totalScore: number; // 0-40
  level: 'low' | 'moderate' | 'high';
  recommendation: string;
}

export interface MoodPattern {
  averageMood: number; // 1-5 scale
  moodVariability: number; // Standard deviation
  sleepCorrelation: number; // -1 to 1
  stressCorrelation: number;
  energyCorrelation: number;
  bestDays: string[]; // Days of week with best mood
  worstDays: string[];
  commonTriggers: { trigger: string; count: number }[];
  helpfulActivities: { activity: string; moodImprovement: number }[];
}

// PHQ-9 Questions (Patient Health Questionnaire for Depression)
export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling/staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking slowly, or being fidgety/restless',
  'Thoughts that you would be better off dead or hurting yourself',
];

// GAD-7 Questions (Generalized Anxiety Disorder)
export const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it\'s hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
];

// PSS-10 Questions (Perceived Stress Scale)
export const PSS10_QUESTIONS = [
  'Been upset because of something that happened unexpectedly?',
  'Felt that you were unable to control important things in your life?',
  'Felt nervous and stressed?',
  'Felt confident about your ability to handle personal problems?', // Reverse scored
  'Felt that things were going your way?', // Reverse scored
  'Found that you could not cope with all the things you had to do?',
  'Been able to control irritations in your life?', // Reverse scored
  'Felt that you were on top of things?', // Reverse scored
  'Been angered because of things outside your control?',
  'Felt difficulties were piling up so high you could not overcome them?',
];

// Calculate PHQ-9 score and severity
export function calculatePHQ9(answers: number[]): Omit<PHQ9Assessment, 'id' | 'date' | 'answers'> {
  if (answers.length !== 9) {
    throw new Error('PHQ-9 requires exactly 9 answers');
  }

  const totalScore = answers.reduce((sum, score) => sum + score, 0);

  let severity: PHQ9Assessment['severity'];
  let recommendation: string;

  if (totalScore <= 4) {
    severity = 'none';
    recommendation = 'No depression. Continue monitoring your mental health.';
  } else if (totalScore <= 9) {
    severity = 'minimal';
    recommendation = 'Minimal depression. Consider lifestyle changes and stress management.';
  } else if (totalScore <= 14) {
    severity = 'mild';
    recommendation = 'Mild depression. Consider counseling or therapy. Monitor symptoms.';
  } else if (totalScore <= 19) {
    severity = 'moderate';
    recommendation = 'Moderate depression. Recommend professional treatment and possible medication.';
  } else if (totalScore <= 23) {
    severity = 'moderately_severe';
    recommendation = 'Moderately severe depression. Professional treatment strongly recommended.';
  } else {
    severity = 'severe';
    recommendation = 'Severe depression. Immediate professional intervention recommended.';
  }

  // Check question 9 (self-harm)
  if (answers[8] > 0) {
    recommendation += ' ALERT: Self-harm thoughts detected. Seek immediate professional help or call crisis hotline.';
  }

  return { totalScore, severity, recommendation };
}

// Calculate GAD-7 score and severity
export function calculateGAD7(answers: number[]): Omit<GAD7Assessment, 'id' | 'date' | 'answers'> {
  if (answers.length !== 7) {
    throw new Error('GAD-7 requires exactly 7 answers');
  }

  const totalScore = answers.reduce((sum, score) => sum + score, 0);

  let severity: GAD7Assessment['severity'];
  let recommendation: string;

  if (totalScore <= 4) {
    severity = 'minimal';
    recommendation = 'Minimal anxiety. Continue healthy stress management practices.';
  } else if (totalScore <= 9) {
    severity = 'mild';
    recommendation = 'Mild anxiety. Consider relaxation techniques, exercise, and mindfulness.';
  } else if (totalScore <= 14) {
    severity = 'moderate';
    recommendation = 'Moderate anxiety. Recommend counseling or therapy. Consider professional evaluation.';
  } else {
    severity = 'severe';
    recommendation = 'Severe anxiety. Professional treatment strongly recommended. May benefit from medication.';
  }

  return { totalScore, severity, recommendation };
}

// Calculate PSS-10 score and level
export function calculatePSS10(answers: number[]): Omit<PSSAssessment, 'id' | 'date' | 'answers'> {
  if (answers.length !== 10) {
    throw new Error('PSS-10 requires exactly 10 answers');
  }

  // Reverse score items 4, 5, 7, 8 (indices 3, 4, 6, 7)
  const reversedAnswers = answers.map((score, index) => {
    if ([3, 4, 6, 7].includes(index)) {
      return 4 - score; // Reverse the score
    }
    return score;
  });

  const totalScore = reversedAnswers.reduce((sum, score) => sum + score, 0);

  let level: PSSAssessment['level'];
  let recommendation: string;

  if (totalScore <= 13) {
    level = 'low';
    recommendation = 'Low stress level. You are managing stress well. Maintain healthy habits.';
  } else if (totalScore <= 26) {
    level = 'moderate';
    recommendation = 'Moderate stress level. Consider stress reduction techniques like exercise, meditation, or time management.';
  } else {
    level = 'high';
    recommendation = 'High stress level. Important to address stress through lifestyle changes, therapy, or professional support.';
  }

  return { totalScore, level, recommendation };
}

// Analyze mood patterns from mood entries
export function analyzeMoodPatterns(entries: MoodEntry[]): MoodPattern {
  if (entries.length === 0) {
    return {
      averageMood: 0,
      moodVariability: 0,
      sleepCorrelation: 0,
      stressCorrelation: 0,
      energyCorrelation: 0,
      bestDays: [],
      worstDays: [],
      commonTriggers: [],
      helpfulActivities: [],
    };
  }

  // Convert mood to numeric scale (1-5)
  const moodToNumber = (mood: MoodType): number => {
    const map: Record<MoodType, number> = {
      excellent: 5,
      good: 4,
      okay: 3,
      low: 2,
      poor: 1,
    };
    return map[mood];
  };

  const sleepToNumber = (quality: SleepQuality): number => {
    const map: Record<SleepQuality, number> = {
      excellent: 5,
      good: 4,
      fair: 3,
      poor: 2,
      very_poor: 1,
    };
    return map[quality];
  };

  const stressToNumber = (level: StressLevel): number => {
    const map: Record<StressLevel, number> = {
      none: 1,
      mild: 2,
      moderate: 3,
      high: 4,
      severe: 5,
    };
    return map[level];
  };

  // Calculate average mood
  const moodScores = entries.map((e) => moodToNumber(e.mood));
  const averageMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

  // Calculate mood variability (standard deviation)
  const variance = moodScores.reduce((sum, score) => sum + Math.pow(score - averageMood, 2), 0) / moodScores.length;
  const moodVariability = Math.sqrt(variance);

  // Calculate correlations
  const sleepScores = entries.map((e) => sleepToNumber(e.sleepQuality));
  const stressScores = entries.map((e) => stressToNumber(e.stressLevel));
  const energyScores = entries.map((e) => e.energy);

  const sleepCorrelation = calculateSimpleCorrelation(moodScores, sleepScores);
  const stressCorrelation = calculateSimpleCorrelation(moodScores, stressScores);
  const energyCorrelation = calculateSimpleCorrelation(moodScores, energyScores);

  // Analyze best/worst days of week
  const dayScores: Record<string, number[]> = {};
  entries.forEach((entry) => {
    const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!dayScores[day]) dayScores[day] = [];
    dayScores[day].push(moodToNumber(entry.mood));
  });

  const dayAverages = Object.entries(dayScores).map(([day, scores]) => ({
    day,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  dayAverages.sort((a, b) => b.average - a.average);
  const bestDays = dayAverages.slice(0, 2).map((d) => d.day);
  const worstDays = dayAverages.slice(-2).map((d) => d.day);

  // Analyze common triggers
  const triggerCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    entry.triggers?.forEach((trigger) => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
  });

  const commonTriggers = Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Analyze helpful activities (activities that correlate with better mood)
  const activityMoodImpact: Record<string, { totalMood: number; count: number }> = {};
  entries.forEach((entry) => {
    const moodScore = moodToNumber(entry.mood);
    entry.activities?.forEach((activity) => {
      if (!activityMoodImpact[activity]) {
        activityMoodImpact[activity] = { totalMood: 0, count: 0 };
      }
      activityMoodImpact[activity].totalMood += moodScore;
      activityMoodImpact[activity].count += 1;
    });
  });

  const helpfulActivities = Object.entries(activityMoodImpact)
    .map(([activity, data]) => ({
      activity,
      moodImprovement: data.totalMood / data.count - averageMood,
    }))
    .filter((a) => a.moodImprovement > 0)
    .sort((a, b) => b.moodImprovement - a.moodImprovement)
    .slice(0, 5);

  return {
    averageMood,
    moodVariability,
    sleepCorrelation,
    stressCorrelation,
    energyCorrelation,
    bestDays,
    worstDays,
    commonTriggers,
    helpfulActivities,
  };
}

// Simple correlation calculation helper
function calculateSimpleCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX === 0 || denomY === 0) return 0;

  return numerator / Math.sqrt(denomX * denomY);
}

// Generate mental health insights
export function generateMentalHealthInsights(
  moodEntries: MoodEntry[],
  phq9History: PHQ9Assessment[],
  gad7History: GAD7Assessment[]
): string[] {
  const insights: string[] = [];

  if (moodEntries.length === 0) {
    return ['Start tracking your mood daily to gain insights into your mental health patterns.'];
  }

  const patterns = analyzeMoodPatterns(moodEntries);

  // Mood insights
  if (patterns.averageMood >= 4) {
    insights.push('🌟 Your overall mood has been excellent! Keep up the great work.');
  } else if (patterns.averageMood >= 3) {
    insights.push('😊 Your mood is generally positive. Continue your healthy habits.');
  } else if (patterns.averageMood >= 2) {
    insights.push('😐 Your mood has been variable. Consider stress management techniques.');
  } else {
    insights.push('⚠️ Your mood has been low recently. Consider reaching out to a mental health professional.');
  }

  // Variability insights
  if (patterns.moodVariability > 1.5) {
    insights.push('📊 Your mood fluctuates significantly. Tracking triggers can help identify patterns.');
  }

  // Sleep correlation
  if (patterns.sleepCorrelation > 0.5) {
    insights.push('😴 Better sleep strongly correlates with better mood. Prioritize 7-9 hours nightly.');
  } else if (patterns.sleepCorrelation < -0.5) {
    insights.push('⚠️ Poor sleep is impacting your mood. Consider improving sleep hygiene.');
  }

  // Stress correlation
  if (Math.abs(patterns.stressCorrelation) > 0.5) {
    insights.push('😰 Stress levels significantly affect your mood. Try relaxation techniques.');
  }

  // Energy correlation
  if (patterns.energyCorrelation > 0.6) {
    insights.push('⚡ Energy and mood are strongly linked. Regular exercise can help boost both.');
  }

  // Best/worst days
  if (patterns.bestDays.length > 0) {
    insights.push(`📅 You tend to feel best on ${patterns.bestDays.join(' and ')}s.`);
  }
  if (patterns.worstDays.length > 0) {
    insights.push(`📅 ${patterns.worstDays.join(' and ')}s tend to be challenging. Plan self-care activities.`);
  }

  // Common triggers
  if (patterns.commonTriggers.length > 0) {
    const topTrigger = patterns.commonTriggers[0];
    insights.push(`🎯 "${topTrigger.trigger}" is your most common trigger (${topTrigger.count} times). Develop coping strategies.`);
  }

  // Helpful activities
  if (patterns.helpfulActivities.length > 0) {
    const bestActivity = patterns.helpfulActivities[0];
    insights.push(`✨ "${bestActivity.activity}" consistently improves your mood. Do it more often!`);
  }

  // PHQ-9 trends
  if (phq9History.length >= 2) {
    const latest = phq9History[phq9History.length - 1];
    const previous = phq9History[phq9History.length - 2];
    const change = latest.totalScore - previous.totalScore;

    if (change < -3) {
      insights.push('📈 Your PHQ-9 score has improved significantly! Your efforts are paying off.');
    } else if (change > 3) {
      insights.push('📉 Your PHQ-9 score has increased. Consider reaching out for additional support.');
    }
  }

  // GAD-7 trends
  if (gad7History.length >= 2) {
    const latest = gad7History[gad7History.length - 1];
    const previous = gad7History[gad7History.length - 2];
    const change = latest.totalScore - previous.totalScore;

    if (change < -2) {
      insights.push('📈 Your anxiety levels have decreased! Continue your anxiety management practices.');
    } else if (change > 2) {
      insights.push('📉 Your anxiety levels have increased. Try relaxation techniques or seek support.');
    }
  }

  return insights;
}

// Crisis resources
export const CRISIS_RESOURCES = {
  us: {
    suicidePrevention: {
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      text: 'Text 988',
      website: 'https://988lifeline.org',
    },
    crisis: {
      name: 'Crisis Text Line',
      text: 'Text HOME to 741741',
      website: 'https://www.crisistextline.org',
    },
    samhsa: {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Mental health and substance abuse',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
    },
  },
  international: {
    findAHelpline: 'https://findahelpline.com',
  },
};
