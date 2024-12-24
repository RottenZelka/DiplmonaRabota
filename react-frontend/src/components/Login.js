import React, { useState, useEffect } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Fab, CssBaseline } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import themeConfig from './themeConfig'; // Import your custom theme configuration

const providers = [{ id: 'credentials', name: 'Email and Password' }];

const Login = async (provider, formData) => {
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
      const navigate = useNavigate();
      navigate('/session');
    } else {
      throw new Error(response.data.message || 'Login failed.');
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Something went wrong.');
    throw error;
  }
};

export default function CredentialsLoginPage() {
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem('darkMode')) ?? window.matchMedia('(prefers-color-scheme: dark)').matches
  );

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider theme={theme}>
        <SignInPage
          Login={Login}
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
      </AppProvider>
    </ThemeProvider>
  );
}
