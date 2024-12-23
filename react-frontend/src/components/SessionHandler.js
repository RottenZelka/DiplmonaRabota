import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SessionHandler = () => {
  const [user, setUser] = useState(null); // Store user session details
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate(); // Navigate for redirects

  // Check if the user is authorized when the component mounts
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('jwtToken'); // Retrieve token from localStorage
  
      if (!token) {
        setMessage('No token found. Please log in.');
        setError(true);
        setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:8888/api/check-session', {
          headers: { Authorization: `Bearer ${token}` }, // Use the token in the request
        });
        // Handle successful session validation here
      } catch (err) {
        setMessage('Failed to validate session. Redirecting to login...');
        setError(true);
        setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
      }
    };
  
    checkSession(); // Call the function when the component mounts
  }, [navigate]);
  

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8888/api/logout');
      if (response.data.status === 'success') {
        setUser(null);
        localStorage.removeItem('jwtToken');
        delete axios.defaults.headers['Authorization']; // Remove the Authorization header
  
        setMessage('Logout successful.');
        setError(false);
        setTimeout(() => navigate('/login'), 1000); // Redirect to login
      } else {
        setMessage('Failed to logout.');
        setError(true);
      }
    } catch (err) {
      setMessage('Error during logout.');
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
      <Typography variant="h5" gutterBottom>
        Session Management
      </Typography>
      {user ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1">Logged in as:</Typography>
          <Typography variant="h6">{user.username} ({user.user_type})</Typography>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Typography variant="body1">No user is currently logged in.</Typography>
      )}

      {message && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default SessionHandler;
