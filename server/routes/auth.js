const express = require("express");
const requireAuth = require("../middleware/auth");
const { register, login, googleLogin, getProfile, updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

module.exports = router;
