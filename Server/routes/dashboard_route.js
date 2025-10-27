import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  createOrUpdateUserFinancialDetails,
  getUserFinancialDetails,
  requestPayment,
  getAllPaymentRequests,
  markAnyPaymentGiven,
} from "../controllers/DashBoard_controller.js";

const router = express.Router();

// ------------------- User Routes -------------------
// Get user financial details
router.get("/user", isAuthenticated, getUserFinancialDetails);

// Create or update user financial details
router.post("/user", isAuthenticated, createOrUpdateUserFinancialDetails);

// Request a payment
router.post("/user/payment-request", isAuthenticated, requestPayment);

// ------------------- Admin/Editor Routes -------------------
// Get all payment requests
router.get("/all-requests", isAuthenticated, getAllPaymentRequests);

// Mark a payment as given
router.put("/payment-given/:id", isAuthenticated, markAnyPaymentGiven);

export default router;
