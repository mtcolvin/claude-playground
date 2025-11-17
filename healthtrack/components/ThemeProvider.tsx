// Dark Mode Theme Provider
// Research: Dark mode reduces eye strain and improves accessibility for light sensitivity
// 2025 healthcare UX trend: 70% of users prefer dark mode option
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('healthtrack_theme') as Theme;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setThemeState(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setActualTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update theme when preference changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Determine actual theme to apply
    let appliedTheme: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appliedTheme = prefersDark ? 'dark' : 'light';

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light');
        root.classList.toggle('dark', e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      appliedTheme = theme;
    }

    setActualTheme(appliedTheme);
    root.classList.toggle('dark', appliedTheme === 'dark');
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('healthtrack_theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme Toggle Button Component
export function ThemeToggle() {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (actualTheme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    return actualTheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
      title={`Current: ${getLabel()}. Click to cycle through Light → Dark → System`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{getLabel()}</span>
    </button>
  );
}

// Theme-aware component wrapper
interface ThemedCardProps {
  children: ReactNode;
  className?: string;
}

export function ThemedCard({ children, className = '' }: ThemedCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

// Global CSS for dark mode (add to globals.css)
export const darkModeStyles = `
/* Dark Mode Variables */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-accent: #2563eb;
}

.dark {
  --color-bg-primary: #1f2937;
  --color-bg-secondary: #111827;
  --color-bg-tertiary: #374151;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-border: #4b5563;
  --color-accent: #3b82f6;
}

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

/* Dark mode scrollbar */
.dark::-webkit-scrollbar {
  width: 12px;
}

.dark::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 6px;
}

.dark::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Dark mode specific utilities */
.dark .prose {
  color: var(--color-text-primary);
}

.dark .prose h1,
.dark .prose h2,
.dark .prose h3,
.dark .prose h4 {
  color: var(--color-text-primary);
}

.dark .prose a {
  color: var(--color-accent);
}

/* Dark mode chart adjustments */
.dark .recharts-cartesian-grid-horizontal line,
.dark .recharts-cartesian-grid-vertical line {
  stroke: #4b5563;
}

.dark .recharts-text {
  fill: #d1d5db;
}

/* Dark mode form inputs */
.dark input,
.dark textarea,
.dark select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark input:focus,
.dark textarea:focus,
.dark select:focus {
  border-color: #3b82f6;
  ring-color: #3b82f6;
}

.dark input::placeholder,
.dark textarea::placeholder {
  color: #9ca3af;
}

/* Dark mode buttons */
.dark .btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.dark .btn-primary:hover {
  background-color: #2563eb;
}

.dark .btn-secondary {
  background-color: #4b5563;
  color: #f9fafb;
}

.dark .btn-secondary:hover {
  background-color: #6b7280;
}
`;
