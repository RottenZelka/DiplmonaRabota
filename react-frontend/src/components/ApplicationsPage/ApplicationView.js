import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert, CircularProgress, Button, TextField, Stack } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ApplicationView = () => {
  const { id } = useParams(); // `id` refers to application ID
  const [application, setApplication] = useState(null);
  const [viewType, setViewType] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({}); // To handle sending applications/invitations
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

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
    
        // Fetch application details
        const applicationDetails = await axios.get(`http://localhost:8888/api/application/${id}`, {
          headers:{Authorization: `Bearer ${token}`}
        });
        console.log('API Response:', applicationDetails);
    
        const applicationData = applicationDetails.data?.application;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    setIsFormSubmitting(true);
    try {
      const endpoint =
        viewType === 'StudentSendingApplication'
          ? 'http://localhost:8888/api/applications/handle'
          : 'http://localhost:8888/api/applications/handle';

      await axios.post(endpoint, formData);
      alert('Action completed successfully.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an issue. Please try again.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const renderView = () => {
    if (!application) return <Typography variant="body1">Loading...</Typography>;

    switch (viewType) {
      case 'StudentViewingApplication':
      case 'SchoolViewingApplication':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Application Details
            </Typography>
            <Typography variant="body1">Student: {application.student_name}</Typography>
            <Typography variant="body1">School: {application.school_name}</Typography>
            <Typography variant="body1">Status: {application.status}</Typography>
          </Box>
        );
      case 'StudentSendingApplication':
        return (
          <Box component="form" onSubmit={handleFormSubmit}>
            <Typography variant="h5" gutterBottom>
              Send an Application
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="School ID"
                name="school_id"
                value={formData.school_id || ''}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Message"
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
              />
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleFormSubmit}
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? 'Submitting...' : 'Send Application'}
              </Button>
            </Stack>
          </Box>
        );
      case 'SchoolSendingInvitation':
        return (
          <Box component="form" onSubmit={handleFormSubmit}>
            <Typography variant="h5" gutterBottom>
              Send an Invitation
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Student ID"
                name="student_id"
                value={formData.student_id || ''}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Details"
                name="details"
                value={formData.details || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
              />
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleFormSubmit}
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? 'Submitting...' : 'Send Invitation'}
              </Button>
            </Stack>
          </Box>
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
