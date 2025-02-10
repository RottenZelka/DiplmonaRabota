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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApplicationStatus } from "../../../../hooks/useApplicationStatus";
import { useTheme } from '@mui/material/styles';

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Card sx={{ width: '80%', margin: 3, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={4} style={{ textAlign: "center" }}>
            <Avatar
              src={profile.student.profile_photo_url || "/default-avatar.png"}
              alt={profile.student.name}
              sx={{ width: 100, height: 100, margin: "0 auto", cursor: "pointer" }}
              onClick={handlePfpClick}
            />
          </Grid>

          <Grid item xs={8}>
            <Typography variant="h5">{profile.student.name}</Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              <strong>Date of Birth:</strong> {profile.student.dob || "Not Provided"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
                  <Typography variant="h6">Studies</Typography>
                  <Typography variant="body2">{profile.student.study_names || "Not Provided"}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
                  <Typography variant="h6">Schools Attended</Typography>
                  <Typography variant="body2">{profile.student.school_names || "Not Provided"}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
                  <Typography variant="h6">Periods</Typography>
                  <Typography variant="body2">{profile.student.periods || "Not Provided"}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} style={{ textAlign: "center" }}>
            {isApplied === null ? (
              <Button
                variant="contained"
                disabled
                sx={{ backgroundColor: profile.student.secondary_color || "#ccc", color: profile.student.primary_color || "#000" }}
              >
                Loading...
              </Button>
            ) : isApplied ? (
              <Button
                variant="contained"
                sx={{ backgroundColor: profile.student.secondary_color || "#1976d2", color: profile.student.primary_color || "#fff" }}
                onClick={handleViewDetails}
              >
                View Application Details
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{ backgroundColor: profile.student.primary_color || "#4caf50", color: profile.student.secondary_color || "#fff" }}
                onClick={handleInvite}
              >
                Invite Student Now
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      <Dialog open={openPfpDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogContent style={{ textAlign: "center", backgroundColor: profile.student.primary_color || "#fff" }}>
          <img
            src={profile.student.profile_photo_url || "/default-avatar.png"}
            alt={profile.student.name}
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SchoolViewingStudent;
