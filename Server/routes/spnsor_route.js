import express from "express";
import {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
} from "../controllers/sponsor_controller.js";
import { upload } from "../services/uploadmulter.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// ✅ CRUD routes
router.post("/", isAuthenticated, upload.single("photo"), createSponsor);
router.get("/", getAllSponsors);
router.get("/:id", getSponsorById);
router.put("/:id", isAuthenticated, upload.single("photo"), updateSponsor);
router.delete("/:id", isAuthenticated, deleteSponsor);

export default router;
