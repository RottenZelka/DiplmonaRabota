import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, MenuItem, Card, CardContent, Grid, IconButton, InputAdornment, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { validateEmail, validatePassword, validateSQLInjection, validationMessages } from '../../../utils/validation';
import TokenManager from '../../../utils/tokenManager';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const checkPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
  };

  const passwordRequirements = checkPasswordRequirements(formData.password);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // SQL Injection check
    if (!validateSQLInjection(formData.email) || !validateSQLInjection(formData.password)) {
      newErrors.general = 'Invalid characters detected';
      setErrors(newErrors);
      return false;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      newErrors.email = validationMessages.email;
    }

    // Password validation
    if (!validatePassword(formData.password)) {
      newErrors.password = validationMessages.password;
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
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.password}
                  helperText={errors.password}
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
                <List dense sx={{ mt: 1, mb: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      {passwordRequirements.length ? <Check color="success" /> : <Close color="error" />}
                    </ListItemIcon>
                    <ListItemText primary="At least 8 characters long" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {passwordRequirements.uppercase ? <Check color="success" /> : <Close color="error" />}
                    </ListItemIcon>
                    <ListItemText primary="Contains uppercase letter" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {passwordRequirements.lowercase ? <Check color="success" /> : <Close color="error" />}
                    </ListItemIcon>
                    <ListItemText primary="Contains lowercase letter" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {passwordRequirements.number ? <Check color="success" /> : <Close color="error" />}
                    </ListItemIcon>
                    <ListItemText primary="Contains number" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {passwordRequirements.special ? <Check color="success" /> : <Close color="error" />}
                    </ListItemIcon>
                    <ListItemText primary="Contains special character (@$!%*?&)" />
                  </ListItem>
                </List>
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
          {errors.general && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.general}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
