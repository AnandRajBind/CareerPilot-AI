# 🚀 CareerPilot AI Backend - START HERE

## Welcome! 👋

This is a **production-ready** Node.js + Express backend for the CareerPilot AI application.

## ⚡ Quick Start (30 seconds)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm run dev
   ```

3. **Test it's working**
   ```bash
   curl http://localhost:5000/api/health
   ```

That's it! Your backend is running on `http://localhost:5000`

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Detailed setup & testing guide |
| [README.md](./README.md) | Complete API documentation |
| [API_TEST_SUITE.js](./API_TEST_SUITE.js) | API test examples |

## 🎯 What's Included

✅ **User Authentication** - Registration, login, JWT tokens
✅ **User Management** - Profile CRUD operations
✅ **Interview Management** - Create, read, update, delete interviews
✅ **Security** - Bcrypt hashing, JWT auth, input validation, rate limiting
✅ **Database** - MongoDB integration with Mongoose
✅ **Error Handling** - Centralized error handler with structured responses
✅ **Code Quality** - ESLint configuration, production-ready code
✅ **Modular Architecture** - Controllers, services, routes, middleware

## 🌳 Project Structure

```
Server/
├── config/               # Database configuration
├── models/              # Data models (User, Interview)
├── controllers/         # Request handlers
├── routes/             # API endpoints
├── middleware/         # Auth & error handling
├── services/           # Business logic
├── utils/              # Helpers & validation
├── server.js           # Main entry point
├── package.json        # Dependencies
├── .env                # Environment variables
└── README.md           # Full documentation
```

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `DELETE /api/user/profile` - Delete account

### Interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews` - List interviews
- `GET /api/interviews/:id` - Get interview details
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

## 🧪 Testing

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Use the returned token for protected endpoints:
```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>"
```

## ⚙️ Configuration

The `.env` file is pre-configured for **development**. For production:

```bash
cp .env.example .env
# Edit .env with production values
```

Key variables:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - JWT signing key (change in production!)
- `CORS_ORIGIN` - Frontend URL
- `NODE_ENV` - Environment (development/production)

## 📚 Learning Resources

- `SETUP_GUIDE.md` - Step-by-step setup with examples
- `README.md` - Complete API documentation
- `API_TEST_SUITE.js` - Test examples and patterns
- Source code - Well-documented with clear patterns

## 🐛 Troubleshooting

**MongoDB connection error?**
```bash
# Start MongoDB locally
mongod
```

**Port already in use?**
```bash
# Use different port
PORT=5001 npm run dev
```

**Token expired?**
```bash
# Tokens expire after 7 days. Regenerate by logging in again
```

## 🚢 Deployment

Ready to deploy? See "Production Deployment" section in [README.md](./README.md)

## 📝 Next Steps

1. ✅ Get the backend running
2. ↳ Test API endpoints
3. ↳ Connect frontend client
4. ↳ Customize for your needs
5. ↳ Deploy to production

## 💡 Tips

- Use `npm run dev` during development (auto-reload with nodemon)
- Check `API_TEST_SUITE.js` for testing examples
- All errors have consistent JSON format
- Protected routes require `Authorization: Bearer <token>` header
- Passwords are hashed with bcrypt (cannot be retrieved)

## ✨ Features Highlights

- **Production-Ready** - Follows industry best practices
- **Secure** - JWT auth + bcrypt hashing + input validation
- **Scalable** - Modular architecture with separation of concerns
- **Well-Documented** - Clear code with comments
- **Error Handling** - Structured error responses
- **Database** - MongoDB with Mongoose ODM
- **Rate Limiting** - Protection against brute force attacks
- **CORS Enabled** - Ready for frontend integration

## 🤝 Support

- Check `README.md` for complete documentation
- Review `SETUP_GUIDE.md` for detailed setup help
- See `API_TEST_SUITE.js` for code examples

---

**Ready to get started?**

```bash
npm install && npm run dev
```

Happy coding! 🎉
