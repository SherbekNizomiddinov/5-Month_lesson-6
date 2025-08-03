// Component-specific JavaScript functionality

// Password strength checker
class PasswordStrengthChecker {
  constructor(passwordInput, strengthBar, strengthText) {
    this.passwordInput = passwordInput
    this.strengthBar = strengthBar
    this.strengthText = strengthText

    this.init()
  }

  init() {
    if (this.passwordInput) {
      this.passwordInput.addEventListener("input", (e) => {
        this.checkStrength(e.target.value)
      })
    }
  }

  checkStrength(password) {
    let strength = 0
    let text = ""
    let color = ""

    // Length check
    if (password.length >= 6) strength += 1
    if (password.length >= 10) strength += 1

    // Character variety checks
    if (password.match(/[a-z]/)) strength += 1
    if (password.match(/[A-Z]/)) strength += 1
    if (password.match(/[0-9]/)) strength += 1
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1

    // Determine strength level
    switch (strength) {
      case 0:
      case 1:
        text = "Juda zaif"
        color = "#e53e3e"
        break
      case 2:
      case 3:
        text = "Zaif"
        color = "#fd7f28"
        break
      case 4:
        text = "O'rtacha"
        color = "#ffd60a"
        break
      case 5:
        text = "Kuchli"
        color = "#38a169"
        break
      case 6:
        text = "Juda kuchli"
        color = "#22c55e"
        break
    }

    // Update UI
    if (this.strengthBar) {
      this.strengthBar.style.width = `${(strength / 6) * 100}%`
      this.strengthBar.style.backgroundColor = color
    }

    if (this.strengthText) {
      this.strengthText.textContent = text
      this.strengthText.style.color = color
    }
  }
}

// Password toggle functionality
class PasswordToggle {
  constructor(toggleButton, passwordInput) {
    this.toggleButton = toggleButton
    this.passwordInput = passwordInput
    this.isVisible = false

    this.init()
  }

  init() {
    if (this.toggleButton && this.passwordInput) {
      this.toggleButton.addEventListener("click", () => {
        this.toggle()
      })
    }
  }

  toggle() {
    this.isVisible = !this.isVisible

    if (this.isVisible) {
      this.passwordInput.type = "text"
      this.toggleButton.textContent = "🙈"
    } else {
      this.passwordInput.type = "password"
      this.toggleButton.textContent = "👁️"
    }
  }
}

// Form validator
class FormValidator {
  constructor(form) {
    this.form = form
    this.errors = {}

    this.init()
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        if (!this.validateForm()) {
          e.preventDefault()
        }
      })

      // Real-time validation
      const inputs = this.form.querySelectorAll('input[required], input[type="email"], input[minlength]')
      inputs.forEach((input) => {
        input.addEventListener("blur", () => {
          this.validateField(input)
        })

        input.addEventListener("input", () => {
          if (this.errors[input.name]) {
            this.validateField(input)
          }
        })
      })
    }
  }

  validateForm() {
    this.errors = {}
    const inputs = this.form.querySelectorAll('input[required], input[type="email"], input[minlength]')

    inputs.forEach((input) => {
      this.validateField(input)
    })

    return Object.keys(this.errors).length === 0
  }

  validateField(input) {
    const value = input.value.trim()
    const name = input.name
    let isValid = true
    let errorMessage = ""

    // Required validation
    if (input.hasAttribute("required") && !value) {
      isValid = false
      errorMessage = "Bu maydon majburiy"
    }

    // Email validation
    if (input.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        isValid = false
        errorMessage = "Email formati noto'g'ri"
      }
    }

    // Password validation
    if (input.type === "password" && value) {
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

    // Password confirmation
    if (name === "confirmPassword") {
      const passwordInput = this.form.querySelector('input[name="password"], input[name="newPassword"]')
      if (passwordInput && value !== passwordInput.value) {
        isValid = false
        errorMessage = "Parollar mos kelmaydi"
      }
    }

    // Update field state
    if (isValid) {
      delete this.errors[name]
      this.clearFieldError(input)
    } else {
      this.errors[name] = errorMessage
      this.showFieldError(input, errorMessage)
    }

    return isValid
  }

  showFieldError(input, message) {
    this.clearFieldError(input)

    input.classList.add("error")
    input.style.borderColor = "var(--error-color)"

    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error-message"
    errorDiv.style.color = "var(--error-color)"
    errorDiv.style.fontSize = "0.875rem"
    errorDiv.style.marginTop = "var(--spacing-xs)"
    errorDiv.textContent = message

    input.parentNode.appendChild(errorDiv)
  }

  clearFieldError(input) {
    input.classList.remove("error")
    input.style.borderColor = ""

    const existingError = input.parentNode.querySelector(".field-error-message")
    if (existingError) {
      existingError.remove()
    }
  }
}

