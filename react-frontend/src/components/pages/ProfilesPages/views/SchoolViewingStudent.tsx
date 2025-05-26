import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Grid,
  Avatar,
  Box,
  Dialog,
  DialogContent,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApplicationStatus } from "../../../../hooks/useApplicationStatus";
import { useTheme } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { alpha } from '@mui/material/styles';

const SchoolViewingStudent: React.FC<{ profile: any }> = ({ profile }) => {
  const navigate = useNavigate();
  const { isApplied, appId } = useApplicationStatus(profile.student.user_id);
  const theme = useTheme();

  const [openPfpDialog, setOpenPfpDialog] = useState(false);

  const handleInvite = () => {
    navigate(`/apply/${profile.student.user_id}`);
  };

  const handleViewDetails = () => {
    navigate(`/application/${appId}`);
  };

  const handlePfpClick = () => {
    setOpenPfpDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenPfpDialog(false);
  };

  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      color: 'text.primary',
      py: 4
    }}>
      <Card sx={{ 
        width: '90%', 
        maxWidth: 1200,
        margin: 3, 
        bgcolor: 'background.paper', 
        color: 'text.primary', 
        borderRadius: 4, 
        boxShadow: theme.shadows[8],
        overflow: 'hidden'
      }}>
        <Grid container spacing={4} alignItems="center" sx={{ p: 4 }}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={profile.student.profile_photo_url || "/default-avatar.png"}
              alt={profile.student.name}
              sx={{ 
                width: 180, 
                height: 180, 
                margin: "0 auto", 
                cursor: "pointer",
                border: `4px solid ${primaryColor}`,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme.shadows[8]
                },
                transition: 'all 0.3s ease'
              }}
              onClick={handlePfpClick}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  color: primaryColor
                }}
              >
                {profile.student.name}
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`Date of Birth: ${profile.student.dob || "Not Provided"}`}
                  sx={{ 
                    bgcolor: alpha(primaryColor, 0.1),
                    '&:hover': {
                      bgcolor: alpha(primaryColor, 0.2)
                    }
                  }}
                />
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: alpha(primaryColor, 0.05),
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: primaryColor, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Studies
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {profile.student.study_names ? (
                      profile.student.study_names.split(', ').map((study: string, index: number) => (
                        <Chip
                          key={index}
                          label={study}
                          sx={{ 
                            m: 0.5,
                            bgcolor: alpha(primaryColor, 0.1),
                            '&:hover': {
                              bgcolor: alpha(primaryColor, 0.2)
                            }
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No studies listed
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: alpha(secondaryColor, 0.05),
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ color: secondaryColor, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Schools Attended
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {profile.student.school_names ? (
                      profile.student.school_names.split(', ').map((school: string, index: number) => (
                        <Chip
                          key={index}
                          label={school}
                          sx={{ 
                            m: 0.5,
                            bgcolor: alpha(secondaryColor, 0.1),
                            '&:hover': {
                              bgcolor: alpha(secondaryColor, 0.2)
                            }
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No schools listed
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
            <Box>
              {isApplied === null ? (
                <Button
                  variant="contained"
                  disabled
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.grey[400]
                  }}
                >
                  Loading...
                </Button>
              ) : isApplied ? (
                <Button
                  variant="contained"
                  onClick={handleViewDetails}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: primaryColor,
                    '&:hover': {
                      backgroundColor: secondaryColor
                    }
                  }}
                >
                  View Application Details
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleInvite}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: primaryColor,
                    '&:hover': {
                      backgroundColor: secondaryColor
                    }
                  }}
                >
                  Invite Student Now
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Dialog 
        open={openPfpDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0, bgcolor: 'background.paper' }}>
          <img
            src={profile.student.profile_photo_url || "/default-avatar.png"}
            alt={profile.student.name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SchoolViewingStudent;
