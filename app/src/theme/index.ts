export { createAppTheme } from './createTheme';
export { defaultTheme, darkTheme, musicTheme, themes } from './themes';
export type { ThemeConfig, ThemeColors } from './types';

/**
 * Get a theme by name
 * @param themeName - Name of the theme to retrieve
 * @returns ThemeConfig or defaultTheme if not found
 */
export const getTheme = (themeName: string = 'default') => {
  return themes[themeName] || defaultTheme;
};

