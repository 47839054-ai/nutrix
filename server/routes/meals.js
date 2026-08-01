const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  logMeal,
  getMealsByDate,
  getMealHistory,
  deleteMeal,
  getDailySummary,
  getWeeklySummary,
  getMonthlySummary,
} = require("../controllers/mealController");

const router = express.Router();

router.get("/summary/daily", requireAuth, getDailySummary);
router.get("/summary/weekly", requireAuth, getWeeklySummary);
router.get("/summary/monthly", requireAuth, getMonthlySummary);
router.get("/history", requireAuth, getMealHistory);
router.get("/", requireAuth, getMealsByDate);
router.post("/", requireAuth, logMeal);
router.delete("/:id", requireAuth, deleteMeal);

module.exports = router;
