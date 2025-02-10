import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';

const SchoolViewing: React.FC<{ profile: any }> = ({ profile }) => {
  const [openPfpDialog, setOpenPfpDialog] = useState(false);
  const theme = useTheme();

  const handlePfpClick = () => {
    setOpenPfpDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenPfpDialog(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Card
        sx={{
          width: "80%",
          margin: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={4} style={{ textAlign: "center" }}>
            <Avatar
              src={profile.school.profile_photo_url}
              alt={profile.school.name}
              sx={{ width: 100, height: 100, margin: "0 auto", cursor: "pointer" }}
              onClick={handlePfpClick}
            />
          </Grid>

          <Grid item xs={8}>
            <Typography variant="h5">
              {profile.school.name}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              <strong>School Year:</strong> {profile.school.school_year_start} to {profile.school.school_year_end}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
                  <Typography variant="h6">Studies Offered</Typography>
                  <Typography variant="body2">{profile.school.study_names}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: 3, boxShadow: 1 }}>
                  <Typography variant="h6">Levels Available</Typography>
                  <Typography variant="body2">{profile.school.level_names}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ width: "80%", marginTop: 3 }}>
        <CardContent>
          <Typography variant="h6">Description</Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            {profile.school.description}
          </Typography>
          <Typography variant="h6">Location</Typography>
          <Typography variant="body2">
            <a
              href={profile.school.address}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.palette.primary.contrastText, textDecoration: 'underline' }}
            >
              View on Google Maps
            </a>
          </Typography>
        </CardContent>
      </Box>

      <Dialog open={openPfpDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogContent style={{ textAlign: "center", backgroundColor: profile.school.primary_color || "#fff" }}>
          <img
            src={profile.school.profile_photo_url}
            alt={profile.school.name}
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SchoolViewing;
