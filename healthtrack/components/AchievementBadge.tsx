// Achievement Badge Component
// Displays gamification achievements with progress tracking
'use client';

import { Achievement } from '@/lib/gamification';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export default function AchievementBadge({
  achievement,
  size = 'medium',
  showProgress = true,
}: AchievementBadgeProps) {
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-5xl',
  };

  const levelColors = {
    bronze: 'from-orange-700 to-orange-500',
    silver: 'from-gray-400 to-gray-200',
    gold: 'from-yellow-500 to-yellow-300',
    platinum: 'from-blue-400 to-blue-200',
    diamond: 'from-purple-400 to-pink-300',
  };

  const levelBorders = {
    bronze: 'border-orange-600',
    silver: 'border-gray-400',
    gold: 'border-yellow-500',
    platinum: 'border-blue-400',
    diamond: 'border-purple-500',
  };

  const isUnlocked = achievement.unlockedAt !== undefined;
  const progress = achievement.progress || (achievement.current / achievement.requirement) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative ${sizeClasses[size]} rounded-full border-4 ${
          levelBorders[achievement.level]
        } ${isUnlocked ? `bg-gradient-to-br ${levelColors[achievement.level]}` : 'bg-gray-200'}
        flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
          !isUnlocked && 'opacity-50 grayscale'
        }`}
      >
        <span className="select-none">{achievement.icon}</span>

        {isUnlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="text-center max-w-[150px]">
        <p className="font-semibold text-sm text-gray-900">{achievement.name}</p>
        <p className="text-xs text-gray-600">{achievement.description}</p>
        <p className="text-xs font-medium text-blue-600 mt-1">{achievement.points} points</p>

        {showProgress && !isUnlocked && (
          <div className="mt-2 w-full">
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span>
                {achievement.current}/{achievement.requirement}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${levelColors[achievement.level]} transition-all duration-500`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        )}

        {isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-gray-500 mt-1">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

// Achievement Grid Component
interface AchievementGridProps {
  achievements: Achievement[];
  showLockedAchievements?: boolean;
}

export function AchievementGrid({ achievements, showLockedAchievements = true }: AchievementGridProps) {
  const displayAchievements = showLockedAchievements
    ? achievements
    : achievements.filter((a) => a.unlockedAt);

  const unlocked = achievements.filter((a) => a.unlockedAt).length;
  const total = achievements.length;
  const totalPoints = achievements
    .filter((a) => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Achievement Progress</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{unlocked}</p>
            <p className="text-sm opacity-90">Unlocked</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{total - unlocked}</p>
            <p className="text-sm opacity-90">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{totalPoints}</p>
            <p className="text-sm opacity-90">Total Points</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{Math.round((unlocked / total) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(unlocked / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {displayAchievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {displayAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No achievements yet.</p>
          <p className="text-sm mt-2">Start tracking your health to unlock achievements!</p>
        </div>
      )}
    </div>
  );
}

// Recent Achievement Toast
interface RecentAchievementProps {
  achievement: Achievement;
  onClose: () => void;
}

export function RecentAchievementToast({ achievement, onClose }: RecentAchievementProps) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white rounded-lg shadow-2xl border-4 border-yellow-400 p-6 max-w-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${
                achievement.level === 'diamond'
                  ? 'from-purple-400 to-pink-300'
                  : achievement.level === 'platinum'
                  ? 'from-blue-400 to-blue-200'
                  : achievement.level === 'gold'
                  ? 'from-yellow-500 to-yellow-300'
                  : achievement.level === 'silver'
                  ? 'from-gray-400 to-gray-200'
                  : 'from-orange-700 to-orange-500'
              } flex items-center justify-center text-4xl border-4 border-white shadow-lg`}
            >
              {achievement.icon}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
              Achievement Unlocked! 🎉
            </p>
            <h4 className="text-lg font-bold text-gray-900 mt-1">{achievement.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
            <p className="text-sm font-semibold text-blue-600 mt-2">+{achievement.points} points</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
