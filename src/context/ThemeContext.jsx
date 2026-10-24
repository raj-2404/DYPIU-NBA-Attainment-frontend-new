import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'nba_theme';
const REDUCED_MOTION_KEY = 'nba_reduced_motion';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  const [reducedMotion, setReducedMotionState] = useState(() => {
    try {
      return localStorage.getItem(REDUCED_MOTION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Apply data-theme to HTML root immediately and reliably
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  }, [theme]);

  // Apply data-reduced-motion to HTML root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-reduced-motion', String(reducedMotion));
    try {
      localStorage.setItem(REDUCED_MOTION_KEY, String(reducedMotion));
    } catch (e) {
      console.warn('Failed to save reduced-motion in localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent('reduced-motion-changed', { detail: { reducedMotion } }));
  }, [reducedMotion]);

  // Synchronize across tabs or external triggers
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_KEY && event.newValue) {
        setThemeState(event.newValue);
      }
      if (event.key === REDUCED_MOTION_KEY) {
        setReducedMotionState(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setReducedMotion = useCallback((value) => {
    setReducedMotionState(Boolean(value));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotionState((prev) => !prev);
  }, []);

  const isDark = theme === 'dark';

  const value = useMemo(
    () => ({
      theme,
      isDark,
      setTheme,
      toggleTheme,
      reducedMotion,
      setReducedMotion,
      toggleReducedMotion,
    }),
    [theme, isDark, setTheme, toggleTheme, reducedMotion, setReducedMotion, toggleReducedMotion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return safe fallback if used outside provider
    const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      theme: isDark ? 'dark' : 'light',
      isDark,
      setTheme: () => {},
      toggleTheme: () => {},
      reducedMotion: false,
      setReducedMotion: () => {},
      toggleReducedMotion: () => {},
    };
  }
  return context;
}

export default ThemeContext;
