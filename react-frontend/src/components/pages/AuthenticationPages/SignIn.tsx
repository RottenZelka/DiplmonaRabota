import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInUser } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import TokenManager from '../../../utils/tokenManager';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await signInUser({
        email,
        password,
      });

      if (!response.token || !response.refresh_token) {
        throw new Error('Invalid response from server');
      }

      // Set tokens using TokenManager
      TokenManager.setTokens(response.token, response.refresh_token);

      // Get user data from the token
      const decodedToken = TokenManager.getDecodedToken();
      if (!decodedToken) {
        throw new Error('Failed to decode token');
      }

      // Validate user type
      if (!decodedToken.data.user_type || !['student', 'school'].includes(decodedToken.data.user_type)) {
        throw new Error('Invalid user type in token');
      }

      const userData = {
        id: decodedToken.data.user_id,
        email: decodedToken.data.email,
        user_type: decodedToken.data.user_type as 'student' | 'school'
      };

      // Pass the user type to the login function
      login(userData, response.token, response.refresh_token);

      // Navigate based on user type
      if (userData.user_type === 'school') {
        navigate(`/profile/${userData.id}`);
      } else if (userData.user_type === 'student') {
        navigate(`/profile/${userData.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      // Clear any partial tokens on error
      TokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 2 }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', bgcolor: 'background.paper' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" color="primary">
            Sign In
          </Typography>
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
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
  );
};

export default SignIn;
