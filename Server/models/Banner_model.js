import mongoose from "mongoose";

const BannerHeadingSchema = new mongoose.Schema(
  {
    banner: { type: String, required: false },
    heading: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const BannerHeading =
  mongoose.models.BannerHeading ||
  mongoose.model("BannerHeading", BannerHeadingSchema);
