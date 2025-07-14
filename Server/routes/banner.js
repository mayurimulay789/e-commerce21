const express = require("express");
const {
  getHeroBanners,
  getPromoBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
} = require("../controllers/bannerController");
const { protect, digitalMarketerAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Public routes
router.get("/", getAllBanners); // GET /api/banners?type=hero&isActive=true
router.get("/hero", getHeroBanners);
router.get("/promo", getPromoBanners);

// Digital Marketer / Admin routes
router.get("/admin", protect, digitalMarketerAuth, getAllBanners);
router.post("/", protect, digitalMarketerAuth, upload.single("image"), createBanner);
router.put("/:id", protect, digitalMarketerAuth, upload.single("image"), updateBanner);
router.delete("/:id", protect, digitalMarketerAuth, deleteBanner);

module.exports = router;


