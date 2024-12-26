import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Alert, useTheme } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(item, selectedItems, theme) {
  return {
    fontWeight:
      selectedItems.indexOf(item.id) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const RegisterSchool = () => {
  const theme = useTheme();
  const [levels, setLevels] = useState([]);
  const [studies, setStudies] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    school_year_start: '',
    school_year_end: '',
    primary_color: '#ffffff',
    secondary_color: '#000000',
    font_color: '#333333',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch levels
    axios
      .get('http://localhost:8888/api/levels')
      .then((response) => {
        if (response.data.status === 'success') {
          setLevels(response.data.levels);
        }
      })
      .catch((err) => console.error('Error fetching levels:', err));

    // Fetch studies
    axios
      .get('http://localhost:8888/api/studies')
      .then((response) => {
        if (response.data.status === 'success') {
          setStudies(response.data.studies);
        }
      })
      .catch((err) => console.error('Error fetching studies:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleLevelsChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedLevels(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleStudiesChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedStudies(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setMessage('No token found. Please log in.');
        setError(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      let profilePhotoId = null;

      if (profilePhotoFile) {
        const photoFormData = new FormData();
        photoFormData.append('image', profilePhotoFile);

        const photoResponse = await axios.post(
          'http://localhost:8888/api/images/upload-image',
          photoFormData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (photoResponse.data.status === 'success') {
          profilePhotoId = photoResponse.data.image_id;
        } else {
          throw new Error('Failed to upload photo');
        }
      }

      const schoolPayload = {
        ...formData,
        level_ids: selectedLevels,
        study_ids: selectedStudies,
        profile_photo_id: profilePhotoId,
      };

      const response = await axios.post(
        'http://localhost:8888/api/school',
        schoolPayload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage(response.data.message);
      setError(false);
      setTimeout(() => navigate('/dashboard'), 2000);
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
        <TextField
          fullWidth
          name="name"
          label="School Name"
          value={formData.name}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="address"
          label="School Address"
          value={formData.address}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="description"
          label="School Description"
          value={formData.description}
          onChange={handleInputChange}
          margin="normal"
          required
          multiline
          rows={4}
        />
        <TextField
          fullWidth
          name="school_year_start"
          type="date"
          label="School Year Start"
          value={formData.school_year_start}
          onChange={handleInputChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          name="school_year_end"
          type="date"
          label="School Year End"
          value={formData.school_year_end}
          onChange={handleInputChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          name="primary_color"
          type="color"
          label="Primary Color"
          value={formData.primary_color}
          onChange={handleInputChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          name="secondary_color"
          type="color"
          label="Secondary Color"
          value={formData.secondary_color}
          onChange={handleInputChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          name="font_color"
          type="color"
          label="Font Color"
          value={formData.font_color}
          onChange={handleInputChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        
        <Box sx={{ my: 2 }}>
          <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
            Upload Profile Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </Button>
          {photoPreview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  objectFit: 'contain',
                  borderRadius: '4px'
                }} 
              />
            </Box>
          )}
        </Box>
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="levels-label">Select Levels</InputLabel>
          <Select
            labelId="levels-label"
            multiple
            value={selectedLevels}
            onChange={handleLevelsChange}
            input={<OutlinedInput label="Select Levels" />}
            renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            MenuProps={MenuProps}
          >
            {levels.map((level) => (
              <MenuItem
                key={level.id}
                value={level.name}
                style={getStyles(level, selectedLevels, theme)}
              >
                {level.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="studies-label">Select Studies</InputLabel>
          <Select
            labelId="studies-label"
            multiple
            value={selectedStudies}
            onChange={handleStudiesChange}
            input={<OutlinedInput label="Select Studies" />}
            MenuProps={MenuProps}
          >
            {studies.map((study) => (
              <MenuItem
                key={study.id}
                value={study.id}
                style={getStyles(study, selectedStudies, theme)}
              >
                {study.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          type="submit" 
          fullWidth 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
        >
          Register School
        </Button>
      </Box>
      
      {message && (
        <Alert 
          severity={error ? 'error' : 'success'} 
          sx={{ mt: 2, width: '100%', maxWidth: 400 }}
        >
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default RegisterSchool;