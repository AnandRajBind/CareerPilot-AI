# CareerPilot AI - Project Structure & Architecture Summary

**Date**: April 10, 2026 | **Status**: Complete Project Overview

---

## 1. CURRENT ROUTING SETUP

### Frontend Routes (Client/src/App.jsx)
```
/                          → Home (public)
/login                     → Login (public)
/register                  → Register (public)
/dashboard                 → Dashboard (protected) - User's analytics
/interview-mode            → Interview Setup (protected) - Configure interview
/system-check              → Pre-interview checks (protected)
/interview-screen          → Active interview (protected) - Take interview
/interview-results         → Results & Feedback (protected)
(any other)                → Redirect to /
```

**Protected Routes**: Dashboard, Interview Mode, System Check, Interview Screen, Results
- Using `<ProtectedRoute>` wrapper component that checks `isAuthenticated` from AuthContext

### Navigation Structure
- **Home Page (/)**: Public landing
- **Authenticated State**: Shows "Start Interview" + "Dashboard" + Logout
- **Unauthenticated State**: Shows "Login" + "Register"
- Trial status displayed in navbar when authenticated (e.g., "Trial: 3 days left")

---

## 2. INTERVIEW CONFIGURATION COMPONENTS & UI

### Interview Configuration Flow
1. **InterviewMode Page** (Client/src/pages/InterviewMode.jsx)
   - Step 1: Job Role Selection (6 options with emoji icons)
     - Frontend Developer 🎨
     - Backend Developer ⚙️
     - Full Stack 🔄
     - Java Developer ☕
     - Python Developer 🐍
     - HR Round 👥
   
   - Step 2: Interview Type Selection (3 cards)
     - Technical (focus on technical knowledge)
     - Behavioral (focus on soft skills)
     - Combined (mix of both)
   
   - Step 3: Experience Level (radio buttons)
     - Junior (0-2 years)
     - Mid-level (2-5 years)
     - Senior (5+ years)
   
   - Step 4: Difficulty Level (radio buttons with star ratings)
     - Easy ⭐
     - Medium ⭐⭐
     - Hard ⭐⭐⭐
   
   - Question Count: Slider (1-20 questions)

2. **SystemCheck Page** (Client/src/pages/SystemCheck.jsx)
   - Pre-interview environment verification
   - Audio/video device checks
   - Microphone permissions

3. **InterviewScreen Page** (Client/src/pages/InterviewScreen.jsx)
   - Displays AI-generated question
   - 5-minute countdown timer per question
   - Answer textarea (min 10 characters)
   - Question navigator grid (jump to any question)
   - Submit answer functionality

4. **InterviewResults Page** (Client/src/pages/InterviewResults.jsx)
   - Score display (0-100) with color coding
   - Tabbed interface:
     - Strengths
     - Weaknesses
     - Suggestions
     - Model Answers
   - Complete Q&A review
   - Export/Download results

### Interview Configuration State Management
**InterviewContext** (Client/src/context/InterviewContext.jsx)
- State:
  - `currentInterview`: Full interview object with questions
  - `currentQuestionIndex`: Current question being answered
  - `answers[]`: Array of answers submitted
  - `results`: Final evaluation scores
  - `questionAnswers{}`: Individual evaluation per question

- Methods:
  - `startInterview()` - Calls API to generate questions
  - `submitAnswer()` - Evaluates answer with AI
  - `completeInterview()` - Finalizes interview, gets score
  - `goToQuestion()` - Navigate between questions
  - `resetInterview()` - Clear state

- Computed values:
  - `hasCurrentAnswer`: Boolean if answer entered
  - `isLastQuestion`: Boolean for last question
  - `progressPercentage`: Interview completion percentage
  - `answeredCount`: Number of questions answered

---

## 3. STYLING PATTERNS & COLOR SCHEME

### Tailwind Configuration (Client/tailwind.config.js)
```javascript
Theme Colors:
- primary: '#6366f1' (Indigo) - Main brand color
- primaryDark: '#4f46e5' (Darker indigo) - Hover states
- secondary: '#8b5cf6' (Purple) - Accent color
- dark: '#1f2937' (Dark gray) - Text/Backgrounds
- light: '#f3f4f6' (Light gray) - Light backgrounds

Font Family: Inter (system-ui, sans-serif)
```

