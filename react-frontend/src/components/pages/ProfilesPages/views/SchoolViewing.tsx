import React, { useState } from "react";
import {
  Typography,
  Box,
  Avatar,
  Grid,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

interface SchoolProfile {
  user_id: string;
  name: string;
  profile_photo_id: string;
  created_at: string;
  updated_at: string;
  profile_photo_url: string;
  study_names?: string;
  level_names?: string;
  school_year_start?: string;
  school_year_end?: string;
  address?: string;
  description?: string;
  contact_email?: string;
  phone_number?: string;
}

interface ProfileProps {
  profile: {
    school?: SchoolProfile;
  };
}

const SchoolViewing: React.FC<ProfileProps> = ({ profile }) => {
  const [openPfpDialog, setOpenPfpDialog] = useState(false);

  if (!profile.school) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">School profile not found</Alert>
      </Box>
    );
  }

  const school = profile.school;

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            src={school.profile_photo_url}
            alt={school.name}
            sx={{
              width: 200,
              height: 200,
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setOpenPfpDialog(true)}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            {school.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
            {school.school_year_start && school.school_year_end && (
              <Chip
                icon={<SchoolIcon />}
                label={`School Year: ${school.school_year_start} - ${school.school_year_end}`}
              />
            )}
            {school.address && (
              <Chip
                icon={<LocationOnIcon />}
                label={school.address}
              />
            )}
          </Stack>

          {school.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {school.description}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Studies Offered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {school.study_names ? (
                  school.study_names.split(', ').map((study: string, index: number) => (
                    <Chip
                      key={index}
                      label={study}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No studies listed
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Levels Available
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {school.level_names ? (
                  school.level_names.split(', ').map((level: string, index: number) => (
                    <Chip
                      key={index}
                      label={level}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No levels listed
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {(school.contact_email || school.phone_number) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                {school.contact_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{school.contact_email}</Typography>
                  </Box>
                )}
                {school.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{school.phone_number}</Typography>
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
