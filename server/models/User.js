const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, default: "" },
    age: { type: Number, min: 1, max: 120 },
    sex: { type: String, enum: ["male", "female"] },
    height: { type: Number, min: 50, max: 250 },
    weight: { type: Number, min: 20, max: 300 },
    targetWeight: { type: Number, min: 20, max: 300 },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },
    goal: {
      type: String,
      enum: ["lose_weight", "maintain", "gain_muscle"],
      default: "maintain",
    },
    avatar: { type: String, default: "" },
    dailyWaterGoal: { type: Number, default: 2500 },
    testCompleted: { type: Boolean, default: false },
    resetPasswordCode: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  const { passwordHash, __v, ...rest } = this.toObject();
  return rest;
};

module.exports = mongoose.model("User", userSchema);
