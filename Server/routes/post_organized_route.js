import express from "express";
import {
  createWorkflowPost,
  getAllWorkflowPosts,
  getWorkflowPostById,
  updateWorkflowPost,
  deleteWorkflowPost,
  subEditorDecision,
  editorDecision,
  updateDailyTopNews,
} from "../controllers/organized_post_controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// CRUD Routes
router.post("/", isAuthenticated, createWorkflowPost);
router.get("/", getAllWorkflowPosts);
router.get("/:id", getWorkflowPostById);
router.put("/:id", isAuthenticated, updateWorkflowPost);
router.delete("/:id", isAuthenticated, deleteWorkflowPost);

// Approval routes
router.patch("/:id/sub-editor", isAuthenticated, subEditorDecision);
router.patch("/:id/editor", isAuthenticated, editorDecision);

router.patch("/:postId/daily-top-news", updateDailyTopNews);

export default router;
