import mongoose from "mongoose";

const approvalSubSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
  notes: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { _id: true });

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails", required: true },
    authorName: { type: String },

    title: { type: String, required: true },
    slug: { type: String, unique: true },
    summary: { type: String },
    content: { type: String, required: true },

    // Media
    featuredImage: { type: String },
    attachments: [{ type: String }],
    video: { type: String },

    // Category & SEO
    category: { type: String, required: true },
    tags: [{ type: String }],
    keywords: [{ type: String }],
    metaDescription: { type: String },

    // Engagement
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: [{ type: String }],

    // Admin Control
    isActive: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    deletedAt: { type: Date },

    // Approval Workflow
    approvals: {
      sub_editor: { type: [approvalSubSchema], default: [] },
      editor: { type: [approvalSubSchema], default: [] },
      admin: { type: [approvalSubSchema], default: [] },
    },


    // Final Publish
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
