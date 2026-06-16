import { ThemeModeProvider } from './ThemeModeContext';

export default function AppThemeProvider({ children }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}
