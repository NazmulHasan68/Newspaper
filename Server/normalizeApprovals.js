import mongoose from "mongoose";
import dotenv from "dotenv";
import { Post } from "./models/post_model.js";

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/newsportal");
  console.log("✅ MongoDB connected");

  // Use native MongoDB cursor to avoid Mongoose type casting
  const posts = await Post.collection.find().toArray();

  for (const post of posts) {
    let approvals = post.approvals;

    if (typeof approvals === "string") {
      try {
        approvals = JSON.parse(approvals);
      } catch {
        approvals = { sub_editor: [], editor: [], admin: [] };
      }
    }

    approvals = {
      sub_editor: Array.isArray(approvals?.sub_editor) ? approvals.sub_editor : [],
      editor: Array.isArray(approvals?.editor) ? approvals.editor : [],
      admin: Array.isArray(approvals?.admin) ? approvals.admin : [],
    };

    // Update directly in MongoDB, bypassing schema casting
    await Post.collection.updateOne(
      { _id: post._id },
      { $set: { approvals } }
    );
  }

  console.log("✅ All posts approvals normalized successfully");
  process.exit(0);
})();
