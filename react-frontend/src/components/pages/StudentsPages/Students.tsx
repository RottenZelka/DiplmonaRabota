import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../../../services/api';

interface Student {
  user_id: string;
  name: string;
  address: string;
  profile_photo_url?: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await getStudents();
        setStudents(response.students);
        setError(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Explore Students
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load students. Please try again later.</Alert>
      ) : (
        <Grid container spacing={4}>
          {students.map((student) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={student.user_id}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${student.user_id}`)}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={student.profile_photo_url || '/placeholder.jpg'}
                  alt={student.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.address}
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

export default Students;
