import { CategorySponsor } from "../models/Catagory_sponsor.js";
import { deleteFile } from "../services/deleteFileService.js";
import path from "path";

// ✅ Create new Category Sponsor
export const createCategorySponsor = async (req, res) => {
  try {
    const { title, link, video, category, sponsorAddedBy, sponsorDetails, status } = req.body;

    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
    }

    const sponsor = await CategorySponsor.create({
      sponsorAddedBy,
      sponsorDetails,
      category,
      status,
      sponsoredPost: {
        title,
        video,
        link,
        photo: photoPath,
      },
    });

    res.status(201).json({ success: true, data: sponsor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all Category Sponsors
export const getAllCategorySponsors = async (req, res) => {
  try {
    const sponsors = await CategorySponsor.find()
      .populate("sponsorAddedBy", "name email role")
      .populate("sponsorDetails", "companyName website logo")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sponsors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single Category Sponsor by ID
export const getCategorySponsorById = async (req, res) => {
  try {
    const sponsor = await CategorySponsor.findById(req.params.id)
      .populate("sponsorAddedBy", "name email role")
      .populate("sponsorDetails", "companyName website logo");

    if (!sponsor) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }

    res.status(200).json({ success: true, data: sponsor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Category Sponsor
export const updateCategorySponsor = async (req, res) => {
  try {
    const existingSponsor = await CategorySponsor.findById(req.params.id);
    if (!existingSponsor) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }

    let photoPath = existingSponsor.sponsoredPost?.photo;

    // If new file uploaded, delete old and update
    if (req.file) {
      if (photoPath) {
        await deleteFile(path.join(process.cwd(), photoPath));
      }
      photoPath = `/uploads/${req.file.filename}`;
    }

    const updatedData = {
      ...req.body,
      sponsoredPost: {
        ...existingSponsor.sponsoredPost,
        ...req.body,
        photo: photoPath,
      },
    };

    const updated = await CategorySponsor.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Category Sponsor
export const deleteCategorySponsor = async (req, res) => {
  try {
    const sponsor = await CategorySponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }

    if (sponsor.sponsoredPost?.photo) {
      await deleteFile(path.join(process.cwd(), sponsor.sponsoredPost.photo));
    }

    await sponsor.deleteOne();
    res.status(200).json({ success: true, message: "Sponsor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Sponsor Status
export const updateCategorySponsorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sponsor = await CategorySponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }

    sponsor.status = status;
    await sponsor.save();

    res.status(200).json({ success: true, data: sponsor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Sponsors by Category
export const getCategorySponsorsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const sponsors = await CategorySponsor.find({ category })
      .populate("sponsorAddedBy", "name email role")
      .populate("sponsorDetails", "companyName website logo");

    res.status(200).json({ success: true, data: sponsors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Active Sponsors only
export const getActiveCategorySponsors = async (req, res) => {
  try {
    const sponsors = await CategorySponsor.find({ status: "active" })
      .populate("sponsorAddedBy", "name email role")
      .populate("sponsorDetails", "companyName website logo");

    res.status(200).json({ success: true, data: sponsors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
