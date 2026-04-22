require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const { initializeCronJobs } = require("./utils/cronJobs"); // Production cron jobs

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const interviewRoutes = require("./routes/interview");
const templateRoutes = require("./routes/template");
const streamRoutes = require("./routes/stream");
const mockRoutes = require("./routes/mock");

const app = express();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter);

// CORS configuration - Allow specific origins for development and production
const allowedOrigins = [
  "http://localhost:5173",           // Vite dev server (local development)
  "http://localhost:3000",           // Alternative local dev port
  "https://perekrut-ai.vercel.app",  // Production Vercel domain
];

// In development, allow preview/draft deployments from Vercel
if (NODE_ENV === "development") {
  allowedOrigins.push(/\.vercel\.app$/); // Regex pattern for any Vercel preview deployment
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowedOrigins array
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return origin === allowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,           // Allow cookies/auth headers
  optionsSuccessStatus: 200,  // For legacy browsers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);

// Public Routes (No Authentication Required)
app.use("/api/mock", mockRoutes); // Mock interviews - public access

// Protected Routes (Authentication Required)
app.use("/api/user", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/company/interviews", templateRoutes);
app.use("/api/interview", templateRoutes);
app.use("/api/stream", streamRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      path: req.originalUrl,
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();

    // Initialize production cron jobs
    initializeCronJobs();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║        CareerPilot AI Backend Server Started          ║
╠═══════════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(40)}  ║
║ Port: ${PORT.toString().padEnd(48)}    ║
║ CORS Origin: ${(process.env.CORS_ORIGIN || "http://localhost:3000").padEnd(40)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();

module.exports = app;
