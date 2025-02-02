import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getExams } from '../../../services/api';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const response = await getExams(); // Fetch exams available for the student
        setExams(response.exams);
        setError('');
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

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
        Available Exams
      </Typography>

      <List>
        {exams.map((exam) => (
          <ListItem key={exam.id}>
            <ListItemText
              primary={exam.name}
              secondary={`Time Needed: ${exam.time_needed_minutes} minutes`}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/take-exam/${exam.id}`)}
            >
              Take Exam
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StudentExams;