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
  Slide,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../../hooks/useUser';
import { getUserImage } from '../../services/api';
import MenuIcon from '@mui/icons-material/Menu';

interface NavigationBarProps {
  onLogout: () => void;
  isLoggedIn: boolean;
  user: any;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onLogout, isLoggedIn }) => {
  const { user, removeUser } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          const decodedToken = jwtDecode<{ data: { user_id: string } }>(jwtToken);
          const userId = decodedToken.data.user_id;

          const response = await getUserImage(userId);
          if (response.profile_photo_id) {
            setProfileImage(response.profile_photo_id);
          }
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (isLoggedIn) {
      fetchProfileImage();
    }
  }, [isLoggedIn]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    removeUser();
    setProfileImage('');
    setAnchorEl(null);
    navigate('/');
  };

  const handleMenuHover = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setDrawerOpen(true);
  };

  const handleMenuLeave = () => {
    // Set timeout before closing
    const timeout = setTimeout(() => {
      setDrawerOpen(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const menuItems = (
    <Box
      onMouseEnter={handleMenuHover}
      onMouseLeave={handleMenuLeave}
      sx={{
        width: '100%',
        background: 'linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(14,14,159,1) 6%, rgba(0,212,255,1) 100%)',
        padding: 2,
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1200,
        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
      }}
      role="presentation"
    >
      <List>
        <ListItem component={Link} to="/schools" onClick={() => setDrawerOpen(false)}>
          <ListItemText sx={{ color: 'white' }} primary="Schools" />
        </ListItem>
        <ListItem component={Link} to="/students" onClick={() => setDrawerOpen(false)}>
          <ListItemText sx={{ color: 'white' }} primary="Students" />
        </ListItem>
        <ListItem component={Link} to="/applications" onClick={() => setDrawerOpen(false)}>
          <ListItemText sx={{ color: 'white' }} primary="Applications" />
        </ListItem>
        <ListItem component={Link} to="/exams" onClick={() => setDrawerOpen(false)}>
          <ListItemText sx={{ color: 'white' }} primary="Exams" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky"
        sx={{ 
          background: 'linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(14,14,159,1) 6%, rgba(0,212,255,1) 100%)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: isSmallScreen ? 'space-between' : 'space-around',
            alignItems: 'center',
            flexWrap: 'nowrap',
            position: 'relative',
          }}
        >
          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', flexGrow: isSmallScreen ? 1 : 0 }}
            onClick={() => navigate('/')}
          >
            Student App
          </Typography>

          {isSmallScreen && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onMouseEnter={handleMenuHover}
              onMouseLeave={handleMenuLeave}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

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

          {isLoggedIn ? (
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
                        const decodedToken = jwtDecode<{ data: { user_id: string } }>(token);
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
                {isLoggedIn && user?.user_type === 'student' && (
                  <MenuItem
                    onClick={() => {
                      navigate('/saved-schools');
                      handleMenuClose();
                    }}
                  >
                    Saved Schools
                  </MenuItem>
                )}
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

          {isSmallScreen && (
            <Slide direction="down" in={drawerOpen} mountOnEnter unmountOnExit>
              {menuItems}
            </Slide>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavigationBar;