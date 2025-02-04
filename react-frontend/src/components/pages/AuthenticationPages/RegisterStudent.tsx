import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createStudent, getStudies } from '../../../services/api';
import BubbleSelection from '../../common/BubbleSelection';
import { AuthContext } from '../../../context/AuthContext';
import ErrorBoundary from '../../common/ErrorBoundary';

interface Study {
  id: string;
  name: string;
}

const RegisterStudent: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
  });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const studiesResponse = await getStudies();
        if (studiesResponse.status === 'success') {
          setStudies(studiesResponse.studies);
        }
      } catch (error) {
        console.error('Error fetching studies:', error);
        setMessage('Failed to fetch data. Please try again.');
        setError(true);
      }
    };

    fetchStudies();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleStudySelection = (id: string) => {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((studyId) => studyId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        const studentId = response.student.user_id; // Assuming the backend returns the student ID
        setMessage(response.message);
        setError(false);
        setIsAuthenticated(true);
        setTimeout(() => navigate(`/profile/${studentId}`), 2000); // Navigate to the student's profile page
      } else {
        throw new Error(response.message || 'Failed to register student');
      }
    } catch (error: any) {
      console.error('Error registering student:', error);
      setMessage(error.response?.message || 'An error occurred during registration.');
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
