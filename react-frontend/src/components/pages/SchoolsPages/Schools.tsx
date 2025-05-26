import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getSchoolLevels, getSchools, getStudies } from '../../../services/api';
import BadRequest from '../../errors/BadRequest';
import NotFound from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServerError';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../common/Pagination';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<Study[]>([]);
  const navigate = useNavigate();

  const { pagination, handlePageChange, updatePagination } = usePagination({
    onPageChange: (page) => fetchSchools(page)
  });

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

  const fetchSchools = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedLevels.forEach(level => params.append('level_ids[]', level.id));
      selectedStudies.forEach(study => params.append('study_ids[]', study.id));
      params.append('page', page.toString());
      params.append('page_size', pagination.page_size.toString());

      const response = await getSchools(params);
      setSchools(response.schools);
      updatePagination(response.pagination);
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

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleLevelChange = (event: React.SyntheticEvent, value: Level[]) => {
    setSelectedLevels(value);
  };

  const handleStudyChange = (event: React.SyntheticEvent, value: Study[]) => {
    setSelectedStudies(value);
  };

  const applyFilters = async () => {
    handlePageChange(1);
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
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            multiple
            disablePortal
            id="levels-filter"
            options={levels}
            getOptionLabel={(option) => option.name}
            value={selectedLevels}
            onChange={handleLevelChange}
            renderInput={(params) => <TextField {...params} label="Filter by Level" />}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            multiple
            disablePortal
            id="studies-filter"
            options={studies}
            getOptionLabel={(option) => option.name}
            value={selectedStudies}
            onChange={handleStudyChange}
            renderInput={(params) => <TextField {...params} label="Filter by Study" />}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
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
      ) : (schools.length === 0 ? (
        <Typography variant="h6" textAlign="center">No schools found matching your filters.</Typography>
      ) : (
        <>
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
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column',
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
                  <CardContent sx={{ flexGrow: 1 }}>
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
          <Pagination
            count={pagination.page_count}
            page={pagination.current_page}
            onChange={handlePageChange}
            showTotal
            total={pagination.total_count}
          />
        </>
      ))}
    </Box>
  );
};

export default Schools;
