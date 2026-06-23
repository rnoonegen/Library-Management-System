import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'context/AuthContext';
import { NotificationProvider } from 'context/NotificationContext';
import { ThemeModeProvider } from 'context/ThemeContext';
import AppRoutes from 'routes/Routes';

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}
