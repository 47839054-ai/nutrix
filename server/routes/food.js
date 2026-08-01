const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  searchFoods,
  getFoodByBarcode,
  createFood,
  getFoodById,
  getPopularFoods,
} = require("../controllers/foodController");

const router = express.Router();

router.get("/search", requireAuth, searchFoods);
router.get("/barcode/:barcode", requireAuth, getFoodByBarcode);
router.post("/", requireAuth, createFood);
router.get("/popular", requireAuth, getPopularFoods);
router.get("/:id", requireAuth, getFoodById);

module.exports = router;
