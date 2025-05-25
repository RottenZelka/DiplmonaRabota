import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { validation } from '../../../utils/validation';
import TokenManager from '../../../utils/tokenManager';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!validation.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordValidation = validation.password(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message || 'Invalid password';
    }

    // User type validation
    if (!formData.user_type) {
      newErrors.user_type = 'Please select a user type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await registerUser(formData);

      if (response.status === 'success') {
        // Use TokenManager instead of direct localStorage access
        TokenManager.setTokens(response.token, response.refresh_token);

        const userData = {
          id: response.user_id,
          email: formData.email,
          user_type: formData.user_type,
        };

        login(userData, response.token, response.refresh_token);
        setMessage(response.message);
        setError(false);

        if (formData.user_type === 'school') {
          navigate('/register-school');
        } else if (formData.user_type === 'student') {
          navigate('/register-student');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      setMessage(error.message || 'Failed to register. Please try again.');
      setError(true);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 2 }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="User Type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.user_type}
                  helperText={errors.user_type}
                >
                  <MenuItem value="school">School</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Register
            </Button>
          </Box>
          {message && (
            <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
