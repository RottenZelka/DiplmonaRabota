import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { getExamById, updateExam, deleteExam } from '../../../services/api';
import TokenManager from '../../../utils/tokenManager';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  passing_score: number;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editedExam, setEditedExam] = useState<Exam | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(id!);
        setExam(response.exam);
        setEditedExam(response.exam);
      } catch (err) {
        setError('Failed to load exam details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!editedExam) return;

    const { name, value, type, checked } = e.target;
    setEditedExam({
      ...editedExam,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async () => {
    if (!editedExam || !id) return;

    try {
      const response = await updateExam(id, editedExam);
      if (response.exam) {
        setExam(response.exam);
        setEditedExam(response.exam);
        setMessage({
          type: 'success',
          text: 'Exam updated successfully.',
        });
        setIsEditing(false);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to update exam. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    if (!exam) return;

    try {
      await deleteExam(exam.id);
      navigate('/exams');
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to delete exam. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!exam) {
    return (
      <Container>
        <Alert severity="error">Exam not found.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Exam Details
      </Typography>

      {message && (
        <Alert severity={message.type as 'success' | 'error'} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={isEditing ? editedExam?.title : exam.title}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={isEditing ? editedExam?.description : exam.description}
            onChange={handleInputChange}
            disabled={!isEditing}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={isEditing ? editedExam?.duration : exam.duration}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Passing Score"
            name="passing_score"
            type="number"
            value={isEditing ? editedExam?.passing_score : exam.passing_score}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isEditing ? editedExam?.is_mandatory : exam.is_mandatory}
                onChange={handleInputChange}
                name="is_mandatory"
                disabled={!isEditing}
              />
            }
            label="Mandatory Exam"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
        {isEditing ? (
          <Button variant="contained" color="success" onClick={handleSave}>
            Save Changes
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Exam
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default ExamDetails;
