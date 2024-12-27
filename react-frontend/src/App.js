import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Card, CardContent, CardMedia, Container, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import RegisterSchool from './components/RegisterSchool';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Profile from './components/Profile/Profile';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('');
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For profile menu
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for active user session
        const jwtToken = localStorage.getItem('jwtToken');
        console.log(jwtToken);
        if (jwtToken) {
          setIsLoggedIn(true);
        }
        // Fetch schools
        const schoolsResponse = await axios.get('http://localhost:8888/api/schools');
        setSchools(schoolsResponse.data.schools);

        // Fetch students if logged in
        // if (isLoggedIn) {
        //   const studentsResponse = await axios.get('http://localhost:8888/api/students');
        //   setStudents(studentsResponse.data.students);
        // }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8888/api/logout', {}, { withCredentials: true });
      if (response.data.status === 'success') {
        setIsLoggedIn(false);
        setUserProfile(null);
        localStorage.removeItem('jwtToken');
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box>
        <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              Student App
            </Typography>
            <Box>
              <Button color="inherit" component={Link} to="/schools">
                Schools
              </Button>
              <Button color="inherit" component={Link} to="/students">
                Students
              </Button>
              <Button color="inherit" component={Link} to="/applications">
                Applications
              </Button>
              <Button color="inherit" component={Link} to="/exams">
                Exams
              </Button>
            </Box>
            {isLoggedIn ? (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <Avatar alt="Profile Picture" src={userProfile?.photo || ''} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => navigate('/profile')}>Your Profile</MenuItem>
                  <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
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
                  <>
                    <Box mb={4}>
                      <TextField
                        label="Filter Schools"
                        variant="outlined"
                        fullWidth
                        value={filter}
                        onChange={handleFilterChange}
                      />
                    </Box>
                    <Grid container spacing={4} justifyContent="center">
                      {filteredSchools.map((school) => (
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
                              image={school.profile_photo_url || 'https://via.placeholder.com/150'}
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
                  </>
                ) : (
                  <>
                    <Box mb={4}>
                      <TextField
                        label="Filter Students"
                        variant="outlined"
                        fullWidth
                        value={filter}
                        onChange={handleFilterChange}
                      />
                    </Box>
                    <Grid container spacing={4} justifyContent="center">
                      {filteredStudents.map((student) => (
                        <Grid item xs={12} sm={6} md={4} key={student.id}>
                          <Card
                            onClick={() => navigate(`/profile/${student.id}`)}
                            sx={{
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.05)' },
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={student.profile_photo_url || 'https://via.placeholder.com/150'}
                              alt={student.name}
                            />
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {student.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {student.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
