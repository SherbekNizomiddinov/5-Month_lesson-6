const setLocals = (req, res, next) => {
  // Global variables for all templates
  res.locals.appName = process.env.APP_NAME || "EJS Auth System"
  res.locals.appUrl = process.env.APP_URL || "http://localhost:3000"
  res.locals.currentYear = new Date().getFullYear()
  res.locals.currentUrl = req.originalUrl
  res.locals.user = req.session?.user || null
  res.locals.isAuthenticated = !!req.session?.user

  // Flash messages
  res.locals.messages = {
    success: req.flash("success"),
    error: req.flash("error"),
    info: req.flash("info"),
    warning: req.flash("warning"),
  }

  // Helper functions
  res.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  res.locals.timeAgo = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} kun oldin`
    if (hours > 0) return `${hours} soat oldin`
    if (minutes > 0) return `${minutes} daqiqa oldin`
    return "Hozir"
  }

  res.locals.truncate = (str, length = 100) => {
    if (!str) return ""
    return str.length > length ? str.substring(0, length) + "..." : str
  }

  next()
}

module.exports = { setLocals }
