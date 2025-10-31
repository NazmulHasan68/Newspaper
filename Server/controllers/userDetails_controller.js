import { AdsTypeAndPostPrice } from "../models/AdsType.js";
import { User } from "../models/authentication_model.js";
import { Sponsor } from "../models/sponsor_model.js";
import { UserDetails } from "../models/userDetails_model.js";
import { deleteFile } from "../services/deleteFileService.js";


// 🧍‍♂️ Create User Details (Writer Profile)
export const createUserDetails = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      bio,
      divission,
      distric,
      upozilla,
      role,
      experience,
      whyWeHireYou,
      socialLinks,
    } = req.body;

    let skills = [];
    if (req.body.skills) {
      try {
        skills = JSON.parse(req.body.skills);
      } catch (err) {
        skills = req.body.skills.split(",");
      }
    }

    let parsedSocialLinks = {};
    if (socialLinks) {
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
      } catch {
        parsedSocialLinks = {};
      }
    }

    const photo = req.files?.photo?.[0];
    const cv = req.files?.CV?.[0];

    const newUserDetails = new UserDetails({
      userId: req.id,
      name,
      phone,
      email,
      distric,
      upozilla,
      divission,
      bio,
      role,
      experience,
      whyWeHireYou,
      skills,
      socialLinks: parsedSocialLinks,
      photo: photo ? `/uploads/${photo.filename}` : "",
      CV: cv ? `/uploads/${cv.filename}` : "",
    });

    await newUserDetails.save();

    res.status(201).json({
      success: true,
      message: "User details created successfully",
      data: newUserDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// 📋 Get All Users
export const getAllUserDetails = async (req, res) => {
  try {
    const users = await UserDetails.find()
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔍 Get Single User
export const getUserDetailsById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
 
    const userDetails = await UserDetails.findOne({userId:user._id}).populate("userId");
    if (!userDetails)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: userDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateUserDetails = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      division,
      district,
      upozilla,
      bio,
      experience,
      skills,
      role,
      socialLinks,
      paymentAccount, // 💵 Payment updates
      newSponsor,     // 🎯 Optional: add a new sponsor
    } = req.body;

    const userId = req.params.id;
    console.log("Updating userId:", userId);

    // 1️⃣ Find UserDetails document
    const user = await UserDetails.findOne({ userId });
    if (!user)
      return res.status(404).json({ success: false, message: "UserDetails not found" });

    // 2️⃣ Find main User record
    const userRecord = await User.findById(user.userId);
    if (!userRecord)
      return res.status(404).json({ success: false, message: "User not found" });

    // 3️⃣ Handle file uploads
    const photo = req.files?.photo?.[0];
    const cv = req.files?.CV?.[0];

    if (photo && user.photo) deleteFile(user.photo);
    if (cv && user.CV) deleteFile(user.CV);

    // 4️⃣ Update role if changed (except reader)
    if (role && role !== "reader") {
      userRecord.role = role;
      await userRecord.save();
    }

    // 5️⃣ Prepare AD prices for sponsors
    const results = await AdsTypeAndPostPrice.find();
    const AD_PRICES = results.flatMap(doc =>
      doc.adsTypes.map(item => ({ name: item.adsType, price: item.price }))
    );

    // 6️⃣ Add new sponsor if provided
    if (newSponsor) {
      const adInfo = AD_PRICES.find(a => a.name === newSponsor.adType);
      const adPrice = adInfo ? adInfo.price : 0;

      const sponsorToAdd = {
        sponsorName: newSponsor.sponsorName,
        sponsorEmail: newSponsor.sponsorEmail,
        sponsorPhone: newSponsor.sponsorPhone,
        adType: newSponsor.adType,
        startDate: newSponsor.startDate ? new Date(newSponsor.startDate) : new Date(),
        endDate: newSponsor.endDate ? new Date(newSponsor.endDate) : null,
        totalAmount: adPrice,
        status: "pending",
      };

      if (!user.sponsors) user.sponsors = [];
      user.sponsors.push(sponsorToAdd);
    }

    // 7️⃣ Update profile fields
    user.set({
      name: name ?? user.name,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      bio: bio ?? user.bio,
      role: role ?? user.role,
      division: division ?? user.division,
      district: district ?? user.district,
      upozilla: upozilla ?? user.upozilla,
      experience: experience ?? user.experience,
      skills: skills
        ? Array.isArray(skills)
          ? skills
          : typeof skills === "string"
            ? JSON.parse(skills)
            : skills.split(",").map(s => s.trim())
        : user.skills,
      socialLinks: socialLinks
        ? typeof socialLinks === "string"
          ? JSON.parse(socialLinks)
          : socialLinks
        : user.socialLinks,
      photo: photo ? `/uploads/${photo.filename}` : user.photo,
      CV: cv ? `/uploads/${cv.filename}` : user.CV,
      paymentAccount: paymentAccount
        ? { ...user.paymentAccount, ...paymentAccount }
        : user.paymentAccount,
    });

    // 8️⃣ Save updated document
    await user.save();

    res.status(200).json({
      success: true,
      message: "✅ User updated successfully",
      data: user,
    });

  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};






// ❌ Delete User + Files
export const deleteUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserDetails.findById(id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.photo) deleteFile(user.photo);
    if (user.CV) deleteFile(user.CV);

    await UserDetails.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 💵 Request Payment
export const requestPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserDetails.findById(id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.requestStatus === "requested")
      return res.status(400).json({ success: false, message: "Payment already requested" });

    if (user.currentBalance <= 0)
      return res.status(400).json({ success: false, message: "No balance available" });

    user.requestStatus = "requested";
    await user.save();

    res.status(200).json({ success: true, message: "Payment request submitted", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Approve Payment (Admin)
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, amount } = req.body;
    const user = await UserDetails.findById(id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.requestStatus !== "requested")
      return res.status(400).json({ success: false, message: "No pending request" });

    if (amount > user.currentBalance)
      return res.status(400).json({ success: false, message: "Insufficient balance" });

    const payment = {
      transactionId,
      ref: `PAY-${Date.now()}`,
      accountName: user.paymentAccount?.accountHolderName || user.name,
      amount,
    };

    user.paymentsSent.push(payment);
    user.totalReceivedBalance += amount;
    user.currentBalance -= amount;
    user.requestStatus = "approved";

    await user.save();

    res.status(200).json({ success: true, message: "Payment approved", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Reject Payment (Admin)
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserDetails.findById(id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.requestStatus !== "requested")
      return res.status(400).json({ success: false, message: "No pending request" });

    user.requestStatus = "rejected";
    await user.save();

    res.status(200).json({ success: true, message: "Payment request rejected", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};










//=======================================================================================================================================
//=======================================================================================================================================
export const updateSponsorStatus = async (req, res) => {
  try {
    const { id } = req.params; // userId
    console.log(id);
    
    let { sponsorId, status } = req.body;
    

    if (!sponsorId || !status) {
      return res.status(400).json({ success: false, message: "Sponsor ID and status are required" });
    }

    // ✅ Normalize status: fix typo "accepte" -> "accepted"
    status = status.toLowerCase();
    if (status === "accepte") status = "accepted";

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // ✅ Find user
    const userDetails = await UserDetails.findOne({ userId: id });
    if (!userDetails) return res.status(404).json({ success: false, message: "UserDetails not found" });

    // ✅ Find sponsor in user's sponsors array
    const sponsorIndex = userDetails.sponsors.findIndex((s) => s._id.toString() === sponsorId);
    if (sponsorIndex === -1) return res.status(404).json({ success: false, message: "Sponsor not found" });

    // ✅ Update status
    userDetails.sponsors[sponsorIndex].status = status;
    await userDetails.save();

    const userApproved = await UserDetails.findOne({userId:req.id})
    const userAdsMange = await UserDetails.findOne({userId:id})

    // ✅ If accepted, create a new Sponsor document
    if (status === "accepted") {
      const sponsorData = userDetails.sponsors[sponsorIndex];
      await Sponsor.create({
        sponsorAddedBy: userApproved._id ,   // who approved / added
        sponsorManagedBy: userAdsMange._id,     // =================================the user who owns this sponsor
        sponsorName: sponsorData.sponsorName,
        sponsorEmail: sponsorData.sponsorEmail,
        sponsorPhone: sponsorData.sponsorPhone,
        startDate: sponsorData.startDate,
        endDate: sponsorData.endDate,
        adType: sponsorData.adType,
        position : sponsorData.adType,
        price : sponsorData.totalAmount,
        totalAmount: sponsorData.totalAmount,
        status: "accepted",       // always set valid enum
      });
    }

    res.status(200).json({
      success: true,
      message: `Sponsor status updated to ${status}`,
      data: userDetails.sponsors[sponsorIndex],
    });
  } catch (error) {
    console.error("❌ Sponsor Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const { sponsorId } = req.body;

    if (!sponsorId) {
      return res.status(400).json({ success: false, message: "Sponsor ID is required" });
    }

    const userDetails = await UserDetails.findOne({ userId: id });
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "UserDetails not found" });
    }

    const sponsorExists = userDetails.sponsors.some(
      (s) => s._id.toString() === sponsorId
    );
    if (!sponsorExists) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }

    userDetails.sponsors = userDetails.sponsors.filter(
      (s) => s._id.toString() !== sponsorId
    );

    await userDetails.save();

    res.status(200).json({
      success: true,
      message: "Sponsor deleted successfully",
      data: userDetails.sponsors,
    });
  } catch (error) {
    console.error("❌ Sponsor Delete Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
