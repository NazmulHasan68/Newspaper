import mongoose from "mongoose";

// 🔹 Sponsor Schema
const sponsorSchema = new mongoose.Schema(
  {
    // 👤 Who added the sponsor (Admin or User)
    sponsorAddedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
      required: true,
    },

    // 👤 Who manages this sponsor
    sponsorManagedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
    },

    // 🔹 Basic Info
    sponsorName: { type: String, required: true },
    sponsorEmail: { type: String },
    sponsorPhone: { type: String, required: true },

    // 🔹 Duration & Payment
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    totalAmount: { type: Number, default: 0 },
    day: { type: Number, default: 3 },

    // 🔹 Category & Ad Type
    category: { type: String },
    price: { type: String },
    adsType: { type: String },

    // 🔹 Position of Ad
    position: {
      type: String,
      default: "post",
    },

    // 🔹 Status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    published : {
      type : Boolean,
      default : false
    },

    // 🔹 Sponsored Post Details
    sponsoredPost: {
      title: { type: String },
      subtitle: { type: String },
      video: { type: String },
      photo: { type: String },
      link: { type: String },
      date: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// 🔹 Export
export const Sponsor =
  mongoose.models.Sponsor || mongoose.model("Sponsor", sponsorSchema);
