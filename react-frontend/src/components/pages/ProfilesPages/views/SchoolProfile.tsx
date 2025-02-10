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
  InputAdornment,
} from '@mui/material';
import { Edit, Save, Delete, Cancel, Search as SearchIcon } from '@mui/icons-material';
import { uploadLink, getSchoolLevels, getStudies, updateSchool, deleteUser } from '../../../../services/api';
import BubbleSelection from '../../../common/BubbleSelection';
import { useNavigate } from 'react-router-dom';

interface Study {
  id: string;
  name: string;
}

interface Level {
  id: string;
  name: string;
}

interface SchoolProfileProps {
  profile: any;
}

const SchoolProfile: React.FC<SchoolProfileProps> = ({ profile }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(profile.school);
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setEditedData(profile.school);
  }, [profile.school]);

  useEffect(() => {
    const fetchLevelsAndStudies = async () => {
      try {
        const [levelsResponse, studiesResponse] = await Promise.all([
          getSchoolLevels(),
          getStudies(),
        ]);

        if (levelsResponse.status === 'success') setLevels(levelsResponse.levels);
        if (studiesResponse.status === 'success') setStudies(studiesResponse.studies);
      } catch (error) {
        setError('Failed to fetch levels and studies');
      }
    };

    fetchLevelsAndStudies();
  }, []);

  useEffect(() => {
    if (profile.school.study_names && studies.length) {
      const studyNames = profile.school.study_names.split(', ');
      const selectedIds = studies.filter(s => studyNames.includes(s.name)).map(s => s.id);
      setSelectedStudies(selectedIds);
    }

    if (profile.school.level_names && levels.length) {
      const levelNames = profile.school.level_names.split(', ');
      const selectedIds = levels.filter(l => levelNames.includes(l.name)).map(l => l.id);
      setSelectedLevels(selectedIds);
    }
  }, [profile, studies, levels]);

  const handleStudyToggle = (id: string) => {
    setSelectedStudies(prev => prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]);
  };

  const handleLevelToggle = (id: string) => {
    setSelectedLevels(prev => prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]);
  };

  useEffect(() => {
    if (editMode) {
      const studyNames = selectedStudies.map(id =>
        studies.find(s => s.id === id)?.name).filter(Boolean).join(', ');
      const levelNames = selectedLevels.map(id =>
        levels.find(l => l.id === id)?.name).filter(Boolean).join(', ');

      setEditedData((prev: any) => ({
        ...prev,
        study_names: studyNames,
        level_names: levelNames
      }));
    }
  }, [selectedStudies, selectedLevels, editMode, studies, levels]);

  const handlePfpClick = () => setOpenPfpDialog(true);
  const handleCloseDialog = () => setOpenPfpDialog(false);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) setEditedData(profile.school);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile && tempImage === null) {
      return null;
    }

    if (!profilePhotoFile) {
      return profile.school.profile_photo_id;
    }

    try {
      setLoading(true);
      const uploadResponse = await uploadLink(profilePhotoFile, 'Profile Image');

      if (uploadResponse.status === 'success') {
        return uploadResponse.link_id;
      }

      throw new Error(uploadResponse.message || 'Image upload failed');
    } catch (err) {
      setError('Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
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

      const payload = { ...editedData, profile_photo_id: photoId };
      const response = await updateSchool(payload);

      if (response.status === 'success') {
        setEditMode(false);
        setTempImage(null);
        setError(null);
        navigate(`/profile/${profile.school.user_id}`);
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
    <Box>
      {loading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {editMode ? (
                <TextField
                  name="name"
                  value={editedData.name}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  disabled={loading}
                />
              ) : profile.school.name}
            </Typography>

            <Box>
              <IconButton
                onClick={handleEditToggle}
                color="primary"
                disabled={loading}
              >
                {editMode ? <Cancel /> : <Edit />}
              </IconButton>
              <IconButton
                onClick={handleDelete}
                color="error"
                disabled={loading}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={tempImage || editedData.profile_photo_url}
                sx={{
                  width: 200,
                  height: 200,
                  cursor: 'pointer',
                  border: `4px solid ${editedData.secondary_color}`,
                  boxShadow: 3
                }}
                onClick={handlePfpClick}
              />
              {editMode && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    disabled={loading}
                  >
                    Change Profile Photo
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      type="file"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    Remove Photo
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="School Year Start"
                    name="school_year_start"
                    value={editedData.school_year_start}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode || loading}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="School Year End"
                    name="school_year_end"
                    value={editedData.school_year_end}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode || loading}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={editedData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                    disabled={!editMode || loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Primary Color"
                    name="primary_color"
                    value={editedData.primary_color}
                    onChange={handleChange}
                    type="color"
                    fullWidth
                    disabled={!editMode || loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: editedData.primary_color
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Secondary Color"
                    name="secondary_color"
                    value={editedData.secondary_color}
                    onChange={handleChange}
                    type="color"
                    fullWidth
                    disabled={!editMode || loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: editedData.secondary_color
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  {editMode ? (
                    <>
                      <BubbleSelection
                        label="Study Areas"
                        options={studies}
                        selectedOptions={selectedStudies}
                        onOptionToggle={handleStudyToggle}
                      />
                      <BubbleSelection
                        label="School Levels"
                        options={levels}
                        selectedOptions={selectedLevels}
                        onOptionToggle={handleLevelToggle}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Study Areas:</strong> {editedData.study_names}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>School Levels:</strong> {editedData.level_names}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {editMode && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ px: 6, py: 2 }}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={openPfpDialog} onClose={handleCloseDialog} maxWidth="lg">
        <DialogContent>
          <img
            src={tempImage || editedData.profile_photo_url}
            alt="Profile Preview"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SchoolProfile;
