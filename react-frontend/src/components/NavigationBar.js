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
  InputBase,
  Select,
  FormControl,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.15), rgba(33, 203, 243, 0.15))',
  '&:hover': {
    background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.25), rgba(33, 203, 243, 0.25))',
  },
  marginLeft: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  border: `1px solid rgba(255, 255, 255, 0.25)`,
  padding: theme.spacing(0, 1),
  width: '100%',
  maxWidth: 400,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  flexGrow: 1,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
    width: '100%',
  },
}));

const NavigationBar = ({ isLoggedIn, userProfile, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('students');
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn);
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));

  useEffect(() => {
    // Update local states when props change
    setIsAuthenticated(isLoggedIn);
    setCurrentUserProfile(userProfile);
  }, [isLoggedIn, userProfile]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    setAnchorEl(null);
    navigate('/');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}&filter=${searchFilter}`);
    }
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

        {/* Search Bar */}
        {!isSmallScreen && (
          <Search>
            <FormControl size="small" sx={{ minWidth: 100, marginRight: 1 }}>
              <Select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Search Filter' }}
              >
                <MenuItem value="students">Students</MenuItem>
                <MenuItem value="schools">Schools</MenuItem>
              </Select>
            </FormControl>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Search>
        )}

        {/* Profile or Authentication */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleMenuOpen}>
              <Avatar alt="Profile Picture" src={currentUserProfile?.photo || ''} />
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
