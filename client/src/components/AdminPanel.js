import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const AdminPanel = () => {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addChannelDialog, setAddChannelDialog] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    category: 'general',
    type: 'text'
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      if (tab === 0) {
        // Fetch users
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        if (!data.users) {
          throw new Error('Invalid response format');
        }
        
        setUsers(data.users);
      } else {
        // Fetch channels
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/channels`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        if (!data.channels) {
          throw new Error('Invalid response format');
        }

        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!newChannel.name.trim()) {
        setError('Channel name is required');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newChannel)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create channel');
      }

      const data = await response.json();
      console.log('Channel created successfully:', data);

      setAddChannelDialog(false);
      setNewChannel({
        name: '',
        description: '',
        category: 'general',
        type: 'text'
      });
      setError(null);
      fetchData();
    } catch (error) {
      console.error('Error creating channel:', error);
      setError(error.message || 'Failed to create channel. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditForm(item);
    setEditDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = tab === 0 ? 'users' : 'channels';
      
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = tab === 0 ? 'users' : 'channels';
      
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/${endpoint}/${selectedItem._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      setEditDialog(false);
      fetchData();
    } catch (error) {
      setError(error.message);
    }
  };

  const renderUserTable = () => {
    if (!Array.isArray(users)) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="error">Invalid user data</Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>MBTI Type</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.mbtiType}</TableCell>
                <TableCell>
                  {Array.isArray(user.roles) ? user.roles.map((role) => (
                    <Chip 
                      key={role} 
                      label={role}
                      color={role === 'admin' ? 'error' : role === 'moderator' ? 'warning' : 'default'}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  )) : null}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status}
                    color={user.status === 'online' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user._id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChannelTable = () => {
    if (!Array.isArray(channels)) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="error">Invalid channel data</Typography>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setAddChannelDialog(true)}
          >
            Add Channel
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel._id}>
                  <TableCell>{channel.name}</TableCell>
                  <TableCell>{channel.category}</TableCell>
                  <TableCell>{channel.type}</TableCell>
                  <TableCell>{channel.members?.length || 0}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(channel)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(channel._id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Channel Dialog */}
        <Dialog 
          open={addChannelDialog} 
          onClose={() => setAddChannelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Channel</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Channel Name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                required
                error={error?.includes('name')}
                helperText={error?.includes('name') ? error : ''}
              />
              
              <TextField
                fullWidth
                label="Description"
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                multiline
                rows={3}
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newChannel.category}
                  onChange={(e) => setNewChannel({ ...newChannel, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="mbti-types">MBTI Types</MenuItem>
                  <MenuItem value="interests">Interests</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newChannel.type}
                  onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="voice">Voice</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddChannelDialog(false)}>Cancel</Button>
            <Button onClick={handleAddChannel} variant="contained" color="primary">
              Create Channel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminIcon sx={{ mr: 1, color: 'error.main' }} />
          <Typography variant="h5" component="h1">
            Admin Panel
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Users" />
          <Tab label="Channels" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {tab === 0 ? renderUserTable() : renderChannelTable()}
          </Box>
        )}
      </Paper>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {tab === 0 ? 'User' : 'Channel'}
        </DialogTitle>
        <DialogContent>
          {tab === 0 ? (
            // User edit form
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={editForm.username || ''}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>MBTI Type</InputLabel>
                <Select
                  value={editForm.mbtiType || ''}
                  onChange={(e) => setEditForm({ ...editForm, mbtiType: e.target.value })}
                  label="MBTI Type"
                >
                  {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={editForm.roles || []}
                  onChange={(e) => setEditForm({ ...editForm, roles: e.target.value })}
                  label="Roles"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {['user', 'moderator', 'admin'].map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ) : (
            // Channel edit form
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  label="Category"
                >
                  {['general', 'mbti-types', 'interests', 'support'].map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editForm.type || ''}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  label="Type"
                >
                  {['text', 'voice', 'announcement'].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel; 