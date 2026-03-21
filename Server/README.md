# CareerPilot AI - Backend Server

Production-ready Node.js + Express backend for the CareerPilot AI full-stack application.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

## 📁 Project Structure

```
Server/
├── config/               # Configuration files
│   └── database.js      # MongoDB connection
├── models/              # Mongoose schemas
│   ├── User.js         # User schema
│   └── Interview.js    # Interview schema
├── controllers/         # Route controllers
│   ├── authController.js
│   ├── userController.js
│   └── interviewController.js
├── routes/             # API routes
│   ├── auth.js
│   ├── user.js
│   └── interview.js
├── middleware/         # Express middleware
│   ├── auth.js        # JWT authentication
│   └── errorHandler.js # Centralized error handling
├── services/          # Business logic
│   └── authService.js
├── utils/             # Utility functions
│   ├── validation.js  # Input validation schemas
│   └── errorBuilder.js # Error handling utilities
├── server.js          # Main server entry point
├── package.json       # Dependencies
├── .env.example       # Environment variables template
└── .gitignore        # Git ignore rules
```

## ⚙️ Installation

### Prerequisites

- Node.js v16 or higher
- MongoDB running locally or a connection string to MongoDB Atlas

### Steps

1. **Clone the repository**
   ```bash
   cd CareerPilot\ AI/Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Ensure MongoDB is running locally, or update `MONGODB_URI` in `.env` with your MongoDB Atlas connection string

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/careerpilot-ai
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=10
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /health
```

### Authentication Routes
```
POST   /auth/register      - User registration
POST   /auth/login         - User login
POST   /auth/logout        - User logout (requires token)
```

### User Routes
```
GET    /user/profile       - Get user profile (requires token)
PUT    /user/profile       - Update user profile (requires token)
DELETE /user/profile       - Delete user account (requires token)
```

### Interview Routes
```
POST   /interviews         - Create new interview (requires token)
GET    /interviews         - Get all user interviews (requires token)
GET    /interviews/:id     - Get specific interview (requires token)
PUT    /interviews/:id     - Update interview (requires token)
DELETE /interviews/:id     - Delete interview (requires token)
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register** - Get a token by creating a new account
2. **Login** - Get a token with email and password
3. **Protected Routes** - Include token in Authorization header:
   ```
   Authorization: Bearer <token>
   ```

## 📊 Database Models

### User Schema
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password using bcrypt
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Interview Schema
- `userId` - Reference to User
- `role` - Job role for interview
- `mode` - Interview mode (text, video, audio)
- `questions` - Array of interview questions
- `answers` - Array of user answers
- `scores` - Technical, communication, confidence, overall scores
- `feedback` - Interview feedback
- `status` - in-progress, completed, failed
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## 🛡️ Security Features

- **Password Hashing** - bcryptjs with configurable rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Joi schema validation
- **Helmet** - Security headers
- **CORS** - Configurable cross-origin requests
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Error Handling** - Centralized error handler
- **Database Indexing** - Optimized queries

## ✅ Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## 📝 Validation

All inputs are validated using Joi schemas:
- Email format validation
- Password minimum length (6 characters)
- Name length limits
- Role and mode validation for interviews
- Score ranges (0-100)

## 🧪 Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

## 🚢 Production Deployment

1. **Update environment variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=<your-secure-random-secret>
   MONGODB_URI=<your-production-mongodb-uri>
   CORS_ORIGIN=<your-frontend-domain>
   ```

2. **Install dependencies in production mode**
   ```bash
   npm ci --omit=dev
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Use a process manager** (PM2, Forever, etc.)
   ```bash
   pm2 start server.js --name "careerpilot-api"
   ```

## 📦 Dependencies

- **Production:**
  - express - Web framework
  - mongoose - MongoDB ODM
  - bcryptjs - Password hashing
  - jsonwebtoken - JWT generation
  - cors - CORS handling
  - joi - Input validation
  - dotenv - Environment variables
  - helmet - Security headers
  - express-rate-limit - Rate limiting

- **Development:**
  - nodemon - Auto-reload
  - jest - Testing framework
  - eslint - Code linting

## 🤝 API Response Format

All endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGc..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

## 📋 HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 Pagination

List endpoints support pagination:

```
GET /api/interviews?page=1&limit=10
```

Response includes pagination info:
```json
{
  "success": true,
  "data": {
    "interviews": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

## 📞 Support

For issues or questions, please refer to the main project documentation.

## ⚖️ License

ISC
