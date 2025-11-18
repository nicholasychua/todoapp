# Subspace - AI-Powered Task Manager

vibe coding galore

An intelligent task management platform with AI-powered features, focus sessions, and seamless organization.

## 🚀 Features

- **Smart Authentication**: Email/password and Google sign-in with password reset
- **AI-Powered**: AI voice input and automatic task categorization
- **Focus Sessions**: Pomodoro timer with break management
- **Calendar Views**: Visualize your tasks across time
- **Tab Groups**: Organize tasks into custom groups
- **Beautiful UI**: Minimalistic design with smooth animations

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

#### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Click on "Project Settings" (gear icon)
4. Scroll down to "Your apps" section
5. Click the web icon (`</>`) to create a web app
6. Copy the configuration values

#### Create Environment File

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=auth.usesubspace.live
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (optional)
4. Go to **Settings** → **Authorized domains**
5. Add `localhost` for development

#### Configure Password Reset Emails

See [FIREBASE_EMAIL_SETUP.md](./FIREBASE_EMAIL_SETUP.md) for detailed instructions on:

- Customizing email templates
- Setting up action URLs
- Testing email delivery
- Troubleshooting common issues

**Quick Setup:**

1. Go to **Authentication** → **Templates** → **Password reset**
2. Customize the template with your branding
3. Set action URL to: `http://localhost:3001/reset-password` (for dev)
4. Save changes

### 3. OpenAI Configuration (for AI features)

Add to your `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🧪 Testing & Debugging

### Debug Firebase Configuration

Visit `/debug-firebase` to check:

- Environment variables status
- Firebase initialization
- Auth availability
- Configuration issues

Example: [http://localhost:3001/debug-firebase](http://localhost:3001/debug-firebase)

### Test Authentication Flow

1. **Sign Up**: `/signup` - Create a new account
2. **Sign In**: `/signin` - Log in with credentials
3. **Forgot Password**: `/forgot-password` - Request password reset
4. **Reset Password**: `/reset-password` - Complete password reset (from email link)

## 📁 Project Structure

```
├── app/
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   ├── forgot-password/  # Password reset request
│   ├── reset-password/   # Password reset handler
│   ├── debug-firebase/   # Firebase debug panel
│   └── api/              # API routes (AI features)
├── components/
│   ├── ui/               # Reusable UI components
│   └── task-manager/     # Task management components
├── lib/
│   ├── auth-context.tsx  # Authentication context
│   ├── firebase.ts       # Firebase configuration
│   ├── tasks.ts          # Task management utilities
│   └── ai-service.ts     # AI integration
└── hooks/                # Custom React hooks
```

## 🎨 Tech Stack

- **Framework**: Next.js 15
- **UI**: React 18, Tailwind CSS, Radix UI
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: OpenAI API
- **TypeScript**: Full type safety

## 📝 Common Issues

### Emails not sending?

1. Check Firebase Console → Authentication → Sign-in method (Email/Password enabled?)
2. Verify email templates are configured in Authentication → Templates
3. Check browser console for errors
4. Look in spam/junk folder
5. See [FIREBASE_EMAIL_SETUP.md](./FIREBASE_EMAIL_SETUP.md) for detailed troubleshooting

### Firebase errors?

1. Run `/debug-firebase` to check configuration
2. Verify all environment variables are set
3. Check that Firebase project is active
4. Ensure authentication is enabled in Firebase Console
5. Restart dev server after changing `.env.local`

### Build errors?

```bash
# Clean and rebuild
npm run clean
npm install
npm run dev
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:

- All `NEXT_PUBLIC_FIREBASE_*` variables
- `OPENAI_API_KEY` (if using AI features)

Update Firebase configuration:

- Add production domain to Authorized domains
- Update action URL in email templates to production URL
- Configure custom email sender (optional, requires paid plan)

## 📚 Documentation

- [Firebase Email Setup Guide](./FIREBASE_EMAIL_SETUP.md) - Complete email configuration
- [Optimization Notes](./OPTIMIZATION_NOTES.md) - Performance optimization details

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project however you like!

---

Built with ❤️ using Next.js and Firebase
