import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getSchoolLevels, getSchools, getStudies } from '../../../services/api';
import BadRequest from '../../errors/BadRequest';
import NotFound from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServerError';

interface School {
  user_id: string;
  name: string;
  address: string;
  profile_photo_url?: string;
}

interface Level {
  id: string;
  name: string;
}

interface Study {
  id: string;
  name: string;
}

const Schools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<Level[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [filter, setFilter] = useState<{ level: string; study: string }>({ level: '', study: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [levelsRes, studiesRes] = await Promise.all([
          getSchoolLevels(),
          getStudies(),
        ]);
        setLevels(levelsRes.levels);
        setStudies(studiesRes.studies);
      } catch (err: any) {
        setError(true);
        if (err?.response?.status === 400) setErrorCode(400);
        else if (err?.response?.status === 404) setErrorCode(404);
        else if (err?.response?.status === 500) setErrorCode(500);
        else setErrorCode(null);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const response = await getSchools();
        setSchools(response.schools);
        setError(false);
      } catch (err: any) {
        setError(true);
        if (err?.response?.status === 400) setErrorCode(400);
        else if (err?.response?.status === 404) setErrorCode(404);
        else if (err?.response?.status === 500) setErrorCode(500);
        else setErrorCode(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
    if (name === 'level') {
      if (value) {
        setFilteredLevels(
          levels.filter((level) =>
            level.name.toLowerCase().includes(value.toLowerCase())
          )
        );
      } else {
        setFilteredLevels([]);
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
        setFilteredStudies([]);
      }
    }
  };

  const handleSelection = (name: string, value: string) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
    if (name === 'level') setFilteredLevels([]);
    if (name === 'study') setFilteredStudies([]);
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.level) params.append('level', filter.level);
      if (filter.study) params.append('study', filter.study);
      const url = `http://localhost:8888/api/schools?${params.toString()}`;
      const response = await axios.get(url);
      setSchools(response.data.schools);
      setError(false);
    } catch (err: any) {
      setError(true);
      if (err?.response?.status === 400) setErrorCode(400);
      else if (err?.response?.status === 404) setErrorCode(404);
      else if (err?.response?.status === 500) setErrorCode(500);
      else setErrorCode(null);
    } finally {
      setLoading(false);
    }
  };

  if (errorCode === 400) return <BadRequest />;
  if (errorCode === 404) return <NotFound />;
  if (errorCode === 500) return <InternalServerError />;

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
        <Button variant="contained" color="primary" onClick={applyFilters} sx={{ height: 56 }}>
          Apply Filters
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load schools. Please try again later.</Alert>
      ) : (
        <Grid container spacing={4}>
          {schools.map((school) => (
            <Grid item xs={12} sm={6} md={4} key={school.user_id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
                onClick={() => navigate(`/profile/${school.user_id}`)}
              >
                {school.profile_photo_url && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={school.profile_photo_url}
                    alt={school.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {school.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
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
