import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Insights from './pages/Insights';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Login from './pages/Login';
import Profile from './pages/Profile';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#020818',
      paper: 'rgba(2, 8, 24, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.8rem',
      fontWeight: 500,
      background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: `
        0 0 42px rgba(33, 150, 243, 0.2),
        0 0 82px rgba(33, 150, 243, 0.2),
        0 0 92px rgba(33, 150, 243, 0.2)
      `,
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 500,
      color: '#ffffff',
      textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 500,
      color: '#ffffff',
      textShadow: '0 0 15px rgba(33, 150, 243, 0.3)',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#ffffff',
      textShadow: '0 0 10px rgba(33, 150, 243, 0.3)',
    },
    body1: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    body2: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '0 8px',
            paddingBottom: '56px', // Add space for bottom navigation
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(2, 8, 24, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          '@media (max-width: 600px)': {
            borderRadius: 0,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(2, 8, 24, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '@media (max-width: 600px)': {
            borderRadius: 0,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '30px',
          textTransform: 'none',
          '@media (max-width: 600px)': {
            padding: '6px 16px',
            fontSize: '0.875rem',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976d2, #2196f3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(2, 8, 24, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          '@media (max-width: 600px)': {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 600px)': {
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          '@media (max-width: 600px)': {
            fontSize: '2rem',
          },
        },
        h2: {
          '@media (max-width: 600px)': {
            fontSize: '1.75rem',
          },
        },
        h3: {
          '@media (max-width: 600px)': {
            fontSize: '1.5rem',
          },
        },
        h4: {
          '@media (max-width: 600px)': {
            fontSize: '1.25rem',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App" style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #020818 0%, #000000 100%)',
            paddingTop: '56px', // Add padding for fixed mobile navbar
            '@media (min-width: 600px)': {
              paddingTop: '64px',
            },
          }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
            </Routes>
            <BottomNav />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
