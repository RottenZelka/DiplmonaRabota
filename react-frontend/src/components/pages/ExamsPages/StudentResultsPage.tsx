import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { viewStudentResults } from '../../../services/api';
import TokenManager from '../../../utils/tokenManager';

interface ExamResult {
  id: string;
  exam_id: string;
  exam_name: string;
  score: number;
  status: string;
  commentary: string;
  created_at: string;
}

interface DecodedToken {
  data: {
    user_type: string;
    user_id: string;
  };
}

const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = () => {
      const decodedToken = TokenManager.getDecodedToken();
      if (decodedToken) {
        setUserId(decodedToken.data.user_id);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await viewStudentResults();
        if (!response || !response.results) {
          throw new Error('Invalid API response');
        }
        setResults(response.results);
        setError(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">Failed to load results. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Your Exam Results
      </Typography>

      <Grid container spacing={4}>
        {results.map((result) => (
          <Grid item xs={12} sm={6} md={4} key={result.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {result.exam_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Score: {result.score}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Status: {result.status}
                </Typography>
                {result.commentary && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Feedback: {result.commentary}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Submitted: {new Date(result.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {results.length === 0 && (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No exam results found.
        </Typography>
      )}
    </Box>
  );
};

export default StudentResultsPage;
