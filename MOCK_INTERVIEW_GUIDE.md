# Mock Interview System - Complete Integration Guide

## Overview
A fully isolated mock interview system for students with AI-powered question generation and real-time evaluation. Students can practice interviews without login, and all data is kept separate from recruiter/company interview data.

---

## 📋 Architecture

### Data Flow
```
Student Registration
    ↓
Select Interview Config
    ↓
API: POST /api/mock/start (generates questions)
    ↓
Answer Questions (auto-saves to API)
    ↓
API: POST /api/mock/answer (evaluates each answer)
    ↓
Complete Interview
    ↓
API: POST /api/mock/complete/:id (calculates final score)
    ↓
View Results & Download Report
```

---

## 🔧 Backend Setup

### 1. Database Models

**MockInterview Collection** - Separate from Interview collection
- Student Info: name, rollNumber, college, email
- Interview Config: jobRole, experienceLevel, interviewType, difficulty
- Content: questions, answers, evaluations
- Results: overallScore, feedback
- Isolation: `type: "mock"` field ensures separation

### 2. API Endpoints

#### Start Interview
```
POST /api/mock/start
No authentication required
```

**Request:**
```json
{
  "studentName": "Rajesh Kumar",
  "rollNumber": "BIT2024001",
  "collegeName": "BITS Pilani",
  "email": "rajesh@example.com",
  "jobRole": "frontend",
  "experienceLevel": "junior",
  "interviewType": "technical",
  "difficultyLevel": "medium",
  "numberOfQuestions": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interviewId": "507f1f77bcf86cd799439011",
    "sessionId": "uuid",
    "questions": ["What is React?", "..."],
    "numberOfQuestions": 5,
    "attemptNumber": 1
  }
}
```

#### Submit Answer
```
POST /api/mock/answer
```

**Request:**
```json
{
  "interviewId": "507f1f77bcf86cd799439011",
  "questionIndex": 0,
  "answer": "React is a JavaScript library...",
  "format": "text" or "voice"
}
```

**Response:** Returns evaluation for that question
```json
{
  "data": {
    "evaluation": {
      "score": 7.5,
      "strengths": "Good explanation",
      "weaknesses": "Could add more examples",
      "suggestions": "Practice more",
      "modelAnswer": "React is..."
    }
  }
}
```

#### Complete Interview
```
POST /api/mock/complete/:interviewId
```

**Response:**
```json
{
  "data": {
    "overallScore": 7.2,
    "totalQuestions": 5,
    "evaluatedQuestions": 5,
    "duration": 1245,
    "overallFeedback": {
      "strengths": "...",
      "weaknesses": "...",
      "suggestions": "...",
      "interviewTips": "..."
    },
    "evaluations": [...]
  }
}
```

#### Get Results
```
GET /api/mock/result/:interviewId
```

#### Get History
```
GET /api/mock/history/:rollNumber?limit=10&skip=0
```

**Response:**
```json
{
  "data": {
    "totalAttempts": 3,
    "interviews": [
      {
        "jobRole": "frontend",
        "experienceLevel": "junior",
        "score": 7.5,
        "status": "completed",
        "completedAt": "2026-04-22T10:30:00Z",
        "duration": 1245,
        "attemptNumber": 3
      }
    ],
    "latestScore": 7.5,
    "latestAttempt": "2026-04-22T10:30:00Z"
  }
}
```

#### Get Statistics
```
GET /api/mock/stats/:rollNumber
```

---

## 🎨 Frontend Pages

### 1. PublicMockInterview (`/mock-interview`)
- Entry point for students
- Shows StudentRegistrationForm component
- Collects: name, roll number, college name, email (optional)
- Checks for previous attempts
- Displays history if available

### 2. MockInterview Setup (`/mock-interview-setup`)
- Configure interview parameters
- Select: job role, experience level, interview type, difficulty, number of questions
- Calls `POST /api/mock/start` to initialize interview
- Navigates to interview screen

### 3. PublicInterviewScreen (`/public-interview`)
- Main interview interface
- Auto-detects if mock interview via `isMockInterview` flag
- Features:
  - Question display
  - Timer (5 minutes per question)
  - Text/Voice answer input
  - Auto-saves answer via `POST /api/mock/answer`
  - Navigation (previous/next)
  - On last question: auto-completes via `POST /api/mock/complete`

### 4. MockInterviewResult (`/mock-interview-result/:id`)
- Displays comprehensive results
- Shows:
  - Overall score with circular progress
  - Overall feedback
  - Question-wise breakdown (expandable)
  - Model answers
- Actions:
  - Download report as text file
  - Take another interview
  - View history

---

## 📱 Student User Flow

### First-Time Student
```
1. Click "Start Mock Interview" (Home page)
2. Fill registration form (name, roll number, college)
3. System checks for previous attempts (none found)
4. Select interview config (job role, difficulty, etc.)
5. Answer 5 questions
6. View results
7. Download report
```

### Returning Student
```
1. Click "Start Mock Interview"
2. Fill registration form
3. System shows previous attempts with scores
4. Can view previous results OR start new interview
5. Continues from step 4 above
```

---

## 🔒 Data Isolation Strategy

### Isolation Layers

**1. Database Level**
```javascript
// Mock interviews only
MockInterview.find({ type: "mock", rollNumber: "..." })

// Real interviews only
Interview.find({ companyId: ..., type: { $ne: "mock" } })
```

**2. API Routes**
```javascript
// Mock: Public routes, no auth required
GET /api/mock/*

// Real: Protected routes, auth required
GET /api/interviews/*
```

