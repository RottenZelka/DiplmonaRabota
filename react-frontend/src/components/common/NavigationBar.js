import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext
import { getUserImage } from '../../services/api';

const NavigationBar = ({ onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext); // Use context for auth state
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          const decodedToken = jwtDecode(jwtToken);
          const userId = decodedToken.data.user_id;

          // Fetch profile image from the server
          const response = await getUserImage(userId);
          if (response.profile_photo_id) {
            setProfileImage(response.profile_photo_id);
          }
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (isAuthenticated) {
      fetchProfileImage();
    }
  }, [isAuthenticated]); // Add isAuthenticated as a dependency

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false); // Update auth state
    setProfileImage(''); // Clear profile image
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
              <Avatar alt="Profile Picture" src={profileImage} />
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
