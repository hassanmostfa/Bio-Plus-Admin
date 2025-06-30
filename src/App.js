import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import getRoutes from './routes'; // Import your routes function
import SignInCentered from './views/auth/signIn/index';
import ProtectedRoute from 'components/protectedRoute/ProtectedRoute';
import { LanguageProvider } from "./components/auth/LanguageContext";
import { useTranslation } from 'react-i18next';

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const { t } = useTranslation();

  return (
    <ChakraProvider theme={currentTheme}>
      <LanguageProvider> {/* Wrap the entire Routes component with LanguageProvider */}
        <Routes>
          <Route path="auth/*" element={<AuthLayout />} />
          <Route
            path="admin/*"
            element={
              <AdminLayout
                theme={currentTheme}
                setTheme={setCurrentTheme}
                routes={getRoutes(t)} // Pass routes to AdminLayout
              />
            }
          />
          <Route
            path="rtl/*"
            element={
              <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route path="admin/auth/sign-in" element={<SignInCentered />} />
        </Routes>
      </LanguageProvider>
    </ChakraProvider>
  );
}