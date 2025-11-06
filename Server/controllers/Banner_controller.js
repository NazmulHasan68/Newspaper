import { BannerHeading } from "../models/Banner_model.js";
import { OrganizedPost } from "../models/organized_post_model.js";
import { UserDetails } from "../models/userDetails_model.js";
import { Post } from "../models/post_model.js";
import { Sponsor } from "../models/sponsor_model.js";
import { Partner } from "../models/partner_model.js";
import { deleteFile } from "../services/deleteFileService.js";

// ✅ Get all banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await BannerHeading.find();
    res.status(200).json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch banners", error });
  }
};

// ✅ Get single banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await BannerHeading.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch banner", error });
  }
};

// ✅ Create a new banner
export const createBanner = async (req, res) => {
  try {
    const { heading } = req.body;
    let bannerPath = req.file ? req.file.path : null;

    const newBanner = new BannerHeading({
      banner: bannerPath,
      heading: heading || [],
    });

    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create banner", error });
  }
};

// ✅ Update banner by ID
export const updateBanner = async (req, res) => {
  try {
    const { heading } = req.body;
    let bannerPath = req.file ? req.file.path : null;

    const existingBanner = await BannerHeading.findById(req.params.id);
    if (!existingBanner) return res.status(404).json({ message: "Banner not found" });

    // Delete old banner if new banner uploaded
    if (bannerPath && existingBanner.banner) {
      deleteFile(existingBanner.banner);
    }

    existingBanner.banner = bannerPath || existingBanner.banner;
    existingBanner.heading = heading || existingBanner.heading;

    await existingBanner.save();
    res.status(200).json(existingBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update banner", error });
  }
};

// ✅ Delete banner by ID
export const deleteBanner = async (req, res) => {
  try {
    const banner = await BannerHeading.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete banner file from server
    if (banner.banner) {
      deleteFile(banner.banner);
    }

    await BannerHeading.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete banner", error });
  }
};



export const Dashboard = async (req, res) => {
  try {
    // 🧠 Fetch all data
    const users = await UserDetails.find();
    const publishedPosts = await OrganizedPost.find();
    const posts = await Post.find();
    const sponsors = await Sponsor.find();
    const partners = await Partner.find()

    // 📊 Prepare summary
    const stats = {
      totalUsers: users.length,
      totalPublishedPosts: publishedPosts.length,
      totalPosts: posts.length,
      totalSponsors: sponsors.length,
      totalpartners : partners.length,
    };

    // ✅ Send full dashboard data
    res.status(200).json({
      message: "Dashboard data fetched successfully",
      stats,
      users,
      publishedPosts,
      posts,
      sponsors,
      partners
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Failed to fetch Dashboard",
      error: error.message,
    });
  }
};
