# CareerPilot AI - Frontend Client

Modern React + Vite + Tailwind CSS frontend for the CareerPilot AI interview preparation platform.

## 🚀 Features

- ✅ **React 18** with Vite for fast development
- ✅ **Tailwind CSS** for modern, responsive UI
- ✅ **React Router v6** for client-side routing
- ✅ **Axios** for API integration with JWT support
- ✅ **Zod** for form validation
- ✅ **Authentication Context** for global state management
- ✅ **Mobile-first responsive design**
- ✅ **Clean, modular folder structure**

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx              # Responsive navigation bar
│   └── ProtectedRoute.jsx       # Route protection wrapper
├── pages/
│   ├── Home.jsx                # Landing/home page
│   ├── Login.jsx               # Login page
│   └── Register.jsx            # Registration page
├── services/
│   ├── api.js                  # Axios configuration with interceptors
│   └── authService.js          # Authentication API calls
├── context/
│   └── AuthContext.jsx         # Global authentication context
├── hooks/
│   └── useAuth.js              # Custom authentication hook
├── utils/
│   └── validation.js           # Form validation schemas (Zod)
├── App.jsx                     # Main app component
├── main.jsx                    # Entry point
└── index.css                   # Global styles with Tailwind

Public/
└── index.html                  # HTML entry point

Config files:
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # Dependencies
└── .env.example                # Environment variables template
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn

### Steps

1. **Navigate to Client folder**
   ```bash
   cd Client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your API URL (if needed)**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The app will open at `http://localhost:3000`

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm build

# Preview production build
npm run preview

# Run ESLint (optional)
npm run lint
```

## 🎨 UI Components

### Navbar
- Responsive design (hamburger menu on mobile)
- Logo with gradient background
- Authentication state display
- Login/Logout functionality
- Mobile-optimized

### Pages

#### Home Page
- Hero section with value proposition
- Features showcase (6 feature cards)
- Statistics display
- Call-to-action sections
- Different UI for authenticated/non-authenticated users

#### Login Page
- Email and password fields
- Form validation with Zod
- Show/hide password toggle
- Error messages
- Loading state
- Link to register page
- Gradient background design

#### Register Page
- Name, email, password fields
- Real-time password strength indicator
- Requirements checklist
- Form validation with Zod
- Error handling
- Link to login page
- Professional card-based design

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token received from backend
3. Token stored in localStorage
4. Token automatically added to API requests via interceptor
5. On 401 error, user is redirected to login
6. User data persists across page refreshes

## 🎯 API Integration

### Base Configuration
All API requests use axios with:
- Base URL from environment variable (default: http://localhost:5000/api)
- Automatic JWT token injection
- Error handling with 401 redirect

### Example Usage
```javascript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { login, user, isAuthenticated } = useAuth()
  
  // Use auth functions and state
}
```

## 🎨 Tailwind Configuration

- **Primary Color**: Indigo (#6366f1)
- **Secondary Color**: Purple (#8b5cf6)
- **Dark Color**: Gray-900 (#1f2937)
- **Light Color**: Gray-100 (#f3f4f6)

Custom theme values are defined in `tailwind.config.js`

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Tested on various screen sizes
- Hamburger menu for mobile navigation

## ✨ Form Validation

Using Zod for type-safe validation:

**Login Validation:**
- Email must be valid
- Password minimum 6 characters

**Register Validation:**
- Name minimum 2 characters
- Email must be valid
- Password must have:
  - Minimum 6 characters
  - At least one uppercase letter
  - At least one number

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized `dist` folder ready for deployment.

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## 🔄 Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=http://localhost:5000/api
```

For production, update the API URL to your deployed backend.

## 🐛 Troubleshooting

### CORS Issues
- Ensure backend CORS is configured correctly
- Check `VITE_API_URL` points to correct backend URL

### Token Expires
- Tokens stored in localStorage are automatically added to requests
- On 401 error, user is redirected to login
- Clear localStorage and login again if issues persist

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Zod** - Form validation
- **PostCSS & Autoprefixer** - CSS processing

## 📖 Next Steps

1. Set up the backend API (see [Server README](../Server/README.md))
2. Configure environment variables
3. Start both frontend and backend
4. Test authentication flow
5. Add interview features

## 💡 Tips

- Use `useAuth()` hook in any component for authentication
- Form validation happens before API calls
- All API errors are caught and displayed to users
- Responsive design tested on mobile devices
- CSS classes use Tailwind utilities for consistency

## 📄 License

MIT License - Feel free to use this template for your projects.

---

**Built with ❤️ for CareerPilot AI**
