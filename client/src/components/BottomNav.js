import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Group as GroupIcon, Person as ProfileIcon, Chat as ChatIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/community') return 1;
    if (path.startsWith('/chat')) return 2;
    if (path.startsWith('/profile')) return 3;
    return 0;
  };

  const handleNavigation = (newValue) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/community');
        break;
      case 2:
        navigate('/chat');
        break;
      case 3:
        if (user?._id) {
          navigate(`/profile/${user._id}`);
        } else {
          navigate('/profile');
        }
        break;
      default:
        navigate('/');
    }
  };

  return (
    <BottomNavigation
      value={getActiveTab()}
      onChange={(event, newValue) => handleNavigation(newValue)}
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1000,
        backgroundColor: 'background.paper',
        display: { xs: 'flex', md: 'none' }
      }}
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Community" icon={<GroupIcon />} />
      <BottomNavigationAction label="Chat" icon={<ChatIcon />} />
      <BottomNavigationAction label="Profile" icon={<ProfileIcon />} />
    </BottomNavigation>
  );
};

export default BottomNav; 