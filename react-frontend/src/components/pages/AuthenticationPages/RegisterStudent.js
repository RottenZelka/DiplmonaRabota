import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Alert, Chip, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { createStudent, getStudies } from '../../../services/api';

const BubbleSelection = ({ label, options, selectedOptions, onOptionToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20); // Number of studies to show initially

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more studies each time
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">{label}</Typography>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          mb: 2,
          p: 1,
          border: `1px solid gray`,
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
          border: `1px solid gray`,
          borderRadius: '4px',
        }}
      >
        {filteredOptions.slice(0, visibleCount).map((option) => (
          <Chip
            key={option.id}
            label={option.name}
            onClick={() => onOptionToggle(option.id)}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedOptions.includes(option.id) ? 'primary.main' : 'background.paper',
              color: selectedOptions.includes(option.id) ? 'primary.contrastText' : 'text.primary',
            }}
          />
        ))}
      </Box>
      {visibleCount < filteredOptions.length && (
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleShowMore}>
            Show More
          </Button>
        </Box>
      )}
    </Box>
  );
};

const RegisterStudent = () => {
  const [studies, setStudies] = useState([]);
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const studiesResponse = await getStudies();
        if (studiesResponse.status === 'success') {
          setStudies(studiesResponse.studies);
        }
      } catch (error) {
        console.error('Error fetching levels or studies:', error);
        setMessage('Failed to fetch data. Please try again.');
        setError(true);
      } 
    };
  
    fetchStudies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleStudySelection = (id) => {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((studyId) => studyId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setMessage('No token found. Please log in.');
        setError(true);
        return;
      }

      const payload = {
        ...formData,
        study_ids: selectedStudies,
      };

      const response = await createStudent(payload);

      if (response.status === 'success') {
        const studentId = response.student.user_id; // Assuming the backend returns the school ID
        setMessage(response.message);
        setError(false);
        setTimeout(() => navigate(`/profile/${studentId}`), 2000); // Navigate to the school's profile page
      } else {
        throw new Error(response.message || 'Failed to register student');
      }
    } catch (error) {
      console.error('Error fetching studies:', error);
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
        Register Student
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        <TextField
          fullWidth
          name="name"
          label="Student Name"
          value={formData.name}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="dob"
          label="Date of Birth"
          type="date"
          value={formData.dob}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <BubbleSelection
          label="Studies"
          options={studies}
          selectedOptions={selectedStudies}
          onOptionToggle={toggleStudySelection}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit
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

export default RegisterStudent;
