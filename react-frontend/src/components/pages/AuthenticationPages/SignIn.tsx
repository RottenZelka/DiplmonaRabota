import React, { useState, useEffect, useContext } from 'react';
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
import { signInUser } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const themeConfig = {
  primary: '#1976d2',
  secondary: '#ff4081',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
};

const SignIn: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(
    () =>
      JSON.parse(localStorage.getItem('darkMode') ?? 'false') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await signInUser({
        email,
        password,
      });

      login(userData, localStorage.getItem('jwtToken')!, localStorage.getItem('refreshToken')!);
      navigate(`/profile/${userData.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
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
};

export default SignIn;
