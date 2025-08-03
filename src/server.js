const express = require("express")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

// Modullarni import qilish
let cors, connectDB, authRoutes, errorHandler, session, expressSession

// CORS modulini yuklash
try {
  cors = require("cors")
  console.log("✅ CORS moduli yuklandi")
} catch (err) {
  console.log("❌ CORS moduli topilmadi:", err.message)
  cors = null
}

// Database konfiguratsiyasini yuklash
try {
  connectDB = require("./src/config/database")
  console.log("✅ Database config yuklandi")
} catch (err) {
  console.log("❌ Database config topilmadi:", err.message)
  connectDB = null
}

// Auth routes ni yuklash
try {
  authRoutes = require("./src/routes/auth.routes")
  console.log("✅ Auth routes yuklandi")
} catch (err) {
  console.log("❌ Auth routes topilmadi:", err.message)
  authRoutes = null
}

// Error handler ni yuklash
try {
  errorHandler = require("./src/middlewares/errorHandler")
  console.log("✅ Error handler yuklandi")
} catch (err) {
  console.log("❌ Error handler topilmadi:", err.message)
  errorHandler = (err, req, res, next) => {
    console.error("❌ Server xatoligi:", err.stack)
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: process.env.NODE_ENV === "development" ? err.message : "Ichki server xatoligi",
    })
  }
}

// Session uchun modul
try {
  session = require("express-session")
  expressSession = require("express-session")
  console.log("✅ Session moduli yuklandi")
} catch (err) {
  console.log("❌ Session moduli topilmadi:", err.message)
  session = null
}

// Express app yaratish
const app = express()

// EJS template engine sozlash
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// EJS helper functions
app.locals.contentFor = function (name, content) {
  if (!this.contentForData) this.contentForData = {}
  if (content) {
    this.contentForData[name] = content
    return ""
  }
  return this.contentForData[name] || ""
}

// Database ga ulanish
if (connectDB) {
  try {
    connectDB()
    console.log("🔗 Database ulanish jarayoni boshlandi")
  } catch (err) {
    console.error("❌ Database ulanishida xatolik:", err.message)
  }
} else {
  console.log("⚠️ Database konfiguratsiyasi topilmadi")
}

// CORS sozlamalari
if (cors) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  console.log("✅ CORS sozlandi")
} else {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Credentials", "true")

    if (req.method === "OPTIONS") {
      return res.sendStatus(200)
    }
    next()
  })
  console.log("✅ Manual CORS sozlandi")
}

// Session sozlash
if (session) {
  app.use(
    expressSession({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
    }),
  )
  console.log("✅ Session sozlandi")
}

// Body parser middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`📝 ${timestamp} - ${req.method} ${req.url}`)
  next()
})

// Static files middleware
const publicPath = path.join(__dirname, "public")
app.use(express.static(publicPath))
console.log("📁 Static files path:", publicPath)

