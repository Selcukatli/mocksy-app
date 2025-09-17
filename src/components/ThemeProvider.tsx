'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Save theme to localStorage
    if (theme) {
      localStorage.setItem('theme', theme);
    }

    // Determine resolved theme
    let resolved: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      resolved = mediaQuery.matches ? 'dark' : 'light';

      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        resolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        root.classList.toggle('dark', resolved === 'dark');
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      resolved = theme as 'light' | 'dark';
    }

    setResolvedTheme(resolved);
    root.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}