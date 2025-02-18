import React from 'react';
import { Avatar, Tooltip, Box, IconButton } from '@mui/material';
import { Zoom } from '@mui/material';
import { keyframes } from '@mui/system';

// Define glow animation
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 15px rgba(66, 165, 245, 0.4);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
`;

const AvatarWithPreview = ({ 
  src, 
  alt, 
  onClick, 
  sx = {}, 
  children,
  isGold = false,
  size = 'medium' // can be 'small', 'medium', 'large'
}) => {
  // Define size mappings
  const sizeMap = {
    small: { avatar: 32, preview: 100 },
    medium: { avatar: 40, preview: 120 },
    large: { avatar: 100, preview: 160 }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  const baseStyles = {
    width: dimensions.avatar,
    height: dimensions.avatar,
    cursor: onClick ? 'pointer' : 'default',
    border: isGold ? `${size === 'large' ? 4 : 2}px solid gold` : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      animation: `${glowAnimation} 2s infinite`,
      transform: 'scale(1.05)',
      boxShadow: isGold 
        ? '0 0 20px rgba(255, 215, 0, 0.5)'
        : '0 0 15px rgba(66, 165, 245, 0.4)',
    },
    ...sx
  };

  const PreviewAvatar = () => (
    <Box 
      sx={{ 
        p: 0.5,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.02)',
        }
      }}
    >
      <Avatar
        src={src}
        sx={{
          width: dimensions.preview,
          height: dimensions.preview,
          border: isGold ? `4px solid gold` : '2px solid #fff',
          boxShadow: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: isGold 
              ? '0 0 20px rgba(255, 215, 0, 0.5)'
              : '0 0 15px rgba(66, 165, 245, 0.4)',
          }
        }}
      >
        {children}
      </Avatar>
    </Box>
  );

  return (
    <Tooltip
      title={<PreviewAvatar />}
      placement="top"
      TransitionComponent={Zoom}
      TransitionProps={{ timeout: 400 }}
      arrow
      enterDelay={200}
      leaveDelay={0}
      sx={{ 
        backgroundColor: 'transparent',
        '& .MuiTooltip-tooltip': {
          backgroundColor: 'transparent',
          maxWidth: 'none',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '& .MuiTooltip-arrow': {
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }}
    >
      <IconButton 
        disableRipple={false}
        onClick={onClick}
        sx={{
          p: 0,
          '&:hover': {
            backgroundColor: 'transparent',
          }
        }}
      >
        <Avatar
          src={src}
          alt={alt}
          sx={baseStyles}
        >
          {children}
        </Avatar>
      </IconButton>
    </Tooltip>
  );
};

export default AvatarWithPreview; 