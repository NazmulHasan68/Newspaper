
import { Post } from "../models/post_model.js";
import { Sponsor } from "../models/post_sponsor_model.js";
import { deleteFile } from "../services/deleteFileService.js"; // for banner deletion

// ✅ Create Sponsor for a Post
export const createSponsor = async (req, res) => {
  try {
    const { postId, sponsorName, sponsorEmail, sponsorPhone, totalAmount, video, link } = req.body;
    const banner = req.file?.path || null; // single banner upload

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const sponsor = await Sponsor.create({
      sponsorAddedBy: req.id, // userId from auth middleware
      sponsorName,
      sponsorEmail,
      sponsorPhone,
      totalAmount,
      postSponsored: {
        postId,
        banner,
        video,
        link,
      },
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
      .populate("sponsorAddedBy", "name email")
      .populate("sponsorManagedBy", "name email")
      .populate("postSponsored.postId", "title slug");
    res.status(200).json(sponsors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Sponsor
export const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id)
      .populate("sponsorAddedBy", "name email")
      .populate("sponsorManagedBy", "name email")
      .populate("postSponsored.postId", "title slug");

    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    res.status(200).json(sponsor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Sponsor (including banner update)
export const updateSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    // Delete old banner if a new one is uploaded
    if (req.file?.path && sponsor.postSponsored.banner) {
      await deleteFile(sponsor.postSponsored.banner);
    }

    // Update fields
    sponsor.set({
      ...req.body,
      postSponsored: {
        ...sponsor.postSponsored.toObject(),
        banner: req.file?.path || sponsor.postSponsored.banner,
        video: req.body.video || sponsor.postSponsored.video,
        link: req.body.link || sponsor.postSponsored.link,
      },
    });

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

    // Delete banner file if exists
    if (sponsor.postSponsored.banner) await deleteFile(sponsor.postSponsored.banner);

    await Sponsor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Sponsor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
