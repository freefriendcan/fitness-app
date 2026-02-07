/**
 * ThemeProvider Component
 * Wraps the application with theme context and handles theme initialization
 */

import React, { useEffect } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import { ThemeProvider as ThemeContextProvider } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store';
import type { Theme } from '@/constants/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const InnerThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themePreference = useUserStore((state) => state.getTheme());

  return (
    <ThemeContextProvider initialTheme={themePreference}>
      <ThemedApp>{children}</ThemedApp>
    </ThemeContextProvider>
  );
};

const ThemedApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </>
  );
};

// Import useTheme here to avoid circular dependency
import { useTheme } from '@/hooks/useTheme';

/**
 * Main ThemeProvider component
 * Integrates with userStore for theme persistence
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <InnerThemeProvider>{children}</InnerThemeProvider>;
};
