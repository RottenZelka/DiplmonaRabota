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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamQuestions, reviewExamQuestion, checkExamQuestion, checkExam } from '../../../services/api';

interface Answer {
  question_id: string;
  question_text: string;
  student_answer: string;
  max_points: number;
  question_type: string;
  correct_answer: string;
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

  const handleSubmitGrades = async () => {
    try {
      const gradingPromises = answers.map(async (answer) => {
        const requestData = {
          points: parseInt(grades[answer.question_id]) || 0,
          commentary: commentaries[answer.question_id] || '',
        };
        return checkExamQuestion(id!, studentId!, answer.question_id, requestData);
      });

      checkExam(id!, studentId!);
      await Promise.all(gradingPromises);
      console.log(answers);
      navigate(`/exams`);
    } catch (error) {
      console.error('Error submitting grades:', error);
      setError('Failed to submit grades.');
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
        Review Exam
      </Typography>

      <List>
        {answers.map((answer) => (
          <ListItem key={answer.question_id}>
            <ListItemText primary={answer.question_text} secondary={`Student's Answer: ${answer.student_answer}`} />
            <TextField
              type="number"
              label={`Score (Max: ${answer.max_points})`}
              variant="outlined"
              size="small"
              value={grades[answer.question_id] || ''}
              onChange={(e) => handleGradeChange(answer.question_id, e.target.value)}
            />
            <TextField
              label="Commentary"
              variant="outlined"
              size="small"
              value={commentaries[answer.question_id] || ''}
              onChange={(e) => handleCommentaryChange(answer.question_id, e.target.value)}
              sx={{ ml: 2 }}
            />
          </ListItem>
        ))}
      </List>

      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSubmitGrades}>
        Submit Grades
      </Button>
    </Box>
  );
};

export default ExamReview;
