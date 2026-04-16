# Next Steps: Implementing Company-First SaaS

## Phase 2: Frontend & Dashboard Development

The authentication refactoring is **complete and production-ready**. Here's what comes next:

---

## 1. Update Registration Form (Client-Side)

### Current Form Fields
```javascript
name: "company name contact person"
email: "company email"
password: "password"
confirmPassword: "confirm password"
```

### Add These Fields
```javascript
+ companyName: "Your Company Name"     // e.g., "TechCorp Inc"
+ industry: "Select Industry"           // Dropdown with options
```

### Industry Options (From Validation)
- `technology`
- `finance`
- `healthcare`
- `retail`
- `manufacturing`
- `education`
- `other`

### Updated Registration Payload
```javascript
{
  "name": "John Smith",              // Contact person name
  "email": "john@techcorp.com",      // Company email
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "companyName": "TechCorp Inc",     // NEW
  "industry": "technology"            // NEW
}
```

### Form Component Location
- File: `Client/src/pages/Register.jsx`
- Change required: Add 2 form fields
- Validation: Use existing form validation logic

---

## 2. Display Trial Status After Login

### Login Response Now Includes
```javascript
{
  "success": true,
  "data": {
    "company": {
      "_id": "...",
      "name": "John Smith",
      "email": "john@techcorp.com",
      "companyName": "TechCorp Inc",
      "industry": "technology",
      "plan": "free",
      "isTrialActive": true,
      "trialStartDate": "2026-04-09T...",
      "trialEndDate": "2026-04-12T..."
    },
    "token": "eyJhbGciOi...",
    "trialStatus": {
      "isActive": true,
      "daysRemaining": 3              // NEW!
    }
  }
}
```

### Show on Dashboard
After login, display:
```
✅ Free Trial Active - 3 days remaining
```

Or build a card showing:
- Trial starts: April 9, 2026
- Trial ends: April 12, 2026
- Days left: 3
- Plan: Free

---

## 3. Update Navbar (Optional)

### Currently Shows
```javascript
Welcome, [user name]
```

### Update To
```javascript
Welcome, [company name]
Trial: [days remaining] days left
```

### File Location
- `Client/src/components/Navbar.jsx`

---

## 4. Create Company Dashboard (Optional but Recommended)

### Dashboard Pages to Add

1. **Overview**
   - Company info
   - Trial status
   - Plan details
   - CTA to upgrade

2. **Interview History**
   - All company interviews
   - Status (pending, completed, etc)
   - Results links

3. **Settings**
   - Company name
   - Industry
   - Contact email

### Routes to Add
```javascript
/dashboard/overview
/dashboard/interviews
/dashboard/settings
```

### Backend Endpoints Already Ready
```
GET /api/user/profile            // Get company info
PUT /api/user/profile            // Update company info
GET /api/interviews              // Get all company interviews
GET /api/interviews/:id          // Get interview details
```

---

## 5. Database Migration (If Needed)

### You Have Two Options

#### Option A: Start Fresh (Recommended for Testing)
1. Delete MongoDB database
2. Re-register companies in new system
3. New interviews created with companyId

#### Option B: Migrate Existing Data (Production)
If you have existing users/interviews:
```javascript
// MongoDB migration script
db.users.updateMany(
  {},
  [
    {
      $set: {
        _t: "Company",
        companyName: "$name",
        industry: "other",
        plan: "free",
        trialStartDate: new Date("2026-04-09"),
        trialEndDate: new Date("2026-04-12"),
        isTrialActive: true
      }
    }
  ]
);

db.interviews.updateMany(
  {},
  [{ $set: { companyId: "$userId" } }]
);
```

---

## 6. Environment Variables (No Changes Needed)

Your existing `.env` file continues to work:
```
MONGODB_URI=...
JWT_SECRET=...
GROQ_API_KEY=...
```

No new environment variables required.

---

## 7. Testing Checklist

### Before Going Live

- [ ] Register a new company
  - [ ] All fields accepted
  - [ ] Password hashing works
  - [ ] Trial dates calculated correctly

- [ ] Login with company credentials
  - [ ] JWT token generated
  - [ ] Trial status shows correct days remaining

- [ ] Use interview system
  - [ ] Start interview (creates with companyId)
  - [ ] Answer questions (works as before)
  - [ ] Get results (filtered by company)

- [ ] Try old student account (backward compat)
  - [ ] Old login still works (if not deleted)
  - [ ] req.user backwards compatible
  - [ ] Interview flow unaffected

### Manual Testing Commands

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Smith",
    "email":"company@example.com",
    "password":"Pass123456",
    "companyName":"Example Corp",
    "industry":"technology",
    "confirmPassword":"Pass123456"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"company@example.com",
    "password":"Pass123456"
  }'
```

---

## 8. Interview Features Stay Unchanged

All existing functionality works:
- ✅ Interview controller uses req.company (was req.user)
- ✅ Interview model uses companyId (was userId)
- ✅ Interview routes work without changes
- ✅ Speech recognition works
- ✅ Video recording works
- ✅ Results calculation works

**No changes needed to interview code.**

---

## 9. Timeline Recommendation

### Week 1: Frontend Updates
- Add companyName, industry fields to registration
- Update dashboard to show trial status
- Test registration/login flow

### Week 2: Dashboard Development
- Build company overview page
- Build interview history page
- Add company settings page

### Week 3: Polish & Deployment
- Final testing
- Performance optimization
- Deploy to production

---

## 10. Questions & Troubleshooting

### Q: Do I need to update the interview component?
**A:** No. It uses `req.user` which is aliased to `req.company`. No changes needed.

### Q: What happens after the 3-day trial expires?
**A:** Currently, `isTrialActive` becomes false. You can add paid plan logic later.

### Q: Can I change the trial period?
**A:** Yes. In `Server/services/authService.js`, change:
```javascript
const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
// Change 3 to any number of days
```

### Q: Can I have multiple contacts per company?
**A:** Currently, one registration = one company account. Extend later by adding a `contacts` array to Company model.

### Q: What about company domain verification?
**A:** Can be added later. Currently, any email is accepted.

---

## Files Ready for Update

### Frontend Changes Needed
- `Client/src/pages/Register.jsx` - Add form fields
- `Client/src/pages/Login.jsx` - Display trial status
- `Client/src/components/Navbar.jsx` - Show company/trial info

### Frontend Changes Optional
- `Client/src/pages/Dashboard.jsx` - Enhance with company features
- New file: `Client/src/pages/CompanyDashboard.jsx`
- New file: `Client/src/components/TrialStatusCard.jsx`

### Backend Ready (No Changes)
- ✅ `Server/models/Company.js` (formerly User.js)
- ✅ `Server/services/authService.js`
- ✅ `Server/controllers/authController.js`
- ✅ All interview features

---

## Summary

**Backend**: ✅ Complete and tested
**Frontend**: ⏳ Ready for form field updates
**Dashboard**: 🔜 Ready to build
**Interview System**: ✅ Fully compatible

You can start with minimal frontend updates and progressively build more features.

---

**Questions? Let me know what you'd like to tackle next! 🚀**
