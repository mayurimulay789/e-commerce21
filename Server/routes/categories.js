const express = require("express")
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController")
const { auth, adminAuth } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

router.get("/", getCategories)
router.get("/:slug", getCategoryBySlug)
router.post("/", auth, adminAuth, upload.single("image"), createCategory)
router.put("/:id", auth, adminAuth, upload.single("image"), updateCategory)
router.delete("/:id", auth, adminAuth, deleteCategory)

module.exports = router
