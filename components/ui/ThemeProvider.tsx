'use client';

import { createContext, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

// Light mode is built and kept in globals.css (.light) but switched off for now:
// the dashboard ships dark-only and the sidebar toggle is hidden. To bring it
// back, restore the localStorage read/write below and re-render ThemeToggle.
const THEME_ENABLED = false;

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (THEME_ENABLED) return;
    // Clear a `.light` class left over from before the dashboard went dark-only.
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
