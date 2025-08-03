const User = require("../models/User.model")
const jwt = require("../lib/jwt")
const { hashPassword, comparePassword } = require("../lib/hash")

// Ro'yxatdan o'tish
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Foydalanuvchi mavjudligini tekshirish
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu email bilan foydalanuvchi allaqachon mavjud",
      })
    }

    // Yangi foydalanuvchi yaratish
    const user = new User({
      name,
      email,
      password,
    })

    await user.save()

    // Token yaratish
    const token = jwt.generateToken({ userId: user._id })

    res.status(201).json({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error.message,
    })
  }
}

// Kirish
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Foydalanuvchini topish
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      })
    }

    // Parolni tekshirish
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      })
    }

    // Token yaratish
    const token = jwt.generateToken({ userId: user._id })

    res.json({
      success: true,
      message: "Muvaffaqiyatli kirildi",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error.message,
    })
  }
}

// Profil ma'lumotlarini olish
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error.message,
    })
  }
}

module.exports = {
  register,
  login,
  getProfile,
}
