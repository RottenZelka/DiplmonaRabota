import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createExam } from '../../../services/api';

const CreateExam = () => {
  const [name, setName] = useState('');
  const [timeNeeded, setTimeNeeded] = useState(60);
  const [isMandatory, setIsMandatory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
        console.log(isMandatory);
      const response = await createExam({
        name,
        time_needed_minutes: timeNeeded,
        is_mandatory: isMandatory,
      });

      if (response.status === 'success') {
        console.log(response);
        navigate(`/exam/${response.exam.id}/add-question`);
      } else {
        setError('Failed to create exam');
      }
    } catch (err) {
      console.error('Error creating exam:', err);
      setError('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Create Exam
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        <TextField
          label="Exam Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Time Needed (minutes)"
          type="number"
          value={timeNeeded}
          onChange={(e) => setTimeNeeded(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Mandatory:
          </Typography>
          <Button
            variant={isMandatory ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setIsMandatory(1)}
          >
            Yes
          </Button>
          <Button
            variant={!isMandatory ? 'contained' : 'outlined'}
            color="secondary"
            onClick={() => setIsMandatory(0)}
            sx={{ ml: 2 }}
          >
            No
          </Button>
        </Box>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Exam'}
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

export default CreateExam;