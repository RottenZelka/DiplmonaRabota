import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Fixed import

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [viewType, setViewType] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        let currentUserId = null;
        let currentUserType = null;

        if (token) {
          // Decode token and extract user info
          const decodedToken = jwtDecode(token);
          currentUserId = decodedToken.data.user_id;
          currentUserType = decodedToken.data.user_type;
          setIsAuthenticated(true); // User is authenticated
        }

        // Determine view type
        if (currentUserId) {
          if (currentUserId == id) {
            setViewType(currentUserType === 'student' ? 'StudentProfile' : 'SchoolProfile');
          } else if (currentUserType === 'student') {
            setViewType(id.includes('school') ? 'StudentViewingSchool' : 'StudentViewing');
          } else if (currentUserType === 'school') {
            setViewType(id.includes('student') ? 'SchoolViewingStudent' : 'SchoolViewing');
          }
        } else {
          // No active user (non-authenticated)
          setViewType(id.includes('student') ? 'NonUserStudent' : 'NonUserSchool');
        }

        // Fetch profile data
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
      // Dynamically import the correct view component
      const ViewComponent = require(`./views/${viewType}`).default;
      return <ViewComponent profile={profile} />;
    } catch (e) {
      console.error('Error loading view component:', e);
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
      ) : isAuthenticated ? (
        renderView()
      ) : (
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Welcome to Our Platform
          </Typography>
          <Typography variant="body1">
            Please <a href="/login">log in</a> to access more features.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
