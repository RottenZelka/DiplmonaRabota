import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApplicationStatus } from "../../../../hooks/useApplicationStatus";
import { AuthContext } from "../../../../context/AuthContext";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { saveSchool, deleteSavedSchoolId, getSavedSchools } from "../../../../services/api";

const StudentViewingSchool: React.FC<{ profile: any }> = ({ profile }) => {
  const navigate = useNavigate();
  const { isApplied, appId } = useApplicationStatus(profile.school.user_id);
  const { isAuthenticated, user } = useContext(AuthContext);

  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await getSavedSchools();
          const saved = response.some((school: any) => school.school_id === profile.school.user_id);
          setIsSaved(saved);
        } catch (err) {
          console.error('Error checking saved status:', err);
        }
      }
    };

    checkSavedStatus();
  }, [profile.school.user_id, isAuthenticated, user]);

  const handleSaveToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setError('Please login to save schools');
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await deleteSavedSchoolId(profile.school.user_id);
      } else {
        await saveSchool(profile.school.user_id);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      setError('Failed to update saved status');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => navigate(`/apply/${profile.school.user_id}`);
  const handleViewDetails = () => navigate(`/application/${appId}`);
  const handlePfpClick = () => setOpenPfpDialog(true);
  const handleCloseDialog = () => setOpenPfpDialog(false);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: profile.school.primary_color || "#f5f5f5",
      color: profile.school.secondary_color || "#333",
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

      <Card sx={{
        width: "80%",
        margin: 3,
        backgroundColor: profile.school.secondary_color || "#fff",
        color: profile.school.primary_color || "#000",
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        position: 'relative'
      }}>
        <IconButton
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          onClick={handleSaveToggle}
          disabled={loading}
        >
          {isSaved ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon sx={{ color: profile.school.primary_color }} />
          )}
        </IconButton>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            <Avatar
              src={profile.school.profile_photo_url}
              alt={profile.school.name}
              sx={{
                width: 100,
                height: 100,
                margin: "0 auto",
                cursor: "pointer",
                border: `3px solid ${profile.school.primary_color}`
              }}
              onClick={handlePfpClick}
            />
          </Grid>

          <Grid item xs={8}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {profile.school.name}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {profile.school.address}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>School Year:</strong> {new Date(profile.school.school_year_start).toLocaleDateString()} - {new Date(profile.school.school_year_end).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  padding: 2,
                  backgroundColor: profile.school.primary_color + '1a',
                  color: profile.school.secondary_color,
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Studies Offered</Typography>
                  <Typography variant="body2">{profile.school.study_names || 'No studies listed'}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  padding: 2,
                  backgroundColor: profile.school.primary_color + '1a',
                  color: profile.school.secondary_color,
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>School Levels</Typography>
                  <Typography variant="body2">{profile.school.level_names || 'No levels listed'}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center" }}>
            {isApplied === null ? (
              <Button variant="contained" disabled>
                Loading Application Status...
              </Button>
            ) : isApplied ? (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: profile.school.secondary_color,
                  color: profile.school.primary_color,
                  '&:hover': { backgroundColor: profile.school.secondary_color + 'cc' }
                }}
                onClick={handleViewDetails}
              >
                View Application Details
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: profile.school.primary_color,
                  color: profile.school.secondary_color,
                  '&:hover': { backgroundColor: profile.school.primary_color + 'cc' }
                }}
                onClick={handleApply}
              >
                Apply Now
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      <Box sx={{
        width: "80%",
        marginTop: 3,
        padding: 3,
        backgroundColor: profile.school.secondary_color + '1a',
        borderRadius: 2
      }}>
        <Typography variant="h5" sx={{ mb: 2 }}>About Our School</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {profile.school.description || 'No description provided'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>Location</Typography>
            <Button
              variant="outlined"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.school.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: profile.school.primary_color,
                borderColor: profile.school.primary_color
              }}
            >
              View on Map
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
            <Typography variant="body1">
              Email: {profile.school.contact_email || 'N/A'}
            </Typography>
            <Typography variant="body1">
              Phone: {profile.school.phone_number || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openPfpDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogContent sx={{
          textAlign: "center",
          backgroundColor: profile.school.primary_color,
          padding: 4
        }}>
          <img
            src={profile.school.profile_photo_url}
            alt={profile.school.name}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              borderRadius: 8,
              border: `4px solid ${profile.school.secondary_color}`
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentViewingSchool;
