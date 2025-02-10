import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { JwtPayload, jwtDecode } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
  data: {
    user_id: string;
    email: string;
    user_type: string;
  };
  exp: number;
}

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response  = await registerUser(formData);

      const decoded = jwtDecode<CustomJwtPayload>(localStorage.getItem('jwtToken')!);

      const userData = {
        id: decoded.data.user_id,
        email: formData.email,
        user_type: formData.user_type,
      };

      login(userData, localStorage.getItem('jwtToken')!, localStorage.getItem('refreshToken')!);
      setMessage(response.message);
      if (response.status === 'success') {
        setMessage(response.message);
        setError(false);

        if (formData.user_type === 'school') {
          navigate('/register-school');
        } else if (formData.user_type === 'student') {
          navigate('/register-student');
        }
      }
    } catch (error) {
      console.error('Error fetching levels or studies:', error);
      setMessage('Failed to fetch data. Please try again.');
      setError(true);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3 }}>
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
