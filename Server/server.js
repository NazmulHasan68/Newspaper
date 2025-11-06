import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/Database.js";

import authanticationRoute from './routes/authtication_route.js';
import userDetailsRoutes from './routes/userDetails_routes.js';
import postsRoutes from './routes/post_route.js';
import organizeRoutes from './routes/post_organized_route.js';
import catagorySponsorRoutes from './routes/catagory_sponsor_route.js'
import addTypeRoutes from './routes/ads_route.js'
import sponsorRoutes from './routes/spnsor_route.js'
import partnerRoutes from './routes/partner_routes.js'
import dashboardRoutes from './routes/dashboard_route.js'
import postSponsorRoute from './routes/post_sponor_route.js'
import bannerRoute from './routes/banner_route.js'

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://yourfrontenddomain.com"],
    credentials: true,
  })
);

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "client/dist")));

// API routes
app.use("/api/users", authanticationRoute);
app.use("/api/user-details", userDetailsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/organizes", organizeRoutes);
app.use("/api/catagory-sponsor", catagorySponsorRoutes);
app.use("/api/ads-type", addTypeRoutes);
app.use("/api/sponsor", sponsorRoutes)
app.use("/api/partner", partnerRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/post-sponsor", postSponsorRoute)
app.use("/api/banners", bannerRoute)

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "🌍 Server is running successfully!" });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
