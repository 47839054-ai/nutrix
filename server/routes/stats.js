const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  getDashboardStats,
  getWeightHistory,
  addWeightRecord,
  getProgressStats,
} = require("../controllers/statsController");

const router = express.Router();

router.get("/dashboard", requireAuth, getDashboardStats);
router.get("/weight", requireAuth, getWeightHistory);
router.post("/weight", requireAuth, addWeightRecord);
router.get("/progress", requireAuth, getProgressStats);

module.exports = router;
