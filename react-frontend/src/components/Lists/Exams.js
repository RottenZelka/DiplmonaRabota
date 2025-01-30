import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, CircularProgress, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        let schoolId = null;

        if (token) {
          const decodedToken = jwtDecode(token);
          schoolId = decodedToken.data.user_id;
          console.log(schoolId)
        }

        const response = await axios.get(`http://localhost:8888/api/exams/list-exams/${schoolId}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        });
        setExams(response.data.exams);
        setError(false);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };


      fetchExams();
  }, [schoolId]);

  const handleSchoolIdChange = (event) => {
    setSchoolId(event.target.value);
  };

  const handleCreateExam = () => {
    navigate('/create-exam');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Manage Exams
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
        <TextField
          label="School ID"
          value={schoolId}
          onChange={handleSchoolIdChange}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleCreateExam}>
          Create Exam
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load exams. Please try again later.</Alert>
      ) : (
        <Grid container spacing={4}>
          {exams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={exam.id}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => navigate(`/exam/${exam.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {exam.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time Needed: {exam.time_needed_minutes} minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mandatory: {exam.is_mandatory ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Exams;