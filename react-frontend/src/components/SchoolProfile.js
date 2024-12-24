import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent } from '@mui/material';
import axios from 'axios';

const SchoolProfile = () => {
  const { id } = useParams(); // Get the school ID from the URL
  const [school, setSchool] = useState(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const response = await axios.get(`http://localhost:8888/api/school/${id}`);
        setSchool(response.data.school);
      } catch (error) {
        console.error('Error fetching school details:', error);
      }
    };

    fetchSchool();
  }, [id]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', px: 2 }}
    >
      {school ? (
        <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              {school.name}
            </Typography>
            <Typography variant="body1" align="justify" sx={{ mt: 2 }}>
              {school.description}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
};

export default SchoolProfile;
