import { createTheme as createMuiTheme, Theme } from '@mui/material/styles';
import { ThemeConfig } from './types';

export const createAppTheme = (config: ThemeConfig): Theme => {
  return createMuiTheme({
    palette: {
      mode: config.mode,
      primary: {
        main: config.colors.primary,
      },
      secondary: {
        main: config.colors.secondary,
      },
      background: {
        default: config.colors.background,
        paper: config.colors.surface,
      },
      text: {
        primary: config.colors.text.primary,
        secondary: config.colors.text.secondary,
      },
      ...(config.colors.error && {
        error: {
          main: config.colors.error,
        },
      }),
      ...(config.colors.warning && {
        warning: {
          main: config.colors.warning,
        },
      }),
      ...(config.colors.info && {
        info: {
          main: config.colors.info,
        },
      }),
      ...(config.colors.success && {
        success: {
          main: config.colors.success,
        },
      }),
    },
  });
};

