import { Sponsor } from "../models/sponsor_model.js";
import { deleteFile } from "../services/deleteFileService.js"; // if photo needs deletion

// ✅ Create Sponsor
export const createSponsor = async (req, res) => {
  try {
    const { sponsorName, sponsorEmail, sponsorPhone, startDate, endDate, totalAmount, position, status, sponsoredPost } = req.body;

    // Handle optional photo upload
    if (req.files?.photo?.[0]) {
      sponsoredPost.photo = `/uploads/${req.files.photo[0].filename}`;
    }

    const sponsor = await Sponsor.create({
      sponsorName,
      sponsorEmail,
      sponsorPhone,
      startDate,
      endDate,
      totalAmount,
      position,
      status,
      sponsoredPost,
    });

    res.status(201).json(sponsor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Sponsors
export const getAllSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find()
      .populate("sponsorAddedBy", "name email phone role") // populate addedBy with select fields
      .populate("sponsorManagedBy", "name email phone role") // populate managedBy with select fields
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sponsors,
    });

  } catch (error) {
    console.error("❌ Get Sponsors Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sponsors",
    });
  }
};



// ✅ Get Single Sponsor
export const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    res.status(200).json(sponsor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ Update Sponsor Controller
export const updateSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    // ✅ যদি নতুন ছবি আপলোড হয়
    if (req.file) {
      if (sponsor.sponsoredPost?.photo) {
        await deleteFile(sponsor.sponsoredPost.photo);
      }
      sponsor.sponsoredPost.photo = `/uploads/${req.file.filename}`;
    }

    // ✅ বাকী ডেটা আপডেট করো
    sponsor.set(req.body);
    await sponsor.save();

    res.status(200).json(sponsor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// ✅ Delete Sponsor
export const deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    // Delete photo if exists
    if (sponsor.sponsoredPost?.photo) {
      await deleteFile(sponsor.sponsoredPost.photo);
    }

    await Sponsor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Sponsor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
