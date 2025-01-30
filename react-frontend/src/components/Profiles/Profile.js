import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [viewType, setViewType] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        let currentUserId = null;
        let currentUserType = null;

        if (token) {
          const decodedToken = jwtDecode(token);
          currentUserId = decodedToken.data.user_id;
          currentUserType = decodedToken.data.user_type;
        }

        const userTypeRaw = await axios.get(`http://localhost:8888/api/users/type/${id}`);
        const userType = userTypeRaw.data.data.user_type;

        if (currentUserId) {
          if (currentUserId == id) { // int == string
            setViewType(currentUserType === 'student' ? 'StudentProfile' : 'SchoolProfile');
          } else if (currentUserType === 'student') {
            setViewType(userType === 'school' ? 'StudentViewingSchool' : 'StudentViewing');
          } else if (currentUserType === 'school') {
            setViewType(userType === 'student' ? 'SchoolViewingStudent' : 'SchoolViewing');
          }
        } else {
          setViewType(userType === 'student' ? 'NonUserStudent' : 'NonUserSchool');
        }

        const profileResponse = await axios.get(
          `http://localhost:8888/api/${userType}/${id}`
        );
        setProfile(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile details:', error);
        setError(true);
      } finally {
        setLoading(false);
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
      console.error('Error loading view component:', e);
      return (
        <Typography variant="h6" color="textSecondary">
          Unable to display this profile view.
        </Typography>
      );
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', px: 3, py: 4 }}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <CircularProgress color="primary" />
          <Typography variant="body1" mt={2}>
            Loading profile data...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 600, width: '100%', mb: 2 }}>
          Unable to load profile data. Please try again later.
        </Alert>
      ) : (
        <Box sx={{ maxWidth: 800, width: '100%', backgroundColor: '#fff', borderRadius: 2, p: 3, boxShadow: 1 }}>
          {renderView()}
        </Box>
      )}
    </Box>
  );
};

export default Profile;
