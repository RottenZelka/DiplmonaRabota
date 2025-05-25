import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getPendingExams, getExamById } from '../../../services/api';
import GradeIcon from '@mui/icons-material/Grade';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TokenManager from '../../../utils/tokenManager';

interface PendingExam {
  exam_id: string;
  student_id: string;
  student_name: string;
  submission_date: string;
  score?: number;
  status: string;
  total_questions: number;
  graded_questions: number;
}

interface DecodedToken {
  data: {
    user_type: string;
    user_id: string;
  };
}

const GradingPage: React.FC = () => {
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  useEffect(() => {
    const initializeUser = () => {
      const token = TokenManager.getToken();
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (decodedToken.data.user_type !== 'school') {
          navigate('/exams');
          return;
        }
        setUserId(decodedToken.data.user_id);
        setUserType(decodedToken.data.user_type);
      } catch (error) {
        console.error('Error decoding token:', error);
        TokenManager.clearTokens();
        navigate('/signin');
      }
    };

    initializeUser();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !examId || userType !== 'school') return;

      setLoading(true);
      try {
        const [pendingResponse, examResponse] = await Promise.all([
          getPendingExams(examId),
          getExamById(examId)
        ]);
        
        if (!pendingResponse || !examResponse) {
          throw new Error('Failed to fetch data');
        }

        setPendingExams(pendingResponse.results || []);
        setExamDetails(examResponse.exam);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, examId, userType]);

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Chip icon={<AccessTimeIcon />} label="Pending Review" color="warning" size="small" />;
      case 'in_progress':
        return <Chip icon={<GradeIcon />} label="In Progress" color="info" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />;
      default:
        return <Chip icon={<ErrorIcon />} label={status} color="default" size="small" />;
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

  if (!userId || userType !== 'school') {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        You do not have permission to access this page.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        {examDetails?.name || 'Exam'} - Grading
      </Typography>

      {pendingExams.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No exams waiting for review.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            All submissions have been graded.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {pendingExams.map((exam) => (
            <Grid item xs={12} md={6} lg={4} key={exam.student_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    cursor: 'pointer'
                  }
                }}
                onClick={() => navigate(`/review-exam/${exam.exam_id}/${exam.student_id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {exam.student_name}
                    </Typography>
                    {getStatusChip(exam.status)}
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Submission Date: {new Date(exam.submission_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {exam.graded_questions}/{exam.total_questions} questions graded
                    </Typography>
                    {exam.score !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        Current Score: {exam.score}%
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                  <Tooltip title="Review Submission">
                    <Button
                      size="small"
                      endIcon={<GradeIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/review-exam/${exam.exam_id}/${exam.student_id}`);
                      }}
                    >
                      Review
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GradingPage;
