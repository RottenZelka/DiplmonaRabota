import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Corrected navigate import

const RegisterSchool = () => {
  const [levels, setLevels] = useState([]);
  const [studies, setStudies] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [profilePhotoId, setProfilePhotoId] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null); // New: For file input
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch levels
    axios.get('http://localhost:8888/api/levels')
      .then(response => {
        if (response.data.status === 'success') {
          setLevels(response.data.levels);
        }
      })
      .catch(err => console.error('Error fetching levels:', err));

    // Fetch studies
    axios.get('http://localhost:8888/api/studies')
      .then(response => {
        if (response.data.status === 'success') {
          setStudies(response.data.studies);
        }
      })
      .catch(err => console.error('Error fetching studies:', err));
  }, []);

  // New: Handle Profile Photo Upload
  const handlePhotoUpload = async () => {
    if (!profilePhotoFile) {
      setMessage('Please select a photo to upload.');
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append('image', profilePhotoFile);

    try {
      const response = await axios.post('http://localhost:8888/api/images/upload-image', formData);
      if (response.data.status === 'success') {
        setProfilePhotoId(response.data.image_id);
        setMessage('Photo uploaded successfully.');
        setError(false);
      } else {
        setMessage('Failed to upload photo.');
        setError(true);
      }
    } catch (err) {
      setMessage('Error uploading photo: ' + (err.response?.data?.message || err.message));
      setError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the payload with selected levels and studies
    const payload = {
      name,
      address,
      description,
      level_ids: [selectedLevel], // Single level selected
      study_ids: selectedStudies, // Multiple studies selected
      profile_photo_id: profilePhotoId,
    };

    try {
      const token = localStorage.getItem('jwtToken'); // Retrieve token from localStorage

      if (!token) {
        setMessage('No token found. Please log in.');
        setError(true);
        setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
        return;
      }

      const response = await axios.post('http://localhost:8888/api/school', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      setError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setError(true);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Typography variant="h4" gutterBottom>
        Complete School Registration
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        {/* School Name */}
        <TextField
          fullWidth
          label="School Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
        />

        {/* School Address */}
        <TextField
          fullWidth
          label="School Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin="normal"
          required
        />

        {/* School Description */}
        <TextField
          fullWidth
          label="School Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          required
        />

        {/* Upload Profile Photo */}
        <Box sx={{ my: 2 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 1 }}
          >
            Upload Profile Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setProfilePhotoFile(e.target.files[0])}
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePhotoUpload}
            disabled={!profilePhotoFile}
          >
            Upload Photo
          </Button>
        </Box>

        {/* Profile Photo ID (read-only) */}
        <TextField
          fullWidth
          label="Profile Photo ID"
          value={profilePhotoId}
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />

        {/* Select Level */}
        <TextField
          fullWidth
          select
          label="Select Level"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          margin="normal"
          required
        >
          {levels.map((level) => (
            <MenuItem key={level.id} value={level.id}>
              {level.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Select Studies */}
        <TextField
          fullWidth
          select
          label="Select Studies"
          value={selectedStudies}
          onChange={(e) => setSelectedStudies([...selectedStudies, e.target.value])}
          margin="normal"
          required
          SelectProps={{
            multiple: true,
          }}
        >
          {studies.map((study) => (
            <MenuItem key={study.id} value={study.id}>
              {study.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
      </Box>

      {message && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default RegisterSchool;
