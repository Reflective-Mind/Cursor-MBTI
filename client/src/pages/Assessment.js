import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Paper,
  Grid,
  Drawer,
  TextField,
  Avatar,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Close as CloseIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Basic questions (original 8 questions)
const basicQuestions = [
  {
    category: 'Extraversion (E) vs. Introversion (I)',
    questions: [
      {
        id: 'q1',
        text: 'How do you prefer to recharge?',
        options: [
          { value: 'E', text: 'Spending time with others energizes me' },
          { value: 'I', text: 'I need alone time to recharge' },
        ],
      },
      {
        id: 'q2',
        text: 'In social situations, you usually:',
        options: [
          { value: 'E', text: 'Seek out interactions and conversations' },
          { value: 'I', text: 'Prefer smaller, more intimate gatherings' },
        ],
      },
    ],
  },
  {
    category: 'Sensing (S) vs. Intuition (N)',
    questions: [
      {
        id: 'q3',
        text: 'When solving problems, you tend to:',
        options: [
          { value: 'S', text: 'Focus on concrete facts and details' },
          { value: 'N', text: 'Look for patterns and possibilities' },
        ],
      },
      {
        id: 'q4',
        text: 'When learning something new, you prefer:',
        options: [
          { value: 'S', text: 'Step-by-step instructions' },
          { value: 'N', text: 'Understanding the big picture first' },
        ],
      },
    ],
  },
  {
    category: 'Thinking (T) vs. Feeling (F)',
    questions: [
      {
        id: 'q5',
        text: 'When making decisions, you primarily consider:',
        options: [
          { value: 'T', text: 'Logic and objective analysis' },
          { value: 'F', text: 'Impact on people and harmony' },
        ],
      },
      {
        id: 'q6',
        text: 'In conflicts, you tend to:',
        options: [
          { value: 'T', text: 'Focus on finding the most logical solution' },
          { value: 'F', text: 'Consider everyone\'s feelings and values' },
        ],
      },
    ],
  },
  {
    category: 'Judging (J) vs. Perceiving (P)',
    questions: [
      {
        id: 'q7',
        text: 'How do you prefer to plan your day?',
        options: [
          { value: 'J', text: 'With a clear schedule and structure' },
          { value: 'P', text: 'Keeping options open and flexible' },
        ],
      },
      {
        id: 'q8',
        text: 'When working on projects, you prefer to:',
        options: [
          { value: 'J', text: 'Follow a plan and finish ahead of deadline' },
          { value: 'P', text: 'Adapt as you go and work until the deadline' },
        ],
      },
    ],
  },
];

// Additional questions for the standard test
const standardQuestions = [
  {
    category: 'Extraversion (E) vs. Introversion (I)',
    questions: [
      {
        id: 'q9',
        text: 'In group discussions, you:',
        options: [
          { value: 'E', text: 'Speak up readily and share your thoughts' },
          { value: 'I', text: 'Prefer to listen and speak when needed' },
        ],
      },
      {
        id: 'q10',
        text: 'Your ideal weekend would be:',
        options: [
          { value: 'E', text: 'Going out with friends and being active' },
          { value: 'I', text: 'Staying home with a book or hobby' },
        ],
      },
    ],
  },
  {
    category: 'Sensing (S) vs. Intuition (N)',
    questions: [
      {
        id: 'q11',
        text: 'When reading, you prefer books that:',
        options: [
          { value: 'S', text: 'Describe things in detail and reality' },
          { value: 'N', text: 'Explore abstract concepts and possibilities' },
        ],
      },
      {
        id: 'q12',
        text: 'When starting a project, you focus on:',
        options: [
          { value: 'S', text: 'The specific steps and requirements' },
          { value: 'N', text: 'The potential impact and future possibilities' },
        ],
      },
    ],
  },
  {
    category: 'Thinking (T) vs. Feeling (F)',
    questions: [
      {
        id: 'q13',
        text: 'When giving feedback, you tend to:',
        options: [
          { value: 'T', text: 'Be direct and focus on improvement' },
          { value: 'F', text: 'Be gentle and consider feelings' },
        ],
      },
      {
        id: 'q14',
        text: 'When making a difficult decision, you:',
        options: [
          { value: 'T', text: 'Analyze pros and cons objectively' },
          { value: 'F', text: 'Consider how it affects everyone involved' },
        ],
      },
    ],
  },
  {
    category: 'Judging (J) vs. Perceiving (P)',
    questions: [
      {
        id: 'q15',
        text: 'Your workspace is usually:',
        options: [
          { value: 'J', text: 'Organized and structured' },
          { value: 'P', text: 'Flexible and adaptable' },
        ],
      },
      {
        id: 'q16',
        text: 'When traveling, you prefer to:',
        options: [
          { value: 'J', text: 'Have a detailed itinerary' },
          { value: 'P', text: 'Go with the flow and be spontaneous' },
        ],
      },
    ],
  },
];

