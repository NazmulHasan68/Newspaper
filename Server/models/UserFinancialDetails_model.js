import mongoose from "mongoose";

// Schema for sponsor details (per type)
const sponsorDetailSchema = new mongoose.Schema({
  type: { type: String, required: true },          // e.g. "front page", "catagory"
  accepted: { type: Number, default: 0 },          // number of accepted sponsors/posts
  totalDays: { type: Number, default: 0 },         // total sponsored days
  pricePerDay: { type: Number, default: 0 },       // price per day
  totalEarningsUser: { type: Number, default: 0 }, // earnings for this type (user)
  totalEarningsAgency: { type: Number, default: 0 }, // earnings for agency
});

// Schema for earnings breakdown
const earningsSchema = new mongoose.Schema({
  postEarnings: { type: Number, default: 0 },            // user post earnings
  sponsorEarningsUser: { type: Number, default: 0 },     // total sponsor earnings for user
  sponsorEarningsAgency: { type: Number, default: 0 },   // total sponsor earnings for agency
  totalEarningsUser: { type: Number, default: 0 },       // postEarnings + sponsorEarningsUser
  totalEarningsAgency: { type: Number, default: 0 },     // postEarnings + sponsorEarningsAgency
  currentBalance: { type: Number, default: 0 },          // available earnings for user
  receivedBalance: { type: Number, default: 0 },         // withdrawn or transferred money
});

// Schema for payment requests
const paymentRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  bank: { type: String },
  bankAccount: { type: String },
  bankAddress: { type: String },
  transactionId: { type: String },
  reference: { type: String },
  status: {
    type: String,
    enum: ["pending", "refused", "waiting", "successful"],
    default: "pending",
  },
  requestedAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paidBy: { type: String, default: "userDetails" },
  requestedAt: { type: Date, default: Date.now },
  getpaymentedAt: { type: Date, default: Date.now },
});

// Main User Financial Details Schema
const userFinancialDetailsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails", required: true },
    userName: { type: String, required: true },

    // Posts summary
    posts: {
      total: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
    },

    // Sponsors summary
    sponsors: {
      total: { type: Number, default: 0 },
      accepted: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
    },

    // Detailed sponsor breakdown
    sponsorDetailsPerTypeForUser: [sponsorDetailSchema],      // for user income
    sponsorDetailsPerTypeForAgency: [sponsorDetailSchema],    // for agency income

    // Earnings summary
    earnings: earningsSchema,

    // Price per post
    pricePerPost: { type: Number, default: 0 },

    // Payment requests
    paymentRequests: [paymentRequestSchema],
  },
  { timestamps: true }
);

export const UserFinancialDetails = mongoose.model(
  "UserFinancialDetails",
  userFinancialDetailsSchema
);
