import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Typography, Box, Alert, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GoogleMapReact from 'google-map-react';
import { createSchool, getSchoolLevels, getStudies, uploadLink } from '../../../services/api';
import BubbleSelection from '../../common/BubbleSelection';
import { AuthContext } from '../../../context/AuthContext';

interface MarkerProps {
  position: { lat: number; lng: number };
}

const GOOGLE_MAPS_API_KEY = ''; // Replace with your API key
const Marker: React.FC<MarkerProps> = ({ position }) => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>📍</div>
);

interface Level {
  id: string;
  name: string;
}

interface Study {
  id: string;
  name: string;
}

const RegisterSchool: React.FC = () => {
  const theme = useTheme();
  const [levels, setLevels] = useState<Level[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    school_year_start: '',
    school_year_end: '',
    primary_color: '#ffffff',
    secondary_color: '#000000',
  });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [mapLocation, setMapLocation] = useState({ lat: 0, lng: 0 });
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchLevelsAndStudies = async () => {
      try {
        const [levelsResponse, studiesResponse] = await Promise.all([
          getSchoolLevels(),
          getStudies(),
        ]);

        if (levelsResponse.status === 'success') {
          setLevels(levelsResponse.levels);
        }

        if (studiesResponse.status === 'success') {
          setStudies(studiesResponse.studies);
        }
      } catch (error) {
        console.error('Error fetching levels or studies:', error);
        setMessage('Failed to fetch data. Please try again.');
        setError(true);
      }
    };

    fetchLevelsAndStudies();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const toggleLevelSelection = (id: string) => {
    setSelectedLevels((prev) =>
      prev.includes(id) ? prev.filter((levelId) => levelId !== id) : [...prev, id]
    );
  };

  const toggleStudySelection = (id: string) => {
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

  const normalizeLongitude = (longitude: number) => {
    // Bring longitude into the range [-180, 180]
    if (longitude > 180) {
      return ((longitude + 180) % 360) - 180;
    }
    if (longitude < -180) {
      return ((longitude - 180) % 360) + 180;
    }
    return longitude;
  };

  const handleMapChange = ({ center }: { center: { lat: number; lng: number } }) => {
    const normalizedLongitude = normalizeLongitude(center.lng);
    setMapLocation({ lat: center.lat, lng: normalizedLongitude });
    setFormData((prev) => ({
      ...prev,
      address: `https://www.google.com/maps?q=${center.lat},${normalizedLongitude}`,
    }));
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile) return null;

    try {
      const response = await uploadLink(profilePhotoFile, 'Profile%20Image');

      if (response.status === 'success') {
        return response.link_id; // Return the uploaded image ID
      }

      throw new Error(response.message || 'Image upload failed');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage('Failed to upload photo.');
      setError(true);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setMessage('You are not authorized. Please log in.');
        setError(true);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      const profilePhotoId = await handlePhotoUpload();

      const schoolPayload = {
        ...formData,
        level_ids: selectedLevels,
        study_ids: selectedStudies,
        profile_photo_id: profilePhotoId,
      };

      const response = await createSchool(schoolPayload);
      if (response.status === 'success') {
        setMessage('School registration completed successfully.');
        setError(false);

        const schoolId = response.school.user_id;
        setIsAuthenticated(true);
        setTimeout(() => navigate(`/profile/${schoolId}`), 2000);
      } else {
        throw new Error(response.message || 'Registration failed.');
      }
    } catch (error: any) {
      console.error('Error submitting school data:', error);
      setMessage(error.response?.message || 'An error occurred during registration.');
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
                <Marker position={{ lat: mapLocation.lat, lng: mapLocation.lng }} />
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
        return (
          <>
            <TextField
              fullWidth
              name="school_year_start"
              type="date"
              label="School Year Start"
              value={formData.school_year_start}
              onChange={handleInputChange}
              margin="normal"
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
              required
            />
            <Button onClick={handlePrevious} variant="outlined" color="secondary">
              Previous
            </Button>
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
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
            <Button onClick={handlePrevious} variant="outlined" color="secondary">
              Previous
            </Button>
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
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
              <Button onClick={handlePrevious} variant="outlined" color="secondary">
                Previous
              </Button>
              <Button onClick={handleNext} variant="contained" color="primary">
                Next
              </Button>
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

            <Button onClick={handlePrevious} variant="outlined" color="secondary">
              Previous
            </Button>
            <Button type="submit" onClick={handleSubmit} variant="contained" color="primary">
              Submit
            </Button>
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
