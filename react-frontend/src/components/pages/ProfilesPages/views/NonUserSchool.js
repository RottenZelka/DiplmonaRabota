import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const NonUserSchool = ({ profile }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleApplyClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
      {/* School Info Card */}
      <Card
        sx={{
          width: "80%",
          margin: 3,
          padding: 4,
          backgroundColor: profile.school.secondary_color || "#fff",
          color: profile.school.primary_color || "#000",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Avatar Section */}
          <Grid item xs={12} sm={4} style={{ textAlign: "center" }}>
            <Avatar
              src={profile.school.profile_photo_url}
              alt={profile.school.name}
              sx={{ width: 120, height: 120, margin: "0 auto" }}
            />
          </Grid>

          {/* School Name and Description */}
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              {profile.school.name}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              {profile.school.description || "No description provided."}
            </Typography>
          </Grid>
        </Grid>

        {/* Studies and Levels */}
        <Grid container spacing={2} sx={{ marginTop: 3 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                padding: 2,
                backgroundColor: profile.school.primary_color || "#f9f9f9",
                color: profile.school.secondary_color || "#000",
              }}
            >
              <Typography variant="h6">Studies Offered</Typography>
              <Typography variant="body2">
                {profile.school.study_names || "No studies listed."}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                padding: 2,
                backgroundColor: profile.school.primary_color || "#f9f9f9",
                color: profile.school.secondary_color || "#000",
              }}
            >
              <Typography variant="h6">Levels Available</Typography>
              <Typography variant="body2">
                {profile.school.level_names || "No levels listed."}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Apply Button */}
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: profile.school.primary_color || "#4caf50",
              color: profile.school.secondary_color || "#fff",
            }}
            onClick={handleApplyClick}
          >
            Apply For School Now
          </Button>
        </Box>
      </Card>

      {/* Dialog for Sign In/Register */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogContent
          sx={{
            textAlign: "center",
            backgroundColor: profile.school.primary_color || "#fff",
            color: profile.school.secondary_color || "#000",
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
              backgroundColor: profile.school.secondary_color || "#1976d2",
              color: profile.school.primary_color || "#fff",
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
              backgroundColor: profile.school.secondary_color || "#1976d2",
              color: profile.school.primary_color || "#fff",
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
              color: profile.school.secondary_color || "#000",
              borderColor: profile.school.secondary_color || "#000",
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
