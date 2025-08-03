const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}
// Show login page
const showLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect("/profile")
  }
  res.render("pages/auth/login", {
    title: "Kirish",
    returnUrl: req.query.returnUrl || "/profile",
  })
}
// Handle login
const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render("pages/auth/login", {
        title: "Kirish",
        errors: errors.array(),
        formData: req.body,
        returnUrl: req.body.returnUrl || "/profile",
      })
    }
    const { email, password, rememberMe } = req.body
    // Find user
    const user = await User.findByEmail(email)
    if (!user) {
      req.flash("error", "Email yoki parol noto'g'ri")
      return res.redirect("/auth/login")
    }
    // Check if account is locked
    if (user.isLocked) {
      req.flash("error", "Akkount vaqtincha bloklangan. Keyinroq urinib ko'ring")
      return res.redirect("/auth/login")
    }
    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      req.flash("error", "Email yoki parol noto'g'ri")
      return res.redirect("/auth/login")
    }
    // Update last login
    user.lastLogin = new Date()
    await user.save()
    // Create session
    req.session.user = user.toJSON()
    // Set cookie expiry if remember me is checked
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    }
    req.flash("success", `Xush kelibsiz, ${user.name}!`)
    const returnUrl = req.body.returnUrl || "/profile"
    res.redirect(returnUrl)
  } catch (error) {
    console.error("Login error:", error)
    req.flash("error", "Kirish jarayonida xatolik yuz berdi")
    res.redirect("/auth/login")
  }
}
// Show register page
const showRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect("/profile")
  }
  res.render("pages/auth/register", {
    title: "Ro'yxatdan o'tish",
  })
}
// Handle register
const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render("pages/auth/register", {
        title: "Ro'yxatdan o'tish",
        errors: errors.array(),
        formData: req.body,
      })
    }
    const { name, email, password } = req.body
    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      req.flash("error", "Bu email bilan foydalanuvchi allaqachon mavjud")
      return res.redirect("/auth/register")
    }
    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    })
    await user.save()
    // Create session
    req.session.user = user.toJSON()
    req.flash("success", "Muvaffaqiyatli ro'yxatdan o'tdingiz!")
    res.redirect("/profile")
  } catch (error) {
    console.error("Register error:", error)
    req.flash("error", "Ro'yxatdan o'tish jarayonida xatolik yuz berdi")
    res.redirect("/auth/register")
  }
}
// Show profile page
const showProfile = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login")
  }
  res.render("profile", {
    title: "Profil",
    user: req.session.user
  })
}
// Handle logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      req.flash("error", "Chiqish jarayonida xatolik yuz berdi")
      return res.redirect("/profile")
    }
    res.clearCookie("connect.sid")
    res.redirect("/?message=Muvaffaqiyatli chiqildi")
  })
}
// Show forgot password page
const showForgotPassword = (req, res) => {
  res.render("pages/auth/forgot-password", {
    title: "Parolni tiklash",
  })
}
// Handle forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findByEmail(email)
    if (!user) {
      req.flash("info", "Agar bu email mavjud bo'lsa, parolni tiklash havolasi yuboriladi")
      return res.redirect("/auth/forgot-password")
    }
    // Generate reset token
    const resetToken = user.createPasswordResetToken()
    await user.save()
    // In a real app, send email here
    console.log("Password reset token:", resetToken)
    req.flash("info", "Parolni tiklash havolasi emailingizga yuborildi")
    res.redirect("/auth/login")
  } catch (error) {
    console.error("Forgot password error:", error)
    req.flash("error", "Parolni tiklash jarayonida xatolik yuz berdi")
    res.redirect("/auth/forgot-password")
  }
}
module.exports = {
  showLogin,
  login,
  showRegister,
  register,
  logout,
  showForgotPassword,
  forgotPassword,
  showProfile
}