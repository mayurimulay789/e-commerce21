const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getTrendingProducts,
  getNewArrivals,
  getSearchedProducts,
  getProductsByCategory,
} = require("../controllers/productController");

// Routes
router.get("/", getProducts);
router.get("/search", getSearchedProducts);
router.get("/trending", getTrendingProducts);
router.get("/new", getNewArrivals);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/review", addReview);

module.exports = router;
