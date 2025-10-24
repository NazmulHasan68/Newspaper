import { Partner } from "../models/partner_model.js";
import { deleteFile } from "../services/deleteFileService.js";

// ✅ Create Partner
export const createPartner = async (req, res) => {
  try {
    const { name, author, email, link, description } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : "";

    const partner = await Partner.create({
      name,
      author,
      email,
      link,
      description,
      logo,
    });

    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Partners
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Partner
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Partner
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    // Delete previous logo if new one uploaded
    if (req.file && partner.logo) {
      await deleteFile(partner.logo);
    }

    const updatedData = {
      ...req.body,
      logo: req.file ? `/uploads/${req.file.filename}` : partner.logo,
    };

    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedPartner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Partner
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    if (partner.logo) await deleteFile(partner.logo);

    await Partner.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Toggle Partner Active Status
export const togglePartnerStatus = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    partner.isActive = !partner.isActive;
    await partner.save();

    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
