import { AdsTypeAndPostPrice } from "../models/AdsType.js";
import { Post } from "../models/post_model.js";
import { Sponsor } from "../models/sponsor_model.js";
import { UserDetails } from "../models/userDetails_model.js";
import { UserFinancialDetails } from "../models/UserFinancialDetails_model.js";

// ---------------------------------------------------------------------
// 🔧 Helper: Calculate all financial stats
// ---------------------------------------------------------------------
const calculateFinancialStats = async (userId) => {
  const user = await UserDetails.findOne({ userId });
  if (!user) throw new Error("User not found");

  const posts = await Post.find({ authorId: user._id });
  const sponsors = await Sponsor.find({ sponsorManagedBy: user._id });
  const adsData = await AdsTypeAndPostPrice.findOne();

  const pricePerPost = adsData?.pricePerPost || 0;

  // Post stats
  const postStats = {
    total: posts.length,
    approved: posts.filter((p) => p.status === "approved").length,
    pending: posts.filter((p) => p.status === "pending").length,
    rejected: posts.filter((p) => p.status === "rejected").length,
  };

  // Sponsor stats
  const sponsorStats = {
    total: sponsors.length,
    accepted: sponsors.filter((s) => s.status === "accepted").length,
    pending: sponsors.filter((s) => s.status === "pending").length,
    rejected: sponsors.filter((s) => s.status === "rejected").length,
  };

  // Earnings calculation
  const postEarnings = postStats.approved * pricePerPost;
  const acceptedSponsors = sponsors.filter((s) => s.status === "accepted");

  const sponsorDetailsPerTypeForUser = [];
  const sponsorDetailsPerTypeForAgency = [];

  adsData?.adsTypes?.forEach((ad) => {
    const type = ad.adsType.trim().toLowerCase();
    const typeSponsors = acceptedSponsors.filter(
      (s) => s.position?.trim().toLowerCase() === type
    );
    const acceptedCount = typeSponsors.length;
    const totalDays = typeSponsors.reduce((sum, s) => sum + (s.day || 1), 0);
    const pricePerDay = ad.price;

    sponsorDetailsPerTypeForUser.push({
      type: ad.adsType,
      accepted: acceptedCount,
      totalDays,
      pricePerDay,
      totalEarningsUser: acceptedCount * pricePerDay,
      totalEarningsAgency: acceptedCount * pricePerDay * totalDays,
    });

    sponsorDetailsPerTypeForAgency.push({
      type: ad.adsType,
      accepted: acceptedCount,
      totalDays,
      pricePerDay,
      totalEarningsUser: acceptedCount * pricePerDay,
      totalEarningsAgency: acceptedCount * pricePerDay * totalDays,
    });
  });

  const sponsorEarningsUser = sponsorDetailsPerTypeForUser.reduce(
    (sum, t) => sum + t.totalEarningsUser,
    0
  );
  const sponsorEarningsAgency = sponsorDetailsPerTypeForAgency.reduce(
    (sum, t) => sum + t.totalEarningsAgency,
    0
  );

  const totalEarningsUser = postEarnings + sponsorEarningsUser;
  const totalEarningsAgency = postEarnings + sponsorEarningsAgency;

  return {
    user,
    postStats,
    sponsorStats,
    sponsorDetailsPerTypeForUser,
    sponsorDetailsPerTypeForAgency,
    postEarnings,
    sponsorEarningsUser,
    sponsorEarningsAgency,
    totalEarningsUser,
    totalEarningsAgency,
    pricePerPost,
  };
};