// Modal component
class Modal {
  constructor(modalElement) {
    this.modal = modalElement
    this.isOpen = false

    this.init()
  }

  init() {
    if (this.modal) {
      // Close button
      const closeBtn = this.modal.querySelector(".modal-close")
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.close()
        })
      }

      // Click outside to close
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.close()
        }
      })

      // Escape key to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close()
        }
      })
    }
  }

  open() {
    if (this.modal) {
      this.modal.style.display = "flex"
      document.body.style.overflow = "hidden"
      this.isOpen = true

      // Focus trap
      const focusableElements = this.modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = "none"
      document.body.style.overflow = ""
      this.isOpen = false
    }
  }
}

// Tooltip component
class Tooltip {
  constructor(element, text, position = "top") {
    this.element = element
    this.text = text
    this.position = position
    this.tooltip = null

    this.init()
  }

  init() {
    if (this.element) {
      this.element.addEventListener("mouseenter", () => {
        this.show()
      })

      this.element.addEventListener("mouseleave", () => {
        this.hide()
      })
    }
  }

  show() {
    this.tooltip = document.createElement("div")
    this.tooltip.className = "tooltip"
    this.tooltip.textContent = this.text
    this.tooltip.style.cssText = `
            position: absolute;
            background: var(--gray-800);
            color: white;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            white-space: nowrap;
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `

    document.body.appendChild(this.tooltip)

    // Position tooltip
    const rect = this.element.getBoundingClientRect()
    const tooltipRect = this.tooltip.getBoundingClientRect()

    let top, left

    switch (this.position) {
      case "top":
        top = rect.top - tooltipRect.height - 8
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case "bottom":
        top = rect.bottom + 8
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case "left":
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.left - tooltipRect.width - 8
        break
      case "right":
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.right + 8
        break
    }

    this.tooltip.style.top = `${top + window.scrollY}px`
    this.tooltip.style.left = `${left + window.scrollX}px`

    // Show tooltip
    setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.style.opacity = "1"
      }
    }, 10)
  }

  hide() {
    if (this.tooltip) {
      this.tooltip.style.opacity = "0"
      setTimeout(() => {
        if (this.tooltip && this.tooltip.parentNode) {
          this.tooltip.parentNode.removeChild(this.tooltip)
        }
        this.tooltip = null
      }, 200)
    }
  }
}

// Initialize components when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize password strength checkers
  const passwordInputs = document.querySelectorAll('input[type="password"]')
  passwordInputs.forEach((input) => {
    const strengthBar = document.querySelector(`#${input.id} + .password-strength .strength-fill`)
    const strengthText = document.querySelector(`#${input.id} + .password-strength .strength-text`)

    if (strengthBar && strengthText) {
      new PasswordStrengthChecker(input, strengthBar, strengthText)
    }
  })

  // Initialize password toggles
  const passwordToggles = document.querySelectorAll(".password-toggle")
  passwordToggles.forEach((toggle) => {
    const targetId = toggle.getAttribute("data-target")
    const passwordInput = document.getElementById(targetId)

    if (passwordInput) {
      new PasswordToggle(toggle, passwordInput)
    }
  })

  // Initialize form validators
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    new FormValidator(form)
  })

  // Initialize modals
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    new Modal(modal)
  })

  // Initialize tooltips
  const tooltipElements = document.querySelectorAll("[data-tooltip]")
  tooltipElements.forEach((element) => {
    const text = element.getAttribute("data-tooltip")
    const position = element.getAttribute("data-tooltip-position") || "top"
    new Tooltip(element, text, position)
  })
})

// Export classes for global use
window.PasswordStrengthChecker = PasswordStrengthChecker
window.PasswordToggle = PasswordToggle
window.FormValidator = FormValidator
window.Modal = Modal
window.Tooltip = Tooltip
