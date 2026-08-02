const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    barcode: { type: String, sparse: true, unique: true, default: null },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "" },
    image: { type: String, default: "" },
    servingSize: { type: Number, default: 100 },
    servingUnit: { type: String, default: "g" },
    nutritionPer100g: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      saturatedFat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
    ingredients: { type: String, default: "" },
    category: {
      type: String,
      enum: ["scanned", "barcode", "custom", "search", "off"],
      default: "custom",
    },
    nutritionalScore: { type: Number, default: 5, min: 0, max: 10 },
    tags: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

foodSchema.index({ name: "text", brand: "text" });

module.exports = mongoose.model("Food", foodSchema);
