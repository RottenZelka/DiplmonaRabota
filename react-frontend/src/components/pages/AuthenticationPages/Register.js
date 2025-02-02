import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(formData);
      setMessage(response.message);
      if (response.status == 'success') {
        setMessage(response.message);
        setError(false);

        // Save token to localStorage
        localStorage.setItem('jwtToken', response.token);
        
        if(formData.user_type === 'school')
          navigate('/register-school');
        else if(formData.user_type === 'student')
          navigate('/register-student');
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
      sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', px: 2 }}
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
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
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
