import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
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
    <Box sx={{ padding: 3 }}>
      {school ? (
        <>
          <Typography variant="h4">{school.name}</Typography>
          <Typography variant="body1">{school.description}</Typography>
        </>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
};

export default SchoolProfile;
