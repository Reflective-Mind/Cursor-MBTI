import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';

const getChannelEmoji = (channelName) => {
  const name = channelName.toLowerCase();
  if (name.includes('general')) return '💬';
  if (name.includes('introvert') || name.includes('intj') || name.includes('intp')) return '🤔';
  if (name.includes('extrovert') || name.includes('entj') || name.includes('entp')) return '🗣️';
  if (name.includes('feeling') || name.includes('infj') || name.includes('infp')) return '❤️';
  if (name.includes('thinking') || name.includes('istj') || name.includes('istp')) return '🧠';
  if (name.includes('sensing') || name.includes('esfj') || name.includes('esfp')) return '👀';
  if (name.includes('intuition') || name.includes('enfj') || name.includes('enfp')) return '✨';
  if (name.includes('judging')) return '📋';
  if (name.includes('perceiving')) return '🔍';
  if (name.includes('announcement')) return '📢';
  if (name.includes('help')) return '❓';
  if (name.includes('off-topic')) return '💭';
  return '🌟';
};

const ChannelList = ({ channels, currentChannel, onChannelSelect }) => {
  return (
    <List>
      {channels.map((channel) => (
        <ListItem
          key={channel._id}
          disablePadding
          sx={{
            backgroundColor: currentChannel?._id === channel._id ? 'action.selected' : 'transparent'
          }}
        >
          <ListItemButton onClick={() => onChannelSelect(channel)}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getChannelEmoji(channel.name)}
            </ListItemIcon>
            <ListItemText primary={channel.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ChannelList; 