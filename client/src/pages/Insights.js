import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Favorite as RelationshipsIcon,
  TrendingUp as GrowthIcon,
  Work as CareerIcon,
  School as LearningIcon,
  Group as CommunicationIcon,
} from '@mui/icons-material';

const InsightCard = ({ title, icon, description }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        borderRadius: isMobile ? 0 : 1,
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            gap: 1,
          }}
        >
          {icon}
          <Typography variant={isMobile ? "h6" : "h5"} component="h2">
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.9rem' : '1rem',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Insights = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const insights = [
    {
      title: 'Personality Overview',
      icon: <PsychologyIcon fontSize={isMobile ? "medium" : "large"} color="primary" />,
      description: 'Understand your MBTI type in depth, including cognitive functions, strengths, and potential areas for growth.',
    },
    {
      title: 'Relationships',
      icon: <RelationshipsIcon fontSize={isMobile ? "medium" : "large"} color="error" />,
      description: 'Explore compatibility with other types and learn how to build stronger personal and professional relationships.',
    },
    {
      title: 'Growth & Development',
      icon: <GrowthIcon fontSize={isMobile ? "medium" : "large"} color="success" />,
      description: 'Discover personalized strategies for personal development and ways to leverage your natural preferences.',
    },
    {
      title: 'Career Path',
      icon: <CareerIcon fontSize={isMobile ? "medium" : "large"} color="info" />,
      description: 'Find career paths that align with your personality type and learn how to excel in your chosen field.',
    },
    {
      title: 'Learning Style',
      icon: <LearningIcon fontSize={isMobile ? "medium" : "large"} color="secondary" />,
      description: 'Understand your optimal learning approach and how to adapt your study habits for better results.',
    },
    {
      title: 'Communication',
      icon: <CommunicationIcon fontSize={isMobile ? "medium" : "large"} color="warning" />,
      description: 'Learn effective communication strategies tailored to your type and how to better connect with others.',
    },
  ];

  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        minHeight: '100vh',
        pt: { xs: '56px', sm: '64px' }, // Account for fixed navbar
        pb: 4,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ 
            mb: { xs: 2, sm: 4 },
            px: { xs: 2, sm: 0 },
          }}
        >
          Personality Insights
        </Typography>
        
        <Grid 
          container 
          spacing={isMobile ? 0 : 3}
          sx={{
            px: { xs: 0, sm: 0 },
          }}
        >
          {insights.map((insight, index) => (
            <Grid 
              item 
              xs={12} 
              md={6} 
              key={insight.title}
              sx={{
                mb: isMobile ? 0 : 3,
              }}
            >
              <InsightCard {...insight} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Insights; 