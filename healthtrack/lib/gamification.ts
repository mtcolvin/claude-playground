// Gamification System
// Research shows gamification increases engagement by 42% and improves adherence by 60%

import type { HealthMetric, PatientProfile, HealthGoal } from './types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tracking' | 'health' | 'milestone' | 'social' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  unlockedAt?: string;
  progress?: number; // 0-100
  requirement: number;
  current: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastLogDate: string;
  freezesAvailable: number;
  freezesUsed: number;
}

export interface UserPoints {
  total: number;
  thisWeek: number;
  thisMonth: number;
  rank: number; // Percentile 0-100
  level: number; // User level (1-100)
  nextLevelPoints: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  goal: number;
  progress: number;
  reward: number; // points
  expiresAt: string;
  completed: boolean;
}

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress' | 'current'>[] = [
  // Tracking Achievements
  {
    id: 'first_metric',
    name: 'Getting Started',
    description: 'Log your first health metric',
    icon: '🎯',
    category: 'tracking',
    level: 'bronze',
    points: 10,
    requirement: 1,
  },
  {
    id: 'week_streak',
    name: '7-Day Streak',
    description: 'Log metrics for 7 days in a row',
    icon: '🔥',
    category: 'tracking',
    level: 'silver',
    points: 50,
    requirement: 7,
  },
  {
    id: 'month_streak',
    name: '30-Day Streak',
    description: 'Log metrics for 30 days in a row',
    icon: '🔥🔥',
    category: 'tracking',
    level: 'gold',
    points: 200,
    requirement: 30,
  },
  {
    id: 'hundred_metrics',
    name: 'Century Club',
    description: 'Log 100 health metrics',
    icon: '💯',
    category: 'milestone',
    level: 'gold',
    points: 150,
    requirement: 100,
  },
  {
    id: 'thousand_metrics',
    name: 'Data Master',
    description: 'Log 1,000 health metrics',
    icon: '📊',
    category: 'milestone',
    level: 'diamond',
    points: 1000,
    requirement: 1000,
  },

  // Health Achievements
  {
    id: 'first_goal',
    name: 'Goal Setter',
    description: 'Set your first health goal',
    icon: '🎯',
    category: 'health',
    level: 'bronze',
    points: 25,
    requirement: 1,
  },
  {
    id: 'goal_achieved',
    name: 'Goal Crusher',
    description: 'Achieve your first health goal',
    icon: '🏆',
    category: 'health',
    level: 'gold',
    points: 100,
    requirement: 1,
  },
  {
    id: 'bp_normal',
    name: 'Blood Pressure Champion',
    description: 'Maintain normal blood pressure for 30 days',
    icon: '❤️',
    category: 'health',
    level: 'gold',
    points: 200,
    requirement: 30,
  },
  {
    id: 'glucose_control',
    name: 'Glucose Guardian',
    description: 'Keep glucose in range for 30 days',
    icon: '🩸',
    category: 'health',
    level: 'gold',
    points: 200,
    requirement: 30,
  },
  {
    id: 'weight_loss_10',
    name: 'Weight Warrior',
    description: 'Lose 10 pounds',
    icon: '⚖️',
    category: 'health',
    level: 'silver',
    points: 150,
    requirement: 10,
  },

  // Milestone Achievements
  {
    id: 'first_lab',
    name: 'Lab Report',
    description: 'Upload your first lab result',
    icon: '🧪',
    category: 'milestone',
    level: 'bronze',
    points: 50,
    requirement: 1,
  },
  {
    id: 'medication_tracker',
    name: 'Medication Manager',
    description: 'Add 3 medications',
    icon: '💊',
    category: 'milestone',
    level: 'bronze',
    points: 30,
    requirement: 3,
  },
  {
    id: 'appointment_scheduler',
    name: 'Appointment Pro',
    description: 'Schedule 5 appointments',
    icon: '📅',
    category: 'milestone',
    level: 'silver',
    points: 75,
    requirement: 5,
  },

  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: '🌟',
    category: 'special',
    level: 'platinum',
    points: 500,
    requirement: 1,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'All metrics in normal range for 7 days',
    icon: '✨',
    category: 'special',
    level: 'platinum',
    points: 300,
    requirement: 7,
  },
];

// Point values for actions
export const POINT_VALUES = {
  log_metric: 10,
  add_medication: 20,
  upload_file: 50,
  add_lab_result: 75,
  complete_goal: 100,
  maintain_streak_7_days: 200,
  maintain_streak_30_days: 500,
  complete_profile: 50,
  add_appointment: 15,
  add_note: 5,
  share_with_doctor: 25,
  refer_friend: 100,
};

