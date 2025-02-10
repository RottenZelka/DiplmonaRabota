import React, { useState, useEffect, useContext } from "react";
import {
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
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApplicationStatus } from "../../../../hooks/useApplicationStatus";
import { AuthContext } from "../../../../context/AuthContext";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { saveSchool, deleteSavedSchoolId, getSavedSchools } from "../../../../services/api";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';
import { useTheme } from '@mui/material/styles';

const StudentViewingSchool: React.FC<{ profile: any }> = ({ profile }) => {
  const navigate = useNavigate();
  const { isApplied, appId } = useApplicationStatus(profile.school.user_id);
  const { isAuthenticated, user } = useContext(AuthContext);
  const theme = useTheme();

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8, px: { xs: 2, md: 8 } }}>
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
        <Alert severity="error" sx={{ mb: 2, maxWidth: 800, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', mb: 6, p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
        <IconButton
          sx={{
            position: 'absolute',
            top: 32,
            right: 32,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={handleSaveToggle}
          disabled={loading}
        >
          {isSaved ? (
            <FavoriteIcon color="error" fontSize="large" />
          ) : (
            <FavoriteBorderIcon sx={{ color: profile.school.primary_color }} fontSize="large" />
          )}
        </IconButton>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={profile.school.profile_photo_url}
              alt={profile.school.name}
              sx={{
                width: 200,
                height: 200,
                border: `4px solid ${profile.school.primary_color}`,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={handlePfpClick}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Typography variant="h2" sx={{
              fontWeight: 700,
              mb: 2,
              color: profile.school.primary_color,
              letterSpacing: '-0.5px'
            }}>
              {profile.school.name}
            </Typography>
            
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlaceIcon fontSize="small" />
                <Typography variant="body1">{profile.school.address}</Typography>
              </Box>
              <Typography variant="body1">
                {new Date(profile.school.school_year_start).toLocaleDateString()} - {new Date(profile.school.school_year_end).toLocaleDateString()}
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: alpha(profile.school.primary_color, 0.1),
                  backdropFilter: 'blur(4px)'
                }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Studies Offered
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {profile.school.study_names || 'No studies listed'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: alpha(profile.school.primary_color, 0.1),
                  backdropFilter: 'blur(4px)'
                }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    School Levels
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {profile.school.level_names || 'No levels listed'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mt: 4 }}>
              {isApplied === null ? (
                <Button variant="contained" disabled size="large">
                  Loading Application Status...
                </Button>
              ) : isApplied ? (
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: `linear-gradient(135deg, ${profile.school.primary_color} 0%, ${alpha(profile.school.primary_color, 0.8)} 100%)`,
                    color: profile.school.secondary_color,
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(profile.school.primary_color, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={handleViewDetails}
                >
                  View Application Details
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: `linear-gradient(135deg, ${profile.school.primary_color} 0%, ${alpha(profile.school.primary_color, 0.8)} 100%)`,
                    color: profile.school.secondary_color,
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(profile.school.primary_color, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={handleApply}
                >
                  Start Application
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{
        maxWidth: 1200,
        mx: 'auto',
        p: 4,
        borderRadius: 4,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${profile.school.primary_color}`
      }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: profile.school.primary_color }}>
          About {profile.school.name}
        </Typography>
        <Typography variant="body1" sx={{
          lineHeight: 1.8,
          fontSize: '1.1rem',
          mb: 4,
          whiteSpace: 'pre-line'
        }}>
          {profile.school.description || 'No description provided'}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <EmailIcon fontSize="large" sx={{ color: profile.school.primary_color }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Email</Typography>
                <Typography variant="body1">
                  {profile.school.contact_email || 'Not available'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhoneIcon fontSize="large" sx={{ color: profile.school.primary_color }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Phone</Typography>
                <Typography variant="body1">
                  {profile.school.phone_number || 'Not available'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PlaceIcon fontSize="large" sx={{ color: profile.school.primary_color }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Location</Typography>
                <Button
                  variant="outlined"
                  href = {profile.school.addres}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mt: 1,
                    borderColor: profile.school.primary_color,
                    color: profile.school.primary_color,
                    '&:hover': {
                      backgroundColor: alpha(profile.school.primary_color, 0.1),
                      borderColor: profile.school.primary_color
                    }
                  }}
                >
                  Open in Maps
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openPfpDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogContent sx={{
          textAlign: "center",
          p: 4,
          backgroundColor: alpha(profile.school.primary_color, 0.1),
        }}>
          <img
            src={profile.school.profile_photo_url}
            alt={profile.school.name}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              borderRadius: 16,
              border: `4px solid ${profile.school.secondary_color}`,
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentViewingSchool;