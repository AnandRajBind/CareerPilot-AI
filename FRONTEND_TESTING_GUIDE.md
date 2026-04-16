# Quick Start: Testing Frontend & Backend Integration

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB running
- Both servers should be ready to start

---

## Step 1: Start the Backend Server

```bash
cd "d:\CareerPilot AI\Server"
npm run dev
```

**Expected Output:**
```
✅ Server running on http://localhost:5000
✅ MongoDB connected
✅ API ready at http://localhost:5000/api
```

**Verify Backend is Running:**
```bash
curl http://localhost:5000/api/auth/login
# Should return: POST required or similar message (not "cannot GET")
```

---

## Step 2: Start the Frontend Server

In a **new terminal**:

```bash
cd "d:\CareerPilot AI\Client"
npm run dev
```

**Expected Output:**
```
✅ VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Step 3: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the CareerPilot AI home page.

---

## Step 4: Test Full Registration Flow

### 4.1 Go to Register Page
```
Click "Register" or go to: http://localhost:5173/register
```

### 4.2 Fill the Form

```
Contact Person Name: John Smith
Company Email:       john@company.com
Company Name:        Example Corp
Industry:            Technology (select from dropdown)
Password:            SecurePass123!
Confirm Password:    SecurePass123!
```

**Form Validation:**
- ✅ Name minimum 2 characters
- ✅ Valid email format
- ✅ Password minimum 6 characters
- ✅ Password with uppercase letter
- ✅ Password with number
- ✅ Company name 2-150 characters
- ✅ Industry selected

### 4.3 Submit Registration

Click **"Create account"** button.

**Expected Sequence:**
1. Button shows loading spinner
2. API call sent to: `POST /api/auth/register`
3. After 1-2 seconds: Success message appears
   ```
   "Your 3-day trial has started."
   ```
4. Form clears automatically
5. After 2 more seconds: Redirected to login page

### 4.4 Verify Backend Response

**Check Backend Logs:**
```
POST /api/auth/register 201
Response includes:
- company object
- JWT token
- trial dates (3 days from now)
```

**Check Browser Storage:**
```
F12 → Application → LocalStorage → http://localhost:5173

Keys should exist:
✓ token (JWT token string)
✓ company (JSON object with company data)
✓ trialStatus (empty until login)
```

---

## Step 5: Test Login Flow

### 5.1 You Should Be on Login Page
```
URL: http://localhost:5173/login
```

### 5.2 Enter Credentials
```
Email:    john@company.com
Password: SecurePass123!
```

### 5.3 Click "Sign in"

**Expected Sequence:**
1. Loading spinner on button
2. API call to: `POST /api/auth/login`
3. Success response received
4. Redirected to: `http://localhost:5173/dashboard`

### 5.4 Verify Dashboard

You should see:
```
┌─────────────────────────────┐
│ Example Corp                │
│ Interview Management Dashboard
│ ✅ Free Trial Active - 3 days remaining
│                             │
│ Total Interviews: 0         │
│ Average Score: 0/100        │
│ Best Score: 0/100           │
│ Improvement: 0%             │
└─────────────────────────────┘
```

### 5.5 Check Navbar

Top navigation should show:
```
CareerPilot | [Dashboard] [Start Interview]
            | Example Corp
            | Trial: 3 days left
```

---

## Step 6: Test Dashboard Features

### 6.1 Test Tabs

Click each tab:
- **Overview** - Shows company welcome and stats
- **Analytics** - Shows performance charts (empty, no interviews yet)
- **History** - Shows interview list (empty, no interviews yet)
- **Profile** - Shows company details:
  ```
  Avatar: E (first letter of Example Corp)
  Name: Example Corp
  Email: john@company.com
  Industry: Technology
  Join Date: April 9, 2026
  ```

### 6.2 Start an Interview

Click **"Start First Interview"** button:
- Should be taken to interview system
- Interview system should work normally
- Company authentication should work transparently

---

## Step 7: Test Logout

### 7.1 Click Logout
- Find logout button (in menu or navbar)
- Click **"Logout"**

**Expected Results:**
- Redirected to login page
- LocalStorage cleared:
  - ✓ token removed
  - ✓ company removed
  - ✓ trialStatus removed

### 7.2 Try to Access Dashboard Without Login
```
Type in URL: http://localhost:5173/dashboard
Press Enter
```

**Expected Results:**
- Redirected back to `/login`
- Protection working ✅

---

## Step 8: Test Logout → Login Again

### 8.1 Login Again
```
Go to http://localhost:5173/login
Enter the same credentials:
  Email:    john@company.com
  Password: SecurePass123!
```

### 8.2 Verify Data Persistence
```
Dashboard should show:
- Same company name
- Same trial status
- Any new interviews would show here
```

---

## Testing Interview System

### Prerequisites
- Already logged in as a company
- On the dashboard

### Steps

1. **Click "Start Interview"** or go to `/interview-mode`
2. Complete systems check
3. Start interview
4. Answer 5 practice questions
5. Submit all answers
6. Get interview results

**Expected Results:**
- Interview taken as company
- Results saved to company profile
- Results visible in Dashboard → History tab
- Stats updated in Dashboard → Overview tab

---

## Testing Multiple Companies

### Create a Second Company

**Step 1: Logout**
```
Click Logout button
```

**Step 2: Register New Company**
```
Go to http://localhost:5173/register
Fill form:
  Name: Jane Doe
  Email: jane@startup.com
  Company: StartupXYZ
  Industry: Finance
  Password: AnotherPass123!
```

**Step 3: Login as New Company**
```
Email: jane@startup.com
Password: AnotherPass123!
```

**Expected Results:**
- Second company profile shows different data
- Interviews are separate from first company
- Each company sees only their own data

---

## Troubleshooting

### Issue: "Cannot connect to server"
```
❌ Error: Failed to fetch
```

**Solution:**
```
1. Check if backend server is running (Step 1)
2. Verify port 5000 is correct
3. Check VITE_API_URL in .env file
4. Refresh page: Ctrl+F5 (hard refresh)
```

### Issue: "Email already in use"
```
✓ This is expected if you registered twice
```

**Solution:**
```
Use a different email address
Or drop the database and start fresh
```

### Issue: "Redirect is looping"
```
❌ Stuck in login → dashboard → login
```

**Solution:**
```
1. Open DevTools (F12)
2. Check console for errors
3. Check Application → LocalStorage
4. Try clearing storageand refreshing
```

### Issue: "Trial message not showing on login"
```
✓ Correct - trial message only shows on registration
```

**On Login:**
- You should see in navbar: "Trial: 3 days left"
- On Dashboard: Trial banner at top

### Issue: "Navbar not showing company name"
```
❌ MyNavbar shows welcome guest instead
```

**Solution:**
```
1. Verify company is in localStorage
2. Check browser console for errors
3. Try logout + login again
4. Refresh page
```

---

## API Response Examples

### Success: Registration

```json
{
  "success": true,
  "data": {
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Smith",
      "email": "john@company.com",
      "companyName": "Example Corp",
      "industry": "technology",
      "plan": "free",
      "trialStartDate": "2026-04-09T10:00:00.000Z",
      "trialEndDate": "2026-04-12T10:00:00.000Z",
      "isTrialActive": true,
      "createdAt": "2026-04-09T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Company registered successfully. Trial period activated for 3 days."
  }
}
```

### Success: Login

```json
{
  "success": true,
  "data": {
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Smith",
      "email": "john@company.com",
      "companyName": "Example Corp",
      "industry": "technology",
      "plan": "free",
      "trialStartDate": "2026-04-09T10:00:00.000Z",
      "trialEndDate": "2026-04-12T10:00:00.000Z",
      "isTrialActive": true,
      "createdAt": "2026-04-09T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "trialStatus": {
      "isActive": true,
      "daysRemaining": 3
    }
  }
}
```

### Error: Invalid Credentials

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Browser Developer Tools

### Check Network Requests

1. Open DevTools: **F12**
2. Go to **Network** tab
3. Refresh page
4. Register or login
5. Look for requests to: `/api/auth/register` or `/api/auth/login`

**Should See:**
- Status: **201** (registration) or **200** (login)
- Response: Company data + token
- Time: Usually < 500ms

### Check LocalStorage

1. Open DevTools: **F12**
2. Go to **Application** tab
3. Click **LocalStorage**
4. Select your site URL
5. Should see:
   ```
   token: "eyJhbGciOi..."
   company: "{"_id":"...","name":"John Smith"..."
   trialStatus: "{\"isActive\":true,\"daysRemaining\":3}"
   ```

### Check Console for Errors

1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for any red error messages
4. If errors, click to see details

---

## Summary

✅ **Backend running** → Port 5000
✅ **Frontend running** → Port 5173
✅ **Registration working** → Company created, trial started
✅ **Login working** → Redirects to dashboard
✅ **Dashboard shows** → Company name + trial status
✅ **Protected routes** → Only accessible when logged in
✅ **Logout working** → Clears storage, redirects to login
✅ **Interview system** → Works transparently with company auth

---

## Next Steps

1. **Test Complete Interview Flow**
   - Login as company
   - Take an interview
   - See results in dashboard

2. **Test Multiple Companies**
   - Create second company
   - Verify isolated data

3. **Test Edge Cases**
   - Wrong email/password
   - Expired tokens
   - Rapid requests
   - Network failures

4. **Verify Trial Logic**
   - Check trial countdown daily
   - Ensure trial validation on backend
   - Test expired trial scenarios

---

## Production Deployment

Before deploying:

```bash
cd Client
npm run build
# Creates dist/ folder for deployment

cd Server
# Set up environment variables:
# NODE_ENV=production
# MONGODB_URI=your_production_db
# JWT_SECRET=strong_secret_key
# VITE_API_URL=https://api.careerpilot.com

npm start
# Runs production build
```

---

**Ready to Test? Let's Go! 🚀**
