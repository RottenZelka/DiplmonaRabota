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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { viewStudentResults } from '../../../services/api';

interface Result {
  exam_id: string;
  exam_name: string;
  score: number;
  total_questions: number;
  correct_answers: number;
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
        Exam Results
      </Typography>

      {results.length === 0 ? (
        <Typography variant="h6" textAlign="center">
          No results available.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Exam Name</strong></TableCell>
                <TableCell><strong>Score</strong></TableCell>
                <TableCell><strong>Total Questions</strong></TableCell>
                <TableCell><strong>Correct Answers</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.exam_id}>
                  <TableCell>{result.exam_name}</TableCell>
                  <TableCell>{result.score}</TableCell>
                  <TableCell>{result.total_questions}</TableCell>
                  <TableCell>{result.correct_answers}</TableCell>
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
