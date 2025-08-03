const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    // Check session first
    if (req.session && req.session.user) {
      // Verify user still exists and is active
      const user = await User.findById(req.session.user._id)
      if (user && user.isActive) {
        req.user = user
        return next()
      } else {
        req.session.destroy()
      }
    }

    // Check JWT token in headers
    const token = req.headers.authorization?.split(" ")[1]
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId)

      if (user && user.isActive) {
        req.user = user
        return next()
      }
    }

    // Redirect to login with return URL
    const returnUrl = req.originalUrl
    res.redirect(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.redirect("/auth/login")
  }
}

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next()
  }

  req.flash("error", "Bu sahifaga kirish uchun admin huquqi kerak")
  res.redirect("/dashboard")
}

// Check if user is moderator or admin
const isModerator = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
    return next()
  }

  req.flash("error", "Bu sahifaga kirish uchun moderator huquqi kerak")
  res.redirect("/dashboard")
}

// Optional authentication (doesn't redirect)
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user._id)
      if (user && user.isActive) {
        req.user = user
      }
    }
    next()
  } catch (error) {
    console.error("Optional auth error:", error)
    next()
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isModerator,
  optionalAuth,
}
