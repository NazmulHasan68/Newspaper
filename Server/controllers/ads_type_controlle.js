import { AdsTypeAndPostPrice } from "../models/AdsType.js";
import { Post } from "../models/post_model.js";
import { Sponsor } from "../models/sponsor_model.js";
import { UserDetails } from "../models/userDetails_model.js";

// ✅ Create a new AdsTypeAndPostPrice
export const createAdsTypeAndPostPrice = async (req, res) => {
  try {
    const { category, adsTypes, pricePerPost } = req.body;

    // Check if category already exists
    const existing = await AdsTypeAndPostPrice.findOne({ category });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const newAd = await AdsTypeAndPostPrice.create({
      category,
      adsTypes,
      pricePerPost,
    });

    res.status(201).json({ success: true, data: newAd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all AdsTypeAndPostPrice entries
export const getAllAdsTypeAndPostPrice = async (req, res) => {
  try {
    const ads = await AdsTypeAndPostPrice.find();
    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single AdsTypeAndPostPrice by ID
export const getAdsTypeAndPostPriceById = async (req, res) => {
  try {
    const ad = await AdsTypeAndPostPrice.findById(req.params.id);
    if (!ad) {
      return res
        .status(404)
        .json({ success: false, message: "Ad entry not found" });
    }
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update AdsTypeAndPostPrice by ID
export const updateAdsTypeAndPostPrice = async (req, res) => {
  try {
    const { category, adsTypes, pricePerPost } = req.body;

    const updated = await AdsTypeAndPostPrice.findByIdAndUpdate(
      req.params.id,
      { category, adsTypes, pricePerPost },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Ad entry not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete AdsTypeAndPostPrice by ID
export const deleteAdsTypeAndPostPrice = async (req, res) => {
  try {
    const deleted = await AdsTypeAndPostPrice.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Ad entry not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Ad entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




//======================================================================================
//                                      finalshial status 
//======================================================================================



