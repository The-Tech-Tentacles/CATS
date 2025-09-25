const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import configuration and utilities
const config = require("./config");
const { testConnection } = require("./config/database");
const { requestLogger, errorLogger } = require("./utils/logger");

// Import middleware
const {
  generalRateLimit,
  securityHeaders,
  sqlInjectionProtection,
  xssProtection,
  suspiciousActivityDetection,
  requestSizeLimit,
} = require("./middleware/security");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const complaintRoutes = require("./routes/complaints");
const applicationRoutes = require("./routes/applications");
const evidenceRoutes = require("./routes/evidence");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");

// Create Express application
const app = express();

// Trust proxy if configured
if (config.server.trustProxy) {
  app.set("trust proxy", 1);
}

// Security headers
app.use(securityHeaders);

// CORS configuration
app.use(
  cors({
    origin: config.security.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
    ],
  })
);

// Compression middleware
app.use(compression());

// Request logging
if (config.server.env !== "test") {
  app.use(morgan("combined"));
  app.use(requestLogger);
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request size limiting
app.use(requestSizeLimit("10mb"));

// Security middleware
app.use(sqlInjectionProtection);
app.use(xssProtection);
app.use(suspiciousActivityDetection);

// Rate limiting
app.use(generalRateLimit);

// Static file serving for uploads (with security)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "1d",
    etag: false,
    setHeaders: (res, path) => {
      // Security headers for static files
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CATS Backend is running",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: config.server.env,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

// API documentation route
app.get("/api/docs", (req, res) => {
  res.json({
    success: true,
    message: "CATS API Documentation",
    version: "1.0.0",
    endpoints: {
      authentication: {
        "POST /api/auth/register": "User registration",
        "POST /api/auth/login": "User login",
        "POST /api/auth/refresh": "Refresh access token",
        "POST /api/auth/logout": "User logout",
        "POST /api/auth/forgot-password": "Request password reset",
        "POST /api/auth/reset-password": "Reset password",
      },
      complaints: {
        "GET /api/complaints": "List complaints",
        "POST /api/complaints": "Submit complaint",
        "GET /api/complaints/:id": "Get complaint details",
        "PUT /api/complaints/:id": "Update complaint",
        "POST /api/complaints/:id/evidence": "Upload evidence",
        "GET /api/complaints/:id/timeline": "Get complaint timeline",
      },
      applications: {
        "GET /api/applications": "List applications",
        "POST /api/applications": "Submit application",
        "GET /api/applications/:id": "Get application details",
        "PUT /api/applications/:id": "Update application",
      },
      admin: {
        "GET /api/admin/dashboard": "Admin dashboard",
        "GET /api/admin/users": "Manage users",
        "GET /api/admin/reports": "Generate reports",
        "GET /api/admin/settings": "System settings",
      },
      public: {
        "GET /api/public/complaint-types": "Get complaint types",
        "GET /api/public/statistics": "Public statistics",
        "POST /api/public/anonymous-complaint": "Submit anonymous complaint",
      },
    },
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorLogger);
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  // Don't leak error details in production
  const isDevelopment = config.server.env === "development";

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(isDevelopment && {
      stack: error.stack,
      details: error,
    }),
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log("HTTP server closed.");

    // Close database connections
    require("./models")
      .sequelize.close()
      .then(() => {
        console.log("Database connections closed.");
        process.exit(0);
      })
      .catch((error) => {
        console.error("Error closing database connections:", error);
        process.exit(1);
      });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Skip database sync in production - tables should already be created
    console.log("✅ Database connection verified");

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      console.log(
        `🚀 CATS Backend server running on port ${config.server.port}`
      );
      console.log(`📝 Environment: ${config.server.env}`);
      console.log(
        `🔗 Health check: http://localhost:${config.server.port}/health`
      );
      console.log(
        `📚 API docs: http://localhost:${config.server.port}/api/docs`
      );
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
