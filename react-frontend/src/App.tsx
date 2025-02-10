import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import NavigationBar from './components/common/NavigationBar';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Box>
      <NavigationBar
        onLogout={handleLogout}
        isLoggedIn={isAuthenticated}
        user={user}
      />
      <AppRoutes />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
