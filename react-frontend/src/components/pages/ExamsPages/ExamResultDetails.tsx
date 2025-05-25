import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { getExamResults } from '../../../services/api';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  max_points: number;
  correct_answer: string | null;
  choices?: string;
}

interface ExamResult {
  question: Question;
  student_answer: string;
  points: number;
  commentary: string | null;
}

interface ExamResultData {
  id: string;
  score: number;
  max_points: number;
  status: string;
  checked_at: string;
  commentary: string | null;
}

const ExamResultDetails: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!examId) return;

      setLoading(true);
      try {
        const response = await getExamResults(examId);
        if (!response || response.status !== 'success') {
          throw new Error('Failed to fetch exam results');
        }

        setResults(response.results);
        setExamResult(response.exam_result);
        setError('');
      } catch (err) {
        console.error('Error fetching exam results:', err);
        setError('Failed to load exam results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId]);

  const getScoreColor = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const formatChoices = (choices: string | undefined) => {
    if (!choices) return [];
    try {
      return JSON.parse(choices);
    } catch {
      return choices.split(',');
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
        No exam results found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Exam Results
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Total Score</Typography>
            <Typography 
              variant="h3" 
              color={`${getScoreColor(examResult.score, examResult.max_points)}.main`}
              sx={{ fontWeight: 'bold' }}
            >
              {examResult.score}/{examResult.max_points} points
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {((examResult.score / examResult.max_points) * 100).toFixed(1)}%
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Status</Typography>
            <Chip 
              label={examResult.status.toUpperCase()} 
              color={examResult.status === 'checked' ? 'success' : 'warning'}
              sx={{ mt: 1 }}
            />
            {examResult.checked_at && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Checked at: {new Date(examResult.checked_at).toLocaleString()}
              </Typography>
            )}
          </Grid>
        </Grid>
        {examResult.commentary && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Overall Feedback</Typography>
            <Typography variant="body1">{examResult.commentary}</Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {results.map((result, index) => (
          <Grid item xs={12} key={result.question.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {result.question.question_text}
                </Typography>
                
                {result.question.question_type === 'MCQ' && result.question.choices && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Available Choices:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {formatChoices(result.question.choices).map((choice: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={choice}
                          color={choice === result.student_answer ? 'primary' : 'default'}
                          variant={choice === result.student_answer ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Your Answer:
                  </Typography>
                  <Typography variant="body1">
                    {result.student_answer}
                  </Typography>
                </Box>

                {result.question.question_type === 'MCQ' && result.question.correct_answer && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Correct Answer:
                    </Typography>
                    <Typography variant="body1">
                      {result.question.correct_answer}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Points:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={`${getScoreColor(result.points, result.question.max_points)}.main`}
                  >
                    {result.points}/{result.question.max_points}
                  </Typography>
                </Box>

                {result.commentary && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Feedback:
                    </Typography>
                    <Typography variant="body2">
                      {result.commentary}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExamResultDetails;