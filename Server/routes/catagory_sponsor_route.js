import express from "express";

import {
  createCategorySponsor,
  getAllCategorySponsors,
  getCategorySponsorById,
  updateCategorySponsor,
  deleteCategorySponsor,
  updateCategorySponsorStatus,
  getCategorySponsorsByCategory,
  getActiveCategorySponsors,
} from "../controllers/category_sponsor_controller.js";

import { upload } from "../services/uploadmulter.js";

const router = express.Router();

// ✅ Routes
router.post("/", upload.single("photo"), createCategorySponsor);
router.get("/", getAllCategorySponsors);
router.get("/active", getActiveCategorySponsors);
router.get("/category/:category", getCategorySponsorsByCategory);
router.get("/:id", getCategorySponsorById);
router.put("/:id", upload.single("photo"), updateCategorySponsor);
router.patch("/:id/status", updateCategorySponsorStatus);
router.delete("/:id", deleteCategorySponsor);

export default router;
