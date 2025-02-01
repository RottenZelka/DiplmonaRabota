import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getExamById, getExamQuestions } from '../../../services/api';

const ExamDetails = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
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

    const fetchExamDetails = async () => {
      setLoading(true);
      try {
        const [examRes, questionsRes] = await Promise.all([
          getExamById(),
          getExamQuestions(id),
        ]);

        setExam(examRes.exam);
        setQuestions(questionsRes.questions);
        setError('');
      } catch (err) {
        console.error('Error fetching exam details:', err);
        setError('Failed to load exam details');
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
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
        {exam.name}
      </Typography>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Questions
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/exam/${id}/add-question`)}
        sx={{ mb: 4 }}
      >
        Add Question
      </Button>

      <List>
        {questions.map((question) => (
          <ListItem key={question.id}>
            <ListItemText
              primary={question.question_text}
              secondary={`Type: ${question.question_type}, Max Points: ${question.max_points}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ExamDetails;