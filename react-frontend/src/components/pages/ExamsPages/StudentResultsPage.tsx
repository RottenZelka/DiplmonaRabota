import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Rating,
  Button,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { viewStudentResults, getExamById } from '../../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ExamResult {
  exam_id: string;
  exam_name: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  total_points: number;
  earned_points: number;
  submission_date: string;
  status: string;
  questions: Array<{
    question_text: string;
    student_answer: string;
    correct_answer: string;
    points: number;
    max_points: number;
    is_correct: boolean;
  }>;
}

interface DecodedToken {
  data: {
    user_type: string;
    user_id: string;
  };
}

const StudentResultsPage: React.FC = () => {
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

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
    const fetchExamResult = async () => {
      if (!userId || !examId) return;

      setLoading(true);
      try {
        const response = await viewStudentResults();
        const result = response.results.find((r: ExamResult) => r.exam_id === examId);
        if (result) {
          setExamResult(result);
        } else {
          setError('Exam result not found');
        }
      } catch (err) {
        console.error('Error fetching exam result:', err);
        setError('Failed to load exam result');
      } finally {
        setLoading(false);
      }
    };

    fetchExamResult();
  }, [userId, examId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending Review" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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

  if (!examResult) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Exam result not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/student-results')}
        sx={{ mb: 3 }}
      >
        Back to Results
      </Button>

      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        {examResult.exam_name} - Results
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Score: <Typography
                  component="span"
                  color={`${getScoreColor(examResult.score)}.main`}
                  fontWeight="bold"
                >
                  {examResult.score}%
                </Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <Rating
                  value={(examResult.score / 100) * 5}
                  readOnly
                  precision={0.5}
                  size="small"
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({examResult.correct_answers}/{examResult.total_questions} correct)
                </Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                Status: {getStatusChip(examResult.status)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Submission Date: {new Date(examResult.submission_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                Points: {examResult.earned_points}/{examResult.total_points}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question Details
            </Typography>
            <List>
              {examResult.questions.map((question, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Question {index + 1}: {question.question_text}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Your Answer: {question.student_answer}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Correct Answer: {question.correct_answer}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={question.is_correct ? 'success.main' : 'error.main'}
                              sx={{ mt: 1 }}
                            >
                              Points: {question.points}/{question.max_points}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < examResult.questions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentResultsPage;
