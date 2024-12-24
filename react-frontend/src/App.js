import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Card, CardContent, CardMedia, IconButton, Container } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import RegisterSchool from './components/RegisterSchool';
import SchoolProfile from './components/SchoolProfile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:8888/api/schools');
        setSchools(response.data.schools);
      } catch (error) {
        console.error('Error fetching school list:', error);
      }
    };
    fetchSchools();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8888/api/logout', {}, { withCredentials: true });
      if (response.data.status === 'success') {
        setIsLoggedIn(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box>
        <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Student App
            </Typography>
            {isLoggedIn ? (
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ fontWeight: 'bold', textTransform: 'none' }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  component={Link}
                  to="/login"
                  sx={{ fontWeight: 'bold', textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  startIcon={<PersonAddIcon />}
                  component={Link}
                  to="/register"
                  sx={{ fontWeight: 'bold', textTransform: 'none' }}
                >
                  Register
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ paddingY: 4 }}>
          <Routes>
            <Route
              path="/"
              element={
                !isLoggedIn ? (
                  <Grid container spacing={4} justifyContent="center">
                    {schools.map((school) => (
                      <Grid item xs={12} sm={6} md={4} key={school.id}>
                        <Card
                          onClick={() => navigate(`/school/${school.id}`)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={school.image || 'https://via.placeholder.com/150'}
                            alt={school.name}
                          />
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {school.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {school.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="h5" align="center" sx={{ mt: 4 }}>
                    Welcome to your dashboard! Use the logout button to end your session.
                  </Typography>
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/school/:id" element={<SchoolProfile />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
