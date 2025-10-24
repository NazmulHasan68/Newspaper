import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        // Partner Name
    author : { type : String},
    email : { type : String},
    logo: { type: String },                        // Logo image path or URL
    link: { type: String },                        // Website or redirect link
    description: { type: String },                // Optional description
    isActive: { type: Boolean, default: true },   // Active status
  },
  { timestamps: true }
);

export const Partner =
  mongoose.models.Partner || mongoose.model("Partner", partnerSchema);
