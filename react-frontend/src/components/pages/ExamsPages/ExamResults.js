import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ExamResults = () => {
  const { id } = useParams(); // Exam ID from the URL
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login'); // Redirect to login if no token
      return;
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.data.user_type !== 'school') {
      navigate('/'); // Redirect to home if not a school
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await viewExamResults(id);
        setResults(response.results);
        setError('');
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Exam Results
      </Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Score: {results?.score}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Commentary: {results?.commentary}
        </Typography>
      </Box>
    </Box>
  );
};

export default ExamResults;