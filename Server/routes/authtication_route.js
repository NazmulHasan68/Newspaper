import express from "express";
import { forgetPassword, getalltheUser, getUserProfile, login, logout, passwordVerifyCode, register, resetPassword, updateProfile, verifyOtp } from "../controllers/authentication_controllers.js";
import isAuthenticated from "../middleware/isAuthenticated.js";


const router = express.Router();

router.route("/get-all-users").get(getalltheUser)

router.route("/register").post(register);
router.route("/verify-otp").post(verifyOtp)
router.route("/login").post(login);
router.route("/logout").get(isAuthenticated,logout);
router.route("/get-profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, updateProfile);
router.route("/forget-password").post(forgetPassword)
router.route("/password-code-verification").post(passwordVerifyCode)
router.route("/reset-password").post(isAuthenticated,resetPassword)



export default router;





