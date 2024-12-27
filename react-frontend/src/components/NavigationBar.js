import React from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar, IconButton, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const NavigationBar = ({ isLoggedIn, userProfile, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
      <Toolbar>
        {/* Left Menu Items */}
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
        {/* Right User Profile/Authentication */}
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
  );
};

export default NavigationBar;
