import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, TextField, Button, CircularProgress, Alert, List, ListItemButton, ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [levels, setLevels] = useState([]);
  const [studies, setStudies] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState({ level: '', study: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [levelsRes, studiesRes] = await Promise.all([
          axios.get('http://localhost:8888/api/levels'),
          axios.get('http://localhost:8888/api/studies'),
        ]);

        setLevels(levelsRes.data.levels);
        setStudies(studiesRes.data.studies);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilters();
  }, []);

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

  const handleSearchChange = (event) => {
    const { name, value } = event.target;

    // Update the filter value for display
    setFilter((prev) => ({ ...prev, [name]: value }));

    // Dynamically filter based on search input
    if (name === 'level') {
      if (value) {
        setFilteredLevels(
          levels.filter((level) =>
            level.name.toLowerCase().includes(value.toLowerCase())
          )
        );
      } else {
        setFilteredLevels([]); // Clear dropdown if input is empty
      }
    }

    if (name === 'study') {
      if (value) {
        setFilteredStudies(
          studies.filter((study) =>
            study.name.toLowerCase().includes(value.toLowerCase())
          )
        );
      } else {
        setFilteredStudies([]); // Clear dropdown if input is empty
      }
    }
  };

  const handleSelection = (name, value) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
    // Clear the filtered options once a selection is made
    if (name === 'level') setFilteredLevels([]);
    if (name === 'study') setFilteredStudies([]);
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      // Construct query parameters dynamically
      const params = new URLSearchParams();
      if (filter.level) params.append('level', filter.level);
      if (filter.study) params.append('study', filter.study);
  
      const url = `http://localhost:8888/api/schools?${params.toString()}`;
  
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
        {/* Level Filter with Search */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <TextField
            label="Search Level"
            name="level"
            value={filter.level}
            onChange={handleSearchChange}
            fullWidth
          />
          {filter.level && filteredLevels.length > 0 && (
            <List
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'black',
                border: '1px solid #ccc',
                borderRadius: 1,
                maxHeight: 200,
                overflowY: 'auto',
                zIndex: 10,
              }}
            >
              {filteredLevels.map((level) => (
                <ListItemButton
                  key={level.id}
                  onClick={() => handleSelection('level', level.name)}
                >
                  <ListItemText primary={level.name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        {/* Study Filter with Search */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <TextField
            label="Search Study"
            name="study"
            value={filter.study}
            onChange={handleSearchChange}
            fullWidth
          />
          {filter.study && filteredStudies.length > 0 && (
            <List
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'black',
                border: '1px solid #ccc',
                borderRadius: 1,
                maxHeight: 200,
                overflowY: 'auto',
                zIndex: 10,
              }}
            >
              {filteredStudies.map((study) => (
                <ListItemButton
                  key={study.id}
                  onClick={() => handleSelection('study', study.name)}
                >
                  <ListItemText primary={study.name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Button variant="contained" color="primary" onClick={applyFilters}>
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
