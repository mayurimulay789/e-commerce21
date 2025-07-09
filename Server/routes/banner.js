const express = require("express")
const {
  getHeroBanners,
  getPromoBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
} = require("../controllers/bannerController")
const { auth, adminAuth, digitalMarketerAuth } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

router.get("/hero", getHeroBanners)
router.get("/promo", getPromoBanners)
router.get("/admin", auth, digitalMarketerAuth, getAllBanners)
router.post("/", auth, digitalMarketerAuth, upload.single("image"), createBanner)
router.put("/:id", auth, digitalMarketerAuth, upload.single("image"), updateBanner)
router.delete("/:id", auth, digitalMarketerAuth, deleteBanner)

module.exports = router
