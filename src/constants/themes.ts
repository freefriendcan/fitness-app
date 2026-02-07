/**
 * Theme system for the fitness app
 * Supports light and dark themes with comprehensive color palettes
 */

import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary brand colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Secondary colors (accent)
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Success colors
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Danger colors
  danger: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Warning colors
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Neutral colors
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Semantic colors
  white: string;
  black: string;
  transparent: string;

  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
    card: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };

  // Border colors
  border: {
    light: string;
    medium: string;
    dark: string;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  dark: boolean;
}

/**
 * Light theme color palette
 */
const lightColors: ThemeColors = {
  // Primary brand colors (blue)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary colors (energetic orange)
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Success colors (green)
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Danger colors (red)
  danger: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Warning colors (yellow)
  warning: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B',
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17',
  },

  // Neutral colors (grays)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    disabled: '#BDBDBD',
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },
};

/**
 * Dark theme color palette
 * Adjusted for better contrast and reduced eye strain
 */
const darkColors: ThemeColors = {
  // Primary brand colors (lighter for dark mode)
  primary: {
    50: '#0D47A1',
    100: '#1565C0',
    200: '#1976D2',
    300: '#1E88E5',
    400: '#2196F3',
    500: '#42A5F5', // Lighter main primary
    600: '#64B5F6',
    700: '#90CAF9',
    800: '#BBDEFB',
    900: '#E3F2FD',
  },

  // Secondary colors (adjusted for dark mode)
  secondary: {
    50: '#E65100',
    100: '#EF6C00',
    200: '#F57C00',
    300: '#FB8C00',
    400: '#FF9800',
    500: '#FFA726', // Lighter main secondary
    600: '#FFB74D',
    700: '#FFCC80',
    800: '#FFE0B2',
    900: '#FFF3E0',
  },

  // Success colors (adjusted for dark mode)
  success: {
    50: '#1B5E20',
    100: '#2E7D32',
    200: '#388E3C',
    300: '#43A047',
    400: '#4CAF50',
    500: '#66BB6A', // Lighter main success
    600: '#81C784',
    700: '#A5D6A7',
    800: '#C8E6C9',
    900: '#E8F5E9',
  },

  // Danger colors (adjusted for dark mode)
  danger: {
    50: '#B71C1C',
    100: '#C62828',
    200: '#D32F2F',
    300: '#E53935',
    400: '#F44336',
    500: '#EF5350', // Lighter main danger
    600: '#E57373',
    700: '#EF9A9A',
    800: '#FFCDD2',
    900: '#FFEBEE',
  },

  // Warning colors (adjusted for dark mode)
  warning: {
    50: '#F57F17',
    100: '#F9A825',
    200: '#FBC02D',
    300: '#FDD835',
    400: '#FFEB3B',
    500: '#FFEE58', // Lighter main warning
    600: '#FFF176',
    700: '#FFF59D',
    800: '#FFF9C4',
    900: '#FFFDE7',
  },

  // Neutral colors (inverted for dark mode)
  neutral: {
    50: '#212121',
    100: '#424242',
    200: '#616161',
    300: '#757575',
    400: '#9E9E9E',
    500: '#BDBDBD',
    600: '#E0E0E0',
    700: '#EEEEEE',
    800: '#F5F5F5',
    900: '#FAFAFA',
  },

  // Semantic colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Background colors (dark)
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2C2C2C',
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: '#1E1E1E',
  },

  // Text colors (light for dark mode)
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#808080',
    inverse: '#000000',
    disabled: '#616161',
  },

  // Border colors (lighter for dark mode)
  border: {
    light: '#333333',
    medium: '#424242',
    dark: '#616161',
  },
};

/**
 * Theme definitions
 */
export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  dark: false,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  dark: true,
};

/**
 * Get the system theme preference
 */
export const getSystemTheme = (): ThemeMode => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

/**
 * Get theme by mode
 */
export const getTheme = (mode: ThemeMode): Theme => {
  if (mode === 'system') {
    const systemTheme = getSystemTheme();
    return systemTheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};
