const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism kiritish majburiy"],
      trim: true,
      minlength: [2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"],
      maxlength: [50, "Ism 50 ta belgidan ko'p bo'lmasligi kerak"],
    },
    email: {
      type: String,
      required: [true, "Email kiritish majburiy"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email formati noto'g'ri"],
    },
    password: {
      type: String,
      required: [true, "Parol kiritish majburiy"],
      minlength: [6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
  },
)

// Virtual for account lock
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.isLocked) {
    throw new Error("Akkount vaqtincha bloklangan")
  }

  const isMatch = await bcrypt.compare(candidatePassword, this.password)

  if (!isMatch) {
    this.loginAttempts += 1

    // Lock account after 5 failed attempts
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 30 * 60 * 1000 // 30 minutes
    }

    await this.save()
    return false
  }

  // Reset login attempts on successful login
  if (this.loginAttempts > 0) {
    this.loginAttempts = 0
    this.lockUntil = undefined
    this.lastLogin = new Date()
    await this.save()
  }

  return true
}

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = require("crypto").randomBytes(32).toString("hex")

  this.passwordResetToken = require("crypto").createHash("sha256").update(resetToken).digest("hex")

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  return resetToken
}

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Transform output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.passwordResetToken
  delete user.passwordResetExpires
  delete user.emailVerificationToken
  return user
}

module.exports = mongoose.model("User", userSchema)
