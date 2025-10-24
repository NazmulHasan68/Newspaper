import mongoose from "mongoose";

// 🔹 Category Sponsor Schema
const CategorySponsorSchema = new mongoose.Schema(
  {
    // 👤 Who added the sponsor (Admin or User)
    sponsorAddedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
      required: true,
    },


    // 🔹 Link to Sponsor Info
    sponsorDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponsor",
    },

    // 🔹 Category name
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔹 Status
    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "pending",
    },

    // 🔹 Optional: Single Sponsored Post Info
    sponsoredPost: {
      title: String,
      video: String,
      photo: String,
      link: String,
      date: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// ✅ Export with proper name
export const CategorySponsor =
  mongoose.models.CategorySponsor ||
  mongoose.model("CategorySponsor", CategorySponsorSchema);
