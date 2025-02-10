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
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
  getExamQuestions,
  submitStudentAnswers,
  uploadLink,
  checkExamStatus,
  getExamById
} from '../../../services/api';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  max_points: number;
  choices: string;
  correct_answers_count: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [selectedFiles, setSelectedFiles] = useState<Array<{ questionId: string; file: File }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [tabSwitched, setTabSwitched] = useState(false);
  const [examStatus, setExamStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await getExamQuestions(id!);
        const time = await getExamById(id!);
        console.log(time.exam.time_needed_minutes);
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

  const handleRemoveFile = (questionId: string, file: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f.questionId !== questionId || f.file !== file));
  };

  const FileUploadDropzone = ({ questionId }: { questionId: string }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => {
        const newFiles = acceptedFiles.map((file) => ({ questionId, file }));
        setSelectedFiles((prev) => [...prev, ...newFiles]);
      },
      maxSize: MAX_FILE_SIZE,
      multiple: true,
    });

    return (
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : '#fff',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here</p> : <p>Drag & drop files here, or click to select files</p>}
      </Box>
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;
    setLoading(true);
    try {
      const response = await uploadLink(file, 'File');
      if (response.status === 'success') return response.link_id;
      throw new Error(response.message);
    } catch (err) {
      setError('File upload failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (examStatus === 'pending') {
      setError('Exam already submitted');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processedAnswers = await Promise.all(
        questions.map(async (question) => {
          if (question.question_type === 'FAR') {
            const filesForQuestion = selectedFiles.filter((f) => f.questionId === question.id);
            if (filesForQuestion.length === 0) return { question_id: question.id, answer: '' };

            const linkIds = await Promise.all(
              filesForQuestion.map(async (fileObj) => {
                const linkId = await handleFileUpload(fileObj.file);
                if (!linkId) throw new Error('File upload failed');
                return linkId;
              })
            );

            return { question_id: question.id, answer: linkIds.join(',') };
          } else {
            return { question_id: question.id, answer: answers[question.id] || '' };
          }
        })
      );

      const response = await submitStudentAnswers({ exam_id: id, answers: processedAnswers });
      if (response.status === 'success') navigate('/student-results');
      else setError('Submission failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission error');
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
            <Box>
              <FileUploadDropzone questionId={question.id} />
              {selectedFiles.filter((f) => f.questionId === question.id).length > 0 && (
                <List>
                  {selectedFiles
                    .filter((f) => f.questionId === question.id)
                    .map((fileObj, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFile(question.id, fileObj.file)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={fileObj.file.name}
                          secondary={`${(fileObj.file.size / 1024).toFixed(2)} KB`}
                        />
                      </ListItem>
                    ))}
                </List>
              )}
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