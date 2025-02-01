import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  Tooltip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { createExamQuestion, getQuestionTypes } from '../../../services/api';

const AddQuestion = () => {
  const { id } = useParams();
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [questionTypes, setQuestionTypes] = useState([]); // Fetch question types from API
  const [choices, setChoices] = useState(['']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [maxPoints, setMaxPoints] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch question types from API
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        const response = await getQuestionTypes();
        setQuestionTypes(response.types);
      } catch (err) {
        console.error('Error fetching question types:', err);
        setError('Failed to fetch question types');
      }
    };

    fetchQuestionTypes();
  }, []);

  // Handle adding a new choice for MCQ
  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  // Handle updating a choice
  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  // Handle selecting/deselecting correct answers for MCQ
  const handleCorrectAnswerChange = (choice) => {
    const newCorrectAnswers = [...correctAnswers];
    if (newCorrectAnswers.includes(choice)) {
      setCorrectAnswers(newCorrectAnswers.filter((ans) => ans !== choice));
    } else {
      setCorrectAnswers([...newCorrectAnswers, choice]);
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedData = {
        exam_id: id,
        question_text: questionText,
        question_type: questionType,
        max_points: maxPoints,
        choices: questionType === 'MCQ' ? choices.join(',') : null,
        correct_answer: questionType === 'MCQ' ? correctAnswers.join(',') : null,
      };

      const response = await createExamQuestion(formattedData);

      if (response.status === 'success') {
        navigate(`/exam/${id}`);
      } else {
        setError('Failed to add question');
      }
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Add Question
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Question Text */}
        <TextField
          label="Question Text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {/* Question Type Dropdown */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Question Type</InputLabel>
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            label="Question Type"
          >
            {questionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* MCQ Choices (only shown if question type is MCQ) */}
        {questionType === 'MCQ' && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Choices
            </Typography>
            {choices.map((choice, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                    label={`Choice ${index + 1}`}
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    />
                    <Tooltip title="Mark as correct answer" placement="top">
                    <Checkbox
                        checked={correctAnswers.includes(choice)}
                        onChange={() => handleCorrectAnswerChange(choice)}
                    />
                    </Tooltip>
                </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddChoice}
              sx={{ mt: 2 }}
            >
              Add Choice
            </Button>
          </>
        )}

        {/* Max Points */}
        <TextField
          label="Max Points"
          type="number"
          value={maxPoints}
          onChange={(e) => setMaxPoints(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {/* Submit Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Question'}
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AddQuestion;