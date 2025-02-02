import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Fixed import
import { signInUser } from '../../../services/api';

const themeConfig = {
  primary: '#1976d2',
  secondary: '#ff4081',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
};

export default function SignIn() {
  const [darkMode, setDarkMode] = useState(
    () =>
      JSON.parse(localStorage.getItem('darkMode')) ??
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await signInUser({
        email,
        password,
      });

      if (response.status === 'success') {
        // Save the JWT token to localStorage
        localStorage.setItem('jwtToken', response.token);

        const token = localStorage.getItem('jwtToken');
        const decodedToken = jwtDecode(token);
        navigate(`/profile/${decodedToken.data.user_id}`);
      } else {
        setError(response.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor={darkMode ? 'background.default' : 'background.paper'}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" color="primary">
              Sign In
            </Typography>
            <IconButton onClick={toggleTheme} color="primary">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Box mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
