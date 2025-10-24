import slugify from "slugify";
import { Post } from "../models/post_model.js";
import { UserDetails } from "../models/userDetails_model.js";
import { deleteFile } from "../services/deleteFileService.js";
import { OrganizedPost } from "../models/organized_post_model.js";

// ========================
// ✅ CREATE POST
// ========================
export const createPost = async (req, res) => {
  try {
    const user = await UserDetails.findOne({ userId: req.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      title,
      summary,
      content,
      category,
      tags,
      keywords,
      metaDescription,
      video,
    } = req.body;

    const featuredImage = req.files?.featuredImage?.[0]?.path || null;
    const attachments = req.files?.attachments?.map((file) => file.path) || [];

    const slug = slugify(title, { lower: true, strict: true });
    const existing = await Post.findOne({ slug });
    if (existing)
      return res.status(400).json({ message: "Title already exists" });

    const post = await Post.create({
      authorId: user._id,
      authorName: user.name,
      title,
      slug,
      summary,
      content,
      category,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      keywords: Array.isArray(keywords) ? keywords : keywords ? [keywords] : [],
      metaDescription,
      featuredImage,
      attachments,
      video,
      approvals: { sub_editor: [], editor: [], admin: [] }, // always initialized
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// ✅ UPDATE POST
// ========================
export const updatePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete old media if replaced
    if (req.files?.featuredImage?.length && post.featuredImage) {
      await deleteFile(post.featuredImage);
    }
    if (req.files?.attachments?.length && post.attachments?.length) {
      for (const file of post.attachments) await deleteFile(file);
    }

    const featuredImage = req.files?.featuredImage?.[0]?.path || post.featuredImage;
    const attachments = req.files?.attachments?.map(f => f.path) || post.attachments;
    const video = req.body.video || post.video;

    const updatedData = {
      ...req.body,
      featuredImage,
      attachments,
      video,
      category: Array.isArray(req.body.category) ? req.body.category[0] : req.body.category,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : post.tags,
      keywords: req.body.keywords ? (Array.isArray(req.body.keywords) ? req.body.keywords : [req.body.keywords]) : post.keywords,
      approvals: post.approvals, // carry over existing approvals
    };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedPost);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ========================
// ✅ GET ALL POSTS
// ========================
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("approvals.sub_editor.id", "name email role")
      .populate("approvals.editor.id", "name email role")
      .populate("approvals.admin.id", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// ✅ GET POSTS BY USER
// ========================
export const getAllPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserDetails.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    let posts = await Post.find({ authorId: user._id }).sort({ createdAt: -1 });

    posts = posts.map((postDoc) => {
      const post = postDoc.toObject();
      let approvals = post.approvals;

      // normalize
      if (!approvals || typeof approvals !== "object" || Array.isArray(approvals)) {
        approvals = { sub_editor: [], editor: [], admin: [] };
      }

      if (typeof approvals === "string") {
        try {
          const parsed = JSON.parse(approvals);
          approvals = parsed && typeof parsed === "object"
            ? {
                sub_editor: Array.isArray(parsed.sub_editor) ? parsed.sub_editor : [],
                editor: Array.isArray(parsed.editor) ? parsed.editor : [],
                admin: Array.isArray(parsed.admin) ? parsed.admin : [],
              }
            : { sub_editor: [], editor: [], admin: [] };
        } catch {
          approvals = { sub_editor: [], editor: [], admin: [] };
        }
      }

      approvals.sub_editor = Array.isArray(approvals.sub_editor) ? approvals.sub_editor : [];
      approvals.editor = Array.isArray(approvals.editor) ? approvals.editor : [];
      approvals.admin = Array.isArray(approvals.admin) ? approvals.admin : [];

      post.approvals = approvals;
      return post;
    });

    // populate user references in approvals safely
    posts = await Post.populate(posts, [
      { path: "approvals.sub_editor.id", select: "name email role" },
      { path: "approvals.editor.id", select: "name email role" },
      { path: "approvals.admin.id", select: "name email role" },
    ]);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================
// ✅ GET POST BY ID
// ========================
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// ✅ DELETE POST
// ========================
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    if (post.featuredImage) await deleteFile(post.featuredImage);
    if (post.attachments?.length) {
      for (const file of post.attachments) await deleteFile(file);
    }
    
    // Delete main post
    await Post.findByIdAndDelete(req.params.id);
    
    // Delete corresponding organized post
    await OrganizedPost.findOneAndDelete({ postId: req.params.id });
    
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// ✅ ROLE-BASED POST APPROVAL
// ========================
export const reviewPostApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const userId = req.id;

    const user = await UserDetails.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // normalize approvals
    if (!post.approvals || typeof post.approvals !== "object" || Array.isArray(post.approvals)) {
      post.approvals = { sub_editor: [], editor: [], admin: [] };
    }

    const roleKey = ["sub_editor", "editor", "admin"].includes(user.role) ? user.role : null;
    if (!roleKey) return res.status(403).json({ message: "Unauthorized role" });

    const approvalEntry = { id: userId, notes: comment || "", status };
    post.approvals[roleKey] = [approvalEntry];

    // auto publish if admin approves
    if (user.role === "admin" && status === "approved") {
      post.isPublished = true;
      post.publishedAt = new Date();
    }

    await post.save();
    res.status(200).json({ message: "Post approval updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
