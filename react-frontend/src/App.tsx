import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NavigationBar from './components/common/NavigationBar';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuthContext } from './context/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
      <Container sx={{ paddingY: 4 }}>
        <AppRoutes />
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <AuthProvider>
        <CssBaseline />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
