const express = require("express")
const path = require("path")
require("dotenv").config()

const app = express()

// Basic error handling
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err)
  process.exit(1)
})

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err)
  process.exit(1)
})

// Check required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "SESSION_SECRET"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("❌ Missing environment variables:", missingEnvVars)
  console.log("📝 Please create .env file with required variables")
  process.exit(1)
}

// Import modules with error handling
let mongoose, session, MongoStore, flash, helmet, morgan, compression, cors

try {
  mongoose = require("mongoose")
  session = require("express-session")
  MongoStore = require("connect-mongo")
  flash = require("express-flash")
  helmet = require("helmet")
  morgan = require("morgan")
  compression = require("compression")
  cors = require("cors")
  console.log("✅ All required modules loaded successfully")
} catch (error) {
  console.error("❌ Error loading modules:", error.message)
  console.log("📦 Please run: npm install")
  process.exit(1)
}

// Import routes with error handling
let authRoutes, userRoutes, adminRoutes
let isAuthenticated, isAdmin, setLocals

try {
  const fs = require("fs")

  if (fs.existsSync("./src/routes/auth.js")) {
    authRoutes = require("./src/routes/auth")
  } else {
    console.log("⚠️ Auth routes not found, creating basic routes...")
  }

  if (fs.existsSync("./src/routes/user.js")) {
    userRoutes = require("./src/routes/user")
  }

  if (fs.existsSync("./src/routes/admin.js")) {
    adminRoutes = require("./src/routes/admin")
  }

  if (fs.existsSync("./src/middleware/auth.js")) {
    const authMiddleware = require("./src/middleware/auth")
    isAuthenticated = authMiddleware.isAuthenticated
    isAdmin = authMiddleware.isAdmin
  }

  if (fs.existsSync("./src/middleware/locals.js")) {
    const localsMiddleware = require("./src/middleware/locals")
    setLocals = localsMiddleware.setLocals
  }
} catch (error) {
  console.error("❌ Error loading routes/middleware:", error.message)
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
  }),
)

// CORS
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Compression
app.use(compression())

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use(express.static(path.join(__dirname, "public")))

// View engine setup
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/ejs_auth_db",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Flash messages
app.use(flash())

// Global locals middleware
if (setLocals) {
  app.use(setLocals)
} else {
  app.use((req, res, next) => {
    res.locals.appName = process.env.APP_NAME || "EJS Auth System"
    res.locals.appUrl = process.env.APP_URL || "http://localhost:3000"
    res.locals.currentYear = new Date().getFullYear()
    res.locals.currentUrl = req.originalUrl
    res.locals.user = req.session?.user || null
    res.locals.isAuthenticated = !!req.session?.user
    res.locals.messages = {
      success: req.flash("success"),
      error: req.flash("error"),
      info: req.flash("info"),
      warning: req.flash("warning"),
    }
    next()
  })
}

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ejs_auth_db")
  .then(() => {
    console.log("✅ MongoDB ga ulanish muvaffaqiyatli")
  })
  .catch((err) => {
    console.error("❌ MongoDB ulanish xatoligi:", err.message)
    console.log("🔧 MongoDB ishga tushirilganligini tekshiring")
  })

// Routes
if (authRoutes) {
  app.use("/auth", authRoutes)
} else {
  app.get("/auth/login", (req, res) => {
    res.render("pages/auth/login", {
      title: "Kirish",
      returnUrl: req.query.returnUrl || "/profile",
    })
  })

  app.get("/auth/register", (req, res) => {
    res.render("pages/auth/register", {
      title: "Ro'yxatdan o'tish",
    })
  })

  app.post("/auth/login", (req, res) => {
    req.flash("error", "Auth controller hali sozlanmagan")
    res.redirect("/auth/login")
  })

  app.post("/auth/register", (req, res) => {
    req.flash("error", "Auth controller hali sozlanmagan")
    res.redirect("/auth/register")
  })
}

if (userRoutes && isAuthenticated) {
  app.use("/user", isAuthenticated, userRoutes)
}

if (adminRoutes && isAuthenticated && isAdmin) {
  app.use("/admin", isAuthenticated, isAdmin, adminRoutes)
}

// Home route
app.get("/", (req, res) => {
  try {
    res.render("pages/home", {
      title: "Bosh sahifa",
      user: req.session.user || null,
    })
  } catch (error) {
    console.error("Home route error:", error)
    res.status(500).send("Template rendering error")
  }
})

// Profile route with authentication
app.get("/profile", isAuthenticated, (req, res) => {
  try {
    res.render("profile", {
      title: "Profil",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Profile route error:", error)
    res.status(500).send("Template rendering error")
  }
})

// Dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login")
  }

  try {
    res.render("pages/dashboard", {
      title: "Dashboard",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Dashboard route error:", error)
    res.status(500).send("Template rendering error")
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server ishlayapti",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Sahifa topilmadi",
    url: req.originalUrl,
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server xatoligi:", err.stack)

  if (process.env.NODE_ENV === "development") {
    res.status(err.status || 500).json({
      success: false,
      message: "Server xatoligi",
      error: err.message,
      stack: err.stack,
    })
  } else {
    res.status(err.status || 500).json({
      success: false,
      message: "Server xatoligi",
      error: "Ichki server xatoligi",
    })
  }
})

// Server start
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60))
  console.log("🚀 EJS AUTH SYSTEM ISHGA TUSHDI!")
  console.log("=".repeat(60))
  console.log(`📍 Port: ${PORT}`)
  console.log(`🌐 URL: http://localhost:${PORT}`)
  console.log(`🎨 Template Engine: EJS`)
  console.log(`📅 Vaqt: ${new Date().toLocaleString("uz-UZ")}`)
  console.log(`🖥️  Environment: ${process.env.NODE_ENV || "development"}`)
  console.log("\n📋 SAHIFALAR:")
  console.log(`   🏠 Bosh sahifa:     http://localhost:${PORT}/`)
  console.log(`   🔑 Login:          http://localhost:${PORT}/auth/login`)
  console.log(`   📝 Register:       http://localhost:${PORT}/auth/register`)
  console.log(`   ❤️  Health:         http://localhost:${PORT}/health`)
  console.log("=".repeat(60) + "\n")
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Server yopilmoqda...")
  server.close(() => {
    console.log("✅ Server yopildi")
    mongoose.connection.close()
    process.exit(0)
  })
})

module.exports = app