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
  const [editedData, setEditedData] = useState(profile);
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [studies, setStudies] = useState([]);
  const [selectedStudies, setSelectedStudies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setEditedData(profile);
  }, [profile]);

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
    if (profile.study_names && studies.length) {
      const studyNames = profile.study_names.split(', ');
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
    if (!editMode) setEditedData(profile);
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile) return profile.student.profile_photo_id;
  
    try {
      setLoading(true);
      const uploadResponse = await uploadLink(profilePhotoFile, 'Profile%20Image');
  
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
        profile_photo_id: photoId || profile.profile_photo_id 
      };
      
      await updateStudent(payload);
      setEditMode(false);
      setTempImage(null);
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


  return (
    <Box sx={{
      minHeight: '100vh',
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

      <Box sx={{ 
        position: 'relative',
        height: 200,
        background: '#1976d2',
        borderRadius: 2,
        mb: 4
      }}>
        <Fab color="secondary" sx={{ position: 'absolute', bottom: -30, right: 30 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-photo-upload"
            type="file"
            onChange={handlePhotoChange}
            disabled={!editMode || loading}
          />
          <label htmlFor="profile-photo-upload">
            <IconButton component="span" disabled={!editMode || loading}>
              <AddAPhoto />
            </IconButton>
          </label>
        </Fab>
      </Box>

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
              ) : profile.name}
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