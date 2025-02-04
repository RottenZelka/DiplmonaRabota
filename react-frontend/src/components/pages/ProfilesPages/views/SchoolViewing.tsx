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

const SchoolViewing: React.FC<{ profile: any }> = ({ profile }) => {

  const [openPfpDialog, setOpenPfpDialog] = useState(false);

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
        backgroundColor: profile.school.primary_color || "#f5f5f5",
        color: profile.school.secondary_color || "#333",
      }}
    >
      <Card
        sx={{
          width: "80%",
          margin: 3,
          backgroundColor: profile.school.secondary_color || "#fff",
          color: profile.school.primary_color || "#000",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
                <Card
                  sx={{
                    padding: 2,
                    backgroundColor: profile.school.primary_color || "#f9f9f9",
                    color: profile.school.secondary_color || "#000",
                  }}
                >
                  <Typography variant="h6">Studies Offered</Typography>
                  <Typography variant="body2">{profile.school.study_names}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{
                    padding: 2,
                    backgroundColor: profile.school.primary_color || "#f9f9f9",
                    color: profile.school.secondary_color || "#000",
                  }}
                >
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
              style={{ color: profile.school.secondary_color || "#1976d2" }}
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
