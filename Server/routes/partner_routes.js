import express from "express";
import {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
  togglePartnerStatus,
} from "../controllers/partner_controller.js";
import { upload } from "../services/uploadmulter.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// ✅ CRUD routes
router.post("/", isAuthenticated, upload.single("logo"), createPartner);
router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.put("/:id", isAuthenticated, upload.single("logo"), updatePartner);
router.delete("/:id", isAuthenticated, deletePartner);

// ✅ Toggle active/inactive status
router.patch("/:id/toggle-status", isAuthenticated, togglePartnerStatus);

export default router;
