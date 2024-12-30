import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>
        Welcome to the Student App
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
        Discover schools, connect with students, and explore educational opportunities.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/schools')}
        size="large"
      >
        Explore Schools
      </Button>
    </Box>
  );
};

export default Home;
