// Global JavaScript functionality

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize components
  initMobileMenu()
  initDropdowns()
  initAlerts()
  initForms()

  console.log("🚀 EJS Auth System loaded successfully!")
})

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navMenu = document.getElementById("navMenu")

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      navMenu.classList.toggle("active")

      // Animate hamburger
      const hamburgers = this.querySelectorAll(".hamburger")
      hamburgers.forEach((hamburger, index) => {
        if (navMenu.classList.contains("active")) {
          if (index === 0) hamburger.style.transform = "rotate(45deg) translate(6px, 6px)"
          if (index === 1) hamburger.style.opacity = "0"
          if (index === 2) hamburger.style.transform = "rotate(-45deg) translate(6px, -6px)"
        } else {
          hamburger.style.transform = ""
          hamburger.style.opacity = ""
        }
      })
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active")
        const hamburgers = mobileMenuBtn.querySelectorAll(".hamburger")
        hamburgers.forEach((hamburger) => {
          hamburger.style.transform = ""
          hamburger.style.opacity = ""
        })
      }
    })
  }
}

// Dropdown functionality
function initDropdowns() {
  const dropdowns = document.querySelectorAll(".nav-dropdown, .user-dropdown")

  dropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector(".nav-dropdown-btn, .user-dropdown-btn")
    const menu = dropdown.querySelector(".nav-dropdown-menu, .user-dropdown-menu")

    if (btn && menu) {
      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
          menu.style.opacity = "0"
          menu.style.visibility = "hidden"
          menu.style.transform = "translateY(-10px)"
        }
      })
    }
  })
}

// Alert functionality
function initAlerts() {
  const alerts = document.querySelectorAll(".alert")

  alerts.forEach((alert) => {
    const closeBtn = alert.querySelector(".alert-close")

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        alert.style.opacity = "0"
        alert.style.transform = "translateY(-20px)"
        setTimeout(() => {
          alert.remove()
        }, 300)
      })
    }

    // Auto-hide alerts after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.style.opacity = "0"
        alert.style.transform = "translateY(-20px)"
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove()
          }
        }, 300)
      }
    }, 5000)
  })
}

// Form functionality
function initForms() {
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    // Add loading state to submit buttons
    form.addEventListener("submit", () => {
      const submitBtn = form.querySelector('button[type="submit"]')
      if (submitBtn) {
        const btnText = submitBtn.querySelector(".btn-text")
        const btnLoader = submitBtn.querySelector(".btn-loader")

        if (btnText && btnLoader) {
          btnText.style.display = "none"
          btnLoader.style.display = "flex"
          submitBtn.disabled = true
        }
      }
    })

    // Real-time validation
    const inputs = form.querySelectorAll("input[required]")
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateInput(this)
      })

      input.addEventListener("input", function () {
        if (this.classList.contains("error")) {
          validateInput(this)
        }
      })
    })
  })
}

// Input validation
function validateInput(input) {
  const value = input.value.trim()
  const type = input.type
  let isValid = true
  let errorMessage = ""

  // Required validation
  if (input.hasAttribute("required") && !value) {
    isValid = false
    errorMessage = "Bu maydon majburiy"
  }

  // Email validation
  if (type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      isValid = false
      errorMessage = "Email formati noto'g'ri"
    }
  }

  // Password validation
  if (type === "password" && value) {
    if (value.length < 6) {
      isValid = false
      errorMessage = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
    }
  }

  // Minlength validation
  const minLength = input.getAttribute("minlength")
  if (minLength && value.length < Number.parseInt(minLength)) {
    isValid = false
    errorMessage = `Kamida ${minLength} ta belgi kiriting`
  }

  // Maxlength validation
  const maxLength = input.getAttribute("maxlength")
  if (maxLength && value.length > Number.parseInt(maxLength)) {
    isValid = false
    errorMessage = `Ko'pi bilan ${maxLength} ta belgi kiriting`
  }

  // Update input state
  if (isValid) {
    input.classList.remove("error")
    input.style.borderColor = ""
    removeErrorMessage(input)
  } else {
    input.classList.add("error")
    input.style.borderColor = "var(--error-color)"
    showErrorMessage(input, errorMessage)
  }

  return isValid
}

// Show error message
function showErrorMessage(input, message) {
  removeErrorMessage(input)

  const errorDiv = document.createElement("div")
  errorDiv.className = "input-error-message"
  errorDiv.style.color = "var(--error-color)"
  errorDiv.style.fontSize = "0.875rem"
  errorDiv.style.marginTop = "var(--spacing-xs)"
  errorDiv.textContent = message

  input.parentNode.appendChild(errorDiv)
}

// Remove error message
function removeErrorMessage(input) {
  const existingError = input.parentNode.querySelector(".input-error-message")
  if (existingError) {
    existingError.remove()
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Smooth scroll
function smoothScrollTo(target, duration = 1000) {
  const targetElement = document.querySelector(target)
  if (!targetElement) return

  const targetPosition = targetElement.offsetTop
  const startPosition = window.pageYOffset
  const distance = targetPosition - startPosition
  let startTime = null

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const run = ease(timeElapsed, startPosition, distance, duration)
    window.scrollTo(0, run)
    if (timeElapsed < duration) requestAnimationFrame(animation)
  }

  function ease(t, b, c, d) {
    t /= d / 2
    if (t < 1) return (c / 2) * t * t + b
    t--
    return (-c / 2) * (t * (t - 2) - 1) + b
  }

  requestAnimationFrame(animation)
}

// Copy to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand("copy")
      document.body.removeChild(textArea)
      return Promise.resolve()
    } catch (err) {
      document.body.removeChild(textArea)
      return Promise.reject(err)
    }
  }
}

// Show notification
function showNotification(message, type = "info", duration = 5000) {
  const notification = document.createElement("div")
  notification.className = `alert alert-${type}`
  notification.style.position = "fixed"
  notification.style.top = "20px"
  notification.style.right = "20px"
  notification.style.zIndex = "9999"
  notification.style.maxWidth = "400px"
  notification.style.animation = "slideInRight 0.3s ease-out"

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }

  notification.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${icons[type]}</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `

  document.body.appendChild(notification)

  // Auto-remove after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOutRight 0.3s ease-out"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove()
        }
      }, 300)
    }
  }, duration)
}

// Add slide animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`
document.head.appendChild(style)

// Export functions for global use
window.showNotification = showNotification
window.copyToClipboard = copyToClipboard
window.smoothScrollTo = smoothScrollTo
