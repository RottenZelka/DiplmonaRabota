import React, { useState, useEffect, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
  getExamQuestions,
  submitStudentAnswers,
  checkExamStatus,
  getExamById
} from '../../../services/api';
import { useFileUpload } from '../../../hooks/useFileUpload';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  max_points: number;
  choices: string;
  correct_answers_count: number;
}

interface UploadedFile {
  questionId: string;
  file: File;
  linkId: string;
}

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [tabSwitched, setTabSwitched] = useState(false);
  const [examStatus, setExamStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const { uploadFile, isUploading, progress } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    onSuccess: (linkId: string) => {
      setMessage({ type: 'success', text: 'File uploaded successfully' });
    },
    onError: (error: string) => {
      setMessage({ type: 'error', text: error });
    }
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await getExamQuestions(id!);
        const time = await getExamById(id!);
        setTimeLeft(time.exam.time_needed_minutes * 60);
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

  const handleSubmit = useCallback(async () => {
    if (examStatus === 'pending') {
      setError('Exam already submitted');
      return;
    }

    // Validate all required file uploads first
    const missingFiles = questions
      .filter(q => q.question_type === 'FAR')
      .filter(q => !uploadedFiles.some(f => f.questionId === q.id));

    if (missingFiles.length > 0) {
      const missingQuestions = missingFiles.map(q => q.question_text).join('\n');
      setMessage({ 
        type: 'error', 
        text: `Please upload at least one file for the following questions:\n${missingQuestions}` 
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processedAnswers = questions.map((question) => {
        if (question.question_type === 'FAR') {
          const filesForQuestion = uploadedFiles.filter(f => f.questionId === question.id);
          const linkIds = filesForQuestion.map(f => f.linkId).join(',');
          return { question_id: question.id, answer: linkIds };
        } else {
          return { question_id: question.id, answer: answers[question.id] || '' };
        }
      });

      const response = await submitStudentAnswers({ exam_id: id, answers: processedAnswers });
      if (response.status === 'success') {
        setMessage({ type: 'success', text: 'Exam submitted successfully' });
        navigate('/student-results');
      } else {
        setError('Submission failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission error');
    } finally {
      setLoading(false);
    }
  }, [examStatus, questions, uploadedFiles, answers, id, navigate]);

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
  }, [handleSubmit]);

  useEffect(() => {
    if (tabSwitched) {
      handleSubmit();
    }
  }, [tabSwitched, handleSubmit]);

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

  const handleRemoveFile = (questionId: string, file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.questionId !== questionId || f.file !== file));
  };

  const FileUploadDropzone = ({ questionId }: { questionId: string }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: async (acceptedFiles) => {
        for (const file of acceptedFiles) {
          try {
            const linkId = await uploadFile(file, 'Answer');
            if (linkId) {
              setUploadedFiles(prev => [...prev, { questionId, file, linkId }]);
            }
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }
      },
      maxSize: 5 * 1024 * 1024,
      multiple: true,
      accept: {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      }
    });

    const filesForQuestion = uploadedFiles.filter(f => f.questionId === questionId);

    return (
      <Box>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {isDragActive ? 'Drop the files here' : 'Drag & drop files here, or click to select files'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supported formats: PDF, JPG, PNG (Max size: 5MB)
          </Typography>
        </Box>

        {filesForQuestion.length > 0 && (
          <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {filesForQuestion.map((fileObj, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(questionId, fileObj.file)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 }
                }}
              >
                <ListItemText
                  primary={fileObj.file.name}
                  secondary={`${(fileObj.file.size / 1024).toFixed(2)} KB`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {isUploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Uploading files... {progress}%
            </Typography>
          </Box>
        )}
      </Box>
    );
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
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Take Exam
      </Typography>

      <Typography variant="h6" sx={{ mb: 4, textAlign: 'center' }}>
        Time Remaining: {formatTime(timeLeft)}
      </Typography>

      {message && (
        <Alert 
          severity={message.type as 'success' | 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

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
          ) : question.question_type === 'TTA' || question.question_type === 'LTA' ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          ) : question.question_type === 'FAR' ? (
            <FileUploadDropzone questionId={question.id} />
          ) : null}
        </Box>
      ))}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          disabled={loading || isUploading}
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Exam'}
        </Button>
      </Box>
    </Box>
  );
};

export default TakeExam;