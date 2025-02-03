import React from 'react';
import { Typography, Box } from '@mui/material';

const BadRequest = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Typography variant="h1" gutterBottom>
        400
      </Typography>
      <Typography variant="h4" gutterBottom>
        Bad Request
      </Typography>
      <Typography variant="body1">
        The request could not be understood or was missing required parameters.
      </Typography>
    </Box>
  );
};

export default BadRequest;
