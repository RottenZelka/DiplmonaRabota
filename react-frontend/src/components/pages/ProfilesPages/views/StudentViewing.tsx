import React, { useState, useContext } from 'react';
import {
  Typography,
  Box,
  Avatar,
  Grid,
  Chip,
  alpha,
  Stack,
  IconButton,
  Dialog,
  DialogContent,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../../../../context/AuthContext';

interface StudentProfile {
  user_id: string;
  name: string;
  profile_photo_id: string;
  created_at: string;
  updated_at: string;
  dob?: string;
  profile_photo_url: string;
  study_names?: string[];
  school_names?: string[];
  periods?: any[];
  description?: string;
  contact_email?: string;
  phone_number?: string;
}

interface ProfileProps {
  profile: {
    student?: StudentProfile;
  };
}

const StudentViewing: React.FC<ProfileProps> = ({ profile }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [openPfpDialog, setOpenPfpDialog] = useState(false);

  if (!profile.student) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Student profile not found</Alert>
      </Box>
    );
  }

  const student = profile.student;
  const age = student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : null;
  const isOwnProfile = user?.id === student.user_id;
  const primaryColor = theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main;

  // Ensure arrays are properly initialized
  const studyNames = Array.isArray(student.study_names) ? student.study_names : [];
  const schoolNames = Array.isArray(student.school_names) ? student.school_names : [];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 8,
      px: { xs: 2, md: 8 },
      background: theme.palette.background.default
    }}>
      {/* Header Section */}
      <Box sx={{ position: 'relative', mb: 8 }}>
        {isOwnProfile && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              '&:hover': {
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/profile/edit')}
          >
            <EditIcon sx={{ color: primaryColor }} />
          </IconButton>
        )}

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={student.profile_photo_url}
              alt={student.name}
              sx={{
                width: 200,
                height: 200,
                border: `4px solid ${primaryColor}`,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => setOpenPfpDialog(true)}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography 
              variant="h2" 
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
                letterSpacing: '-0.5px',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              {student.name}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
              {age && (
                <Chip
                  icon={<PersonIcon />}
                  label={`Age: ${age}`}
                  sx={{ 
                    bgcolor: alpha(primaryColor, 0.1),
                    color: theme.palette.text.primary,
                    '& .MuiChip-icon': { color: primaryColor }
                  }}
                />
              )}
              <Chip
                icon={<CalendarTodayIcon />}
                label={`Member since: ${new Date(student.created_at).toLocaleDateString()}`}
                sx={{ 
                  bgcolor: alpha(primaryColor, 0.1),
                  color: theme.palette.text.primary,
                  '& .MuiChip-icon': { color: primaryColor }
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Content Section */}
      <Grid container spacing={8}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {student.description && (
            <Box sx={{ mb: 8 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', color: theme.palette.text.primary }}>
                {student.description}
              </Typography>
            </Box>
          )}

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ color: primaryColor, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Current Studies
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {studyNames.length > 0 ? (
                    studyNames.map((study, index) => (
                      <Chip
                        key={index}
                        label={study}
                        sx={{ 
                          bgcolor: alpha(primaryColor, 0.1),
                          color: theme.palette.text.primary,
                          m: 0.5
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No studies listed</Typography>
                  )}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ color: primaryColor, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Schools
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {schoolNames.length > 0 ? (
                    schoolNames.map((school, index) => (
                      <Chip
                        key={index}
                        label={school}
                        sx={{ 
                          bgcolor: alpha(primaryColor, 0.1),
                          color: theme.palette.text.primary,
                          m: 0.5
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No schools listed</Typography>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {(student.contact_email || student.phone_number) && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
                Contact Information
              </Typography>
              <Stack spacing={3}>
                {student.contact_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ color: primaryColor, mr: 2 }} />
                    <Typography variant="body1" color="text.primary">{student.contact_email}</Typography>
                  </Box>
                )}
                {student.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ color: primaryColor, mr: 2 }} />
                    <Typography variant="body1" color="text.primary">{student.phone_number}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
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
            src={student.profile_photo_url}
            alt={student.name}
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

export default StudentViewing;