// Additional questions for the comprehensive test
const comprehensiveQuestions = [
  {
    category: 'Extraversion (E) vs. Introversion (I)',
    questions: [
      {
        id: 'q17',
        text: 'After a busy day at work/school, you prefer to:',
        options: [
          { value: 'E', text: 'Meet friends or engage in social activities' },
          { value: 'I', text: 'Spend quiet time alone to decompress' },
        ],
      },
      {
        id: 'q18',
        text: 'In team projects, you typically:',
        options: [
          { value: 'E', text: 'Take the lead and coordinate with others' },
          { value: 'I', text: 'Work independently on assigned tasks' },
        ],
      },
    ],
  },
  {
    category: 'Sensing (S) vs. Intuition (N)',
    questions: [
      {
        id: 'q19',
        text: 'When solving problems, you trust:',
        options: [
          { value: 'S', text: 'Your past experience and proven methods' },
          { value: 'N', text: 'Your gut feelings and innovative approaches' },
        ],
      },
      {
        id: 'q20',
        text: 'You are more interested in:',
        options: [
          { value: 'S', text: 'What is actual and present' },
          { value: 'N', text: 'What is possible and future' },
        ],
      },
    ],
  },
  {
    category: 'Thinking (T) vs. Feeling (F)',
    questions: [
      {
        id: 'q21',
        text: 'In group decisions, you prioritize:',
        options: [
          { value: 'T', text: 'Finding the most efficient solution' },
          { value: 'F', text: 'Maintaining group harmony' },
        ],
      },
      {
        id: 'q22',
        text: 'When someone is upset, you tend to:',
        options: [
          { value: 'T', text: 'Offer practical solutions' },
          { value: 'F', text: 'Provide emotional support' },
        ],
      },
    ],
  },
  {
    category: 'Judging (J) vs. Perceiving (P)',
    questions: [
      {
        id: 'q23',
        text: 'Your approach to deadlines is:',
        options: [
          { value: 'J', text: 'Complete work well in advance' },
          { value: 'P', text: 'Work best under pressure' },
        ],
      },
      {
        id: 'q24',
        text: 'You prefer environments that are:',
        options: [
          { value: 'J', text: 'Well-structured and predictable' },
          { value: 'P', text: 'Flexible and spontaneous' },
        ],
      },
    ],
  },
];

