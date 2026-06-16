import { createTheme } from '@mui/material/styles';

export const brandColors = {
  accent: '#1e4d2b',
  accentLight: '#2d6b3c',
  accentMuted: '#4a7c59',
  primarySage: '#dce8da',
  primaryMuted: '#c5d4c2',
  primaryForeground: '#1a3d24',
  secondaryCream: '#f5efe6',
  secondaryMuted: '#ebe3d6',
  footerStrip: '#e2e8e1',
  cardCream: '#f4efde',
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: brandColors.accent,
    light: brandColors.accentLight,
    dark: brandColors.primaryForeground,
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ffffff',
    light: '#fafafa',
    dark: '#f5f5f5',
    contrastText: brandColors.primaryForeground,
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: '#171717',
    secondary: '#525252',
  },
  divider: '#e5e5e5',
  success: { main: brandColors.accentLight },
  warning: { main: '#b45309' },
  error: { main: '#dc2626' },
  info: { main: '#1d4ed8' },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: brandColors.accent,
    light: brandColors.accentLight,
    dark: brandColors.primaryForeground,
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#262626',
    light: '#404040',
    dark: '#171717',
    contrastText: '#a7f3d0',
  },
  background: {
    default: '#0a0a0a',
    paper: '#171717',
  },
  text: {
    primary: '#f5f5f5',
    secondary: '#a3a3a3',
  },
  divider: '#404040',
  success: { main: '#4ade80' },
  warning: { main: '#fbbf24' },
  error: { main: '#f87171' },
  info: { main: '#38bdf8' },
};

export function getValmikiTheme(mode = 'light') {
  const isLight = mode === 'light';
  const palette = isLight ? lightPalette : darkPalette;

  return createTheme({
    palette,
    typography: {
      fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif",
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: { fontWeight: 700, color: isLight ? brandColors.accent : '#ffffff' },
      h2: { fontWeight: 700, color: isLight ? brandColors.accent : '#ffffff' },
      h3: { fontWeight: 600, color: isLight ? brandColors.accent : '#ffffff' },
      h4: { fontWeight: 600, color: isLight ? brandColors.accent : '#ffffff' },
      h5: { fontWeight: 600, color: isLight ? brandColors.accent : '#ffffff' },
      h6: { fontWeight: 600, color: isLight ? brandColors.accent : '#ffffff' },
      body1: { color: isLight ? '#171717' : '#f5f5f5' },
      body2: { color: isLight ? '#404040' : '#d4d4d4' },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 10,
    },
    shadows: [
      'none',
      isLight ? '0 4px 24px rgba(30, 77, 43, 0.08)' : '0 4px 24px rgba(0, 0, 0, 0.35)',
      ...Array(23).fill(
        isLight ? '0 4px 24px rgba(30, 77, 43, 0.08)' : '0 4px 24px rgba(0, 0, 0, 0.35)',
      ),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif",
          },
          a: {
            color: isLight ? '#1d4ed8' : '#38bdf8',
            textDecorationColor: isLight ? 'rgba(29, 78, 216, 0.4)' : 'rgba(56, 189, 248, 0.4)',
            '&:hover': {
              color: isLight ? '#1e40af' : '#7dd3fc',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            backgroundColor: isLight ? brandColors.accent : brandColors.accent,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isLight ? brandColors.accentLight : brandColors.accentLight,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight
              ? 'rgba(255, 255, 255, 0.92)'
              : 'rgba(10, 10, 10, 0.96)',
            backdropFilter: 'blur(12px)',
            color: isLight ? brandColors.accent : '#ffffff',
            boxShadow: isLight
              ? '0 4px 24px rgba(30, 77, 43, 0.08)'
              : '0 4px 24px rgba(0, 0, 0, 0.35)',
            borderBottom: `1px solid ${isLight ? '#e5e5e5' : '#262626'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isLight ? '#ffffff' : '#171717',
            border: `1px solid ${isLight ? '#e5e5e5' : '#404040'}`,
            boxShadow: isLight
              ? '0 4px 24px rgba(30, 77, 43, 0.08)'
              : '0 4px 24px rgba(0, 0, 0, 0.35)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              '& fieldset': {
                borderColor: isLight ? '#e5e5e5' : '#404040',
              },
              '&:hover fieldset': {
                borderColor: isLight ? brandColors.accentMuted : '#525252',
              },
              '&.Mui-focused fieldset': {
                borderColor: isLight ? brandColors.accent : brandColors.accentLight,
              },
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: isLight ? '#1d4ed8' : '#38bdf8',
            '&:hover': {
              color: isLight ? '#1e40af' : '#7dd3fc',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  });
}
