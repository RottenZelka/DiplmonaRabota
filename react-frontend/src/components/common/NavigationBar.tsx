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
  Switch,
  Dialog,
  DialogContent,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../../hooks/useUser';
import { getUserImage } from '../../services/api';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

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
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = isDarkTheme ? '/darkTheme.css' : '/lightTheme.css';
    }
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

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
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setDrawerOpen(true);
  };

  const handleMenuLeave = () => {
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNavigation = (path: string) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      setOpenDialog(true);
    }
  };

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
          <ListItemText primary="Schools" />
        </ListItem>
        <ListItem component={Link} to="/students" onClick={() => setDrawerOpen(false)}>
          <ListItemText primary="Students" />
        </ListItem>
        <ListItem onClick={() => handleNavigation('/applications')}>
          <ListItemText primary="Applications" />
        </ListItem>
        <ListItem onClick={() => handleNavigation('/exams')}>
          <ListItemText primary="Exams" />
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
            ApplyBridge
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
              <Button color="inherit" onClick={() => handleNavigation('/applications')}>
                Applications
              </Button>
              <Button color="inherit" onClick={() => handleNavigation('/exams')}>
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

          <Switch
            checked={isDarkTheme}
            onChange={() => setIsDarkTheme(!isDarkTheme)}
            color="default"
            icon={<LightModeIcon />}
            checkedIcon={<DarkModeIcon />}
          />

          {isSmallScreen && (
            <Slide direction="down" in={drawerOpen} mountOnEnter unmountOnExit>
              {menuItems}
            </Slide>
          )}
        </Toolbar>
      </AppBar>
      <link id="theme-link" rel="stylesheet" href={isDarkTheme ? '/darkTheme.css' : '/lightTheme.css'} />

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogContent
          sx={{
            textAlign: "center",
            backgroundColor: "#fff",
            color: "#000",
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
              backgroundColor: "#1976d2",
              color: "#fff",
              marginRight: 2,
            }}
            onClick={() => {
              navigate('/register');
              handleCloseDialog();
            }}
          >
            Register
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              marginRight: 2,
            }}
            onClick={() => {
              navigate('/signin');
              handleCloseDialog();
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: "#000",
              borderColor: "#000",
            }}
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NavigationBar;
