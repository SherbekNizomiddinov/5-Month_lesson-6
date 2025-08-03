// EJS modulini tekshirish
console.log("🔍 EJS modulini tekshirish...")

try {
  const ejs = require("ejs")
  console.log("✅ EJS moduli muvaffaqiyatli yuklandi!")
  console.log("📦 EJS versiyasi:", ejs.VERSION || "Noma'lum")

  // Oddiy test
  const template = "<h1>Hello <%= name %>!</h1>"
  const html = ejs.render(template, { name: "World" })
  console.log("🧪 Test natijasi:", html)
} catch (error) {
  console.error("❌ EJS moduli yuklanmadi:", error.message)
  console.log("📦 EJS o'rnatish uchun: npm install ejs")
}

console.log("\n🔍 Barcha modullarni tekshirish...")

const modules = [
  "express",
  "ejs",
  "mongoose",
  "bcryptjs",
  "jsonwebtoken",
  "express-session",
  "connect-mongo",
  "express-flash",
  "express-validator",
  "dotenv",
  "cors",
  "helmet",
  "morgan",
  "compression",
]

modules.forEach((moduleName) => {
  try {
    require(moduleName)
    console.log(`✅ ${moduleName}`)
  } catch (error) {
    console.log(`❌ ${moduleName} - ${error.message}`)
  }
})
