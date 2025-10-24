import { OrganizedPost } from "../models/organized_post_model.js";
import { Post } from "../models/post_model.js";
import { UserDetails } from "../models/userDetails_model.js";

// ✅ Create Workflow Post
export const createWorkflowPost = async (req, res) => {
  try {
    const { postId, status, comment } = req.body;
    const userId = req.id;

    const user = await UserDetails.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure approvals structure
    post.approvals = post.approvals || { sub_editor: [], editor: [], admin: [] };

    // Add approval based on user role
    switch (user.role) {
      case "sub_editor":
        post.approvals.sub_editor.push({
          id: user._id,
          status,
          notes: comment || "",
          date: new Date(),
        });
        post.isPublished = false;
        break;

      case "editor":
        post.approvals.editor.push({
          id: user._id,
          status,
          notes: comment || "",
          date: new Date(),
        });
        if (status === "approved") {
          post.isPublished = true;
          post.publishedAt = new Date();
        }
        break;

      case "admin":
        post.approvals.admin.push({
          id: user._id,
          status,
          notes: comment || "",
          date: new Date(),
        });
        if (status === "approved") {
          post.isPublished = true;
          post.publishedAt = new Date();
        }
        break;

      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    post.status = status;
    await post.save();

    const workflowPost = await OrganizedPost.create({
      postId: post._id,
      approvals: post.approvals,
      isPublished: post.isPublished,
      publishedAt: post.publishedAt,
    });

    res.status(201).json({ message: "Workflow post created", workflowPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all workflow posts
export const getAllWorkflowPosts = async (req, res) => {
  try {
    const posts = await OrganizedPost.find()
      .populate("postId")
      .populate("approvals.sub_editor.id", "name email phone")
      .populate("approvals.editor.id", "name email phone")
      .populate("approvals.admin.id", "name email phone")
      .populate("sponsorId");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single workflow post
export const getWorkflowPostById = async (req, res) => {
  try {
    const post = await OrganizedPost.findById(req.params.id)
      .populate("postId")
      .populate("approvals.sub_editor.id", "name email phone")
      .populate("approvals.editor.id", "name email phone")
      .populate("approvals.admin.id", "name email phone")
      .populate("sponsorId");

    if (!post) return res.status(404).json({ message: "Workflow post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update workflow post (Admin or Editor)
export const updateWorkflowPost = async (req, res) => {
  try {
    const { status, comment, isPublished } = req.body;
    const userId = req.id;

    // ✅ Find the logged-in user
    const user = await UserDetails.findOne({ userId });
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only admin or editor can update posts" });
    }

    // ✅ Find OrganizedPost document
    const workflowPost = await OrganizedPost.findOne({ _id: req.params.id });
    if (!workflowPost)
      return res.status(404).json({ message: "Workflow post not found" });

    // ✅ Find actual Post document
    const mainPost = await Post.findById(workflowPost.postId._id);
    if (!mainPost)
      return res.status(404).json({ message: "Post not found in Post collection" });

    // ✅ Determine approval role field dynamically
    const approvalRole =
      user.role === "admin"
        ? workflowPost.approvals.admin
        : workflowPost.approvals.editor;

    // ✅ Push approval if status is provided
    if (status) {
      approvalRole.push({
        id: user._id,
        status,
        notes: comment || "",
        date: new Date(),
      });
      workflowPost.status = status; // keep track of review status
    }

    // ✅ Respect explicit isPublished from frontend
    if (typeof isPublished === "boolean") {
      workflowPost.isPublished = isPublished;
      mainPost.isPublished = isPublished;

      if (isPublished && !mainPost.publishedAt) {
        mainPost.publishedAt = new Date();
        workflowPost.publishedAt = workflowPost.publishedAt || new Date();
      }
    }

    // ✅ Save both
    await workflowPost.save();
    await mainPost.save();

    res.status(200).json({
      message: "Workflow post updated successfully",
      data: workflowPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ✅ Delete workflow post
export const deleteWorkflowPost = async (req, res) => {
  try {
    const post = await OrganizedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Workflow post not found" });

    await OrganizedPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Workflow post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Sub-editor decision
export const subEditorDecision = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const post = await OrganizedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Workflow post not found" });

    post.approvals.sub_editor.push({
      id: req.id,
      status,
      notes: notes || "",
      date: new Date(),
    });

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Editor decision
export const editorDecision = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const post = await OrganizedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Workflow post not found" });

    post.approvals.editor.push({
      id: req.id,
      status,
      notes: notes || "",
      date: new Date(),
    });

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




//============================================================================================
export const updateDailyTopNews = async (req, res) => {
  try {
    const { rank, main, entryId, ispopular } = req.body;
    const { postId } = req.params;

    const organizedPost = await OrganizedPost.findById(postId);
    if (!organizedPost) return res.status(404).json({ message: "Organized post not found" });

    let entry;

    if (entryId) {
      // Update existing entry
      entry = organizedPost.dailyTopNews.id(entryId);
      if (!entry) return res.status(404).json({ message: "Daily news entry not found" });
      if (rank !== undefined) entry.rank = rank;
      if (typeof main === "boolean") entry.main = main;
      if (typeof main === "boolean") entry.ispopular = ispopular;
    } else {
      // Create new entry
      entry = {
        postId: organizedPost._id,  // Required field
        rank: rank || 0,
        main: main || false,
        ispopular : ispopular || false
      };
      organizedPost.dailyTopNews.push(entry);
    }

    if (main) {
      // Ensure only one main
      await OrganizedPost.updateMany(
        { "dailyTopNews.main": true, _id: { $ne: organizedPost._id } },
        { $set: { "dailyTopNews.$.main": false } }
      );
    }

    await organizedPost.save();
    res.status(200).json({ message: "Daily top news updated successfully", entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

