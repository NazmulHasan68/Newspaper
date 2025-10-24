import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subTitle: { type: String },
    catagory : { type : String},
    link: { type: String }, // external or internal link
    price: { type: Number, required: true, default: 0 },
    image: { type: String }, // path or URL of product image
    isActive: { type: Boolean, default: true }, // active status
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
