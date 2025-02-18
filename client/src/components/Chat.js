import AvatarWithPreview from './AvatarWithPreview';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';

<Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
  <AvatarWithPreview
    src={msg.author.avatar ? `${process.env.REACT_APP_API_URL}/uploads/avatars/${msg.author.avatar}` : undefined}
    alt={msg.author.username}
    size="small"
    isGold={msg.author.email === 'eideken@hotmail.com'}
    onClick={() => handleAvatarClick(msg.author._id)}
    sx={{ mr: 1 }}
  >
    {msg.author.username?.[0]?.toUpperCase()}
  </AvatarWithPreview>
  <Box sx={{ flex: 1 }}>
    <Typography variant="subtitle2" component="span">
      {msg.author.username}
    </Typography>
    <Typography variant="body1">
      {msg.content}
    </Typography>
  </Box>
</Box> 