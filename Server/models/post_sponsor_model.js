import mongoose from "mongoose";

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

    // 🏢 Sponsor Info
    sponsorName: { type: String, required: true },
    sponsorEmail: { type: String },
    sponsorPhone: { type: String },

    // 💰 Sponsorship Details
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "pending",
    },

    // 📢 Sponsored Post Info (single post)
    postSponsored: {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
      banner: { type: String }, // URL or uploaded image
      video: { type: String },  // Video link
      link: { type: String },   // Optional CTA link
      date: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// ✅ Export model
export const Sponsor =
  mongoose.models.Sponsor || mongoose.model("Sponsor", sponsorSchema);
