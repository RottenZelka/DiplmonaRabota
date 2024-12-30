import React, { useState, useEffect } from 'react';
import { InputBase, TextField, Button, Typography, Box, Alert, useTheme, Chip } from '@mui/material';
import axios from 'axios';
// import { useSpring, animated } from 'react-spring'; // For animations
import { useNavigate } from 'react-router-dom';
import GoogleMapReact from 'google-map-react'; // For Google Maps integration
// import './RegisterSchool.css';
import SearchIcon from '@mui/icons-material/Search';

const GOOGLE_MAPS_API_KEY = ''; // Replace with your API key
const Marker = () => <div style={{ color: 'red', fontWeight: 'bold' }}>📍</div>;

function getStyles(item, selectedItems, theme) {
  return {
    fontWeight:
      selectedItems.indexOf(item.id) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const BubbleSelection = ({ label, options, selectedOptions, onOptionToggle }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">{label}</Typography>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          mb: 2,
          p: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
        }}
      >
        <SearchIcon sx={{ mr: 1 }} />
        <InputBase
          placeholder={`Search ${label}`}
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={1}
        sx={{
          p: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
        }}
      >
        {filteredOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.name}
            onClick={() => onOptionToggle(option.id)}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedOptions.includes(option.id)
                ? theme.palette.primary.main
                : theme.palette.background.paper,
              color: selectedOptions.includes(option.id)
                ? theme.palette.primary.contrastText
                : theme.palette.text.primary,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

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
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [mapLocation, setMapLocation] = useState({ lat: 0, lng: 0});
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const toggleLevelSelection = (id) => {
    setSelectedLevels((prev) =>
      prev.includes(id) ? prev.filter((levelId) => levelId !== id) : [...prev, id]
    );
  };

  const toggleStudySelection = (id) => {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((studyId) => studyId !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const normalizeLongitude = (longitude) => {
    // Bring longitude into the range [-180, 180]
    if (longitude > 180) {
      return ((longitude + 180) % 360) - 180;
    }
    if (longitude < -180) {
      return ((longitude - 180) % 360) + 180;
    }
    return longitude;
  };
  
  const handleMapChange = ({ center }) => {
    const normalizedLongitude = normalizeLongitude(center.lng);
    setMapLocation({ lat: center.lat, lng: normalizedLongitude });
    setFormData((prev) => ({
      ...prev,
      address: `https://www.google.com/maps?q=${center.lat},${normalizedLongitude}`,
    }));
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setMessage('No token found. Please log in.');
        setError(true);
        setTimeout(() => navigate('/'), 2000);
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
            headers: { Authorization: `Bearer ${token}` },
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
        level_ids: selectedLevels, // Ensures level_ids are sent as an array
        study_ids: selectedStudies, // Ensures study_ids are sent as an array
        profile_photo_id: profilePhotoId,
      };

      const response = await axios.post(
        'http://localhost:8888/api/school',
        schoolPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 'success') {
        const schoolId = response.data.school.user_id; // Assuming the backend returns the school ID
        setMessage(response.data.message);
        setError(false);
        setTimeout(() => navigate(`/profile/${schoolId}`), 2000); // Navigate to the school's profile page
      } else {
        throw new Error(response.data.message || 'Failed to create school');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setError(true);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
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
              name="description"
              label="School Description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              required
              multiline
              rows={4}
            />
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <div style={{ height: '400px', width: '100%' }}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
                defaultCenter={mapLocation}
                defaultZoom={14}
                onChange={handleMapChange}
              >
                <Marker lat={mapLocation.lat} lng={mapLocation.lng} />
              </GoogleMapReact>
            </div>
            <Typography variant="body1" gutterBottom>
              Selected Address: {formData.address || 'Move the pin to select'}
            </Typography>
            <Button onClick={handlePrevious} variant="outlined" color="secondary">
              Previous
            </Button>
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          </>
        );
      case 2:
        return(
          <>
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
            <Button onClick={handlePrevious} variant="outlined" color="secondary">Previous</Button>
            <Button onClick={handleNext} variant="contained" color="primary">Next</Button>
          </>
        );
      case 3:
        return (
          <>
            <TextField
              fullWidth
              name="primary_color"
              type="color"
              label="Primary Color"
              value={formData.primary_color}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              name="secondary_color"
              type="color"
              label="Secondary Color"
              value={formData.secondary_color}
              onChange={handleInputChange}
              margin="normal"
            />
            <Button onClick={handlePrevious} variant="outlined" color="secondary">Previous</Button>
            <Button onClick={handleNext} variant="contained" color="primary">Next</Button>
          </>
        );
      case 4:
        return (
          <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        School Registration
      </Typography>
      <form>
        <BubbleSelection
          label="Levels"
          options={levels}
          selectedOptions={selectedLevels}
          onOptionToggle={toggleLevelSelection}
        />
        <BubbleSelection
          label="Studies"
          options={studies}
          selectedOptions={selectedStudies}
          onOptionToggle={toggleStudySelection}
        />
        <Button onClick={handlePrevious} variant="outlined" color="secondary">Previous</Button>
        <Button onClick={handleNext} variant="contained" color="primary">Next</Button>
      </form>
    </Box>
        );
      case 5:
        return (
          <>
            <Box sx={{ my: 2 }}>
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
                Upload Profile Photo
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
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
                      borderRadius: '4px',
                    }}
                  />
                </Box>
              )}
            </Box>

            <Button onClick={handlePrevious} variant="outlined" color="secondary">Previous</Button>
            <Button type="submit" onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
          </>
        );
      default:
        return null;
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
        {renderStep()}
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