import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Dialog,
  DialogContent,
  Button,
  TextField,
  IconButton,
  Fab,
  CircularProgress,
  Alert
} from "@mui/material";
import { Edit, Save, Delete, Cancel, AddAPhoto } from "@mui/icons-material";
import { uploadLink, getStudies, deleteUser, updateStudent } from "../../../../services/api";
import BubbleSelection from "../../../common/BubbleSelection";
import { useNavigate } from "react-router-dom";

const StudentProfile = ({ profile }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(profile.student);
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [studies, setStudies] = useState([]);
  const [selectedStudies, setSelectedStudies] = useState([]);
  const navigate = useNavigate();

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

  const handleStudyToggle = (id) => {
    setSelectedStudies(prev => prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]);
  };

  useEffect(() => {
    if (editMode) {
      const studyNames = selectedStudies.map(id =>
        studies.find(s => s.id === id)?.name).filter(Boolean).join(', ');

      setEditedData(prev => ({
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

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile && tempImage === null) {
        // If no new file is selected and tempImage is null, remove the profile photo
        return null;
    }

    if (!profilePhotoFile) {
        // If no new file is selected, keep the existing profile photo
        return profile.student.profile_photo_id;
    }

    try {
        setLoading(true);

        // Ensure profilePhotoFile is correctly passed
        console.log('Uploading file:', profilePhotoFile);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setTempImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const photoId = await handlePhotoUpload();

      const payload = {
        ...editedData,
        profile_photo_id: photoId
      };

      await updateStudent(payload);
      setEditMode(false);
      setTempImage(null);
      navigate(`/profile/${profile.school.user_id}`);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      setLoading(true);
      setError('');
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
    setEditedData(prev => ({ ...prev, profile_photo_id: null, profile_photo_url: null }));
    setTempImage(null);
    setProfilePhotoFile(null); // Ensure the file input is also cleared
  };

  return (
    <Box sx={{
      background: '#f8f9fa',
      padding: 4,
      position: 'relative'
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
              ) : profile.student.name}
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
                  border: '4px solid #1976d2',
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
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={editedData.email}
                    onChange={handleChange}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  {editMode ? (
                    <BubbleSelection
                      label="Studies"
                      options={studies}
                      selectedOptions={selectedStudies}
                      onOptionToggle={handleStudyToggle}
                    />
                  ) : (
                    <Typography variant="body1">
                      <strong>Studies:</strong> {editedData.study_names}
                    </Typography>
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

export default StudentProfile;
