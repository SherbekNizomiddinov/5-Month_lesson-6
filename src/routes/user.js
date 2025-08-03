const express = require("express")
const User = require("../models/User")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// Update profile
router.post(
  "/update-profile",
  [
    body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Ism 2-50 ta belgi orasida bo'lishi kerak"),
    body("email").isEmail().normalizeEmail().withMessage("To'g'ri email kiriting"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg)
        return res.redirect("/profile")
      }

      const { name, email } = req.body

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user._id },
      })

      if (existingUser) {
        req.flash("error", "Bu email boshqa foydalanuvchi tomonidan ishlatilmoqda")
        return res.redirect("/profile")
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name: name.trim(), email: email.toLowerCase() },
        { new: true, runValidators: true },
      )

      // Update session
      req.session.user = user.toJSON()

      req.flash("success", "Profil muvaffaqiyatli yangilandi")
      res.redirect("/profile")
    } catch (error) {
      console.error("Update profile error:", error)
      req.flash("error", "Profilni yangilashda xatolik yuz berdi")
      res.redirect("/profile")
    }
  },
)

// Change password
router.post(
  "/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Joriy parolni kiriting"),
    body("newPassword").isLength({ min: 6 }).withMessage("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Parollar mos kelmaydi")
      }
      return true
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg)
        return res.redirect("/profile")
      }

      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user._id)

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        req.flash("error", "Joriy parol noto'g'ri")
        return res.redirect("/profile")
      }

      // Update password
      user.password = newPassword
      await user.save()

      req.flash("success", "Parol muvaffaqiyatli o'zgartirildi")
      res.redirect("/profile")
    } catch (error) {
      console.error("Change password error:", error)
      req.flash("error", "Parolni o'zgartirishda xatolik yuz berdi")
      res.redirect("/profile")
    }
  },
)

module.exports = router