### Common Styling Patterns

**Cards**
```className
bg-white rounded-lg shadow-lg p-6 border-2 hover:shadow
```

**Gradient Backgrounds**
```className
bg-gradient-to-br from-indigo-50 to-purple-50
bg-gradient-to-r from-indigo-50 to-purple-50
```

**Button Styles**
```javascript
Primary: px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition
Secondary: px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary transition
Danger: px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition
```

**State-based Colors**
```javascript
// For StatsCard component
indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
purple: 'bg-purple-50 text-purple-600 border-purple-200'
green: 'bg-green-50 text-green-600 border-green-200'
red: 'bg-red-50 text-red-600 border-red-200'
blue: 'bg-blue-50 text-blue-600 border-blue-200'
pink: 'bg-pink-50 text-pink-600 border-pink-200'
```

**Score Display Colors (InterviewResults)**
- 80-100: Green (excellent)
- 60-80: Blue (good)
- 40-60: Yellow (fair)
- 0-40: Red (needs work)

**Role/Job Colors (InterviewHistory)**
```javascript
frontend: 'bg-blue-100 text-blue-800'
backend: 'bg-purple-100 text-purple-800'
fullstack: 'bg-pink-100 text-pink-800'
java: 'bg-orange-100 text-orange-800'
hr: 'bg-green-100 text-green-800'
```

### Icon Library
- Lucide Icons (`lucide-react`) for UI icons
- Emoji icons for job roles and interview types

---

## 4. AUTHENTICATION CONTEXT & USER DATA STRUCTURE

### AuthContext (Client/src/context/AuthContext.jsx)
**State Variables**:
- `company`: Company object (null if not authenticated)
- `loading`: Boolean for async operations
- `error`: Error message string
- `isAuthenticated`: Boolean (computed from !!company)

**Company Data Structure**:
```javascript
{
  _id: ObjectId,
  name: string,              // Contact person name
  email: string,             // Company email (unique)
  companyName: string,       // Official company name
  industry: string,          // enum: tech, finance, healthcare, etc.
  plan: string,              // free, starter, professional, enterprise
  isTrialActive: boolean,    // Is trial active?
  trialStartDate: Date,      // When trial started
  trialEndDate: Date,        // When trial ends (3 days from start)
  isActive: boolean,         // Is account active?
}
```

**Local Storage Keys**:
- `token`: JWT token for authentication
- `company`: JSON stringified company object
- `trialStatus`: JSON object { isActive, daysRemaining }

**Context Methods**:
- `register(name, email, password, confirmPassword, companyName, industry)` - Register new company
- `login(email, password)` - Login existing company
- `logout()` - Logout and clear storage

**useAuth Hook** (Client/src/hooks/useAuth.js)
```javascript
const { company, loading, error, register, login, logout, isAuthenticated } = useAuth()
```

### API Interceptor (Client/src/services/api.js)
- Axios instance with base URL: `http://localhost:5000/api`
- Auto-adds JWT token to Authorization header
- Handles 401 (unauthorized) by redirecting to login

---

## 5. EXISTING REUSABLE COMPONENTS

### 1. **StatsCard** (Client/src/components/StatsCard.jsx)
```jsx
<StatsCard 
  icon="📊"              // Any emoji or HTML
  label="Total Interviews"
  value={42}             // Can be number or string
  color="indigo"         // indigo, purple, green, red, blue, pink
/>
```
- Displays with colored background, icon, label, and bold value
- Hover effect with shadow
- Perfect for dashboard metrics

### 2. **Navbar** (Client/src/components/Navbar.jsx)
- Logo with gradient background
- Responsive (hidden menu on mobile, shows menu on desktop)
- Role-aware: Different links based on authentication
- Trial status display
- Company name display

