import express from "express";
import {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
} from "../controllers/post_sponsor_controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { upload } from "../services/uploadmulter.js";

const router = express.Router();

// ✅ Routes
router.post("/", isAuthenticated, upload.single("banner"), createSponsor);
router.get("/", getAllSponsors);
router.get("/:id", getSponsorById);
router.put("/:id", isAuthenticated, upload.single("banner"), updateSponsor);
router.delete("/:id", isAuthenticated, deleteSponsor);

export default router;
