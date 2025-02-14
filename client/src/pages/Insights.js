import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import {
  Work as WorkIcon,
  Favorite as LoveIcon,
  School as LearningIcon,
  EmojiObjects as StrengthIcon,
  Warning as ChallengeIcon,
  Group as RelationshipIcon,
  Chat as ChatIcon,
  Psychology,
  School,
  CheckCircle,
  Lightbulb,
  Work,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const personalityData = {
  INTJ: {
    nickname: 'The Architect',
    description: 'Imaginative and strategic thinkers, with a plan for everything.',
    strengths: [
      'Rational and quick-minded',
      'Independent and decisive',
      'High self-confidence',
      'Open-minded to new ideas',
      'Driven to achieve goals',
    ],
    challenges: [
      'May appear overly analytical',
      'Perfectionist tendencies',
      'Difficulty expressing emotions',
      'Can be overly critical',
      'May struggle with social situations',
    ],
    careerPaths: [
      'Software Engineer',
      'Data Scientist',
      'Strategic Planner',
      'Financial Analyst',
      'Research Scientist',
      'Systems Architect',
      'Investment Banker',
      'Management Consultant',
      'University Professor',
      'Cybersecurity Analyst'
    ],
    relationships: {
      compatibility: ['ENFP', 'ENTP', 'INFP', 'INFJ'],
      advice: [
        'Express appreciation more openly',
        'Practice active listening',
        'Share feelings and emotions',
        'Make time for social connections',
      ],
      details: {
        romantic: 'INTJs seek deep, authentic connections with partners who can match their intellectual curiosity. They value honesty, competence, and the ability to engage in meaningful discussions.',
        friendship: 'In friendships, INTJs prefer quality over quantity. They enjoy deep, one-on-one conversations about complex topics and appreciate friends who respect their need for space.',
        workplace: 'INTJs work best with colleagues who are competent and direct. They appreciate clear communication and logical approaches to problems.',
        family: 'As family members, INTJs show love through actions rather than words. They are dedicated to helping family achieve their goals and maintain high standards.'
      }
    },
    growth: [
      'Develop emotional intelligence',
      'Practice mindfulness',
      'Engage in team activities',
      'Learn to delegate tasks',
      'Balance logic with empathy',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Intuition (Ni)',
        description: 'Focuses on understanding complex patterns and developing long-term visions. INTJs excel at seeing the bigger picture and predicting future outcomes.'
      },
      auxiliary: {
        function: 'Extraverted Thinking (Te)',
        description: 'Implements logical systems and efficient processes. Helps INTJs organize their insights into actionable plans.'
      },
      tertiary: {
        function: 'Introverted Feeling (Fi)',
        description: 'Develops personal values and moral principles. Guides INTJs in making decisions that align with their inner beliefs.'
      },
      inferior: {
        function: 'Extraverted Sensing (Se)',
        description: 'Experiences and responds to immediate physical environment. Can be a source of stress when overloaded with sensory input.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Independent study',
        'Conceptual and theoretical learning',
        'Systems and patterns analysis',
        'Long-term strategic planning',
        'Abstract problem-solving'
      ],
      challenges: [
        'May struggle with rote memorization',
        'Can be impatient with step-by-step instructions',
        'Might overlook important details in favor of big picture',
        'May resist collaborative learning approaches'
      ],
      tips: [
        'Create comprehensive study plans',
        'Focus on understanding underlying principles',
        'Use visual aids for complex concepts',
        'Set clear learning objectives',
        'Take regular breaks for reflection'
      ]
    },
    communicationStyle: {
      strengths: [
        'Direct and honest communication',
        'Ability to explain complex concepts',
        'Strong written communication',
        'Strategic thinking in discussions',
        'Respect for others\' time'
      ],
      challenges: [
        'May come across as too direct or blunt',
        'Can struggle with small talk',
        'Might overlook emotional aspects of communication',
        'May appear distant or aloof'
      ],
      tips: [
        'Practice active listening',
        'Acknowledge others\' emotions',
        'Use more diplomatic language',
        'Engage in occasional small talk',
        'Express appreciation more openly'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Excellent strategic planning',
        'Strong problem-solving abilities',
        'High standards for work quality',
        'Efficient time management',
        'Independent work ethic'
      ],
      challenges: [
        'May struggle with team dynamics',
        'Can be overly perfectionist',
        'Might resist authority without clear competence',
        'May have difficulty delegating tasks'
      ],
      bestEnvironments: [
        'Quiet, focused workspace',
        'Clear organizational structure',
        'Opportunities for independent work',
        'Recognition of expertise',
        'Room for innovation'
      ]
    },
    stressManagement: {
      triggers: [
        'Incompetence in others',
        'Lack of control or structure',
        'Emotional situations',
        'Unexpected changes',
        'Sensory overload'
      ],
      signs: [
        'Becoming more withdrawn',
        'Increased criticism of others',
        'Obsessive focus on details',
        'Difficulty making decisions',
        'Physical tension and fatigue'
      ],
      copingStrategies: [
        'Strategic planning and organization',
        'Regular alone time for recharging',
        'Physical exercise for stress relief',
        'Mindfulness and meditation',
        'Engaging in complex problem-solving'
      ]
    },
    famousPeople: {
      historical: [
        'Nikola Tesla',
        'Isaac Newton',
        'Friedrich Nietzsche',
        'Stephen Hawking'
      ],
      modern: [
        'Elon Musk',
        'Mark Zuckerberg',
        'Christopher Nolan',
        'Michelle Obama'
      ],
      fictional: [
        'Sherlock Holmes',
        'Dr. Manhattan (Watchmen)',
        'Gandalf (Lord of the Rings)',
        'Professor McGonagall (Harry Potter)'
      ]
    }
  },
  INTP: {
    nickname: 'The Logician',
    description: 'Innovative inventors with an unquenchable thirst for knowledge.',
    strengths: [
      'Analytical and logical',
      'Original thinking',
      'Open-minded',
      'Objective',
      'Honest and straightforward',
    ],
    challenges: [
      'Can be insensitive',
      'Prone to self-doubt',
      'Difficulty with practical matters',
      'Perfectionism',
      'Difficulty with social situations',
    ],
    careerPaths: [
      'Computer Programmer',
      'Physicist',
      'Professor',
      'Mathematician',
      'Systems Analyst',
      'Research Scientist',
      'Software Developer',
      'Data Analyst',
      'Philosopher',
      'Game Designer'
    ],
    relationships: {
      compatibility: ['ENTJ', 'ESTJ', 'ENFJ', 'INFJ'],
      advice: [
        'Show appreciation more often',
        'Pay attention to emotional needs',
        'Be more present in the moment',
        'Practice active listening',
      ],
      details: {
        romantic: 'INTPs seek intellectually stimulating relationships with partners who can engage in deep theoretical discussions. They value partners who understand their need for independence and can help them navigate emotional aspects of relationships.',
        friendship: 'In friendships, INTPs are loyal and enjoy sharing ideas and theories. They prefer a small circle of intellectually stimulating friends who appreciate their unique perspective.',
        workplace: 'INTPs thrive in environments where they can work independently on complex problems. They collaborate best with colleagues who respect their need for autonomy and logical approach.',
        family: 'As family members, INTPs show love through sharing knowledge and helping solve problems. They may struggle with emotional expression but are deeply loyal to their loved ones.'
      }
    },
    growth: [
      'Develop emotional awareness',
      'Practice social skills',
      'Learn to handle criticism',
      'Work on practical skills',
      'Balance theory with action',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information to understand underlying principles. INTPs excel at breaking down complex systems and finding logical inconsistencies.'
      },
      auxiliary: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections between ideas. Helps INTPs generate innovative solutions and explore theoretical concepts.'
      },
      tertiary: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. Provides INTPs with a foundation of reliable information and proven methods.'
      },
      inferior: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Considers group harmony and others\' emotions. Can be a source of stress when INTPs need to navigate social situations.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Self-directed study',
        'Theoretical exploration',
        'Logical analysis',
        'Conceptual understanding',
        'Problem-solving challenges'
      ],
      challenges: [
        'May resist structured learning environments',
        'Can get lost in theoretical details',
        'Difficulty with memorization',
        'May struggle with practical applications'
      ],
      tips: [
        'Break complex concepts into logical components',
        'Connect new information to existing knowledge',
        'Allow time for independent exploration',
        'Seek understanding over memorization',
        'Apply theories to real-world problems'
      ]
    },
    communicationStyle: {
      strengths: [
        'Precise and logical expression',
        'Ability to explain complex concepts',
        'Objective analysis',
        'Intellectual curiosity',
        'Honest feedback'
      ],
      challenges: [
        'May appear overly critical',
        'Can be too abstract',
        'Difficulty with emotional expression',
        'May seem detached'
      ],
      tips: [
        'Consider emotional impact of words',
        'Practice more direct communication',
        'Include practical examples',
        'Acknowledge others\' feelings',
        'Balance logic with empathy'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Innovative problem-solving',
        'Deep analytical abilities',
        'Independent work ethic',
        'Objective decision-making',
        'Intellectual curiosity'
      ],
      challenges: [
        'May struggle with deadlines',
        'Can get lost in analysis',
        'Difficulty with routine tasks',
        'May resist traditional structures'
      ],
      bestEnvironments: [
        'Flexible work arrangements',
        'Intellectual freedom',
        'Limited social demands',
        'Complex problem-solving opportunities',
        'Recognition for innovative ideas'
      ]
    },
    stressManagement: {
      triggers: [
        'Emotional confrontations',
        'Rigid structures and rules',
        'Social obligations',
        'Time pressure',
        'Lack of alone time'
      ],
      signs: [
        'Withdrawal from others',
        'Excessive criticism',
        'Analysis paralysis',
        'Neglect of practical needs',
        'Emotional outbursts'
      ],
      copingStrategies: [
        'Logical problem analysis',
        'Time for independent reflection',
        'Engaging in intellectual pursuits',
        'Physical exercise',
        'Structured problem-solving'
      ]
    },
    famousPeople: {
      historical: [
        'Albert Einstein',
        'Charles Darwin',
        'René Descartes',
        'Marie Curie'
      ],
      modern: [
        'Bill Gates',
        'Larry Page',
        'Peter Thiel',
        'Jimmy Wales'
      ],
      fictional: [
        'Bruce Banner (Hulk)',
        'Neo (The Matrix)',
        'L (Death Note)',
        'Dr. Manhattan (Watchmen)'
      ]
    }
  },
  INFJ: {
    nickname: 'The Advocate',
    description: 'Quiet and mystical, yet very inspiring and tireless idealists.',
    strengths: [
      'Deep and creative',
      'Insightful about others',
      'Value deep relationships',
      'Decisive and determined',
      'Altruistic',
    ],
    challenges: [
      'Sensitive to criticism',
      'Complex and private',
      'Perfectionism',
      'Difficulty with conflict',
      'Can burn out easily',
    ],
    careerPaths: [
      'Counselor',
      'Writer',
      'Psychologist',
      'Teacher',
      'Social Worker',
      'Life Coach',
      'HR Development Specialist',
      'Non-profit Director',
      'Healthcare Professional',
      'Religious Worker'
    ],
    relationships: {
      compatibility: ['ENFP', 'ENTP', 'INTJ', 'INFP'],
      advice: [
        'Set clear boundaries',
        'Express needs directly',
        'Make time for self-care',
        'Don\'t take things too personally',
      ],
      details: {
        romantic: 'INFJs seek deep, meaningful connections with partners who share their values and vision. They are looking for authentic, long-lasting relationships where both partners can grow together.',
        friendship: 'In friendships, INFJs are loyal and supportive, often serving as trusted confidants. They prefer deep, one-on-one connections over large social circles.',
        workplace: 'INFJs work best in harmonious environments where they can contribute to meaningful causes. They appreciate colleagues who respect their insights and values.',
        family: 'As family members, INFJs are deeply committed and nurturing. They strive to create harmony and understanding while maintaining their need for personal space.'
      }
    },
    growth: [
      'Practice self-expression',
      'Learn to handle conflict',
      'Set realistic expectations',
      'Develop practical skills',
      'Balance idealism with realism',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Intuition (Ni)',
        description: 'Processes information by identifying patterns and developing insights about the future. INFJs excel at seeing underlying meanings and implications.'
      },
      auxiliary: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Focuses on creating harmony and understanding others\' emotions. Helps INFJs connect with and support others effectively.'
      },
      tertiary: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. Provides INFJs with the ability to think critically and solve problems systematically.'
      },
      inferior: {
        function: 'Extraverted Sensing (Se)',
        description: 'Experiences and interacts with the immediate environment. Can be a source of stress when INFJs need to focus on present details.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Reading and reflection',
        'Creative expression',
        'One-on-one mentoring',
        'Metaphorical thinking',
        'Writing and journaling'
      ],
      challenges: [
        'May get lost in abstract concepts',
        'Can overlook practical details',
        'Difficulty with impersonal information',
        'May resist structured learning'
      ],
      tips: [
        'Connect learning to personal values',
        'Use creative visualization',
        'Find quiet study environments',
        'Link concepts to real-world applications',
        'Take time for personal reflection'
      ]
    },
    communicationStyle: {
      strengths: [
        'Empathetic listening',
        'Insightful feedback',
        'Diplomatic approach',
        'Written expression',
        'Understanding non-verbal cues'
      ],
      challenges: [
        'May avoid necessary confrontation',
        'Can be overly private',
        'Difficulty expressing negative feelings',
        'May be too indirect'
      ],
      tips: [
        'Practice direct communication',
        'Share thoughts and feelings gradually',
        'Set clear boundaries',
        'Balance diplomacy with honesty',
        'Express needs clearly'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Long-term vision',
        'Understanding of people',
        'Creative problem-solving',
        'Strong work ethic',
        'Commitment to growth'
      ],
      challenges: [
        'May take on too much',
        'Perfectionist tendencies',
        'Difficulty with criticism',
        'Can become overwhelmed'
      ],
      bestEnvironments: [
        'Quiet, harmonious workspace',
        'Meaningful work opportunities',
        'Supportive colleagues',
        'Room for creativity',
        'Clear mission and values'
      ]
    },
    stressManagement: {
      triggers: [
        'Conflict and confrontation',
        'Overwhelming sensory input',
        'Violation of values',
        'Too much social interaction',
        'Lack of meaning in work'
      ],
      signs: [
        'Withdrawal from others',
        'Increased sensitivity',
        'Physical exhaustion',
        'Emotional overwhelm',
        'Loss of focus'
      ],
      copingStrategies: [
        'Regular alone time',
        'Creative expression',
        'Nature walks',
        'Journaling',
        'Meditation and mindfulness'
      ]
    },
    famousPeople: {
      historical: [
        'Martin Luther King Jr.',
        'Carl Jung',
        'Mary Wollstonecraft',
        'Plato'
      ],
      modern: [
        'Nelson Mandela',
        'Lady Gaga',
        'Daniel Day-Lewis',
        'Nicole Kidman'
      ],
      fictional: [
        'Aragorn (Lord of the Rings)',
        'Jane Eyre',
        'Jon Snow (Game of Thrones)',
        'Luke Skywalker (Star Wars)'
      ]
    }
  },
  INFP: {
    nickname: 'The Mediator',
    description: 'Poetic, kind and altruistic people, always eager to help a good cause.',
    strengths: [
      'Empathetic and caring',
      'Creative and passionate',
      'Open-minded',
      'Dedicated to values',
      'Seeks harmony',
    ],
    challenges: [
      'Too idealistic',
      'Takes things personally',
      'Difficulty with criticism',
      'Impractical',
      'Self-isolating',
    ],
    careerPaths: [
      'Writer',
      'Artist',
      'Therapist',
      'Social Worker',
      'Teacher',
      'Graphic Designer',
      'Librarian',
      'Music Therapist',
      'Environmental Scientist',
      'Non-profit Worker'
    ],
    relationships: {
      compatibility: ['ENFJ', 'ENTJ', 'INFJ', 'INTJ'],
      advice: [
        'Practice self-care',
        'Set realistic expectations',
        'Learn to accept criticism',
        'Express needs clearly',
      ],
      details: {
        romantic: 'INFPs seek deep, authentic connections with partners who understand and appreciate their values. They are idealistic in love and look for relationships that allow for personal growth and emotional depth.',
        friendship: 'In friendships, INFPs are loyal and supportive, offering emotional understanding and acceptance. They value authentic connections over superficial relationships.',
        workplace: 'INFPs thrive in environments that align with their values and allow for creative expression. They work best with colleagues who respect their authenticity and idealism.',
        family: 'As family members, INFPs are deeply caring and supportive, creating emotional bonds through understanding and acceptance. They strive to help family members reach their potential.'
      }
    },
    growth: [
      'Develop practical skills',
      'Learn to handle conflict',
      'Practice self-assertion',
      'Balance idealism with reality',
      'Work on follow-through',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Feeling (Fi)',
        description: 'Develops strong personal values and makes decisions based on internal moral compass. INFPs excel at understanding and staying true to their authentic selves.'
      },
      auxiliary: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. Helps INFPs generate creative ideas and understand different perspectives.'
      },
      tertiary: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. Provides INFPs with a foundation of personal memories and learned values.'
      },
      inferior: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. Can be a source of stress when INFPs need to focus on efficiency and external organization.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Creative exploration',
        'Personal connection to material',
        'Artistic expression',
        'Independent study',
        'Value-based learning'
      ],
      challenges: [
        'May struggle with structured environments',
        'Difficulty with impersonal material',
        'Can get lost in possibilities',
        'May resist practical applications'
      ],
      tips: [
        'Connect material to personal values',
        'Use creative learning methods',
        'Take breaks for reflection',
        'Find meaning in the subject',
        'Create a comfortable learning space'
      ]
    },
    communicationStyle: {
      strengths: [
        'Authentic expression',
        'Empathetic listening',
        'Non-judgmental approach',
        'Creative communication',
        'Value-based perspective'
      ],
      challenges: [
        'May avoid conflict',
        'Can be too indirect',
        'Difficulty with criticism',
        'May withdraw when overwhelmed'
      ],
      tips: [
        'Practice assertive communication',
        'Express needs clearly',
        'Stay grounded in conversation',
        'Share feelings appropriately',
        'Balance listening and speaking'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Creative problem-solving',
        'Strong personal values',
        'Empathetic approach',
        'Adaptability',
        'Commitment to growth'
      ],
      challenges: [
        'May struggle with deadlines',
        'Difficulty with criticism',
        'Can be too perfectionistic',
        'May avoid conflict'
      ],
      bestEnvironments: [
        'Flexible, creative workspace',
        'Value-aligned organization',
        'Supportive atmosphere',
        'Independence in work',
        'Room for personal expression'
      ]
    },
    stressManagement: {
      triggers: [
        'Conflict with values',
        'Criticism or rejection',
        'Overwhelming responsibilities',
        'Time pressure',
        'Lack of creative outlet'
      ],
      signs: [
        'Withdrawal from others',
        'Emotional sensitivity',
        'Self-doubt',
        'Creative block',
        'Physical exhaustion'
      ],
      copingStrategies: [
        'Creative expression',
        'Time in nature',
        'Journal writing',
        'Meditation',
        'Connecting with supportive friends'
      ]
    },
    famousPeople: {
      historical: [
        'William Shakespeare',
        'Vincent van Gogh',
        'J.R.R. Tolkien',
        'Helen Keller'
      ],
      modern: [
        'Johnny Depp',
        'Björk',
        'Tom Hiddleston',
        'Florence Welch'
      ],
      fictional: [
        'Frodo Baggins (Lord of the Rings)',
        'Luna Lovegood (Harry Potter)',
        'Anne of Green Gables',
        'Fox Mulder (X-Files)'
      ]
    }
  },
  ENFP: {
    nickname: 'The Campaigner',
    description: 'Enthusiastic, creative, and sociable free spirits who can always find a reason to smile.',
    strengths: [
      'Curious and observant',
      'Energetic and enthusiastic',
      'Excellent communicator',
      'Very creative and imaginative',
      'Strong people skills',
    ],
    challenges: [
      'Highly independent',
      'Difficulty focusing',
      'Overthinking',
      'Gets stressed easily',
      'Trouble with routine',
    ],
    careerPaths: [
      'Journalist',
      'Actor/Performer',
      'Counselor',
      'Marketing Specialist',
      'Life Coach',
      'Public Relations Specialist',
      'Event Planner',
      'Creative Director',
      'Motivational Speaker',
      'Human Resources Manager'
    ],
    relationships: {
      compatibility: ['INTJ', 'INFJ', 'ENTJ', 'INFP'],
      advice: [
        'Create structure in your life',
        'Follow through on commitments',
        'Take time for self-reflection',
        'Balance socializing with alone time',
      ],
      details: {
        romantic: 'ENFPs seek passionate, authentic relationships with deep emotional connections. They value partners who can engage their minds while supporting their dreams and accepting their spontaneous nature.',
        friendship: 'In friendships, ENFPs are warm and enthusiastic, bringing energy and creativity to relationships. They enjoy deep conversations and helping friends explore new possibilities.',
        workplace: 'ENFPs thrive in dynamic, creative environments where they can collaborate with others. They work best with colleagues who appreciate their innovative ideas and enthusiasm.',
        family: 'As family members, ENFPs are supportive and encouraging, bringing fun and spontaneity to family life. They help others see new possibilities and pursue their dreams.'
      }
    },
    growth: [
      'Develop focus and discipline',
      'Learn to prioritize tasks',
      'Practice following through',
      'Set realistic goals',
      'Balance enthusiasm with practicality',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. ENFPs excel at generating innovative ideas and spotting patterns in seemingly unrelated concepts.'
      },
      auxiliary: {
        function: 'Introverted Feeling (Fi)',
        description: 'Makes decisions based on personal values and authenticity. Helps ENFPs stay true to themselves while pursuing their many interests.'
      },
      tertiary: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. Provides ENFPs with the ability to turn their creative ideas into practical reality.'
      },
      inferior: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. Can be a source of stress when ENFPs need to focus on details and routine tasks.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Interactive discussions',
        'Creative projects',
        'Group brainstorming',
        'Hands-on experiments',
        'Exploring multiple perspectives'
      ],
      challenges: [
        'May struggle with routine study',
        'Difficulty focusing on details',
        'Can get distracted easily',
        'May resist structured approaches'
      ],
      tips: [
        'Use varied learning methods',
        'Connect topics to interests',
        'Take frequent short breaks',
        'Study with engaging partners',
        'Create colorful study materials'
      ]
    },
    communicationStyle: {
      strengths: [
        'Enthusiastic expression',
        'Creative storytelling',
        'Inspiring others',
        'Building rapport',
        'Reading people well'
      ],
      challenges: [
        'May dominate conversations',
        'Can be overwhelming',
        'Difficulty staying focused',
        'May overlook details'
      ],
      tips: [
        'Practice active listening',
        'Allow others to share',
        'Stay focused on one topic',
        'Be mindful of others\' energy',
        'Balance enthusiasm with clarity'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Creative problem-solving',
        'Inspiring leadership',
        'Team building',
        'Adaptability',
        'Innovation'
      ],
      challenges: [
        'May miss deadlines',
        'Difficulty with routine tasks',
        'Can be disorganized',
        'May start too many projects'
      ],
      bestEnvironments: [
        'Creative and flexible workspace',
        'Collaborative atmosphere',
        'Variety in tasks',
        'Recognition for innovation',
        'Freedom to explore ideas'
      ]
    },
    stressManagement: {
      triggers: [
        'Rigid routines',
        'Criticism of values',
        'Lack of appreciation',
        'Too much alone time',
        'Repetitive tasks'
      ],
      signs: [
        'Becoming withdrawn',
        'Loss of enthusiasm',
        'Increased self-doubt',
        'Physical restlessness',
        'Emotional sensitivity'
      ],
      copingStrategies: [
        'Creative expression',
        'Social connection',
        'Physical activity',
        'New experiences',
        'Talking through feelings'
      ]
    },
    famousPeople: {
      historical: [
        'Mark Twain',
        'Walt Disney',
        'Oscar Wilde',
        'Anne Frank'
      ],
      modern: [
        'Robin Williams',
        'Ellen DeGeneres',
        'Robert Downey Jr.',
        'Jennifer Lawrence'
      ],
      fictional: [
        'Aang (Avatar: The Last Airbender)',
        'Pippin (Lord of the Rings)',
        'The Doctor (Doctor Who)',
        'Michael Scott (The Office)'
      ]
    }
  },
  ENTP: {
    nickname: 'The Debater',
    description: 'Smart and curious thinkers who cannot resist an intellectual challenge.',
    strengths: [
      'Innovative',
      'Quick thinker',
      'Charismatic',
      'Energetic',
      'Knowledge-seeking',
    ],
    challenges: [
      'Argumentative',
      'Dislikes routine',
      'Difficulty with commitment',
      'May neglect details',
      'Can be insensitive',
    ],
    careerPaths: [
      'Entrepreneur',
      'Lawyer',
      'Engineer',
      'Consultant',
      'Creative Director',
      'Software Developer',
      'Political Strategist',
      'Innovation Director',
      'Business Analyst',
      'Research Scientist'
    ],
    relationships: {
      compatibility: ['INFJ', 'INTJ', 'ENFJ', 'ENTJ'],
      advice: [
        'Consider others\' feelings',
        'Follow through on commitments',
        'Practice patience',
        'Balance debate with harmony',
      ],
      details: {
        romantic: 'ENTPs seek intellectually stimulating relationships with partners who can engage in spirited debates and appreciate their innovative ideas. They value mental connection and the freedom to explore possibilities.',
        friendship: 'In friendships, ENTPs are engaging and thought-provoking, always ready to explore new ideas and challenge assumptions. They enjoy intellectual sparring and helping friends see new perspectives.',
        workplace: 'ENTPs thrive in environments that welcome innovation and creative problem-solving. They work best with colleagues who can keep up with their rapid-fire ideas and appreciate their unconventional approaches.',
        family: 'As family members, ENTPs bring excitement and new perspectives, encouraging growth and intellectual development. They may need to work on emotional sensitivity and following through with family commitments.'
      }
    },
    growth: [
      'Develop emotional intelligence',
      'Work on follow-through',
      'Practice diplomacy',
      'Pay attention to details',
      'Learn to compromise',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. ENTPs excel at generating innovative ideas and spotting patterns in complex systems.'
      },
      auxiliary: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. Helps ENTPs develop precise understanding and create coherent theoretical frameworks.'
      },
      tertiary: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Considers group harmony and others\' emotions. Provides ENTPs with the ability to understand and influence social dynamics.'
      },
      inferior: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. Can be a source of stress when ENTPs need to focus on details and maintain routines.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Theoretical discussions',
        'Debate and argumentation',
        'Systems analysis',
        'Problem-solving challenges',
        'Exploring multiple perspectives'
      ],
      challenges: [
        'May resist traditional methods',
        'Difficulty with memorization',
        'Can get distracted by new ideas',
        'May challenge authority'
      ],
      tips: [
        'Connect concepts theoretically',
        'Engage in intellectual discourse',
        'Break down complex systems',
        'Question and analyze',
        'Teach others to reinforce learning'
      ]
    },
    communicationStyle: {
      strengths: [
        'Quick wit and humor',
        'Engaging storytelling',
        'Logical argumentation',
        'Creative expression',
        'Intellectual stimulation'
      ],
      challenges: [
        'May be too confrontational',
        'Can appear arrogant',
        'Might overwhelm others',
        'May dismiss emotions'
      ],
      tips: [
        'Consider emotional impact',
        'Practice active listening',
        'Choose battles wisely',
        'Show appreciation',
        'Balance debate with harmony'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Innovative problem-solving',
        'Strategic thinking',
        'Adaptability',
        'Leadership potential',
        'Crisis management'
      ],
      challenges: [
        'May neglect routine tasks',
        'Difficulty with deadlines',
        'Can be too argumentative',
        'May resist authority'
      ],
      bestEnvironments: [
        'Innovation-focused workplace',
        'Intellectual freedom',
        'Project variety',
        'Recognition for ideas',
        'Minimal routine work'
      ]
    },
    stressManagement: {
      triggers: [
        'Rigid structures',
        'Emotional situations',
        'Routine tasks',
        'Being micromanaged',
        'Lack of intellectual stimulation'
      ],
      signs: [
        'Increased argumentativeness',
        'Withdrawal from others',
        'Focus on minor details',
        'Difficulty making decisions',
        'Physical restlessness'
      ],
      copingStrategies: [
        'Intellectual pursuits',
        'Problem-solving activities',
        'Physical exercise',
        'Creative projects',
        'Discussing ideas with others'
      ]
    },
    famousPeople: {
      historical: [
        'Benjamin Franklin',
        'Leonardo da Vinci',
        'Voltaire',
        'Catherine the Great'
      ],
      modern: [
        'Steve Wozniak',
        'Jon Stewart',
        'Neil deGrasse Tyson',
        'Elizabeth Warren'
      ],
      fictional: [
        'Tony Stark (Iron Man)',
        'The Joker (Batman)',
        'Q (Star Trek)',
        'Rick Sanchez (Rick and Morty)'
      ]
    }
  },
  ENFJ: {
    nickname: 'The Protagonist',
    description: 'Charismatic and inspiring leaders who can mesmerize their listeners.',
    strengths: [
      'Natural leader',
      'Empathetic',
      'Reliable and organized',
      'Strong communicator',
      'Altruistic',
    ],
    challenges: [
      'Overly idealistic',
      'Too selfless',
      'Sensitive to criticism',
      'Struggles with decisions',
      'Difficulty saying no',
    ],
    careerPaths: [
      'Teacher',
      'HR Manager',
      'Life Coach',
      'Non-profit Director',
      'Sales Manager',
      'Corporate Trainer',
      'Public Relations Director',
      'Organizational Development Consultant',
      'Career Counselor',
      'Community Organizer'
    ],
    relationships: {
      compatibility: ['INFP', 'ISFP', 'INTP', 'ISFJ'],
      advice: [
        'Set personal boundaries',
        'Take time for self-care',
        'Learn to accept criticism',
        'Practice self-advocacy',
      ],
      details: {
        romantic: 'ENFJs seek deep, meaningful relationships where they can help their partner grow and develop. They are devoted partners who invest heavily in their relationships and need genuine appreciation in return.',
        friendship: 'In friendships, ENFJs are warm and supportive, often taking on a mentoring role. They create strong bonds through their ability to understand and nurture others\' potential.',
        workplace: 'ENFJs excel in collaborative environments where they can lead and inspire others. They work best with colleagues who appreciate their vision and commitment to growth.',
        family: 'As family members, ENFJs are nurturing and protective, often serving as the emotional backbone. They create harmony and foster personal development within the family unit.'
      }
    },
    growth: [
      'Develop personal boundaries',
      'Learn to say no',
      'Balance helping others',
      'Accept imperfection',
      'Practice self-care',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Focuses on creating harmony and understanding others\' emotions. ENFJs excel at reading people and creating positive group dynamics.'
      },
      auxiliary: {
        function: 'Introverted Intuition (Ni)',
        description: 'Processes information by identifying patterns and implications. Helps ENFJs develop long-term visions and understand people\'s potential.'
      },
      tertiary: {
        function: 'Extraverted Sensing (Se)',
        description: 'Experiences and responds to immediate physical environment. Provides ENFJs with awareness of others\' immediate needs and reactions.'
      },
      inferior: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. Can be a source of stress when ENFJs need to make impersonal decisions.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Group discussions',
        'Teaching others',
        'Collaborative projects',
        'Personal growth workshops',
        'Interactive learning'
      ],
      challenges: [
        'May focus too much on others\' needs',
        'Can neglect own learning needs',
        'Difficulty with impersonal material',
        'May avoid critical analysis'
      ],
      tips: [
        'Balance helping others with self-development',
        'Set aside dedicated study time',
        'Connect material to human impact',
        'Practice objective analysis',
        'Use teaching to reinforce learning'
      ]
    },
    communicationStyle: {
      strengths: [
        'Charismatic speaking',
        'Emotional intelligence',
        'Conflict resolution',
        'Inspirational leadership',
        'Active listening'
      ],
      challenges: [
        'May avoid necessary confrontation',
        'Can be too diplomatic',
        'Difficulty expressing negative feedback',
        'May take criticism personally'
      ],
      tips: [
        'Practice direct communication',
        'Balance diplomacy with honesty',
        'Set clear boundaries',
        'Express own needs clearly',
        'Accept constructive criticism'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Team building',
        'Motivational leadership',
        'Organization skills',
        'Project coordination',
        'People development'
      ],
      challenges: [
        'May take on too much',
        'Difficulty delegating',
        'Can neglect own needs',
        'Struggles with tough decisions'
      ],
      bestEnvironments: [
        'Collaborative workspace',
        'People-focused organization',
        'Clear mission and values',
        'Opportunities for growth',
        'Supportive culture'
      ]
    },
    stressManagement: {
      triggers: [
        'Conflict and discord',
        'Lack of appreciation',
        'Overwhelming responsibilities',
        'Criticism of values',
        'Isolation from others'
      ],
      signs: [
        'Becoming withdrawn',
        'Increased sensitivity',
        'Physical exhaustion',
        'Difficulty making decisions',
        'Emotional overwhelm'
      ],
      copingStrategies: [
        'Setting boundaries',
        'Regular self-care',
        'Seeking support',
        'Physical exercise',
        'Meditation and reflection'
      ]
    },
    famousPeople: {
      historical: [
        'Abraham Lincoln',
        'Martin Luther King Jr.',
        'Johann Wolfgang von Goethe',
        'Margaret Mead'
      ],
      modern: [
        'Barack Obama',
        'Oprah Winfrey',
        'Morgan Freeman',
        'Emma Watson'
      ],
      fictional: [
        'Jean-Luc Picard (Star Trek)',
        'Dumbledore (Harry Potter)',
        'Elizabeth Bennet (Pride and Prejudice)',
        'Will Turner (Pirates of the Caribbean)'
      ]
    }
  },
  ENTJ: {
    nickname: 'The Commander',
    description: 'Bold, imaginative and strong-willed leaders, always finding a way – or making one.',
    strengths: [
      'Natural leader',
      'Strategic thinker',
      'Confident and assertive',
      'Efficient',
      'Charismatic',
    ],
    challenges: [
      'Can be overly dominant',
      'Impatient',
      'Arrogant',
      'Intolerant',
      'Cold and ruthless',
    ],
    careerPaths: [
      'Executive Officer',
      'Management Consultant',
      'Entrepreneur',
      'Business Administrator',
      'Project Manager',
      'Corporate Strategist',
      'Investment Banker',
      'Business Development Director',
      'Political Consultant',
      'Technology Executive'
    ],
    relationships: {
      compatibility: ['INTP', 'INFP', 'ENTP', 'INFJ'],
      advice: [
        'Practice patience',
        'Show empathy',
        'Listen to others',
        'Balance work and relationships',
      ],
      details: {
        romantic: 'ENTJs seek partners who can match their intellect and ambition while providing emotional depth. They value competence and growth in relationships, though they may need to work on emotional expression.',
        friendship: 'In friendships, ENTJs are loyal and stimulating, often pushing friends toward their goals. They value intellectual discourse and appreciate friends who can challenge their thinking.',
        workplace: 'ENTJs thrive in leadership positions where they can implement their vision. They work best with competent colleagues who can keep up with their pace and meet their high standards.',
        family: 'As family members, ENTJs are protective and dedicated to helping family achieve success. They may need to balance their natural directiveness with sensitivity to others\' emotional needs.'
      }
    },
    growth: [
      'Develop emotional intelligence',
      'Practice patience',
      'Learn to delegate',
      'Show appreciation',
      'Balance logic with empathy',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. ENTJs excel at creating efficient processes and making objective decisions.'
      },
      auxiliary: {
        function: 'Introverted Intuition (Ni)',
        description: 'Processes information by identifying patterns and implications. Helps ENTJs develop long-term visions and strategic plans.'
      },
      tertiary: {
        function: 'Extraverted Sensing (Se)',
        description: 'Experiences and responds to immediate environment. Provides ENTJs with awareness of immediate opportunities and tactical advantages.'
      },
      inferior: {
        function: 'Introverted Feeling (Fi)',
        description: 'Develops personal values and moral principles. Can be a source of stress when ENTJs need to process emotional experiences.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Strategic analysis',
        'Systematic study',
        'Practical applications',
        'Leadership experiences',
        'Competitive challenges'
      ],
      challenges: [
        'May be too focused on efficiency',
        'Can be impatient with slower learners',
        'Might overlook details',
        'May resist emotional topics'
      ],
      tips: [
        'Balance efficiency with thoroughness',
        'Practice patience with others',
        'Consider multiple perspectives',
        'Engage with emotional aspects',
        'Value the learning process'
      ]
    },
    communicationStyle: {
      strengths: [
        'Direct and clear',
        'Strategic thinking',
        'Persuasive speaking',
        'Confident presentation',
        'Goal-oriented discussion'
      ],
      challenges: [
        'May be too blunt',
        'Can be intimidating',
        'Might dismiss emotions',
        'May dominate conversations'
      ],
      tips: [
        'Practice active listening',
        'Show empathy',
        'Consider emotional impact',
        'Allow for other viewpoints',
        'Balance directness with diplomacy'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Strategic planning',
        'Decision making',
        'Project management',
        'Leadership ability',
        'Efficiency focus'
      ],
      challenges: [
        'May be too controlling',
        'Can be overly critical',
        'Might overwork others',
        'May neglect team morale'
      ],
      bestEnvironments: [
        'Results-driven organization',
        'Leadership opportunities',
        'Strategic roles',
        'Competitive atmosphere',
        'Innovation-focused culture'
      ]
    },
    stressManagement: {
      triggers: [
        'Incompetence in others',
        'Lack of control',
        'Inefficiency',
        'Emotional situations',
        'Lack of progress'
      ],
      signs: [
        'Becoming more controlling',
        'Increased criticism',
        'Emotional outbursts',
        'Physical tension',
        'Difficulty relaxing'
      ],
      copingStrategies: [
        'Strategic planning',
        'Physical exercise',
        'Delegation practice',
        'Mindfulness exercises',
        'Time management'
      ]
    },
    famousPeople: {
      historical: [
        'Napoleon Bonaparte',
        'Margaret Thatcher',
        'Julius Caesar',
        'Carl Sagan'
      ],
      modern: [
        'Steve Jobs',
        'Gordon Ramsay',
        'Whoopi Goldberg',
        'Jack Welch'
      ],
      fictional: [
        'Doctor Strange (Marvel)',
        'Miranda Priestly (The Devil Wears Prada)',
        'Tywin Lannister (Game of Thrones)',
        'Professor McGonagall (Harry Potter)'
      ]
    }
  },
  ISTJ: {
    nickname: 'The Inspector',
    description: 'Practical and fact-minded individuals, whose reliability cannot be doubted.',
    strengths: [
      'Honest and direct',
      'Strong sense of duty',
      'Very responsible',
      'Calm and practical',
      'Create and enforce order',
    ],
    challenges: [
      'Stubborn',
      'Insensitive',
      'Always by the book',
      'Judgmental',
      'Resistant to change',
    ],
    careerPaths: [
      'Accountant',
      'Military Officer',
      'Judge',
      'Financial Manager',
      'Police Officer',
      'Business Administrator',
      'Quality Assurance Manager',
      'Operations Manager',
      'Compliance Officer',
      'Database Administrator'
    ],
    relationships: {
      compatibility: ['ESFP', 'ESTP', 'ISFP', 'ISTP'],
      advice: [
        'Express emotions more openly',
        'Be more flexible with changes',
        'Show appreciation regularly',
        'Consider others\' feelings',
      ],
      details: {
        romantic: 'ISTJs are loyal and committed partners who value stability and tradition in relationships. They show love through reliability and practical support rather than emotional expression.',
        friendship: 'In friendships, ISTJs are dependable and consistent, preferring a small circle of long-term friends. They value honest, straightforward interactions and practical shared activities.',
        workplace: 'ISTJs excel in structured environments where rules and procedures are clear. They work best with colleagues who respect deadlines and maintain high standards.',
        family: 'As family members, ISTJs are responsible and dedicated, creating stable and organized home environments. They uphold family traditions and ensure security for their loved ones.'
      }
    },
    growth: [
      'Develop emotional awareness',
      'Be more open to change',
      'Practice flexibility',
      'Consider alternative viewpoints',
      'Balance work and relaxation',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. ISTJs excel at maintaining traditions and applying proven methods to solve problems.'
      },
      auxiliary: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. Helps ISTJs create efficient processes and make objective decisions.'
      },
      tertiary: {
        function: 'Introverted Feeling (Fi)',
        description: 'Develops personal values and moral principles. Provides ISTJs with a strong sense of right and wrong.'
      },
      inferior: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. Can be a source of stress when ISTJs need to deal with abstract concepts or change.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Structured learning',
        'Practical exercises',
        'Step-by-step instructions',
        'Hands-on experience',
        'Clear objectives'
      ],
      challenges: [
        'May struggle with abstract concepts',
        'Resistance to new methods',
        'Difficulty with ambiguity',
        'May need excessive detail'
      ],
      tips: [
        'Break down complex concepts',
        'Connect new ideas to past experience',
        'Maintain organized notes',
        'Follow established procedures',
        'Practice practical applications'
      ]
    },
    communicationStyle: {
      strengths: [
        'Clear and direct',
        'Honest feedback',
        'Reliable information',
        'Organized presentation',
        'Attention to detail'
      ],
      challenges: [
        'May appear too blunt',
        'Can seem inflexible',
        'Difficulty with small talk',
        'May miss emotional cues'
      ],
      tips: [
        'Consider others\' feelings',
        'Practice active listening',
        'Show appreciation',
        'Be open to new ideas',
        'Balance facts with emotions'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Organized and systematic',
        'Reliable and responsible',
        'Detail-oriented',
        'Practical problem-solving',
        'Strong work ethic'
      ],
      challenges: [
        'May resist change',
        'Can be inflexible',
        'Might miss innovations',
        'May overwork themselves'
      ],
      bestEnvironments: [
        'Structured organization',
        'Clear expectations',
        'Stable work environment',
        'Traditional methods',
        'Respect for procedures'
      ]
    },
    stressManagement: {
      triggers: [
        'Sudden changes',
        'Unclear expectations',
        'Disorganization',
        'Time pressure',
        'Rule violations'
      ],
      signs: [
        'Becoming rigid',
        'Increased criticism',
        'Withdrawal from others',
        'Physical tension',
        'Difficulty sleeping'
      ],
      copingStrategies: [
        'Following routines',
        'Organizing environment',
        'Physical exercise',
        'Time management',
        'Practical problem-solving'
      ]
    },
    famousPeople: {
      historical: [
        'George Washington',
        'Queen Victoria',
        'Thomas Edison',
        'J.D. Rockefeller'
      ],
      modern: [
        'Jeff Bezos',
        'Angela Merkel',
        'Natalie Portman',
        'Robert De Niro'
      ],
      fictional: [
        'Ned Stark (Game of Thrones)',
        'Agent Smith (The Matrix)',
        'Mr. Darcy (Pride and Prejudice)',
        'George Bailey (It\'s a Wonderful Life)'
      ]
    }
  },
  ISFJ: {
    nickname: 'The Defender',
    description: 'Very dedicated and warm protectors, always ready to defend their loved ones.',
    strengths: [
      'Supportive and reliable',
      'Patient and devoted',
      'Observant',
      'Hardworking',
      'Good practical skills',
    ],
    challenges: [
      'Takes things too personally',
      'Overcommits self',
      'Reluctant to change',
      'Avoids conflict',
      'Represses feelings',
    ],
    careerPaths: [
      'Nurse',
      'Elementary Teacher',
      'Social Worker',
      'HR Specialist',
      'Librarian',
      'Dental Hygienist',
      'Medical Assistant',
      'Office Manager',
      'Veterinary Technician',
      'Counselor'
    ],
    relationships: {
      compatibility: ['ESFP', 'ESTP', 'ENFJ', 'ESFJ'],
      advice: [
        'Express personal needs',
        'Set healthy boundaries',
        'Take time for self-care',
        'Share feelings openly',
      ],
      details: {
        romantic: 'ISFJs are devoted and nurturing partners who create warm, stable relationships. They show love through practical care and attention to their partner\'s needs and comfort.',
        friendship: 'In friendships, ISFJs are loyal and supportive, remembering important details about their friends\' lives. They maintain long-term friendships through consistent care and reliability.',
        workplace: 'ISFJs thrive in cooperative environments where they can help others. They work best with colleagues who appreciate their dedication and attention to detail.',
        family: 'As family members, ISFJs are the nurturing backbone, creating comfortable homes and maintaining family traditions. They often put family needs before their own.'
      }
    },
    growth: [
      'Assert personal needs',
      'Accept change positively',
      'Develop self-confidence',
      'Learn to say no',
      'Express feelings openly',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. ISFJs excel at maintaining traditions and creating stability through proven methods.'
      },
      auxiliary: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Focuses on creating harmony and meeting others\' needs. Helps ISFJs understand and respond to others\' emotional needs.'
      },
      tertiary: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. Provides ISFJs with the ability to make rational decisions when needed.'
      },
      inferior: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. Can be a source of stress when ISFJs need to deal with uncertain futures.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Hands-on practice',
        'Step-by-step instruction',
        'Practical applications',
        'Organized study plans',
        'Real-world examples'
      ],
      challenges: [
        'May resist theoretical concepts',
        'Difficulty with abstract ideas',
        'Can be too detail-focused',
        'May need excessive preparation'
      ],
      tips: [
        'Connect theory to practice',
        'Use organized study methods',
        'Take detailed notes',
        'Learn through experience',
        'Review regularly'
      ]
    },
    communicationStyle: {
      strengths: [
        'Attentive listening',
        'Thoughtful responses',
        'Diplomatic approach',
        'Remembers details',
        'Shows genuine care'
      ],
      challenges: [
        'May avoid confrontation',
        'Can be too indirect',
        'Difficulty expressing needs',
        'May suppress opinions'
      ],
      tips: [
        'Practice assertiveness',
        'Express needs clearly',
        'Share opinions more',
        'Address conflicts directly',
        'Trust your insights'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Detail-oriented',
        'Reliable and consistent',
        'Supportive team member',
        'Strong work ethic',
        'Excellent organization'
      ],
      challenges: [
        'May overwork themselves',
        'Difficulty with change',
        'Can be too perfectionist',
        'May avoid leadership'
      ],
      bestEnvironments: [
        'Stable, structured workplace',
        'Supportive atmosphere',
        'Clear expectations',
        'Recognition for reliability',
        'Opportunity to help others'
      ]
    },
    stressManagement: {
      triggers: [
        'Conflict situations',
        'Sudden changes',
        'Criticism',
        'Overwhelming responsibilities',
        'Uncertain situations'
      ],
      signs: [
        'Becoming withdrawn',
        'Increased worry',
        'Physical exhaustion',
        'Emotional sensitivity',
        'Difficulty sleeping'
      ],
      copingStrategies: [
        'Maintaining routines',
        'Seeking quiet time',
        'Talking with trusted friends',
        'Engaging in familiar activities',
        'Practicing self-care'
      ]
    },
    famousPeople: {
      historical: [
        'Mother Teresa',
        'George VI',
        'Clara Barton',
        'Christopher Columbus'
      ],
      modern: [
        'Kate Middleton',
        'Rosa Parks',
        'Jimmy Carter',
        'Dr. Fauci'
      ],
      fictional: [
        'Dr. Watson (Sherlock Holmes)',
        'Captain America',
        'Samwise Gamgee (Lord of the Rings)',
        'Beth March (Little Women)'
      ]
    }
  },
  ISTP: {
    nickname: 'The Virtuoso',
    description: 'Bold and practical experimenters, masters of all kinds of tools.',
    strengths: [
      'Optimistic and energetic',
      'Creative and practical',
      'Spontaneous and rational',
      'Independent',
      'Great in a crisis',
    ],
    challenges: [
      'Stubborn',
      'Private and reserved',
      'Easily bored',
      'Dislikes commitment',
      'Risk-prone',
    ],
    careerPaths: [
      'Mechanic',
      'Engineer',
      'Pilot',
      'Forensic Scientist',
      'Carpenter',
      'Systems Analyst',
      'Emergency Response',
      'Athletic Trainer',
      'Software Developer',
      'Detective'
    ],
    relationships: {
      compatibility: ['ESTJ', 'ENTJ', 'ESFJ', 'ENFJ'],
      advice: [
        'Express emotions more openly',
        'Maintain regular communication',
        'Show appreciation verbally',
        'Make time for relationships',
      ],
      details: {
        romantic: 'ISTPs seek relationships that allow for independence and spontaneity. They show affection through actions rather than words and need partners who understand their need for personal space.',
        friendship: 'In friendships, ISTPs are laid-back and fun, enjoying shared activities and practical problem-solving. They prefer low-maintenance friendships that don\'t demand constant emotional expression.',
        workplace: 'ISTPs thrive in environments that allow for hands-on work and independent problem-solving. They work best with colleagues who respect their autonomy and practical approach.',
        family: 'As family members, ISTPs are protective and helpful in practical ways. They may struggle with emotional expression but show love through actions and fixing things.'
      }
    },
    growth: [
      'Develop emotional awareness',
      'Practice long-term planning',
      'Build relationship skills',
      'Consider others\' feelings',
      'Follow through on commitments',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. ISTPs excel at understanding how things work and solving practical problems.'
      },
      auxiliary: {
        function: 'Extraverted Sensing (Se)',
        description: 'Experiences and responds to immediate physical environment. Helps ISTPs excel at hands-on activities and quick reactions.'
      },
      tertiary: {
        function: 'Introverted Intuition (Ni)',
        description: 'Perceives underlying patterns and implications. Provides ISTPs with occasional insights into future possibilities.'
      },
      inferior: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Considers group harmony and others\' emotions. Can be a source of stress when ISTPs need to navigate social situations.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Hands-on experience',
        'Practical experiments',
        'Trial and error',
        'Real-world applications',
        'Physical demonstrations'
      ],
      challenges: [
        'May resist theoretical learning',
        'Difficulty with abstract concepts',
        'Can be impatient',
        'May skip instructions'
      ],
      tips: [
        'Connect theory to practice',
        'Learn through doing',
        'Take breaks for physical activity',
        'Focus on practical applications',
        'Use visual and tactile aids'
      ]
    },
    communicationStyle: {
      strengths: [
        'Direct and honest',
        'Practical solutions',
        'Good in emergencies',
        'Calm under pressure',
        'Efficient expression'
      ],
      challenges: [
        'May seem too blunt',
        'Difficulty with emotional topics',
        'Can be too private',
        'May appear detached'
      ],
      tips: [
        'Practice emotional expression',
        'Share thoughts more often',
        'Consider others\' feelings',
        'Maintain regular communication',
        'Express appreciation verbally'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Problem-solving skills',
        'Technical expertise',
        'Crisis management',
        'Adaptability',
        'Practical efficiency'
      ],
      challenges: [
        'May resist structure',
        'Can be too independent',
        'Might ignore rules',
        'May avoid planning'
      ],
      bestEnvironments: [
        'Hands-on work',
        'Freedom to problem-solve',
        'Flexible structure',
        'Technical focus',
        'Crisis response opportunities'
      ]
    },
    stressManagement: {
      triggers: [
        'Emotional situations',
        'Rigid structure',
        'Long-term commitments',
        'Micromanagement',
        'Lack of independence'
      ],
      signs: [
        'Becoming withdrawn',
        'Increased risk-taking',
        'Emotional outbursts',
        'Physical restlessness',
        'Avoiding responsibilities'
      ],
      copingStrategies: [
        'Physical activity',
        'Working with hands',
        'Problem-solving activities',
        'Taking space alone',
        'Engaging in hobbies'
      ]
    },
    famousPeople: {
      historical: [
        'Amelia Earhart',
        'Miles Davis',
        'Miyamoto Musashi',
        'Ernest Hemingway'
      ],
      modern: [
        'Bruce Lee',
        'Tom Cruise',
        'Clint Eastwood',
        'Scarlett Johansson'
      ],
      fictional: [
        'Indiana Jones',
        'John Wick',
        'Jason Bourne',
        'Han Solo (Star Wars)'
      ]
    }
  },
  ISFP: {
    nickname: 'The Adventurer',
    description: 'Flexible and charming artists, always ready to explore and experience something new.',
    strengths: [
      'Artistic and creative',
      'Very perceptive',
      'Passionate and enthusiastic',
      'Curious and observant',
      'Charming and sensitive',
    ],
    challenges: [
      'Fiercely independent',
      'Unpredictable',
      'Easily stressed',
      'Overly competitive',
      'Difficulty with planning',
    ],
    careerPaths: [
      'Artist',
      'Designer',
      'Musician',
      'Chef',
      'Photographer',
      'Fashion Designer',
      'Interior Designer',
      'Veterinarian',
      'Physical Therapist',
      'Landscape Architect'
    ],
    relationships: {
      compatibility: ['ENFJ', 'ESFJ', 'ESTJ', 'ENTJ'],
      advice: [
        'Express feelings more directly',
        'Practice long-term planning',
        'Communicate needs clearly',
        'Balance independence with connection',
      ],
      details: {
        romantic: 'ISFPs seek authentic, deep connections with partners who appreciate their creativity and independence. They show love through actions and artistic expression rather than words.',
        friendship: 'In friendships, ISFPs are fun-loving and supportive, enjoying shared experiences and creative activities. They value genuine connections and respect for individual expression.',
        workplace: 'ISFPs thrive in environments that allow for creativity and personal expression. They work best with colleagues who appreciate their unique perspective and give them space to work independently.',
        family: 'As family members, ISFPs are caring and spontaneous, bringing joy through their creativity. They need personal space but show love through thoughtful actions and artistic gestures.'
      }
    },
    growth: [
      'Develop planning skills',
      'Practice verbal expression',
      'Build self-confidence',
      'Accept constructive criticism',
      'Balance spontaneity with structure',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Introverted Feeling (Fi)',
        description: 'Makes decisions based on personal values and authenticity. ISFPs excel at understanding their own emotions and staying true to their beliefs.'
      },
      auxiliary: {
        function: 'Extraverted Sensing (Se)',
        description: 'Experiences and responds to immediate physical environment. Helps ISFPs live in the moment and express themselves creatively.'
      },
      tertiary: {
        function: 'Introverted Intuition (Ni)',
        description: 'Perceives underlying patterns and implications. Provides ISFPs with occasional insights into future possibilities.'
      },
      inferior: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. Can be a source of stress when ISFPs need to focus on planning and organization.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Hands-on experience',
        'Artistic expression',
        'Visual learning',
        'Personal exploration',
        'Creative projects'
      ],
      challenges: [
        'May struggle with abstract theory',
        'Difficulty with rigid structure',
        'Can be easily distracted',
        'May avoid planning'
      ],
      tips: [
        'Use visual aids',
        'Incorporate creativity',
        'Take frequent breaks',
        'Connect learning to values',
        'Learn through experience'
      ]
    },
    communicationStyle: {
      strengths: [
        'Authentic expression',
        'Sensitive to others',
        'Non-judgmental approach',
        'Creative communication',
        'Actions over words'
      ],
      challenges: [
        'May avoid conflict',
        'Can be too private',
        'Difficulty expressing feelings',
        'May withdraw when stressed'
      ],
      tips: [
        'Practice verbal expression',
        'Share feelings gradually',
        'Stay present in conversations',
        'Express needs clearly',
        'Use creative expression'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Creative problem-solving',
        'Attention to aesthetics',
        'Adaptability',
        'Practical skills',
        'Harmonious approach'
      ],
      challenges: [
        'May resist planning',
        'Can be too independent',
        'Difficulty with deadlines',
        'May avoid leadership'
      ],
      bestEnvironments: [
        'Creative freedom',
        'Flexible structure',
        'Aesthetic appeal',
        'Personal space',
        'Supportive atmosphere'
      ]
    },
    stressManagement: {
      triggers: [
        'Rigid structure',
        'Criticism of values',
        'Overwhelming commitments',
        'Conflict situations',
        'Lack of creative outlet'
      ],
      signs: [
        'Becoming withdrawn',
        'Increased sensitivity',
        'Creative block',
        'Physical tension',
        'Emotional outbursts'
      ],
      copingStrategies: [
        'Artistic expression',
        'Time in nature',
        'Physical activity',
        'Solitary activities',
        'Sensory experiences'
      ]
    },
    famousPeople: {
      historical: [
        'Mozart',
        'Frida Kahlo',
        'David Bowie',
        'Bob Dylan'
      ],
      modern: [
        'Lana Del Rey',
        'Michael Jackson',
        'Steven Spielberg',
        'Britney Spears'
      ],
      fictional: [
        'Arya Stark (Game of Thrones)',
        'Mabel Pines (Gravity Falls)',
        'Peter Parker (Spider-Man)',
        'Howl (Howl\'s Moving Castle)'
      ]
    }
  },
  ESTP: {
    nickname: 'The Entrepreneur',
    description: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge.',
    strengths: [
      'Bold and direct',
      'Rational and practical',
      'Original and perceptive',
      'Sociable and playful',
      'Action-oriented',
    ],
    challenges: [
      'Impatient',
      'Risk-prone',
      'Unstructured',
      'May miss long-term implications',
      'Insensitive',
    ],
    careerPaths: [
      'Entrepreneur',
      'Sales Representative',
      'Police Officer',
      'Athletic Coach',
      'Paramedic',
      'Stock Broker',
      'Real Estate Agent',
      'Construction Manager',
      'Professional Athlete',
      'Emergency Response'
    ],
    relationships: {
      compatibility: ['ISFJ', 'ISTJ', 'ESFJ', 'ESTJ'],
      advice: [
        'Consider long-term consequences',
        'Show more emotional sensitivity',
        'Practice commitment',
        'Listen more actively',
      ],
      details: {
        romantic: 'ESTPs seek exciting and dynamic relationships with partners who can keep up with their energy. They show love through action and shared experiences rather than emotional expression.',
        friendship: 'In friendships, ESTPs are fun-loving and adventurous, always ready for action. They value friends who are up for spontaneous activities and can handle their direct communication style.',
        workplace: 'ESTPs thrive in fast-paced environments where they can solve immediate problems. They work best with colleagues who appreciate their practical approach and can match their energy.',
        family: 'As family members, ESTPs bring excitement and spontaneity to the household. They show love through activities and practical support rather than emotional discussions.'
      }
    },
    growth: [
      'Develop emotional awareness',
      'Consider long-term impacts',
      'Practice patience',
      'Build stable relationships',
      'Follow through on commitments',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Sensing (Se)',
        description: 'Lives in the moment and processes immediate experiences. ESTPs excel at responding to immediate challenges and opportunities.'
      },
      auxiliary: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. Helps ESTPs make quick, rational decisions based on available data.'
      },
      tertiary: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Considers group harmony and others\' emotions. Provides ESTPs with awareness of social dynamics and others\' needs.'
      },
      inferior: {
        function: 'Introverted Intuition (Ni)',
        description: 'Perceives underlying patterns and implications. Can be a source of stress when ESTPs need to focus on long-term planning.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Hands-on experience',
        'Real-world application',
        'Active experimentation',
        'Physical engagement',
        'Immediate feedback'
      ],
      challenges: [
        'May resist theoretical learning',
        'Difficulty with abstract concepts',
        'Can be impatient',
        'May skip important details'
      ],
      tips: [
        'Connect theory to practice',
        'Learn through action',
        'Take frequent breaks',
        'Use real-world examples',
        'Engage in group activities'
      ]
    },
    communicationStyle: {
      strengths: [
        'Direct and honest',
        'Quick-witted',
        'Engaging storyteller',
        'Action-oriented',
        'Adaptable'
      ],
      challenges: [
        'May be too blunt',
        'Can be insensitive',
        'Might dominate conversations',
        'May rush to conclusions'
      ],
      tips: [
        'Practice active listening',
        'Consider emotional impact',
        'Allow others to share',
        'Think before speaking',
        'Show patience in discussions'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Crisis management',
        'Practical problem-solving',
        'Quick decision making',
        'Adaptability',
        'Results-oriented'
      ],
      challenges: [
        'May rush decisions',
        'Difficulty with routine',
        'Can be impulsive',
        'May ignore procedures'
      ],
      bestEnvironments: [
        'Fast-paced workplace',
        'Variety in tasks',
        'Immediate challenges',
        'Freedom to act',
        'Practical focus'
      ]
    },
    stressManagement: {
      triggers: [
        'Lack of action',
        'Rigid structure',
        'Abstract concepts',
        'Long-term planning',
        'Emotional situations'
      ],
      signs: [
        'Increased impulsivity',
        'Physical restlessness',
        'Difficulty focusing',
        'Emotional outbursts',
        'Risk-taking behavior'
      ],
      copingStrategies: [
        'Physical exercise',
        'Practical activities',
        'Social interaction',
        'Problem-solving tasks',
        'Outdoor adventures'
      ]
    },
    famousPeople: {
      historical: [
        'Theodore Roosevelt',
        'Ernest Hemingway',
        'Mae West',
        'George S. Patton'
      ],
      modern: [
        'Donald Trump',
        'Madonna',
        'Bruce Willis',
        'Eddie Murphy'
      ],
      fictional: [
        'James Bond',
        'Tony Stark (Iron Man)',
        'Jack Bauer (24)',
        'Sonic the Hedgehog'
      ]
    }
  },
  ESFP: {
    nickname: 'The Entertainer',
    description: 'Spontaneous, energetic and enthusiastic people – life is never boring around them.',
    strengths: [
      'Bold and original',
      'Excellent people skills',
      'Practical and observant',
      'Excellent communicator',
      'Aesthetically aware',
    ],
    challenges: [
      'Easily bored',
      'Unfocused',
      'Poor long-term planning',
      'Conflict-averse',
      'Sensitive to criticism',
    ],
    careerPaths: [
      'Actor/Performer',
      'Event Planner',
      'Sales Representative',
      'Flight Attendant',
      'Tour Guide',
      'Personal Trainer',
      'Hairstylist',
      'Restaurant Manager',
      'Public Relations Specialist',
      'Elementary Teacher'
    ],
    relationships: {
      compatibility: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
      advice: [
        'Develop long-term perspective',
        'Practice following through',
        'Consider consequences',
        'Balance fun with responsibility',
      ],
      details: {
        romantic: 'ESFPs seek fun and exciting relationships with partners who can share their enthusiasm for life. They show love through physical affection and creating enjoyable experiences together.',
        friendship: 'In friendships, ESFPs are entertaining and supportive, always ready for fun and adventure. They value friends who can match their energy and appreciate their spontaneous nature.',
        workplace: 'ESFPs thrive in dynamic environments where they can interact with others. They work best with colleagues who appreciate their enthusiasm and can help with organization.',
        family: 'As family members, ESFPs bring joy and excitement to the home. They create fun experiences and show love through physical affection and practical care.'
      }
    },
    growth: [
      'Develop planning skills',
      'Practice follow-through',
      'Consider future implications',
      'Build self-discipline',
      'Learn to handle criticism',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Sensing (Se)',
        description: 'Lives in the moment and processes immediate experiences. ESFPs excel at noticing details and responding to immediate opportunities.'
      },
      auxiliary: {
        function: 'Introverted Feeling (Fi)',
        description: 'Makes decisions based on personal values. Helps ESFPs stay true to themselves and understand their own emotions.'
      },
      tertiary: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. Provides ESFPs with the ability to organize resources and make practical decisions.'
      },
      inferior: {
        function: 'Introverted Intuition (Ni)',
        description: 'Perceives underlying patterns and implications. Can be a source of stress when ESFPs need to focus on future planning.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Interactive learning',
        'Group activities',
        'Hands-on experience',
        'Visual demonstrations',
        'Role-playing'
      ],
      challenges: [
        'May struggle with abstract concepts',
        'Difficulty focusing on theory',
        'Can be easily distracted',
        'May avoid complex reading'
      ],
      tips: [
        'Use practical examples',
        'Engage in group study',
        'Take frequent active breaks',
        'Learn through teaching others',
        'Make learning fun'
      ]
    },
    communicationStyle: {
      strengths: [
        'Enthusiastic expression',
        'Natural charm',
        'Storytelling ability',
        'Emotional awareness',
        'Adaptable style'
      ],
      challenges: [
        'May avoid serious topics',
        'Can be too casual',
        'Might oversimplify',
        'May seek attention'
      ],
      tips: [
        'Practice active listening',
        'Balance fun with seriousness',
        'Stay focused on topic',
        'Consider long-term impact',
        'Respect others\' styles'
      ]
    },
    workplaceHabits: {
      strengths: [
        'People skills',
        'Adaptability',
        'Problem-solving',
        'Team building',
        'Energy and enthusiasm'
      ],
      challenges: [
        'May lack focus',
        'Difficulty with deadlines',
        'Can be disorganized',
        'May avoid paperwork'
      ],
      bestEnvironments: [
        'Interactive workspace',
        'Variety in tasks',
        'Social atmosphere',
        'Flexible schedule',
        'Creative opportunities'
      ]
    },
    stressManagement: {
      triggers: [
        'Rigid structure',
        'Long-term planning',
        'Isolation',
        'Criticism',
        'Negative environments'
      ],
      signs: [
        'Increased impulsivity',
        'Withdrawal from others',
        'Physical restlessness',
        'Emotional sensitivity',
        'Difficulty concentrating'
      ],
      copingStrategies: [
        'Social interaction',
        'Physical activity',
        'Creative expression',
        'Nature experiences',
        'Fun activities'
      ]
    },
    famousPeople: {
      historical: [
        'Elvis Presley',
        'Marilyn Monroe',
        'Pablo Picasso',
        'Elizabeth Taylor'
      ],
      modern: [
        'Will Smith',
        'Jamie Oliver',
        'Pink',
        'Jamie Foxx'
      ],
      fictional: [
        'Peter Pan',
        'Olaf (Frozen)',
        'Tigger (Winnie the Pooh)',
        'Genie (Aladdin)'
      ]
    }
  },
  ESTJ: {
    nickname: 'The Executive',
    description: 'Excellent administrators, unsurpassed at managing things – or people.',
    strengths: [
      'Organized',
      'Dedicated and reliable',
      'Strong leadership skills',
      'Clear communicator',
      'Strong-willed'
    ],
    challenges: [
      'Inflexible',
      'Difficult to relax',
      'Judgmental',
      'Too focused on social status',
      'May be too harsh'
    ],
    careerPaths: [
      'Business Manager',
      'Military Officer',
      'Judge',
      'Financial Officer',
      'School Principal',
      'Project Manager',
      'Police/Military Officer',
      'Accountant',
      'Insurance Agent',
      'Bank Manager'
    ],
    relationships: {
      compatibility: ['ISTP', 'ISFP', 'INTP', 'INFP'],
      advice: [
        'Practice emotional sensitivity',
        'Be more flexible with rules',
        'Listen without judging',
        'Show appreciation more often'
      ],
      details: {
        romantic: 'ESTJs seek stable and traditional relationships with clear roles and expectations. They show love through reliability, protection, and maintaining order in the relationship.',
        friendship: 'In friendships, ESTJs are loyal and dependable, organizing activities and maintaining traditions. They value friends who respect their principles and can be counted on.',
        workplace: 'ESTJs thrive in structured environments where they can implement systems and maintain order. They work best with colleagues who respect authority and follow procedures.',
        family: 'As family members, ESTJs are protective and responsible, creating stable and organized home environments. They uphold family traditions and ensure security for their loved ones.'
      }
    },
    growth: [
      'Develop emotional intelligence',
      'Practice flexibility',
      'Learn to relax',
      'Consider others\' feelings',
      'Accept different viewpoints'
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Thinking (Te)',
        description: 'Organizes and implements logical systems. ESTJs excel at creating efficient processes and maintaining order.'
      },
      auxiliary: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. Helps ESTJs maintain traditions and apply proven methods.'
      },
      tertiary: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. Provides ESTJs with occasional creative insights and alternative perspectives.'
      },
      inferior: {
        function: 'Introverted Feeling (Fi)',
        description: 'Develops personal values and moral principles. Can be a source of stress when ESTJs need to process emotional experiences.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Structured learning',
        'Clear objectives',
        'Practical applications',
        'Traditional methods',
        'Sequential learning'
      ],
      challenges: [
        'May resist new methods',
        'Difficulty with abstract concepts',
        'Can be too rigid',
        'May rush to conclusions'
      ],
      tips: [
        'Follow established procedures',
        'Create detailed plans',
        'Use practical examples',
        'Maintain organized notes',
        'Set clear goals'
      ]
    },
    communicationStyle: {
      strengths: [
        'Clear and direct',
        'Organized presentation',
        'Practical focus',
        'Strong leadership',
        'Reliable information'
      ],
      challenges: [
        'May be too direct',
        'Can seem controlling',
        'Might dismiss emotions',
        'May be inflexible'
      ],
      tips: [
        'Show more empathy',
        'Listen without judging',
        'Consider others\' feelings',
        'Be more flexible',
        'Practice patience'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Organization skills',
        'Leadership ability',
        'Efficiency focus',
        'Reliability',
        'Implementation skills'
      ],
      challenges: [
        'May be too rigid',
        'Can be controlling',
        'Might resist change',
        'May overwork others'
      ],
      bestEnvironments: [
        'Structured organization',
        'Clear hierarchy',
        'Traditional methods',
        'Results-focused culture',
        'Stable environment'
      ]
    },
    stressManagement: {
      triggers: [
        'Disorganization',
        'Rule violations',
        'Inefficiency',
        'Emotional situations',
        'Lack of control'
      ],
      signs: [
        'Becoming more rigid',
        'Increased criticism',
        'Emotional outbursts',
        'Physical tension',
        'Difficulty sleeping'
      ],
      copingStrategies: [
        'Creating structure',
        'Physical exercise',
        'Time management',
        'Following routines',
        'Practical problem-solving'
      ]
    },
    famousPeople: {
      historical: [
        'Henry Ford',
        'Andrew Jackson',
        'Frank Sinatra',
        'Bette Davis'
      ],
      modern: [
        'Judge Judy',
        'Dr. Phil McGraw',
        'Alec Baldwin',
        'Michelle Obama'
      ],
      fictional: [
        'Ron Swanson (Parks and Recreation)',
        'Monica Geller (Friends)',
        'Hermione Granger (Harry Potter)',
        'Claire Dunphy (Modern Family)'
      ]
    }
  },
  ESFJ: {
    nickname: 'The Consul',
    description: 'Extraordinarily caring, social and popular people, always eager to help.',
    strengths: [
      'Popular and friendly',
      'Practical and reliable',
      'Loyal and hardworking',
      'Sensitive and warm',
      'Good at connecting people',
    ],
    challenges: [
      'Needy for approval',
      'Inflexible',
      'Reluctant to change',
      'Too selfless',
      'Takes criticism poorly',
    ],
    careerPaths: [
      'Healthcare Worker',
      'Teacher',
      'Human Resources Manager',
      'Social Worker',
      'Office Manager',
      'Nurse',
      'Customer Service Manager',
      'Event Planner',
      'Sales Representative',
      'Administrative Assistant'
    ],
    relationships: {
      compatibility: ['ISFP', 'ISTP', 'INFP', 'INTP'],
      advice: [
        'Learn to say no',
        'Take time for yourself',
        'Accept that not everyone will like you',
        'Express your own needs',
      ],
      details: {
        romantic: 'ESFJs are devoted and caring partners who prioritize harmony in relationships. They show love through practical support and creating comfortable, stable environments for their loved ones.',
        friendship: 'In friendships, ESFJs are reliable and nurturing, often taking on the role of caretaker. They maintain strong social networks and remember important details about their friends\' lives.',
        workplace: 'ESFJs excel in collaborative environments where they can help others. They work best with colleagues who appreciate their organizational skills and people-oriented approach.',
        family: 'As family members, ESFJs are the glue that holds everyone together. They maintain traditions, organize gatherings, and ensure everyone\'s needs are met.'
      }
    },
    growth: [
      'Develop self-care habits',
      'Learn to handle criticism',
      'Practice setting boundaries',
      'Accept imperfection',
      'Trust your own judgment',
    ],
    cognitiveFunctions: {
      dominant: {
        function: 'Extraverted Feeling (Fe)',
        description: 'Focuses on creating harmony and meeting others\' needs. ESFJs excel at understanding and responding to others\' emotional needs.'
      },
      auxiliary: {
        function: 'Introverted Sensing (Si)',
        description: 'Recalls and compares past experiences. Helps ESFJs maintain traditions and create stability through proven methods.'
      },
      tertiary: {
        function: 'Extraverted Intuition (Ne)',
        description: 'Sees possibilities and connections in the external world. Provides ESFJs with occasional creative insights and new perspectives.'
      },
      inferior: {
        function: 'Introverted Thinking (Ti)',
        description: 'Analyzes and categorizes information logically. Can be a source of stress when ESFJs need to make impersonal decisions.'
      }
    },
    learningStyle: {
      preferredMethods: [
        'Group study',
        'Practical applications',
        'Structured learning',
        'Clear instructions',
        'Social interaction'
      ],
      challenges: [
        'May avoid theoretical concepts',
        'Difficulty with abstract ideas',
        'Can be too dependent on others',
        'May need excessive guidance'
      ],
      tips: [
        'Connect learning to helping others',
        'Use study groups effectively',
        'Follow established methods',
        'Take organized notes',
        'Seek practical applications'
      ]
    },
    communicationStyle: {
      strengths: [
        'Warm and friendly',
        'Good at small talk',
        'Diplomatic approach',
        'Remembers details',
        'Creates harmony'
      ],
      challenges: [
        'May avoid conflict',
        'Can be too agreeable',
        'Might take things personally',
        'May gossip too much'
      ],
      tips: [
        'Practice assertiveness',
        'Address conflicts directly',
        'Express personal opinions',
        'Maintain confidentiality',
        'Balance listening with sharing'
      ]
    },
    workplaceHabits: {
      strengths: [
        'Organization skills',
        'Team building',
        'Attention to detail',
        'Reliability',
        'People management'
      ],
      challenges: [
        'May avoid necessary changes',
        'Can be too focused on others',
        'Might neglect own needs',
        'May resist innovation'
      ],
      bestEnvironments: [
        'Structured organization',
        'Supportive atmosphere',
        'Clear expectations',
        'People-focused work',
        'Traditional methods'
      ]
    },
    stressManagement: {
      triggers: [
        'Conflict situations',
        'Criticism',
        'Lack of appreciation',
        'Sudden changes',
        'Social rejection'
      ],
      signs: [
        'Becoming controlling',
        'Increased worry',
        'Emotional sensitivity',
        'Physical exhaustion',
        'Difficulty sleeping'
      ],
      copingStrategies: [
        'Seeking support',
        'Following routines',
        'Organizing environment',
        'Helping others',
        'Social activities'
      ]
    },
    famousPeople: {
      historical: [
        'William McKinley',
        'Mary I of England',
        'Andrew Carnegie',
        'Sam Walton'
      ],
      modern: [
        'Bill Clinton',
        'Anne Hathaway',
        'Hugh Jackman',
        'Jennifer Garner'
      ],
      fictional: [
        'Molly Weasley (Harry Potter)',
        'Marilla Cuthbert (Anne of Green Gables)',
        'Steve Rogers (Captain America)',
        'Charlotte York (Sex and the City)'
      ]
    }
  }
};

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Insights = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [mbtiType, setMbtiType] = useState(null);

  useEffect(() => {
    const storedType = localStorage.getItem('mbtiType');
    console.log('Stored MBTI Type:', storedType); // Debug log
    
    if (!storedType) {
      console.log('No MBTI type found in localStorage'); // Debug log
      navigate('/assessment');
    } else {
      console.log('Setting MBTI type:', storedType); // Debug log
      console.log('Available types:', Object.keys(personalityData)); // Debug log
      setMbtiType(storedType);
    }
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!mbtiType || !personalityData[mbtiType]) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="warning">
            Please complete the personality assessment first to view your insights.
          </Alert>
        </Box>
      </Container>
    );
  }

  const data = personalityData[mbtiType];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Your Personality Insights
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4">{mbtiType}</Typography>
                <Chip
                  label={data.nickname}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            }
            action={
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/chat')}
                sx={{ mt: 1, mr: 1 }}
              >
                Chat with AI Assistant
              </Button>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              {data.description}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Overview" />
            <Tab label="Career" />
            <Tab label="Relationships" />
            <Tab label="Growth" />
            {data.cognitiveFunctions && <Tab label="Cognitive" />}
            {data.learningStyle && <Tab label="Learning" />}
            {data.workplaceHabits && <Tab label="Work Style" />}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Strengths"
                  avatar={<StrengthIcon color="primary" />}
                />
                <CardContent>
                  <List>
                    {data.strengths.map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <StrengthIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Challenges"
                  avatar={<ChallengeIcon color="error" />}
                />
                <CardContent>
                  <List>
                    {data.challenges.map((challenge, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ChallengeIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary={challenge} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader title="Career Paths" avatar={<WorkIcon color="primary" />} />
            <CardContent>
              <List>
                {data.careerPaths.map((career, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={career} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader
              title="Relationships"
              avatar={<RelationshipIcon color="primary" />}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Best Compatibility With:
              </Typography>
              <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
                {data.relationships.compatibility.map((type) => (
                  <Chip key={type} label={type} color="primary" />
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Relationship Advice:
              </Typography>
              <List>
                {data.relationships.advice.map((advice, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <LoveIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary={advice} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader
              title="Personal Growth"
              avatar={<LearningIcon color="primary" />}
            />
            <CardContent>
              <List>
                {data.growth.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <LearningIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {data.cognitiveFunctions && (
          <TabPanel value={tabValue} index={4}>
            <Card>
              <CardHeader
                title="Cognitive Functions"
                avatar={<Psychology color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  {Object.entries(data.cognitiveFunctions).map(([key, value]) => (
                    <Grid item xs={12} md={6} key={key}>
                      <Card variant="outlined">
                        <CardHeader
                          title={value.function}
                          subheader={key.charAt(0).toUpperCase() + key.slice(1)}
                        />
                        <CardContent>
                          <Typography variant="body2">{value.description}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        )}

        {data.learningStyle && (
          <TabPanel value={tabValue} index={data.cognitiveFunctions ? 5 : 4}>
            <Card>
              <CardHeader
                title="Learning Style"
                avatar={<School color="primary" />}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>Preferred Methods</Typography>
                <List>
                  {data.learningStyle.preferredMethods.map((method, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={method} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Tips for Success</Typography>
                <List>
                  {data.learningStyle.tips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Lightbulb color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </TabPanel>
        )}

        {data.workplaceHabits && (
          <TabPanel value={tabValue} index={
            (data.cognitiveFunctions && data.learningStyle) ? 6 :
            (data.cognitiveFunctions || data.learningStyle) ? 5 : 4
          }>
            <Card>
              <CardHeader
                title="Work Style"
                avatar={<Work color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Workplace Strengths</Typography>
                    <List>
                      {data.workplaceHabits.strengths.map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Star color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Best Environments</Typography>
                    <List>
                      {data.workplaceHabits.bestEnvironments.map((env, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={env} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        )}
      </Box>
    </Container>
  );
};

export default Insights; 