### 3. **ProtectedRoute** (Client/src/components/ProtectedRoute.jsx)
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```
- Wrapper for routes requiring authentication
- Redirects to login if not authenticated

### 4. **OverviewSection** (Client/src/components/OverviewSection.jsx)
- Welcome banner with gradient
- Performance level indicator with color coding
- Quick stats grid (Total Interviews, Average Score, Improvement)
- Recent interviews display
- Reusable for different dashboard contexts

### 5. **InterviewHistory** (Client/src/components/InterviewHistory.jsx)
- Table of past interviews
- Displays: Date, Role, Type, Difficulty, Score, Status
- Color-coded badges for role/difficulty/status
- Sort functionality
- Delete functionality with confirmation
- Perfect for company admin candidate view

### 6. **AnalyticsSection** (Client/src/components/AnalyticsSection.jsx)
- Recharts integration for data visualization
- Can display trends over time
- Reusable for different analytics views

### 7. **VideoRecorder, VideoCamera, VoiceRecorder** (Client/src/components/)
- Media capture components
- Already integrated with MediaContext
- Can be reused for proctoring/monitoring

### 8. **SpeakButton** (Client/src/components/SpeakButton.jsx)
- Speech-to-text functionality
- Can be reused for voice input

---

## 6. BACKEND INTERVIEW ENDPOINTS & DATA

### Interview Model (Server/models/Interview.js)
```javascript
{
  companyId: ObjectId (ref: Company),  // Company taking interview
  jobRole: enum ['frontend', 'backend', 'fullstack', 'java', 'python', 'hr'],
  experienceLevel: enum ['junior', 'mid', 'senior'],
  interviewType: enum ['technical', 'behavioral', 'all'],
  difficultyLevel: enum ['easy', 'medium', 'hard'],
  numberOfQuestions: number (1-20),
  questions: [string],                 // AI-generated questions
  answers: [string],                   // User answers
  evaluation: {
    score: number (0-100),
    strengths: string,
    weaknesses: string,
    suggestions: string,
    modelAnswer: string,
    interviewTips: string,
  },
  status: enum ['in-progress', 'completed', 'failed'],
  createdAt: Date,
  updatedAt: Date,
}
```

### Interview API Endpoints (All Protected)
```
POST    /api/interviews/start
        Body: { jobRole, experienceLevel, interviewType, difficultyLevel, numberOfQuestions }
        Response: { interviewId, questions[], ... }

POST    /api/interviews/generate-questions
        Body: { jobRole, experienceLevel, interviewType, difficultyLevel, numberOfQuestions }
        Response: { questions[] } (standalone, no DB record)

POST    /api/interviews/:id/evaluate-answer
        Body: { questionIndex, answer }
        Response: { evaluation: { score, feedback, ... } }

POST    /api/interviews/:id/complete
        Body: { answers[] }
        Response: { evaluation: { finalScore, strengths, weaknesses, ... } }

GET     /api/interviews/:id/result
        Response: { interview object with evaluation }

GET     /api/interviews
        Query params: ?companyId, ?status, ?jobRole
        Response: { interviews[] } (paginated)

DELETE  /api/interviews/:id
        Response: { success: true }
