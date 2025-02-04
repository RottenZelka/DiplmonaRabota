import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getPendingExams } from '../../../services/api';

interface PendingExam {
  exam_id: string;
  student_id: string;
  score?: number;
}

interface DecodedToken {
  data: {
    user_type: string;
    user_id: string;
  };
}

const GradingPage: React.FC = () => {
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

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
    const fetchPendingExams = async () => {
      if (!userId || !examId) return;

      setLoading(true);
      try {
        const response = await getPendingExams(examId);
        setPendingExams(response.results || []);
        setError('');
      } catch (err) {
        console.error('Error fetching pending exams:', err);
        setError('Failed to load pending exams');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingExams();
  }, [userId, examId]);

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
        Exams Waiting for Review
      </Typography>
      <List>
        {pendingExams.map((exam) => (
          <ListItem key={exam.student_id} onClick={() => navigate(`/review-exam/${exam.exam_id}/${exam.student_id}`)}>
            <ListItemText
              primary={`Student ID: ${exam.student_id}`}
              secondary={`Score: ${exam.score || 'Pending'}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GradingPage;
