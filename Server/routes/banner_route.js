import express from "express";
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  Dashboard,
} from "../controllers/Banner_controller.js";
import { upload } from "../services/uploadmulter.js";

const router = express.Router();

router.get('/dashboard', Dashboard)
router.get("/", getAllBanners);
router.get("/:id", getBannerById);
router.post("/", upload.single("banner"), createBanner); 
router.put("/:id", upload.single("banner"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
