import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { viewStudentResults } from '../../../services/api';

interface ExamResult {
  exam_id: string;
  exam_name: string;
  score?: number;
}

interface DecodedToken {
  data: {
    user_type: string;
    user_id: string;
  };
}

const StudentResultsPage: React.FC = () => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = () => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserId(decodedToken.data.user_id);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const fetchExamResults = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await viewStudentResults();
        setExamResults(response.results || []);
        setError('');
      } catch (err) {
        console.error('Error fetching exam results:', err);
        setError('Failed to load exam results');
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, [userId]);

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
        Your Exam Results
      </Typography>
      <List>
        {examResults.map((result) => (
          <ListItem key={result.exam_id}>
            <ListItemText
              primary={result.exam_name}
              secondary={`Score: ${result.score || 'Pending'}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StudentResultsPage;
