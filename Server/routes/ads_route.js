import express from "express";
import {
  createAdsTypeAndPostPrice,
  getAllAdsTypeAndPostPrice,
  getAdsTypeAndPostPriceById,
  updateAdsTypeAndPostPrice,
  deleteAdsTypeAndPostPrice,
} from "../controllers/ads_type_controlle.js";


const router = express.Router();


//==============================================================================
//              finalcinal details
//==============================================================================

// 🔹 Create a new AdsTypeAndPostPrice
router.post("/", createAdsTypeAndPostPrice);

// 🔹 Get all AdsTypeAndPostPrice entries
router.get("/", getAllAdsTypeAndPostPrice);

// 🔹 Get single AdsTypeAndPostPrice by ID
router.get("/:id", getAdsTypeAndPostPriceById);

// 🔹 Update AdsTypeAndPostPrice by ID
router.put("/:id", updateAdsTypeAndPostPrice);

// 🔹 Delete AdsTypeAndPostPrice by ID
router.delete("/:id", deleteAdsTypeAndPostPrice);




export default router;
