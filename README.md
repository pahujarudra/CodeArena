# 🏆 CodeArena - Competitive Programming Platform

A modern, full-featured competitive programming platform built with React, Firebase, and Judge0 API. Challenge yourself with coding contests, solve problems in multiple languages, and track your progress!

![CodeArena Banner](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Features

### 🎯 Core Features
- **🔥 Real-time Contests**: Create and participate in timed programming contests
- **💻 Multi-language Support**: Code in Java, Python, C++, and JavaScript
- **⚡ Live Code Execution**: Test your code with custom inputs using Judge0 API
- **📊 Progress Tracking**: Monitor your solved problems, submissions, and rankings
- **🎨 Modern UI/UX**: Beautiful, responsive design with smooth animations
- **🔒 Secure Authentication**: Firebase-powered user authentication
- **👤 User Profiles**: Track statistics, recent activities, and achievements
- **👨‍💼 Admin Dashboard**: Manage contests, problems, and platform content

### 🚀 Advanced Features
- **⏱️ Live Countdown Timer**: Real-time contest countdown on the homepage
- **🎨 Syntax-aware Code Editor**: Auto-indentation, bracket matching, line numbers
- **🧪 Test Case Validation**: Run code against multiple test cases
- **📈 Difficulty Levels**: Problems categorized as Easy, Medium, and Hard
- **🏅 Global Ranking System**: Compete with other programmers
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **React Router DOM 7.9.6** - Client-side routing
- **Vite 7.2.2** - Build tool and dev server
- **CSS3** - Custom styling with modern features

### Backend & Services
- **Firebase 12.6.0**
  - Authentication (Email/Password)
  - Firestore Database
  - Real-time data synchronization
- **Judge0 API** - Code execution and evaluation
- **RapidAPI** - Judge0 integration

### Development Tools
- **ESLint** - Code linting
- **PropTypes** - Runtime type checking
- **Vite Plugin React** - Fast refresh and HMR

## 📁 Project Structure

```
codearena/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── CodeEditor.jsx       # Custom code editor with syntax features
│   │   ├── Navbar.jsx           # Navigation bar component
│   │   └── modals/              # Modal components
│   │       ├── AddContestModal.jsx
│   │       ├── AddProblemModal.jsx
│   │       ├── EditProfileModal.jsx
│   │       ├── LoginModal.jsx
│   │       └── SignupModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context provider
│   ├── pages/
│   │   ├── Admin.jsx            # Admin dashboard
│   │   ├── ContestDetails.jsx   # Contest detail page
│   │   ├── Contests.jsx         # Contests listing page
│   │   ├── Home.jsx             # Landing page
│   │   ├── ProblemSolver.jsx    # Problem solving interface
│   │   └── Profile.jsx          # User profile page
│   ├── utils/
│   │   ├── constants.js         # App constants and configs
│   │   └── errorHandling.js     # Error formatting utilities
│   ├── App.jsx                  # Main app component with routes
│   ├── firebase.js              # Firebase configuration
│   ├── index.css                # Global styles
│   └── main.jsx                 # App entry point
├── .env                         # Environment variables (create this)
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase account
- RapidAPI account (for Judge0)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codearena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Get your Firebase configuration

4. **Set up Judge0 API**
   - Sign up at [RapidAPI](https://rapidapi.com/)
   - Subscribe to [Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
   - Get your API key

5. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Judge0 API Configuration
   VITE_RAPIDAPI_KEY=your_rapidapi_key
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📊 Firestore Database Structure

### Collections

#### `users`
```javascript
{
  uid: string,
  fullname: string,
  username: string,
  email: string,
  photoURL: string,
  createdAt: timestamp,
  isAdmin: boolean,
  problemsSolved: number,
  totalPoints: number,
  totalSubmissions: number,
  contestsParticipated: number,
  globalRank: number,
  problemsByDifficulty: {
    easy: number,
    medium: number,
    hard: number
  },
  recentActivities: array
}
```

#### `contests`
```javascript
{
  title: string,
  description: string,
  startTime: timestamp,
  endTime: timestamp,
  problemCount: number,
  createdAt: timestamp
}
```

#### `problems`
```javascript
{
  title: string,
  description: string,
  difficulty: string, // "easy" | "medium" | "hard"
  points: number,
  timeLimit: number, // in milliseconds
  memoryLimit: number, // in KB
  contestId: string,
  testCases: [
    {
      input: string,
      expectedOutput: string
    }
  ],
  constraints: string,
  examples: array,
  createdAt: timestamp
}
```

#### `submissions`
```javascript
{
  userId: string,
  problemId: string,
  contestId: string,
  code: string,
  language: string,
  status: string, // "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | etc.
  passedTests: number,
  totalTests: number,
  executionTime: number,
  submittedAt: timestamp
}
```

## 🎮 Usage

### For Users
1. **Sign Up**: Create an account using email and password
2. **Browse Contests**: View active, upcoming, and past contests
3. **Solve Problems**: Click on a contest to view problems
4. **Write Code**: Use the built-in code editor with syntax support
5. **Test & Submit**: Run custom tests and submit your solution
6. **Track Progress**: Check your profile for statistics and achievements

### For Admins
1. **Access Admin Panel**: Navigate to `/admin` (requires admin privileges)
2. **Create Contests**: Set title, description, start/end times
3. **Add Problems**: Create problems with test cases and constraints
4. **Manage Content**: Edit or delete existing contests and problems

### Setting Up First Admin
To create your first admin user, manually update the Firestore database:
```javascript
// In Firestore Console, edit a user document
{
  ...existingFields,
  isAdmin: true
}
```

## 🎨 Customization

### Theming
The app uses CSS variables for easy theming. Edit `src/index.css`:
```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --accent: #8b5cf6;
  /* ... more variables */
}
```

### Supported Languages
Add or modify programming languages in `src/pages/ProblemSolver.jsx`:
```javascript
const languageIds = {
  java: 62,
  python: 71,
  cpp: 54,
  javascript: 63
  // Add more languages with their Judge0 IDs
};
```

## 🔧 Configuration

### Vite Configuration
The app is configured to work with ngrok for tunneling:
```javascript
// vite.config.js
server: {
  host: true,
  allowedHosts: [
    '.ngrok-free.app',
    '.ngrok.io',
    'localhost'
  ]
}
```

### Judge0 Settings
Default time and memory limits can be adjusted in `ProblemSolver.jsx`:
```javascript
cpu_time_limit: (problem?.timeLimit || 2000) / 1000, // seconds
memory_limit: (problem?.memoryLimit || 256) * 1024 // KB
```

## 🐛 Troubleshooting

### Common Issues

**Firebase Connection Error**
- Verify your `.env` file has correct Firebase credentials
- Check Firebase project settings
- Ensure Firestore and Authentication are enabled

**Judge0 API Not Working**
- Confirm your RapidAPI key is valid
- Check API quota limits
- Verify network connectivity

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Judge0** - Code execution engine
- **Firebase** - Backend services
- **React** - UI framework
- **Vite** - Build tool
- **Font Inter** - Typography

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

**Happy Coding! 🚀**

Made with ❤️ using React & Firebase
