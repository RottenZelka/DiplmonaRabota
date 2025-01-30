import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SubmitAnswers = () => {
  const { examId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login'); // Redirect to login if no token
      return;
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.data.user_type !== 'student') {
      navigate('/'); // Redirect to home if not a student
      return;
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8888/api/student-answers/submit', {
        exam_id: examId,
        answers: answers,
      });

      if (response.data.status === 'success') {
        setError('Answers submitted successfully');
      } else {
        setError('Failed to submit answers');
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Failed to submit answers. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Submit Answers
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        {answers.map((answer, index) => (
          <TextField
            key={index}
            label={`Answer for Question ${index + 1}`}
            value={answer.answer}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index].answer = e.target.value;
              setAnswers(newAnswers);
            }}
            fullWidth
            margin="normal"
            required
          />
        ))}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit Answers'}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default SubmitAnswers;