**3. Frontend Storage**
```javascript
// Mock: Separate keys
localStorage.mockInterviewData
localStorage.isMockInterview = true

// Real: Different keys
localStorage.interviewData
localStorage.sessionLockId
```

**4. Schema Design**
- MockInterview has independent fields
- No foreign keys to company/recruiter data
- No shared evaluation logic

### Verification
- ✅ Mock queries ALWAYS filter by `type: "mock"`
- ✅ Mock APIs don't require company/user authentication
- ✅ Real interview logic unchanged
- ✅ No shared state between systems
- ✅ Roll number isolation within mock interviews

---

## 📦 Implementation Checklist

### Backend
- ✅ `MockInterview.js` schema created
- ✅ `mockController.js` with all CRUD operations
- ✅ `mock.js` routes with proper isolation
- ✅ Validation schemas for mock interviews
- ✅ Server integration (routes registered)
- ✅ AI integration (reuses existing groqService)

### Frontend
- ✅ `StudentRegistrationForm.jsx` component
- ✅ `PublicMockInterview.jsx` entry point
- ✅ Updated `MockInterview.jsx` to use APIs
- ✅ Updated `PublicInterviewScreen.jsx` for mock support
- ✅ `MockInterviewResult.jsx` results page
- ✅ Routing in `App.jsx`
- ✅ Navbar exceptions configured

### Integration
- ✅ StudentFormModal updated
- ✅ Data format consistency
- ✅ localStorage flags for isolation
- ✅ API endpoint URLs configured

---

## 🚀 Deployment Checklist

### Pre-Deployment
1. Test backend APIs with Postman/REST client
2. Test frontend flows end-to-end
3. Verify data isolation:
   - Mock data not visible to real interviews
   - Real data not accessible via mock APIs
4. Test edge cases:
   - Session timeout
   - Network failures (retry logic)
   - Empty history
   - Multiple rapid attempts

### Post-Deployment
1. Monitor API response times
2. Check error logs for any exceptions
3. Verify student data privacy
4. Monitor database indexes for performance
5. Set up alerts for rate limiting

---

## 🧪 Testing Guide

### Backend API Tests

```bash
# Start Interview
curl -X POST http://localhost:5000/api/mock/start \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Test Student",
    "rollNumber": "TEST001",
    "collegeName": "Test College",
    "jobRole": "frontend",
    "experienceLevel": "junior",
    "interviewType": "technical",
    "difficultyLevel": "medium",
    "numberOfQuestions": 5
  }'

# Submit Answer (use interviewId from above)
curl -X POST http://localhost:5000/api/mock/answer \
  -H "Content-Type: application/json" \
  -d '{
    "interviewId": "507f1f77bcf86cd799439011",
    "questionIndex": 0,
    "answer": "React is a JavaScript library for building UIs",
    "format": "text"
  }'

# Complete Interview
curl -X POST http://localhost:5000/api/mock/complete/507f1f77bcf86cd799439011

# Get History
curl http://localhost:5000/api/mock/history/test001

# Get Stats
curl http://localhost:5000/api/mock/stats/test001
```

### Frontend Tests
1. **Registration Flow**
   - Fill form with valid data ✓
   - Submit and check localStorage ✓
   - Check history fetch ✓

2. **Interview Flow**
   - Start interview (API called) ✓
   - Answer each question ✓
   - Navigate prev/next ✓
   - Auto-save on submit ✓

3. **Results Flow**
   - Results page loads ✓
   - All evaluations display ✓
   - Download report works ✓
   - Navigation links work ✓

4. **Data Isolation**
   - Mock data in separate collection ✓
   - Real interview unaffected ✓
   - No data leakage ✓

---

## 📊 Performance Metrics

### Targets
- API response time: < 2 seconds
- Question generation: < 5 seconds
- Answer evaluation: < 3 seconds
- Results page load: < 1 second
- Database query: < 100ms

### Monitoring
```javascript
// Log API performance
console.time('mock-interview-start');
// ... API call
console.timeEnd('mock-interview-start');
```

---

## 🔄 Maintenance

### Regular Tasks
- Monitor database indexes
- Check for stale sessions
- Review error logs weekly
- Update AI prompts if needed
- Archive old interviews (30+ days)

### Scaling Considerations
- Use database connection pooling
- Implement Redis cache for history
- Use CDN for static assets
- Rate limit API calls per roll number
- Batch question generation requests

---

## ❓ Troubleshooting

### Student Can't Start Interview
- ✓ Check if StudentInfo in localStorage
- ✓ Verify API endpoint is accessible
- ✓ Check browser console for errors
- ✓ Verify VITE_API_URL configured

### Answers Not Saving
- ✓ Check network tab in DevTools
- ✓ Verify `POST /api/mock/answer` returns 200
- ✓ Check fallback to localStorage
- ✓ Review backend logs

### Results Not Showing
- ✓ Verify interview completed (status = completed)
- ✓ Check if evaluations populated
- ✓ Verify interview ID in localStorage
- ✓ Check mock data in database

### Data Mixing Issues
- ✓ Verify queries filter by `type: "mock"`
- ✓ Check indexes are working
- ✓ Review timestamps and rollNumbers
- ✓ Check isolation at API level

---

## 📝 Future Enhancements

1. **Analytics Dashboard**
   - Score trends
   - Question difficulty analysis
   - Time spent per question
   - Common weak areas

2. **Advanced Features**
   - Live proctor for mock interviews
   - Code problem solving
   - Group interviews
   - Peer comparison (anonymized)

3. **Integration**
   - LinkedIn integration
   - Email notifications
   - SMS reminders
   - Slack integration

4. **Mobile App**
   - Native iOS/Android
   - Offline mode
   - Push notifications
   - Voice transcription improvements
