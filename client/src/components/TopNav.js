import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const TopNav = () => {
  const { user } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        {user && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user.roles?.includes('admin') && (
                <Tooltip title="Admin Dashboard">
                  <IconButton color="inherit" onClick={() => navigate('/admin')}>
                    <AdminIcon sx={{ color: '#FFD700' }} />
                  </IconButton>
                </Tooltip>
              )}
              <Avatar
                src={user.avatar}
                alt={user.username}
                onClick={() => navigate('/profile')}
                sx={{
                  cursor: 'pointer',
                  border: user.roles?.includes('admin') ? '2px solid #FFD700' : 'none',
                  boxShadow: user.roles?.includes('admin') ? '0 0 10px #FFD700' : 'none'
                }}
              >
                {user.username?.[0]?.toUpperCase()}
              </Avatar>
              <Typography
                variant="subtitle1"
                sx={{
                  color: user.roles?.includes('admin') ? '#FFD700' : 'inherit',
                  fontWeight: user.roles?.includes('admin') ? 'bold' : 'normal',
                  textShadow: user.roles?.includes('admin') ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none'
                }}
              >
                {user.username}
                {user.roles?.includes('admin') && ' (Admin)'}
              </Typography>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}; 