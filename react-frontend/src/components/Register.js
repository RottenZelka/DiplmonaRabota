import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await axios.post('http://localhost:8888/api/register', formData, {
        withCredentials: true,
      });
      setMessage(response.data.message);
      setError(false);

      navigate('/session')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setError(true);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
        />
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Register
        </Button>
      </Box>
      {message && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default Register;
