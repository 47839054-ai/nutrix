const mongoose = require("mongoose");

const mealFoodSchema = new mongoose.Schema(
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

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "snack", "dinner", "water"],
      required: true,
    },
    foods: { type: [mealFoodSchema], default: [] },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

mealSchema.index({ userId: 1, date: 1 });
mealSchema.index({ userId: 1, date: 1, mealType: 1 });

module.exports = mongoose.model("Meal", mealSchema);
