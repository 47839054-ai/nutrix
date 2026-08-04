const express = require("express");
const requireAuth = require("../middleware/auth");
const { register, login, googleLogin, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);
router.patch("/password", requireAuth, changePassword);

module.exports = router;
