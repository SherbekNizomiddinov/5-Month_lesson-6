const express = require("express")
const User = require("../models/User")

const router = express.Router()

// Admin dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const adminUsers = await User.countDocuments({ role: "admin" })
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt isActive")

    res.render("pages/admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        inactiveUsers: totalUsers - activeUsers,
      },
      recentUsers,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    req.flash("error", "Dashboard ma'lumotlarini yuklashda xatolik")
    res.redirect("/dashboard")
  }
})

// Users list
router.get("/users", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email role isActive createdAt lastLogin")

    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)

    res.render("pages/admin/users", {
      title: "Foydalanuvchilar",
      users,
      pagination: {
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Users list error:", error)
    req.flash("error", "Foydalanuvchilar ro'yxatini yuklashda xatolik")
    res.redirect("/admin/dashboard")
  }
})

// Toggle user status
router.post("/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      req.flash("error", "Foydalanuvchi topilmadi")
      return res.redirect("/admin/users")
    }

    user.isActive = !user.isActive
    await user.save()

    req.flash("success", `Foydalanuvchi ${user.isActive ? "faollashtirildi" : "o'chirildi"}`)
    res.redirect("/admin/users")
  } catch (error) {
    console.error("Toggle user status error:", error)
    req.flash("error", "Foydalanuvchi holatini o'zgartirishda xatolik")
    res.redirect("/admin/users")
  }
})

module.exports = router