```

### Groq AI Integration (Server/services/groqService.js)
- `generateQuestions()` - AI-generates interview questions
- `evaluateAnswer()` - AI-evaluates user answer for each question
- `generateFinalEvaluation()` - AI-generates overall score & feedback

---

## 7. WHERE TO INTEGRATE THE ADMIN DASHBOARD

### Recommended Integration Points

#### Frontend Integration
1. **Add new routes in App.jsx**:
   ```jsx
   <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
   <Route path="/admin/companies" element={<ProtectedRoute><CompanyManagement /></ProtectedRoute>} />
   <Route path="/company-admin/dashboard" element={<ProtectedRoute><CompanyAdminDashboard /></ProtectedRoute>} />
   <Route path="/company-admin/candidates" element={<ProtectedRoute><CandidateManagement /></ProtectedRoute>} />
   ```

2. **Update Navbar.jsx** to show admin links based on role:
   ```jsx
   {role === 'platformAdmin' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
   {role === 'companyAdmin' && <Link to="/company-admin/dashboard">Company Dashboard</Link>}
   ```

3. **Extend AuthContext** to handle role field:
   ```javascript
   // company object should include: { ..., role: 'platformAdmin' | 'companyAdmin' | 'candidate' }
   ```

4. **Create new page files**:
   - Client/src/pages/AdminDashboard.jsx
   - Client/src/pages/AdminCompanyManagement.jsx
   - Client/src/pages/AdminUserManagement.jsx
   - Client/src/pages/CompanyAdminDashboard.jsx
   - Client/src/pages/CandidateManagement.jsx

5. **Create new components**:
   - Client/src/components/CompanyTable.jsx - For admin to manage companies
   - Client/src/components/UserTable.jsx - For admin to manage admins
   - Client/src/components/CandidateTable.jsx - For company admin to manage candidates
   - Client/src/components/OrderedChart.jsx - For analytics

#### Backend Integration
1. **Update Interview Model** to support company filtering
   - Currently uses `companyId` ✅ (already done)
   - Add optional `candidateId` to link interviews to specific candidate

2. **Create new models** (Server/models/):
   - Optional: Candidate.js - Extended candidate info if needed
   - Optional: AdminRole.js - For managing admin roles

3. **Create new services** (Server/services/):
   - `companyService.js` - CRUD operations for companies
   - `adminService.js` - Platform admin operations
   - `candidateService.js` - Candidate management

4. **Create new controllers** (Server/controllers/):
   - `companyController.js` - Handle company endpoints
   - `adminController.js` - Handle admin endpoints
   - `candidateController.js` - Handle candidate endpoints

5. **Create new routes** (Server/routes/):
   - `/api/admin/*` - Platform admin endpoints
   - `/api/admin/companies/*` - Manage companies
   - `/api/admin/analytics/*` - Platform-wide analytics
   - `/api/company-admin/candidates/*` - Company admin manages candidates
   - `/api/company-admin/analytics/*` - Company analytics

6. **Create authorization middleware** (Server/middleware/):
   - `authorization.js` with checks for:
     - `requireRole(roles)` - Check user has specific role(s)
     - `requireCompanyAccess(companyId)` - Check access to company
     - `requireCandidateAccess(candidateId)` - Check access to candidate

7. **Key DB Query Patterns for Admin**:
   ```javascript
   // Platform Admin: See all interviews across all companies
   Interview.find({ createdAt: { $gt: startDate } })
   
   // Company Admin: See only own company's interviews
   Interview.find({ companyId: req.company._id })
   
   // Analytics: Group interviews by role/difficulty
   Interview.aggregate([
     { $match: { companyId: companyId } },
     { $group: { _id: "$jobRole", count: { $sum: 1 }, avgScore: { $avg: "$evaluation.score" } } }
   ])
   ```

---

## 8. AUTHENTICATION SETUP DETAILS

### Registration Flow (Company)
1. User enters: name, email, password, companyName, industry
2. Server validates via Joi schema
3. Creates Company document with:
   - Password hashed via bcryptjs
   - Trial auto-activated (3-day duration)
   - Email must be unique
4. Returns JWT token + company object + trial status to frontend
5. Frontend stores token + company + trialStatus in localStorage

### Login Flow (Company)
1. User enters: email, password
2. Server validates credentials
3. Returns JWT token + company object + trial status (with daysRemaining calculated)
4. Frontend stores data, redirects to dashboard

### JWT Token Structure
```javascript
{
  id: company._id,
  email: company.email,
  type: 'company',
  iat: timestamp,
  exp: timestamp + 7 days
}
```

### Protected Requests
- Axios interceptor adds: `Authorization: Bearer <token>`
- If 401 returned, auto-redirects to /login and clears storage

---

## 9. CRITICAL FILES SUMMARY

### Frontend Files
| File | Purpose | Lines |
|------|---------|-------|
| App.jsx | Main routing | 60 |
| context/AuthContext.jsx | Auth state & methods | 120 |
| context/InterviewContext.jsx | Interview state & methods | 220 |
| context/MediaContext.jsx | Media/video state | - |
| hooks/useAuth.js | useAuth hook | ~15 |
| hooks/useInterview.js | useInterview hook | ~15 |
| pages/InterviewMode.jsx | Interview config UI | 300+ |
| pages/InterviewScreen.jsx | Active interview UI | 320+ |
| pages/InterviewResults.jsx | Results display | 350+ |
| pages/Dashboard.jsx | Analytics dashboard | 200+ |
| components/StatsCard.jsx | Reusable stats card | 30 |
| components/Navbar.jsx | Navigation bar | 150 |
| services/api.js | Axios config | 35 |
| services/interviewService.js | Interview API calls | 70 |
| services/authService.js | Auth API calls | 40 |

### Backend Files
| File | Purpose | Lines |
|------|---------|-------|
| server.js | Express app setup | 100+ |
| models/Interview.js | Interview schema | 150+ |
| models/Company.js | Company schema (was User) | 150+ |
| controllers/interviewController.js | Interview logic | 300+ |
| controllers/authController.js | Auth logic | 100+ |
| routes/interview.js | Interview endpoints | 60 |
| routes/auth.js | Auth endpoints | 30 |
| services/groqService.js | AI integration | 200+ |
| middleware/auth.js | JWT validation | 60 |
| utils/validation.js | Joi schemas | 300+ |
| utils/errorBuilder.js | Error handling | 30 |

---

## 10. DEPLOYMENT & ENVIRONMENT NOTES

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (default: `http://localhost:5000/api`)

### Backend Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: development/production
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Secret for token signing
- `JWT_EXPIRE`: Token expiration (default: 7d)
- `BCRYPT_ROUNDS`: Password hashing rounds
- `GROQ_API_KEY`: Groq AI API key
- `CORS_ORIGIN`: Frontend URL
- `DATABASE_NAME`: MongoDB database name

---

## 11. QUICK REFERENCE: ADDING NEW FEATURES

### To add a new Interview Type
1. Update `interviewSchema` enum in Server/models/Interview.js
2. Update Joi schema in Server/utils/validation.js
3. Update frontend options in Client/src/pages/InterviewMode.jsx
4. Update Groq prompt in Server/services/groqService.js

### To add a new Job Role
1. Update `jobRoleSchema` enum in Server/models/Interview.js
2. Update Joi schema in Server/utils/validation.js
3. Add new role object with icon to `jobRoles` array in InterviewMode.jsx
4. Update Groq prompt in Server/services/groqService.js

### To add stats to Dashboard
1. Create new stat calculation in Dashboard.jsx
2. Add StatsCard component with calculated value
3. Optionally add chart visualization using Recharts

### To add new Admin Feature
1. Create new Controller in Server/controllers/
2. Create corresponding Service in Server/services/
3. Create Routes in Server/routes/
4. Add Authorization middleware to routes
5. Create Frontend Page/Component in Client/src/pages/
6. Add Route in Client/src/App.jsx
7. Add navigation link in Client/src/components/Navbar.jsx

---

## SUMMARY TABLE

| Aspect | Current Implementation |
|--------|----------------------|
| **Frontend Framework** | React 18.2 + Vite + React Router 6 |
| **Styling** | Tailwind CSS 3.3.6 + custom color scheme |
| **Backend Framework** | Node.js + Express 4.18 |
| **Database** | MongoDB 7.5 |
| **Authentication** | JWT (7-day expiry) + bcryptjs |
| **API Structure** | REST endpoints, JWT protected |
| **Interview Config** | 6 job roles, 3 types, 3 experience levels, 3 difficulties |
| **AI Integration** | Groq API for questions & evaluation |
| **State Management** | Context API + custom hooks |
| **UI Components** | StatsCard, Navbar, ProtectedRoute, InterviewHistory |
| **Color Scheme** | Indigo (#6366f1) + Purple (#8b5cf6) + System colors |
| **Responsive Design** | Mobile-first Tailwind (tested on mobile, tablet, desktop) |
| **Error Handling** | Custom AppError class + middleware |
| **Validation** | Joi schemas on backend + client-side validation |
| **Rate Limiting** | Express rate-limit (100 req/15min) |
| **Security** | Helmet, CORS configured, password hashing |

---

**Ready for Phase 2**: Admin Dashboard Integration ✅
All architectural components are clean, well-organized, and ready for extension.
