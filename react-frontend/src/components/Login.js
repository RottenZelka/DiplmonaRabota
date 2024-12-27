import React, { useState, useEffect } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Fab, CssBaseline, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import themeConfig from './themeConfig'; // Import your custom theme configuration

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function Login() {
  const [darkMode, setDarkMode] = useState(
    () =>
      JSON.parse(localStorage.getItem('darkMode')) ??
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: themeConfig.primary,
      },
      secondary: {
        main: themeConfig.secondary,
      },
    },
    typography: {
      fontFamily: themeConfig.fontFamily,
    },
  });

  const handleLogin = async (provider, formData) => {
    try {
      const response = await axios.post('http://localhost:8888/api/login', {
        email: formData.get('email'),
        password: formData.get('password'),
      });

      if (response.data.status === 'success') {
        // Save token to localStorage
        localStorage.setItem('jwtToken', response.data.token);

        // Set the Authorization header for future requests
        axios.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;

        // Redirect to SessionHandler
        const schoolId = response.data.school.id; // Assuming the backend returns the school ID
        setMessage(response.data.message);
        setError(false);
        setTimeout(() => navigate(`/profile/${schoolId}`), 2000); // Navigate to the school's profile page
      } else {
        throw new Error(response.data.message || 'Login failed.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong.');
      setError(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider theme={theme}>
        <SignInPage
          Login={handleLogin} // Pass the corrected function here
          providers={providers}
          slotProps={{
            emailField: { autoFocus: false },
          }}
        />
        <Box position="fixed" bottom={16} right={16}>
          <Fab color="primary" onClick={toggleTheme} aria-label="toggle theme">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </Fab>
        </Box>
        {message && (
          <Box sx={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', p: 2 }}>
            <Typography color={error ? 'error' : 'primary'}>{message}</Typography>
          </Box>
        )}
      </AppProvider>
    </ThemeProvider>
  );
}
