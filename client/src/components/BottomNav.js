import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Psychology as AssessmentIcon,
  Insights as InsightsIcon,
  Chat as ChatIcon,
  Group as CommunityIcon,
} from '@mui/icons-material';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Home"
          value="/"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Test"
          value="/assessment"
          icon={<AssessmentIcon />}
        />
        <BottomNavigationAction
          label="Insights"
          value="/insights"
          icon={<InsightsIcon />}
        />
        <BottomNavigationAction
          label="AI Chat"
          value="/chat"
          icon={<ChatIcon />}
        />
        <BottomNavigationAction
          label="Community"
          value="/community"
          icon={<CommunityIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav; 