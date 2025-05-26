import React, { useState, useContext, useEffect } from 'react';
import {
  Typography,
  Box,
  Avatar,
  Grid,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useSaveSchool } from '../../../../hooks/useSaveSchool';
import { checkIfApplied } from '../../../../services/api';

interface SchoolProfile {
  user_id: string;
  name: string;
  profile_photo_id: string;
  created_at: string;
  updated_at: string;
  profile_photo_url: string;
  study_names: string;
  level_names: string;
  description?: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
}

interface ProfileProps {
  profile: {
    school?: SchoolProfile;
  };
}

const StudentViewingSchool: React.FC<ProfileProps> = ({ profile }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const { saveSchool, isSaving, error: saveError, isSaved, checkSavedStatus } = useSaveSchool();
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.school?.user_id) {
      checkSavedStatus(profile.school.user_id);
    }
  }, [profile.school?.user_id, checkSavedStatus]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const response = await checkIfApplied(profile.school?.user_id || '');
        if (response.status === 'success') {
          setIsApplied(response.is_applied);
          setApplicationId(response.application_id || null);
        }
      } catch (err) {
        console.error('Error checking application status:', err);
        setError('Failed to check application status');
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();
  }, [profile.school?.user_id]);

  if (!profile.school) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">School profile not found</Alert>
      </Box>
    );
  }

  const school = profile.school;
  const studyNames = school.study_names ? school.study_names.split(', ') : [];
  const levelNames = school.level_names ? school.level_names.split(', ') : [];

  const handleSaveSchool = async () => {
    if (!isAuthenticated) {
      setError('Please log in to save schools');
      return;
    }
    await saveSchool(school.user_id);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      setError('Please log in to apply to schools');
      return;
    }
    navigate(`/apply/${school.user_id}`);
  };

  const handleViewApplication = () => {
    if (applicationId) {
      navigate(`/application/${applicationId}`);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            src={school.profile_photo_url}
            alt={school.name}
            sx={{
              width: 200,
              height: 200,
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setOpenPfpDialog(true)}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            {school.name}
          </Typography>

          {school.address && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {school.address}
            </Typography>
          )}

          {school.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {school.description}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Studies Offered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {studyNames.length > 0 ? (
                  studyNames.map((study, index) => (
                    <Chip
                      key={index}
                      label={study}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No studies listed
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Levels Available
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {levelNames.length > 0 ? (
                  levelNames.map((level, index) => (
                    <Chip
                      key={index}
                      label={level}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No levels listed
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {(school.contact_email || school.phone_number) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                {school.contact_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{school.contact_email}</Typography>
                  </Box>
                )}
                {school.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{school.phone_number}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveSchool}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save School'}
            </Button>

            {loading ? (
              <CircularProgress size={24} />
            ) : isApplied ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleViewApplication}
              >
                View Application
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleApply}
              >
                Apply Now
              </Button>
            )}
          </Box>

          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={openPfpDialog}
        onClose={() => setOpenPfpDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <img
            src={school.profile_photo_url}
            alt={school.name}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentViewingSchool;