import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import { Edit, Save, Delete, Cancel, School as SchoolIcon, Person as PersonIcon } from '@mui/icons-material';
import { getStudies, deleteUser, updateStudent } from '../../../../services/api';
import BubbleSelection from '../../../common/BubbleSelection';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useFileUpload } from '../../../../hooks/useFileUpload';
import { alpha } from '@mui/material/styles';

interface Study {
  id: string;
  name: string;
}

interface StudentProfileProps {
  profile: any;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ profile }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(profile.student);
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const { uploadFile, isUploading, error: uploadError, progress } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png'],
    onSuccess: (linkId) => {
      setMessage({ type: 'success', text: 'Profile photo uploaded successfully' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error });
    }
  });

  useEffect(() => {
    setEditedData(profile.student);
  }, [profile.student]);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const studiesResponse = await getStudies();
        if (studiesResponse.status === 'success') setStudies(studiesResponse.studies);
      } catch (error) {
        setError('Failed to fetch studies');
      }
    };

    fetchStudies();
  }, []);

  useEffect(() => {
    if (profile.student.study_names && studies.length) {
      const studyNames = profile.student.study_names.split(', ');
      const selectedIds = studies.filter(s => studyNames.includes(s.name)).map(s => s.id);
      setSelectedStudies(selectedIds);
    }
  }, [profile, studies]);

  const handleStudyToggle = (id: string) => {
    setSelectedStudies(prev => prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]);
  };

  useEffect(() => {
    if (editMode) {
      const studyNames = selectedStudies.map(id =>
        studies.find(s => s.id === id)?.name).filter(Boolean).join(', ');

      setEditedData((prev: any) => ({
        ...prev,
        study_names: studyNames
      }));
    }
  }, [selectedStudies, editMode, studies]);

  const handlePfpClick = () => setOpenPfpDialog(true);
  const handleCloseDialog = () => setOpenPfpDialog(false);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) setEditedData(profile.student);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile && tempImage === null) {
      return profile.student.profile_photo_id;
    }

    if (!profilePhotoFile) {
      return null;
    }

    try {
      const linkId = await uploadFile(profilePhotoFile, 'Profile Image');
      if (!linkId) {
        throw new Error('Failed to upload profile photo');
      }
      return linkId;
    } catch (error: any) {
      setError('Failed to upload image');
      throw error;
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      setTempImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const photoId = await handlePhotoUpload();

      const payload = {
        ...editedData,
        profile_photo_id: photoId
      };

      const response = await updateStudent(payload);
      if (response.status === 'success') {
        setEditMode(false);
        setTempImage(null);
        setError(null);
        navigate(`/profile/${profile.student.user_id}`);
      } else {
        throw new Error(response.message || 'Failed to save changes');
      }
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      setLoading(true);
      setError(null);
      try {
        const response = await deleteUser();
        if (response.status === 'success') {
          localStorage.removeItem('jwtToken');
          navigate('/');
        } else {
          throw new Error(response.message || 'Failed to delete profile');
        }
      } catch (err) {
        setError('Failed to delete profile');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setEditedData((prev: any) => ({ ...prev, profile_photo_id: null, profile_photo_url: null }));
    setTempImage(null);
    setProfilePhotoFile(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      color: 'text.primary',
      py: 4
    }}>
      {loading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '90%', maxWidth: 1200 }}>
          {error}
        </Alert>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2, width: '90%', maxWidth: 1200 }}>
          {uploadError}
        </Alert>
      )}

      {isUploading && (
        <Box sx={{ width: '90%', maxWidth: 1200, mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center">
            Uploading profile photo... {progress}%
          </Typography>
        </Box>
      )}

      <Card sx={{ 
        width: '90%', 
        maxWidth: 1200,
        margin: 3, 
        bgcolor: 'background.paper', 
        color: 'text.primary', 
        borderRadius: 2, 
        boxShadow: theme.shadows[2],
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              color: 'text.primary'
            }}>
              {editMode ? (
                <TextField
                  name="name"
                  value={editedData.name}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  disabled={loading}
                />
              ) : editedData.name}
            </Typography>

            <Box>
              <IconButton
                onClick={handleEditToggle}
                color="primary"
                disabled={loading}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05) 
                  }
                }}
              >
                {editMode ? <Cancel /> : <Edit />}
              </IconButton>
              <IconButton
                onClick={handleDelete}
                color="error"
                disabled={loading}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.error.main, 0.05) 
                  }
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={tempImage || editedData.profile_photo_url}
                sx={{
                  width: 180,
                  height: 180,
                  cursor: 'pointer',
                  border: `2px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[1],
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[2]
                  },
                  transition: 'all 0.2s ease'
                }}
                onClick={handlePfpClick}
              />
              {editMode && (
                <Stack spacing={1} sx={{ width: '100%', maxWidth: 200 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    disabled={loading}
                    fullWidth
                    size="small"
                  >
                    Change Photo
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      type="file"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                    fullWidth
                    size="small"
                  >
                    Remove Photo
                  </Button>
                </Stack>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Personal Information
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Full Name"
                        name="name"
                        value={editedData.name}
                        onChange={handleChange}
                        fullWidth
                        disabled={!editMode || loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={editedData.dob}
                        onChange={handleChange}
                        fullWidth
                        disabled={!editMode || loading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Studies
                    </Typography>
                  </Box>
                  {editMode ? (
                    <BubbleSelection
                      label="Studies"
                      options={studies}
                      selectedOptions={selectedStudies}
                      onOptionToggle={handleStudyToggle}
                    />
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {editedData.study_names ? (
                        editedData.study_names.split(', ').map((study: string, index: number) => (
                          <Chip
                            key={index}
                            label={study}
                            sx={{ 
                              m: 0.5,
                              bgcolor: 'background.default',
                              border: `1px solid ${theme.palette.divider}`,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No studies listed
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          {editMode && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ 
                  px: 6, 
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[2]
                  },
                  transition: 'all 0.2s ease'
                }}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={openPfpDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0, bgcolor: 'background.paper' }}>
          <img
            src={tempImage || editedData.profile_photo_url}
            alt={editedData.name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentProfile;