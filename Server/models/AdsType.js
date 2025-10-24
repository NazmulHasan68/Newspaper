import mongoose from "mongoose";

// 🔹 Ads Type and Post Price Schema
const adsTypeAndPostPriceSchema = new mongoose.Schema(
  {
    adsTypes: [
      {
        adsType: { type: String, required: true }, // e.g. "Video Ad", "Banner Ad"
        price: { type: Number, required: true },   // price for this ad type
      },
    ],
    category: { type: String, required: true, unique: true, default: "category" },

    pricePerPost: { type: Number, required: true }, // Default price per post (if needed)
  },
  { timestamps: true }
);

// 🔹 Export
export const AdsTypeAndPostPrice =
  mongoose.models.AdsTypeAndPostPrice ||
  mongoose.model("AdsTypeAndPostPrice", adsTypeAndPostPriceSchema);
