import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [viewType, setViewType] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError(true);
          return;
        }
        const decodedToken = jwtDecode(token);
        const currentUserId = decodedToken.data.user_id;
        const currentUserType = decodedToken.data.user_type;

        // Determine view type
        if (currentUserId == id) {
          setViewType(currentUserType === 'student' ? 'StudentProfile' : 'SchoolProfile');
        } else if (currentUserType === 'student') {
          setViewType(id.includes('school') ? 'StudentViewingSchool' : 'StudentViewing');
        } else if (currentUserType === 'school') {
          setViewType(id.includes('student') ? 'SchoolViewingStudent' : 'SchoolViewing');
        }

        const response = await axios.get(`http://localhost:8888/api/school/${id}`);
        setProfile(response.data.school);
      } catch (error) {
        console.error('Error fetching profile details:', error);
        setError(true);
      }
    };

    fetchProfile();
  }, [id]);

  const renderView = () => {
    if (!profile) return <Typography variant="body1">Loading...</Typography>;

    try {
      const ViewComponent = require(`./views/${viewType}`).default;
      return <ViewComponent profile={profile} />;
    } catch (e) {
      return <Typography variant="body1">Unknown view type</Typography>;
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', px: 2 }}
    >
      {error ? (
        <Alert severity="error">Error loading profile data</Alert>
      ) : (
        renderView()
      )}
    </Box>
  );
};

export default Profile;
