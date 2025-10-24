import mongoose from "mongoose";
import { categories } from "../config/categories.js";

const approvalSubSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { _id: true }
);

const topNewsEntrySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  rank: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8] },
  isMain: { type: Boolean, default: false },
});


const categoryTopNewsMap = {};
categories.forEach((cat) => {
  categoryTopNewsMap[cat.name] = [topNewsEntrySchema];
});

// Daily Top News Sub-Schema
const dailyTopNewsEntrySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  date: { type: Date, default: Date.now },
  rank: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    required: true,
  },
  main: { type: Boolean, default: false },
  ispopular  : { type: Boolean, default: false },
});


const organizedSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },

    // Approval Workflow (same as Post)
    approvals: {
      sub_editor: { type: [approvalSubSchema], default: [] },
      editor: { type: [approvalSubSchema], default: [] },
      admin: { type: [approvalSubSchema], default: [] },
    },

    // Final Publish
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },

    // Sponsorship
    sponsored: { type: Boolean, default: false },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sponsor" },

    // Category-wise Top News
    categoryTopNews: {
      type: Map,
      of: [topNewsEntrySchema],
      default: categoryTopNewsMap,
    },

    // Daily Top News
    dailyTopNews: { type: [dailyTopNewsEntrySchema], default: [] },

    // Device Tracking
    devices: [
      {
        deviceId: String,
        ip: String,
        userAgent: String,
        createdAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export const OrganizedPost =
  mongoose.models.OrganizedPost ||
  mongoose.model("OrganizedPost", organizedSchema);
