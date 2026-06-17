import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'context/AuthContext';
import { ThemeModeProvider } from 'context/ThemeContext';
import AppRoutes from 'routes/Routes';

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

