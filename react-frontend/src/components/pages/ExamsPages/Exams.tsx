import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getExams, deleteExam, getSchoolExams, viewExamResults, checkExamStatus } from '../../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Exam {
  id: string;
  name: string;
  time_needed_minutes: number;
  is_mandatory: boolean;
}

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

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = () => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserType(decodedToken.data.user_type);
        setUserId(decodedToken.data.user_id);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      if (!userType || !userId) return;

      setLoading(true);
      try {
        let response = userType === 'school' ? await getSchoolExams(userId) : await getExams();

        if (!response || !response.exams) {
          throw new Error('Invalid API response');
        }

        setExams(response.exams);
        setError(false);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingExams = async () => {
      if (userType === 'school') {
        try {
          const response = await viewExamResults(userId!);
          setPendingExams(response.results || []);
        } catch (err) {
          console.error('Error fetching pending exams:', err);
        }
      }
    };

    fetchExams();
    fetchPendingExams();
  }, [userType, userId]);

  const handleDeleteExam = async (examId: string) => {
    try {
      await deleteExam(examId);
      setExams(exams.filter((exam) => exam.id !== examId));
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const handleCreateExam = () => {
    navigate('/create-exam');
  };

  const handleTakeExam = async (examId: string) => {
    try {
      const status = await checkExamStatus(examId);
      if (status && status.status === 'pending') {
        alert('Exam is already submitted and waiting for review.');
      } else {
        navigate(`/take-exam/${examId}`);
      }
    } catch (error) {
      console.error('Error checking exam status:', error);
    }
  };

  const handleViewResults = () => {
    navigate('/student-results');
  };

  const handleViewGrading = (examId: string) => {
    navigate(`/grading/${examId}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        {userType === 'school' ? 'Manage Your Exams' : 'Available Exams'}
      </Typography>

      {userType === 'school' && (
        <Box sx={{ mb: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleCreateExam}>
            Create Exam
          </Button>
        </Box>
      )}

      {userType === 'student' && (
        <Box sx={{ mb: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
          <Button variant="contained" color="secondary" onClick={handleViewResults}>
            View Your Results
          </Button>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load exams. Please try again later.</Alert>
      ) : (
        <Grid container spacing={4}>
          {exams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={exam.id}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => (userType === 'student' ? handleTakeExam(exam.id) : null)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {exam.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time Needed: {exam.time_needed_minutes} minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mandatory: {exam.is_mandatory ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>

                {userType === 'school' && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <IconButton color="primary" onClick={() => navigate(`/exam/${exam.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteExam(exam.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <Button variant="contained" color="secondary" onClick={() => handleViewGrading(exam.id)}>
                      Grade
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {userType === 'school' && pendingExams.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
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
        </>
      )}
    </Box>
  );
};

export default Exams;
