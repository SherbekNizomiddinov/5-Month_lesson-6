const express = require("express")
const { body } = require("express-validator")
const authController = require("../controllers/authController")
const router = express.Router()
// Validation rules
const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("To'g'ri email kiriting"),
  body("password").isLength({ min: 6 }).withMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
]
const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Ism 2-50 ta belgi orasida bo'lishi kerak"),
  body("email").isEmail().normalizeEmail().withMessage("To'g'ri email kiriting"),
  body("password").isLength({ min: 6 }).withMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Parollar mos kelmaydi")
    }
    return true
  }),
]
// Routes
router.get("/login", authController.showLogin)
router.post("/login", loginValidation, authController.login)
router.get("/register", authController.showRegister)
router.post("/register", registerValidation, authController.register)
router.get("/logout", authController.logout)
router.post("/logout", authController.logout)
router.get("/forgot-password", authController.showForgotPassword)
router.post("/forgot-password", authController.forgotPassword)
// Add profile route
router.get("/profile", authController.showProfile)
module.exports = router