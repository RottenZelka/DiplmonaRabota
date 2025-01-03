import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NavigationBar from './components/NavigationBar';
import Register from './components/Register';
import RegisterSchool from './components/RegisterSchool';
import Profile from './components/Profiles/Profile';
import SignIn from './components/SignIn';
import Schools from './components/Lists/Schools';
import Home from './components/Lists/Home';
// import Exams from './components/Lists/Exams';
// import Applications from './components/Lists/Applications';
// import Students from './components/Lists/Students';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          setIsLoggedIn(true);
        }
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box>
        <NavigationBar
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onLogout={handleLogout}
        />

        <Container sx={{ paddingY: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/schools" element={<Schools />} />
            {/* <Route path="/exams" element={<Exams />} />
            <Route path="/students" element={<Students />} />
            <Route path="/applications" element={<Applications />} /> */}
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
