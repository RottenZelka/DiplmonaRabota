import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Container } from "@mui/material";

const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove JWT token from localStorage
    localStorage.removeItem("jwtToken");

    // Redirect to sign-in after 3 seconds
    const timeout = setTimeout(() => {
      navigate("/signin");
    }, 3000);

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 10 }}>
      <Box
        sx={{
          backgroundColor: "#f8d7da",
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          401 - Unauthorized
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You do not have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/signin")}
        >
          Go to Sign In
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
