import React from 'react';
import { Typography, Box } from '@mui/material';

const InternalServerError: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Typography variant="h1" gutterBottom>
        500
      </Typography>
      <Typography variant="h4" gutterBottom>
        Internal Server Error
      </Typography>
      <Typography variant="body1">
        Something went wrong on our end. Please try again later.
      </Typography>
    </Box>
  );
};

export default InternalServerError;
