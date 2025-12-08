import { ThemeConfig } from './types';

/**
 * Theme Configuration System
 * 
 * To add a new theme:
 * 1. Create a new ThemeConfig object following the structure below
 * 2. Add it to the themes Record at the bottom of this file
 * 3. Optionally update App.tsx to allow theme selection (e.g., from user preferences, URL params, etc.)
 * 
 * Example:
 * export const myNewTheme: ThemeConfig = {
 *   name: 'myNewTheme',
 *   mode: 'light', // or 'dark'
 *   colors: {
 *     primary: '#your-color',
 *     secondary: '#your-color',
 *     background: '#your-color',
 *     surface: '#your-color',
 *     text: { primary: '#your-color', secondary: '#your-color' },
 *     // Optional semantic colors
 *     error: '#your-color',
 *     warning: '#your-color',
 *     info: '#your-color',
 *     success: '#your-color',
 *   },
 * };
 */

export const defaultTheme: ThemeConfig = {
  name: 'default',
  mode: 'light',
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1',
    success: '#2e7d32',
  },
};

// Example: Dark theme (ready for future use)
export const darkTheme: ThemeConfig = {
  name: 'dark',
  mode: 'dark',
  colors: {
    primary: '#90caf9',
    secondary: '#f48fb1',
    background: '#121212',
    surface: '#1e1e1e',
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: '#ef5350',
    warning: '#ffa726',
    info: '#42a5f5',
    success: '#66bb6a',
  },
};

// Example: Music-themed color scheme (ready for future use)
export const musicTheme: ThemeConfig = {
  name: 'music',
  mode: 'light',
  colors: {
    primary: '#9c27b0', // Purple
    secondary: '#ff9800', // Orange
    background: '#ffffff',
    surface: '#f3e5f5',
    text: {
      primary: '#1a1a1a',
      secondary: '#6a6a6a',
    },
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1',
    success: '#2e7d32',
  },
};

// Export all available themes
export const themes: Record<string, ThemeConfig> = {
  default: defaultTheme,
  dark: darkTheme,
  music: musicTheme,
};

