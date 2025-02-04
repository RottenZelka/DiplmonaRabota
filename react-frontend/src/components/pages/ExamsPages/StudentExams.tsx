import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getExams, checkExamStatus } from '../../../services/api';

interface Exam {
  id: string;
  name: string;
  time_needed_minutes: number;
}

const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
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
              onClick={async () => {
                const status = await checkExamStatus(exam.id);
                if (status && status.status === 'pending') {
                  alert('Exam is already submitted and waiting for review.');
                } else {
                  navigate(`/take-exam/${exam.id}`);
                }
              }}
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
