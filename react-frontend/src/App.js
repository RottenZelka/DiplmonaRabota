import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios'; // For API calls
import Login from './components/Login';
import Register from './components/Register';
import SchoolProfile from './components/SchoolProfile';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [schools, setSchools] = useState([]); // Store school list
  const navigate = useNavigate();

  // Fetch school list
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:8888/api/schools');
        setSchools(response.data.schools); // Assuming the API returns { schools: [...] }
      } catch (error) {
        console.error('Error fetching school list:', error);
      }
    };

    fetchSchools();
  }, []);

  // Check session status on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("jwtToken");
      try {
        const response = await axios.get('http://localhost:8888/api/check-session', { headers: { Authorization: `Bearer ${token}` }, });
        if (response.data.status === 'success') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8888/api/logout', {}, { withCredentials: true });
      if (response.data.status === 'success') {
        setIsLoggedIn(false);
        navigate('/'); // Redirect to the home page after logout
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student App
          </Typography>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        {/* Logged-out view */}
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <Grid container spacing={3} sx={{ padding: 3 }}>
                {schools.map((school) => (
                  <Grid item xs={12} sm={6} md={4} key={school.id}>
                    <Card onClick={() => navigate(`/school/${school.id}`)} sx={{ cursor: 'pointer' }}>
                      <CardContent>
                        <Typography variant="h6">{school.name}</Typography>
                        <Typography variant="body2">{school.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="h5" sx={{ padding: 3 }}>
                Welcome to your dashboard! Use the logout button to end your session.
              </Typography>
            )
          }
        />

        {/* Login and Register Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* School Profile Page */}
        <Route path="/school/:id" element={<SchoolProfile />} />
      </Routes>
    </Box>
  );
};

export default App;
