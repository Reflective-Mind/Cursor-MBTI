# MBTI Insights

A comprehensive application for understanding and leveraging MBTI personality types through personalized insights, recommendations, and community interaction.

## Features

- 🎯 Personality Assessment
- 💡 Personalized Insights
- 🤝 Custom Advice
- 💬 Interactive Chat
- ✍️ Content Generation
- ❤️ Compatibility Checker
- 🎯 Goal Setting
- 📊 Mood Tracker
- 👥 Community Forum
- 📚 Educational Resources

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **API**: Le Chat API Integration
- **Authentication**: JWT
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mbti-insights.git
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   LECHAT_API_KEY=your_api_key
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

## Project Structure

```
mbti-insights/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── tests/                 # Test files
└── package.json
```

## API Documentation

The application uses the Le Chat API for natural language processing and content generation. Key endpoints:

- `/api/auth`: Authentication endpoints
- `/api/personality`: MBTI assessment and results
- `/api/insights`: Personalized insights and recommendations
- `/api/chat`: Interactive chat functionality
- `/api/community`: Community forum endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MBTI Foundation for personality type information
- Le Chat API for natural language processing capabilities
- The open-source community for various tools and libraries used in this project 