// API Routes
if (authRoutes) {
  app.use("/api/auth", authRoutes)
  console.log("✅ API routes sozlandi: /api/auth")
} else {
  console.log("⚠️ API routes mavjud emas")

  // API Routes - Working endpoints for testing
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email va parol kiritish majburiy",
        })
      }

      // Demo user for testing
      if (email === "test@example.com" && password === "123456") {
        const user = {
          id: "demo_user_123",
          name: "Test Foydalanuvchi",
          email: "test@example.com",
          password: "123456", // Saqlash uchun
          role: "user",
          isActive: true,
          createdAt: new Date().toISOString(),
        }
        req.session.user = user
        return res.json({
          success: true,
          message: "Muvaffaqiyatli kirildi",
          token: "demo_token_" + Date.now(),
          user: user,
        })
      }

      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      })
    } catch (error) {
      console.error("Login error:", error)
      return res.status(500).json({
        success: false,
        message: "Server xatoligi",
        error: error.message,
      })
    }
  })

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Barcha maydonlarni to'ldirish majburiy",
        })
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        })
      }

      if (email === "test@example.com") {
        return res.status(400).json({
          success: false,
          message: "Bu email bilan foydalanuvchi allaqachon mavjud",
        })
      }

      const user = {
        id: "user_" + Date.now(),
        name: name,
        email: email,
        password: password, // Saqlash uchun
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      req.session.user = user

      return res.status(201).json({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
        token: "demo_token_" + Date.now(),
        user: user,
      })
    } catch (error) {
      console.error("Register error:", error)
      return res.status(500).json({
        success: false,
        message: "Server xatoligi",
        error: error.message,
      })
    }
  })

  app.get("/api/auth/profile", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: "Foydalanuvchi autentifikatsiyadan o'tmagan",
        })
      }
      return res.json({
        success: true,
        user: req.session.user,
      })
    } catch (error) {
      console.error("Profile error:", error)
      return res.status(500).json({
        success: false,
        message: "Server xatoligi",
        error: error.message,
      })
    }
  })

  app.post("/api/auth/profile", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: "Foydalanuvchi autentifikatsiyadan o'tmagan",
        })
      }

      const { name, email, password } = req.body
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Barcha maydonlarni to'ldirish majburiy",
        })
      }

      req.session.user.name = name
      req.session.user.email = email
      req.session.user.password = password

      return res.json({
        success: true,
        message: "Profil muvaffaqiyatli yangilandi",
        user: req.session.user,
      })
    } catch (error) {
      console.error("Profile update error:", error)
      return res.status(500).json({
        success: false,
        message: "Server xatoligi",
        error: error.message,
      })
    }
  })
}

// EJS Routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Bosh sahifa",
    icon: "🏠",
    showBackButton: false,
  })
})

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Kirish",
    icon: "🔑",
    showBackButton: true,
    backUrl: "/",
    backText: "← Bosh sahifa",
  })
})

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Ro'yxatdan o'tish",
    icon: "📝",
    showBackButton: true,
    backUrl: "/",
    backText: "← Bosh sahifa",
  })
})

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  res.render("profile", {
    title: "Profil",
    icon: "👤",
    showBackButton: true,
    backUrl: "/",
    backText: "🏠 Bosh sahifa",
    user: req.session.user || {} // Agar foydalanuvchi mavjud bo'lmasa, bo'sh ob'ekt
  })
})

app.post("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  const { name, email, password } = req.body
  if (name && email && password) {
    req.session.user.name = name
    req.session.user.email = email
    req.session.user.password = password
    req.session.save()
    res.redirect("/profile")
  } else {
    res.status(400).json({
      success: false,
      message: "Barcha maydonlarni to'ldirish kerak",
    })
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  const healthStatus = {
    success: true,
    message: "Server sog'lom",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  }

  res.json(healthStatus)
})

