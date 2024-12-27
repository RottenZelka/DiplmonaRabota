import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, MenuItem, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      const response = await axios.post('http://localhost:8888/api/register', formData);
      setMessage(response.data.message);
      if (response.data.status === 'success') {
        setMessage(response.data.message);
        setError(false);

        // Save token to localStorage
        localStorage.setItem('jwtToken', response.data.token);

        // Set the Authorization header for future requests
        axios.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;

        navigate('/register-school');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
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
