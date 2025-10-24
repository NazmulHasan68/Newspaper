import express from "express";
import multer from "multer";
import {
  createUserDetails,
  getAllUserDetails,
  getUserDetailsById,
  updateUserDetails,
  deleteUserDetails,
  requestPayment,
  approvePayment,
  rejectPayment,
  updateSponsorStatus,
  deleteSponsor,
} from "../controllers/userDetails_controller.js";
import { upload } from "../services/uploadmulter.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// 👤 CRUD
router.post(
  "/create",
  isAuthenticated,
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "CV", maxCount: 1 }]),
  createUserDetails
);

router.get("/", isAuthenticated, getAllUserDetails);
router.get("/:id", isAuthenticated, getUserDetailsById);
router.put("/:id", isAuthenticated, upload.fields([{ name: "photo" }, { name: "CV" }]), updateUserDetails);
router.put("/sub-editor-sponsor/:id", isAuthenticated, updateSponsorStatus);
router.put("/:id/delete-sponsor", deleteSponsor);
router.delete("/:id", isAuthenticated, deleteUserDetails);

// 💵 Payment Management
router.put("/:id/request-payment", isAuthenticated, requestPayment);
router.put("/:id/approve-payment", isAuthenticated, approvePayment);
router.put("/:id/reject-payment", isAuthenticated, rejectPayment);

export default router;
