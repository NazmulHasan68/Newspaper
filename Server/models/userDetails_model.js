import mongoose from "mongoose";

// 💰 Payment History
const paymentSendSchema = new mongoose.Schema({
  transactionId: { type: String },
  ref: { type: String },
  accountName: { type: String },
  accountNumber : { type : String},
  amount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

// 🎯 Sponsorship Management
const sponsorSchema = new mongoose.Schema({
  sponsorName: { type: String, required: true },
  sponsorEmail: { type: String },
  sponsorPhone: { type: String },
  startDate: { type: Date, default: Date.now },
  adType: String,
  endDate: { type: Date },
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

});

const userDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👤 Basic Info
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: "" },
    divission : { type: String, default: "" },
    distric : { type: String, default: "" },
    upozilla : { type: String, default: "" },
    whyWeHireYou: { type: String, default: "" }, // motivation
    role: {
      type: String,
      enum: ["reader", "admin", "editor", "sub_editor", "writer"],
      default: "reader",
    },
    experience: { type: String, default: "" },
    skills: [{ type: String }],

    // 📸 Media
    photo: { type: String },
    CV: { type: String },
    socialLinks: {
      facebook: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },

    // 🏦 Payment Info
    paymentAccount: {
      method: { type: String, enum: ["bkash", "nagad", "bank"], default: "bkash" },
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      bankName: { type: String, default: "" },
      bankAddress: { type: String, default: "" },
    },

    // 💰 Payment History
    paymentsSent: [paymentSendSchema],

    // 📤 Payment Request
    requestStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none",
    },

    // ✍️ Post Statistics
    totalPosts: { type: Number, default: 0 },
    approvedPosts: { type: Number, default: 0 },
    pendingPosts: { type: Number, default: 0 },
    rejectedPosts: { type: Number, default: 0 },

    // 💵 Earnings & Balance
    totalEarnings: { type: Number, default: 0 },
    totalReceivedBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    totalEarnedBySponsor: { type: Number, default: 0 },

    // 🎯 Sponsor Management
    sponsors: [sponsorSchema],

    // 🔐 Account Controls
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    devices: [
      {
        deviceId: String,
        ip: String,
        userAgent: String,
        lastLogin: Date,
      },
    ],
  },
  { timestamps: true }
);

export const UserDetails =
  mongoose.models.UserDetails ||
  mongoose.model("UserDetails", userDetailsSchema);
