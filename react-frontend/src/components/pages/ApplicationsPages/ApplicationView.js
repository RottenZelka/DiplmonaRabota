import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert, CircularProgress, Button, TextField, Stack, Card, CardContent } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { getApplicationById } from '../../../services/api';

const ApplicationView = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [viewType, setViewType] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        let currentUserId = null;
        let currentUserType = null;
    
        if (token) {
          const decodedToken = jwtDecode(token);
          currentUserId = decodedToken.data.user_id;
          currentUserType = decodedToken.data.user_type;
          setIsAuthenticated(true);
        }
    
        const applicationDetails = await getApplicationById(id);
    
        const applicationData = applicationDetails.application;
        if (!applicationData) {
          throw new Error('Application data not found');
        }
    
        if (currentUserId) {
          if (applicationData.student_id === currentUserId) {
            setViewType('StudentViewingApplication');
          } else if (applicationData.school_id === currentUserId) {
            setViewType('SchoolViewingApplication');
          } else {
            setViewType('Unauthorized');
          }
        } else {
          setViewType('Unauthorized');
        }
    
        setApplication(applicationData);
      } catch (error) {
        console.error('Error fetching application details:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    

    fetchApplication();
  }, [id]);

  const renderView = () => {
    if (!application) return <Typography variant="body1">Loading...</Typography>;

    switch (viewType) {
      case 'StudentViewingApplication':
        return (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Application Details
              </Typography>
              <Typography variant="body1">School: {application.candidate_name}</Typography>
              <Typography variant="body1">Status: {application.status}</Typography>
            </CardContent>
          </Card>
        );
      case 'SchoolViewingApplication':
        return (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Application Details
              </Typography>
              <Typography variant="body1">Student: {application.candidate_name}</Typography>
              <Typography variant="body1">Status: {application.status}</Typography>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Typography variant="h6" color="textSecondary">
            You are not authorized to view or perform actions on this application.
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
            Loading application data...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 600, width: '100%', mb: 2 }}>
          Unable to load application data. Please try again later.
        </Alert>
      ) : (
        <Box sx={{ maxWidth: 800, width: '100%', backgroundColor: '#fff', borderRadius: 2, p: 3, boxShadow: 1 }}>
          {renderView()}
        </Box>
      )}
    </Box>
  );
};

export default ApplicationView;
