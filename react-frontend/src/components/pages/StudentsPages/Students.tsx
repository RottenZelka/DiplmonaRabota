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
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../../../services/api';
import BadRequest from '../../errors/BadRequest';
import NotFound from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServerError';

interface Student {
  user_id: string;
  name: string;
  profile_photo_url?: string;
}

interface PaginationData {
  total_count: number;
  page_count: number;
  current_page: number;
  page_size: number;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total_count: 0,
    page_count: 1,
    current_page: 1,
    page_size: 20
  });
  const navigate = useNavigate();

  const fetchStudents = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pagination.page_size.toString());

      const response = await getStudents(params);
      setStudents(response.students);
      setPagination(response.pagination);
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchStudents(value);
  };

  if (errorCode === 400) return <BadRequest />;
  if (errorCode === 404) return <NotFound />;
  if (errorCode === 500) return <InternalServerError />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Students
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load students. Please try again later.</Alert>
      ) : (students.length === 0 ? (
        <Typography variant="h6" textAlign="center">No students found.</Typography>
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
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      ))}
    </Box>
  );
};

export default Students;
