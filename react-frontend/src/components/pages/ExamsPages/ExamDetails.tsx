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
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  getExamById,
  getExamQuestionsWithAnswers,
  deleteExamQuestion,
  viewExamResults,
} from '../../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Exam {
  id: string;
  name: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  max_points: number;
}

interface PendingExam {
  student_id: string;
  score?: number;
}

interface DecodedToken {
  data: {
    user_type: string;
    user_id: string;
  };
}

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken: DecodedToken = jwtDecode(token);
    setUserType(decodedToken.data.user_type);
    setUserId(decodedToken.data.user_id);
  }, [navigate]);

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      try {
        const [examRes, questionsRes] = await Promise.all([
          getExamById(id!),
          getExamQuestionsWithAnswers(id!),
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

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteExamQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleViewResults = () => {
    navigate('/student-results');
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
        {exam?.name}
      </Typography>

      {userType === 'school' && (
        <>
          <Button variant="contained" color="secondary" sx={{ mb: 3 }} onClick={() => navigate(`/edit-exam/${id}`)}>
            Edit Exam
          </Button>
        </>
      )}

      {userType === 'student' && (
        <Button variant="contained" color="secondary" sx={{ mb: 3 }} onClick={handleViewResults}>
          View Your Results
        </Button>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        Questions
      </Typography>

      {userType === 'school' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/exam/${id}/add-question`)}
          sx={{ mb: 4 }}
        >
          Add Question
        </Button>
      )}

      <List>
        {questions.map((question) => (
          <ListItem key={question.id}>
            <ListItemText
              primary={question.question_text}
              secondary={`Type: ${question.question_type}, Max Points: ${question.max_points}`}
            />
            {userType === 'school' && (
              <>
                <IconButton color="primary" onClick={() => navigate(`/edit-question/${question.id}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteQuestion(question.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ExamDetails;
