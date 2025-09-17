import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import AuthGuard from './components/auth/AuthGuard';
import Gallery from './pages/Gallery';
import './styles/globals.css';

function App() {
  return (
    <FluentProvider theme={teamsDarkTheme} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthGuard />}>
                <Route index element={<Navigate to="/all" replace />} />
                <Route path="*" element={<Gallery />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </FluentProvider>
  );
}

export default App;