import React, { useState } from "react";
import {
  Typography,
  Grid,
  Avatar,
  Box,
  Dialog,
  DialogContent,
  Paper,
  Stack,
  Chip,
  IconButton,
  alpha,
  Alert,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';

interface SchoolProfile {
  user_id: string;
  name: string;
  profile_photo_id: string;
  created_at: string;
  updated_at: string;
  profile_photo_url: string;
  study_names?: string[];
  level_names?: string[];
  school_year_start?: string;
  school_year_end?: string;
  address?: string;
  description?: string;
  contact_email?: string;
  phone_number?: string;
  primary_color?: string;
}

interface ProfileProps {
  profile: {
    school?: SchoolProfile;
  };
}

const SchoolViewing: React.FC<ProfileProps> = ({ profile }) => {
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  if (!profile.school) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">School profile not found</Alert>
      </Box>
    );
  }

  const school = profile.school;
  const primaryColor = school.primary_color || theme.palette.primary.main;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 8,
      px: { xs: 2, md: 8 },
      background: `linear-gradient(135deg, ${alpha(primaryColor, 0.05)} 0%, ${alpha(primaryColor, 0.1)} 100%)`
    }}>
      <Paper 
        elevation={3}
        sx={{ 
          maxWidth: 1200,
          mx: 'auto',
          p: 4,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.5)} 100%)`
          }
        }}
      >
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
          onClick={() => navigate('/profile/edit')}
        >
          <EditIcon sx={{ color: primaryColor }} fontSize="large" />
        </IconButton>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={school.profile_photo_url}
              alt={school.name}
              sx={{
                width: 200,
                height: 200,
                border: `4px solid ${primaryColor}`,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
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
                color: primaryColor,
                letterSpacing: '-0.5px',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              {school.name}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
              {school.school_year_start && school.school_year_end && (
                <Chip
                  icon={<SchoolIcon />}
                  label={`School Year: ${school.school_year_start} - ${school.school_year_end}`}
                  sx={{ 
                    bgcolor: alpha(primaryColor, 0.1),
                    color: 'text.primary',
                    '& .MuiChip-icon': { color: primaryColor }
                  }}
                />
              )}
              {school.address && (
                <Chip
                  icon={<LocationOnIcon />}
                  label={school.address}
                  sx={{ 
                    bgcolor: alpha(primaryColor, 0.1),
                    color: 'text.primary',
                    '& .MuiChip-icon': { color: primaryColor }
                  }}
                />
              )}
            </Stack>

            {school.description && (
              <Box 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  bgcolor: alpha(primaryColor, 0.05),
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {school.description}
                </Typography>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(primaryColor, 0.05),
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: primaryColor, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Studies Offered
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {school.study_names?.map((study, index) => (
                      <Chip
                        key={index}
                        label={study}
                        sx={{ 
                          bgcolor: alpha(primaryColor, 0.1),
                          color: 'text.primary',
                          m: 0.5
                        }}
                      />
                    )) || <Typography variant="body2">No studies listed</Typography>}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(primaryColor, 0.05),
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: primaryColor, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Levels Available
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {school.level_names?.map((level, index) => (
                      <Chip
                        key={index}
                        label={level}
                        sx={{ 
                          bgcolor: alpha(primaryColor, 0.1),
                          color: 'text.primary',
                          m: 0.5
                        }}
                      />
                    )) || <Typography variant="body2">No levels listed</Typography>}
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {(school.contact_email || school.phone_number) && (
              <Box 
                sx={{ 
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(primaryColor, 0.05)
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Contact Information
                </Typography>
                <Stack spacing={2}>
                  {school.contact_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ color: primaryColor, mr: 1 }} />
                      <Typography variant="body1">{school.contact_email}</Typography>
                    </Box>
                  )}
                  {school.phone_number && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ color: primaryColor, mr: 1 }} />
                      <Typography variant="body1">{school.phone_number}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

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

export default SchoolViewing;
