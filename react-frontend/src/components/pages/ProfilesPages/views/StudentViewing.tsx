import React, { useState } from 'react';
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
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

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
  const studyNames = Array.isArray(student.study_names) ? student.study_names : [];
  const schoolNames = Array.isArray(student.school_names) ? student.school_names : [];

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            src={student.profile_photo_url}
            alt={student.name}
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
            {student.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
            {age && (
              <Chip
                icon={<PersonIcon />}
                label={`Age: ${age}`}
              />
            )}
            <Chip
              icon={<CalendarTodayIcon />}
              label={`Member since: ${new Date(student.created_at).toLocaleDateString()}`}
            />
          </Stack>

          {student.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {student.description}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Current Studies
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {studyNames.length > 0 ? (
                  studyNames.map((study, index) => (
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
                Schools
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {schoolNames.length > 0 ? (
                  schoolNames.map((school, index) => (
                    <Chip
                      key={index}
                      label={school}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No schools listed
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {(student.contact_email || student.phone_number) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                {student.contact_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{student.contact_email}</Typography>
                  </Box>
                )}
                {student.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{student.phone_number}</Typography>
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
