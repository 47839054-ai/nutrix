const mongoose = require("mongoose");

const recipeIngredientSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    servings: { type: Number, default: 1 },
    ingredients: { type: [recipeIngredientSchema], default: [] },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recipeSchema.index({ userId: 1 });

module.exports = mongoose.model("Recipe", recipeSchema);
