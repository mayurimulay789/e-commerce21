const express = require("express");
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, adminAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin-only routes
router.post("/", protect ,adminAuth, upload.single("image"), createCategory);
router.put("/:id", protect, adminAuth, upload.single("image"), updateCategory);
router.delete("/:id", protect, adminAuth, deleteCategory);

module.exports = router;
