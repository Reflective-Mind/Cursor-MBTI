import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Badge as BadgeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('highest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/admin/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action) => {
    try {
      if (!selectedUser?._id) {
        setError('Invalid user selected');
        return;
      }

      setError(null);
      
      if (action === 'delete') {
        await handleDeleteUser(selectedUser._id);
      } else if (action === 'reset-ratings') {
        await handleResetRatings(selectedUser._id);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error performing action:', error);
      setError(error.message || 'Failed to perform action');
    }
  };

  const handleOpenDialog = (user, type) => {
    setSelectedUser(user);
    setDialogType(type);
    setDialogOpen(true);
    setActionReason('');
    setActionSuccess(null);
    setError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setDialogType('');
    setActionReason('');
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'trusted_member':
        return 'success';
      case 'active_contributor':
        return 'primary';
      case 'warning_flag':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'trusted_member':
        return <CheckCircleIcon />;
      case 'active_contributor':
        return <BadgeIcon />;
      case 'warning_flag':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      if (!userId) {
        setError('Invalid user ID');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/admin/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
      setActionSuccess('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user');
    }
  };

  const handleResetRatings = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/admin/${userId}/reset-ratings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: actionReason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset ratings');
      }

      await fetchUsers(); // Refresh the user list
      setActionSuccess('Ratings reset successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error resetting ratings:', error);
      setError(error.message || 'Failed to reset ratings');
    }
  };

  if (!currentUser?.roles?.includes('admin')) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You do not have permission to access the admin dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Admin Dashboard
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort Users</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Sort Users"
            >
              <MenuItem value="highest">Highest Rated</MenuItem>
              <MenuItem value="lowest">Lowest Rated</MenuItem>
              <MenuItem value="neutral">Most Neutral</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {actionSuccess}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Badges</TableCell>
                  <TableCell>Vote History</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src={user.avatar}
                          alt={user.username}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        <Typography>{user.username}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {user.positivePercentage}% Positive
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({user.totalVotes} total votes)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {user.badges?.filter(b => b.active).map((badge, index) => (
                          <Tooltip
                            key={index}
                            title={`Earned ${new Date(badge.earnedAt).toLocaleDateString()}`}
                          >
                            <Chip
                              icon={getBadgeIcon(badge.type)}
                              label={badge.type.replace('_', ' ').toUpperCase()}
                              color={getBadgeColor(badge.type)}
                              size="small"
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(user, 'history')}
                      >
                        <TimelineIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Reset Ratings">
                          <IconButton
                            color="warning"
                            onClick={() => handleOpenDialog(user, 'reset')}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDialog(user, 'delete')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'delete' ? 'Delete User' :
           dialogType === 'reset' ? 'Reset User Ratings' :
           'Vote History'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'history' ? (
            <Box sx={{ mt: 2 }}>
              {selectedUser?.ratings?.history?.map((vote, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'action.hover'
                  }}
                >
                  <img
                    src={vote.user.avatar}
                    alt={vote.user.username}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%'
                    }}
                  />
                  <Box>
                    <Typography variant="body2">
                      {vote.user.username} voted {vote.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(vote.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <>
              <Typography sx={{ mt: 2, mb: 2 }}>
                {dialogType === 'delete'
                  ? `Are you sure you want to delete ${selectedUser?.username}'s profile?`
                  : `Are you sure you want to reset ${selectedUser?.username}'s ratings?`}
              </Typography>
              <TextField
                fullWidth
                label="Reason for action"
                multiline
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogType !== 'history' && (
            <Button
              onClick={() => handleAction(dialogType === 'delete' ? 'delete' : 'reset-ratings')}
              color="error"
              disabled={!actionReason}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 