import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  TextField,
  Paper,
  Divider,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamQuestions, reviewExamQuestion, checkExamQuestion, checkExam } from '../../../services/api';

interface Answer {
  question_id: string;
  question_text: string;
  student_answer: string;
  max_points: number;
  question_type: string;
  correct_answer: string | null;
}

const ExamReview: React.FC = () => {
  const { id, studentId } = useParams<{ id: string; studentId: string }>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [grades, setGrades] = useState<{ [key: string]: string }>({});
  const [commentaries, setCommentaries] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentAnswers = async () => {
      setLoading(true);
      try {
        const questionsResponse = await getExamQuestions(id!);
        const questionList = questionsResponse.questions || [];

        const answersPromises = questionList.map((q: any) => reviewExamQuestion(id!, studentId!, q.id));
        const answersResponses = await Promise.all(answersPromises);

        const formattedAnswers = answersResponses.map((res) => ({
          question_id: res.question.id,
          question_text: res.question.text,
          student_answer: res.student_answer,
          max_points: res.question.max_points,
          question_type: res.question.type,
          correct_answer: res.question.correct_answer,
        }));

        setAnswers(formattedAnswers);
        setError('');
      } catch (err) {
        console.error('Error fetching answers:', err);
        setError('Failed to load student answers');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnswers();
  }, [id, studentId]);

  const handleGradeChange = (questionId: string, value: string) => {
    setGrades({ ...grades, [questionId]: value });
  };

  const handleCommentaryChange = (questionId: string, value: string) => {
    setCommentaries({ ...commentaries, [questionId]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const gradingPromises = answers.map(async (answer) => {
        const requestData = {
          points: parseInt(grades[answer.question_id]) || 0,
          commentary: commentaries[answer.question_id] || '',
        };
        return checkExamQuestion(id!, studentId!, answer.question_id, requestData);
      });

      await Promise.all(gradingPromises);
      await checkExam(id!, studentId!);
      navigate('/exams');
    } catch (err) {
      console.error('Error submitting grades:', err);
      setError('Failed to submit grades');
    } finally {
      setLoading(false);
    }
  };

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
        Review Student Answers
      </Typography>

      <List>
        {answers.map((answer, index) => (
          <Paper key={answer.question_id} sx={{ mb: 3, p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography variant="body1" paragraph>
                  {answer.question_text}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Question Type: {answer.question_type}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Student's Answer:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1">
                    {answer.student_answer || 'No answer provided'}
                  </Typography>
                </Paper>
              </Grid>

              {answer.question_type === 'MCQ' && answer.correct_answer && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Correct Answer:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1">
                      {answer.correct_answer}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Maximum Points: {answer.max_points}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Points"
                  type="number"
                  value={grades[answer.question_id] || ''}
                  onChange={(e) => handleGradeChange(answer.question_id, e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, max: answer.max_points }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Commentary"
                  value={commentaries[answer.question_id] || ''}
                  onChange={(e) => handleCommentaryChange(answer.question_id, e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
          </Paper>
        ))}
      </List>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || Object.keys(grades).length !== answers.length}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Grades'}
        </Button>
      </Box>
    </Box>
  );
};

export default ExamReview;
