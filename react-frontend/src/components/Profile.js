import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent, Alert } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Use this to decode JWT token

const Profile = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [profile, setProfile] = useState(null); // Profile data
  const [viewType, setViewType] = useState(''); // To determine the rendering view
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Decode token to get user information
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError(true);
          return;
        }
        const decodedToken = jwtDecode(token);
        const currentUserId = decodedToken.data.user_id; // Get current user ID from token
        const currentUserType = decodedToken.data.user_type; // Get user type from token
        console.log(currentUserId);
        console.log(id);
        // Determine view type based on current user and requested profile
        if (currentUserId == id) {
          setViewType(currentUserType === 'student' ? 'myStudentProfile' : 'mySchoolProfile');
        } else if (currentUserType === 'student') {
          setViewType('studentViewing'); // A student viewing someone else's profile
        } else if (currentUserType === 'school') {
          setViewType('schoolViewing'); // A school viewing someone else's profile
        }

        // Fetch profile data from the server
        const response = await axios.get(`http://localhost:8888/api/school/${id}`);
        console.log(response);
        setProfile(response.data.school);
      } catch (error) {
        console.error('Error fetching profile details:', error);
        setError(true);
      }
    };

    fetchProfile();
  }, [id]);

  // Different renders for different scenarios
  const renderView = () => {
    if (!profile) return <Typography variant="body1">Loading...</Typography>;

    switch (viewType) {
      case 'myStudentProfile':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4">My Profile</Typography>
              <Typography>Email: {profile.email}</Typography>
              <Typography>Additional data specific to the student...</Typography>
            </CardContent>
          </Card>
        );
      case 'studentViewing':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4">Viewing Another Student</Typography>
              <Typography>Name: {profile.name}</Typography>
              <Typography>School: {profile.school}</Typography>
            </CardContent>
          </Card>
        );
      case 'mySchoolProfile':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4">My School Profile</Typography>
              <Typography>School Name: {profile.name}</Typography>
              <Typography>Details about the school...</Typography>
            </CardContent>
          </Card>
        );
      case 'schoolViewing':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4">School Viewing Profile</Typography>
              <Typography>Name: {profile.name}</Typography>
              <Typography>Email: {profile.email}</Typography>
            </CardContent>
          </Card>
        );
      default:
        return <Typography>Unknown view type</Typography>;
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
