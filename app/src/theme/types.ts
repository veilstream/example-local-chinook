export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
  error?: string;
  warning?: string;
  info?: string;
  success?: string;
}

export interface ThemeConfig {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

