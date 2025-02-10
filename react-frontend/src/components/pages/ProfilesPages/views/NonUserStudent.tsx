import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const NonUserStudent: React.FC<{ profile: any }> = ({ profile }) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Friendly Illustration */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <PersonOutlineOutlinedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 1 }} />
      </Box>
      {/* Playful Welcome Message */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        Hello, Future Star!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
        Want to save your favorite schools, apply for them, and unlock more features? <b><a href="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Sign up</a></b> and join the adventure!
      </Typography>
      <Card sx={{ width: '80%', margin: 3, p: 4, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Student Preview</Typography>
          <Typography>Name: {profile.student.name}</Typography>
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
              onClick={handleOpenDialog}
            >
              Register & Join the Fun
            </Button>
          </Box>
        </CardContent>
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
            You need to sign in or register to access all features.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              marginRight: 2,
            }}
            onClick={() => { window.location.href = '/register'; }}
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
            onClick={() => { window.location.href = '/signin'; }}
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

export default NonUserStudent;
