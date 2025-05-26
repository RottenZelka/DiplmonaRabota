import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getStudents, getStudies } from '../../../services/api';
import BadRequest from '../../errors/BadRequest';
import NotFound from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServerError';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../common/Pagination';

interface Student {
  user_id: string;
  name: string;
  profile_photo_url?: string;
}

interface Study {
  id: string;
  name: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<Study[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const navigate = useNavigate();

  const { pagination, handlePageChange, updatePagination } = usePagination({
    onPageChange: (page) => fetchStudents(page)
  });

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await getStudies();
        if (response.status === 'success') {
          setStudies(response.studies);
        }
      } catch (error) {
        console.error('Error fetching studies:', error);
      }
    };

    fetchStudies();
  }, []);

  const fetchStudents = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pagination.page_size.toString());
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      selectedStudies.forEach(study => {
        params.append('study_ids[]', study.id);
      });

      const response = await getStudents(params);
      setStudents(response.students);
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
    fetchStudents();
  }, []);

  const handleStudyChange = (event: React.SyntheticEvent, value: Study[]) => {
    setSelectedStudies(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const applyFilters = () => {
    handlePageChange(1);
  };

  if (errorCode === 400) return <BadRequest />;
  if (errorCode === 404) return <NotFound />;
  if (errorCode === 500) return <InternalServerError />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Students
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
          <TextField
            label="Search by name"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
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
        <Alert severity="error">Failed to load students. Please try again later.</Alert>
      ) : (students.length === 0 ? (
        <Typography variant="h6" textAlign="center">No students found matching your filters.</Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {students.map((student) => (
              <Grid item xs={12} sm={6} md={4} key={student.user_id}>
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
                  onClick={() => navigate(`/profile/${student.user_id}`)}
                >
                  {student.profile_photo_url && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={student.profile_photo_url}
                      alt={student.name}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {student.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.page_count}
              page={pagination.current_page}
              onChange={handlePageChange}
              showTotal
              total={pagination.total_count}
            />
          </Box>
        </>
      ))}
    </Box>
  );
};

export default Students;
