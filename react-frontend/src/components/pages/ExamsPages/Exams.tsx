import React, { useState, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getExams, getSchoolExams, deleteExam, checkExamStatus, viewExamResults } from '../../../services/api';
import TokenManager from '../../../utils/tokenManager';
import BadRequest from '../../errors/BadRequest';
import NotFound from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServerError';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../common/Pagination';

interface Exam {
  id: string;
  name: string;
  time_needed_minutes: number;
  is_mandatory: boolean;
  created_at: string;
}

interface PendingExam {
  exam_id: string;
  student_id: string;
  score: number | null;
}

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [, setPendingExams] = useState<PendingExam[]>([]);
  const navigate = useNavigate();

  const { pagination, handlePageChange, updatePagination } = usePagination({
    onPageChange: (page) => fetchExams(page)
  });

  const fetchExams = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pagination.page_size.toString());

      let response;
      if (userType === 'school') {
        response = await getSchoolExams(userId!);
      } else {
        response = await getExams(params);
      }
      
      setExams(response.exams);
      updatePagination(response.pagination);
      setError(false);
    } catch (err: any) {
      setError(true);
      if (err?.response?.status === 400) setErrorCode(400);
      else if (err?.response?.status === 404) setErrorCode(404);
      else if (err?.response?.status === 500) setErrorCode(500);
      else setErrorCode(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = () => {
      const decodedToken = TokenManager.getDecodedToken();
      if (decodedToken) {
        setUserType(decodedToken.data.user_type);
        setUserId(decodedToken.data.user_id);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchExams(1);
    }
  }, [userId]);

  useEffect(() => {
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

    fetchPendingExams();
  }, [userType, userId]);

  const handleDeleteExam = async (examId: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this exam? This action cannot be undone.');
      if (!confirmed) return;

      await deleteExam(examId);
      setExams(exams.filter((exam) => exam.id !== examId));
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam. Please try again.');
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
      } 
      else if(status && status.status === 'checked') {
        alert('Exam is already submitted and checked. Go see your results.');
        navigate(`/student-results`);
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

  if (errorCode === 400) return <BadRequest />;
  if (errorCode === 404) return <NotFound />;
  if (errorCode === 500) return <InternalServerError />;

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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load exams. Please try again later.</Alert>
      ) : (exams.length === 0 ? (
        <Typography variant="h6" textAlign="center">No exams found.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid item xs={12} sm={6} md={4} key={exam.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {exam.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time Needed: {exam.time_needed_minutes} minutes
                    </Typography>
                    {exam.is_mandatory && (
                      <Chip
                        label="Mandatory"
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
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

                  {userType === 'student' && (
                    <Box sx={{ p: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleTakeExam(exam.id)}
                      >
                        Take Exam
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.page_count}
              page={pagination.current_page}
              onChange={handlePageChange}
              showTotal
              total={pagination.total_count}
            />
          </Box>
        </>
      ))}
    </Box>
  );
};

export default Exams;
