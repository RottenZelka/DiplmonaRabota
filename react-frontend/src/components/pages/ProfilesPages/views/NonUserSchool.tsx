import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Avatar,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';

const NonUserSchool: React.FC<{ profile: any }> = ({ profile }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleApplyClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Friendly Illustration */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <SchoolOutlinedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 1 }} />
      </Box>
      {/* Playful Welcome Message */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        Welcome, Explorer!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
        Want to save your favorite schools, apply for them, and unlock more features? <b><a href="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Sign up</a></b> and join the fun!
      </Typography>
      <Card sx={{ width: '80%', margin: 3, p: 4, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} style={{ textAlign: "center" }}>
            <Avatar
              src={profile.school.profile_photo_url}
              alt={profile.school.name}
              sx={{ width: 120, height: 120, margin: "0 auto" }}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              {profile.school.name}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              {profile.school.description || "No description provided."}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ marginTop: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
              <Typography variant="h6">Studies Offered</Typography>
              <Typography variant="body2">
                {profile.school.study_names || "No studies listed."}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
              <Typography variant="h6">Levels Available</Typography>
              <Typography variant="body2">
                {profile.school.level_names || "No levels listed."}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', marginTop: 3 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              borderRadius: 99,
              boxShadow: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'scale(1.07) rotate(-2deg)',
                boxShadow: 6,
                backgroundColor: 'primary.dark',
              },
            }}
            onClick={handleApplyClick}
          >
            Apply For School Now
          </Button>
        </Box>
      </Card>
      {/* Why Register Section */}
      <Box sx={{ mt: 4, mb: 2, width: '100%', maxWidth: 600, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          Why Register?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 120 }}>
            <FavoriteBorderOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Save Schools</Typography>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>Bookmark your top choices for quick access.</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 120 }}>
            <EmojiEventsOutlinedIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Track Progress</Typography>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>Monitor your applications and achievements.</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 120 }}>
            <SchoolOutlinedIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Discover More</Typography>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>Unlock exclusive features and content.</Typography>
          </Box>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogContent
          sx={{
            textAlign: "center",
            bgcolor: 'background.paper',
            color: 'text.primary',
            padding: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Sign In or Register
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 3 }}>
            You need to sign in or register to apply for this school.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              marginRight: 2,
            }}
            onClick={() => {
              navigate('/register')
            }}
          >
            Register
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              marginRight: 2,
            }}
            onClick={() => {
              navigate('/signin')
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: 'text.primary',
              borderColor: 'text.primary',
            }}
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default NonUserSchool;
