import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const SolveExam = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if the user is a student
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

    fetchExamDetails();
  }, [navigate, id]);

  const fetchExamDetails = async () => {
    setLoading(true);
    try {
      const [examRes, questionsRes] = await Promise.all([
        axios.get(`http://localhost:8888/api/exams/${id}`),
        axios.get(`http://localhost:8888/api/exam-questions/get-exam-questions/${id}`),
      ]);

      setExam(examRes.data.exam);
      setQuestions(questionsRes.data.questions);
      setError('');
    } catch (err) {
      console.error('Error fetching exam details:', err);
      setError('Failed to load exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        question_id: questionId,
        answer: answers[questionId],
      }));

      const response = await axios.post('http://localhost:8888/api/student-answers/submit', {
        exam_id: id,
        answers: formattedAnswers,
      });

      if (response.data.status === 'success') {
        navigate(`/exam/${id}/results`);
      } else {
        setError('Failed to submit exam');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Failed to submit exam. Please check the console for details.');
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
        Solve Exam: {exam?.name}
      </Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {questions.map((question) => (
          <Box key={question.id} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {question.question_text}
            </Typography>

            {question.question_type === 'MCQ' ? (
              <FormControl component="fieldset">
                <FormLabel component="legend">Choose the correct answer:</FormLabel>
                <RadioGroup
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                >
                  {question.choices.split(',').map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice}
                      control={<Radio />}
                      label={choice}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ) : (
              <TextField
                label="Your Answer"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            )}
          </Box>
        ))}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Exam'}
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

export default SolveExam;