// Debug endpoint
app.get("/debug", (req, res) => {
  const files = [
    { name: "index.ejs", path: path.join(__dirname, "views", "index.ejs") },
    { name: "login.ejs", path: path.join(__dirname, "views", "login.ejs") },
    { name: "register.ejs", path: path.join(__dirname, "views", "register.ejs") },
    { name: "profile.ejs", path: path.join(__dirname, "views", "profile.ejs") },
    { name: "main.ejs", path: path.join(__dirname, "views", "layouts", "main.ejs") },
    { name: "style.css", path: path.join(__dirname, "public", "css", "style.css") },
    { name: "auth.js", path: path.join(__dirname, "public", "js", "auth.js") },
  ]

  const fileStatus = files.map((file) => ({
    name: file.name,
    path: file.path,
    exists: fs.existsSync(file.path),
    size: fs.existsSync(file.path) ? fs.statSync(file.path).size + " bytes" : "N/A",
  }))

  const debugInfo = {
    success: true,
    message: "EJS Debug ma'lumotlari",
    timestamp: new Date().toISOString(),
    server: {
      currentDirectory: __dirname,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime() + " soniya",
      viewEngine: app.get("view engine"),
      viewsPath: app.get("views"),
    },
    modules: {
      cors: !!cors,
      connectDB: !!connectDB,
      authRoutes: !!authRoutes,
      errorHandler: !!errorHandler,
      session: !!session,
    },
    files: fileStatus,
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || 3000,
      MONGODB_URI: process.env.MONGODB_URI ? "Sozlangan" : "Sozlanmagan",
      JWT_SECRET: process.env.JWT_SECRET ? "Sozlangan" : "Sozlanmagan",
    },
  }

  res.json(debugInfo)
})

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "EJS Server muvaffaqiyatli ishlayapti! 🚀",
    timestamp: new Date().toISOString(),
    templateEngine: "EJS",
    routes: {
      html: ["GET /", "GET /login", "GET /register", "GET /profile", "POST /profile"],
      api: ["POST /api/auth/login", "POST /api/auth/register", "GET /api/auth/profile", "POST /api/auth/profile"],
      utility: ["GET /health", "GET /debug", "GET /test"],
    },
  })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Sahifa topilmadi: ${req.method} ${req.originalUrl}`)

  res.status(404).json({
    success: false,
    message: "Sahifa topilmadi",
    requestedUrl: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: {
      html: ["/", "/login", "/register", "/profile"],
      api: ["/api/auth/login", "/api/auth/register", "/api/auth/profile"],
      utility: ["/health", "/debug", "/test"],
    },
  })
})

// Global error handler
app.use(errorHandler)

// Server ishga tushirish
const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60))
  console.log("🚀 EJS SERVER MUVAFFAQIYATLI ISHGA TUSHDI!")
  console.log("=".repeat(60))
  console.log(`📍 Port: ${PORT}`)
  console.log(`🌐 URL: http://localhost:${PORT}`)
  console.log(`📅 Vaqt: ${new Date().toLocaleString("uz-UZ")}`)
  console.log(`🖥️  Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🎨 Template Engine: EJS`)

  console.log("\n📋 MAVJUD SAHIFALAR:")
  console.log(`   🏠 Bosh sahifa:     http://localhost:${PORT}/`)
  console.log(`   🔑 Login:          http://localhost:${PORT}/login`)
  console.log(`   📝 Register:       http://localhost:${PORT}/register`)
  console.log(`   👤 Profile:        http://localhost:${PORT}/profile`)

  console.log("\n🔧 UTILITY SAHIFALAR:")
  console.log(`   ❤️  Health Check:   http://localhost:${PORT}/health`)
  console.log(`   🐛 Debug:          http://localhost:${PORT}/debug`)
  console.log(`   🧪 Test:           http://localhost:${PORT}/test`)

  console.log("\n📁 EJS FAYLLAR HOLATI:")
  const criticalFiles = [
    { name: "main.ejs", path: path.join(__dirname, "views", "layouts", "main.ejs") },
    { name: "index.ejs", path: path.join(__dirname, "views", "index.ejs") },
    { name: "login.ejs", path: path.join(__dirname, "views", "login.ejs") },
    { name: "register.ejs", path: path.join(__dirname, "views", "register.ejs") },
    { name: "profile.ejs", path: path.join(__dirname, "views", "profile.ejs") },
    { name: "style.css", path: path.join(__dirname, "public", "css", "style.css") },
    { name: "auth.js", path: path.join(__dirname, "public", "js", "auth.js") },
  ]

  criticalFiles.forEach((file) => {
    const exists = fs.existsSync(file.path)
    console.log(`   ${exists ? "✅" : "❌"} ${file.name}${exists ? "" : " - MAVJUD EMAS!"}`)
  })

  console.log("\n" + "=".repeat(60))
  console.log("✨ EJS Server tayyor! Brauzerda http://localhost:" + PORT + " ni oching")
  console.log("=".repeat(60) + "\n")
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 Server yopilmoqda...")
  server.close(() => {
    console.log("✅ Server yopildi.")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("\n🛑 Server yopilmoqda (Ctrl+C)...")
  server.close(() => {
    console.log("✅ Server yopildi.")
    process.exit(0)
  })
})

module.exports = app