// Calculate user level from total points
export function calculateLevel(totalPoints: number): { level: number; nextLevelPoints: number } {
  // Exponential leveling: Level N requires N^1.5 * 100 points
  let level = 1;
  let requiredPoints = 0;

  while (requiredPoints <= totalPoints && level < 100) {
    level++;
    requiredPoints = Math.floor(Math.pow(level, 1.5) * 100);
  }

  return {
    level: Math.max(1, level - 1),
    nextLevelPoints: requiredPoints,
  };
}

// Check achievements based on user activity
export function checkAchievements(
  metrics: HealthMetric[],
  goals: HealthGoal[],
  profile: PatientProfile | null,
  currentAchievements: Achievement[]
): Achievement[] {
  const unlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach((achievementDef) => {
    // Skip if already unlocked
    if (currentAchievements.some((a) => a.id === achievementDef.id)) {
      return;
    }

    let current = 0;
    let shouldUnlock = false;

    switch (achievementDef.id) {
      case 'first_metric':
        current = metrics.length > 0 ? 1 : 0;
        shouldUnlock = metrics.length >= 1;
        break;

      case 'week_streak':
      case 'month_streak':
        // This would need streak calculation (simplified here)
        const streakDays = calculateStreak(metrics);
        current = streakDays;
        shouldUnlock = streakDays >= achievementDef.requirement;
        break;

      case 'hundred_metrics':
      case 'thousand_metrics':
        current = metrics.length;
        shouldUnlock = metrics.length >= achievementDef.requirement;
        break;

      case 'first_goal':
        current = goals.length > 0 ? 1 : 0;
        shouldUnlock = goals.length >= 1;
        break;

      case 'goal_achieved':
        const completedGoals = goals.filter((g) => g.status === 'completed').length;
        current = completedGoals;
        shouldUnlock = completedGoals >= 1;
        break;

      // Add more achievement logic here
    }

    if (shouldUnlock) {
      unlocked.push({
        ...achievementDef,
        unlockedAt: new Date().toISOString(),
        progress: 100,
        current: achievementDef.requirement,
      });
    }
  });

  return unlocked;
}

// Calculate streak from metrics
export function calculateStreak(metrics: HealthMetric[]): number {
  if (metrics.length === 0) return 0;

  // Sort by date descending
  const sorted = metrics
    .map((m) => new Date(m.date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLog = new Date(sorted[0]);
  lastLog.setHours(0, 0, 0, 0);

  // Check if logged today or yesterday
  const daysSinceLastLog = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastLog > 1) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = new Date(sorted[0]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const checkDate = new Date(sorted[i]);
    checkDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (checkDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = checkDate;
    } else {
      break;
    }
  }

  return streak;
}

// Generate daily/weekly challenges
export function generateChallenges(metrics: HealthMetric[]): Challenge[] {
  const challenges: Challenge[] = [];
  const now = new Date();

  // Daily challenge: Log 3 metrics today
  challenges.push({
    id: 'daily_log_3',
    name: 'Daily Logger',
    description: 'Log 3 different metrics today',
    type: 'daily',
    goal: 3,
    progress: 0, // Would calculate from today's metrics
    reward: 30,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString(),
    completed: false,
  });

  // Weekly challenge: Log every day this week
  challenges.push({
    id: 'weekly_consistent',
    name: 'Consistency Champion',
    description: 'Log at least one metric every day this week',
    type: 'weekly',
    goal: 7,
    progress: 0, // Would calculate from this week's logs
    reward: 200,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay())).toISOString(),
    completed: false,
  });

  // Monthly challenge: Log 100 metrics this month
  challenges.push({
    id: 'monthly_century',
    name: 'Century Challenge',
    description: 'Log 100 metrics this month',
    type: 'monthly',
    goal: 100,
    progress: 0, // Would calculate from this month's logs
    reward: 500,
    expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    completed: false,
  });

  return challenges;
}

// Calculate percentile rank (for leaderboard)
export function calculateRank(userPoints: number, allUserPoints: number[]): number {
  if (allUserPoints.length === 0) return 100;

  const lowerScores = allUserPoints.filter((p) => p < userPoints).length;
  return Math.round((lowerScores / allUserPoints.length) * 100);
}

// Generate motivational message based on progress
export function getMotivationalMessage(streak: number, points: number, level: number): string {
  if (streak >= 30) {
    return "🔥 Incredible! 30-day streak! You're unstoppable!";
  } else if (streak >= 7) {
    return "💪 Great job! Keep that streak alive!";
  } else if (points >= 1000) {
    return "⭐ You're a health tracking champion!";
  } else if (level >= 10) {
    return "🚀 Level " + level + " achieved! Keep climbing!";
  } else if (streak > 0) {
    return "👍 You're on a " + streak + "-day streak. Don't break it!";
  } else {
    return "🌟 Start your tracking journey today!";
  }
}
