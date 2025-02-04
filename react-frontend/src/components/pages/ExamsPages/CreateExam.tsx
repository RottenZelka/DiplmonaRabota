import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createExam, getStudies } from '../../../services/api';
import BubbleSelection from '../../common/BubbleSelection';

interface Study {
  id: string;
  name: string;
}

const CreateExam: React.FC = () => {
  const [name, setName] = useState('');
  const [timeNeeded, setTimeNeeded] = useState(60);
  const [isMandatory, setIsMandatory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await getStudies();
        setStudies(response.studies);
      } catch (err) {
        console.error('Error fetching studies:', err);
        setError('Failed to fetch studies');
      }
    };

    fetchStudies();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createExam({
        name,
        time_needed_minutes: timeNeeded,
        is_mandatory: isMandatory,
        studies: selectedStudies,
      });

      if (response.status === 'success') {
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

  const handleOptionToggle = (optionId: string) => {
    setSelectedStudies((prevSelected) =>
      prevSelected.includes(optionId)
        ? prevSelected.filter((id) => id !== optionId)
        : [...prevSelected, optionId]
    );
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
          onChange={(e) => setTimeNeeded(Number(e.target.value))}
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
        <BubbleSelection
          label="Studies"
          options={studies}
          selectedOptions={selectedStudies}
          onOptionToggle={handleOptionToggle}
        />
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
