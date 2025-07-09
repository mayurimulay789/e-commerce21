const express = require("express")
const { handleWebhook } = require("../controllers/shiprocketController")

const router = express.Router()

// Webhook endpoint (no auth required as it's called by Shiprocket)
router.post("/webhook", handleWebhook)

module.exports = router
