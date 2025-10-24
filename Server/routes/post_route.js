import express from "express";
import {
  createPost,
  getAllPosts,
  getAllPostsByUser,
  getPostById,
  updatePost,
  deletePost,
  reviewPostApproval, // updated function name to match controller
} from "../controllers/post_controller.js";
import { upload } from "../services/uploadmulter.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// ========================
// ✅ CREATE POST
// ========================
router.post(
  "/",
  isAuthenticated,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  createPost
);

// ========================
// ✅ GET POSTS
// ========================
router.get("/", getAllPosts);
router.get("/user/:userId", getAllPostsByUser);
router.get("/:id", getPostById);

// ========================
// ✅ UPDATE POST
// ========================
router.put(
  "/:id",
  isAuthenticated,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  updatePost
);

// ========================
// ✅ DELETE POST
// ========================
router.delete("/:id", isAuthenticated, deletePost);

// ========================
// ✅ REVIEW / APPROVAL POST
// ========================
router.patch("/:id/review", isAuthenticated, reviewPostApproval);

export default router;