// ---------------------------------------------------------------------
// 🪙 Create or Update User Financial Details
// ---------------------------------------------------------------------
export const createOrUpdateUserFinancialDetails = async (req, res) => {
  const userId = req.id;
  if (!userId) return res.status(403).json({ message: "User ID not found!" });

  try {
    const {
      user,
      postStats,
      sponsorStats,
      sponsorDetailsPerTypeForUser,
      sponsorDetailsPerTypeForAgency,
      postEarnings,
      sponsorEarningsUser,
      sponsorEarningsAgency,
      totalEarningsUser,
      totalEarningsAgency,
      pricePerPost,
    } = await calculateFinancialStats(userId);

    // 🟢 Find existing record to check previous payments
    const existingFinancial = await UserFinancialDetails.findOne({
      userId: user._id,
    });

    // 🟢 Calculate total paid amount from successful paymentRequests
    const totalPaidAmount = existingFinancial
      ? existingFinancial.paymentRequests
          .filter((r) => r.status === "successful")
          .reduce((sum, r) => sum + (r.paidAmount || 0), 0)
      : 0;

    // 🟢 currentBalance = totalEarningsUser - totalPaidAmount
    const currentBalance = totalEarningsUser - totalPaidAmount;

    const financialDetails = await UserFinancialDetails.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        userName: user.name || user.email,
        posts: postStats,
        sponsors: sponsorStats,
        sponsorDetailsPerTypeForUser,
        sponsorDetailsPerTypeForAgency,
        earnings: {
          postEarnings,
          sponsorEarningsUser,
          sponsorEarningsAgency,
          totalEarningsUser,
          totalEarningsAgency,
          currentBalance,
          receivedBalance: totalPaidAmount,
        },
        pricePerPost,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: financialDetails });
  } catch (error) {
    console.error("Financial Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------
// 📊 Get User Financial Details
// ---------------------------------------------------------------------
export const getUserFinancialDetails = async (req, res) => {
  try {
    const user = await UserDetails.findOne({ userId: req.id });
    if (!user) throw new Error("User not found");

    const financialDetails = await UserFinancialDetails.findOne({
      userId: user._id,
    });

    if (!financialDetails)
      return res
        .status(404)
        .json({ success: false, message: "Financial details not found" });

    res.status(200).json({ success: true, data: financialDetails });
  } catch (error) {
    console.error("Financial Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ---------------------------------------------------------------------
// 💰 Request Payment
// ---------------------------------------------------------------------
export const requestPayment = async (req, res) => {
  try {
    const {
      name,
      phone,
      bank,
      bankAccount,
      bankAddress,
      transactionId,
      reference,
      requestedAmount,
    } = req.body;

     const user = await UserDetails.findOne({
      userId: req.id,
    });

    const financialDetails = await UserFinancialDetails.findOne({
      userId: user._id,
    });
    if (!financialDetails)
      return res
        .status(404)
        .json({ success: false, message: "Financial details not found" });

    if (requestedAmount > financialDetails.earnings.currentBalance)
      return res.status(400).json({
        success: false,
        message: "Requested amount exceeds available balance",
      });

    financialDetails.paymentRequests.push({
      name,
      phone,
      bank,
      bankAccount,
      bankAddress,
      transactionId,
      reference,
      requestedAmount,
    });

    financialDetails.earnings.currentBalance -= requestedAmount;
    await financialDetails.save();

    res.status(200).json({ success: true, data: financialDetails });
  } catch (error) {
    console.error("Payment Request Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// ---------------------------------------------------------------------
// 📋 Get All Payment Requests (Admin/Editor)
// ---------------------------------------------------------------------
export const getAllPaymentRequests = async (req, res) => {
  try {
    // Fetch all financial details
    const allFinancials = await UserFinancialDetails.find().populate("userId", "name email role");

    // Flatten requests into an array with user info
    const allRequests = allFinancials.flatMap((financial) =>
      financial.paymentRequests.map((request) => ({
        _id: request._id,
        userId: financial.userId._id,
        userName: financial.userName || financial.userId.name,
        userRole : financial.userRole || financial.userId.role, 
        userEmail: financial.userId.email,
        requestedAmount: request.requestedAmount,
        paidAmount: request.paidAmount || 0,
        transactionId : request.transactionId || "",
        reference : request.reference || "",
        paidBy : request.paidBy || "",
        status: request.status || "pending",
        bank: request.bank,
        bankAccount: request.bankAccount,
        bankAddress: request.bankAddress,
        requestedAt: request.requestedAt,
      }))
    );

    res.status(200).json({ success: true, data: allRequests });
  } catch (error) {
    console.error("Fetch All Payment Requests Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// ---------------------------------------------------------------------
// ✅ Mark Any Payment Request as Paid (Admin/Editor)
// ---------------------------------------------------------------------
export const markAnyPaymentGiven = async (req, res) => {
  try {
    const { requestId, transactionId, reference, paidAmount, status, paidBy } = req.body;

    // Find the financial record containing this request
    const financial = await UserFinancialDetails.findOne({
      "paymentRequests._id": requestId,
    });

    if (!financial)
      return res
        .status(404)
        .json({ success: false, message: "Payment request not found" });

    // Locate the specific payment request
    const request = financial.paymentRequests.id(requestId);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found in financial record" });

    // ✅ Update fields dynamically
    request.transactionId = transactionId || request.transactionId;
    request.reference = reference || request.reference;
    request.paidAmount = paidAmount || request.requestedAmount;
    request.status = status || "successful";
    request.paidBy = paidBy || "Admin";
    request.getpaymentedAt = new Date();

    // ✅ Update total received balance only when successful
    if (request.status === "successful") {
      financial.earnings.receivedBalance += request.paidAmount;
    }

    await financial.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Mark Any Payment Given Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
