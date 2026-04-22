# Quick Reference - Mock Interview System

## Environment Variables Required

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key  # For AI question generation and evaluation
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000  # Backend API URL
```

---

## Files Changed/Created

### New Files Created (11)
```
Server/
  ├── models/MockInterview.js         # Database schema
  ├── controllers/mockController.js   # API logic
  └── routes/mock.js                  # API routes

Client/
  ├── components/StudentRegistrationForm.jsx
  ├── pages/PublicMockInterview.jsx
  ├── pages/MockInterviewResult.jsx
```

### Files Modified (6)
```
Server/
  ├── server.js                       # Added mock routes
  └── utils/validation.js             # Added validation schemas

Client/
  ├── App.jsx                         # Added routing
  ├── pages/MockInterview.jsx         # Changed to use APIs
  ├── pages/PublicInterviewScreen.jsx # Added mock support
  └── components/StudentFormModal.jsx # Updated navigation
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/mock/start` | No | Create new mock interview |
| POST | `/api/mock/answer` | No | Submit and evaluate answer |
| POST | `/api/mock/complete/:id` | No | Complete interview |
| GET | `/api/mock/result/:id` | No | Get interview results |
| GET | `/api/mock/history/:rollNumber` | No | Get student history |
| GET | `/api/mock/stats/:rollNumber` | No | Get student statistics |

---

## Database Indexes

```javascript
// Created automatically by schema:
mockInterviewSchema.index({ rollNumber: 1, createdAt: -1 });
mockInterviewSchema.index({ rollNumber: 1, status: 1 });
mockInterviewSchema.index({ type: 1 });
```

---

## Frontend Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/mock-interview` | PublicMockInterview | Student registration |
| `/mock-interview-setup` | MockInterview | Configure interview |
| `/public-interview` | PublicInterviewScreen | Take interview |
| `/mock-interview-result/:id` | MockInterviewResult | View results |

---

## Key Features Implemented

### ✅ Automatic Answer Saving
- Answer auto-saves when student clicks "Next"
- API call: `POST /api/mock/answer`
- Fallback to localStorage if API fails

### ✅ Auto-Complete on Last Question
- Automatically calls `POST /api/mock/complete`
- Shows results page with score and feedback
- No manual submission needed

### ✅ Real-time AI Evaluation
- Each answer evaluated immediately
- Score shown during review
- Feedback: strengths, weaknesses, suggestions, model answer

### ✅ Student Tracking
- Roll number as primary identifier
- Automatic history retrieval
- Previous attempt scores shown

### ✅ Complete Data Isolation
- Mock collection separate from real interviews
- No shared state or data mixing
- Type field ensures separation

---

## Testing Scenarios

### Scenario 1: First-Time Student
```
1. Home page → "Start Mock Interview"
2. Fill: Name, Roll Number, College
3. No history found
4. Configure: Frontend role, Junior, Technical, Medium, 5 questions
5. Answer 5 questions
6. Auto-complete and view results
```

### Scenario 2: Returning Student
```
1. Home page → "Start Mock Interview"
2. Fill same details
3. History shows: 2 previous attempts with scores
4. Option to view previous results
5. Option to take new interview
6. Continues from step 4 of Scenario 1
```

### Scenario 3: Network Failure
```
1. During interview, disconnect internet
2. Answer submitted (fails to save to API)
3. Falls back to localStorage
4. Shows offline warning (optional enhancement)
5. Reconnects, resync happens
```

### Scenario 4: Evaluation Failure
```
1. Answer submitted
2. API evaluation fails
3. Interview continues (graceful degradation)
4. Final score calculated from successful evaluations
5. Shows what was evaluated and what failed
```

---

## Data Format Reference

### Student Info (localStorage)
```javascript
{
  studentName: "Rajesh Kumar",
  rollNumber: "BIT2024001",
  collegeName: "BITS Pilani",
  email: "rajesh@example.com"
}
```

### Interview Data (localStorage)
```javascript
{
  studentName: "...",
  rollNumber: "...",
  jobRole: "frontend",
  experienceLevel: "junior",
  interviewType: "technical",
  difficultyLevel: "medium",
  numberOfQuestions: 5,
  interviewId: "507f1f77bcf86cd799439011",
  sessionId: "uuid-1234",
  questions: ["What is React?", "..."],
  interviewStartTime: "2026-04-22T10:00:00Z"
}
```

### Answer Format (storage)
```javascript
{
  [questionIndex]: {
    content: "React is a JavaScript library...",
    format: "text" or "voice",
    submittedAt: "2026-04-22T10:05:00Z"
  }
}
```

### Evaluation Result
```javascript
{
  questionIndex: 0,
  score: 7.5,
  strengths: "Good explanation of basics",
  weaknesses: "Could add lifecycle hooks",
  suggestions: "Study React hooks in detail",
  modelAnswer: "React is a JavaScript library..."
}
```

---

## Configuration Details

### Job Roles Available
- frontend
- backend
- fullstack
- java
- python
- data-science
- hr

### Experience Levels
- junior (0-3 years)
- mid (3-5 years)
- senior (5+ years)

### Interview Types
- technical
- behavioral
- all (mixed)

### Difficulty Levels
- easy
- medium
- hard

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on `/api/mock/start` | Routes not registered | Check server.js imports mock routes |
| Answers not saving | API URL incorrect | Verify VITE_API_URL env var |
| History empty for returning user | Query filtering wrong | Check rollNumber lowercase |
| Results not showing | Interview not completed | Check completion API response |
| Evaluation missing | AI service timeout | Check Groq API key and quota |

---

## Performance Tips

1. **Caching**
   - Cache student history for 5 minutes
   - Cache questions during interview session

2. **Optimization**
   - Lazy load result page components
   - Batch question generation calls
   - Use database indexes effectively

3. **Monitoring**
   - Log API response times
   - Monitor database query performance
   - Track evaluation success rate

---

## Security Considerations

✅ **Implemented**
- No sensitive data in localStorage beyond session
- API keys not exposed client-side
- Roll number as identifier (not email/ID number)
- Input validation on all APIs
- CORS properly configured

⚠️ **To Consider**
- Rate limiting per roll number
- CAPTCHA for registration
- IP-based restrictions
- Data encryption at rest

---

## Rollback Plan

If issues arise:

1. **Database Issues**
   ```
   - Drop MockInterview collection
   - Redeploy schema
   - Re-run migrations
   ```

2. **API Issues**
   ```
   - Revert mockController.js
   - Revert mock.js routes
   - Clear API cache/CDN
   ```

3. **Frontend Issues**
   ```
   - Revert PublicInterviewScreen.jsx
   - Revert App.jsx routing
   - Clear browser cache
   ```

---

## Support & Debugging

### Enable Debug Logging
```javascript
// Add to components
localStorage.setItem('DEBUG', 'true');
console.log('Interview State:', localStorage.mockInterviewData);
console.log('Answers:', localStorage.interviewAnswers);
```

### API Debugging
```bash
# Check API is running
curl http://localhost:5000/api/health

# Test mock endpoint
curl -X POST http://localhost:5000/api/mock/start \
  -H "Content-Type: application/json" \
  -d '{"studentName":"Test","rollNumber":"TEST","collegeName":"Test","jobRole":"frontend","experienceLevel":"junior","interviewType":"technical","difficultyLevel":"medium","numberOfQuestions":5}'
```

### Database Debugging
```javascript
// Verify collections
db.collections

// Check mock interviews
db.mockinterviews.find({type: "mock"}).pretty()

// Check specific student
db.mockinterviews.find({rollNumber: "bit2024001"}).pretty()
```
