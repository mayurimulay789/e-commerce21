const express = require("express");
const router = express.Router();

const {
  getProducts,
  getTrendingProducts,
  getNewArrivals,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require("../controllers/productController");

const { protect, adminAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getProducts);
router.get("/trending", getTrendingProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/:id", getProduct);
router.post("/", protect, adminAuth, upload.array("images", 10), createProduct);
router.put("/:id", protect, adminAuth, upload.array("images", 10), updateProduct);
router.delete("/:id", protect, adminAuth, deleteProduct);
router.post("/:id/reviews", protect, upload.array("images", 5), addReview);

module.exports = router;
