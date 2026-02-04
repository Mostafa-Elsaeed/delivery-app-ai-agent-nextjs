
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RootProvider, useRoot } from './context/RootContext';
import LandingPage from './components/LandingPage';
import DashboardPage from './pages/DashboardPage';

const AppRoutes: React.FC = () => {
  const { t, isDarkMode, toggleTheme, toggleLanguage } = useRoot();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <LandingPage 
            t={t} 
            isDarkMode={isDarkMode} 
            onToggleTheme={toggleTheme} 
            onToggleLanguage={toggleLanguage} 
          />
        } 
      />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <RootProvider>
      <Router>
        <AppRoutes />
      </Router>
    </RootProvider>
  );
};

export default App;
