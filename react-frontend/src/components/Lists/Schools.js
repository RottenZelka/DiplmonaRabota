import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, TextField, MenuItem, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState({ level: '', study: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8888/api/schools');
        setSchools(response.data.schools);
        setError(false);
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8888/api/schools';
      if (filter.level) url = `http://localhost:8888/api/school/filter-by-level/${filter.level}`;
      if (filter.study) url = `http://localhost:8888/api/school/filter-by-study/${filter.study}`;
      
      const response = await axios.get(url);
      setSchools(response.data.schools);
      setError(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Explore Schools
      </Typography>

      <Box
        sx={{
          mb: 4,
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          select
          label="Filter by Level"
          name="level"
          value={filter.level}
          onChange={handleFilterChange}
          fullWidth
        >
          <MenuItem value="">All Levels</MenuItem>
          <MenuItem value="primary">Primary</MenuItem>
          <MenuItem value="secondary">Secondary</MenuItem>
          <MenuItem value="highschool">High School</MenuItem>
        </TextField>

        <TextField
          select
          label="Filter by Study"
          name="study"
          value={filter.study}
          onChange={handleFilterChange}
          fullWidth
        >
          <MenuItem value="">All Studies</MenuItem>
          <MenuItem value="science">Science</MenuItem>
          <MenuItem value="arts">Arts</MenuItem>
          <MenuItem value="commerce">Commerce</MenuItem>
        </TextField>

        <Button
          variant="contained"
          color="primary"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load schools. Please try again later.</Alert>
      ) : (
        <Grid container spacing={4}>
          {schools.map((school) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={school.user_id}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${school.user_id}`)}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={school.profile_photo_url || '/placeholder.jpg'}
                  alt={school.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {school.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {school.address}
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

export default Schools;
