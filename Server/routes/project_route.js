import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../controllers/product_controller.js";
import { upload } from "../services/uploadmulter.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// ✅ CRUD routes
router.post("/", isAuthenticated, upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", isAuthenticated, upload.single("image"), updateProduct);
router.delete("/:id", isAuthenticated, deleteProduct);

// ✅ Toggle active/inactive status
router.patch("/:id/toggle-status", isAuthenticated, toggleProductStatus);

export default router;
