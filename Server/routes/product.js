const express = require("express")
const {
  getProducts,
  getTrendingProducts,
  getNewArrivals,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require("../controllers/productController")
const { auth, adminAuth } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

router.get("/", getProducts)
router.get("/trending", getTrendingProducts)
router.get("/new-arrivals", getNewArrivals)
router.get("/:id", getProduct)
router.post("/", auth, adminAuth, upload.array("images", 10), createProduct)
router.put("/:id", auth, adminAuth, upload.array("images", 10), updateProduct)
router.delete("/:id", auth, adminAuth, deleteProduct)
router.post("/:id/reviews", auth, upload.array("images", 5), addReview)

module.exports = router
