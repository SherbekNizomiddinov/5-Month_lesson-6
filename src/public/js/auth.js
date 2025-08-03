// Auth Manager - Autentifikatsiya boshqaruvchisi
class AuthManager {
  constructor() {
    this.baseURL = "/api/auth"
    this.token = localStorage.getItem("token")
    this.user = this.getStoredUser()
  }

  // LocalStorage dan foydalanuvchi ma'lumotlarini olish
  getStoredUser() {
    try {
      const userData = localStorage.getItem("user")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error parsing stored user data:", error)
      localStorage.removeItem("user") // Buzilgan ma'lumotni o'chirish
      return null
    }
  }

  // Foydalanuvchi autentifikatsiya qilinganligini tekshirish
  isAuthenticated() {
    const hasToken = !!this.token
    const hasUser = !!this.user
    console.log("Auth check:", { hasToken, hasUser, token: this.token?.substring(0, 20) + "..." })
    return hasToken && hasUser
  }

  // Joriy foydalanuvchi ma'lumotlarini olish
  getUser() {
    return this.user
  }

  // Login funksiyasi
  async login(credentials) {
    try {
      console.log("Login attempt:", credentials.email)

      const response = await fetch(`${this.baseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()
      console.log("Login response:", result)

      if (result.success) {
        // Token va foydalanuvchi ma'lumotlarini saqlash
        this.token = result.token
        this.user = result.user

        localStorage.setItem("token", this.token)
        localStorage.setItem("user", JSON.stringify(this.user))

        console.log("Login successful, stored:", { token: this.token, user: this.user })
        return { success: true, user: this.user }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Tarmoq xatoligi" }
    }
  }

  // Register funksiyasi
  async register(userData) {
    try {
      console.log("Register attempt:", userData.email)

      const response = await fetch(`${this.baseURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()
      console.log("Register response:", result)

      if (result.success) {
        // Token va foydalanuvchi ma'lumotlarini saqlash
        this.token = result.token
        this.user = result.user

        localStorage.setItem("token", this.token)
        localStorage.setItem("user", JSON.stringify(this.user))

        console.log("Register successful, stored:", { token: this.token, user: this.user })
        return { success: true, user: this.user }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, message: "Tarmoq xatoligi" }
    }
  }

  // Profil ma'lumotlarini olish
  async getProfile() {
    try {
      console.log("Getting profile...")

      // Agar localStorage da ma'lumot bo'lsa, uni qaytarish
      if (this.user && this.token) {
        console.log("Profile from localStorage:", this.user)
        return { success: true, user: this.user }
      }

      if (!this.token) {
        console.log("No token found")
        return { success: false, message: "Token topilmadi" }
      }

      const response = await fetch(`${this.baseURL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      console.log("Profile API response:", result)

      if (result.success) {
        this.user = result.user
        localStorage.setItem("user", JSON.stringify(this.user))
        return { success: true, user: this.user }
      } else {
        // Token noto'g'ri bo'lsa, logout qilish
        if (response.status === 401) {
          this.clearAuth()
        }
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Get profile error:", error)
      // Agar API ishlamasa va localStorage da ma'lumot bo'lsa
      if (this.user && this.token) {
        console.log("Using cached profile data")
        return { success: true, user: this.user }
      }
      return { success: false, message: "Profil ma'lumotlarini olishda xatolik" }
    }
  }

  // Profil yangilash
  async updateProfile(userData) {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (result.success) {
        this.user = result.user
        localStorage.setItem("user", JSON.stringify(this.user))
        return { success: true, user: this.user }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Update profile error:", error)
      return { success: false, message: "Profil yangilashda xatolik" }
    }
  }

  // Authentication ma'lumotlarini tozalash
  clearAuth() {
    console.log("Clearing auth data")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.token = null
    this.user = null
  }

  // Logout funksiyasi
  logout() {
    console.log("Logging out...")
    this.clearAuth()
    // Bosh sahifaga yo'naltirish
    window.location.href = "/"
  }

  // Token mavjudligini tekshirish
  hasValidToken() {
    return !!this.token
  }

  // API so'rovlari uchun headers olish
  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    }
  }
}

// Global AuthManager instance yaratish
const authManager = new AuthManager()

// Global funksiyalar
window.authManager = authManager

// Sahifa yuklanganda authentication holatini tekshirish
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname
  console.log("Page loaded:", currentPath, "Auth status:", authManager.isAuthenticated())

  // Redirect logikasini faqat bir marta ishlatish
  if (!window.authRedirectHandled) {
    window.authRedirectHandled = true

    // Agar foydalanuvchi autentifikatsiya qilingan bo'lsa va login/register sahifasida bo'lsa
    const authPages = ["/login", "/register"]
    if (authManager.isAuthenticated() && authPages.includes(currentPath)) {
      console.log("Authenticated user on auth page, redirecting to profile")
      setTimeout(() => {
        window.location.href = "/profile"
      }, 100)
      return
    }

    // Agar foydalanuvchi autentifikatsiya qilinmagan bo'lsa va himoyalangan sahifada bo'lsa
    const protectedPages = ["/profile"]
    if (!authManager.isAuthenticated() && protectedPages.includes(currentPath)) {
      console.log("Unauthenticated user on protected page, redirecting to login")
      setTimeout(() => {
        window.location.href = "/login"
      }, 100)
      return
    }
  }
})

// Global error handler
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
})

// Global unhandled promise rejection handler
window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise rejection:", e.reason)
})
