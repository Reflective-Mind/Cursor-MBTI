import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Avatar,
  Typography,
  Box,
  IconButton,
  Button,
  Tooltip,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfilePopup = ({ userId, open, onClose, username, avatar }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchRating();
    }
  }, [open, userId]);

  const fetchRating = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/rating`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }
      
      const data = await response.json();
      setRating(data);
    } catch (error) {
      console.error('Error fetching rating:', error);
      setError('Failed to load rating');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote) => {
    try {
      setVotingInProgress(true);
      setError(null);
      
      // If clicking the same vote again, send null to remove the vote
      const voteToSend = rating?.currentUserVote === vote ? null : vote;
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote: voteToSend })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      const data = await response.json();
      setRating({
        ...data,
        currentUserVote: voteToSend
      });
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote');
    } finally {
      setVotingInProgress(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'grey.500'
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          src={avatar}
          sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 2,
            bgcolor: 'primary.main'
          }}
        >
          {username?.[0]?.toUpperCase()}
        </Avatar>
        
        <Typography variant="h6" gutterBottom>
          {username}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <CircularProgress size={24} sx={{ my: 2 }} />
        ) : (
          <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Tooltip title={rating?.currentUserVote === 'up' ? 'Remove Upvote' : 'Upvote'}>
                <span>
                  <IconButton 
                    color={rating?.currentUserVote === 'up' ? 'primary' : 'default'}
                    onClick={() => handleVote('up')}
                    disabled={votingInProgress || userId === currentUser?._id}
                  >
                    <Badge badgeContent={rating?.upvotes || 0} color="primary">
                      <ThumbUpIcon />
                    </Badge>
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title={rating?.currentUserVote === 'down' ? 'Remove Downvote' : 'Downvote'}>
                <span>
                  <IconButton
                    color={rating?.currentUserVote === 'down' ? 'error' : 'default'}
                    onClick={() => handleVote('down')}
                    disabled={votingInProgress || userId === currentUser?._id}
                  >
                    <Badge badgeContent={rating?.downvotes || 0} color="error">
                      <ThumbDownIcon />
                    </Badge>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {rating?.positivePercentage}% Positive Rating
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={<PersonIcon />}
          onClick={handleViewProfile}
          fullWidth
          sx={{ mt: 2 }}
        >
          View Full Profile
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePopup; 