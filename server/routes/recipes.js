const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  getRecipes,
  createRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const router = express.Router();

router.get("/", requireAuth, getRecipes);
router.post("/", requireAuth, createRecipe);
router.delete("/:id", requireAuth, deleteRecipe);

module.exports = router;
