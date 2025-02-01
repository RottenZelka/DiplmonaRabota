import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { apply, uploadLink } from '../../../services/api';

const ApplicationApplyPage = () => {
  const { id } = useParams();
  const [applicationData, setApplicationData] = useState({
    start_date: '',
    expiration_date: '',
    text_field: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [userType, setUserType] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user type (assuming an API or localStorage provides it)
    const fetchUserType = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const decodedToken = jwtDecode(token);
        setUserType(decodedToken.data.user_type);
      } catch (error) {
        console.error('Failed to fetch user type:', error);
        setMessage({ type: 'error', text: 'Failed to fetch user type.' });
      }
    };

    fetchUserType();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    setMessage(null);
  
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please log in.' });
        setLoading(false);
        return;
      }
  
      let link_id = null;
      if (selectedFile) {
        link_id = await handleFileUpload(); // Upload file and get the link_id
        console.log(link_id);
        if (!link_id) {
          setMessage({ type: 'error', text: 'File upload failed. Cannot proceed.' });
          setLoading(false);
          return;
        }
      }
  
      const applicationPayload = {
        ...applicationData,
        file_field: link_id, // Include the file link ID if available
      };
  
      const response = await apply(id, applicationPayload);
  
      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        setTimeout(() => navigate('/applications'), 2000); // Redirect after success
      } else {
        throw new Error(response.message || 'Failed to submit application.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to submit application.' });
    } finally {
      setLoading(false);
    }
  };
  

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'No file selected.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await uploadLink(formData, "File");
      console.log(response.link_id);

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        return response.link_id;
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload file.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Application Apply Page
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {userType === 'school' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                name="start_date"
                value={applicationData.start_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Expiration Date"
                type="date"
                name="expiration_date"
                value={applicationData.expiration_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <TextField
            label="Additional Information"
            name="text_field"
            value={applicationData.text_field}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitApplication}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Application'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            File Upload
          </Typography>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: 'block', marginBottom: '10px' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationApplyPage;
