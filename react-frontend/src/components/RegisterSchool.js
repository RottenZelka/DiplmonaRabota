import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Alert } from '@mui/material';
import axios from 'axios';

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
        } );
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

        {/* Profile Photo ID (optional) */}
        <TextField
          fullWidth
          label="Profile Photo ID (Optional)"
          value={profilePhotoId}
          onChange={(e) => setProfilePhotoId(e.target.value)}
          margin="normal"
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
