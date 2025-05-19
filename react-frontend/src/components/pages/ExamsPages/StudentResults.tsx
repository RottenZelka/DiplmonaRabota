import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Rating,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { viewStudentResults } from '../../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Result {
  exam_id: string;
  exam_name: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  total_points: number;
  earned_points: number;
  submission_date: string;
  status: string;
}

const StudentResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await viewStudentResults();
        setResults(response.results);
        setError('');
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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

  const handleViewResults = (examId: string) => {
    navigate(`/student-results/${examId}`);
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Exam Results
      </Typography>

      {results.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No exam results available yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Complete some exams to see your results here.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Exam Name</strong></TableCell>
                <TableCell><strong>Score</strong></TableCell>
                <TableCell><strong>Performance</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Submission Date</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow 
                  key={result.exam_id}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>{result.exam_name}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      color={`${getScoreColor(result.score)}.main`}
                      fontWeight="bold"
                    >
                      {result.score}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating
                        value={(result.score / 100) * 5}
                        readOnly
                        precision={0.5}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({result.correct_answers}/{result.total_questions} correct)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(result.status)}</TableCell>
                  <TableCell>
                    {new Date(result.submission_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Detailed Results">
                      <Button
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewResults(result.exam_id)}
                        size="small"
                      >
                        View
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StudentResults;
