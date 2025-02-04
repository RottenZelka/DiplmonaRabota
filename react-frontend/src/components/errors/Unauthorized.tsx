import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the JWT token from localStorage
    localStorage.removeItem('jwtToken');

    // Optionally, you can redirect the user to the login page after a short delay
    const timer = setTimeout(() => {
      navigate('/signin');
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Typography variant="h1" gutterBottom>
        401
      </Typography>
      <Typography variant="h4" gutterBottom>
        Unauthorized
      </Typography>
      <Typography variant="body1">
        You are not authorized to access this page. Redirecting to the login page...
      </Typography>
    </Box>
  );
};

export default Unauthorized;
