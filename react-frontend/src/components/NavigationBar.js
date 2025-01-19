import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Box,
  useMediaQuery,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const NavigationBar = ({ isLoggedIn, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('jwtToken');
    setAnchorEl(null);
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(14,14,159,1) 6%, rgba(0,212,255,1) 100%)' }}>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: isSmallScreen ? 'space-between' : 'space-around',
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        {/* Logo/Title */}
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', flexGrow: isSmallScreen ? 1 : 0 }}
          onClick={() => navigate('/')}
        >
          Student App
        </Typography>

        {/* Links (Hidden on Small Screens) */}
        {!isSmallScreen && (
          <Box sx={{ display: 'flex', gap: 2 }}>
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
        )}

        {/* Profile or Authentication */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleMenuOpen}>
              <Avatar alt="Profile Picture" src={/*photo*/''} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem
                onClick={() => {
                  const token = localStorage.getItem('jwtToken');
                  if (token) {
                    try {
                      const decodedToken = jwtDecode(token);
                      const userId = decodedToken.data.user_id;
                      if (userId) navigate(`/profile/${userId}`);
                    } catch (error) {
                      console.error('Invalid token:', error);
                    }
                  }
                  handleMenuClose();
                }}
              >
                Your Profile
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" component={Link} to="/signin">
              Sign In
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
