const express = require("express")
const {
  createReturnRequest,
  getUserReturns,
  getReturnDetails,
  getAllReturns,
  updateReturnStatus,
} = require("../controllers/returnController")
const { auth, adminAuth } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

// User routes (require authentication)
router.post("/", auth, upload.array("images", 5), createReturnRequest)
router.get("/my-returns", auth, getUserReturns)
router.get("/:returnId", auth, getReturnDetails)

// Admin routes (require admin authentication)
router.get("/admin/all", auth, adminAuth, getAllReturns)
router.put("/admin/:returnId/status", auth, adminAuth, updateReturnStatus)

module.exports = router
