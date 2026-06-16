import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { appGlobalCss } from './appGlobalCss';
import { getValmikiTheme } from './valmikiTheme';

const STORAGE_KEY = 'valmiki-theme';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
});

function getInitialMode() {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', mode === 'light' ? '#fafafa' : '#0a0a0a');
  }, [mode]);

  const toggleMode = () => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => getValmikiTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={appGlobalCss} />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
