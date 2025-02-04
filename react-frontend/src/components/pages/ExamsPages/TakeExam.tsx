import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamQuestions, submitStudentAnswers, uploadLink, checkExamStatus } from '../../../services/api';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  max_points: number;
  choices: string;
  correct_answers_count: number;
}

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [tabSwitched, setTabSwitched] = useState(false);
  const [examStatus, setExamStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await getExamQuestions(id!);
        setQuestions(response.questions);
        setError('');
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    const checkStatus = async () => {
      try {
        const response = await checkExamStatus(id!);
        setExamStatus(response.status);
      } catch (err) {
        console.error('Error checking exam status:', err);
        setError('Failed to check exam status');
      }
    };

    fetchQuestions();
    checkStatus();
  }, [id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitched(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (tabSwitched) {
      handleSubmit();
    }
  }, [tabSwitched]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerChange = (questionId: string, answer: string, isCheckbox = false) => {
    if (isCheckbox) {
      const currentAnswers = answers[questionId] ? answers[questionId].split(',') : [];
      const answerIndex = currentAnswers.indexOf(answer);

      if (answerIndex === -1) {
        currentAnswers.push(answer);
      } else {
        currentAnswers.splice(answerIndex, 1);
      }

      setAnswers({ ...answers, [questionId]: currentAnswers.join(',') });
    } else {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const handleFileChange = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles({ ...selectedFiles, [questionId]: event.target.files ? event.target.files[0] : null });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setLoading(true);
    try {
      const response = await uploadLink(file, 'File');
      if (response.status === 'success') {
        return response.link_id;
      } else {
        throw new Error(response.message || 'File upload failed.');
      }
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (examStatus === 'pending') {
      setError('Exam is already submitted and waiting for review.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formattedAnswers = await Promise.all(
        Object.keys(answers).map(async (questionId) => {
          let answer = answers[questionId];
          if (selectedFiles[questionId]) {
            const fileLink = await handleFileUpload(selectedFiles[questionId] as File);
            if (!fileLink) {
              setError('File upload failed for one or more questions.');
              return null;
            }
            answer = fileLink;
          }
          return { question_id: questionId, answer };
        })
      );

      if (formattedAnswers.includes(null)) return;

      const response = await submitStudentAnswers({ exam_id: id, answers: formattedAnswers });

      if (response.status === 'success') {
        navigate('/student-results');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Take Exam
      </Typography>

      <Typography variant="h6" sx={{ mb: 4, textAlign: 'center' }}>
        Time Remaining: {formatTime(timeLeft)}
      </Typography>

      {questions.map((question) => (
        <Box key={question.id} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {question.question_text} (Max Points: {question.max_points})
          </Typography>

          {question.question_type === 'MCQ' && question.correct_answers_count > 1 ? (
            <Box>
              {question.choices.split(',').map((choice, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={answers[question.id]?.includes(choice) || false}
                      onChange={(e) => handleAnswerChange(question.id, choice, true)}
                      disabled={
                        answers[question.id]?.split(',').length >= question.correct_answers_count &&
                        !answers[question.id]?.includes(choice)
                      }
                    />
                  }
                  label={choice}
                />
              ))}
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Select up to {question.correct_answers_count} correct answers.
              </Typography>
            </Box>
          ) : question.question_type === 'MCQ' ? (
            <RadioGroup
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.choices.split(',').map((choice, index) => (
                <FormControlLabel key={index} value={choice} control={<Radio />} label={choice} />
              ))}
            </RadioGroup>
          ) : question.question_type === 'TTA' ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          ) : question.question_type === 'LTA' ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          ) : question.question_type === 'FTA' ? (
            <Box>
              <input type="file" onChange={(e) => handleFileChange(question.id, e)} />
            </Box>
          ) : null}
        </Box>
      ))}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit Exam'}
        </Button>
      </Box>
    </Box>
  );
};

export default TakeExam;