const testTypes = [
  {
    id: 'quick',
    title: 'Quick Assessment',
    description: '8 questions - Get a quick snapshot of your personality type (5 minutes)',
    questions: basicQuestions,
  },
  {
    id: 'standard',
    title: 'Standard Assessment',
    description: '24 questions - Get a detailed analysis of your personality traits (15 minutes)',
    questions: [...basicQuestions, ...standardQuestions, ...comprehensiveQuestions],
  },
  {
    id: 'expert',
    title: 'Expert Assessment',
    description: '100 questions - Get the most accurate and in-depth analysis of your personality type (45-60 minutes)',
    questions: [
      // E vs I - 25 questions (13 pairs)
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q33',
            text: 'In online meetings, you typically:',
            options: [
              { value: 'E', text: 'Keep your video on and actively participate' },
              { value: 'I', text: 'Prefer to listen and contribute when necessary' },
            ],
          },
          {
            id: 'q34',
            text: 'When networking at events, you:',
            options: [
              { value: 'E', text: 'Initiate conversations with multiple people' },
              { value: 'I', text: 'Have deeper conversations with fewer people' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q35',
            text: 'Your preferred method of communication is:',
            options: [
              { value: 'E', text: 'Real-time conversation (phone/video calls)' },
              { value: 'I', text: 'Asynchronous communication (email/messages)' },
            ],
          },
          {
            id: 'q36',
            text: 'In group brainstorming sessions, you:',
            options: [
              { value: 'E', text: 'Share ideas as they come to mind' },
              { value: 'I', text: 'Process thoughts before contributing' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q37',
            text: 'When receiving important news, you prefer to:',
            options: [
              { value: 'E', text: 'Discuss it immediately with others' },
              { value: 'I', text: 'Process it privately before sharing' },
            ],
          },
          {
            id: 'q38',
            text: 'During team activities, you tend to:',
            options: [
              { value: 'E', text: 'Take an active, visible role' },
              { value: 'I', text: 'Contribute more behind the scenes' },
            ],
          },
        ],
      },
      // Continue with remaining E/I questions...
      // S vs N - 25 questions (13 pairs)
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q39',
            text: 'When analyzing data, you focus on:',
            options: [
              { value: 'S', text: 'The specific numbers and concrete facts' },
              { value: 'N', text: 'The patterns and potential implications' },
            ],
          },
          {
            id: 'q40',
            text: 'In conversations, you tend to:',
            options: [
              { value: 'S', text: 'Discuss concrete, current events' },
              { value: 'N', text: 'Explore theoretical possibilities' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q41',
            text: 'When reading instructions, you prefer:',
            options: [
              { value: 'S', text: 'Detailed, step-by-step guidance' },
              { value: 'N', text: 'A general overview with room for interpretation' },
            ],
          },
          {
            id: 'q42',
            text: 'In problem-solving, you rely more on:',
            options: [
              { value: 'S', text: 'Past experiences and proven methods' },
              { value: 'N', text: 'Intuition and novel approaches' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q43',
            text: 'When learning new skills, you prefer to:',
            options: [
              { value: 'S', text: 'Practice with concrete examples' },
              { value: 'N', text: 'Understand the underlying concepts first' },
            ],
          },
          {
            id: 'q44',
            text: 'In meetings, you focus more on:',
            options: [
              { value: 'S', text: 'Current issues and practical solutions' },
              { value: 'N', text: 'Future possibilities and innovative ideas' },
            ],
          },
        ],
      },
      // Continue with remaining S/N questions...
      // T vs F - 25 questions (13 pairs)
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q45',
            text: 'When making decisions, you primarily consider:',
            options: [
              { value: 'T', text: 'Objective facts and logical consequences' },
              { value: 'F', text: 'Personal values and emotional impact' },
            ],
          },
          {
            id: 'q46',
            text: 'In conflicts, you tend to:',
            options: [
              { value: 'T', text: 'Analyze the situation objectively' },
              { value: 'F', text: 'Consider everyone\'s feelings' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q47',
            text: 'When giving feedback, you focus on:',
            options: [
              { value: 'T', text: 'Being direct and pointing out improvements' },
              { value: 'F', text: 'Being supportive and highlighting positives' },
            ],
          },
          {
            id: 'q48',
            text: 'In group projects, you prioritize:',
            options: [
              { value: 'T', text: 'Meeting objectives efficiently' },
              { value: 'F', text: 'Maintaining team harmony' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q49',
            text: 'When someone shares a problem, you typically:',
            options: [
              { value: 'T', text: 'Offer solutions and analysis' },
              { value: 'F', text: 'Provide emotional support first' },
            ],
          },
          {
            id: 'q50',
            text: 'In workplace decisions, you emphasize:',
            options: [
              { value: 'T', text: 'Efficiency and productivity' },
              { value: 'F', text: 'Employee satisfaction and morale' },
            ],
          },
        ],
      },
      // Continue with remaining T/F questions...
      // J vs P - 25 questions (13 pairs)
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q51',
            text: 'When planning events, you prefer to:',
            options: [
              { value: 'J', text: 'Have everything organized in advance' },
              { value: 'P', text: 'Keep options open for last-minute changes' },
            ],
          },
          {
            id: 'q52',
            text: 'Your work style is:',
            options: [
              { value: 'J', text: 'Structured and methodical' },
              { value: 'P', text: 'Flexible and adaptable' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q53',
            text: 'When starting a project, you:',
            options: [
              { value: 'J', text: 'Create a detailed plan first' },
              { value: 'P', text: 'Jump in and adjust as needed' },
            ],
          },
          {
            id: 'q54',
            text: 'Your ideal schedule is:',
            options: [
              { value: 'J', text: 'Well-structured with clear deadlines' },
              { value: 'P', text: 'Open-ended with room for spontaneity' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q55',
            text: 'When making decisions, you prefer to:',
            options: [
              { value: 'J', text: 'Reach a conclusion quickly' },
              { value: 'P', text: 'Keep exploring alternatives' },
            ],
          },
          {
            id: 'q56',
            text: 'Your workspace is typically:',
            options: [
              { value: 'J', text: 'Neat and well-organized' },
              { value: 'P', text: 'Creative and adaptable' },
            ],
          },
        ],
      },
      // Continue with remaining J/P questions...
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q57',
            text: 'At social gatherings, you:',
            options: [
              { value: 'E', text: 'Move between different groups easily' },
              { value: 'I', text: 'Stick with one or two close friends' },
            ],
          },
          {
            id: 'q58',
            text: 'Your ideal work environment is:',
            options: [
              { value: 'E', text: 'An open office with lots of interaction' },
              { value: 'I', text: 'A quiet space with minimal interruptions' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q59',
            text: 'When problem-solving, you prefer to:',
            options: [
              { value: 'E', text: 'Discuss ideas with others' },
              { value: 'I', text: 'Think through solutions alone' },
            ],
          },
          {
            id: 'q60',
            text: 'During presentations, you:',
            options: [
              { value: 'E', text: 'Enjoy engaging with the audience' },
              { value: 'I', text: 'Focus on delivering the content' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q61',
            text: 'When reading a story, you focus on:',
            options: [
              { value: 'S', text: 'The specific details and events' },
              { value: 'N', text: 'The underlying themes and meanings' },
            ],
          },
          {
            id: 'q62',
            text: 'In decision-making, you trust:',
            options: [
              { value: 'S', text: 'Concrete evidence and facts' },
              { value: 'N', text: 'Your gut feelings and hunches' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q63',
            text: 'When planning a project, you focus on:',
            options: [
              { value: 'S', text: 'The immediate practical steps' },
              { value: 'N', text: 'The long-term vision' },
            ],
          },
          {
            id: 'q64',
            text: 'You are more interested in:',
            options: [
              { value: 'S', text: 'Real-world applications' },
              { value: 'N', text: 'Theoretical concepts' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q65',
            text: 'When evaluating ideas, you prioritize:',
            options: [
              { value: 'T', text: 'Logic and consistency' },
              { value: 'F', text: 'Impact on people' },
            ],
          },
          {
            id: 'q66',
            text: 'In team discussions, you emphasize:',
            options: [
              { value: 'T', text: 'Finding the most effective solution' },
              { value: 'F', text: 'Ensuring everyone feels heard' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q67',
            text: 'When resolving conflicts, you focus on:',
            options: [
              { value: 'T', text: 'Establishing clear facts' },
              { value: 'F', text: 'Understanding emotions involved' },
            ],
          },
          {
            id: 'q68',
            text: 'In decision-making, you consider:',
            options: [
              { value: 'T', text: 'What makes the most sense' },
              { value: 'F', text: 'What feels right' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q69',
            text: 'Your approach to deadlines is:',
            options: [
              { value: 'J', text: 'Complete tasks well in advance' },
              { value: 'P', text: 'Adapt and finish just in time' },
            ],
          },
          {
            id: 'q70',
            text: 'When organizing your schedule, you:',
            options: [
              { value: 'J', text: 'Plan activities in detail' },
              { value: 'P', text: 'Leave room for spontaneity' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q71',
            text: 'Your approach to rules is:',
            options: [
              { value: 'J', text: 'Follow them consistently' },
              { value: 'P', text: 'See them as guidelines' },
            ],
          },
          {
            id: 'q72',
            text: 'When working on projects, you prefer:',
            options: [
              { value: 'J', text: 'Clear milestones and deadlines' },
              { value: 'P', text: 'Flexibility to adjust as needed' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q73',
            text: 'After a challenging day, you prefer to:',
            options: [
              { value: 'E', text: 'Talk it through with others' },
              { value: 'I', text: 'Reflect on it privately' },
            ],
          },
          {
            id: 'q74',
            text: 'In group settings, you typically:',
            options: [
              { value: 'E', text: 'Speak up frequently' },
              { value: 'I', text: 'Listen more than speak' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q75',
            text: 'When solving problems, you prefer to:',
            options: [
              { value: 'S', text: 'Use tried and tested methods' },
              { value: 'N', text: 'Try innovative approaches' },
            ],
          },
          {
            id: 'q76',
            text: 'You are more drawn to:',
            options: [
              { value: 'S', text: 'Practical, hands-on activities' },
              { value: 'N', text: 'Abstract, conceptual discussions' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q77',
            text: 'When making choices, you prioritize:',
            options: [
              { value: 'T', text: 'Objective criteria' },
              { value: 'F', text: 'Personal values' },
            ],
          },
          {
            id: 'q78',
            text: 'In discussions, you tend to:',
            options: [
              { value: 'T', text: 'Focus on facts and logic' },
              { value: 'F', text: 'Consider emotional impact' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q79',
            text: 'Your typical approach to tasks is:',
            options: [
              { value: 'J', text: 'Systematic and organized' },
              { value: 'P', text: 'Flexible and spontaneous' },
            ],
          },
          {
            id: 'q80',
            text: 'When planning trips, you prefer to:',
            options: [
              { value: 'J', text: 'Have a detailed itinerary' },
              { value: 'P', text: 'See what happens' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q81',
            text: 'Your preferred learning style is:',
            options: [
              { value: 'E', text: 'Interactive group discussions' },
              { value: 'I', text: 'Independent study' },
            ],
          },
          {
            id: 'q82',
            text: 'In social situations, you:',
            options: [
              { value: 'E', text: 'Seek out new connections' },
              { value: 'I', text: 'Interact with familiar faces' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q83',
            text: 'When describing things, you focus on:',
            options: [
              { value: 'S', text: 'Specific details and facts' },
              { value: 'N', text: 'General impressions and metaphors' },
            ],
          },
          {
            id: 'q84',
            text: 'You are more interested in:',
            options: [
              { value: 'S', text: 'What is currently happening' },
              { value: 'N', text: 'What could happen in the future' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q85',
            text: 'When leading a team, you focus on:',
            options: [
              { value: 'T', text: 'Achieving goals efficiently' },
              { value: 'F', text: 'Building strong relationships' },
            ],
          },
          {
            id: 'q86',
            text: 'In difficult situations, you rely on:',
            options: [
              { value: 'T', text: 'Logical analysis' },
              { value: 'F', text: 'Personal values' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q87',
            text: 'Your daily routine is:',
            options: [
              { value: 'J', text: 'Well-planned and structured' },
              { value: 'P', text: 'Flexible and adaptable' },
            ],
          },
          {
            id: 'q88',
            text: 'When making plans, you prefer:',
            options: [
              { value: 'J', text: 'Setting firm commitments' },
              { value: 'P', text: 'Keeping options open' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q89',
            text: 'Your communication style is:',
            options: [
              { value: 'E', text: 'Open and expressive' },
              { value: 'I', text: 'Reserved and thoughtful' },
            ],
          },
          {
            id: 'q90',
            text: 'When working on projects, you prefer:',
            options: [
              { value: 'E', text: 'Collaborating with others' },
              { value: 'I', text: 'Working independently' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q91',
            text: 'When learning, you focus on:',
            options: [
              { value: 'S', text: 'Mastering practical skills' },
              { value: 'N', text: 'Understanding concepts' },
            ],
          },
          {
            id: 'q92',
            text: 'You are more likely to trust:',
            options: [
              { value: 'S', text: 'Direct experience' },
              { value: 'N', text: 'Theoretical insights' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q93',
            text: 'When making decisions, you consider:',
            options: [
              { value: 'T', text: 'Objective criteria first' },
              { value: 'F', text: 'People\'s feelings first' },
            ],
          },
          {
            id: 'q94',
            text: 'In conversations, you tend to:',
            options: [
              { value: 'T', text: 'Seek clarity and precision' },
              { value: 'F', text: 'Foster harmony and connection' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q95',
            text: 'Your approach to goals is:',
            options: [
              { value: 'J', text: 'Set clear targets and timelines' },
              { value: 'P', text: 'Remain open to opportunities' },
            ],
          },
          {
            id: 'q96',
            text: 'When organizing your space, you:',
            options: [
              { value: 'J', text: 'Maintain consistent order' },
              { value: 'P', text: 'Adapt to current needs' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q97',
            text: 'In group discussions, you:',
            options: [
              { value: 'E', text: 'Think out loud and share ideas freely' },
              { value: 'I', text: 'Process thoughts before speaking' },
            ],
          },
          {
            id: 'q98',
            text: 'Your energy levels are highest when:',
            options: [
              { value: 'E', text: 'Engaging with others' },
              { value: 'I', text: 'Having time to yourself' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q99',
            text: 'When approaching new situations, you:',
            options: [
              { value: 'S', text: 'Focus on immediate realities' },
              { value: 'N', text: 'Consider future possibilities' },
            ],
          },
          {
            id: 'q100',
            text: 'You prefer discussions that are:',
            options: [
              { value: 'S', text: 'Practical and concrete' },
              { value: 'N', text: 'Abstract and theoretical' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q101',
            text: 'When giving advice, you focus on:',
            options: [
              { value: 'T', text: 'Finding practical solutions' },
              { value: 'F', text: 'Understanding emotional needs' },
            ],
          },
          {
            id: 'q102',
            text: 'In team conflicts, you prioritize:',
            options: [
              { value: 'T', text: 'Resolving the issue efficiently' },
              { value: 'F', text: 'Maintaining team relationships' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q103',
            text: 'Your email inbox is usually:',
            options: [
              { value: 'J', text: 'Organized with folders and labels' },
              { value: 'P', text: 'Managed as needed' },
            ],
          },
          {
            id: 'q104',
            text: 'When starting your day, you prefer:',
            options: [
              { value: 'J', text: 'Following a set routine' },
              { value: 'P', text: 'Going with the flow' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q105',
            text: 'In virtual meetings, you prefer:',
            options: [
              { value: 'E', text: 'Camera on, active participation' },
              { value: 'I', text: 'Camera optional, focused listening' },
            ],
          },
          {
            id: 'q106',
            text: 'During lunch breaks, you typically:',
            options: [
              { value: 'E', text: 'Join colleagues and socialize' },
              { value: 'I', text: 'Take time for yourself' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q107',
            text: 'When reading news, you focus on:',
            options: [
              { value: 'S', text: 'Specific events and facts' },
              { value: 'N', text: 'Broader implications and trends' },
            ],
          },
          {
            id: 'q108',
            text: 'In creative tasks, you prefer to:',
            options: [
              { value: 'S', text: 'Follow established techniques' },
              { value: 'N', text: 'Experiment with new approaches' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q109',
            text: 'When evaluating performance, you emphasize:',
            options: [
              { value: 'T', text: 'Measurable results and metrics' },
              { value: 'F', text: 'Personal growth and effort' },
            ],
          },
          {
            id: 'q110',
            text: 'In disagreements, you tend to:',
            options: [
              { value: 'T', text: 'Focus on the core issue' },
              { value: 'F', text: 'Consider everyone\'s perspective' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q111',
            text: 'Your weekend plans are usually:',
            options: [
              { value: 'J', text: 'Scheduled in advance' },
              { value: 'P', text: 'Decided spontaneously' },
            ],
          },
          {
            id: 'q112',
            text: 'When packing for trips, you:',
            options: [
              { value: 'J', text: 'Make detailed lists and pack early' },
              { value: 'P', text: 'Pack last minute with flexibility' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q113',
            text: 'In new environments, you tend to:',
            options: [
              { value: 'E', text: 'Quickly engage with others' },
              { value: 'I', text: 'Observe and adjust gradually' },
            ],
          },
          {
            id: 'q114',
            text: 'Your ideal celebration would be:',
            options: [
              { value: 'E', text: 'A lively party with many friends' },
              { value: 'I', text: 'A small gathering with close ones' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q115',
            text: 'When explaining concepts, you prefer:',
            options: [
              { value: 'S', text: 'Using concrete examples' },
              { value: 'N', text: 'Discussing abstract ideas' },
            ],
          },
          {
            id: 'q116',
            text: 'In brainstorming sessions, you focus on:',
            options: [
              { value: 'S', text: 'Practical and feasible ideas' },
              { value: 'N', text: 'Novel and innovative concepts' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q117',
            text: 'When making tough decisions, you rely on:',
            options: [
              { value: 'T', text: 'Data and objective analysis' },
              { value: 'F', text: 'Values and personal impact' },
            ],
          },
          {
            id: 'q118',
            text: 'In group settings, you prioritize:',
            options: [
              { value: 'T', text: 'Task completion and efficiency' },
              { value: 'F', text: 'Group dynamics and morale' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q119',
            text: 'Your approach to deadlines is:',
            options: [
              { value: 'J', text: 'Setting clear milestones' },
              { value: 'P', text: 'Staying flexible and adaptable' },
            ],
          },
          {
            id: 'q120',
            text: 'When organizing events, you prefer:',
            options: [
              { value: 'J', text: 'Having a detailed schedule' },
              { value: 'P', text: 'Keeping plans loose' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q121',
            text: 'During team meetings, you:',
            options: [
              { value: 'E', text: 'Often lead discussions' },
              { value: 'I', text: 'Prefer to observe and contribute when needed' },
            ],
          },
          {
            id: 'q122',
            text: 'Your preferred way to learn is:',
            options: [
              { value: 'E', text: 'Through group discussions' },
              { value: 'I', text: 'Through individual study' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q123',
            text: 'When solving problems, you focus on:',
            options: [
              { value: 'S', text: 'Finding practical solutions' },
              { value: 'N', text: 'Exploring multiple possibilities' },
            ],
          },
          {
            id: 'q124',
            text: 'In discussions, you prefer topics that are:',
            options: [
              { value: 'S', text: 'Grounded in reality' },
              { value: 'N', text: 'Imaginative and speculative' },
            ],
          },
        ],
      },
      {
        category: 'Thinking (T) vs. Feeling (F)',
        questions: [
          {
            id: 'q125',
            text: 'When providing feedback, you emphasize:',
            options: [
              { value: 'T', text: 'Honest and direct communication' },
              { value: 'F', text: 'Supportive and encouraging tone' },
            ],
          },
          {
            id: 'q126',
            text: 'In workplace decisions, you focus on:',
            options: [
              { value: 'T', text: 'Cost-benefit analysis' },
              { value: 'F', text: 'Impact on people' },
            ],
          },
        ],
      },
      {
        category: 'Judging (J) vs. Perceiving (P)',
        questions: [
          {
            id: 'q127',
            text: 'Your approach to projects is:',
            options: [
              { value: 'J', text: 'Following a structured plan' },
              { value: 'P', text: 'Adapting as you go' },
            ],
          },
          {
            id: 'q128',
            text: 'When making decisions, you prefer to:',
            options: [
              { value: 'J', text: 'Settle things quickly' },
              { value: 'P', text: 'Keep options open' },
            ],
          },
        ],
      },
      {
        category: 'Extraversion (E) vs. Introversion (I)',
        questions: [
          {
            id: 'q129',
            text: 'After completing a task, you prefer to:',
            options: [
              { value: 'E', text: 'Share and discuss results' },
              { value: 'I', text: 'Reflect privately on outcomes' },
            ],
          },
          {
            id: 'q130',
            text: 'In social settings, you typically:',
            options: [
              { value: 'E', text: 'Initiate conversations' },
              { value: 'I', text: 'Wait for others to approach' },
            ],
          },
        ],
      },
      {
        category: 'Sensing (S) vs. Intuition (N)',
        questions: [
          {
            id: 'q131',
            text: 'When making plans, you focus on:',
            options: [
              { value: 'S', text: 'Current realities and constraints' },
              { value: 'N', text: 'Future possibilities and potential' },
            ],
          },
          {
            id: 'q132',
            text: 'You are more interested in:',
            options: [
              { value: 'S', text: 'Facts and proven methods' },
              { value: 'N', text: 'Theories and new ideas' },
            ],
          },
        ],
      },
    ],
  },
];

const Assessment = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [personalityType, setPersonalityType] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const handleTestSelection = (testType) => {
    setSelectedTest(testType);
    setQuestions(testType.questions);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculatePersonalityType = () => {
    const traits = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    Object.entries(answers).forEach(([_, value]) => {
      traits[value]++;
    });

    // Calculate percentages for each dichotomy
    const total = {
      EI: traits.E + traits.I,
      SN: traits.S + traits.N,
      TF: traits.T + traits.F,
      JP: traits.J + traits.P
    };

    const percentages = {
      E: (traits.E / total.EI) * 100,
      I: (traits.I / total.EI) * 100,
      S: (traits.S / total.SN) * 100,
      N: (traits.N / total.SN) * 100,
      T: (traits.T / total.TF) * 100,
      F: (traits.F / total.TF) * 100,
      J: (traits.J / total.JP) * 100,
      P: (traits.P / total.JP) * 100
    };

    const type = [
      traits.E > traits.I ? 'E' : 'I',
      traits.S > traits.N ? 'S' : 'N',
      traits.T > traits.F ? 'T' : 'F',
      traits.J > traits.P ? 'J' : 'P'
    ].join('');

    // Create detailed assessment result
    const detailedResult = {
      type,
      percentages,
      answers: Object.entries(answers).map(([questionId, value]) => {
        const category = questions.find(cat => 
          cat.questions.some(q => q.id === questionId)
        );
        const question = category.questions.find(q => q.id === questionId);
        return {
          id: questionId,
          category: category.category,
          question: question.text,
          answer: value,
          selectedOption: question.options.find(opt => opt.value === value).text
        };
      }),
      dominantTraits: {
        attitude: traits.E > traits.I ? 'Extraversion' : 'Introversion',
        perception: traits.S > traits.N ? 'Sensing' : 'Intuition',
        judgment: traits.T > traits.F ? 'Thinking' : 'Feeling',
        lifestyle: traits.J > traits.P ? 'Judging' : 'Perceiving'
      },
      traitStrengths: {
        EI: Math.abs(traits.E - traits.I) / total.EI,
        SN: Math.abs(traits.S - traits.N) / total.SN,
        TF: Math.abs(traits.T - traits.F) / total.TF,
        JP: Math.abs(traits.J - traits.P) / total.JP
      }
    };

    return detailedResult;
  };

  const handleNext = () => {
    if (activeStep === questions.length - 1) {
      const result = calculatePersonalityType();
      console.log('Calculated personality result:', result);
      setPersonalityType(result.type);
      localStorage.setItem('mbtiType', result.type);
      localStorage.setItem('mbtiDetails', JSON.stringify(result));
      console.log('Saved assessment details to localStorage');
      setIsComplete(true);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const calculateProgress = () => {
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.reduce((acc, category) => acc + category.questions.length, 0);
    return (answeredQuestions / totalQuestions) * 100;
  };

  const isStepComplete = () => {
    if (activeStep >= questions.length) return true;
    const currentQuestions = questions[activeStep].questions;
    return currentQuestions.every((q) => answers[q.id]);
  };

  const handleViewInsights = () => {
    if (personalityType) {
      console.log('Navigating to insights with type:', personalityType);
      navigate('/insights');
    }
  };

  const handleOpenChat = (question) => {
    setCurrentQuestion(question);
    setAiMessages([{
      role: 'assistant',
      content: `I'm here to help you understand the question: "${question.text}"\n\nOption A: ${question.options[0].text}\nOption B: ${question.options[1].text}\n\nWhat would you like to know about this question?`
    }]);
    setIsChatOpen(true);
  };

  const handleAskAI = async () => {
    if (!aiInput.trim() || !currentQuestion) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to use the AI helper');
        return;
      }

      setIsLoading(true);
      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await axios.post(`${baseUrl}/api/chat/message`, {
        messages: [
          {
            role: 'system',
            content: `You are a focused MBTI assessment helper specifically helping with this question:

Category: ${currentQuestion.category}
Question: "${currentQuestion.text}"
Option A: ${currentQuestion.options[0].text}
Option B: ${currentQuestion.options[1].text}

Your role is to:
1. Help the user understand this specific question and its options
2. Explain the MBTI concepts relevant to this particular question
3. Provide real-world examples that relate directly to this question
4. Help the user reflect on their own preferences related to this specific scenario

Keep responses focused on this question only. Don't discuss other MBTI topics unless directly related to understanding this question.

If the user seems unsure:
1. Break down the question into simpler terms
2. Explain what each option really means in everyday life
3. Help them reflect on their own experiences related to this specific scenario

Keep responses concise (2-4 sentences) and use simple language.`
          },
          ...aiMessages,
          { role: 'user', content: aiInput }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.choices && response.data.choices[0]) {
        setAiMessages(prev => [
          ...prev,
          { role: 'user', content: aiInput },
          response.data.choices[0].message
        ]);
        setAiInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const renderQuestion = (question) => (
    <Box key={question.id} sx={{ my: 3 }}>
      <Typography gutterBottom>{question.text}</Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={answers[question.id] || ''}
          onChange={(e) => handleAnswer(question.id, e.target.value)}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.text}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Button
        startIcon={<HelpIcon />}
        onClick={() => handleOpenChat(question)}
        variant="text"
        color="secondary"
        sx={{ mt: 1 }}
      >
        Unsure about this question? Ask AI for help
      </Button>
    </Box>
  );

  const renderChatDrawer = () => (
    <Drawer
      anchor="right"
      open={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: '400px',
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">AI Assessment Helper</Typography>
        <IconButton onClick={() => setIsChatOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ 
        p: 2, 
        height: 'calc(100vh - 140px)', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 2
        }}>
          {aiMessages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                }}
              >
                {message.role === 'user' ? <PersonIcon /> : <PsychologyIcon />}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                }}
              >
                <Typography
                  sx={{
                    color: message.role === 'user' ? 'common.white' : 'text.primary',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <PsychologyIcon />
              </Avatar>
              <Paper elevation={1} sx={{ p: 2 }}>
                <CircularProgress size={20} />
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={handleAskAI}
            disabled={!aiInput.trim() || isLoading}
            sx={{ minWidth: 100 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                Send
                <SendIcon sx={{ ml: 1 }} />
              </>
            )}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );

  if (!selectedTest) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            MBTI Personality Assessment
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Choose your preferred assessment length
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {testTypes.map((test) => (
              <Grid item xs={12} key={test.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleTestSelection(test)}
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {test.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {test.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (isComplete) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Assessment Complete!
          </Typography>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Your MBTI Type: {personalityType}
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for completing the {selectedTest.title.toLowerCase()}. Let's explore your personality insights!
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleViewInsights}
              >
                View Your Insights
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => {
                  setSelectedTest(null);
                  setAnswers({});
                  setActiveStep(0);
                  setIsComplete(false);
                }}
              >
                Take Another Test
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          MBTI Personality Assessment
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Answer the following questions honestly to discover your personality type
        </Typography>

        <Box sx={{ my: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
              Question {Object.keys(answers).length} of {questions.reduce((acc, category) => acc + category.questions.length, 0)} Answered
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress()} 
                sx={{ 
                  height: 8,
                  borderRadius: 4,
                  flexGrow: 1,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }} 
              />
              <Typography variant="body2" color="text.secondary">
                {Math.round(calculateProgress())}%
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {questions[activeStep].category}
            </Typography>
            {questions[activeStep].questions.map(renderQuestion)}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepComplete()}
          >
            {activeStep === questions.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Box>
      {renderChatDrawer()}
    </Container>
  );
};

export default Assessment; 