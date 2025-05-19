import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert, CircularProgress } from '@mui/material';
import { getUserById, getUserType } from '../../../services/api';
import { useAuthContext } from '../../../context/AuthContext';
import BadRequest from '../../../components/errors/BadRequest';
import InternalServerError from '../../../components/errors/InternalServerError';
import NotFound from '../../../components/errors/NotFound';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [viewType, setViewType] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuthContext();
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userTypeRaw = await getUserType(id!);
        const userType = userTypeRaw.data.user_type;

        if (user) {
          if (user.id === userTypeRaw.data.user_id) {
            setViewType(user.user_type === 'student' ? 'StudentProfile' : 'SchoolProfile');
          } else if (user.user_type === 'student') {
            setViewType(userType === 'school' ? 'StudentViewingSchool' : 'StudentViewing');
          } else if (user.user_type === 'school') {
            setViewType(userType === 'student' ? 'SchoolViewingStudent' : 'SchoolViewing');
          }
        } else {
          setViewType(userType === 'student' ? 'NonUserStudent' : 'NonUserSchool');
        }

        const profileResponse = await getUserById(userType, id!);
        setProfile(profileResponse);
      } catch (error: any) {
        console.error('Error fetching profile details:', error);
        setError(true);
        if (error?.response?.status === 400) setErrorCode(400);
        else if (error?.response?.status === 404) setErrorCode(404);
        else if (error?.response?.status === 500) setErrorCode(500);
        else setErrorCode(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const renderView = () => {
    if (!profile) return <Typography variant="body1">Loading...</Typography>;

    try {
      const ViewComponent = require(`./views/${viewType}`).default;
      if (errorCode === 400) return <BadRequest />;
      if (errorCode === 404) return <NotFound />;
      if (errorCode === 500) return <InternalServerError />;
      return <ViewComponent profile={profile} />;
    } catch (e) {
      console.error('Error loading view component:', e);
      return (
        <Typography variant="h6" color="textSecondary">
          Unable to display this profile view.
        </Typography>
      );
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 3, py: 4 }}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <CircularProgress color="primary" />
          <Typography variant="body1" mt={2}>
            Loading profile data...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 600, width: '100%', mb: 2 }}>
          Unable to load profile data. Please try again later.
        </Alert>
      ) : (
        <Box sx={{ maxWidth: 800, width: '100%', bgcolor: 'background.paper', borderRadius: 2, p: 3, boxShadow: 1 }}>
          {renderView()}
        </Box>
      )}
    </Box>
  );
};

export default Profile;
